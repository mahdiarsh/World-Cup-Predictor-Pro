import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Team, Match, Prediction, UserRole, MatchStatus, LeaderboardEntry, MatchStage } from '../src/types';
import { teamsSeed } from '../src/data/teams';
import { matchesSeed } from '../src/data/matches';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface RegistrationSettings {
  registrationEnabled: boolean;
}

interface DatabaseSchema {
  users: User[];
  teams: Team[];
  matches: Match[];
  predictions: Prediction[];
  passwords: Record<string, string>; // userId -> passwordHash map
  settings: RegistrationSettings;
}

function getInitialDB(): DatabaseSchema {
  // Hash passwords for seed users
  const adminId = 'u-admin';
  const u1Id = 'u-1';
  const u2Id = 'u-2';
  const u3Id = 'u-3';
  const u4Id = 'u-4';
  const u5Id = 'u-5';

  const salt = bcrypt.genSaltSync(10);
  const passwords: Record<string, string> = {
    [adminId]: bcrypt.hashSync('admin', salt),
    [u1Id]: bcrypt.hashSync('messi10', salt),
    [u2Id]: bcrypt.hashSync('cr7', salt),
    [u3Id]: bcrypt.hashSync('mbappe', salt),
    [u4Id]: bcrypt.hashSync('neymar', salt),
    [u5Id]: bcrypt.hashSync('kane', salt),
  };

  const users: User[] = [
    {
      id: adminId,
      username: 'admin',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      totalScore: 0,
      correctPredictions: 0,
      exactPredictions: 0,
      playedMatches: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: u1Id,
      username: 'messi10',
      fullName: 'Lionel Messi',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lionel',
      totalScore: 12, // Perfect guesses or correct ones
      correctPredictions: 5,
      exactPredictions: 3,
      playedMatches: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: u2Id,
      username: 'cr7',
      fullName: 'Cristiano Ronaldo',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Cristiano',
      totalScore: 8,
      correctPredictions: 4,
      exactPredictions: 1,
      playedMatches: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: u3Id,
      username: 'mbappe',
      fullName: 'Kylian Mbappé',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kylian',
      totalScore: 7,
      correctPredictions: 3,
      exactPredictions: 2,
      playedMatches: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: u4Id,
      username: 'neymar_jr',
      fullName: 'Neymar da Silva',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Neymar',
      totalScore: 4,
      correctPredictions: 2,
      exactPredictions: 0,
      playedMatches: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: u5Id,
      username: 'kane_eng',
      fullName: 'Harry Kane',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Harry',
      totalScore: 3,
      correctPredictions: 1,
      exactPredictions: 1,
      playedMatches: 5,
      createdAt: new Date().toISOString()
    }
  ];

  // Completed matches predictions for demo users to yield actual scores:
  // m1: Qatar 0 - 2 Ecuador
  // m2: England 6 - 2 Iran
  // m3: Senegal 0 - 2 Netherlands
  // m4: USA 1 - 1 Wales
  // m5: Argentina 1 - 2 Saudi Arabia

  const predictions: Prediction[] = [
    // messi10 predictions:
    { id: 'p1', userId: u1Id, matchId: 'm1', predictedHome: 0, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p2', userId: u1Id, matchId: 'm2', predictedHome: 3, predictedAway: 1, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p3', userId: u1Id, matchId: 'm3', predictedHome: 0, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p4', userId: u1Id, matchId: 'm4', predictedHome: 1, predictedAway: 1, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p5', userId: u1Id, matchId: 'm5', predictedHome: 2, predictedAway: 0, points: 0, createdAt: new Date().toISOString() }, // Wrong (0) - Messi expected Argentina to win!

    // cr7 predictions:
    { id: 'p6', userId: u2Id, matchId: 'm1', predictedHome: 1, predictedAway: 3, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p7', userId: u2Id, matchId: 'm2', predictedHome: 4, predictedAway: 1, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p8', userId: u2Id, matchId: 'm3', predictedHome: 0, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p9', userId: u2Id, matchId: 'm4', predictedHome: 2, predictedAway: 1, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p10', userId: u2Id, matchId: 'm5', predictedHome: 1, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3) - CR7 guessed Arab win!

    // mbappe predictions:
    { id: 'p11', userId: u3Id, matchId: 'm1', predictedHome: 0, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p12', userId: u3Id, matchId: 'm2', predictedHome: 6, predictedAway: 2, points: 3, createdAt: new Date().toISOString() }, // Exact (+3) - Mbappe predicted the onslaught!
    { id: 'p13', userId: u3Id, matchId: 'm3', predictedHome: 1, predictedAway: 3, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p14', userId: u3Id, matchId: 'm4', predictedHome: 2, predictedAway: 0, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p15', userId: u3Id, matchId: 'm5', predictedHome: 3, predictedAway: 0, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)

    // neymar predictions:
    { id: 'p16', userId: u4Id, matchId: 'm1', predictedHome: 1, predictedAway: 2, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p17', userId: u4Id, matchId: 'm2', predictedHome: 2, predictedAway: 0, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p18', userId: u4Id, matchId: 'm3', predictedHome: 1, predictedAway: 1, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p19', userId: u4Id, matchId: 'm4', predictedHome: 0, predictedAway: 3, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p20', userId: u4Id, matchId: 'm5', predictedHome: 2, predictedAway: 3, points: 1, createdAt: new Date().toISOString() }, // Winner (+1) (Arab win, wrong score)

    // kane predictions:
    { id: 'p21', userId: u5Id, matchId: 'm1', predictedHome: 1, predictedAway: 1, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p22', userId: u5Id, matchId: 'm2', predictedHome: 2, predictedAway: 1, points: 1, createdAt: new Date().toISOString() }, // Winner (+1)
    { id: 'p23', userId: u5Id, matchId: 'm3', predictedHome: 1, predictedAway: 1, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
    { id: 'p24', userId: u5Id, matchId: 'm4', predictedHome: 1, predictedAway: 1, points: 3, createdAt: new Date().toISOString() }, // Exact (+3)
    { id: 'p25', userId: u5Id, matchId: 'm5', predictedHome: 4, predictedAway: 0, points: 0, createdAt: new Date().toISOString() }, // Wrong (0)
  ];

  return {
    users,
    teams: teamsSeed,
    matches: matchesSeed,
    predictions,
    passwords,
    settings: {
      registrationEnabled: true
    }
  };
}

export function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Verify validity of keys
      if (parsed.users && parsed.teams && parsed.matches && parsed.predictions && parsed.passwords) {
        // Enforce settings presence if not yet existing (backward compatible upgrade)
        if (!parsed.settings) {
          parsed.settings = { registrationEnabled: true };
          saveDB(parsed);
        }
        return parsed as DatabaseSchema;
      }
    }
  } catch (err) {
    console.error('Failed to load db.json, falling back to initial seed:', err);
  }

  const initial = getInitialDB();
  saveDB(initial);
  return initial;
}

export function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to filesystem:', err);
  }
}

// Score Calculation core logic
export function calculatePredictionPoints(
  predHome: number,
  predAway: number,
  actualHome: number | null,
  actualAway: number | null
): number {
  if (actualHome === null || actualAway === null) return 0;

  // Exact Match (+3 points)
  if (predHome === actualHome && predAway === actualAway) {
    return 3;
  }

  // Correct Winner or Draw (+1 point)
  const actualDiff = actualHome - actualAway;
  const predDiff = predHome - predAway;

  if (
    (actualDiff > 0 && predDiff > 0) || // Home win
    (actualDiff < 0 && predDiff < 0) || // Away win
    (actualDiff === 0 && predDiff === 0) // Draw
  ) {
    return 1;
  }

  // Wrong prediction (0 points)
  return 0;
}

// Score engine to update total calculations for all users
export function recalculateAllScores(): void {
  const db = loadDB();
  
  // Reset all stats for active users (excluding admin who doesn't play usually)
  const userStatsMap: Record<string, { totalScore: number; correct: number; exact: number; played: number }> = {};
  
  for (const user of db.users) {
    userStatsMap[user.id] = { totalScore: 0, correct: 0, exact: 0, played: 0 };
  }

  // Go through each prediction
  for (const pred of db.predictions) {
    const match = db.matches.find(m => m.id === pred.matchId);
    if (!match) continue;

    if (match.status === MatchStatus.FINISHED && match.homeScore !== null && match.awayScore !== null) {
      const pts = calculatePredictionPoints(pred.predictedHome, pred.predictedAway, match.homeScore, match.awayScore);
      pred.points = pts;

      if (!userStatsMap[pred.userId]) {
        userStatsMap[pred.userId] = { totalScore: 0, correct: 0, exact: 0, played: 0 };
      }

      const stats = userStatsMap[pred.userId];
      stats.totalScore += pts;
      stats.played += 1;
      if (pts === 3) {
        stats.exact += 1;
        stats.correct += 1;
      } else if (pts === 1) {
        stats.correct += 1;
      }
    } else {
      pred.points = null; // Unplayed or reset
    }
  }

  // Update users objects
  for (const user of db.users) {
    const stats = userStatsMap[user.id];
    if (stats) {
      user.totalScore = stats.totalScore;
      user.exactPredictions = stats.exact;
      user.correctPredictions = stats.correct;
      user.playedMatches = stats.played;
    }
  }

  saveDB(db);
}

// Check if all group stage matches of a group are finished in our database
export function isGroupCompleted(groupName: string, matches: Match[]): boolean {
  // Translate English "Group A" style to "گروه A"
  const normalizedGrp = groupName.replace('Group ', 'گروه ');
  const groupTeams = teamsSeed.filter(t => t.groupName === normalizedGrp).map(t => t.id);
  const groupMatches = matches.filter(m => 
    m.stage === MatchStage.GROUP && 
    groupTeams.includes(m.homeTeamId) && 
    groupTeams.includes(m.awayTeamId)
  );

  if (groupMatches.length === 0) return false;
  return groupMatches.every(m => m.status === MatchStatus.FINISHED);
}

// Calculate group standings dynamically based on finished matches
export interface LocalTeamStanding {
  teamId: string;
  pts: number;
  gd: number;
  gf: number;
  name: string;
}

export function getGroupStandings(matches: Match[]): Record<string, LocalTeamStanding[]> {
  const standings: Record<string, LocalTeamStanding[]> = {};

  // Initialize standings for all teams
  for (const team of teamsSeed) {
    if (!standings[team.groupName]) {
      standings[team.groupName] = [];
    }
    standings[team.groupName].push({
      teamId: team.id,
      pts: 0,
      gd: 0,
      gf: 0,
      name: team.name
    });
  }

  // Aggregate results from completed group matches
  for (const match of matches) {
    if (
      match.stage === MatchStage.GROUP &&
      match.status === MatchStatus.FINISHED &&
      match.homeScore !== null &&
      match.awayScore !== null
    ) {
      const homeTeam = teamsSeed.find(t => t.id === match.homeTeamId);
      const awayTeam = teamsSeed.find(t => t.id === match.awayTeamId);

      const homeStanding = homeTeam ? standings[homeTeam.groupName]?.find(t => t.teamId === match.homeTeamId) : undefined;
      const awayStanding = awayTeam ? standings[awayTeam.groupName]?.find(t => t.teamId === match.awayTeamId) : undefined;

      if (homeStanding && awayStanding) {
        homeStanding.gf += match.homeScore;
        homeStanding.gd += (match.homeScore - match.awayScore);
        awayStanding.gf += match.awayScore;
        awayStanding.gd += (match.awayScore - match.homeScore);

        if (match.homeScore > match.awayScore) {
          homeStanding.pts += 3;
        } else if (match.homeScore < match.awayScore) {
          awayStanding.pts += 3;
        } else {
          homeStanding.pts += 1;
          awayStanding.pts += 1;
        }
      }
    }
  }

  // Sort groups: Points -> GD -> GF -> name
  for (const grp of Object.keys(standings)) {
    standings[grp].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
  }

  return standings;
}

// Recursively process and resolve knockout match team pairings
export function resolveMatchesWithStandings(matches: Match[]): Match[] {
  const standings = getGroupStandings(matches);
  const resolved = matches.map(m => ({ ...m }));

  // Helper to check if group is complete
  const isGroupDone = (grp: string) => isGroupCompleted(grp, matches);

  // Helper to get group representative
  const getGroupRepId = (grp: string, rank: number): string => {
    const farsiGrp = grp.replace('Group ', 'گروه ');
    if (!isGroupDone(farsiGrp)) return '';
    const groupRows = standings[farsiGrp] || [];
    return groupRows[rank - 1]?.teamId || '';
  };

  // Helper to get knockout match winner
  const getMatchWinnerId = (matchId: string): string => {
    const match = resolved.find(m => m.id === matchId);
    if (!match || match.status !== MatchStatus.FINISHED || match.homeScore === null || match.awayScore === null) {
      return '';
    }
    if (match.homeScore > match.awayScore) return match.homeTeamId;
    if (match.awayScore > match.homeScore) return match.awayTeamId;
    return match.homeTeamId; // Default fallback for ties
  };

  // 1. Resolve R16 Match m12: 1st Group A vs 2nd Group B
  const r16_1_home = getGroupRepId('Group A', 1);
  const r16_1_away = getGroupRepId('Group B', 2);
  const m12 = resolved.find(m => m.id === 'm12');
  if (m12) {
    m12.homeTeamId = r16_1_home || 'TBD_1A';
    m12.awayTeamId = r16_1_away || 'TBD_2B';
  }

  // 2. Resolve R16 Match m13: 1st Group C vs 2nd Group D
  const r16_2_home = getGroupRepId('Group C', 1);
  const r16_2_away = getGroupRepId('Group D', 2);
  const m13 = resolved.find(m => m.id === 'm13');
  if (m13) {
    m13.homeTeamId = r16_2_home || 'TBD_1C';
    m13.awayTeamId = r16_2_away || 'TBD_2D';
  }

  // 3. Resolve Quarter Final Match m14: 2nd Group F vs 1st Group G
  const qf_home = getGroupRepId('Group F', 2);
  const qf_away = getGroupRepId('Group G', 1);
  const m14 = resolved.find(m => m.id === 'm14');
  if (m14) {
    m14.homeTeamId = qf_home || 'TBD_2F';
    m14.awayTeamId = qf_away || 'TBD_1G';
  }

  // 4. Resolve Semi Final Match m15: Winner of m13 vs Winner of m14
  const m15 = resolved.find(m => m.id === 'm15');
  if (m15) {
    const winner13 = getMatchWinnerId('m13');
    const winner14 = getMatchWinnerId('m14');
    m15.homeTeamId = winner13 || 'TBD_WM13';
    m15.awayTeamId = winner14 || 'TBD_WM14';
  }

  // 5. Resolve Final Match m16: Winner of m15 vs 1st Group D
  const m16 = resolved.find(m => m.id === 'm16');
  if (m16) {
    const winner15 = getMatchWinnerId('m15');
    const final_away = getGroupRepId('Group D', 1);
    m16.homeTeamId = winner15 || 'TBD_WM15';
    m16.awayTeamId = final_away || 'TBD_1D';
  }

  return resolved;
}
