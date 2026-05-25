import React, { useState, useEffect } from 'react';
import { Calendar, Save, RefreshCw, CheckCircle, ShieldAlert, BookOpen, Clock } from 'lucide-react';
import { Match, MatchStatus, Prediction, User } from '../types';
import { getTeamFlag, getTeamName, getTeamCode } from '../data/teams';
import FlagIcon from './FlagIcon';

interface QuickPredictorProps {
  matches: Match[];
  predictions: Prediction[];
  currentUser: User | null;
  onSaveBatchPredictions: (preds: Array<{ matchId: string, home: number, away: number }>) => Promise<boolean>;
  onSyncFifa: () => Promise<string | null>;
  onTriggerAuth: () => void;
}

export default function QuickPredictor({
  matches,
  predictions,
  currentUser,
  onSaveBatchPredictions,
  onSyncFifa,
  onTriggerAuth
}: QuickPredictorProps) {
  const [localScores, setLocalScores] = useState<Record<string, { home: number; away: number }>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('');

  // Group status filters: Unpredicted vs All
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNPREDICTED' | 'LOCKED'>('UNPREDICTED');

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'GROUP': 'گروهی',
    'ROUND_OF_32': 'یک‌سی‌ودوم',
    'ROUND_OF_16': 'یک‌هشتم',
    'QUARTER_FINALS': 'یک‌چهارم',
    'SEMI_FINALS': 'نیمه‌نهایی',
    'THIRD_PLACE': 'رده‌بندی',
    'FINAL': 'فینال'
  };

  // Initialize inputs from existing predictions
  useEffect(() => {
    const scores: Record<string, { home: number; away: number }> = {};
    matches.forEach(m => {
      const pred = predictions.find(p => p.matchId === m.id);
      if (pred) {
        scores[m.id] = { home: pred.predictedHome, away: pred.predictedAway };
      } else {
        scores[m.id] = { home: 0, away: 0 };
      }
    });
    setLocalScores(scores);
    setHasChanges({});
  }, [matches, predictions]);

  if (!currentUser) {
    return (
      <div id="quick-predict-auth-gate" className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-xl mx-auto space-y-6" dir="rtl">
        <div className="p-4 bg-slate-950/60 rounded-full inline-flex border border-slate-850">
          <Clock className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">🔒 دسترسی به بخش پیش‌بینی سریع محدود است</h3>
          <p className="text-slate-400 text-xs px-6 font-sans">
            برای استفاده از پانل پیش‌بینی صفحه گسترده سریع، باید به حساب کاربری خود وارد شده باشید. وارد شده یا یک حساب کاربری ایجاد کنید تا وارد جدول جهانی رقبا شوید.
          </p>
        </div>
        <button
          onClick={onTriggerAuth}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wider rounded-xl transition-all"
        >
          ورود به حساب کاربری
        </button>
      </div>
    );
  }

  // Get current lock status
  const isMatchLocked = (match: Match): boolean => {
    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) return true;
    const kickoff = new Date(match.kickoffTimeUtc).getTime();
    const thirtyMins = 30 * 60 * 1000;
    return kickoff - Date.now() < thirtyMins;
  };

  const handleScoreChange = (matchId: string, side: 'home' | 'away', val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setLocalScores(prev => {
      const updated = { ...prev[matchId], [side]: num };
      
      // Determine if it changed compared to original prediction
      const originalPred = predictions.find(p => p.matchId === matchId);
      const wasSaved = !!originalPred;
      const isDiff = !wasSaved || originalPred.predictedHome !== updated.home || originalPred.predictedAway !== updated.away;

      setHasChanges(c => ({ ...c, [matchId]: isDiff }));
      return { ...prev, [matchId]: updated };
    });
  };

  const adjustScore = (matchId: string, side: 'home' | 'away', delta: number) => {
    const current = localScores[matchId] || { home: 0, away: 0 };
    const newVal = Math.max(0, current[side] + delta);
    handleScoreChange(matchId, side, String(newVal));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Filter only those modified and NOT locked
    const changedMatchIds = Object.keys(hasChanges).filter(id => hasChanges[id]);
    const validToSave = matches.filter(m => changedMatchIds.includes(m.id) && !isMatchLocked(m));

    if (validToSave.length === 0) {
      setErrorMessage('هیچ تغییری جهت ذخیره یافت نشد یا تمامی موارد ویرایش شده قفل شده‌اند.');
      setIsSaving(false);
      return;
    }

    const payload = validToSave.map(m => ({
      matchId: m.id,
      ...localScores[m.id]
    }));

    const success = await onSaveBatchPredictions(payload);
    setIsSaving(false);

    if (success) {
      setSuccessMessage(`پیش‌بینی های ${validToSave.length} مسابقه با موفقیت ذخیره شد!`);
      // Reset changes tracking
      setHasChanges({});
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage('خطا در ذخیره برخی پیش‌بینی‌ها. اطمینان حاصل کنید که بازی‌ها قفل نشده باشند.');
    }
  };

  const handleSyncFIFAOnline = async () => {
    setIsSyncing(true);
    setSyncSuccess('');
    setErrorMessage('');
    try {
      const msg = await onSyncFifa();
      if (msg) {
        setSyncSuccess(msg);
        setTimeout(() => setSyncSuccess(''), 6000);
      }
    } catch (e: any) {
      setErrorMessage('اتصال با نتایج زنده فیفا برقرار نشد.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to render team names beautifully or placeholders if undecided
  const getDynamicTeamName = (teamId: string) => {
    if (teamId.startsWith('TBD_')) {
      const m: Record<string, string> = {
        TBD_1A: 'اول گروه A 🥇',
        TBD_2B: 'دوم گروه B 🥈',
        TBD_1C: 'اول گروه C 🥇',
        TBD_2D: 'دوم گروه D 🥈',
        TBD_2F: 'دوم گروه F 🥈',
        TBD_1G: 'اول گروه G 🥇',
        TBD_WM13: 'برنده بازی ۱۳ 🏆',
        TBD_WM14: 'برنده بازی ۱۴ 🏆',
        TBD_WM15: 'برنده نیمه‌نهایی 🏆',
        TBD_1D: 'اول گروه D 🥇'
      };
      return m[teamId] || 'نامشخص';
    }
    return getTeamName(teamId);
  };

  const getDynamicTeamCode = (teamId: string) => {
    if (teamId.startsWith('TBD_')) return 'TBD';
    return getTeamCode(teamId);
  };

  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime()
  );

  const displayedMatches = sortedMatches.filter(m => {
    const isLockedStatus = isMatchLocked(m);
    const originalPred = predictions.find(p => p.matchId === m.id);
    const isPredicted = !!originalPred;

    if (filterMode === 'UNPREDICTED') return !isPredicted && !isLockedStatus;
    if (filterMode === 'LOCKED') return isLockedStatus;
    return true; // ALL
  });

  const modifiedCount = Object.values(hasChanges).filter(Boolean).length;

  return (
    <div id="quick-predictor-root" className="space-y-6 text-right" dir="rtl">
      
      {/* Upper header action banner */}
      <div className="bg-gradient-to-r from-slate-900/80 to-indigo-950/20 p-5 rounded-3xl border border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center lg:text-right">
          <h2 className="text-2xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
            ⚡ پورتال پیش‌بینی سریع مسابقات <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10 font-sans">حالت سریع</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            چندین مسابقه را در قالب یک صفحه گسترده به سرعت پیش‌بینی کنید! برای تغییر با دکمه‌های بالا/پایین کلیک کنید و در انتها گزینه <strong className="text-emerald-400">ذخیره گروهی</strong> را بزنید.
          </p>
        </div>

        {/* Global sync & Save action items */}
        <div className="flex flex-wrap gap-2.5 shrink-0 justify-end">
          <button
            onClick={handleSyncFIFAOnline}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 hover:text-amber-400 text-white border border-slate-800 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all transition-transform active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amber-500' : 'text-slate-400'}`} />
            {isSyncing ? 'در حال دریافت...' : 'همگام‌سازی نتایج زنده فیفا 🌐'}
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving || modifiedCount === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all text-slate-950 justify-center min-w-[120px] ${
              modifiedCount > 0 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-800 text-slate-550 border border-slate-700/40 cursor-not-allowed opacity-50'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            ذخیره گروهی ({modifiedCount})
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-2xl flex gap-2 animate-pulse font-sans shadow-lg">
          <BookOpen className="h-5 w-5 text-amber-400 shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl flex gap-2 font-sans">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl flex gap-2 font-sans">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Row filtering bar */}
      <div className="flex items-center gap-2 border-b border-slate-900/40 pb-3" dir="rtl">
        <button
          onClick={() => setFilterMode('UNPREDICTED')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            filterMode === 'UNPREDICTED' 
              ? 'bg-emerald-500 text-slate-950' 
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-850'
          }`}
        >
          🔮 بازی‌های پیش‌بینی نشده
        </button>
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            filterMode === 'ALL' 
              ? 'bg-emerald-500 text-slate-950' 
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-850'
          }`}
        >
          📅 همه مسابقات
        </button>
        <button
          onClick={() => setFilterMode('LOCKED')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            filterMode === 'LOCKED' 
              ? 'bg-emerald-500 text-slate-950' 
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-850'
          }`}
        >
          🔒 پایان یافته / قفل شده
        </button>
      </div>

      {/* Main predictions spreadsheet grid layout */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl" dir="rtl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800/60 text-[10px] uppercase tracking-wider font-sans text-slate-500">
                <th className="py-3 px-4 w-28 text-right">مرحله / گروه</th>
                <th className="py-3 px-4 text-right">تیم میزبان</th>
                <th className="py-3 px-2 text-center w-40">پیش‌بینی نتیجه</th>
                <th className="py-3 px-4 text-right">تیم میهمان</th>
                <th className="py-3 px-4 text-center w-28">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {displayedMatches.length > 0 ? (
                displayedMatches.map(m => {
                  const locked = isMatchLocked(m);
                  const isHomeTbd = m.homeTeamId.startsWith('TBD_');
                  const isAwayTbd = m.awayTeamId.startsWith('TBD_');
                  const isAnyTbd = isHomeTbd || isAwayTbd;

                  const scores = localScores[m.id] || { home: 0, away: 0 };
                  const pred = predictions.find(p => p.matchId === m.id);
                  const hasUnsavedChanges = hasChanges[m.id];

                  return (
                    <tr 
                      key={m.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        locked ? 'opacity-55' : ''
                      } ${hasUnsavedChanges ? 'bg-amber-950/10' : ''}`}
                    >
                      {/* Match metadata code */}
                      <td className="py-3 px-4 font-mono font-bold text-right">
                        <span className="block text-slate-400 text-[9px] uppercase tracking-wider bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/20 inline-block font-sans">
                          {STAGE_TRANSLATIONS[m.stage] || m.stage}
                        </span>
                        <span className="block text-[8px] text-slate-500 mt-1 truncate max-w-[120px] font-sans">
                          {m.stadium}
                        </span>
                      </td>

                      {/* Home Team cell */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="shrink-0 select-none">
                            <FlagIcon teamIdOrCode={m.homeTeamId} className="h-5 w-7 rounded-sm shadow-md" />
                          </div>
                          <div>
                            <span className={`block font-extrabold text-sm ${isHomeTbd ? 'text-slate-500 font-medium italic' : 'text-slate-100'}`}>
                              {getDynamicTeamName(m.homeTeamId)}
                            </span>
                            {!isHomeTbd && (
                              <span className="text-[10px] text-slate-500 font-mono font-medium">{getDynamicTeamCode(m.homeTeamId)}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score predictions inline controller */}
                      <td className="py-3 px-2 text-center">
                        {locked ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 border-none select-none font-mono">
                            {m.status === MatchStatus.FINISHED ? (
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-white text-sm">{m.homeScore}</span>
                                <span className="text-slate-600">:</span>
                                <span className="font-extrabold text-white text-sm">{m.awayScore}</span>
                                <span className="text-[9px] font-bold text-slate-500 mr-1.5 uppercase tracking-normal font-sans">نتیجه</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic block leading-none py-0.5 font-sans">پیش‌بینی قفل شده</span>
                            )}
                          </div>
                        ) : isAnyTbd ? (
                          <div className="text-[10px] text-amber-500/80 font-semibold font-sans bg-amber-950/10 border border-amber-500/10 rounded-lg px-2.5 py-2 leading-none">
                            ⏳ در انتظار صعود
                          </div>
                        ) : (
                          <div id={`predict-box-${m.id}`} className="inline-flex items-center justify-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                            
                            {/* Decrease Home score */}
                            <button
                              type="button"
                              onClick={() => adjustScore(m.id, 'home', -1)}
                              className="px-1.5 py-1 hover:text-emerald-400 hover:bg-slate-800 rounded font-bold font-mono text-slate-400"
                            >
                              -
                            </button>

                            {/* Home Predicted Input */}
                            <input
                              type="number"
                              min="0"
                              value={scores.home}
                              onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                              className="w-10 bg-transparent text-center font-black font-mono text-white text-base focus:outline-none"
                            />

                            <span className="text-slate-600 font-extrabold pb-0.5 font-mono">:</span>

                            {/* Away Predicted Input */}
                            <input
                              type="number"
                              min="0"
                              value={scores.away}
                              onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                              className="w-10 bg-transparent text-center font-black font-mono text-white text-base focus:outline-none"
                            />

                            {/* Increase Away score */}
                            <button
                              type="button"
                              onClick={() => adjustScore(m.id, 'away', 1)}
                              className="px-1.5 py-1 hover:text-emerald-400 hover:bg-slate-800 rounded font-bold font-mono text-slate-400"
                            >
                              +
                            </button>

                          </div>
                        )}
                      </td>

                      {/* Away Team cell */}
                      <td className="py-3 px-4 font-sans text-right">
                        <div className="flex items-center justify-start gap-2.5">
                          <div>
                            <span className={`block font-extrabold text-sm ${isAwayTbd ? 'text-slate-500 font-medium italic' : 'text-slate-100'}`}>
                              {getDynamicTeamName(m.awayTeamId)}
                            </span>
                            {!isAwayTbd && (
                              <span className="text-[10px] text-slate-500 font-mono font-medium">{getDynamicTeamCode(m.awayTeamId)}</span>
                            )}
                          </div>
                          <div className="shrink-0 select-none">
                            <FlagIcon teamIdOrCode={m.awayTeamId} className="h-5 w-7 rounded-sm shadow-md" />
                          </div>
                        </div>
                      </td>

                      {/* Status Check cell */}
                      <td className="py-3 px-4 text-center font-sans">
                        {m.status === MatchStatus.FINISHED ? (
                          <div className="space-y-1">
                            {pred ? (
                              <div className="text-[10px] font-mono font-extrabold">
                                <span className="text-slate-400">پیش‌بینی شما: {pred.predictedHome}-{pred.predictedAway}</span>
                                {pred.points !== null && (
                                  <span className={`block text-[9px] mt-0.5 font-bold font-sans ${
                                    pred.points === 3 
                                      ? 'text-amber-400 font-black' 
                                      : pred.points === 1 
                                      ? 'text-emerald-400' 
                                      : 'text-slate-500'
                                  }`}>
                                    {pred.points === 3 ? 'دقیق! (+۳)' : pred.points === 1 ? 'برنده درست (+۱)' : 'اشتباه (۰)'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-sans italic">بدون پیش‌بینی</span>
                            )}
                          </div>
                        ) : pred ? (
                          <div className="space-y-0.5">
                            {hasUnsavedChanges ? (
                              <span className="inline-block text-[9px] uppercase font-bold tracking-wider bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded border border-amber-500/10 font-sans">
                                ✍️ عدم ذخیره
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] uppercase font-bold tracking-wider bg-emerald-950/20 text-emerald-400/90 px-2 py-0.5 rounded border border-emerald-500/10 select-none font-sans">
                                ✓ پیش‌بینی شده ({scores.home}-{scores.away})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-sans text-slate-500 italic select-none">
                            خالی
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-sm font-sans">
                    مسابقه‌ای در این دسته‌بندی فیلتر یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
