import React from 'react';
import { Match, MatchStatus } from '../types';
import { getTeamFlag, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import { GitCommit, Trophy, HelpCircle, RefreshCw } from 'lucide-react';

interface KnockoutBracketProps {
  matches: Match[];
}

export default function KnockoutBracket({ matches }: KnockoutBracketProps) {
  // Get specific matches by ID
  const m12 = matches.find(m => m.id === 'm12');
  const m13 = matches.find(m => m.id === 'm13');
  const m14 = matches.find(m => m.id === 'm14');
  const m15 = matches.find(m => m.id === 'm15');
  const m16 = matches.find(m => m.id === 'm16');

  // Helper to resolve team details, handling TBD codes elegantly in Farsi
  const resolveTeam = (teamId: string) => {
    if (!teamId) {
      return { name: 'نامشخص', flag: null, isPlaceholder: true };
    }

    if (teamId.startsWith('TBD_')) {
      const mappings: Record<string, string> = {
        TBD_1A: 'تیم اول گروه A',
        TBD_2B: 'تیم دوم گروه B',
        TBD_1C: 'تیم اول گروه C',
        TBD_2D: 'تیم دوم گروه D',
        TBD_2F: 'تیم دوم گروه F',
        TBD_1G: 'تیم اول گروه G',
        TBD_1D: 'تیم اول گروه D',
        TBD_WM13: 'برنده بازی م.۱۳',
        TBD_WM14: 'برنده بازی م.۱۴',
        TBD_WM15: 'برنده بازی م.۱۵'
      };
      return { 
        name: mappings[teamId] || `تیم منتخب (${teamId})`, 
        flag: null, 
        isPlaceholder: true 
      };
    }

    return { 
      name: getTeamName(teamId), 
      flag: getTeamFlag(teamId), 
      isPlaceholder: false 
    };
  };

  const renderMatchCard = (match: Match | undefined, label: string) => {
    if (!match) return null;

    const home = resolveTeam(match.homeTeamId);
    const away = resolveTeam(match.awayTeamId);

    const isLive = match.status === MatchStatus.LIVE;
    const isFinished = match.status === MatchStatus.FINISHED;
    
    // Determine winner style
    const showScores = match.homeScore !== null && match.awayScore !== null;
    const homeWon = showScores && isFinished && (match.homeScore! > match.awayScore!);
    const awayWon = showScores && isFinished && (match.awayScore! > match.homeScore!);

    return (
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/20 transition-all shadow-lg space-y-3 relative group overflow-hidden">
        {/* Spotlight pulse on live or finished match */}
        {isLive && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 animate-pulse" />
        )}
        {isFinished && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20" />
        )}

        {/* Head/Label section */}
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-extrabold uppercase text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-850">
            {label}
          </span>
          <div className="flex items-center gap-1">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-rose-450 font-bold font-sans">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                در حال برگزاری
              </span>
            ) : isFinished ? (
              <span className="text-emerald-400 font-bold">پایان یافته</span>
            ) : (
              <span className="font-mono text-[9px] text-slate-500">آینده</span>
            )}
          </div>
        </div>

        {/* Home Team Row */}
        <div className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-all ${
          homeWon ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2 max-w-[150px] sm:max-w-none">
            {home.isPlaceholder ? (
              <div className="h-4 w-6 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500 font-black">؟</div>
            ) : (
              <FlagIcon teamIdOrCode={match.homeTeamId} className="h-4 w-6 rounded shadow-sm shrink-0" />
            )}
            <span className={`text-xs font-semibold truncate ${home.isPlaceholder ? 'text-slate-500 font-medium' : ''}`}>
              {home.name}
            </span>
          </div>
          {showScores ? (
            <span className={`font-mono text-sm font-black ${homeWon ? 'text-emerald-400' : 'text-slate-500'}`}>
              {match.homeScore}
            </span>
          ) : (
            <span className="text-[10px] text-slate-600 font-mono">-</span>
          )}
        </div>

        {/* Away Team Row */}
        <div className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-all ${
          awayWon ? 'bg-emerald-950/20 text-emerald-450 border border-emerald-555/10' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2 max-w-[150px] sm:max-w-none">
            {away.isPlaceholder ? (
              <div className="h-4 w-6 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500 font-black">؟</div>
            ) : (
              <FlagIcon teamIdOrCode={match.awayTeamId} className="h-4 w-6 rounded shadow-sm shrink-0" />
            )}
            <span className={`text-xs font-semibold truncate ${away.isPlaceholder ? 'text-slate-500 font-medium' : ''}`}>
              {away.name}
            </span>
          </div>
          {showScores ? (
            <span className={`font-mono text-sm font-black ${awayWon ? 'text-emerald-400' : 'text-slate-500'}`}>
              {match.awayScore}
            </span>
          ) : (
            <span className="text-[10px] text-slate-600 font-mono">-</span>
          )}
        </div>

        {/* Card bottom info */}
        <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono border-t border-slate-850 pt-2 px-1">
          <span>{match.stadium}</span>
          <span>{new Date(match.kickoffTimeUtc).toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Title Header Row */}
      <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-800/85 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="h-5.5 w-5.5 text-amber-500" />
            نمودار درختی مسابقات حذفی جام جهانی ۲۰۲۶
          </h2>
          <p className="text-xs text-slate-400">
            محل قرارگیری و صعود تیم‌ها به صورت کاملاً اتوماتیک با مشخص شدن نتایج مرحله گروهی و مراحل حذفی بروزرسانی می‌شود!
          </p>
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold font-sans">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
          <span>بروزرسانی رخدادی هوشمند</span>
        </div>
      </div>

      {/* Main Bracket Layout: Responsive grid flex stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start relative select-none">
        
        {/* Column 1: Round of 16 (یک‌هشتم نهایی) */}
        <div className="space-y-6 lg:min-h-[500px] flex flex-col justify-around">
          <div className="text-center font-bold text-slate-400 pb-2 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5">
            <GitCommit className="h-4.5 w-4.5 text-emerald-500" />
            <span>یک‌هشتم نهایی (صعودی اتوماتیک)</span>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              {renderMatchCard(m12, 'بازی ۱۲')}
              <div className="hidden lg:block absolute left-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
            </div>
            
            <div className="relative">
              {renderMatchCard(m13, 'بازی ۱۳')}
              <div className="hidden lg:block absolute left-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
            </div>
          </div>
        </div>

        {/* Column 2: Quarter Finals (یک‌چهارم نهایی) */}
        <div className="space-y-6 lg:min-h-[500px] flex flex-col justify-around">
          <div className="text-center font-bold text-slate-400 pb-2 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5">
            <GitCommit className="h-4.5 w-4.5 text-emerald-500" />
            <span>یک‌چهارم نهایی</span>
          </div>

          <div className="relative">
            {renderMatchCard(m14, 'بازی ۱۴')}
            {/* Connection bars on Desktop layouts */}
            <div className="hidden lg:block absolute right-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
            <div className="hidden lg:block absolute left-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
          </div>
        </div>

        {/* Column 3: Semi Finals (نیمه‌نهایی) */}
        <div className="space-y-6 lg:min-h-[500px] flex flex-col justify-around">
          <div className="text-center font-bold text-slate-400 pb-2 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5">
            <GitCommit className="h-4.5 w-4.5 text-emerald-500" />
            <span>نیمه‌نهایی</span>
          </div>

          <div className="relative">
            {renderMatchCard(m15, 'بازی ۱۵')}
            {/* Connection bars */}
            <div className="hidden lg:block absolute right-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
            <div className="hidden lg:block absolute left-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
          </div>
        </div>

        {/* Column 4: The Final Big Spotlight (فینال قهرمانی) */}
        <div className="space-y-6 lg:min-h-[500px] flex flex-col justify-around">
          <div className="text-center font-bold text-slate-400 pb-2 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5">
            <Trophy className="h-4.5 w-4.5 text-amber-500" />
            <span>فینال قهرمانی</span>
          </div>

          <div className="relative bg-gradient-to-br from-amber-500/10 via-slate-950 to-emerald-500/10 p-1.5 rounded-3xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
            {renderMatchCard(m16, 'بازی نهایی • فینال')}
            <div className="hidden lg:block absolute right-[-13px] top-1/2 -translate-y-1/2 w-[13px] h-[2px] bg-slate-850" />
          </div>
        </div>

      </div>

      {/* Descriptive placeholder legends info bar */}
      <div className="bg-slate-900/10 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-start gap-2">
          <span className="p-1 px-2 bg-slate-900 rounded font-black text-[10px] text-amber-500 border border-slate-800">راهنما</span>
          <p className="leading-5">
            تیم‌های با پیشوند <span className="text-slate-450 text-[10px] bg-slate-950 px-1 py-0.5 rounded">؟</span> نشان از قرارگیری متغیرهای صعود دارند. با خاتمه بازی‌های هر گروه در دور مقدماتی، جایگاه تیم‌های برآمده خودکار با هویت واقعی کشورها همسان می‌گردد.
          </p>
        </div>
      </div>

    </div>
  );
}
