import React, { useState, useEffect } from 'react';
import { Match, MatchStatus, Prediction, User } from '../types';
import { getTeamCode, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import { Calendar, Check, Save, Edit3, Clock, ShieldAlert, CircleHelp } from 'lucide-react';
import OthersPredictionsModal from './OthersPredictionsModal';

interface FeaturedMatchCardProps {
  match: Match;
  prediction: Prediction | undefined;
  currentUser: User | null;
  onSavePrediction: (matchId: string, home: number, away: number) => Promise<boolean>;
  onTriggerAuth: () => void;
  onTeamClick?: (teamId: string) => void;
  settings?: any;
  key?: any;
}

export default function FeaturedMatchCard({
  match,
  prediction,
  currentUser,
  onSavePrediction,
  onTriggerAuth,
  onTeamClick,
  settings
}: FeaturedMatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [homeInput, setHomeInput] = useState<number>(prediction ? prediction.predictedHome : 0);
  const [awayInput, setAwayInput] = useState<number>(prediction ? prediction.predictedAway : 0);
  const [isSaving, setIsSaving] = useState(false);
  const [isOthersModalOpen, setIsOthersModalOpen] = useState(false);

  // Sync state if user's prediction updates in background
  useEffect(() => {
    if (prediction) {
      setHomeInput(prediction.predictedHome);
      setAwayInput(prediction.predictedAway);
    }
  }, [prediction]);

  const getCurrentTimeMs = () => {
    if (settings?.syncMode === 'simulation' && settings?.simulatedTime) {
      return new Date(settings.simulatedTime).getTime();
    }
    return Date.now();
  };

  const isLocked = () => {
    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) return true;
    const kickoff = new Date(match.kickoffTimeUtc).getTime();
    const diffMinutes = (kickoff - getCurrentTimeMs()) / (1000 * 60);
    return diffMinutes <= 30;
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onTriggerAuth();
      return;
    }
    if (isSaving || isLocked()) return;

    setIsSaving(true);
    setModalError('');
    
    try {
      const success = await onSavePrediction(match.id, homeInput, awayInput);
      if (success) {
        setIsModalOpen(false);
      } else {
        setModalError('خطا در ذخیره پیش‌بینی. بررسی کنید زمان آغاز بازی سپری نشده باشد.');
      }
    } catch (err) {
      console.error(err);
      setModalError('مشکلی رخ داد، دوباره تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  const homeName = getTeamName(match.homeTeamId);
  const awayName = getTeamName(match.awayTeamId);
  const homeCode = getTeamCode(match.homeTeamId);
  const awayCode = getTeamCode(match.awayTeamId);

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

  const getLiveMatchMinute = (m: Match, curTimeMs: number): string => {
    const kickoff = new Date(m.kickoffTimeUtc).getTime();
    const diff = Math.floor((curTimeMs - kickoff) / 60000);
    if (diff < 0) return "۱'";
    if (diff <= 45) return `${diff}'`;
    if (diff <= 60) return "بین دو نیمه";
    if (diff <= 105) return `${diff - 15}'`;
    return "۹۰+'";
  };

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'Group Stage': 'مرحله گروهی',
    'Round of 32': 'یک‌شانزدهم نهایی',
    'Round of 16': 'یک‌هشتم نهایی',
    'Quarter Finals': 'یک‌چهارم نهایی',
    'Semi Finals': 'نیمه‌نهایی',
    'Third Place Playoff': 'رده‌بندی مقام سوم',
    'Final': 'فینال'
  };

  return (
    <div className={`bg-slate-900/40 rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] group relative text-right ${
      match.status === MatchStatus.LIVE 
        ? 'border-red-500/25 bg-red-950/10 hover:border-red-500/40' 
        : match.status === MatchStatus.FINISHED 
          ? 'border-slate-800/80 hover:border-slate-700' 
          : 'border-slate-800 hover:border-emerald-500/35'
    }`} dir="rtl">
      
      {/* Target header / badge info */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/40 pb-2 mb-2">
        <span className="truncate max-w-[120px] bg-slate-850 px-2 py-0.5 rounded font-sans text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{STAGE_TRANSLATIONS[match.stage] || match.stage}</span>
        {match.status === MatchStatus.LIVE ? (
          <span className="flex items-center gap-1 bg-red-950/40 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-sans font-bold animate-pulse text-[9px]">
            ● زنده {getLiveMatchMinute(match, getCurrentTimeMs())}
          </span>
        ) : match.status === MatchStatus.FINISHED ? (
          <span className="text-slate-400 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 text-[9px] font-sans">پایان بازی</span>
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
        <div 
          onClick={() => {
            if (onTeamClick && !match.homeTeamId.startsWith('TBD_')) {
              onTeamClick(match.homeTeamId);
            }
          }}
          className={`text-center flex flex-col items-center space-y-1 ${
            onTeamClick && !match.homeTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-home' : ''
          }`}
          title={onTeamClick && !match.homeTeamId.startsWith('TBD_') ? "مشاهده مشخصات و ترکیب تیم" : undefined}
        >
          <FlagIcon teamIdOrCode={match.homeTeamId} className="h-5 w-7 rounded shadow-md group-hover/team-home:scale-110 transition-transform" />
          <span className="font-extrabold text-slate-100 text-xs block tracking-tight truncate max-w-full group-hover/team-home:text-emerald-400 transition-colors">{homeName}</span>
          <span className="text-[10px] font-mono font-medium text-slate-500">{homeCode}</span>
        </div>

        {/* Real Outcome Display */}
        <div className="text-center space-y-1 col-span-1">
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
        <div 
          onClick={() => {
            if (onTeamClick && !match.awayTeamId.startsWith('TBD_')) {
              onTeamClick(match.awayTeamId);
            }
          }}
          className={`text-center flex flex-col items-center space-y-1 ${
            onTeamClick && !match.awayTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-away' : ''
          }`}
          title={onTeamClick && !match.awayTeamId.startsWith('TBD_') ? "مشاهده مشخصات و ترکیب تیم" : undefined}
        >
          <FlagIcon teamIdOrCode={match.awayTeamId} className="h-5 w-7 rounded shadow-md group-hover/team-away:scale-110 transition-transform" />
          <span className="font-extrabold text-slate-100 text-xs block tracking-tight truncate max-w-full group-hover/team-away:text-emerald-400 transition-colors">{awayName}</span>
          <span className="text-[10px] font-mono font-medium text-slate-500">{awayCode}</span>
        </div>

      </div>

      {/* Dynamic interactive prediction section beneath */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/45 text-center flex flex-col justify-end grow">
        {!currentUser ? (
          <button
            type="button"
            onClick={onTriggerAuth}
            className="w-full py-1.5 bg-slate-850 border border-slate-750 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 font-bold text-[10px] rounded-lg transition-all"
          >
            برای پیش‌بینی وارد شوید
          </button>
        ) : match.homeTeamId.startsWith('TBD_') || match.awayTeamId.startsWith('TBD_') ? (
          <div className="bg-amber-950/10 border border-amber-500/10 py-2 rounded-lg text-amber-500 text-2xs font-semibold">
            ⏳ در انتظار صعود تیم‌ها جهت ثبت پیش‌بینی
          </div>
        ) : isLocked() ? (
          // Locked State: Display user prediction if any
          <div className="space-y-2">
            <div className="bg-slate-950/40 border border-slate-850 py-1.5 rounded-lg text-slate-400 text-2xs space-y-1">
              <span className="block text-[8px] font-sans text-slate-500 font-bold uppercase tracking-wider">🔒 قفل شده</span>
              {prediction ? (
                <div className="flex items-center justify-center gap-1" dir="rtl">
                  <span className="text-slate-400 text-xs">ثبت شده:</span>
                  <span className="font-bold text-white font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-left">
                    {prediction.predictedHome} - {prediction.predictedAway}
                  </span>
                  {prediction.points !== null && prediction.points !== undefined && match.status === MatchStatus.FINISHED && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] font-black font-sans ${
                      prediction.points === 10 
                        ? 'bg-amber-955 text-amber-400 border border-amber-500/25' 
                        : prediction.points === 7 
                        ? 'bg-blue-955 text-blue-400 border border-blue-500/25' 
                        : prediction.points === 5 
                        ? 'bg-emerald-955 text-emerald-400 border border-emerald-500/25' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {prediction.points === 10 ? '+۱۰ امتیاز' : prediction.points === 7 ? '+۷ امتیاز' : prediction.points === 5 ? '+۵ امتیاز' : '۰ امتیاز'}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-500">پیش‌بینی نشده</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOthersModalOpen(true)}
              className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              👁️ مشاهده پیش‌بینی دیگران
            </button>
          </div>
        ) : (
          // MatchesList style predictor button
          <div>
            {prediction ? (
              <div className="flex items-center justify-between bg-slate-950/40 border border-slate-850 p-2 rounded-xl" dir="rtl">
                <div className="text-right">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider font-sans">حدس شما</span>
                  <span className="font-extrabold font-mono text-xs text-amber-400 mt-1 block">
                    {prediction.predictedHome} - {prediction.predictedAway}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition-all flex items-center justify-center"
                  title="ویرایش پیش‌بینی"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 font-sans shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              >
                🔮 ثبت پیش‌بینی‌
              </button>
            )}
          </div>
        )}
      </div>

      {/* MATCH PREDICTIONS MODAL FORM FOR CARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-start sm:justify-center items-center bg-slate-955/95 backdrop-blur-md overflow-y-auto p-0 sm:p-4 text-slate-200" dir="rtl">
          <div className="w-full h-full min-h-screen sm:min-h-0 sm:h-auto sm:max-w-xl bg-slate-900 sm:rounded-3xl border-0 sm:border border-emerald-500/30 overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-950 flex justify-between items-center text-right shrink-0">
              <div>
                <h3 className="font-extrabold text-white text-lg sm:text-l tracking-tight">🔮 ثبت پیش‌بینی نتیجه مسابقه</h3>
                <p className="text-xs text-slate-400 mt-1">{STAGE_TRANSLATIONS[match.stage] || match.stage} · ورزشگاه {match.stadium}</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 font-bold transition-all text-sm cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSave} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Score prediction boxes */}
                <div className="grid grid-cols-7 items-center justify-center p-4 sm:p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                  
                  {/* Home */}
                  <div className="col-span-3 text-center space-y-3">
                    <div className="flex justify-center select-none">
                      <FlagIcon teamIdOrCode={match.homeTeamId} className="h-10 w-14 rounded shadow-lg object-contain" />
                    </div>
                    <span className="font-bold text-slate-100 block text-sm truncate max-w-full">{homeName}</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setHomeInput(h => Math.max(0, h - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-900 font-extrabold rounded-xl text-slate-100 hover:text-emerald-400 transition-all font-mono text-lg shadow"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="0"
                        value={homeInput}
                        onChange={(e) => setHomeInput(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-14 bg-slate-950 border border-slate-800 text-center text-xl font-black font-mono text-white rounded-xl focus:outline-none focus:border-emerald-500 py-1.5 focus:ring-1 focus:ring-emerald-500/30"
                      />
                      <button 
                        type="button" 
                        onClick={() => setHomeInput(h => h + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-900 font-extrabold rounded-xl text-slate-100 hover:text-emerald-400 transition-all font-mono text-lg shadow"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Divider Colon */}
                  <div className="col-span-1 text-center font-black text-2xl text-slate-600 font-mono">
                    :
                  </div>

                  {/* Away */}
                  <div className="col-span-3 text-center space-y-3">
                    <div className="flex justify-center select-none">
                      <FlagIcon teamIdOrCode={match.awayTeamId} className="h-10 w-14 rounded shadow-lg object-contain" />
                    </div>
                    <span className="font-bold text-slate-100 block text-sm truncate max-w-full">{awayName}</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setAwayInput(a => Math.max(0, a - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-900 font-extrabold rounded-xl text-slate-100 hover:text-emerald-400 transition-all font-mono text-lg shadow"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="0"
                        value={awayInput}
                        onChange={(e) => setAwayInput(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-14 bg-slate-950 border border-slate-800 text-center text-xl font-black font-mono text-white rounded-xl focus:outline-none focus:border-emerald-500 py-1.5 focus:ring-1 focus:ring-emerald-500/30"
                      />
                      <button 
                        type="button" 
                        onClick={() => setAwayInput(a => a + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-900 font-extrabold rounded-xl text-slate-100 hover:text-emerald-400 transition-all font-mono text-lg shadow"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Point allocation rule banner */}
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-2 text-right">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5 font-sans"><CircleHelp className="h-4 w-4 text-emerald-400 animate-pulse" /> نحوه امتیازدهی مسابقات:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 pr-1 font-sans leading-relaxed">
                    <li>اگر نتیجه را <span className="text-amber-400 font-bold">کاملاً دقیق</span> پیش‌بینی کنید: <span className="text-amber-400 font-extrabold font-sans">۱۰+ امتیاز</span></li>
                    <li>تخمینی که <span className="text-blue-400 font-bold">تفاضل گل صحیح</span> به همراه برنده را درست حدس بزند: <span className="text-blue-400 font-extrabold font-sans">۷+ امتیاز</span></li>
                    <li>اگر صرفاً <span className="text-emerald-400 font-bold">برنده یا تساوی</span> درست باشد اما تفاضل متفاوت باشد: <span className="text-emerald-400 font-extrabold font-sans">۵+ امتیاز</span></li>
                    <li>اگر پیش‌بینی شما کاملاً <span className="text-rose-450 font-bold">اشتباه</span> باشد: <span className="text-slate-500 font-bold font-sans">۰ امتیاز</span></li>
                  </ul>
                </div>

                {modalError && (
                  <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 font-sans font-medium">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-850 hover:bg-slate-805 text-slate-300 text-sm font-semibold rounded-xl border border-slate-800 transition-colors font-sans"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-white text-sm font-bold tracking-wide rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  {isSaving ? 'در حال ثبت...' : prediction ? 'ویرایش پیش‌بینی' : 'ذخیره پیش‌بینی'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <OthersPredictionsModal
        match={match}
        isOpen={isOthersModalOpen}
        onClose={() => setIsOthersModalOpen(false)}
        token={localStorage.getItem('wc_token')}
      />

    </div>
  );
}
