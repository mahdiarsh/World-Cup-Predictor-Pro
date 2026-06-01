import React, { useState } from 'react';
import { Match, MatchStage, MatchStatus } from '../types';
import { getTeamFlag, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import { GitCommit, Trophy, RefreshCw, Award, Landmark } from 'lucide-react';

interface KnockoutBracketProps {
  matches: Match[];
}

export default function KnockoutBracket({ matches }: KnockoutBracketProps) {
  // Mobile/desktop active stage tab state
  const [activeStageTab, setActiveStageTab] = useState<'all' | 'r32' | 'r16' | 'qf' | 'sf_final'>('all');

  // Resolve team IDs - including TBD dynamically
  const resolveTeam = (teamId: string) => {
    if (!teamId) {
      return { name: 'نامشخص', flag: null, isPlaceholder: true };
    }

    if (teamId.startsWith('TBD_')) {
      const mappings: Record<string, string> = {
        TBD_1A: 'اول گروه A', TBD_2A: 'دوم گروه A',
        TBD_1B: 'اول گروه B', TBD_2B: 'دوم گروه B',
        TBD_1C: 'اول گروه C', TBD_2C: 'دوم گروه C',
        TBD_1D: 'اول گروه D', TBD_2D: 'دوم گروه D',
        TBD_1E: 'اول گروه E', TBD_2E: 'دوم گروه E',
        TBD_1F: 'اول گروه F', TBD_2F: 'دوم گروه F',
        TBD_1G: 'اول گروه G', TBD_2G: 'دوم گروه G',
        TBD_1H: 'اول گروه H', TBD_2H: 'دوم گروه H',
        TBD_1I: 'اول گروه I', TBD_2I: 'دوم گروه I',
        TBD_1J: 'اول گروه J', TBD_2J: 'دوم گروه J',
        TBD_1K: 'اول گروه K', TBD_2K: 'دوم گروه K',
        TBD_1L: 'اول گروه L', TBD_2L: 'دوم گروه L',
        TBD_3CDE_1: 'بهترین رده‌سوم C/D/E',
        TBD_3ABF_1: 'بهترین رده‌سوم A/B/F',
        TBD_3GHI_1: 'بهترین رده‌سوم G/H/I',
        TBD_3JKL_1: 'بهترین رده‌سوم J/K/L',
      };

      if (teamId.startsWith('TBD_3RD_')) {
        const num = teamId.replace('TBD_3RD_', '');
        const farsiNumbers: Record<string, string> = {
          '1': 'اول', '2': 'دوم', '3': 'سوم', '4': 'چهارم',
          '5': 'پنجم', '6': 'ششم', '7': 'هفتم', '8': 'هشتم'
        };
        return { name: `تیم ${farsiNumbers[num] || num} سوم‌های برتر`, flag: null, isPlaceholder: true };
      }

      if (mappings[teamId]) {
        return { name: mappings[teamId], flag: null, isPlaceholder: true };
      }

      if (teamId.startsWith('TBD_WM')) {
        const matchNum = teamId.replace('TBD_WM', 'م.');
        return { name: `برنده بازی ${matchNum}`, flag: null, isPlaceholder: true };
      }

      if (teamId.startsWith('TBD_LM')) {
        const matchNum = teamId.replace('TBD_LM', 'م.');
        return { name: `بازنده بازی ${matchNum}`, flag: null, isPlaceholder: true };
      }

      return { name: 'نامشخص', flag: null, isPlaceholder: true };
    }

    return { 
      name: getTeamName(teamId), 
      flag: getTeamFlag(teamId), 
      isPlaceholder: false 
    };
  };

  // Extract matches dynamically by stage
  const r32Matches = matches.filter(m => m.stage === MatchStage.ROUND_OF_32);
  const r16Matches = matches.filter(m => m.stage === MatchStage.ROUND_OF_16);
  const qfMatches = matches.filter(m => m.stage === MatchStage.QUARTER_FINALS);
  const sfMatches = matches.filter(m => m.stage === MatchStage.SEMI_FINALS);
  const thirdPlaceMatch = matches.find(m => m.stage === MatchStage.THIRD_PLACE);
  const finalMatch = matches.find(m => m.stage === MatchStage.FINAL);

  const renderBracketCard = (match: Match, label: string) => {
    if (!match) return null;
    const home = resolveTeam(match.homeTeamId);
    const away = resolveTeam(match.awayTeamId);

    const isLive = match.status === MatchStatus.LIVE;
    const isFinished = match.status === MatchStatus.FINISHED;
    
    const showScores = match.homeScore !== null && match.awayScore !== null;
    const homeWon = showScores && isFinished && (match.homeScore! > match.awayScore!);
    const awayWon = showScores && isFinished && (match.awayScore! > match.homeScore!);

    return (
      <div 
        key={match.id}
        id={`bracket-card-${match.id}`} 
        className="bg-slate-900/40 hover:bg-slate-900/75 p-3 sm:p-4 rounded-2xl border border-slate-800/85 hover:border-emerald-500/20 transition-all shadow-md space-y-2 relative group overflow-hidden"
      >
        {isLive && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 animate-pulse" />
        )}
        {isFinished && (
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-emerald-500/10" />
        )}

        {/* Card Header Info */}
        <div className="flex items-center justify-between text-[9px] text-slate-500">
          <span className="font-extrabold px-2 py-0.5 bg-slate-950/80 rounded border border-slate-800/50 text-slate-300 font-sans">
            {label} · {match.id.toUpperCase()}
          </span>
          <div className="flex items-center gap-1">
            {isLive ? (
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="h-1 w-1 bg-rose-500 rounded-full animate-ping" />
                زنده
              </span>
            ) : isFinished ? (
              <span className="text-emerald-500/95 font-bold">پایان‌یافته</span>
            ) : (
              <span className="text-slate-500">برنامه‌ریزی شده</span>
            )}
          </div>
        </div>

        {/* Home Row */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all ${
          homeWon ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-550/10' : 'text-slate-200'
        }`}>
          <div className="flex items-center gap-2 max-w-[150px] truncate">
            {home.isPlaceholder ? (
              <span className="h-4 w-5 bg-slate-800/30 text-[9px] font-sans font-extrabold text-slate-500 rounded flex items-center justify-center">؟</span>
            ) : (
              <FlagIcon teamIdOrCode={match.homeTeamId} className="h-4 w-6 rounded shadow-sm shrink-0 font-sans" />
            )}
            <span className={`text-xs font-bold truncate ${home.isPlaceholder ? 'text-slate-500 font-normal' : ''}`}>
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

        {/* Away Row */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all ${
          awayWon ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-550/10' : 'text-slate-200'
        }`}>
          <div className="flex items-center gap-2 max-w-[150px] truncate">
            {away.isPlaceholder ? (
              <span className="h-4 w-5 bg-slate-800/30 text-[9px] font-sans font-extrabold text-slate-500 rounded flex items-center justify-center">؟</span>
            ) : (
              <FlagIcon teamIdOrCode={match.awayTeamId} className="h-4 w-6 rounded shadow-sm shrink-0 font-sans" />
            )}
            <span className={`text-xs font-bold truncate ${away.isPlaceholder ? 'text-slate-500 font-normal' : ''}`}>
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

        {/* Location & Persian Date */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-850/40 pt-2 px-1">
          <span className="truncate max-w-[130px] flex items-center gap-1">
            <Landmark className="h-3 w-3 text-slate-600" />
            {match.stadium.split(',')[0]}
          </span>
          <span>
            {new Date(match.kickoffTimeUtc).toLocaleDateString('fa-IR', { 
              timeZone: 'Asia/Tehran',
              month: 'numeric', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* Title Header Block */}
      <div className="bg-slate-900/40 p-5 sm:p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="h-5.5 w-5.5 text-amber-500 stroke-[2.5]" />
            نمودار درختی مسابقات حذفی جام جهانی ۲۰۲۶
          </h2>
          <p className="text-xs text-slate-405 leading-5">
            در این بخش می‌توانید مسیر صعود تیم‌ها از مرحله یک‌سی‌ودوم تا فینال بزرگ را رصد کنید. نتایج با ثبت نتایج بازی‌ها بصورت خودکار تکمیل می‌شوند.
          </p>
        </div>
        
        <div className="inline-flex self-start md:self-center items-center gap-2 px-4 py-1.5 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold font-sans">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>بروزرسانی داده‌های زنده</span>
        </div>
      </div>

      {/* Stage Switcher Tab Links */}
      <div className="flex border border-slate-800 bg-slate-950/30 p-1 rounded-2xl gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveStageTab('all')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[70px] ${
            activeStageTab === 'all' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          کل مراحل
        </button>
        <button
          onClick={() => setActiveStageTab('r32')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'r32' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          یک‌سی‌ودوم (۳۲ تیم)
        </button>
        <button
          onClick={() => setActiveStageTab('r16')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'r16' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          یک‌هشتم نهایی
        </button>
        <button
          onClick={() => setActiveStageTab('qf')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[90px] ${
            activeStageTab === 'qf' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          یک‌چهارم نهایی
        </button>
        <button
          onClick={() => setActiveStageTab('sf_final')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[120px] ${
            activeStageTab === 'sf_final' 
              ? 'bg-emerald-500 text-slate-950 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          نیمه‌نهایی و فینال
        </button>
      </div>

      {/* Grid Container */}
      <div className="space-y-8">
        
        {/* Row 1: ROUND OF 32 (1/32) */}
        {(activeStageTab === 'all' || activeStageTab === 'r32') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-slate-205">مسابقات مرحله یک‌شانزدهم نهایی (Round of 32)</h3>
              <span className="text-[10px] text-slate-500">۱۶ بازی حذفی آغازین</span>
            </div>
            {r32Matches.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-900/10 p-4 rounded-xl text-center">مسابقه‌ای برای این مرحله تعریف نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {r32Matches.map((m, idx) => renderBracketCard(m, `بازی حذفی ${idx + 1}`))}
              </div>
            )}
          </div>
        )}

        {/* Row 2: ROUND OF 16 (1/8) */}
        {(activeStageTab === 'all' || activeStageTab === 'r16') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-slate-205">یک‌هشتم نهایی (Round of 16)</h3>
              <span className="text-[10px] text-slate-500">۸ بازی حذفی</span>
            </div>
            {r16Matches.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-900/10 p-4 rounded-xl text-center">هنوز صعود کنندگان این مرحله برنامه‌ریزی نشده‌اند.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {r16Matches.map((m, idx) => renderBracketCard(m, `یک‌هشتم نهایی ${idx + 1}`))}
              </div>
            )}
          </div>
        )}

        {/* Row 3: QUARTER FINALS (1/4) */}
        {(activeStageTab === 'all' || activeStageTab === 'qf') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <span className="h-2 w-2 bg-teal-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-slate-205">یک‌چهارم نهایی (Quarter-finals)</h3>
              <span className="text-[10px] text-slate-500">۴ رقابت برتر</span>
            </div>
            {qfMatches.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-900/10 p-4 rounded-xl text-center">تکمیل بازی‌های قبل برای ترسیم این مرحله الزامی است.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {qfMatches.map((m, idx) => renderBracketCard(m, `یک‌چهارم نهایی ${idx + 1}`))}
              </div>
            )}
          </div>
        )}

        {/* Row 4: SEMI & FINAL & 3RD PLACE */}
        {(activeStageTab === 'all' || activeStageTab === 'sf_final') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Semi Finals */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                  <h4 className="text-xs font-bold text-slate-300">نیمه‌نهایی</h4>
                </div>
                <div className="space-y-4">
                  {sfMatches.map((m, idx) => renderBracketCard(m, `نیمه‌نهایی ${idx + 1}`))}
                  {sfMatches.length === 0 && <p className="text-[11px] text-slate-500 text-center">در انتظار برگذاران...</p>}
                </div>
              </div>

              {/* Third Place */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                  <h4 className="text-xs font-bold text-slate-300">رده‌بندی رتبه سوم</h4>
                </div>
                <div>
                  {thirdPlaceMatch ? renderBracketCard(thirdPlaceMatch, 'مسابقه مقام سوم') : (
                    <p className="text-[11px] text-slate-500 text-center bg-slate-900/10 p-4 rounded-xl">پیش‌بینی بازنده‌های نیمه‌نهایی</p>
                  )}
                </div>
              </div>

              {/* Final */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  <h4 className="text-xs font-bold text-amber-500">فینال بزرگ قهرمانی</h4>
                </div>
                <div className="bg-gradient-to-br from-amber-500/10 via-slate-950/45 to-teal-500/5 p-1 rounded-3xl border border-amber-500/20 shadow-lg">
                  {finalMatch ? renderBracketCard(finalMatch, 'فینال جام جهانی') : (
                    <p className="text-[11px] text-slate-500 text-center bg-slate-900/10 p-4 rounded-xl">رقابت نهایی جام زرین</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
