export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  totalScore: number;
  correctPredictions: number; // Correct winner or exact score at least
  exactPredictions: number; // Exact score matches(+3)
  playedMatches: number; // Total processed predictions
  isDisabled?: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  logo: string; // Emoji flag or code
  groupName: string;
}

export enum MatchStage {
  GROUP = 'Group Stage',
  ROUND_OF_32 = 'Round of 32',
  ROUND_OF_16 = 'Round of 16',
  QUARTER_FINALS = 'Quarter Finals',
  SEMI_FINALS = 'Semi Finals',
  THIRD_PLACE = 'Third Place Playoff',
  FINAL = 'Final'
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED'
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  stage: MatchStage;
  stadium: string;
  kickoffTimeUtc: string; // ISO String
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  isSimulated?: boolean;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  points: number | null; // Null if match not played/calculated yet
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  totalScore: number;
  correctPredictions: number;
  exactPredictions: number;
  playedMatches: number;
}
