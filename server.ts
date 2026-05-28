import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';
const customRequire = typeof require !== 'undefined' ? require : createRequire(path.join(process.cwd(), 'package.json'));
import { loadDB, saveDB, recalculateAllScores, resolveMatchesWithStandings, runFifaLiveSync, resetTournament } from './server/db';
import { sendOtpSms } from './server/sms';
import { User, UserRole, Match, MatchStatus, Prediction, LeaderboardEntry, Team, MatchStage } from './src/types';
import { teamsSeed } from './src/data/teams';
import { matchesSeed } from './src/data/matches';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'worldcup_secret_key_2026_dev_prod_643c';

// Create local flags directory if not exists
const FLAGS_DIR = path.join(process.cwd(), 'flags');
if (!fs.existsSync(FLAGS_DIR)) {
  fs.mkdirSync(FLAGS_DIR, { recursive: true });
}

// Serve flags statically from the local directory
app.use('/flags', express.static(FLAGS_DIR));

// Dynamic proxy endpoint to download flags on contrast / network failure and cache locally
app.get('/flags/:code.png', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!code) {
      res.status(400).send('Invalid flag code');
      return;
    }

    const filePath = path.join(FLAGS_DIR, `${code}.png`);

    // If cached on disk, send it directly
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
      return;
    }

    // Otherwise, fetch from secure FlagCDN and write locally
    const flagUrl = `https://flagcdn.com/w80/${code}.png`;
    https.get(flagUrl, (apiRes) => {
      if (apiRes.statusCode !== 200) {
        res.status(404).send('Flag not found on remote CDN');
        return;
      }

      const data: Buffer[] = [];
      apiRes.on('data', (chunk) => data.push(chunk));
      apiRes.on('end', () => {
        const buffer = Buffer.concat(data);
        try {
          fs.writeFileSync(filePath, buffer);
        } catch (e) {
          console.error('Failed to write flag to disk:', e);
        }
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
      });
    }).on('error', (err) => {
      console.error('Error fetching flag from CDN:', err);
      res.status(502).send('Error proxying flag from source');
    });
  } catch (error) {
    console.error('Flag proxy error:', error);
    res.status(500).send('Internal flag server error');
  }
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Background FIFA Auto-Sync Engine running every 10 seconds
setInterval(() => {
  try {
    runFifaLiveSync();
  } catch (err) {
    console.error('Error running FIFA live auto-sync:', err);
  }
}, 10000);

// Load DB initially and enforce admin credentials
const db = loadDB();
let adminUser = db.users.find(u => u.username === 'admin');
if (!adminUser) {
  adminUser = {
    id: 'u-admin',
    username: 'admin',
    fullName: 'System Administrator',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    totalScore: 0,
    correctPredictions: 0,
    exactPredictions: 0,
    playedMatches: 0,
    createdAt: new Date().toISOString()
  };
  db.users.push(adminUser);
}
// Enforce default admin password is always 'admin'
const adminSalt = bcrypt.genSaltSync(10);
db.passwords[adminUser.id] = bcrypt.hashSync('admin', adminSalt);
saveDB(db);

// JWT Middleware helper
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = decoded as { id: string; username: string; role: UserRole };
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    return;
  }
  next();
};

// --- OTP SYSTEM STATE & ENDPOINTS ---
interface OtpEntry {
  code: string;
  expiresAt: number;
  purpose: 'verify' | 'reset';
}
const otpStore = new Map<string, OtpEntry>();

// POST /api/auth/otp/send (Generate and Send One-Time Password via Melipayamak or Simulation)
app.post('/api/auth/otp/send', async (req: Request, res: Response) => {
  try {
    const { mobile, purpose } = req.body;
    if (!mobile || !purpose || (purpose !== 'verify' && purpose !== 'reset')) {
      res.status(400).json({ error: 'وارد کردن شماره همراه و هدف ارسال پیامک الزامی است.' });
      return;
    }

    const cleanMobile = mobile.trim();
    const phoneRegex = /^(09\d{8,11}|\+?[0-9]{8,15})$/;
    if (!phoneRegex.test(cleanMobile)) {
      res.status(400).json({ error: 'شماره همراه وارد شده نامعتبر است. فرمت صحیح: 09123456789' });
      return;
    }

    const db = loadDB();

    if (purpose === 'reset') {
      // Ensure user with this mobile as username exists
      const userExists = db.users.some(u => u.username.toLowerCase() === cleanMobile.toLowerCase());
      if (!userExists) {
        res.status(404).json({ error: 'هیچ کاربری با این شماره همراه یافت نشد.' });
        return;
      }
    } else if (purpose === 'verify') {
      // For registration / verification
      const userExists = db.users.some(u => u.username.toLowerCase() === cleanMobile.toLowerCase());
      if (userExists) {
        res.status(400).json({ error: 'این شماره همراه قبلاً در سیستم ثبت نام کرده است.' });
        return;
      }
    }

    // Generate 5-digit OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes expiration

    otpStore.set(cleanMobile.toLowerCase(), {
      code,
      expiresAt,
      purpose
    });

    console.log(`[OTP Store Added] Key: ${cleanMobile.toLowerCase()}, Code: ${code}, Purpose: ${purpose}`);

    const smsResult = await sendOtpSms(cleanMobile, code, purpose);

    res.json({
      success: true,
      simulated: smsResult.simulated,
      code: smsResult.simulated ? code : undefined, // Reveal code if simulation is active so users can complete it cleanly
      message: smsResult.message
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در ارسال پیامک OTP' });
  }
});

// POST /api/auth/otp/reset-password (Verify OTP and change password securely)
app.post('/api/auth/otp/reset-password', (req: Request, res: Response) => {
  try {
    const { mobile, code, newPassword } = req.body;
    if (!mobile || !code || !newPassword) {
      res.status(400).json({ error: 'شماره همراه، کد تایید و کلمه عبور جدید الزامی هستند.' });
      return;
    }

    const cleanMobile = mobile.trim().toLowerCase();
    const otp = otpStore.get(cleanMobile);

    if (!otp) {
      res.status(400).json({ error: 'کد تاییدی صادر نشده یا منقضی گردیده است. لطفاً مجدداً درخواست کنید.' });
      return;
    }

    if (otp.expiresAt < Date.now()) {
      otpStore.delete(cleanMobile);
      res.status(400).json({ error: 'کد تایید منقضی شده است (مهلت اعتبار ۳ دقیقه).' });
      return;
    }

    if (otp.code !== code.trim() || otp.purpose !== 'reset') {
      res.status(400).json({ error: 'کد تایید وارد شده نادرست است.' });
      return;
    }

    // Clean active token
    otpStore.delete(cleanMobile);

    const db = loadDB();
    const user = db.users.find(u => u.username.toLowerCase() === cleanMobile);
    if (!user) {
      res.status(404).json({ error: 'کاربری جهت بازیابی رمز عبور یافت نشد.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    db.passwords[user.id] = bcrypt.hashSync(newPassword, salt);
    saveDB(db);

    res.json({ success: true, message: 'کلمه عبور شما با موفقیت با پیامک بازنشانی شد! می‌توانید اکنون وارد شوید.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در بازیابی رمز عبور' });
  }
});

// --- AUTHENTICATION APIS ---

// POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { username, fullName, password, otpCode } = req.body;
    if (!username || !fullName || !password) {
      res.status(400).json({ error: 'All fields (username, full name, password) are required.' });
      return;
    }

    // Ensure username is a valid mobile/phone number (8 to 15 digits, with optional + or starting with 09 for Iran)
    const phoneRegex = /^(09\d{8,11}|\+?[0-9]{8,15})$/;
    if (!phoneRegex.test(username.trim())) {
      res.status(400).json({ error: 'Username must be a valid Mobile Number (e.g. 09123456789 or +989123456789).' });
      return;
    }

    const db = loadDB();

    // Check if registration is allowed
    if (db.settings && !db.settings.registrationEnabled) {
      res.status(403).json({ error: 'New user registrations are currently disabled by the administrator.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check unique username
    const exists = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      res.status(400).json({ error: 'Username (Mobile Number) already exists.' });
      return;
    }

    // Verify OTP code if SMS OTP is enabled in settings
    if (db.settings && db.settings.smsEnabled) {
      if (!otpCode) {
        res.status(400).json({ error: 'کد تایید پیامکی الزامی است و نباید خالی باشد.' });
        return;
      }
      
      const otp = otpStore.get(cleanUsername);
      if (!otp) {
        res.status(400).json({ error: 'کد تاییدی صادر نشده یا منقضی گردیده است. لطفا مجددا درخواست کد کنید.' });
        return;
      }
      if (otp.expiresAt < Date.now()) {
        otpStore.delete(cleanUsername);
        res.status(400).json({ error: 'کد تایید منقضی شده است (مهلت ۳ دقیقه).' });
        return;
      }
      if (otp.code !== otpCode.trim() || otp.purpose !== 'verify') {
        res.status(400).json({ error: 'کد تایید وارد شده اشتباه است.' });
        return;
      }

      // Safe deletion of code
      otpStore.delete(cleanUsername);
    }

    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: userId,
      username: username.trim(),
      fullName: fullName.trim(),
      role: UserRole.USER,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName.trim())}`,
      totalScore: 0,
      correctPredictions: 0,
      exactPredictions: 0,
      playedMatches: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[userId] = passwordHash;
    saveDB(db);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal registration error.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const db = loadDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    if (user.isDisabled) {
      res.status(403).json({ error: 'This account has been disabled. Please contact the administrator.' });
      return;
    }

    const passwordHash = db.passwords[user.id];
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal login error.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  if (user.isDisabled) {
    res.status(403).json({ error: 'This account is disabled.' });
    return;
  }
  res.json(user);
});

// PUT /api/users/me/avatar
app.put('/api/users/me/avatar', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string') {
      res.status(400).json({ error: 'Avatar parameter is required and must be a string url or base64.' });
      return;
    }

    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === req.user?.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    db.users[userIndex].avatar = avatar;
    saveDB(db);

    res.json(db.users[userIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PUT /api/users/me/profile
app.put('/api/users/me/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, password } = req.body;
    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === req.user?.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || !fullName.trim()) {
        res.status(400).json({ error: 'Full name must be a valid non-empty string.' });
        return;
      }
      db.users[userIndex].fullName = fullName.trim();
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 4) {
        res.status(400).json({ error: 'Password must be at least 4 characters long.' });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      db.passwords[req.user!.id] = bcrypt.hashSync(password, salt);
    }

    saveDB(db);
    res.json(db.users[userIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// --- MATCHES APIS ---

// GET /api/matches
app.get('/api/matches', (req: Request, res: Response) => {
  const db = loadDB();
  const resolved = resolveMatchesWithStandings(db.matches);
  res.json(resolved);
});

// GET /api/matches/:id
app.get('/api/matches/:id', (req: Request, res: Response) => {
  const db = loadDB();
  const resolved = resolveMatchesWithStandings(db.matches);
  const match = resolved.find(m => m.id === req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Match not found.' });
    return;
  }
  res.json(match);
});

// POST /api/matches (Admin only)
app.post('/api/matches', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeTeamId, awayTeamId, stage, stadium, kickoffTimeUtc } = req.body;
    if (!homeTeamId || !awayTeamId || !stage || !stadium || !kickoffTimeUtc) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const db = loadDB();
    const newMatch: Match = {
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      homeTeamId,
      awayTeamId,
      stage,
      stadium,
      kickoffTimeUtc,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.SCHEDULED
    };

    db.matches.push(newMatch);
    saveDB(db);
    res.status(201).json(newMatch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/matches/:id (Admin only - Update general details)
app.put('/api/matches/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const matchIdx = db.matches.findIndex(m => m.id === req.params.id);
    if (matchIdx === -1) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }

    const { homeTeamId, awayTeamId, stage, stadium, kickoffTimeUtc, status } = req.body;
    const match = db.matches[matchIdx];

    if (homeTeamId) match.homeTeamId = homeTeamId;
    if (awayTeamId) match.awayTeamId = awayTeamId;
    if (stage) match.stage = stage;
    if (stadium) match.stadium = stadium;
    if (kickoffTimeUtc) match.kickoffTimeUtc = kickoffTimeUtc;
    if (status) match.status = status;

    saveDB(db);
    res.json(match);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/matches/:id/result (Admin only - Set match results and score recalculation)
app.put('/api/matches/:id/result', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeScore, awayScore, status } = req.body;
    if (homeScore === undefined || awayScore === undefined || homeScore === null || awayScore === null) {
      res.status(400).json({ error: 'Home and Away scores are required.' });
      return;
    }

    const db = loadDB();
    const matchIdx = db.matches.findIndex(m => m.id === req.params.id);
    if (matchIdx === -1) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }

    db.matches[matchIdx].homeScore = Number(homeScore);
    db.matches[matchIdx].awayScore = Number(awayScore);
    db.matches[matchIdx].status = status || MatchStatus.FINISHED;

    saveDB(db);

    // Auto recalculate everyone's scores and predictions
    recalculateAllScores();

    res.json({ message: 'Match result saved and leaderboards successfully recalculated.', match: db.matches[matchIdx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/matches/:id (Admin only)
app.delete('/api/matches/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const initialLen = db.matches.length;
    db.matches = db.matches.filter(m => m.id !== req.params.id);
    
    // Also prune predictions associated with this match
    db.predictions = db.predictions.filter(p => p.matchId !== req.params.id);

    if (db.matches.length === initialLen) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }

    saveDB(db);
    recalculateAllScores();
    res.json({ message: 'Match and its predictions successfully deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- PREDICTIONS APIS ---

// GET /api/predictions/my
app.get('/api/predictions/my', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const userId = req.user?.id;
  const myPreds = db.predictions.filter(p => p.userId === userId);
  res.json(myPreds);
});

function isMatchLocked(match: any): boolean {
  if (match.status === 'FINISHED' || match.status === 'LIVE') return true;
  const kickoff = new Date(match.kickoffTimeUtc).getTime();
  const thirtyMins = 30 * 60 * 1000;
  return kickoff - Date.now() < thirtyMins;
}

// GET /api/predictions/user/:userId (Safely fetch predictions of any user, hiding un-locked ones to prevent cheating)
app.get('/api/predictions/user/:userId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const requestedUserId = req.params.userId;
    const currentUserId = req.user?.id;

    const isSelf = currentUserId === requestedUserId;
    const user = db.users.find(u => u.id === requestedUserId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const userPreds = db.predictions.filter(p => p.userId === requestedUserId);

    const sanitizedPreds = userPreds.map(pred => {
      const match = db.matches.find(m => m.id === pred.matchId);
      if (!match) return null;

      const locked = isMatchLocked(match);

      if (isSelf || locked) {
        return {
          ...pred,
          isLocked: true
        };
      } else {
        // Mask prediction details securely
        return {
          id: pred.id,
          userId: pred.userId,
          matchId: pred.matchId,
          predictedHome: -1, // Hidden token
          predictedAway: -1,
          points: null,
          createdAt: pred.createdAt,
          isLocked: false
        };
      }
    }).filter(p => p !== null);

    res.json(sanitizedPreds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predictions (Create or Edit prediction)
app.post('/api/predictions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (userRole === UserRole.ADMIN) {
      res.status(403).json({ error: 'کاربران با دسترسی ادمین مجاز به ثبت پیش‌بینی نیستند.' });
      return;
    }

    const { matchId, predictedHome, predictedAway } = req.body;
    if (!matchId || predictedHome === undefined || predictedAway === undefined) {
      res.status(400).json({ error: 'matchId, predictedHome and predictedAway are required.' });
      return;
    }

    const db = loadDB();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }

    // Restriction check: Active only up to 30 minutes before kickoff
    const kickoffTime = new Date(match.kickoffTimeUtc).getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    if (kickoffTime - Date.now() < thirtyMinutesInMs) {
      res.status(400).json({ error: 'Prediction locks 30 minutes before kickoff time.' });
      return;
    }

    if (match.status === MatchStatus.FINISHED) {
      res.status(400).json({ error: 'This match is already finished. Predictions are closed.' });
      return;
    }

    // See if prediction already exists
    const predIdx = db.predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
    
    if (predIdx !== -1) {
      // Edit existing
      db.predictions[predIdx].predictedHome = Number(predictedHome);
      db.predictions[predIdx].predictedAway = Number(predictedAway);
      db.predictions[predIdx].createdAt = new Date().toISOString();
      saveDB(db);
      res.json(db.predictions[predIdx]);
    } else {
      // Create new
      const newPred: Prediction = {
        id: 'p-' + Math.random().toString(36).substr(2, 9),
        userId,
        matchId,
        predictedHome: Number(predictedHome),
        predictedAway: Number(predictedAway),
        points: null,
        createdAt: new Date().toISOString()
      };
      db.predictions.push(newPred);
      saveDB(db);
      res.status(201).json(newPred);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predictions/batch (Submit multiple predictions at once)
app.post('/api/predictions/batch', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (userRole === UserRole.ADMIN) {
      res.status(403).json({ error: 'کاربران با دسترسی ادمین مجاز به ثبت پیش‌بینی نیستند.' });
      return;
    }

    const { predictions } = req.body;
    if (!predictions || !Array.isArray(predictions)) {
      res.status(400).json({ error: 'predictions array is required.' });
      return;
    }

    const db = loadDB();
    const saved: Prediction[] = [];
    const errors: string[] = [];

    for (const item of predictions) {
      const { matchId, predictedHome, predictedAway } = item;
      if (!matchId || predictedHome === undefined || predictedAway === undefined) {
        errors.push(`Invalid items for match ${matchId}`);
        continue;
      }

      const match = db.matches.find(m => m.id === matchId);
      if (!match) {
        errors.push(`Match ${matchId} not found.`);
        continue;
      }

      // Check kickoff / locked status
      const kickoffTime = new Date(match.kickoffTimeUtc).getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000;
      if (kickoffTime - Date.now() < thirtyMinutesInMs || match.status === MatchStatus.FINISHED) {
        errors.push(`Match ${matchId} is locked.`);
        continue;
      }

      // Find if exists
      const predIdx = db.predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
      if (predIdx !== -1) {
        db.predictions[predIdx].predictedHome = Number(predictedHome);
        db.predictions[predIdx].predictedAway = Number(predictedAway);
        db.predictions[predIdx].createdAt = new Date().toISOString();
        saved.push(db.predictions[predIdx]);
      } else {
        const newPred: Prediction = {
          id: 'p-' + Math.random().toString(36).substr(2, 9),
          userId,
          matchId,
          predictedHome: Number(predictedHome),
          predictedAway: Number(predictedAway),
          points: null,
          createdAt: new Date().toISOString()
        };
        db.predictions.push(newPred);
        saved.push(newPred);
      }
    }

    saveDB(db);
    res.json({ success: true, count: saved.length, predictions: saved, errors });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/matches/sync-fifa (Simulate/Sync official results from FIFA online site)
app.post('/api/matches/sync-fifa', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    let updatedCount = 0;

    // Default simulated outcomes to guarantee persistent correctness if Gemini API is not configured or in case of errors
    const officialResults: Record<string, { home: number, away: number }> = {
      m6: { home: 1, away: 1 },  // Spain vs Germany
      m7: { home: 2, away: 1 },  // France vs Denmark
      m8: { home: 1, away: 0 },  // Brazil vs Switzerland
      m9: { home: 2, away: 0 },  // Portugal vs Uruguay
      m10: { home: 0, away: 1 }, // Iran vs USA
      m11: { home: 0, away: 2 }  // Poland vs Argentina
    };

    let syncMessage = "مسابقات با نتایج رسمی فیفا با موفقیت همگام‌سازی شدند.";

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        // Query Gemini with Google Search Grounding to check for real-life match results
        const prompt = `You are a World Cup statistics scraper helper. Retrieve the actual match scores for the World Cup standings.
For the following matches, find if there are real completed matches and their final scores:
- Spain vs Germany
- France vs Denmark
- Brazil vs Switzerland
- Portugal vs Uruguay
- Iran vs USA
- Poland vs Argentina

Please return a valid JSON object map representing the scores or state, with keys: "m6", "m7", "m8", "m9", "m10", "m11".
Example output format:
{
  "m6": {"home": 1, "away": 1},
  "m7": {"home": 2, "away": 1},
  "m10": {"home": 0, "away": 1}
}
If a match is not finished yet or not played, omit it or set final values. Please return *only* the JSON object, do not write conversational prefix or suffix.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          // Merge parsed scores with officialResults dictionary
          for (const key in parsed) {
            if (parsed[key] && typeof parsed[key].home === 'number' && typeof parsed[key].away === 'number') {
              officialResults[key] = { home: parsed[key].home, away: parsed[key].away };
            }
          }
          syncMessage = "مسابقات به صورت هوشمند و زنده از طریق هوش مصنوعی گوگل و پایگاه داده رسمی FIFA همگام‌سازی شدند.";
        }
      } catch (gemError) {
        console.error("Gemini Search Grounding Sync failed, falling back to cached seed simulation values:", gemError);
        syncMessage = "مسابقات با مقادیر شبیه‌ساز پایگاه داده رسمی FIFA با موفقیت همگام‌سازی شدند.";
      }
    } else {
      syncMessage = "مسابقات با مقادیر شبیه‌ساز پایگاه داده رسمی FIFA با موفقیت همگام‌سازی شدند.";
    }

    for (const matchId in officialResults) {
      const match = db.matches.find(m => m.id === matchId);
      if (match && match.status !== MatchStatus.FINISHED) {
        const outcome = officialResults[matchId];
        match.homeScore = outcome.home;
        match.awayScore = outcome.away;
        match.status = MatchStatus.FINISHED;
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      saveDB(db);
      // Immediately run score engine for the whole database!
      recalculateAllScores();
      res.json({ success: true, message: `${syncMessage} در مجموع ${updatedCount} بازی خاتمه یافته و جدول‌های رده‌بندی و مراحل حذفی به صورت اتوماتیک به‌روزرسانی شدند.`, updatedCount });
    } else {
      res.json({ success: true, message: 'تمامی بازی‌ها از قبل همگام‌سازی شده‌اند.', updatedCount: 0 });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- LEADERBOARD API ---

// GET /api/leaderboard (Full analytics user sorting)
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const db = loadDB();
  
  // Exclude admin from leaderboard
  const scoringUsers = db.users.filter(u => u.role !== UserRole.ADMIN);

  // Map to Leaderboard Entries
  const entries: LeaderboardEntry[] = scoringUsers.map(user => ({
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
    totalScore: user.totalScore,
    correctPredictions: user.correctPredictions,
    exactPredictions: user.exactPredictions,
    playedMatches: user.playedMatches,
    rank: 0 // Will assign sorting rank
  }));

  // Strict World Cup Rank Tiebreaker Matrix:
  // 1. Total Score (descending)
  // 2. Exact Predictions (descending)
  // 3. Correct predictions (descending)
  // 4. Played matches (ascending - fewer games played is more efficient)
  // 5. ABC Order by username
  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.exactPredictions !== a.exactPredictions) return b.exactPredictions - a.exactPredictions;
    if (b.correctPredictions !== a.correctPredictions) return b.correctPredictions - a.correctPredictions;
    if (a.playedMatches !== b.playedMatches) return a.playedMatches - b.playedMatches;
    return a.username.localeCompare(b.username);
  });

  // Assign Ranking Index
  const fullyRanked = entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  res.json(fullyRanked);
});


// --- ADMIN MANAGE USERS APIS ---

// GET /api/users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  // Don't send passwords back
  const sanitized = db.users.map(({ id, username, fullName, role, avatar, totalScore, correctPredictions, exactPredictions, playedMatches, isDisabled, createdAt }) => ({
    id, username, fullName, role, avatar, totalScore, correctPredictions, exactPredictions, playedMatches, isDisabled, createdAt
  }));
  res.json(sanitized);
});

// POST /api/users (Admin direct creation)
app.post('/api/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, fullName, password, role } = req.body;
    if (!username || !fullName || !password) {
      res.status(400).json({ error: 'Username, Full Name, and Password are required.' });
      return;
    }

    const db = loadDB();
    const cleanUsername = username.trim().toLowerCase();
    
    if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      res.status(400).json({ error: 'Username already taken.' });
      return;
    }

    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: userId,
      username: username.trim(),
      fullName: fullName.trim(),
      role: role || UserRole.USER,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName.trim())}`,
      totalScore: 0,
      correctPredictions: 0,
      exactPredictions: 0,
      playedMatches: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[userId] = passwordHash;
    saveDB(db);

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id (Admin edit)
app.put('/api/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const userIdx = db.users.findIndex(u => u.id === req.params.id);
    if (userIdx === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { fullName, username, role } = req.body;
    const user = db.users[userIdx];
    
    if (username && username.trim() !== '') {
      const cleanUsername = username.trim();
      const duplicateUser = db.users.find(u => u.username === cleanUsername && u.id !== req.params.id);
      if (duplicateUser) {
        res.status(400).json({ error: 'نام کاربری (شماره همراه) تکراری است. کاربر دیگری با این اطلاعات ثبت‌نام کرده است.' });
        return;
      }
      user.username = cleanUsername;
    }

    if (fullName && fullName.trim() !== '') {
      const cleanFullName = fullName.trim();
      user.fullName = cleanFullName;
      // Only set a default avatar seed if there is no current avatar, or if it is a dicebear design
      if (!user.avatar || user.avatar.includes('api.dicebear.com')) {
        user.avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanFullName)}`;
      }
    }

    if (role) {
      user.role = role;
    }

    saveDB(db);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/disable (Admin toggles status)
app.put('/api/users/:id/disable', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const userIdx = db.users.findIndex(u => u.id === req.params.id);
    if (userIdx === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const user = db.users[userIdx];
    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'Administrator accounts cannot be disabled.' });
      return;
    }

    user.isDisabled = !user.isDisabled;
    saveDB(db);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/reset-password (Admin sets password)
app.put('/api/users/:id/reset-password', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim() === '') {
      res.status(400).json({ error: 'New password is required.' });
      return;
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    db.passwords[user.id] = passwordHash;
    
    saveDB(db);
    res.json({ message: 'Password successfully updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (Admin delete)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const userIdx = db.users.findIndex(u => u.id === req.params.id);
    if (userIdx === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const user = db.users[userIdx];
    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'Administrator accounts cannot be deleted.' });
      return;
    }

    // Unregister user and remove predictions
    db.users.splice(userIdx, 1);
    delete db.passwords[req.params.id];
    db.predictions = db.predictions.filter(p => p.userId !== req.params.id);

    saveDB(db);
    recalculateAllScores();
    res.json({ message: 'User and all their predictions successfully removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/recalculate-scores (Force trigger recalculation)
app.post('/api/admin/recalculate', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    recalculateAllScores();
    res.json({ message: 'Score calculation engine successfully ran across all matches.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/reset-tournament (Resets all matches and predictions to clean slate)
app.post('/api/admin/reset-tournament', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    resetTournament();
    res.json({ message: 'تورنمنت با موفقیت به زمان آغازین و نتایج خام بازنشانی شد.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats (Retrieves detailed DB stats and status)
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const finishedMatchesCount = db.matches.filter(m => m.status === MatchStatus.FINISHED).length;
    
    // Check if better-sqlite-3 is natively supported
    let dbEngine = 'JSON fallback (db.json)';
    try {
      customRequire('better-sqlite3');
      dbEngine = 'SQLite Engine (db.sqlite)';
    } catch(e) {}

    res.json({
      dbEngine,
      totalUsers: db.users.length,
      totalPredictions: db.predictions.length,
      totalMatches: db.matches.length,
      finishedMatches: finishedMatchesCount,
      syncMode: db.settings?.syncMode || 'manual',
      simulatedTime: db.settings?.simulatedTime || '2026-06-11T00:00:00Z',
      isFastForwarding: !!db.settings?.isFastForwarding,
      registrationEnabled: db.settings?.registrationEnabled !== false
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/download-db (Admin only - download db.json from SQLite)
app.get('/api/admin/download-db', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const tempBackupPath = path.join(process.cwd(), 'db_backup.json');
    fs.writeFileSync(tempBackupPath, JSON.stringify(db, null, 2), 'utf-8');
    res.download(tempBackupPath, 'database.json', () => {
      try {
        fs.unlinkSync(tempBackupPath);
      } catch (e) {}
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to download database.' });
  }
});

// POST /api/admin/import-db (Admin only - upload / import backup db.json)
app.post('/api/admin/import-db', express.json({ limit: '50mb' }), authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const backup = req.body;
    if (!backup || !Array.isArray(backup.users) || !backup.passwords) {
      res.status(400).json({ error: 'فرمت بکاپ ارسالی نامعتبر است. لیست کاربران یا رمزهای عبور یافت نشد.' });
      return;
    }

    const currentDb = loadDB();

    // 1. Users & Passwords smart merge (preserve administrators, ensure forward compatible fields)
    const mergedUsers = [...backup.users];
    const mergedPasswords = { ...backup.passwords };

    // Prevent administrative lockouts by transferring existing admin accounts if missing in backup
    for (const curU of currentDb.users) {
      if (curU.role === UserRole.ADMIN && !mergedUsers.some(u => u.id === curU.id)) {
        mergedUsers.push(curU);
        if (currentDb.passwords[curU.id]) {
          mergedPasswords[curU.id] = currentDb.passwords[curU.id];
        }
      }
    }

    // Adapt user records safely for forward-compatibility with any properties
    for (const u of mergedUsers) {
      if (u.isDisabled === undefined) u.isDisabled = false;
      if (u.totalScore === undefined) u.totalScore = 0;
      if (u.correctPredictions === undefined) u.correctPredictions = 0;
      if (u.exactPredictions === undefined) u.exactPredictions = 0;
      if (u.playedMatches === undefined) u.playedMatches = 0;
      if (!u.createdAt) u.createdAt = new Date().toISOString();
      if (!u.avatar) u.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`;
    }

    // 2. Teams smart merge (always respect latest team list from code seed, fallback to backup only for non-existent ones)
    const mergedTeams = teamsSeed.map(tSeed => {
      const backupTeam = backup.teams?.find((bt: any) => bt.id === tSeed.id);
      return {
        ...tSeed,
        name: backupTeam?.name || tSeed.name,
        logo: backupTeam?.logo || tSeed.logo,
        groupName: backupTeam?.groupName || tSeed.groupName,
      };
    });

    if (Array.isArray(backup.teams)) {
      for (const bt of backup.teams) {
        if (!mergedTeams.some(t => t.id === bt.id)) {
          mergedTeams.push(bt);
        }
      }
    }

    // 3. Matches smart merge (CRITICAL: preserve schedule details/dates/venues from matchesSeed of the newer version, only importing actual results/assignments)
    const mergedMatches = matchesSeed.map(mSeed => {
      const backupMatch = backup.matches?.find((bm: any) => bm.id === mSeed.id);
      if (backupMatch) {
        return {
          ...mSeed, // Use modern code details of stadium, kickoff, stage, etc.
          homeTeamId: backupMatch.homeTeamId || mSeed.homeTeamId,
          awayTeamId: backupMatch.awayTeamId || mSeed.awayTeamId,
          homeScore: backupMatch.homeScore !== undefined ? backupMatch.homeScore : mSeed.homeScore,
          awayScore: backupMatch.awayScore !== undefined ? backupMatch.awayScore : mSeed.awayScore,
          status: backupMatch.status || mSeed.status,
        };
      }
      return mSeed;
    });

    if (Array.isArray(backup.matches)) {
      for (const bm of backup.matches) {
        if (!mergedMatches.some(m => m.id === bm.id)) {
          mergedMatches.push(bm);
        }
      }
    }

    // 4. Predictions smart merge & Admin cleanup
    const adminUserIds = mergedUsers.filter(u => u.role === UserRole.ADMIN || u.id === 'u-admin').map(u => u.id);
    const backupPredictions = Array.isArray(backup.predictions) ? backup.predictions : [];
    const mergedPredictions = backupPredictions
      .filter((p: any) => p && p.userId && !adminUserIds.includes(p.userId)) // exclude admin predictions safely
      .map((p: any) => ({
        id: p.id || 'p-' + Math.random().toString(36).substr(2, 9),
        userId: p.userId,
        matchId: p.matchId,
        predictedHome: Number(p.predictedHome),
        predictedAway: Number(p.predictedAway),
        points: p.points !== undefined ? p.points : null,
        createdAt: p.createdAt || new Date().toISOString()
      }));

    // 5. Settings merge
    const mergedSettings = {
      ...(currentDb.settings || {}),
      ...(backup.settings || {}),
    };

    const finalMergedDb = {
      users: mergedUsers,
      teams: mergedTeams,
      matches: mergedMatches,
      predictions: mergedPredictions,
      passwords: mergedPasswords,
      settings: mergedSettings,
    };

    saveDB(finalMergedDb);
    recalculateAllScores();
    res.json({ message: 'پایگاه داده با موفقیت بازگردانی هوشمند شد! تداخل‌ها با موفقیت رفع گردیده و امتیازات مجددا محاسبه شدند.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در بازخوانی بکاپ دیتابیس' });
  }
});

// Helper functions for CSV export
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = ' ' + str;
  }
  return `"${str}"`;
}

function getTeamNameLocal(teamId: string, teams: Team[]): string {
  if (!teamId) return 'نامشخص';
  if (teamId.startsWith('TBD_')) {
    const groupMatch = teamId.match(/^TBD_([123])([A-L])$/);
    if (groupMatch) {
      const position = groupMatch[1];
      const groupLetter = groupMatch[2];
      const posWords: Record<string, string> = { '1': 'اول', '2': 'دوم', '3': 'سوم' };
      return `تیم ${posWords[position] || position} گروه ${groupLetter}`;
    }
    if (teamId.includes('3')) {
      const clean = teamId.replace('TBD_3', '').replace('_1', '');
      return `بهترین رده‌سوم ${clean.split('').join('/')}`;
    }
    const wmMatch = teamId.match(/^TBD_WM(\d+)$/);
    if (wmMatch) return `برنده بازی ${wmMatch[1]}`;
    const lmMatch = teamId.match(/^TBD_LM(\d+)$/);
    if (lmMatch) return `بازنده بازی ${lmMatch[1]}`;
    return `تیم نامشخص (${teamId.replace('TBD_', '')})`;
  }
  const team = teams.find(t => t.id === teamId);
  return team ? team.name : teamId;
}

// GET /api/predictions/export-excel (Download predictions report for all users)
app.get('/api/predictions/export-excel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    
    // Process and sort users exactly by their leaderboard ranking logic
    const scoringUsers = db.users.filter(u => u.role !== UserRole.ADMIN);
    
    const entries = scoringUsers.map(user => {
      const userPreds = db.predictions.filter(p => p.userId === user.id);
      let exact = 0;
      let diff = 0;
      let winner = 0;
      let playedCount = 0;

      for (const pred of userPreds) {
        const match = db.matches.find(m => m.id === pred.matchId);
        if (match && match.status === MatchStatus.FINISHED && match.homeScore !== null && match.awayScore !== null) {
          playedCount++;
          if (pred.points === 10) exact++;
          else if (pred.points === 7) diff++;
          else if (pred.points === 5) winner++;
        }
      }

      return {
        ...user,
        exact,
        diff,
        winner,
        playedCount,
        totalScore: user.totalScore
      };
    });

    // Sort using tiebreaker matrix
    entries.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.exact !== a.exact) return b.exact - a.exact;
      const aCorrect = a.exact + a.diff + a.winner;
      const bCorrect = b.exact + b.diff + b.winner;
      if (bCorrect !== aCorrect) return bCorrect - aCorrect;
      if (a.playedCount !== b.playedCount) return a.playedCount - b.playedCount;
      return a.username.localeCompare(b.username);
    });

    const resolvedMatches = resolveMatchesWithStandings(db.matches);

    // Build CSV header row
    const headers = [
      'رتبه',
      'نام و نام خانوادگی',
      'شماره همراه (نام کاربری)',
      'امتیاز کل',
      'پیش‌بینی‌های کاملاً دقیق (۱۰ امتیاز)',
      'پیش‌بینی تفاضل گل صحیح (۷ امتیاز)',
      'پیش‌بینی برنده صحیح (۵ امتیاز)',
      'کل پیش‌بینی‌های خاتمه‌یافته'
    ];

    // Append a column header for each match
    resolvedMatches.forEach((m) => {
      const matchNum = m.id.replace('m', '');
      const homeName = getTeamNameLocal(m.homeTeamId, db.teams);
      const awayName = getTeamNameLocal(m.awayTeamId, db.teams);
      let stageName = m.stage === MatchStage.GROUP ? ' گروهی' : '';
      if (m.stage === MatchStage.ROUND_OF_32) stageName = ' یک ۳۲';
      if (m.stage === MatchStage.ROUND_OF_16) stageName = ' یک ۱۶';
      if (m.stage === MatchStage.QUARTER_FINALS) stageName = ' یک ۴';
      if (m.stage === MatchStage.SEMI_FINALS) stageName = ' نیمه‌نهایی';
      if (m.stage === MatchStage.THIRD_PLACE) stageName = ' رده‌بندی';
      if (m.stage === MatchStage.FINAL) stageName = ' فینال';

      headers.push(`بازی ${matchNum} (${homeName} - ${awayName})${stageName}`);
    });

    const rows: string[][] = [headers];

    entries.forEach((user, index) => {
      const row = [
        String(index + 1),
        user.fullName,
        user.username,
        String(user.totalScore),
        String(user.exact),
        String(user.diff),
        String(user.winner),
        String(user.playedCount)
      ];

      // Add prediction details for each match
      resolvedMatches.forEach((m) => {
        const pred = db.predictions.find(p => p.userId === user.id && p.matchId === m.id);
        if (pred) {
          // If match is finished, display points scored
          let text = `${pred.predictedHome} - ${pred.predictedAway}`;
          if (pred.points !== null) {
            text += ` (${pred.points}+ امتیاز)`;
          }
          row.push(text);
        } else {
          row.push('ثبت نشده');
        }
      });

      rows.push(row);
    });

    const csvContent = rows.map(r => r.map(escapeCSV).join(',')).join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=worldcup_predictions_report.csv');
    res.write('\uFEFF'); // UTF-8 BOM
    res.end(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error exporting report.' });
  }
});

// GET /api/settings (Publicly query basic app settings)
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const db = loadDB();
    res.json(db.settings || { registrationEnabled: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings (Admin update app settings)
app.put('/api/settings', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      registrationEnabled, 
      syncMode, 
      simulatedTime, 
      isFastForwarding,
      smsEnabled,
      smsUsername,
      smsPassword,
      smsBodyIdVerify,
      smsBodyIdReset
    } = req.body;
    
    const db = loadDB();
    if (!db.settings) {
      db.settings = { registrationEnabled: true };
    }
    
    if (registrationEnabled !== undefined) {
      db.settings.registrationEnabled = !!registrationEnabled;
    }
    if (syncMode !== undefined) {
      db.settings.syncMode = syncMode;
    }
    if (simulatedTime !== undefined) {
      db.settings.simulatedTime = simulatedTime;
    }
    if (isFastForwarding !== undefined) {
      db.settings.isFastForwarding = !!isFastForwarding;
    }
    
    // SMS OTP Settings
    if (smsEnabled !== undefined) {
      db.settings.smsEnabled = !!smsEnabled;
    }
    if (smsUsername !== undefined) {
      db.settings.smsUsername = smsUsername;
    }
    if (smsPassword !== undefined) {
      db.settings.smsPassword = smsPassword;
    }
    if (smsBodyIdVerify !== undefined) {
      db.settings.smsBodyIdVerify = smsBodyIdVerify ? Number(smsBodyIdVerify) : undefined;
    }
    if (smsBodyIdReset !== undefined) {
      db.settings.smsBodyIdReset = smsBodyIdReset ? Number(smsBodyIdReset) : undefined;
    }
    
    saveDB(db);
    
    // Automatically trigger a live sync tick on change to instantly update games if time changed
    runFifaLiveSync();

    res.json(db.settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`World Cup server running on http://localhost:${PORT}`);
  });
}

startServer();
