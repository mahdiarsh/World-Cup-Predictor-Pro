import React, { useState, useEffect } from 'react';
import { Match, MatchStatus, Prediction, User } from '../types';
import { getTeamCode, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import { Calendar, Check, Save } from 'lucide-react';

interface FeaturedMatchCardProps {
  match: Match;
  prediction: Prediction | undefined;
  currentUser: User | null;
  onSavePrediction: (matchId: string, home: number, away: number) => Promise<boolean>;
  onTriggerAuth: () => void;
  key?: any;
}

export default function FeaturedMatchCard({
  match,
  prediction,
  currentUser,
  onSavePrediction,
  onTriggerAuth
}: FeaturedMatchCardProps) {
  // Initialize inputs from current database prediction or defaults
  const [homeScore, setHomeScore] = useState<number>(prediction ? prediction.predictedHome : 0);
  const [awayScore, setAwayScore] = useState<number>(prediction ? prediction.predictedAway : 0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if user's prediction updates in background
  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.predictedHome);
      setAwayScore(prediction.predictedAway);
    }
  }, [prediction]);

  // Handle predictions locking status (e.g. within 30 minutes of kickoff)
  const isLocked = () => {
    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) return true;
    const now = new Date();
    const kickoff = new Date(match.kickoffTimeUtc);
    const diffMs = kickoff.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= 30;
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onTriggerAuth();
      return;
    }
    if (isSaving || isLocked()) return;

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const success = await onSavePrediction(match.id, homeScore, awayScore);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTbdName = (teamId: string) => {
    if (teamId.startsWith('TBD_')) {
      const map: Record<string, string> = {
        TBD_1A: 'تیم اول گروه A',
        TBD_2B: 'تیم دوم گروه B',
        TBD_1C: 'تیم اول گروه C',
        TBD_2D: 'تیم دوم گروه D',
        TBD_2F: 'تیم دوم گروه F',
        TBD_1G: 'تیم اول گروه G',
        TBD_WM13: 'برنده بازی ۱۳',
        TBD_WM14: 'برنده بازی ۱۴',
        TBD_WM15: 'برنده نیمه‌نهایی',
        TBD_1D: 'تیم اول گروه D'
      };
      return map[teamId] || 'نامشخص';
    }
    return getTeamName(teamId);
  };

  const getTbdCode = (teamId: string) => {
    if (teamId.startsWith('TBD_')) return 'TBD';
    return getTeamCode(teamId);
  };

  const homeName = getTbdName(match.homeTeamId);
  const awayName = getTbdName(match.awayTeamId);
  const homeCode = getTbdCode(match.homeTeamId);
  const awayCode = getTbdCode(match.awayTeamId);

  // Format UTC Kickoff date nicely
  const formatKickoff = (utcStr: string) => {
    const d = new Date(utcStr);
    return d.toLocaleDateString('fa-IR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'GROUP': 'مرحله گروهی',
    'ROUND_OF_32': 'یک‌سی‌ودوم نهایی',
    'ROUND_OF_16': 'یک‌هشتم نهایی',
    'QUARTER_FINALS': 'یک‌چهارم نهایی',
    'SEMI_FINALS': 'نیمه‌نهایی',
    'THIRD_PLACE': 'رده‌بندی مقام سوم',
    'FINAL': 'فینال'
  };

  return (
    <div className={`bg-slate-900/40 rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 group relative text-right ${
      match.status === MatchStatus.LIVE 
        ? 'border-red-500/20 bg-red-950/5' 
        : match.status === MatchStatus.FINISHED 
          ? 'border-slate-800/80' 
          : 'border-slate-800 hover:border-emerald-500/10'
    }`} dir="rtl">
      
      {/* Target header / badge info */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/40 pb-2 mb-2">
        <span className="truncate max-w-[120px] bg-slate-850 px-2 py-0.5 rounded font-sans text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{STAGE_TRANSLATIONS[match.stage] || match.stage}</span>
        {match.status === MatchStatus.LIVE ? (
          <span className="flex items-center gap-1.5 text-red-400 font-bold animate-pulse text-[9px] font-mono">
            ● زنده
          </span>
        ) : match.status === MatchStatus.FINISHED ? (
          <span className="text-slate-400 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 text-[9px] font-sans">پایان یافته</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-sans font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            {formatKickoff(match.kickoffTimeUtc)}
          </span>
        )}
      </div>

      {/* Team rows & middle display scores */}
      <div className="grid grid-cols-3 items-center py-2.5">
        
        {/* Home side view */}
        <div className="text-center flex flex-col items-center space-y-1">
          <FlagIcon teamIdOrCode={match.homeTeamId} className="h-5 w-7 rounded shadow-md group-hover:scale-105 transition-transform" />
          <span className="font-extrabold text-slate-100 text-xs block tracking-tight truncate max-w-full">{homeName}</span>
          <span className="text-[10px] font-mono font-medium text-slate-500">{homeCode}</span>
        </div>

        {/* Real Outcome Display */}
        <div className="text-center space-y-1">
          {match.status === MatchStatus.FINISHED ? (
            <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-lg font-black text-white font-mono">{match.homeScore}</span>
              <span className="text-slate-600 font-bold">:</span>
              <span className="text-lg font-black text-white font-mono">{match.awayScore}</span>
            </div>
          ) : match.status === MatchStatus.LIVE ? (
            <div className="inline-flex items-center gap-1 bg-red-950/45 border border-red-500/20 px-2.5 py-1 rounded-lg">
              <span className="text-lg font-black text-red-400 font-mono">{match.homeScore}</span>
              <span className="text-red-750 font-bold">:</span>
              <span className="text-lg font-black text-red-400 font-mono">{match.awayScore}</span>
            </div>
          ) : (
            <div className="text-[10px] bg-slate-950/50 text-slate-500 border border-slate-800/60 font-semibold uppercase tracking-wider px-2 py-0.5 rounded font-sans">در برابر</div>
          )}
        </div>

        {/* Away side view */}
        <div className="text-center flex flex-col items-center space-y-1">
          <FlagIcon teamIdOrCode={match.awayTeamId} className="h-5 w-7 rounded shadow-md group-hover:scale-105 transition-transform" />
          <span className="font-extrabold text-slate-100 text-xs block tracking-tight truncate max-w-full">{awayName}</span>
          <span className="text-[10px] font-mono font-medium text-slate-500">{awayCode}</span>
        </div>

      </div>

      {/* Dynamic interactive prediction section beneath */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/45 text-center flex flex-col justify-end grow">
        {!currentUser ? (
          <button
            type="button"
            onClick={onTriggerAuth}
            className="w-full py-1.5 bg-slate-805 border border-slate-750 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 font-bold text-[10px] rounded-lg transition-all"
          >
            برای پیش‌بینی وارد شوید
          </button>
        ) : isLocked() ? (
          // Locked State: Display user prediction if any
          <div className="bg-slate-950/40 border border-slate-850 py-1.5 rounded-lg text-slate-400 text-2xs space-y-1">
            <span className="block text-[8px] font-sans text-slate-500 font-bold uppercase tracking-wider">🔒 قفل شده</span>
            {prediction ? (
              <div className="flex items-center justify-center gap-1" dir="rtl">
                <span className="text-slate-400 text-xs">ثبت شده:</span>
                <span className="font-bold text-white font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-left">
                  {prediction.predictedHome} - {prediction.predictedAway}
                </span>
                {prediction.points !== null && prediction.points !== undefined && match.status === MatchStatus.FINISHED && (
                  <span className={`ml-1 px-1 rounded text-[8px] font-black font-sans ${
                    prediction.points === 3 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20' 
                      : prediction.points === 1 
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-505/20' 
                        : 'bg-slate-900 text-slate-500 border border-slate-805'
                  }`}>
                    {prediction.points === 3 ? '+۳ امتیاز' : prediction.points === 1 ? '+۱ امتیاز' : '۰ امتیاز'}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-500">پیش‌بینی نشده</span>
            )}
          </div>
        ) : (
          // Dynamic Prediction controls for active users when predictions are open
          <form onSubmit={handlePredict} className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xs text-slate-400 select-none">پیش‌بینی شما:</span>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-2.5 font-mono">
                {/* Home decrease / value / increase */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setHomeScore(prev => Math.max(0, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white rounded hover:bg-slate-805 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-black text-white">{homeScore}</span>
                  <button
                    type="button"
                    onClick={() => setHomeScore(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white rounded hover:bg-slate-805 active:scale-95"
                  >
                    +
                  </button>
                </div>

                <span className="text-slate-600 font-bold">-</span>

                {/* Away decrease / value / increase */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setAwayScore(prev => Math.max(0, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white rounded hover:bg-slate-805 active:scale-95"
                   >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-black text-white">{awayScore}</span>
                  <button
                    type="button"
                    onClick={() => setAwayScore(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white rounded hover:bg-slate-805 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Save/Submit prediction inline */}
              <button
                type="submit"
                disabled={isSaving}
                className={`p-1.5 rounded-lg border transition-all ${
                  saveSuccess 
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-emerald-400 hover:bg-slate-900'
                }`}
                title="ذخیره پیش‌بینی"
              >
                {saveSuccess ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
