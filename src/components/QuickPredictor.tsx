import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Lock, Eye, EyeOff, Trophy, Flame, Award, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { Match, MatchStatus, MatchStage, Prediction, User, LeaderboardEntry } from '../types';
import { getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';

interface QuickPredictorProps {
  matches: Match[];
  predictions: Prediction[];
  currentUser: User | null;
  onTriggerAuth: () => void;
}

export default function QuickPredictor({
  matches,
  predictions,
  currentUser,
  onTriggerAuth
}: QuickPredictorProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedOpponentIds, setSelectedOpponentIds] = useState<string[]>([]);
  const [opponentsPredictions, setOpponentsPredictions] = useState<Record<string, Prediction[]>>({});
  const [isLoadingOpponent, setIsLoadingOpponent] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load the leaderboard users list for opponent dropdown
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        // Filter out current user
        const others = data.filter((u: LeaderboardEntry) => u.userId !== currentUser?.id);
        setLeaderboard(others);
      }
    } catch (err) {
      console.error('Error fetching leaderboard in QuickPredictor:', err);
    }
  };

  // Fetch predictions for all selected opponents
  const fetchOpponentsPredictions = async (ids: string[]) => {
    if (ids.length === 0) {
      setOpponentsPredictions({});
      return;
    }
    setIsLoadingOpponent(true);
    try {
      const token = localStorage.getItem('wc_token');
      const fetchPromises = ids.map(async (oppId) => {
        try {
          const res = await fetch(`/api/predictions/user/${oppId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            return { oppId, predictions: data as Prediction[] };
          }
        } catch (e) {
          console.error(`Error fetching predictions for user ${oppId}:`, e);
        }
        return { oppId, predictions: [] };
      });

      const results = await Promise.all(fetchPromises);
      const newMap: Record<string, Prediction[]> = {};
      results.forEach((item) => {
        newMap[item.oppId] = item.predictions;
      });
      setOpponentsPredictions(newMap);
    } catch (err) {
      console.error('Error fetching opponent predictions:', err);
    } finally {
      setIsLoadingOpponent(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLeaderboard();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOpponentsPredictions(selectedOpponentIds);
  }, [selectedOpponentIds]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeaderboard();
    if (selectedOpponentIds.length > 0) {
      await fetchOpponentsPredictions(selectedOpponentIds);
    }
    setIsRefreshing(false);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-xl mx-auto space-y-6" dir="rtl">
        <div className="p-4 bg-slate-950/60 rounded-full inline-flex border border-slate-850">
          <Clock className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">🔒 دسترسی محدود به مقایسه پیش‌بینی‌ها</h3>
          <p className="text-slate-400 text-xs px-6 font-sans">
            شناسه شما معتبر نیست. لطفاً وارد حساب باسابقه خود شوید تا پیش‌بینی‌هایتان را مدیریت و با سایر رقبا مقایسه کنید.
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

  // Helper inside client to check if match is locked (30 mins lock)
  const isMatchLocked = (match: Match): boolean => {
    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) return true;
    const kickoff = new Date(match.kickoffTimeUtc).getTime();
    const thirtyMins = 30 * 60 * 1000;
    return kickoff - Date.now() < thirtyMins;
  };

  // Stage filters list
  const stages = [
    { value: 'ALL', label: 'همه بازی‌ها' },
    { value: 'GROUP', label: 'مرحله گروهی' },
    { value: 'ROUND_OF_32', label: 'یک‌شانزدهم ۳۲ تیمی' },
    { value: 'ROUND_OF_16', label: 'یک‌هشتم نهایی' },
    { value: 'QUARTER_FINALS', label: 'یک‌چهارم نهایی' },
    { value: 'SEMI_FINALS', label: 'نیمه نهایی / فینال' }
  ];

  // Map database stages to unified filter values
  const filterMatches = matches.filter(m => {
    if (activeStageFilter === 'ALL') return true;
    if (activeStageFilter === 'GROUP') return m.stage === MatchStage.GROUP;
    if (activeStageFilter === 'ROUND_OF_32') return m.stage === MatchStage.ROUND_OF_32;
    if (activeStageFilter === 'ROUND_OF_16') return m.stage === MatchStage.ROUND_OF_16;
    if (activeStageFilter === 'QUARTER_FINALS') return m.stage === MatchStage.QUARTER_FINALS;
    if (activeStageFilter === 'SEMI_FINALS') {
      return m.stage === MatchStage.SEMI_FINALS || m.stage === MatchStage.THIRD_PLACE || m.stage === MatchStage.FINAL;
    }
    return true;
  });

  // Sort matches by kickoff time
  const sortedMatches = [...filterMatches].sort(
    (a, b) => new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime()
  );

  // Find predictions
  const getMyPred = (matchId: string): Prediction | undefined => {
    return predictions.find(p => p.matchId === matchId);
  };

  const selectedOpponents = selectedOpponentIds
    .map(id => leaderboard.find(u => u.userId === id))
    .filter((opp): opp is LeaderboardEntry => !!opp);

  // Calculate comparative counts
  const totalPredictedByMe = sortedMatches.filter(m => !!getMyPred(m.id)).length;
  const myTotalScoreForFiltered = sortedMatches.reduce((acc, m) => {
    const pred = getMyPred(m.id);
    return acc + (pred?.points || 0);
  }, 0);

  const getOpponentTotalScoreForFiltered = (oppId: string): number => {
    const oppPreds = opponentsPredictions[oppId] || [];
    return sortedMatches.reduce((acc, m) => {
      const pred = oppPreds.find(p => p.matchId === m.id);
      return acc + (pred?.points || 0);
    }, 0);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header card with summary statistics */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-right w-full md:w-auto">
          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[11px] font-black border border-amber-500/20">
            <Flame className="h-3.5 w-3.5" />
            کارنامه پیش‌بینی‌ها و کل‌کل زنده جام جهانی ۲۰۲۶
          </div>
          <h2 className="text-xl font-extrabold text-white">داشبورد مقایسه و نتایج زنده پیش‌بینی‌ها</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            پیش‌بینی‌های خود را مشاهده کنید و آنها را با بقیه رقبا مقایسه کنید. پیش‌بینی هر مسابقه تا <span className="text-amber-400 font-bold">۳۰ دقیقه قبل از سوت آغاز بازی</span> قفل شده و پس از آن بلافاصله برای کل کره زمین آشکار خواهد شد!
          </p>
        </div>

        <div className="flex items-center gap-3 self-center shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-white transition-all text-slate-400 disabled:opacity-50"
            title="بروزرسانی زنده داده‌ها"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comparison Opponent Picker */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3 w-full md:w-auto" style={{ fontFamily: 'Vazirmatn' }}>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0" style={{ fontFamily: 'Vazirmatn' }}>
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold">کل‌کل مستقیم و مقایسه زنده پیش‌بینی‌ها</p>
            <p className="text-[10px] text-slate-500 font-normal">رقبای خود را تک‌به‌تک انتخاب کنید یا با انتخاب گزینه «مقایسه همه کاربران»، همزمان همه را کنار هم بسنجید.</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <select
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                if (val === 'all_users') {
                  const allIds = leaderboard.map(opp => opp.userId);
                  setSelectedOpponentIds(allIds);
                  return;
                }
                if (selectedOpponentIds.includes(val)) return;
                if (selectedOpponentIds.length >= 5) {
                  alert('حداکثر امکان انتخاب ۵ رقیب همزمان وجود دارد.');
                  return;
                }
                setSelectedOpponentIds([...selectedOpponentIds, val]);
              }
            }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
          >
            <option value="">-- افزودن رقیب برای مقایسه --</option>
            {leaderboard.length > 0 && (
              <option value="all_users" className="text-emerald-400 font-bold bg-slate-900">👥 مقایسه همه کاربران ({leaderboard.length} نفر)</option>
            )}
            {leaderboard
              .filter((opp) => !selectedOpponentIds.includes(opp.userId))
              .map((opp) => (
                <option key={opp.userId} value={opp.userId}>
                  ⚔️ {opp.fullName} ({opp.totalScore} امتیاز - رتبه {leaderboard.indexOf(opp) + 2})
                </option>
              ))
            }
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center pr-2 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Selected Opponents Badges */}
      {selectedOpponentIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-950/20 border border-slate-850 rounded-xl items-center">
          <span className="text-[10px] text-slate-500 font-bold ml-1">هم‌اکنون در حال مقایسه با:</span>
          {selectedOpponents.map((opp) => (
            <div 
              key={opp.userId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 shadow-sm"
            >
              <span>⚔️ {opp.fullName} ({opp.totalScore} امتیاز)</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedOpponentIds(selectedOpponentIds.filter(id => id !== opp.userId));
                }}
                className="w-4 h-4 rounded-full bg-slate-850 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] pb-0.5 transition-colors font-sans"
                title="حذف از مقایسه"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSelectedOpponentIds([])}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold mr-auto cursor-pointer"
          >
            حذف همه رقبا
          </button>
        </div>
      )}

      {/* Stats Comparison Card */}
      {selectedOpponentIds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-3xl" dir="rtl">
          {/* My mini stats */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase block mb-1">پیش‌بینی‌های فعال شما</span>
              <p className="font-extrabold text-white text-sm line-clamp-1">{currentUser.fullName}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">کلامتیاز فیلتر جاری: {myTotalScoreForFiltered} امتیاز</p>
            </div>
            <div className="text-center bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
              <span className="block text-[8px] text-slate-500 font-bold">امتیاز کل</span>
              <span className="text-base font-black text-emerald-400 font-mono">{currentUser.totalScore}</span>
            </div>
          </div>

          {/* Opponents mini stats */}
          {selectedOpponents.map((opp) => {
            const oppTotalScoreForFiltered = getOpponentTotalScoreForFiltered(opp.userId);
            return (
              <div key={opp.userId} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase block mb-1">پیش‌بینی‌های حریف</span>
                  <p className="font-extrabold text-white text-sm line-clamp-1">{opp.fullName}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">کلامتیاز فیلتر جاری: {oppTotalScoreForFiltered} امتیاز</p>
                </div>
                <div className="text-center bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/20 shrink-0">
                  <span className="block text-[8px] text-slate-500 font-bold">امتیاز کل</span>
                  <span className="text-base font-black text-amber-400 font-mono">{opp.totalScore}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stage Tabs Filter Nav */}
      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 overflow-x-auto select-none no-scrollbar">
        {stages.map((stg) => (
          <button
            key={stg.value}
            type="button"
            onClick={() => setActiveStageFilter(stg.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeStageFilter === stg.value
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-extrabold shadow-sm'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {stg.label}
          </button>
        ))}
      </div>

      {/* Master List of Matches & Comparative Predictions */}
      <div className="bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-right border-collapse" dir="rtl">
            <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold border-b border-slate-800">
              <tr>
                <th className="p-4 font-sans text-right max-w-[200px]">اطلاعات و جزئیات مسابقه</th>
                <th className="p-4 font-sans text-center">تیم میزبان vs مهمان</th>
                <th className="p-4 font-sans text-center">نتیجه واقعی</th>
                <th className="p-4 font-sans text-center text-emerald-400 bg-emerald-950/10">
                  پیش‌بینی شما
                  <span className="block text-[10px] text-emerald-500 font-bold mt-0.5">({currentUser.totalScore} امتیاز کل)</span>
                </th>
                {selectedOpponents.map((opp) => (
                  <th 
                    key={opp.userId}
                    className="p-4 font-sans text-center text-amber-400 bg-amber-950/15 border-r border-slate-800"
                  >
                    پیش‌بینی {opp.fullName}
                    <span className="block text-[10px] text-amber-500 font-bold mt-0.5">({opp.totalScore} امتیاز کل)</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {sortedMatches.length === 0 ? (
                <tr>
                  <td colSpan={4 + selectedOpponents.length} className="p-12 text-center text-slate-500 text-xs font-sans">
                    در فیلتر انتخابی شما هیچ بازی در دیتابیس یافت نشد.
                  </td>
                </tr>
              ) : (
                sortedMatches.map((match) => {
                  const myPred = getMyPred(match.id);
                  const locked = isMatchLocked(match);

                  const kickoff = new Date(match.kickoffTimeUtc);
                  const isFinished = match.status === MatchStatus.FINISHED;
                  const isLive = match.status === MatchStatus.LIVE;

                  return (
                    <tr key={match.id} className="hover:bg-slate-900/20 transition-all font-sans">
                      
                      {/* Match Details */}
                      <td className="p-4 space-y-1 max-w-[200px] border-l border-slate-850/40">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-850">
                            کد {match.id.toUpperCase()}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                            match.stage === MatchStage.GROUP 
                              ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' 
                              : 'bg-purple-950/40 text-purple-400 border border-purple-500/10'
                          }`}>
                            {match.stage === MatchStage.GROUP ? 'مرحله گروهی' : 'حذفی'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <span>{kickoff.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</span> | 
                          <span>ساعت {kickoff.toLocaleTimeString('fa-IR', { hour: 'numeric', minute: 'numeric' })}</span>
                        </p>
                      </td>

                      {/* Teams & Flags */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs font-black text-slate-200">{getTeamName(match.homeTeamId)}</span>
                          <div className="flex items-center gap-1 select-none">
                            <FlagIcon teamIdOrCode={match.homeTeamId} className="h-4.5 w-7 shrink-0 rounded border border-slate-850 shadow-sm" />
                            <span className="text-slate-600 px-1 text-[11px]">vs</span>
                            <FlagIcon teamIdOrCode={match.awayTeamId} className="h-4.5 w-7 shrink-0 rounded border border-slate-850 shadow-sm" />
                          </div>
                          <span className="text-xs font-black text-slate-200">{getTeamName(match.awayTeamId)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{match.stadium.split(',')[0]}</p>
                      </td>

                      {/* Actual Finished Score */}
                      <td className="p-4 text-center">
                        {isFinished ? (
                          <div className="inline-flex items-center gap-1 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800 text-xs font-black text-white font-mono">
                            <span>{match.homeScore}</span>
                            <span className="text-slate-500">:</span>
                            <span>{match.awayScore}</span>
                          </div>
                        ) : isLive ? (
                          <div className="inline-flex items-center gap-2 bg-emerald-950/20 text-emerald-400 py-1 px-2.5 rounded-lg border border-emerald-500/20 text-[10px] font-black font-sans">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>زنده {match.homeScore} - {match.awayScore}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-sans flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            برگزار نشده
                          </span>
                        )}
                      </td>

                      {/* Your Prediction and Points */}
                      <td className="p-4 text-center bg-emerald-950/5">
                        {myPred ? (
                          <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>✅ ثبت شده</span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-white font-mono bg-slate-950 px-2.5 py-1 rounded-md inline-block border border-slate-800">
                                {myPred.predictedHome} <span className="text-slate-500 font-normal">:</span> {myPred.predictedAway}
                              </p>
                            </div>
                            {isFinished && myPred.points !== null && (
                              <div className="flex items-center justify-center gap-1 mt-0.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                  myPred.points === 10
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/35'
                                    : myPred.points === 7
                                    ? 'bg-blue-950 text-blue-400 border border-blue-500/35'
                                    : myPred.points === 5
                                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                    : 'bg-rose-950/30 text-rose-400 border border-rose-500/10'
                                }`}>
                                  {myPred.points === 10 ? '۱۰+ امتیاز (کامل) ⭐' : myPred.points === 7 ? '۷+ امتیاز (تفاضل) 🔥' : myPred.points === 5 ? '۵+ امتیاز (برنده) 👍' : '۰ امتیاز ❌'}
                                </span>
                              </div>
                            )}
                            {!isFinished && (
                              <p className="text-[9px] text-slate-500 font-mono">
                                {locked ? '🔒 قفل شده' : '✏️ قابل تغییر در لیست بازی‌ها'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/50 text-rose-400 rounded-md text-[10px] font-bold border border-rose-500/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              <span>❌ ثبت نشده</span>
                            </div>
                            {!locked && (
                              <span className="text-[9px] text-emerald-500 font-black block mt-1">پیش‌بینی در زبانه مسابقات ⬆️</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Opponents' predictions */}
                      {selectedOpponents.map((opp) => {
                        const oppPred = opponentsPredictions[opp.userId]?.find(p => p.matchId === match.id);
                        return (
                          <td key={opp.userId} className="p-4 text-center bg-amber-950/5 border-r border-slate-800">
                            {oppPred ? (
                              oppPred.predictedHome === -1 || oppPred.predictedAway === -1 ? (
                                <div className="space-y-1.5">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>✅ ثبت شده</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center gap-1 py-1">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-sans">
                                      <Lock className="h-3 w-3 text-slate-500" />
                                      <span>🔒 فاش نشده</span>
                                    </div>
                                    <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-sans block scale-90">
                                      تا ۳۰ دقیقه قبل بازی قفل است
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>✅ ثبت شده</span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-amber-200 font-mono bg-slate-950 px-2.5 py-1 rounded-md inline-block border border-amber-900/40">
                                      {oppPred.predictedHome} <span className="text-slate-600 font-normal">:</span> {oppPred.predictedAway}
                                    </p>
                                  </div>
                                  {isFinished && oppPred.points !== null && (
                                    <div className="flex items-center justify-center gap-1 mt-0.5">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                        oppPred.points === 10
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/35'
                                          : oppPred.points === 7
                                          ? 'bg-blue-950 text-blue-400 border border-blue-500/35'
                                          : oppPred.points === 5
                                          ? 'bg-slate-850 text-slate-300 border border-slate-700'
                                          : 'bg-rose-950/30 text-rose-400 border border-rose-500/10'
                                      }`}>
                                        {oppPred.points === 10 ? '۱۰+ امتیاز ⭐' : oppPred.points === 7 ? '۷+ امتیاز 🔥' : oppPred.points === 5 ? '۵+ امتیاز 👍' : '۰ امتیاز ❌'}
                                      </span>
                                    </div>
                                  )}
                                  {!isFinished && (
                                    <p className="text-[8px] text-amber-500/80 font-sans">🔓 قفل باز گردید (آشکار)</p>
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/50 text-rose-400 rounded-md text-[10px] font-bold border border-rose-500/10">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  <span>❌ ثبت نشده</span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-sans block mt-1">بدون پیش‌بینی</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

