import { Team } from '../types';

export const teamsSeed: Team[] = [
  // Group A
  { id: 't-mex', name: 'مکزیک', shortCode: 'MEX', logo: '🇲🇽', groupName: 'گروه A' },
  { id: 't-rsa', name: 'آفریقای جنوبی', shortCode: 'RSA', logo: '🇿🇦', groupName: 'گروه A' },
  { id: 't-kor', name: 'کره جنوبی', shortCode: 'KOR', logo: '🇰🇷', groupName: 'گروه A' },
  { id: 't-cze', name: 'جمهوری چک', shortCode: 'CZE', logo: '🇨🇿', groupName: 'گروه A' },

  // Group B
  { id: 't-can', name: 'کانادا', shortCode: 'CAN', logo: '🇨🇦', groupName: 'گروه B' },
  { id: 't-bih', name: 'بوسنی و هرزگوین', shortCode: 'BIH', logo: '🇧🇦', groupName: 'گروه B' },
  { id: 't-qat', name: 'قطر', shortCode: 'QAT', logo: '🇶🇦', groupName: 'گروه B' },
  { id: 't-sui', name: 'سوئیس', shortCode: 'SUI', logo: '🇨🇭', groupName: 'گروه B' },

  // Group C
  { id: 't-bra', name: 'برزیل', shortCode: 'BRA', logo: '🇧🇷', groupName: 'گروه C' },
  { id: 't-mar', name: 'مراکش', shortCode: 'MAR', logo: '🇲🇦', groupName: 'گروه C' },
  { id: 't-hai', name: 'هائیتی', shortCode: 'HAI', logo: '🇭🇹', groupName: 'گروه C' },
  { id: 't-sco', name: 'اسکاتلند', shortCode: 'SCO', logo: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', groupName: 'گروه C' },

  // Group D
  { id: 't-usa', name: 'آمریکا', shortCode: 'USA', logo: '🇺🇸', groupName: 'گروه D' },
  { id: 't-par', name: 'پاراگوئه', shortCode: 'PAR', logo: '🇵🇾', groupName: 'گروه D' },
  { id: 't-aus', name: 'استرالیا', shortCode: 'AUS', logo: '🇦🇺', groupName: 'گروه D' },
  { id: 't-tur', name: 'ترکیه', shortCode: 'TUR', logo: '🇹🇷', groupName: 'گروه D' },

  // Group E
  { id: 't-ger', name: 'آلمان', shortCode: 'GER', logo: '🇩🇪', groupName: 'گروه E' },
  { id: 't-cuw', name: 'کوراسائو', shortCode: 'CUW', logo: '🇨🇼', groupName: 'گروه E' },
  { id: 't-civ', name: 'ساحل عاج', shortCode: 'CIV', logo: '🇨🇮', groupName: 'گروه E' },
  { id: 't-ecu', name: 'اکوادور', shortCode: 'ECU', logo: '🇪🇨', groupName: 'گروه E' },

  // Group F
  { id: 't-ned', name: 'هلند', shortCode: 'NED', logo: '🇳🇱', groupName: 'گروه F' },
  { id: 't-jpn', name: 'ژاپن', shortCode: 'JPN', logo: '🇯🇵', groupName: 'گروه F' },
  { id: 't-swe', name: 'سوئد', shortCode: 'SWE', logo: '🇸🇪', groupName: 'گروه F' },
  { id: 't-tun', name: 'تونس', shortCode: 'TUN', logo: '🇹🇳', groupName: 'گروه F' },

  // Group G
  { id: 't-bel', name: 'بلژیک', shortCode: 'BEL', logo: '🇧🇪', groupName: 'گروه G' },
  { id: 't-egy', name: 'مصر', shortCode: 'EGY', logo: '🇪🇬', groupName: 'گروه G' },
  { id: 't-irn', name: 'ایران', shortCode: 'IRN', logo: '🇮🇷', groupName: 'گروه G' },
  { id: 't-nzl', name: 'نیوزیلند', shortCode: 'NZL', logo: '🇳🇿', groupName: 'گروه G' },

  // Group H
  { id: 't-esp', name: 'اسپانیا', shortCode: 'ESP', logo: '🇪🇸', groupName: 'گروه H' },
  { id: 't-cpv', name: 'کیپ ورد', shortCode: 'CPV', logo: '🇨🇻', groupName: 'گروه H' },
  { id: 't-uru', name: 'اروگوئه', shortCode: 'URU', logo: '🇺🇾', groupName: 'گروه H' },
  { id: 't-ksa', name: 'عربستان سعودی', shortCode: 'KSA', logo: '🇸🇦', groupName: 'گروه H' },

  // Group I
  { id: 't-fra', name: 'فرانسه', shortCode: 'FRA', logo: '🇫🇷', groupName: 'گروه I' },
  { id: 't-sen', name: 'سنگال', shortCode: 'SEN', logo: '🇸🇳', groupName: 'گروه I' },
  { id: 't-irq', name: 'عراق', shortCode: 'IRQ', logo: '🇮🇶', groupName: 'گروه I' },
  { id: 't-nor', name: 'نروژ', shortCode: 'NOR', logo: '🇳🇴', groupName: 'گروه I' },

  // Group J
  { id: 't-arg', name: 'آرژانتین', shortCode: 'ARG', logo: '🇦🇷', groupName: 'گروه J' },
  { id: 't-alg', name: 'الجزایر', shortCode: 'ALG', logo: '🇩🇿', groupName: 'گروه J' },
  { id: 't-aut', name: 'اتریش', shortCode: 'AUT', logo: '🇦🇹', groupName: 'گروه J' },
  { id: 't-jor', name: 'اردن', shortCode: 'JOR', logo: '🇯🇴', groupName: 'گروه J' },

  // Group K
  { id: 't-por', name: 'پرتغال', shortCode: 'POR', logo: '🇵🇹', groupName: 'گروه K' },
  { id: 't-cod', name: 'کنگو', shortCode: 'COD', logo: '🇨🇩', groupName: 'گروه K' },
  { id: 't-uzb', name: 'ازبکستان', shortCode: 'UZB', logo: '🇺🇿', groupName: 'گروه K' },
  { id: 't-col', name: 'کلمبیا', shortCode: 'COL', logo: '🇨🇴', groupName: 'گروه K' },

  // Group L
  { id: 't-eng', name: 'انگلستان', shortCode: 'ENG', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupName: 'گروه L' },
  { id: 't-cro', name: 'کرواسی', shortCode: 'CRO', logo: '🇭🇷', groupName: 'گروه L' },
  { id: 't-gha', name: 'غنا', shortCode: 'GHA', logo: '🇬🇭', groupName: 'گروه L' },
  { id: 't-pan', name: 'پاناما', shortCode: 'PAN', logo: '🇵🇦', groupName: 'گروه L' }
];

export function getTeamFlag(teamId: string): string {
  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.logo : '⚽';
}

export function getTeamName(teamId: string): string {
  if (!teamId) return 'نامشخص';
  if (teamId.startsWith('TBD_')) {
    // 1. Group winners / runner-ups / third: TBD_1A, TBD_2B, TBD_3C, etc.
    const groupMatch = teamId.match(/^TBD_([123])([A-L])$/);
    if (groupMatch) {
      const position = groupMatch[1];
      const groupLetter = groupMatch[2];
      const posWords: Record<string, string> = { '1': 'اول', '2': 'دوم', '3': 'سوم' };
      return `تیم ${posWords[position] || position} گروه ${groupLetter}`;
    }

    // 2. Best 3rd place teams: TBD_3CDE_1, TBD_3ABF_1, TBD_3GHI_1, TBD_3JKL_1, etc.
    if (teamId.includes('3')) {
      const clean = teamId.replace('TBD_3', '').replace('_1', '');
      return `بهترین رده‌سوم ${clean.split('').join('/')}`;
    }

    // 3. Winner of Match: TBD_WM73 -> Winner of m73
    const wmMatch = teamId.match(/^TBD_WM(\d+)$/);
    if (wmMatch) {
      const matchNum = wmMatch[1];
      return `برنده بازی ${matchNum}`;
    }

    // 4. Loser of Match: TBD_LM101 -> Loser of m101
    const lmMatch = teamId.match(/^TBD_LM(\d+)$/);
    if (lmMatch) {
      const matchNum = lmMatch[1];
      return `بازنده بازی ${matchNum}`;
    }

    // Default TBD fallback
    return `تیم نامشخص (${teamId.replace('TBD_', '')})`;
  }

  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.name : teamId;
}

export function getTeamCode(teamId: string): string {
  if (!teamId) return 'UNK';
  if (teamId.startsWith('TBD_')) {
    return teamId.replace('TBD_', '');
  }
  const team = teamsSeed.find(t => t.id === teamId);
  return team ? team.shortCode : teamId;
}
