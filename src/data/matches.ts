import { Match, MatchStage, MatchStatus } from '../types';

export const matchesSeed: Match[] = [
  // ==================== GROUP A ====================
  {
    id: 'm1',
    homeTeamId: 't-mex',
    awayTeamId: 't-rsa',
    stage: MatchStage.GROUP,
    stadium: 'Estadio Azteca, Mexico City',
    kickoffTimeUtc: '2026-06-11T19:00:00Z', // Khordad 21 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm2',
    homeTeamId: 't-kor',
    awayTeamId: 't-cze',
    stage: MatchStage.GROUP,
    stadium: 'Estadio Akron, Guadalajara',
    kickoffTimeUtc: '2026-06-12T02:00:00Z', // Khordad 22 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm3',
    homeTeamId: 't-cze',
    awayTeamId: 't-rsa',
    stage: MatchStage.GROUP,
    stadium: 'Estadio BBVA, Monterrey',
    kickoffTimeUtc: '2026-06-18T16:00:00Z', // Khordad 28 @ 19:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm4',
    homeTeamId: 't-mex',
    awayTeamId: 't-kor',
    stage: MatchStage.GROUP,
    stadium: 'Estadio Azteca, Mexico City',
    kickoffTimeUtc: '2026-06-19T01:00:00Z', // Khordad 29 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm5',
    homeTeamId: 't-rsa',
    awayTeamId: 't-kor',
    stage: MatchStage.GROUP,
    stadium: 'Estadio Akron, Guadalajara',
    kickoffTimeUtc: '2026-06-25T01:00:00Z', // Tir 4 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm6',
    homeTeamId: 't-cze',
    awayTeamId: 't-mex',
    stage: MatchStage.GROUP,
    stadium: 'Estadio BBVA, Monterrey',
    kickoffTimeUtc: '2026-06-25T01:00:00Z', // Tir 4 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP B ====================
  {
    id: 'm7',
    homeTeamId: 't-can',
    awayTeamId: 't-bih',
    stage: MatchStage.GROUP,
    stadium: 'BMO Field, Toronto',
    kickoffTimeUtc: '2026-06-12T19:00:00Z', // Khordad 22 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm8',
    homeTeamId: 't-qat',
    awayTeamId: 't-sui',
    stage: MatchStage.GROUP,
    stadium: 'BC Place, Vancouver',
    kickoffTimeUtc: '2026-06-13T19:00:00Z', // Khordad 23 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm9',
    homeTeamId: 't-sui',
    awayTeamId: 't-bih',
    stage: MatchStage.GROUP,
    stadium: 'BMO Field, Toronto',
    kickoffTimeUtc: '2026-06-18T19:00:00Z', // Khordad 28 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm10',
    homeTeamId: 't-can',
    awayTeamId: 't-qat',
    stage: MatchStage.GROUP,
    stadium: 'BC Place, Vancouver',
    kickoffTimeUtc: '2026-06-18T22:00:00Z', // Khordad 29 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm11',
    homeTeamId: 't-sui',
    awayTeamId: 't-can',
    stage: MatchStage.GROUP,
    stadium: 'BC Place, Vancouver',
    kickoffTimeUtc: '2026-06-24T19:00:00Z', // Tir 3 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm12',
    homeTeamId: 't-bih',
    awayTeamId: 't-qat',
    stage: MatchStage.GROUP,
    stadium: 'BMO Field, Toronto',
    kickoffTimeUtc: '2026-06-24T19:00:00Z', // Tir 3 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP C ====================
  {
    id: 'm13',
    homeTeamId: 't-bra',
    awayTeamId: 't-mar',
    stage: MatchStage.GROUP,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-06-13T22:00:00Z', // Khordad 24 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm14',
    homeTeamId: 't-hai',
    awayTeamId: 't-sco',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-14T01:30:00Z', // Khordad 24 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm15',
    homeTeamId: 't-sco',
    awayTeamId: 't-mar',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-19T22:00:00Z', // Khordad 30 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm16',
    homeTeamId: 't-bra',
    awayTeamId: 't-hai',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-20T00:30:00Z', // Khordad 30 @ 04:00
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm17',
    homeTeamId: 't-mar',
    awayTeamId: 't-hai',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-24T22:00:00Z', // Tir 4 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm18',
    homeTeamId: 't-sco',
    awayTeamId: 't-bra',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-24T22:00:00Z', // Tir 4 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP D ====================
  {
    id: 'm19',
    homeTeamId: 't-usa',
    awayTeamId: 't-par',
    stage: MatchStage.GROUP,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-06-13T01:00:00Z', // Khordad 23 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm20',
    homeTeamId: 't-aus',
    awayTeamId: 't-tur',
    stage: MatchStage.GROUP,
    stadium: 'Lumen Field, Seattle',
    kickoffTimeUtc: '2026-06-14T04:00:00Z', // Khordad 24 @ 07:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm21',
    homeTeamId: 't-usa',
    awayTeamId: 't-aus',
    stage: MatchStage.GROUP,
    stadium: 'Lumen Field, Seattle',
    kickoffTimeUtc: '2026-06-19T19:00:00Z', // Khordad 29 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm22',
    homeTeamId: 't-tur',
    awayTeamId: 't-par',
    stage: MatchStage.GROUP,
    stadium: 'Levi\'s Stadium, San Francisco',
    kickoffTimeUtc: '2026-06-20T03:00:00Z', // Khordad 30 @ 06:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm23',
    homeTeamId: 't-tur',
    awayTeamId: 't-usa',
    stage: MatchStage.GROUP,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-06-26T02:00:00Z', // Tir 5 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm24',
    homeTeamId: 't-par',
    awayTeamId: 't-aus',
    stage: MatchStage.GROUP,
    stadium: 'Levi\'s Stadium, San Francisco',
    kickoffTimeUtc: '2026-06-26T02:00:00Z', // Tir 5 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP E ====================
  {
    id: 'm25',
    homeTeamId: 't-ger',
    awayTeamId: 't-cuw',
    stage: MatchStage.GROUP,
    stadium: 'Mercedes-Benz Stadium, Atlanta',
    kickoffTimeUtc: '2026-06-14T17:00:00Z', // Khordad 24 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm26',
    homeTeamId: 't-civ',
    awayTeamId: 't-ecu',
    stage: MatchStage.GROUP,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-14T23:00:00Z', // Khordad 25 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm27',
    homeTeamId: 't-ger',
    awayTeamId: 't-civ',
    stage: MatchStage.GROUP,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-06-20T20:00:00Z', // Khordad 30 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm28',
    homeTeamId: 't-ecu',
    awayTeamId: 't-cuw',
    stage: MatchStage.GROUP,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-06-21T00:00:00Z', // Khordad 31 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm29',
    homeTeamId: 't-cuw',
    awayTeamId: 't-civ',
    stage: MatchStage.GROUP,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-25T20:00:00Z', // Tir 4 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm30',
    homeTeamId: 't-ecu',
    awayTeamId: 't-ger',
    stage: MatchStage.GROUP,
    stadium: 'Mercedes-Benz Stadium, Atlanta',
    kickoffTimeUtc: '2026-06-25T20:00:00Z', // Tir 4 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP F ====================
  {
    id: 'm31',
    homeTeamId: 't-ned',
    awayTeamId: 't-jpn',
    stage: MatchStage.GROUP,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-06-14T20:00:00Z', // Khordad 24 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm32',
    homeTeamId: 't-swe',
    awayTeamId: 't-tun',
    stage: MatchStage.GROUP,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-06-15T02:00:00Z', // Khordad 25 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm33',
    homeTeamId: 't-ned',
    awayTeamId: 't-swe',
    stage: MatchStage.GROUP,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-06-20T17:00:00Z', // Khordad 30 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm34',
    homeTeamId: 't-tun',
    awayTeamId: 't-jpn',
    stage: MatchStage.GROUP,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-21T04:00:00Z', // Khordad 31 @ 07:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm35',
    homeTeamId: 't-tun',
    awayTeamId: 't-ned',
    stage: MatchStage.GROUP,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-06-25T23:00:00Z', // Tir 5 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm36',
    homeTeamId: 't-jpn',
    awayTeamId: 't-swe',
    stage: MatchStage.GROUP,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-06-25T23:00:00Z', // Tir 5 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP G ====================
  {
    id: 'm37',
    homeTeamId: 't-bel',
    awayTeamId: 't-egy',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-15T19:00:00Z', // Khordad 25 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm38',
    homeTeamId: 't-irn',
    awayTeamId: 't-nzl',
    stage: MatchStage.GROUP,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-06-16T01:00:00Z', // Khordad 26 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm39',
    homeTeamId: 't-bel',
    awayTeamId: 't-irn',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-21T19:00:00Z', // Khordad 31 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm40',
    homeTeamId: 't-nzl',
    awayTeamId: 't-egy',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-22T01:00:00Z', // Tir 1 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm41',
    homeTeamId: 't-nzl',
    awayTeamId: 't-bel',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-27T03:00:00Z', // Tir 6 @ 06:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm42',
    homeTeamId: 't-egy',
    awayTeamId: 't-irn',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-27T03:00:00Z', // Tir 6 @ 06:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP H ====================
  {
    id: 'm43',
    homeTeamId: 't-esp',
    awayTeamId: 't-cpv',
    stage: MatchStage.GROUP,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-06-15T16:00:00Z', // Khordad 25 @ 19:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm44',
    homeTeamId: 't-ksa',
    awayTeamId: 't-uru',
    stage: MatchStage.GROUP,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-06-15T22:00:05Z', // Khordad 26 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm45',
    homeTeamId: 't-esp',
    awayTeamId: 't-ksa',
    stage: MatchStage.GROUP,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-21T16:00:00Z', // Khordad 31 @ 19:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm46',
    homeTeamId: 't-uru',
    awayTeamId: 't-cpv',
    stage: MatchStage.GROUP,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-06-21T22:00:00Z', // Tir 1 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm47',
    homeTeamId: 't-cpv',
    awayTeamId: 't-ksa',
    stage: MatchStage.GROUP,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-06-27T00:00:00Z', // Tir 6 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm48',
    homeTeamId: 't-uru',
    awayTeamId: 't-esp',
    stage: MatchStage.GROUP,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-27T00:00:00Z', // Tir 6 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP I ====================
  {
    id: 'm49',
    homeTeamId: 't-fra',
    awayTeamId: 't-sen',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-16T19:00:00Z', // Khordad 26 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm50',
    homeTeamId: 't-irq',
    awayTeamId: 't-nor',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-16T22:00:00Z', // Khordad 27 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm51',
    homeTeamId: 't-nor',
    awayTeamId: 't-sen',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-23T00:00:00Z', // Tir 2 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm52',
    homeTeamId: 't-fra',
    awayTeamId: 't-irq',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-22T21:00:00Z', // Tir 2 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm53',
    homeTeamId: 't-nor',
    awayTeamId: 't-fra',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-26T19:00:00Z', // Tir 5 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm54',
    homeTeamId: 't-sen',
    awayTeamId: 't-irq',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-26T19:00:00Z', // Tir 5 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP J ====================
  {
    id: 'm55',
    homeTeamId: 't-arg',
    awayTeamId: 't-alg',
    stage: MatchStage.GROUP,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-06-17T01:00:00Z', // Khordad 27 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm56',
    homeTeamId: 't-aut',
    awayTeamId: 't-jor',
    stage: MatchStage.GROUP,
    stadium: 'Lumen Field, Seattle',
    kickoffTimeUtc: '2026-06-17T04:00:00Z', // Khordad 27 @ 07:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm57',
    homeTeamId: 't-jor',
    awayTeamId: 't-alg',
    stage: MatchStage.GROUP,
    stadium: 'Levi\'s Stadium, San Francisco',
    kickoffTimeUtc: '2026-06-23T03:00:00Z', // Tir 2 @ 06:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm58',
    homeTeamId: 't-arg',
    awayTeamId: 't-aut',
    stage: MatchStage.GROUP,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-06-22T17:00:00Z', // Tir 1 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm59',
    homeTeamId: 't-alg',
    awayTeamId: 't-aut',
    stage: MatchStage.GROUP,
    stadium: 'Lumen Field, Seattle',
    kickoffTimeUtc: '2026-06-28T02:00:00Z', // Tir 7 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm60',
    homeTeamId: 't-jor',
    awayTeamId: 't-arg',
    stage: MatchStage.GROUP,
    stadium: 'Levi\'s Stadium, San Francisco',
    kickoffTimeUtc: '2026-06-28T02:00:00Z', // Tir 7 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP K ====================
  {
    id: 'm61',
    homeTeamId: 't-por',
    awayTeamId: 't-cod',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-17T17:00:00Z', // Khordad 27 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm62',
    homeTeamId: 't-uzb',
    awayTeamId: 't-col',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-18T02:00:00Z', // Khordad 28 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm63',
    homeTeamId: 't-por',
    awayTeamId: 't-uzb',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-23T17:00:00Z', // Tir 2 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm64',
    homeTeamId: 't-col',
    awayTeamId: 't-cod',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-24T02:00:00Z', // Tir 3 @ 05:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm65',
    homeTeamId: 't-col',
    awayTeamId: 't-por',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-27T23:30:00Z', // Tir 7 @ 03:00
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm66',
    homeTeamId: 't-cod',
    awayTeamId: 't-uzb',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-27T23:30:00Z', // Tir 7 @ 03:00
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== GROUP L ====================
  {
    id: 'm67',
    homeTeamId: 't-eng',
    awayTeamId: 't-cro',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-17T20:00:00Z', // Khordad 27 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm68',
    homeTeamId: 't-gha',
    awayTeamId: 't-pan',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-17T23:00:00Z', // Khordad 28 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm69',
    homeTeamId: 't-eng',
    awayTeamId: 't-gha',
    stage: MatchStage.GROUP,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-23T20:00:00Z', // Tir 2 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm70',
    homeTeamId: 't-pan',
    awayTeamId: 't-cro',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-23T23:00:00Z', // Tir 3 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm71',
    homeTeamId: 't-pan',
    awayTeamId: 't-eng',
    stage: MatchStage.GROUP,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-06-27T21:00:00Z', // Tir 7 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm72',
    homeTeamId: 't-cro',
    awayTeamId: 't-gha',
    stage: MatchStage.GROUP,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-06-27T21:00:00Z', // Tir 7 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== ROUND OF 32 (1/32) ====================
  {
    id: 'm73',
    homeTeamId: 'TBD_1A',
    awayTeamId: 'TBD_3RD_1',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-06-28T19:00:00Z', // Tir 7 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm74',
    homeTeamId: 'TBD_1B',
    awayTeamId: 'TBD_3RD_2',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'ARROWHEAD, Kansas City',
    kickoffTimeUtc: '2026-06-29T17:00:00Z', // Tir 8 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm75',
    homeTeamId: 'TBD_1C',
    awayTeamId: 'TBD_3RD_3',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Estadio Azteca, Mexico City',
    kickoffTimeUtc: '2026-06-29T20:30:00Z', // Tir 9 @ 00:00
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm76',
    homeTeamId: 'TBD_1D',
    awayTeamId: 'TBD_3RD_4',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-06-30T01:00:00Z', // Tir 9 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm77',
    homeTeamId: 'TBD_1E',
    awayTeamId: 'TBD_3RD_5',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Mercedes-Benz Stadium, Atlanta',
    kickoffTimeUtc: '2026-06-30T17:00:00Z', // Tir 9 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm78',
    homeTeamId: 'TBD_1F',
    awayTeamId: 'TBD_3RD_6',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-06-30T21:00:00Z', // Tir 10 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm79',
    homeTeamId: 'TBD_1G',
    awayTeamId: 'TBD_3RD_7',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-07-01T01:00:00Z', // Tir 10 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm80',
    homeTeamId: 'TBD_1H',
    awayTeamId: 'TBD_3RD_8',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-07-01T16:00:00Z', // Tir 10 @ 19:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm81',
    homeTeamId: 'TBD_1I',
    awayTeamId: 'TBD_2A',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-07-01T20:00:00Z', // Tir 10 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm82',
    homeTeamId: 'TBD_1J',
    awayTeamId: 'TBD_2B',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-07-02T00:00:00Z', // Tir 11 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm83',
    homeTeamId: 'TBD_1K',
    awayTeamId: 'TBD_2C',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'BC Place, Vancouver',
    kickoffTimeUtc: '2026-07-02T19:00:00Z', // Tir 11 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm84',
    homeTeamId: 'TBD_1L',
    awayTeamId: 'TBD_2D',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'BMO Field, Toronto',
    kickoffTimeUtc: '2026-07-02T23:00:00Z', // Tir 12 @ 02:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm85',
    homeTeamId: 'TBD_2E',
    awayTeamId: 'TBD_2F',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Lumen Field, Seattle',
    kickoffTimeUtc: '2026-07-03T03:00:00Z', // Tir 12 @ 06:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm86',
    homeTeamId: 'TBD_2G',
    awayTeamId: 'TBD_2H',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Levi\'s Stadium, San Francisco',
    kickoffTimeUtc: '2026-07-03T18:00:00Z', // Tir 12 @ 21:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm87',
    homeTeamId: 'TBD_2I',
    awayTeamId: 'TBD_2J',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Estadio BBVA, Monterrey',
    kickoffTimeUtc: '2026-07-03T22:00:00Z', // Tir 13 @ 01:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm88',
    homeTeamId: 'TBD_2K',
    awayTeamId: 'TBD_2L',
    stage: MatchStage.ROUND_OF_32,
    stadium: 'Estadio Akron, Guadalajara',
    kickoffTimeUtc: '2026-07-04T01:30:00Z', // Tir 13 @ 05:00
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== ROUND OF 16 (1/8) ====================
  {
    id: 'm89',
    homeTeamId: 'TBD_WM73',
    awayTeamId: 'TBD_WM74',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Estadio Azteca, Mexico City',
    kickoffTimeUtc: '2026-07-04T17:00:00Z', // Tir 13 @ 20:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm90',
    homeTeamId: 'TBD_WM75',
    awayTeamId: 'TBD_WM76',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-07-04T21:00:00Z', // Tir 14 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm91',
    homeTeamId: 'TBD_WM77',
    awayTeamId: 'TBD_WM78',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-07-05T20:00:00Z', // Tir 14 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm92',
    homeTeamId: 'TBD_WM79',
    awayTeamId: 'TBD_WM80',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-07-06T00:00:00Z', // Tir 15 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm93',
    homeTeamId: 'TBD_WM81',
    awayTeamId: 'TBD_WM82',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-07-05T19:00:00Z', // Tir 15 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm94',
    homeTeamId: 'TBD_WM83',
    awayTeamId: 'TBD_WM84',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'NRG Stadium, Houston',
    kickoffTimeUtc: '2026-07-06T00:00:00Z', // Tir 16 @ 03:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm95',
    homeTeamId: 'TBD_WM85',
    awayTeamId: 'TBD_WM86',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Mercedes-Benz Stadium, Atlanta',
    kickoffTimeUtc: '2026-07-06T16:00:00Z', // Tir 16 @ 19:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm96',
    homeTeamId: 'TBD_WM87',
    awayTeamId: 'TBD_WM88',
    stage: MatchStage.ROUND_OF_16,
    stadium: 'Lincoln Financial Field, Philadelphia',
    kickoffTimeUtc: '2026-07-06T20:00:00Z', // Tir 16 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== QUARTER FINALS (1/4) ====================
  {
    id: 'm97',
    homeTeamId: 'TBD_WM89',
    awayTeamId: 'TBD_WM90',
    stage: MatchStage.QUARTER_FINALS,
    stadium: 'Gillette Stadium, Boston',
    kickoffTimeUtc: '2026-07-08T20:00:00Z', // Tir 18 @ 23:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm98',
    homeTeamId: 'TBD_WM91',
    awayTeamId: 'TBD_WM92',
    stage: MatchStage.QUARTER_FINALS,
    stadium: 'SoFi Stadium, Los Angeles',
    kickoffTimeUtc: '2026-07-09T19:00:00Z', // Tir 19 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm99',
    homeTeamId: 'TBD_WM93',
    awayTeamId: 'TBD_WM94',
    stage: MatchStage.QUARTER_FINALS,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-07-11T21:00:00Z', // Tir 21 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm100',
    homeTeamId: 'TBD_WM95',
    awayTeamId: 'TBD_WM96',
    stage: MatchStage.QUARTER_FINALS,
    stadium: 'Arrowhead Stadium, Kansas City',
    kickoffTimeUtc: '2026-07-12T01:00:00Z', // Tir 21 @ 04:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== SEMI FINALS (1/2) ====================
  {
    id: 'm101',
    homeTeamId: 'TBD_WM97',
    awayTeamId: 'TBD_WM98',
    stage: MatchStage.SEMI_FINALS,
    stadium: 'AT&T Stadium, Dallas',
    kickoffTimeUtc: '2026-07-14T19:00:00Z', // Tir 23 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },
  {
    id: 'm102',
    homeTeamId: 'TBD_WM99',
    awayTeamId: 'TBD_WM100',
    stage: MatchStage.SEMI_FINALS,
    stadium: 'Mercedes-Benz Stadium, Atlanta',
    kickoffTimeUtc: '2026-07-15T19:00:00Z', // Tir 24 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== THIRD PLACE PLAYOFF (رده‌بندی) ====================
  {
    id: 'm103',
    homeTeamId: 'TBD_LM101',
    awayTeamId: 'TBD_LM102',
    stage: MatchStage.THIRD_PLACE,
    stadium: 'Hard Rock Stadium, Miami',
    kickoffTimeUtc: '2026-07-17T21:00:00Z', // Tir 28 @ 00:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  },

  // ==================== FINAL (فینال بزرگ) ====================
  {
    id: 'm104',
    homeTeamId: 'TBD_WM101',
    awayTeamId: 'TBD_WM102',
    stage: MatchStage.FINAL,
    stadium: 'MetLife Stadium, New Jersey',
    kickoffTimeUtc: '2026-07-19T19:00:00Z', // Tir 28 @ 22:30
    homeScore: null,
    awayScore: null,
    status: MatchStatus.SCHEDULED
  }
];
