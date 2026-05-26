import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Team, Match, Prediction, UserRole, MatchStatus, LeaderboardEntry, MatchStage } from '../src/types';
import { teamsSeed } from '../src/data/teams';
import { matchesSeed } from '../src/data/matches';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface SystemSettings {
  registrationEnabled: boolean;
  syncMode?: 'simulation' | 'manual';
  simulatedTime?: string; // ISO date-time of the tournament clock, e.g., "2026-06-11T00:00:00Z"
  isFastForwarding?: boolean; // If true, time automatically moves forward
}

interface DatabaseSchema {
  users: User[];
  teams: Team[];
  matches: Match[];
  predictions: Prediction[];
  passwords: Record<string, string>; // userId -> passwordHash map
  settings: SystemSettings;
}

function getInitialDB(): DatabaseSchema {
  // Hash passwords for seed users
  const adminId = 'u-admin';

  const salt = bcrypt.genSaltSync(10);
  const passwords: Record<string, string> = {
    [adminId]: bcrypt.hashSync('admin', salt),
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
    }
  ];

  const predictions: Prediction[] = [];

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
        // Automatically upgrade/reset if database is using the old 32-team 2022 layout, or t1 IDs
        if (parsed.teams.length < 40 || parsed.teams.some((t: any) => t.id === 't1')) {
          console.log('Detected deprecated 32-team dataset. Seeding new 104-match 48-team 2026 World Cup data...');
          const initial = getInitialDB();
          saveDB(initial);
          return initial;
        }

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

  // Exact Match (+10 points)
  if (predHome === actualHome && predAway === actualAway) {
    return 10;
  }

  const actualDiff = actualHome - actualAway;
  const predDiff = predHome - predAway;

  const actualSign = Math.sign(actualDiff);
  const predSign = Math.sign(predDiff);

  // Correct Winner or Draw (+5 points or +7 points)
  if (actualSign === predSign) {
    // Correct Winner + Correct Goal Difference (+7 points)
    if (actualDiff === predDiff) {
      return 7;
    }
    // Correct Winner or Draw only (+5 points)
    return 5;
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
      if (pts === 10) {
        stats.exact += 1;
        stats.correct += 1;
      } else if (pts === 7 || pts === 5) {
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

export function resolveThirdPlacePlaceholder(
  placeholder: string,
  matches: Match[],
  standings: Record<string, LocalTeamStanding[]>
): string {
  // Extract groups from placeholder like "TBD_3CDE_1" -> groups C, D, E
  const match = placeholder.match(/^TBD_3([A-L]{3})_1$/);
  if (!match) return '';
  const groupLetters = match[1].split(''); // e.g. ['C', 'D', 'E']

  const candidateThirdTeams: LocalTeamStanding[] = [];

  for (const letter of groupLetters) {
    const farsiGrp = `گروه ${letter}`;
    // A group has 4 teams, so standings are generated for it.
    // Check if group is completed
    if (isGroupCompleted(farsiGrp, matches)) {
      const groupRows = standings[farsiGrp] || [];
      // Third place is index 2
      if (groupRows[2]) {
        candidateThirdTeams.push(groupRows[2]);
      }
    }
  }

  if (candidateThirdTeams.length === 0) return '';

  // Sort them to find the best third place among these groups
  candidateThirdTeams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  return candidateThirdTeams[0].teamId;
}

// Recursively process and resolve knockout match team pairings with regex placeholders
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

  // Helper to get knockout match loser
  const getMatchLoserId = (matchId: string): string => {
    const match = resolved.find(m => m.id === matchId);
    if (!match || match.status !== MatchStatus.FINISHED || match.homeScore === null || match.awayScore === null) {
      return '';
    }
    if (match.homeScore < match.awayScore) return match.homeTeamId;
    if (match.awayScore < match.homeScore) return match.awayTeamId;
    return match.awayTeamId; // Default fallback for ties
  };

  // Resolve recursively through multiple passes to propagate winners down the bracket hierarchy:
  // R32 (m73-m88) -> R16 (m89-m96) -> QF (m97-m100) -> SF (m101-m102) -> Final/ThirdPlace (m103-m104)
  for (let pass = 0; pass < 5; pass++) {
    for (const m of resolved) {
            // 1. Resolve Group stage winners & runner-ups: e.g. TBD_1A, TBD_2B, etc.
      const homeMatchGroup = m.homeTeamId.match(/^TBD_([12])([A-L])$/);
      if (homeMatchGroup) {
        const rank = parseInt(homeMatchGroup[1], 10);
        const groupLetter = homeMatchGroup[2];
        const resolvedTeamId = getGroupRepId(`Group ${groupLetter}`, rank);
        if (resolvedTeamId) m.homeTeamId = resolvedTeamId;
      }
      const awayMatchGroup = m.awayTeamId.match(/^TBD_([12])([A-L])$/);
      if (awayMatchGroup) {
        const rank = parseInt(awayMatchGroup[1], 10);
        const groupLetter = awayMatchGroup[2];
        const resolvedTeamId = getGroupRepId(`Group ${groupLetter}`, rank);
        if (resolvedTeamId) m.awayTeamId = resolvedTeamId;
      }

      // 1.5. Resolve Best Third place teams: e.g. TBD_3CDE_1, TBD_3ABF_1, etc.
      if (m.homeTeamId.startsWith('TBD_3')) {
        const resolvedTeamId = resolveThirdPlacePlaceholder(m.homeTeamId, matches, standings);
        if (resolvedTeamId) m.homeTeamId = resolvedTeamId;
      }
      if (m.awayTeamId.startsWith('TBD_3')) {
        const resolvedTeamId = resolveThirdPlacePlaceholder(m.awayTeamId, matches, standings);
        if (resolvedTeamId) m.awayTeamId = resolvedTeamId;
      }

      // 2. Resolve Winner of Match: e.g. TBD_WM73 -> Winner of m73
      const homeMatchWinner = m.homeTeamId.match(/^TBD_WM(\d+)$/);
      if (homeMatchWinner) {
        const targetMatchId = `m${homeMatchWinner[1]}`;
        const winnerId = getMatchWinnerId(targetMatchId);
        if (winnerId) m.homeTeamId = winnerId;
      }
      const awayMatchWinner = m.awayTeamId.match(/^TBD_WM(\d+)$/);
      if (awayMatchWinner) {
        const targetMatchId = `m${awayMatchWinner[1]}`;
        const winnerId = getMatchWinnerId(targetMatchId);
        if (winnerId) m.awayTeamId = winnerId;
      }

      // 3. Resolve Loser of Match: e.g. TBD_LM101 -> Loser of m101
      const homeMatchLoser = m.homeTeamId.match(/^TBD_LM(\d+)$/);
      if (homeMatchLoser) {
        const targetMatchId = `m${homeMatchLoser[1]}`;
        const loserId = getMatchLoserId(targetMatchId);
        if (loserId) m.homeTeamId = loserId;
      }
      const awayMatchLoser = m.awayTeamId.match(/^TBD_LM(\d+)$/);
      if (awayMatchLoser) {
        const targetMatchId = `m${awayMatchLoser[1]}`;
        const loserId = getMatchLoserId(targetMatchId);
        if (loserId) m.awayTeamId = loserId;
      }
    }
  }

  return resolved;
}

// Background scheduler that simulates matches dynamically that qualify by simulatedTime / real time
export function runFifaLiveSync(): void {
  const db = loadDB();
  
  // Ensure default sync settings
  if (!db.settings) {
    db.settings = { registrationEnabled: true };
  }
  if (!db.settings.syncMode) {
    db.settings.syncMode = 'simulation';
  }
  if (!db.settings.simulatedTime) {
    db.settings.simulatedTime = '2026-06-11T00:00:00Z';
  }
  if (db.settings.isFastForwarding === undefined) {
    db.settings.isFastForwarding = false;
  }

  const settings = db.settings;

  // 1. Advance time if fast-forward is enabled
  if (settings.syncMode === 'simulation' && settings.isFastForwarding) {
    const curTime = new Date(settings.simulatedTime).getTime();
    // Advance by 6 hours every check
    const sixHours = 6 * 60 * 60 * 1000;
    settings.simulatedTime = new Date(curTime + sixHours).toISOString();
  }

  // Look for scheduled matches that kickoff before simulatedTime (or before Date.now() if manual/disabled)
  const currentThreshold = settings.syncMode === 'simulation' 
    ? new Date(settings.simulatedTime).getTime()
    : Date.now();

  let hasChanges = false;

  // Let's resolve the actual team IDs in matches before simulating them
  db.matches = resolveMatchesWithStandings(db.matches);

  for (const match of db.matches) {
    if (match.status === MatchStatus.SCHEDULED) {
      const kickoffTime = new Date(match.kickoffTimeUtc).getTime();
      
      // If kickoff is past threshold
      if (kickoffTime <= currentThreshold) {
        // Can only simulate if home and away teams are resolved (i.e. do not start with TBD_)
        if (match.homeTeamId.startsWith('TBD_') || match.awayTeamId.startsWith('TBD_')) {
          continue;
        }

        // Generate a fun and realistic score
        const r = Math.random();
        let home = 0;
        let away = 0;
        if (r < 0.25) {
          home = 1; away = 0; // 1-0
        } else if (r < 0.45) {
          home = 1; away = 1; // 1-1
        } else if (r < 0.60) {
          home = 2; away = 1; // 2-1
        } else if (r < 0.75) {
          home = 2; away = 0; // 2-0
        } else if (r < 0.85) {
          home = 0; away = 1; // 0-1
        } else if (r < 0.92) {
          home = 2; away = 2; // 2-2
        } else {
          // completely randomized small score
          home = Math.floor(Math.random() * 4);
          away = Math.floor(Math.random() * 4);
        }

        // Apply results and finish the game!
        match.homeScore = home;
        match.awayScore = away;
        match.status = MatchStatus.FINISHED;
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    // Resolve matches recursive to propagate
    db.matches = resolveMatchesWithStandings(db.matches);
    saveDB(db);
    // Recalculate
    recalculateAllScores();
  } else if (settings.isFastForwarding) {
    saveDB(db);
  }
}
