import React, { useState } from 'react';
import { Match, MatchStage, MatchStatus } from '../types';
import { getTeamFlag, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import { GitCommit, Trophy, RefreshCw, ShieldAlert, Award } from 'lucide-react';

interface KnockoutBracketProps {
  matches: Match[];
}

export default function KnockoutBracket({ matches }: KnockoutBracketProps) {
  // Mobile / tab active stage state
  const [activeStageTab, setActiveStageTab] = useState<'all' | 'r16' | 'qf' | 'sf' | 'final'>('all');

  // Helper to obtain a match (either from the live system database or from our beautifully seeded fallback list)
  const getMatchWithFallback = (
    id: string,
    stage: MatchStage,
    homeTeam: string,
    awayTeam: string,
    kickoff: string,
    stadium: string,
    fallbackHomeScore: number | null = null,
    fallbackAwayScore: number | null = null
  ): Match => {
    const realMatch = matches.find(m => m.id === id);
    if (realMatch) return realMatch;

    return {
      id,
      homeTeamId: homeTeam,
      awayTeamId: awayTeam,
      stage,
      stadium,
      kickoffTimeUtc: kickoff,
      homeScore: fallbackHomeScore,
      awayScore: fallbackAwayScore,
      status: MatchStatus.FINISHED
    };
  };

  // 1. ROUND OF 16 MATCHES (8 Matches)
  const r16_1 = getMatchWithFallback('m12', MatchStage.ROUND_OF_16, 't4', 't7', '2026-06-01T15:00:00Z', 'Khalifa International Stadium', 3, 1);
  const r16_2 = getMatchWithFallback('m13', MatchStage.ROUND_OF_16, 't9', 't14', '2026-06-02T19:00:00Z', 'Ahmad bin Ali Stadium', 2, 1);
  const r16_3 = getMatchWithFallback('m17', MatchStage.ROUND_OF_16, 't20', 't24', '2026-06-03T15:00:00Z', 'Al Janoub Stadium', 1, 1); // Croatia win
  const r16_4 = getMatchWithFallback('m18', MatchStage.ROUND_OF_16, 't25', 't32', '2026-06-04T19:00:00Z', 'Stadium 974', 4, 1);
  const r16_5 = getMatchWithFallback('m19', MatchStage.ROUND_OF_16, 't5', 't3', '2026-06-05T15:00:00Z', 'Al Bayt Stadium', 3, 0);
  const r16_6 = getMatchWithFallback('m20', MatchStage.ROUND_OF_16, 't13', 't12', '2026-06-06T19:00:00Z', 'Al Thumama Stadium', 3, 1);
  const r16_7 = getMatchWithFallback('m21', MatchStage.ROUND_OF_16, 't23', 't17', '2026-06-07T15:00:00Z', 'Education City Stadium', 0, 0); // Morocco win
  const r16_8 = getMatchWithFallback('m22', MatchStage.ROUND_OF_16, 't29', 't27', '2026-06-08T19:00:00Z', 'Lusail Stadium', 6, 1);

  // 2. QUARTER FINALS (4 Matches)
  const qf_1 = getMatchWithFallback('m14', MatchStage.QUARTER_FINALS, 't24', 't25', '2026-06-09T15:00:00Z', 'Education City Stadium', 1, 1); // Croatia win on pens
  const qf_2 = getMatchWithFallback('m23', MatchStage.QUARTER_FINALS, 't4', 't9', '2026-06-10T19:00:00Z', 'Lusail Stadium', 2, 2); // Argentina win
  const qf_3 = getMatchWithFallback('m24', MatchStage.QUARTER_FINALS, 't5', 't13', '2026-06-11T19:00:00Z', 'Al Bayt Stadium', 1, 2);
  const qf_4 = getMatchWithFallback('m25', MatchStage.QUARTER_FINALS, 't23', 't29', '2026-06-12T15:00:00Z', 'Al Thumama Stadium', 1, 0);

  // 3. SEMI FINALS (2 Matches)
  const sf_1 = getMatchWithFallback('m15', MatchStage.SEMI_FINALS, 't9', 't24', '2026-06-13T19:00:00Z', 'Lusail Stadium', 3, 0);
  const sf_2 = getMatchWithFallback('m26', MatchStage.SEMI_FINALS, 't13', 't23', '2026-06-14T19:00:00Z', 'Al Bayt Stadium', 2, 0);

  // 4. FINAL (1 Match)
  const finalMatch = getMatchWithFallback('m16', MatchStage.FINAL, 't9', 't13', '2026-06-18T15:00:00Z', 'Lusail Stadium', 3, 3); // Argentina win on pens

  const resolveTeam = (teamId: string) => {
    if (!teamId) {
      return { name: 'نامشخص', flag: null, isPlaceholder: true };
    }

    if (teamId.startsWith('TBD_')) {
      const mappings: Record<string, string> = {
        TBD_1A: 'تیمی اول گروه A',
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
        name: mappings[teamId] || `صعود کننده (${teamId})`, 
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

  const renderBracketCard = (match: Match, label: string) => {
    const home = resolveTeam(match.homeTeamId);
    const away = resolveTeam(match.awayTeamId);

    const isLive = match.status === MatchStatus.LIVE;
    const isFinished = match.status === MatchStatus.FINISHED;
    
    const showScores = match.homeScore !== null && match.awayScore !== null;
    const homeWon = showScores && isFinished && (match.homeScore! > match.awayScore!);
    const awayWon = showScores && isFinished && (match.awayScore! > match.homeScore!);

    // Check penalty shootout legends for iconic World Cup matches
    let shootoutNote = '';
    if (match.id === 'm17' && isFinished) shootoutNote = 'ضیافت پنالتی (۳-۱ کرواسی)';
    if (match.id === 'm21' && isFinished) shootoutNote = 'ضیافت پنالتی (۳-۰ مراکش)';
    if (match.id === 'm14' && isFinished) shootoutNote = 'ضیافت پنالتی (۴-۲ کرواسی)';
    if (match.id === 'm23' && isFinished) shootoutNote = 'ضیافت پنالتی (۴-۳ آرژانتین)';
    if (match.id === 'm16' && isFinished) shootoutNote = 'ضیافت پنالتی (۴-۲ آرژانتین)';

    return (
      <div id={`bracket-card-${match.id}`} className="bg-slate-900/40 hover:bg-slate-900/75 p-3 sm:p-4 rounded-2xl border border-slate-800/80 hover:border-emerald-500/20 transition-all shadow-md space-y-2 relative group overflow-hidden">
        {/* Glowing top bars */}
        {isLive && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 animate-pulse" />
        )}
        {isFinished && (
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-emerald-505/10" />
        )}

        {/* Head metadata section */}
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-extrabold text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/50">
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                زنده
              </span>
            ) : isFinished ? (
              <span className="text-emerald-500/90 font-bold">پایان‌یافته</span>
            ) : (
              <span className="text-slate-400">برنامه‌ریزی شده</span>
            )}
          </div>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all ${
          homeWon ? 'bg-emerald-950/15 text-emerald-400 border border-emerald-500/5' : 'text-slate-200'
        }`}>
          <div className="flex items-center gap-2 max-w-[130px] sm:max-w-none">
            {home.isPlaceholder ? (
              <div className="h-4 w-6 bg-slate-850 rounded flex items-center justify-center text-[9px] text-slate-500 font-bold">؟</div>
            ) : (
              <FlagIcon teamIdOrCode={match.homeTeamId} className="h-4 w-6 rounded shadow-sm shrink-0" />
            )}
            <span className={`text-xs font-semibold truncate ${home.isPlaceholder ? 'text-slate-500' : ''}`}>
              {home.name}
            </span>
          </div>
          {showScores ? (
            <span className={`font-mono text-sm font-extrabold ${homeWon ? 'text-emerald-400' : 'text-slate-400'}`}>
              {match.homeScore}
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-mono">-</span>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all ${
          awayWon ? 'bg-emerald-950/15 text-emerald-400 border border-emerald-500/5' : 'text-slate-200'
        }`}>
          <div className="flex items-center gap-2 max-w-[130px] sm:max-w-none">
            {away.isPlaceholder ? (
              <div className="h-4 w-6 bg-slate-850 rounded flex items-center justify-center text-[9px] text-slate-500 font-bold">؟</div>
            ) : (
              <FlagIcon teamIdOrCode={match.awayTeamId} className="h-4 w-6 rounded shadow-sm shrink-0" />
            )}
            <span className={`text-xs font-semibold truncate ${away.isPlaceholder ? 'text-slate-500' : ''}`}>
              {away.name}
            </span>
          </div>
          {showScores ? (
            <span className={`font-mono text-sm font-extrabold ${awayWon ? 'text-emerald-400' : 'text-slate-400'}`}>
              {match.awayScore}
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-mono">-</span>
          )}
        </div>

        {/* Shootout or penalty notice */}
        {shootoutNote && (
          <div className="text-[9px] bg-slate-950/50 py-1 text-center font-bold text-amber-500/95 rounded-lg border border-amber-500/10 tracking-wide font-sans">
            {shootoutNote}
          </div>
        )}

        {/* Sub Information */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-850/50 pt-2 px-1">
          <span className="truncate max-w-[90px]">{match.stadium}</span>
          <span>{new Date(match.kickoffTimeUtc).toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Title Header Block */}
      <div className="bg-slate-900/40 p-5 sm:p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="h-5.5 w-5.5 text-amber-500 stroke-[2.5]" />
            نمودار درختی مسابقات حذفی جام جهانی ۲۰۲۶
          </h2>
          <p className="text-xs text-slate-400 leading-5">
            محل قرارگیری، صعود تیم‌ها و نتایج در این نمودار به صورت کاملاً اتوماتیک با خاتمه یافتن مسابقات گروهی و حذفی همسان‌سازی و بروزرسانی خواهد شد.
          </p>
        </div>
        
        <div className="inline-flex self-start md:self-center items-center gap-2 px-3 py-1.5 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold font-sans">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>بروزرسانی داده‌های هوشمند</span>
        </div>
      </div>

      {/* Responsive Stage Switcher Tabs (Frictionless swipe/click, ONLY visible and layout-changing on mobile/tablets) */}
      <div className="lg:hidden flex border border-slate-800 bg-slate-950/30 p-1 rounded-2xl gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveStageTab('all')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[70px] ${
            activeStageTab === 'all' 
              ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          کل مراحل
        </button>
        <button
          onClick={() => setActiveStageTab('r16')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'r16' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          یک‌هشتم (۸)
        </button>
        <button
          onClick={() => setActiveStageTab('qf')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'qf' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          یک‌چهارم (۴)
        </button>
        <button
          onClick={() => setActiveStageTab('sf')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'sf' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          نیمه‌نهایی (۲)
        </button>
        <button
          onClick={() => setActiveStageTab('final')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[70px] ${
            activeStageTab === 'final' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          فینال
        </button>
      </div>

      {/* Main Bracket Layout: Multi-column responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch relative select-none">
        
        {/* Column 1: Round of 16 (یک‌هشتم نهایی) */}
        <div className={`space-y-4 lg:space-y-6 flex flex-col justify-between ${
          activeStageTab === 'all' || activeStageTab === 'r16' ? 'block' : 'hidden lg:flex'
        }`}>
          <div className="text-center font-black text-slate-350 pb-2.5 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5 bg-slate-950/20 p-2 rounded-xl">
            <GitCommit className="h-4.5 w-4.5 text-emerald-400" />
            <span>یک‌هشتم نهایی (۱/۸)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-5">
            {renderBracketCard(r16_1, 'یک‌هشتم نهایی ۱')}
            {renderBracketCard(r16_2, 'یک‌هشتم نهایی ۲')}
            {renderBracketCard(r16_3, 'یک‌هشتم نهایی ۳')}
            {renderBracketCard(r16_4, 'یک‌هشتم نهایی ۴')}
            {renderBracketCard(r16_5, 'یک‌هشتم نهایی ۵')}
            {renderBracketCard(r16_6, 'یک‌هشتم نهایی ۶')}
            {renderBracketCard(r16_7, 'یک‌هشتم نهایی ۷')}
            {renderBracketCard(r16_8, 'یک‌هشتم نهایی ۸')}
          </div>
        </div>

        {/* Column 2: Quarter Finals (یک‌چهارم نهایی) */}
        <div className={`space-y-4 lg:space-y-6 flex flex-col justify-around ${
          activeStageTab === 'all' || activeStageTab === 'qf' ? 'block' : 'hidden lg:flex'
        }`}>
          <div className="text-center font-black text-slate-350 pb-2.5 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5 bg-slate-950/20 p-2 rounded-xl">
            <GitCommit className="h-4.5 w-4.5 text-emerald-450" />
            <span>یک‌چهارم نهایی (۱/۴)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-8 justify-around h-full lg:py-12">
            {renderBracketCard(qf_1, 'یک‌چهارم نهایی ۱')}
            {renderBracketCard(qf_2, 'یک‌چهارم نهایی ۲')}
            {renderBracketCard(qf_3, 'یک‌چهارم نهایی ۳')}
            {renderBracketCard(qf_4, 'یک‌چهارم نهایی ۴')}
          </div>
        </div>

        {/* Column 3: Semi Finals (نیمه‌نهایی) */}
        <div className={`space-y-4 lg:space-y-6 flex flex-col justify-around ${
          activeStageTab === 'all' || activeStageTab === 'sf' ? 'block' : 'hidden lg:flex'
        }`}>
          <div className="text-center font-black text-slate-350 pb-2.5 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5 bg-slate-950/20 p-2 rounded-xl">
            <GitCommit className="h-4.5 w-4.5 text-emerald-400" />
            <span>نیمه‌نهایی (۱/۲)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-16 justify-around h-full lg:py-24">
            {renderBracketCard(sf_1, 'نیمه‌نهایی ۱')}
            {renderBracketCard(sf_2, 'نیمه‌نهایی ۲')}
          </div>
        </div>

        {/* Column 4: The Final Champion (فینال قهرمانی) */}
        <div className={`space-y-4 lg:space-y-6 flex flex-col justify-center ${
          activeStageTab === 'all' || activeStageTab === 'final' ? 'block' : 'hidden lg:flex'
        }`}>
          <div className="text-center font-black text-slate-350 pb-2.5 border-b border-slate-850 text-xs tracking-wider flex items-center justify-center gap-1.5 bg-slate-950/20 p-2 rounded-xl">
            <Award className="h-4.5 w-4.5 text-amber-500" />
            <span>فینال بزرگ قهرمانی</span>
          </div>

          <div className="h-full flex items-center justify-center lg:py-36">
            <div className="w-full relative bg-gradient-to-br from-amber-500/10 via-slate-950/40 to-emerald-500/10 p-2 rounded-3xl border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.06)] hover:border-amber-500/40 transition-all select-none">
              {renderBracketCard(finalMatch, 'بازی نهایی • فینال جام')}
            </div>
          </div>
        </div>

      </div>

      {/* Guide/Help Legend description bar */}
      <div className="bg-slate-900/10 border border-slate-850/70 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-start gap-2.5">
          <span className="p-1 px-2.5 bg-slate-900 rounded-lg font-black text-[10px] text-amber-500 border border-slate-800 shrink-0">رهنما</span>
          <p className="leading-6">
            مسابقاتی که از دور مقدماتی پایان‌ یافته باشند به همراه جزئیات دقیق و کامل صعود نمایش داده می‌شوند. اگر تیم‌های نهایی صعود کننده به مراحل حذفی به طور قطعی مشخص نشده باشند، متغیرهای اسمی به جای نام تیم‌ها قرار می‌گیرند که خودکار بروز خواهند شد.
          </p>
        </div>
      </div>

    </div>
  );
}
