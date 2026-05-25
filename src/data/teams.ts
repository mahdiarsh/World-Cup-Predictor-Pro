import { Team } from '../types';

export const teamsSeed: Team[] = [
  // Group A
  { id: 't1', name: 'قطر', shortCode: 'QAT', logo: '🇶🇦', groupName: 'گروه A' },
  { id: 't2', name: 'اکوادور', shortCode: 'ECU', logo: '🇪🇨', groupName: 'گروه A' },
  { id: 't3', name: 'سنگال', shortCode: 'SEN', logo: '🇸🇳', groupName: 'گروه A' },
  { id: 't4', name: 'هلند', shortCode: 'NED', logo: '🇳🇱', groupName: 'گروه A' },
  // Group B
  { id: 't5', name: 'انگلستان', shortCode: 'ENG', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupName: 'گروه B' },
  { id: 't6', name: 'ایران', shortCode: 'IRN', logo: '🇮🇷', groupName: 'گروه B' },
  { id: 't7', name: 'آمریکا', shortCode: 'USA', logo: '🇺🇸', groupName: 'گروه B' },
  { id: 't8', name: 'ولز', shortCode: 'WAL', logo: '🏴' + '󠁢󠁷󠁬󠁳󠁿', groupName: 'گروه B' }, // safe splitting
  // Group C
  { id: 't9', name: 'آرژانتین', shortCode: 'ARG', logo: '🇦🇷', groupName: 'گروه C' },
  { id: 't10', name: 'عربستان سعودی', shortCode: 'KSA', logo: '🇸🇦', groupName: 'گروه C' },
  { id: 't11', name: 'مکزیک', shortCode: 'MEX', logo: '🇲🇽', groupName: 'گروه C' },
  { id: 't12', name: 'لهستان', shortCode: 'POL', logo: '🇵🇱', groupName: 'گروه C' },
  // Group D
  { id: 't13', name: 'فرانسه', shortCode: 'FRA', logo: '🇫🇷', groupName: 'گروه D' },
  { id: 't14', name: 'استرالیا', shortCode: 'AUS', logo: '🇦🇺', groupName: 'گروه D' },
  { id: 't15', name: 'دانمارک', shortCode: 'DEN', logo: '🇩🇰', groupName: 'گروه D' },
  { id: 't16', name: 'تونس', shortCode: 'TUN', logo: '🇹🇳', groupName: 'گروه D' },
  // Group E
  { id: 't17', name: 'اسپانیا', shortCode: 'ESP', logo: '🇪🇸', groupName: 'گروه E' },
  { id: 't18', name: 'کاستاریکا', shortCode: 'CRC', logo: '🇨🇷', groupName: 'گروه E' },
  { id: 't19', name: 'آلمان', shortCode: 'GER', logo: '🇩🇪', groupName: 'گروه E' },
  { id: 't20', name: 'ژاپن', shortCode: 'JPN', logo: '🇯🇵', groupName: 'گروه E' },
  // Group F
  { id: 't21', name: 'بلژیک', shortCode: 'BEL', logo: '🇧🇪', groupName: 'گروه F' },
  { id: 't22', name: 'کانادا', shortCode: 'CAN', logo: '🇨🇦', groupName: 'گروه F' },
  { id: 't23', name: 'مراکش', shortCode: 'MAR', logo: '🇲🇦', groupName: 'گروه F' },
  { id: 't24', name: 'کرواسی', shortCode: 'CRO', logo: '🇭🇷', groupName: 'گروه F' },
  // Group G
  { id: 't25', name: 'برزیل', shortCode: 'BRA', logo: '🇧🇷', groupName: 'گروه G' },
  { id: 't26', name: 'صربستان', shortCode: 'SRB', logo: '🇷🇸', groupName: 'گروه G' },
  { id: 't27', name: 'سوئیس', shortCode: 'SUI', logo: '🇨🇭', groupName: 'گروه G' },
  { id: 't28', name: 'کامرون', shortCode: 'CMR', logo: '🇨🇲', groupName: 'گروه G' },
  // Group H
  { id: 't29', name: 'پرتغال', shortCode: 'POR', logo: '🇵🇹', groupName: 'گروه H' },
  { id: 't30', name: 'غنا', shortCode: 'GHA', logo: '🇬🇭', groupName: 'گروه H' },
  { id: 't31', name: 'اروگوئه', shortCode: 'URU', logo: '🇺🇾', groupName: 'گروه H' },
  { id: 't32', name: 'کره جنوبی', shortCode: 'KOR', logo: '🇰🇷', groupName: 'گروه H' }
];

export function getTeamFlag(teamId: string): string {
  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.logo : '⚽';
}

export function getTeamName(teamId: string): string {
  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.name : 'Unknown';
}

export function getTeamCode(teamId: string): string {
  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.shortCode : 'UNK';
}
