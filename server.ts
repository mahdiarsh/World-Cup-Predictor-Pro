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
import { triggerBackupInDirectory, checkAndTriggerBackup, getFarsiDayName } from './server/backup';
import { User, UserRole, Match, MatchStatus, Prediction, LeaderboardEntry, Team, MatchStage } from './src/types';
import { teamsSeed } from './src/data/teams';
import { matchesSeed } from './src/data/matches';
import { getSquadForTeam } from './src/data/squads';
import { Duplex } from 'stream';
import WebSocket from 'ws';
import tls from 'tls';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'worldcup_secret_key_2026_dev_prod_643c';

// Create local flags directory if not exists, supporting both development and production paths
const getDirname = () => {
  try {
    return __dirname;
  } catch (e) {
    return path.dirname(new URL(import.meta.url).pathname);
  }
};
const dirName = getDirname();

const POSSIBLE_FLAGS_DIRS = [
  path.join(process.cwd(), 'flags'),
  path.join(process.cwd(), 'dist', 'flags'),
  path.join(dirName, 'flags'),
  path.join(dirName, '..', 'flags'),
];

let FLAGS_DIR = POSSIBLE_FLAGS_DIRS[0];
for (const dir of POSSIBLE_FLAGS_DIRS) {
  if (fs.existsSync(dir)) {
    FLAGS_DIR = dir;
    break;
  }
}

if (!fs.existsSync(FLAGS_DIR)) {
  try {
    fs.mkdirSync(FLAGS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create flags dir:', FLAGS_DIR, err);
  }
}

// Serve flags statically from the active local directory
app.use('/flags', express.static(FLAGS_DIR));

// Helper function to fetch from redundant public CDNs sequentially to bypass blocking and network errors
function fetchFlagWithFallback(code: string, urls: string[], index: number, callback: (err: Error | null, buffer?: Buffer, contentType?: string) => void) {
  if (index >= urls.length) {
    callback(new Error('All CDN flag sources failed'));
    return;
  }

  const currentUrl = urls[index];
  console.log(`[FLAG-PROXY] Trying to fetch flag for ${code} from source ${index + 1}: ${currentUrl}`);

  https.get(currentUrl, (apiRes) => {
    if (apiRes.statusCode !== 200) {
      fetchFlagWithFallback(code, urls, index + 1, callback);
      return;
    }

    const data: Buffer[] = [];
    apiRes.on('data', (chunk) => data.push(chunk));
    apiRes.on('end', () => {
      const buffer = Buffer.concat(data);
      const contentType = apiRes.headers['content-type'] || (currentUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
      callback(null, buffer, contentType);
    });
  }).on('error', (err) => {
    console.error(`[FLAG-PROXY] Error fetching from ${currentUrl}:`, err.message);
    fetchFlagWithFallback(code, urls, index + 1, callback);
  });
}

// Dynamic proxy endpoint to download flags on network/firewall failure and cache locally
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

    // List of redundant CDNs to ensure it downloads even in restricted server networks (like Iran)
    const urls = [
      `https://flagcdn.com/w80/${code}.png`,
      `https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/png250px/${code}.png`,
      `https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/${code}.png`,
      `https://cdn.jsdelivr.net/npm/flag-icons/flags/4x3/${code}.svg`,
      `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${code}.svg`
    ];

    fetchFlagWithFallback(code, urls, 0, (err, buffer, contentType) => {
      if (err || !buffer) {
        console.error('[FLAG-PROXY] Absolutely all flag CDNs failed:', err);
        res.status(502).send('Error proxying flag from source');
        return;
      }

      // Save to cache so next requests are served instant static
      try {
        fs.writeFileSync(filePath, buffer);
        console.log(`[FLAG-PROXY] Successfully cached flag for ${code} locally!`);
      } catch (e) {
        console.error('Failed to write flag to disk:', e);
      }

      res.setHeader('Content-Type', contentType || 'image/png');
      res.send(buffer);
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
      res.status(400).json({ error: 'تمامی فیلدها (نام کاربری، نام کامل و رمز عبور) الزامی هستند.' });
      return;
    }

    // Ensure username is a valid mobile/phone number (8 to 15 digits, with optional + or starting with 09 for Iran)
    const phoneRegex = /^(09\d{8,11}|\+?[0-9]{8,15})$/;
    if (!phoneRegex.test(username.trim())) {
      res.status(400).json({ error: 'نام کاربری باید یک شماره همراه معتبر باشد (مثال: 09123456789 یا +989123456789).' });
      return;
    }

    const db = loadDB();

    // Check if registration is allowed
    if (db.settings && !db.settings.registrationEnabled) {
      res.status(403).json({ error: 'ثبت‌نام کاربران جدید در حال حاضر توسط مدیریت غیرفعال شده است.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check unique username
    const exists = db.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      res.status(400).json({ error: 'این شماره همراه قبلاً در سیستم ثبت‌نام شده است.' });
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
    res.status(500).json({ error: error.message || 'خطای داخلی در سیستم ثبت‌نام.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'نام کاربری و کلمه عبور الزامی هستند.' });
      return;
    }

    const db = loadDB();
    const cleanUsername = username.trim().toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      res.status(401).json({ error: 'نام کاربری یا کلمه عبور اشتباه است.' });
      return;
    }

    if (user.isDisabled) {
      res.status(403).json({ error: 'این حساب کاربری غیرفعال شده است. لطفاً با مدیر سیستم تماس بگیرید.' });
      return;
    }

    const passwordHash = db.passwords[user.id];
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      res.status(401).json({ error: 'نام کاربری یا کلمه عبور اشتباه است.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'خطا در ورود به حساب کاربری.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'کاربر یافت نشد.' });
    return;
  }
  if (user.isDisabled) {
    res.status(403).json({ error: 'این حساب کاربری غیرفعال می‌باشد.' });
    return;
  }
  res.json(user);
});

// PUT /api/users/me/avatar
app.put('/api/users/me/avatar', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string') {
      res.status(400).json({ error: 'تصویر آواتار الزامی است و باید قالب رشته‌ای یا آدرس معتبر داشته باشد.' });
      return;
    }

    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === req.user?.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    db.users[userIndex].avatar = avatar;
    saveDB(db);

    res.json(db.users[userIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطای داخلی سرور' });
  }
});

// PUT /api/users/me/profile
app.put('/api/users/me/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, password } = req.body;
    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.id === req.user?.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || !fullName.trim()) {
        res.status(400).json({ error: 'نام کامل باید یک رشته متنی معتبر و غیرخالی باشد.' });
        return;
      }
      db.users[userIndex].fullName = fullName.trim();
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 4) {
        res.status(400).json({ error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      db.passwords[req.user!.id] = bcrypt.hashSync(password, salt);
    }

    saveDB(db);
    res.json(db.users[userIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطای داخلی سرور.' });
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
    res.status(404).json({ error: 'مسابقه یافت نشد.' });
    return;
  }
  res.json(match);
});

// POST /api/matches (Admin only)
app.post('/api/matches', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeTeamId, awayTeamId, stage, stadium, kickoffTimeUtc } = req.body;
    if (!homeTeamId || !awayTeamId || !stage || !stadium || !kickoffTimeUtc) {
      res.status(400).json({ error: 'تمامی فیلدها الزامی هستند.' });
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
      res.status(404).json({ error: 'مسابقه یافت نشد.' });
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
    
    const db = loadDB();
    const matchIdx = db.matches.findIndex(m => m.id === req.params.id);
    if (matchIdx === -1) {
      res.status(404).json({ error: 'مسابقه یافت نشد.' });
      return;
    }

    // Support resetting match score back to scheduled/unplayed
    if (homeScore === null || awayScore === null || status === 'SCHEDULED' || status === 'RESET') {
      db.matches[matchIdx].homeScore = null;
      db.matches[matchIdx].awayScore = null;
      db.matches[matchIdx].status = MatchStatus.SCHEDULED;
      db.matches[matchIdx].isSimulated = false;
      
      saveDB(db);
      recalculateAllScores();
      res.json({ message: 'نتایج مسابقه با موفقیت بازنشانی شد و جدول رده‌بندی به‌روزرسانی گردید.', match: db.matches[matchIdx] });
      return;
    }

    if (homeScore === undefined || awayScore === undefined) {
      res.status(400).json({ error: 'ثبت تعداد گل‌های تیم‌های میزبان و میهمان الزامی است.' });
      return;
    }

    db.matches[matchIdx].homeScore = Number(homeScore);
    db.matches[matchIdx].awayScore = Number(awayScore);
    db.matches[matchIdx].status = status || MatchStatus.FINISHED;
    db.matches[matchIdx].isSimulated = false; // Manually assigned now

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
      res.status(404).json({ error: 'مسابقه یافت نشد.' });
      return;
    }

    saveDB(db);
    recalculateAllScores();
    res.json({ message: 'مسابقه و پیش‌بینی‌های همبسته با موفقیت حذف شدند.' });
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

function getEffectiveServerTime(settings: any): number {
  if (settings?.syncMode === 'simulation' && settings?.simulatedTime) {
    return new Date(settings.simulatedTime).getTime();
  }
  return Date.now();
}

function isMatchLocked(match: any, settings: any): boolean {
  if (match.status === 'FINISHED' || match.status === 'LIVE') return true;
  const kickoff = new Date(match.kickoffTimeUtc).getTime();
  const thirtyMins = 30 * 60 * 1000;
  const effectiveTime = getEffectiveServerTime(settings);
  return kickoff - effectiveTime < thirtyMins;
}

// GET /api/predictions/match/:matchId (Get all predictions for a match, strictly allowed ONLY if match is locked)
app.get('/api/predictions/match/:matchId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const matchId = req.params.matchId;
    const match = db.matches.find(m => m.id === matchId);
    if (!match) {
      res.status(404).json({ error: 'مسابقه یافت نشد.' });
      return;
    }

    const locked = isMatchLocked(match, db.settings);
    if (!locked) {
      res.status(403).json({ error: 'پیش‌بینی‌های این مسابقه تا ۳۰ دقیقه پیش از شروع بازی محرمانه هستند.' });
      return;
    }

    // Get all predictions for this match
    const predsObj = db.predictions.filter(p => p.matchId === matchId);
    
    // Enrich with user names / avatars
    const result = predsObj.map(p => {
      const u = db.users.find(user => user.id === p.userId);
      return {
        id: p.id,
        userId: p.userId,
        matchId: p.matchId,
        predictedHome: p.predictedHome,
        predictedAway: p.predictedAway,
        points: p.points,
        createdAt: p.createdAt,
        fullName: u ? u.fullName : 'کاربر مهمان',
        username: u ? u.username : 'guest',
        avatar: u ? u.avatar : null,
        totalScore: u ? u.totalScore : 0
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/predictions/user/:userId (Safely fetch predictions of any user, hiding un-locked ones to prevent cheating)
app.get('/api/predictions/user/:userId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = loadDB();
    const requestedUserId = req.params.userId;
    const currentUserId = req.user?.id;

    const isSelf = currentUserId === requestedUserId;
    const user = db.users.find(u => u.id === requestedUserId);
    if (!user) {
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    const userPreds = db.predictions.filter(p => p.userId === requestedUserId);

    const sanitizedPreds = userPreds.map(pred => {
      const match = db.matches.find(m => m.id === pred.matchId);
      if (!match) return null;

      const locked = isMatchLocked(match, db.settings);

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
      res.status(401).json({ error: 'احراز هویت غیرمعتبر است. لطفاً وارد سیستم شوید.' });
      return;
    }

    if (userRole === UserRole.ADMIN) {
      res.status(403).json({ error: 'کاربران با دسترسی ادمین مجاز به ثبت پیش‌بینی نیستند.' });
      return;
    }

    const { matchId, predictedHome, predictedAway } = req.body;
    if (!matchId || predictedHome === undefined || predictedAway === undefined) {
      res.status(400).json({ error: 'تعداد گل‌های پیش‌بینی‌شده برای میزبان و میهمان الزامی است.' });
      return;
    }

    const db = loadDB();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) {
      res.status(404).json({ error: 'مسابقه یافت نشد.' });
      return;
    }

    // Restriction check: Active only up to 30 minutes before kickoff
    const kickoffTime = new Date(match.kickoffTimeUtc).getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const effectiveTime = getEffectiveServerTime(db.settings);
    if (kickoffTime - effectiveTime < thirtyMinutesInMs || match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) {
      res.status(400).json({ error: 'امکان ثبت پیش‌بینی فراتر از ۳۰ دقیقه مانده به شروع مسابقه مقدور نیست یا مسابقه هم‌اکنون لایو/به‌پایان رسیده است.' });
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
      res.status(401).json({ error: 'احراز هویت الزامی است. لطفاً مجدداً وارد شوید.' });
      return;
    }

    if (userRole === UserRole.ADMIN) {
      res.status(403).json({ error: 'کاربران با دسترسی ادمین مجاز به ثبت پیش‌بینی نیستند.' });
      return;
    }

    const { predictions } = req.body;
    if (!predictions || !Array.isArray(predictions)) {
      res.status(400).json({ error: 'آرایه پیش‌بینی‌ها الزامی است.' });
      return;
    }

    const db = loadDB();
    const saved: Prediction[] = [];
    const errors: string[] = [];

    for (const item of predictions) {
      const { matchId, predictedHome, predictedAway } = item;
      if (!matchId || predictedHome === undefined || predictedAway === undefined) {
        errors.push(`اطلاعات پیش‌بینی برای بازی ${matchId} نامعتبر است.`);
        continue;
      }

      const match = db.matches.find(m => m.id === matchId);
      if (!match) {
        errors.push(`بازی با شناسه ${matchId} یافت نشد.`);
        continue;
      }

      // Check kickoff / locked status
      const kickoffTime = new Date(match.kickoffTimeUtc).getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000;
      const effectiveTime = getEffectiveServerTime(db.settings);
      if (kickoffTime - effectiveTime < thirtyMinutesInMs || match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) {
        errors.push(`پیش‌بینی بازی ${matchId} قفل شده است.`);
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

    const hasAIConfig = !!(db.settings?.openRouterApiKey || db.settings?.geminiApiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);
    if (hasAIConfig) {
      try {
        // Query OpenRouter to check for real-life match results
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

        const responseText = await callOpenRouterAI(prompt);
        if (responseText) {
          const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          // Merge parsed scores with officialResults dictionary
          for (const key in parsed) {
            if (parsed[key] && typeof parsed[key].home === 'number' && typeof parsed[key].away === 'number') {
              officialResults[key] = { home: parsed[key].home, away: parsed[key].away };
            }
          }
          syncMessage = "مسابقات به صورت هوشمند و زنده از طریق هوش مصنوعی (OpenRouter) و پایگاه داده رسمی FIFA همگام‌سازی شدند.";
        }
      } catch (gemError) {
        console.error("OpenRouter Sync failed, falling back to cached seed simulation values:", gemError);
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
      res.status(400).json({ error: 'وارد کردن نام کاربری، نام کامل و رمز عبور الزامی است.' });
      return;
    }

    const db = loadDB();
    const cleanUsername = username.trim().toLowerCase();
    
    if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      res.status(400).json({ error: 'این نام کاربری (شماره همراه) تکراری است.' });
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
      res.status(404).json({ error: 'کاربر یافت نشد.' });
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
      res.status(404).json({ error: 'کاربر مورد نظر یافت نشد.' });
      return;
    }

    const user = db.users[userIdx];
    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'حساب‌های کاربری مربوط به ادمین یا مدیران سیستم را نمی‌توان غیرفعال کرد.' });
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
      res.status(400).json({ error: 'وارد کردن رمز عبور جدید الزامی است.' });
      return;
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    db.passwords[user.id] = passwordHash;
    
    saveDB(db);
    res.json({ message: 'گذرواژه با موفقیت تغییر یافت.' });
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
      res.status(404).json({ error: 'کاربر یافت نشد.' });
      return;
    }

    const user = db.users[userIdx];
    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'حذف حساب‌های ادمین و مدیر سیستم مقدور نیست.' });
      return;
    }

    // Unregister user and remove predictions
    db.users.splice(userIdx, 1);
    delete db.passwords[req.params.id];
    db.predictions = db.predictions.filter(p => p.userId !== req.params.id);

    saveDB(db);
    recalculateAllScores();
    res.json({ message: 'حساب کاربر و کلیه پیش‌بینی‌های وی با موفقیت از سیستم حذف گردید.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/recalculate-scores (Force trigger recalculation)
app.post('/api/admin/recalculate', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    recalculateAllScores();
    res.json({ message: 'عملگر محاسبه امتیاز کاربری با موفقیت برای کل بازی‌ها اجرا شد.' });
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
    res.status(500).json({ error: err.message || 'خطا در بارگیری و دانلود فایل بکاپ دیتابیس.' });
  }
});

// GET /api/admin/backups (Admin only - list auto/manual premium backup snaps)
app.get('/api/admin/backups', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    const files = fs.readdirSync(backupsDir);
    const backupList = files
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(backupsDir, f);
        const stats = fs.statSync(filePath);
        return {
          filename: f,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json(backupList);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در خواندن لیست بکاپ‌ها.' });
  }
});

// GET /api/admin/backups/:filename/download (Admin only - download a backup snapshot file)
app.get('/api/admin/backups/:filename/download', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filename = req.params.filename;
    // Prevent directory traversal attacks!
    if (filename.includes('/') || filename.includes('\\') || !filename.startsWith('backup_') || !filename.endsWith('.json')) {
      res.status(400).json({ error: 'نام فایل پشتیبان نامعتبر است.' });
      return;
    }
    const backupsDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupsDir, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'فایل پشتیبان زنده یافت نشد.' });
      return;
    }
    res.download(filePath, filename);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در دانلود فایل بکاپ.' });
  }
});

// POST /api/admin/backups/create (Admin only - create manual snapshot instantly)
app.post('/api/admin/backups/create', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filename = triggerBackupInDirectory();
    res.json({ success: true, message: 'بکاپ جدید با موفقیت ایجاد شد.', filename });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در ایجاد بکاپ جدید دیتابیس.' });
  }
});

// POST /api/admin/backups/restore (Admin only - restore state from dynamic snapshot)
app.post('/api/admin/backups/restore', express.json({ limit: '10mb' }), authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      res.status(400).json({ error: 'نام فایل بکاپ الزامی است.' });
      return;
    }
    const backupsDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupsDir, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'فایل بکاپ مورد نظر یافت نشد.' });
      return;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(fileContent);
    
    if (!parsedData || !Array.isArray(parsedData.users) || !parsedData.passwords) {
      res.status(400).json({ error: 'محتویات فایل بکاپ معتبر یا سازگار با ساختار دیتابیس نیست.' });
      return;
    }
    
    saveDB(parsedData);
    recalculateAllScores();
    res.json({ success: true, message: 'بازگردانی اطلاعات دیتابیس با موفقیت انجام شد و جدول امتیازات بازمحاسبه گردید.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در بازگردانی اطلاعات دیتابیس.' });
  }
});

// DELETE /api/admin/backups/:filename (Admin only - remove backup file)
app.delete('/api/admin/backups/:filename', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const backupsDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'فایل بکاپ با موفقیت حذف گردید.' });
    } else {
      res.status(404).json({ error: 'فایل بکاپ یافت نشد.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در حذف فایل بکاپ.' });
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
    res.status(500).json({ error: err.message || 'خطا در خروجی گرفتن از گزارش پیش‌بینی کاربران.' });
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
      simSpeedFactor,
      smsEnabled,
      smsUsername,
      smsPassword,
      smsBodyIdVerify,
      smsBodyIdReset,
      geminiApiKey,
      geminiProxyMode,
      geminiProxyUrl,
      geminiHttpProxy,
      openRouterApiKey,
      openRouterModel,
      proxyType,
      backupEnabled,
      backupFrequency,
      backupDays,
      backupTimesPerDay
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
      db.settings.lastSimulatedSyncRealTime = Date.now();
    }
    if (simulatedTime !== undefined) {
      db.settings.simulatedTime = simulatedTime;
      db.settings.lastSimulatedSyncRealTime = Date.now();
    }
    if (isFastForwarding !== undefined) {
      db.settings.isFastForwarding = !!isFastForwarding;
      db.settings.lastSimulatedSyncRealTime = Date.now();
    }
    if (simSpeedFactor !== undefined) {
      db.settings.simSpeedFactor = Number(simSpeedFactor) || 1;
      db.settings.lastSimulatedSyncRealTime = Date.now();
    }
    
    // Backup Scheduler Settings
    if (backupEnabled !== undefined) {
      db.settings.backupEnabled = !!backupEnabled;
    }
    if (backupFrequency !== undefined) {
      db.settings.backupFrequency = backupFrequency;
    }
    if (backupDays !== undefined) {
      db.settings.backupDays = Array.isArray(backupDays) ? backupDays : [];
    }
    if (backupTimesPerDay !== undefined) {
      db.settings.backupTimesPerDay = Number(backupTimesPerDay) || 1;
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

    // Gemini Settings
    if (geminiApiKey !== undefined) {
      db.settings.geminiApiKey = geminiApiKey;
    }
    if (geminiProxyMode !== undefined) {
      db.settings.geminiProxyMode = geminiProxyMode;
    }
    if (geminiProxyUrl !== undefined) {
      db.settings.geminiProxyUrl = geminiProxyUrl;
    }
    if (geminiHttpProxy !== undefined) {
      db.settings.geminiHttpProxy = geminiHttpProxy;
    }
    
    // OpenRouter and Proxy Protocol Settings
    if (openRouterApiKey !== undefined) {
      db.settings.openRouterApiKey = openRouterApiKey;
    }
    if (openRouterModel !== undefined) {
      db.settings.openRouterModel = openRouterModel;
    }
    if (proxyType !== undefined) {
      db.settings.proxyType = proxyType;
    }
    
    saveDB(db);
    
    // Automatically trigger a live sync tick on change to instantly update games if time changed
    runFifaLiveSync();

    res.json(db.settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// VLESS Tunneling & Proxy System
interface VlessConfig {
  uuid: string;
  serverHost: string;
  serverPort: number;
  type: string;
  path: string;
  hostHeader: string;
  security: string;
  sni: string;
}

export function parseVlessUri(uri: string): VlessConfig | null {
  try {
    if (!uri.startsWith('vless://')) return null;
    let remaining = uri.slice(8);
    
    const atIdx = remaining.indexOf('@');
    if (atIdx === -1) return null;
    const uuid = remaining.slice(0, atIdx);
    remaining = remaining.slice(atIdx + 1);
    
    const qIdx = remaining.indexOf('?');
    let hostPortStr = '';
    let queryStr = '';
    
    const hashIdx = remaining.indexOf('#');
    const hasHash = hashIdx !== -1;
    const actualRemaining = hasHash ? remaining.slice(0, hashIdx) : remaining;
    
    if (qIdx !== -1 && (!hasHash || qIdx < hashIdx)) {
      hostPortStr = actualRemaining.slice(0, qIdx);
      queryStr = actualRemaining.slice(qIdx + 1);
    } else {
      hostPortStr = actualRemaining;
    }
    
    const colonIdx = hostPortStr.lastIndexOf(':');
    let serverHost = hostPortStr;
    let serverPort = 443;
    if (colonIdx !== -1) {
      serverHost = hostPortStr.slice(0, colonIdx);
      serverPort = parseInt(hostPortStr.slice(colonIdx + 1), 10) || 443;
    }
    
    if (serverHost.startsWith('[') && serverHost.endsWith(']')) {
      serverHost = serverHost.slice(1, -1);
    }
    
    const params = new URLSearchParams(queryStr);
    const type = params.get('type') || 'ws';
    let path = params.get('path') || '/';
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const rawHost = params.get('host');
    const hostHeader = (rawHost && rawHost.trim()) ? rawHost.trim() : serverHost;
    const security = params.get('security') || 'tls';
    const rawSni = params.get('sni');
    const sni = (rawSni && rawSni.trim()) ? rawSni.trim() : hostHeader;
    
    return {
      uuid,
      serverHost,
      serverPort,
      type,
      path,
      hostHeader,
      security,
      sni
    };
  } catch (e) {
    console.error('Error parsing VLESS URI:', e);
    return null;
  }
}

export function parseUUIDToBuffer(uuidStr: string): Buffer {
  const hex = uuidStr.replace(/-/g, '');
  if (hex.length !== 32) {
    throw new Error('Invalid UUID length');
  }
  return Buffer.from(hex, 'hex');
}

export function buildVlessHeader(uuid: string, targetHost: string, targetPort: number): Buffer {
  const uuidBuffer = parseUUIDToBuffer(uuid);
  const targetHostBuffer = Buffer.from(targetHost, 'ascii');
  
  return Buffer.concat([
    Buffer.from([0x00]), // vless protocol version
    uuidBuffer,          // 16-byte UUID
    Buffer.from([0x00]), // addons length (0)
    Buffer.from([0x01]), // command: 0x01 (TCP)
    Buffer.from([(targetPort >> 8) & 0xff, targetPort & 0xff]), // port (2 bytes)
    Buffer.from([0x02]), // address type: domain
    Buffer.from([targetHostBuffer.length]), // domain length
    targetHostBuffer // domain ascii bytes
  ]);
}

class VlessWsSocket extends Duplex {
  private ws: WebSocket;
  private firstWrite = true;
  private headerBuffer: Buffer;
  private headerBytesDiscarded = 0;
  private expectedHeaderLen = 2; // Need at least 2 bytes to read the addonLen

  constructor(ws: WebSocket, headerBuffer: Buffer) {
    super();
    this.ws = ws;
    this.headerBuffer = headerBuffer;

    this.ws.on('message', (data: any) => {
      let buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      
      if (this.headerBytesDiscarded < this.expectedHeaderLen) {
        // We still need to discard header bytes from response
        const neededForBaseHeader = 2 - this.headerBytesDiscarded;
        if (neededForBaseHeader > 0) {
          const consumeLen = Math.min(buffer.length, neededForBaseHeader);
          if (this.headerBytesDiscarded === 0 && consumeLen === 2) {
            const addonLen = buffer[1];
            this.expectedHeaderLen = 2 + addonLen;
          } else if (this.headerBytesDiscarded === 1 && consumeLen === 1) {
            const addonLen = buffer[0];
            this.expectedHeaderLen = 2 + addonLen;
          } else if (this.headerBytesDiscarded === 0 && consumeLen === 1 && buffer.length > 1) {
            const addonLen = buffer[1];
            this.expectedHeaderLen = 2 + addonLen;
          }
          this.headerBytesDiscarded += consumeLen;
          buffer = buffer.slice(consumeLen);
        }

        if (buffer.length > 0 && this.headerBytesDiscarded < this.expectedHeaderLen) {
          const neededAddons = this.expectedHeaderLen - this.headerBytesDiscarded;
          const consumeAddons = Math.min(buffer.length, neededAddons);
          this.headerBytesDiscarded += consumeAddons;
          buffer = buffer.slice(consumeAddons);
        }
      }

      if (buffer.length > 0) {
        if (!this.push(buffer)) {
          // Backpressure support
        }
      }
    });

    this.ws.on('close', () => {
      this.push(null);
    });

    this.ws.on('error', (err) => {
      this.destroy(err);
    });
  }

  _read(size: number) {}

  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    let buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as any);

    if (this.firstWrite) {
      this.firstWrite = false;
      buffer = Buffer.concat([this.headerBuffer, buffer]);
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(buffer, { binary: true }, (err) => {
        callback(err);
      });
    } else {
      callback(new Error('VLESS WebSocket is closed'));
    }
  }

  _final(callback: (error?: Error | null) => void) {
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.close();
    }
    callback();
  }

  _destroy(err: Error | null, callback: (error: Error | null) => void) {
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.close();
    }
    callback(err);
  }
}

export function createVlessAgent(vlessUri: string) {
  const config = parseVlessUri(vlessUri);
  if (!config) {
    throw new Error('فرمت لینک VLESS نامعتبر است.');
  }

  const { Agent } = customRequire('undici');

  return new Agent({
    connect(opts: any, callback: any) {
      const targetHost = opts.hostname;
      const targetPort = opts.port || (opts.protocol === 'https:' ? 443 : 80);

      let headerBuffer: Buffer;
      try {
        headerBuffer = buildVlessHeader(config.uuid, targetHost, targetPort);
      } catch (err: any) {
        return callback(err);
      }

      const isSecure = (config.security === 'tls' || config.security === 'xtls' || config.security === 'wss') || (config.security !== 'none' && [443, 9443, 8443, 2053, 2083, 2087, 2096].includes(config.serverPort));
      const protocol = isSecure ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${config.serverHost}:${config.serverPort}${config.path}`;

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      if (config.hostHeader) {
        headers['Host'] = config.hostHeader;
      }

      const wsOptions: any = {
        headers,
        rejectUnauthorized: false,
        perMessageDeflate: false
      };
      if (isSecure && config.sni) {
        wsOptions.servername = config.sni;
      }
      const ws = new WebSocket(wsUrl, wsOptions);

      let isCallbackCalled = false;

      const cleanup = () => {
        ws.removeAllListeners('open');
        ws.removeAllListeners('error');
      };

      ws.on('open', () => {
        cleanup();
        const plainSocket = new VlessWsSocket(ws, headerBuffer);

        if (opts.protocol === 'https:') {
          const tlsSocket = tls.connect({
            socket: plainSocket,
            servername: opts.hostname,
            rejectUnauthorized: false
          });

          tlsSocket.on('error', (err) => {
            if (!isCallbackCalled) {
              isCallbackCalled = true;
              callback(err, null);
            }
          });

          tlsSocket.on('secureConnect', () => {
            if (!isCallbackCalled) {
              isCallbackCalled = true;
              callback(null, tlsSocket);
            }
          });
        } else {
          if (!isCallbackCalled) {
            isCallbackCalled = true;
            callback(null, plainSocket);
          }
        }
      });

      ws.on('error', (err) => {
        cleanup();
        if (!isCallbackCalled) {
          isCallbackCalled = true;
          callback(err, null);
        }
      });
    }
  });
}

// Core universal proxy agent request helper supporting HTTP, SOCKS and MIX
export async function requestWithProxy(url: string, options: any, proxyUrl?: string, proxyType: 'none' | 'http' | 'socks' | 'mix' = 'none') {
  if (!proxyUrl || !proxyUrl.trim() || proxyType === 'none') {
    const response = await fetch(url, options);
    const text = await response.text();
    return {
      status: response.status,
      ok: response.ok,
      text: async () => text,
      json: async () => JSON.parse(text)
    };
  }

  let agent: any = undefined;
  const targetProxy = proxyUrl.trim();

  try {
    const { SocksProxyAgent } = customRequire('socks-proxy-agent');
    const { HttpsProxyAgent } = customRequire('https-proxy-agent');

    if (proxyType === 'socks') {
      let fullProxy = targetProxy;
      if (!fullProxy.startsWith('socks://') && !fullProxy.startsWith('socks5://') && !fullProxy.startsWith('socks4://')) {
        fullProxy = 'socks5://' + fullProxy;
      }
      agent = new SocksProxyAgent(fullProxy);
    } else if (proxyType === 'http') {
      let fullProxy = targetProxy;
      if (!fullProxy.startsWith('http://') && !fullProxy.startsWith('https://')) {
        fullProxy = 'http://' + fullProxy;
      }
      agent = new HttpsProxyAgent(fullProxy);
    } else if (proxyType === 'mix') {
      if (targetProxy.startsWith('socks5://') || targetProxy.startsWith('socks://') || targetProxy.startsWith('socks4://')) {
        agent = new SocksProxyAgent(targetProxy);
      } else if (targetProxy.startsWith('http://') || targetProxy.startsWith('https://')) {
        agent = new HttpsProxyAgent(targetProxy);
      } else {
        try {
          agent = new SocksProxyAgent('socks5://' + targetProxy);
        } catch (e) {
          agent = new HttpsProxyAgent('http://' + targetProxy);
        }
      }
    }
  } catch (err) {
    console.error('[AI-PROXY-AGENT] Failed to initialize agent:', err);
  }

  return new Promise<any>((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions: any = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'Host': parsedUrl.hostname,
      },
      timeout: options.timeout || 15000
    };

    if (agent) {
      reqOptions.agent = agent;
    }

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode || 200,
          ok: (res.statusCode || 200) >= 200 && (res.statusCode || 200) < 300,
          text: async () => data,
          json: async () => {
            try {
              return JSON.parse(data);
            } catch (jsonErr) {
              throw new Error(`Invalid JSON response: ${data.substring(0, 200)}`);
            }
          }
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Fetch helper from OpenRouter supporting custom prompts, model, and routing configurations
export async function callOpenRouterAI(prompt: string, maxTokens: number = 2000): Promise<string> {
  const db = loadDB();
  const apiKey = db.settings?.openRouterApiKey || db.settings?.geminiApiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('کلید وب‌سرویس OpenRouter تعریف نشده است.');
  }

  const model = db.settings?.openRouterModel || 'google/gemini-2.5-flash';
  const proxyUrl = db.settings?.geminiHttpProxy;
  const proxyType = db.settings?.proxyType || 'none';

  console.log(`[OPENROUTER] Invoking model: ${model}, Proxy: ${proxyType} (${proxyUrl || 'None'})`);

  const response = await requestWithProxy(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ai.studio/build',
        'X-Title': 'AI Studio World Cup Build'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: maxTokens
      }),
      timeout: 22000
    },
    proxyUrl,
    proxyType
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error(`[OPENROUTER] API Error: ${response.status} - ${errorDetails}`);
    throw new Error(`خطای وب‌سرویس OpenRouter با کد وضعیت ${response.status}: ${errorDetails}`);
  }

  const resJson = await response.json();
  if (resJson.choices && resJson.choices[0] && resJson.choices[0].message) {
    return resJson.choices[0].message.content || '';
  }

  throw new Error('پاسخ معتبری از OpenRouter دریافت نشد.');
}

// POST /api/admin/gemini-test (Test API connectivity under OpenRouter engine proxy compatibility)
app.post('/api/admin/gemini-test', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { testApiKey, testHttpProxy, testProxyType, testModel } = req.body;
    const db = loadDB();

    const apiKey = testApiKey !== undefined ? testApiKey : (db.settings?.openRouterApiKey || db.settings?.geminiApiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);
    const proxyUrl = testHttpProxy !== undefined ? testHttpProxy : db.settings?.geminiHttpProxy;
    const proxyType = testProxyType !== undefined ? testProxyType : (db.settings?.proxyType || 'none');
    const model = testModel || db.settings?.openRouterModel || 'google/gemini-2.1-flash' || 'google/gemini-2.5-flash';

    if (!apiKey) {
      res.status(400).json({ error: 'کلید وب‌سرویس هوش مصنوعی (OpenRouter API Key) وارد نشده است.' });
      return;
    }

    console.log(`[OPENROUTER-TEST] Verifying API handshake with ${model}. Proxy: ${proxyType} (${proxyUrl || 'None'})`);

    const response = await requestWithProxy(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ai.studio/build',
          'X-Title': 'AI Studio Test Connection'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: 'فقط پاسخ کوتاه بده: OK' }
          ],
          temperature: 0.1,
          max_tokens: 150
        }),
        timeout: 15000
      },
      proxyUrl,
      proxyType
    );

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: `خطای وب‌سرویس OpenRouter (${response.status}): ${errText}` });
      return;
    }

    const resJson = await response.json();
    let outputText = '';
    if (resJson.choices && resJson.choices[0] && resJson.choices[0].message) {
      outputText = resJson.choices[0].message.content || '';
    }

    res.json({
      success: true,
      message: 'اتصال آزمایشی با هوش مصنوعی (OpenRouter) با موفقیت برقرار شد!',
      responseSample: outputText
    });
  } catch (err: any) {
    console.error('[OPENROUTER-TEST] Connection error detail:', err);
    res.status(500).json({ 
      error: `خطا در پیوند به OpenRouter: ${err.message}. لطفا کلید وب‌سرویس یا جزییات پروکسی خود را بررسی نمایید.` 
    });
  }
});

// POST /api/admin/proxy-test (Admin only - test direct HTTP or VLESS proxy connection to see if it works)
app.post('/api/admin/proxy-test', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { testHttpProxy } = req.body;
    const db = loadDB();
    const httpProxy = testHttpProxy !== undefined ? testHttpProxy : db.settings?.geminiHttpProxy;

    if (!httpProxy || !httpProxy.trim()) {
      res.status(400).json({ error: 'آدرس واقع پروکسی جهت تست وارد نشده است.' });
      return;
    }

    try {
      let dispatcher: any;
      if (httpProxy.trim().startsWith('vless://')) {
        dispatcher = createVlessAgent(httpProxy.trim());
        console.log(`[AI-PROXY-TEST] Testing VLESS connectivity`);
      } else {
        const { ProxyAgent } = customRequire('undici');
        dispatcher = new ProxyAgent({ uri: httpProxy.trim() });
        console.log(`[AI-PROXY-TEST] Testing HTTP proxy connectivity: ${httpProxy.trim()}`);
      }
      
      const startTime = Date.now();
      // Test by hitting standard API domain
      const testRes = await fetch('https://generativelanguage.googleapis.com', {
        method: 'GET',
        dispatcher,
        signal: AbortSignal.timeout(7000) // 7-second timeout for proxy connection test
      } as any);

      const duration = Date.now() - startTime;
      const status = testRes.status;
      const proxyTypeLabel = httpProxy.trim().startsWith('vless://') ? 'VLESS' : 'HTTP';
      
      res.json({
        success: true,
        message: `اتصال پروکسی ${proxyTypeLabel} با موفقیت برقرار شد! پاسخ دریافتی در ${duration} میلی‌ثانیه با کد وضعیت ${status} برقرار گردید (نشانه دسترسی موفق به دامنه خدمات کلاود گوگل).`,
        status
      });
    } catch (e: any) {
      console.error('[AI-PROXY-TEST] Proxy connection failed:', e);
      const proxyTypeLabel = httpProxy.trim().startsWith('vless://') ? 'VLESS' : 'HTTP/Socks';
      res.status(500).json({
        error: `خطا در برقراری ارتباط مستقل از طریق دامنه و پروتکل ${proxyTypeLabel}: ${e.message || e} (لطفاً از صحت لینک VLESS، وضعیت پورت یا نام سرور خود اطمینان حاصل کنید).`
      });
    }
  } catch (err: any) {
    console.error('[AI-PROXY-TEST] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/admin/sms-test (Admin only - test sms gate configuration)
app.post('/api/admin/sms-test', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { testMobile, smsUsername, smsPassword, smsBodyIdVerify } = req.body;
    if (!testMobile) {
      res.status(400).json({ error: 'شماره همراه گیرنده تست الزامی است.' });
      return;
    }

    const db = loadDB();
    const activeUsername = smsUsername || db.settings?.smsUsername;
    const activePassword = smsPassword || db.settings?.smsPassword;
    const activeBodyId = smsBodyIdVerify || db.settings?.smsBodyIdVerify;

    if (!activeUsername || !activePassword || !activeBodyId) {
      res.status(400).json({ error: 'نام کاربری، کلمه عبور و شناسه الگوی تایید ملی‌پیامک جهت ارسال تست بازبینی نشده است.' });
      return;
    }

    // Generate test code
    const testCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit simple test code

    const payload = {
      username: activeUsername,
      password: activePassword,
      text: String(testCode),
      to: testMobile.trim(),
      bodyId: Number(activeBodyId)
    };

    console.log(`[SMS-TEST] Sending test SMS to ${testMobile} with template ${activeBodyId}...`);

    const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`خطای پاسخ دهی وب سرویس ملی پیامک: وضعیت ${response.status}`);
    }

    const data = await response.json();
    const returnVal = data.Value || data.RetVal || data;
    const parsedRet = Number(returnVal);

    if (!isNaN(parsedRet) && parsedRet < 0) {
      throw new Error(`خطای ملی پیامک (کد خطای سامانه): ${parsedRet}`);
    }

    res.json({
      success: true,
      code: testCode,
      message: `پیامک تستی حاوی کد ${testCode} با موفقیت توسط ملی‌پیامک به شماره همراه ${testMobile} ارسال شد!`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطا در برقراری ارتباط با درگاه ملی‌پیامک' });
  }
});


// --- SQUAD AI CACHING & FETCHING ENDPOINTS ---
const SQUADS_CACHE_FILE = path.join(process.cwd(), 'squads_cache.json');

function loadSquadsCache(): Record<string, any> {
  try {
    if (fs.existsSync(SQUADS_CACHE_FILE)) {
      const data = fs.readFileSync(SQUADS_CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading squads_cache.json:', err);
  }
  return {};
}

function saveSquadsCache(cache: Record<string, any>) {
  try {
    fs.writeFileSync(SQUADS_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving squads_cache.json:', err);
  }
}

// GET /api/teams/:id/squad - Get team squad (checks cache first, then defaults to presets/generator)
app.get('/api/teams/:id/squad', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = teamsSeed.find(t => t.id === id);
    if (!team) {
      res.status(404).json({ error: 'تیم یافت نشد.' });
      return;
    }

    const cache = loadSquadsCache();
    if (cache[id]) {
      res.json(cache[id]);
      return;
    }

    // Default fallback to deterministic preset generator
    const squad = getSquadForTeam(id, team.name);
    res.json(squad);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/:id/squad/sync-ai - Sync specific team roster live using OpenRouter AI
app.post('/api/teams/:id/squad/sync-ai', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const team = teamsSeed.find(t => t.id === id);
    if (!team) {
      res.status(404).json({ error: 'تیم یافت نشد.' });
      return;
    }

    const db = loadDB();
    const hasAIConfig = !!(db.settings?.openRouterApiKey || db.settings?.geminiApiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);
    if (!hasAIConfig) {
      res.status(400).json({ error: 'کلید وب‌سرویس هوش مصنوعی (OpenRouter API Key) در سرور پیکربندی نشده است. لطفاً ابتدا در بخش تنظیمات پنل مدیریت کلید معتبر خود را تعریف نهایی کنید.' });
      return;
    }

    const prompt = `You are a professional sports editor. Fetch/retrieve the actual, official real-world soccer squad, head coach, and player ratings (FIFA/FC25/real-life) for the National Football Team: "${team.name}" (${team.shortCode}).
Find the REAL current manager/coach (in Persian, e.g., "امیر قلعه‌نویی", "روبرتو مارتینز", "لوئیس دلا فوئنته" etc.).
Gather the FULL squad consisting of EXACTLY between 23 and 26 REAL players representing the actual national team (e.g. for Portugal, get Ronaldo, Bruno Fernandes, Leao, Dias, Bernardo, Diogo Costa etc., and for Cape Verde, get their real team like Jovane Cabral, Bebe, Logan Costa, Ryan Mendes, Garry Rodrigues, translated to Persian). Do NOT make up names.
Out of the 23 to 26 players, you must mark EXACTLY 11 starting players as "isStarting": true.
These 11 starting players must form a standard balanced 4-3-3 formation:
- Exactly 1 "GK" (Goalkeeper) with "isStarting": true.
- Exactly 4 "DF" (Defenders) with "isStarting": true.
- Exactly 3 "MF" (Midfielders) with "isStarting": true.
- Exactly 3 "FW" (Forwards) with "isStarting": true.
All other remaining 12 to 15 players must be marked as "isStarting": false (reserves).
For each player, retrieve:
- "name": Real name in Persian (e.g. "کریستیانو رونالدو", "رایان مندس")
- "number": Real lineup shirt number (unique between 1 and 99)
- "position": One of 'GK', 'DF', 'MF', 'FW'
- "isStarting": boolean (exactly 11 starting players, exactly 12 to 15 reserves)
- "club": Their current professional club in Persian (e.g. "النصر", "رئال مادرید" or local league/foreign leagues)
- "age": Real current age
- "rating": Valid realistic overall rating (70-98)

Return ONLY a raw JSON string matching this exact structure:
{
  "formation": "4-3-3",
  "coach": "سرمربی به فارسی",
  "strikersCount": 3,
  "midfieldersCount": 3,
  "defendersCount": 4,
  "stats": { "attack": 85, "midfield": 84, "defense": 82, "overall": 84 },
  "players": [
    { "name": "...", "number": 1, "position": "GK", "isStarting": true, "club": "...", "age": 28, "rating": 85 },
    ...
  ]
}
Do not write markdown blocks (like \`\`\`json) or conversational explanations. Just return the JSON starting with { and ending with }.`;

    console.log(`[AI-SQUAD] Requesting AI updated squad using OpenRouter for ${team.name} (${id})...`);
    const rawText = await callOpenRouterAI(prompt);
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedSquad = JSON.parse(cleanJson);

    // Recompute attack/midfield/defense/overall stats dynamically on server to ensure accuracy
    let baseRatingSum = 0;
    let gkCount = 0, dfCount = 0, mfCount = 0, fwCount = 0;
    let dfRating = 0, mfRating = 0, fwRating = 0;

    parsedSquad.players.forEach((p: any) => {
      const pRating = Number(p.rating) || 75;
      baseRatingSum += pRating;
      
      if (!p.isStarting) {
        p.gridPos = { x: 0, y: 0 };
        return;
      }
      
      if (p.position === 'GK') {
        gkCount++;
        p.gridPos = { x: 50, y: 12 };
      } else if (p.position === 'DF') {
        dfCount++;
        dfRating += pRating;
        if (dfCount === 1) p.gridPos = { x: 18, y: 32 };
        else if (dfCount === 2) p.gridPos = { x: 38, y: 28 };
        else if (dfCount === 3) p.gridPos = { x: 62, y: 28 };
        else p.gridPos = { x: 82, y: 32 };
      } else if (p.position === 'MF') {
        mfCount++;
        mfRating += pRating;
        if (mfCount === 1) p.gridPos = { x: 30, y: 56 };
        else if (mfCount === 2) p.gridPos = { x: 50, y: 46 };
        else p.gridPos = { x: 70, y: 56 };
      } else if (p.position === 'FW') {
        fwCount++;
        fwRating += pRating;
        if (fwCount === 1) p.gridPos = { x: 20, y: 75 };
        else if (fwCount === 2) p.gridPos = { x: 50, y: 85 };
        else p.gridPos = { x: 80, y: 75 };
      } else {
        p.gridPos = { x: 50, y: 50 };
      }
    });

    parsedSquad.strikersCount = fwCount || 1;
    parsedSquad.midfieldersCount = mfCount || 1;
    parsedSquad.defendersCount = dfCount || 1;

    // Standardize overall ratings
    parsedSquad.stats = {
      attack: Math.round(fwRating / (fwCount || 1)) || 75,
      midfield: Math.round(mfRating / (mfCount || 1)) || 75,
      defense: Math.round(dfRating / (dfCount || 1)) || 75,
      overall: Math.round(baseRatingSum / parsedSquad.players.length) || 75
    };

    const cache = loadSquadsCache();
    cache[id] = parsedSquad;
    saveSquadsCache(cache);

    console.log(`[AI-SQUAD] Successfully synced and cached ${team.name} squad with ${parsedSquad.players.length} players!`);
    res.json({ success: true, squad: parsedSquad });
  } catch (err: any) {
    console.error(`Error generating team ${id} squad:`, err);
    res.status(500).json({ error: `خطا در استخراج زنده بازیکنان توسط هوش مصنوعی: ${err.message}` });
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
    
    // Boot up the database backup scheduler thread (checks criteria every 5 minutes)
    try {
      checkAndTriggerBackup();
      setInterval(() => {
        checkAndTriggerBackup();
      }, 1000 * 60 * 5);
      console.log('[BACKUP-SCHEDULER] Periodic database backup worker registered successfully.');
    } catch (e) {
      console.error('[BACKUP-SCHEDULER] Failed to bootstrap automatic backup scheduler:', e);
    }
  });
}

startServer();
