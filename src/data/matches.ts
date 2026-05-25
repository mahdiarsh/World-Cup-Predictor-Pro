import { Match, MatchStage, MatchStatus } from '../types';

export const matchesSeed: Match[] = [
  // --- FINISHED MATCHES (for initial leaderboards) ---
  {
    id: 'm1',
    homeTeamId: 't1', // Qatar
    awayTeamId: 't2', // Ecuador
    stage: MatchStage.GROUP,
    stadium: 'Al Bayt Stadium',
    kickoffTimeUtc: '2026-05-20T17:00:00Z',
    homeScore: 0,
    awayScore: 2,
    status: MatchStatus.FINISHED
  },
  {
    id: 'm2',
    homeTeamId: 't5', // England
    awayTeamId: 't6', // Iran
    stage: MatchStage.GROUP,
    stadium: 'Khalifa International Stadium',
    kickoffTimeUtc: '2026-05-21T13:00:00Z',
    homeScore: 6,
    awayScore: 2,
    status: MatchStatus.FINISHED
  },
  {
    id: 'm3',
    homeTeamId: 't3', // Senegal
    awayTeamId: 't4', // Netherlands
    stage: MatchStage.GROUP,
    stadium: 'Al Thumama Stadium',
    kickoffTimeUtc: '2026-05-21T16:00:00Z',
    homeScore: 0,
    awayScore: 2,
    status: MatchStatus.FINISHED
  },
  {
    id: 'm4',
    homeTeamId: 't7', // USA
    awayTeamId: 't8', // Wales
    stage: MatchStage.GROUP,
    stadium: 'Ahmad bin Ali Stadium',
    kickoffTimeUtc: '2026-05-21T19:00:00Z',
    homeScore: 1,
    awayScore: 1,
    status: MatchStatus.FINISHED
  },
  {
    id: 'm5',
    homeTeamId: 't9', // Argentina
    awayTeamId: 't10', // Saudi Arabia
    stage: MatchStage.GROUP,
    stadium: 'Lusail Stadium',
    kickoffTimeUtc: '2026-05-22T10:00:00Z',
    homeScore: 1,
    awayScore: 2,
    status: MatchStatus.FINISHED
  },

  // --- UPCOMING GROUP STAGE MATCHES ---
  {
    id: 'm6',
    homeTeamId: 't17', // Spain
    awayTeamId: 't19', // Germany
    stage: MatchStage.GROUP,
    stadium: 'Al Bayt Stadium',
    kickoffTimeUtc: '2026-05-25T19:00:00Z', // In the future, fully predictable
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm7',
    homeTeamId: 't13', // France
    awayTeamId: 't15', // Denmark
    stage: MatchStage.GROUP,
    stadium: 'Stadium 974',
    kickoffTimeUtc: '2026-05-26T16:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm8',
    homeTeamId: 't25', // Brazil
    awayTeamId: 't27', // Switzerland
    stage: MatchStage.GROUP,
    stadium: 'Stadium 974',
    kickoffTimeUtc: '2026-05-27T16:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm9',
    homeTeamId: 't29', // Portugal
    awayTeamId: 't31', // Uruguay
    stage: MatchStage.GROUP,
    stadium: 'Lusail Stadium',
    kickoffTimeUtc: '2026-05-28T19:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm10',
    homeTeamId: 't6', // Iran
    awayTeamId: 't7', // USA
    stage: MatchStage.GROUP,
    stadium: 'Al Thumama Stadium',
    kickoffTimeUtc: '2026-05-29T19:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm11',
    homeTeamId: 't12', // Poland
    awayTeamId: 't9', // Argentina
    stage: MatchStage.GROUP,
    stadium: 'Stadium 974',
    kickoffTimeUtc: '2026-05-30T19:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // --- KNOCKOUT STAGE MATCHES ---
  {
    id: 'm12',
    homeTeamId: 't4', // Netherlands
    awayTeamId: 't7', // USA
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Khalifa International Stadium',
    kickoffTimeUtc: '2026-06-01T15:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm13',
    homeTeamId: 't9', // Argentina
    awayTeamId: 't14', // Australia
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Ahmad bin Ali Stadium',
    kickoffTimeUtc: '2026-06-02T19:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm14',
    homeTeamId: 't24', // Croatia
    awayTeamId: 't25', // Brazil
    stage: MatchStage.QUARTER_FINALS,
    stadium: 'Education City Stadium',
    kickoffTimeUtc: '2026-06-05T15:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm15',
    homeTeamId: 't9', // Argentina
    awayTeamId: 't24', // Croatia
    stage: MatchStage.SEMI_FINALS,
    stadium: 'Lusail Stadium',
    kickoffTimeUtc: '2026-06-09T19:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm16',
    homeTeamId: 't9', // Argentina
    awayTeamId: 't13', // France
    stage: MatchStage.FINAL,
    stadium: 'Lusail Stadium',
    kickoffTimeUtc: '2026-06-14T15:00:00Z',
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  }
];
