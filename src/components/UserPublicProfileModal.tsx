import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Flame, CheckCircle, Info, Lock, ChevronLeft, Calendar, HelpCircle } from 'lucide-react';
import { LeaderboardEntry, Match, Prediction, MatchStatus } from '../types';
import { getTeamName } from '../data/teams';
import Avatar from './Avatar';
import FlagIcon from './FlagIcon';

interface UserPublicProfileModalProps {
  userId: string | null;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  matches: Match[];
  token: string | null;
}

export default function UserPublicProfileModal({
  userId,
  onClose,
  leaderboard,
  matches,
  token
}: UserPublicProfileModalProps) {
  const [predictions, setPredictions] = useState<(Prediction & { isLocked?: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    score: number;
    matchName: string;
    added: number;
    x: number;
    y: number;
  } | null>(null);

  // Find the user on the leaderboard to display their basic stats instantly
  const userStats = leaderboard.find(u => u.userId === userId);

  useEffect(() => {
    if (!userId || !token) {
      setPredictions([]);
      return;
    }

    const fetchUserPredictions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/predictions/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setPredictions(data);
        } else {
          setError('خطا در بارگذاری پیش‌بینی‌های کاربر.');
        }
      } catch (err) {
        console.error('Failed to fetch user predictions:', err);
        setError('خطای اتصال به سرور.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPredictions();
  }, [userId, token]);

  if (!userId) return null;

  // Percentage calculations
  const totalProcessed = userStats ? userStats.playedMatches : 0;
  const exactCount = userStats ? userStats.exactPredictions : 0;
  const correctCount = userStats ? userStats.correctPredictions : 0;
  const winnerOnlyCount = correctCount - exactCount;

  const exactRate = totalProcessed > 0 ? Math.round((exactCount / totalProcessed) * 100) : 0;
  const successRate = totalProcessed > 0 ? Math.round((correctCount / totalProcessed) * 100) : 0;

  // Format kickoff helper
  const formatLocalDate = (utcString: string): string => {
    const d = new Date(utcString);
    return d.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to determine points badge / status
  const getPointsBadge = (points: number | null | undefined, match: Match, predictedHome: number, predictedAway: number) => {
    if (match.status !== MatchStatus.FINISHED) {
      if (match.status === MatchStatus.LIVE) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            بازی زنده
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-850 text-slate-400 border border-slate-850">
          در انتظار بازی
        </span>
      );
    }

    if (points === 10) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
          🔥 ۱۰+ امتیاز (نتیجه دقیق)
        </span>
      );
    } else if (points === 7) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
          ⚽ ۷+ امتیاز (تفاضل صحیح)
        </span>
      );
    } else if (points === 5) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
          👍 ۵+ امتیاز (برنده صحیح)
        </span>
      );
    } else if (points === 0) {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-450 border border-rose-500/20">
          ❌ ۰ امتیاز
        </span>
      );
    }

    return null;
  };

  // Build full matches with user predictions joined
  const predictionList = matches.map(match => {
    const p = predictions.find(pred => pred.matchId === match.id);
    
    // Lock logic matched with backend customRequire / isMatchLocked check:
    const isLiveOrFinished = match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE;
    const kickoff = new Date(match.kickoffTimeUtc).getTime();
    const thirtyMins = 30 * 60 * 1000;
    const isPastKickoff = kickoff - Date.now() < thirtyMins;
    const isCalculatedPublic = isLiveOrFinished || isPastKickoff;

    return {
      match,
      prediction: p,
      isPublic: isCalculatedPublic && !!p,
      hasFuturePrediction: !isCalculatedPublic && !!p,
    };
  }).filter(item => {
    // Show only active predictions configured
    if (!item.prediction) return false;
    
    if (filter === 'unlocked') {
      return item.isPublic; // unlocked / public to other users
    }
    if (filter === 'locked') {
      return item.hasFuturePrediction; // locked / private (future kickoff)
    }
    return true; // all
  }).sort((a, b) => new Date(a.match.kickoffTimeUtc).getTime() - new Date(b.match.kickoffTimeUtc).getTime());

  // Rank Progression & Score trend
  const finishedPredictions = predictions
    .filter(p => {
      const m = matches.find(match => match.id === p.matchId);
      return m && m.status === MatchStatus.FINISHED && p.points !== null && p.points !== undefined;
    })
    .sort((a, b) => {
      const mA = matches.find(match => match.id === a.matchId)!;
      const mB = matches.find(match => match.id === b.matchId)!;
      return new Date(mA.kickoffTimeUtc).getTime() - new Date(mB.kickoffTimeUtc).getTime();
    });

  let cumulativePoints = 0;
  const chartData = finishedPredictions.map((p, index) => {
    const m = matches.find(match => match.id === p.matchId)!;
    cumulativePoints += p.points || 0;
    return {
      label: `بازی ${index + 1}`,
      score: cumulativePoints,
      matchName: `${getTeamName(m.homeTeamId)} - ${getTeamName(m.awayTeamId)}`,
      added: p.points || 0,
    };
  });

  const hasChartData = chartData.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto" dir="rtl">
      {/* Backdrop overlay trigger click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Profile Card Container Frame */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 text-right max-h-[90vh] flex flex-col z-10">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-black text-white">نمایه و پیش‌بینی‌های شرکت‌کننده</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer select-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Card Panel body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-6 min-h-0 select-text">
          {userStats ? (
            <>
              {/* User Identity Highlight Card */}
              <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-850 border border-slate-705 p-0.5 shrink-0 flex items-center justify-center select-none">
                    <Avatar avatar={userStats.avatar} alt={userStats.fullName} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-white tracking-tight">{userStats.fullName}</h4>
                    <p className="text-slate-500 text-xs font-mono">@{userStats.username}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-center min-w-[75px]">
                    <p className="text-[10px] text-slate-500 block">رتبه</p>
                    <p className="text-xl font-black text-amber-400 font-sans">#{userStats.rank}</p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-center min-w-[75px]">
                    <p className="text-[10px] text-slate-500 block">امتیاز</p>
                    <p className="text-xl font-black text-emerald-400 font-sans">{userStats.totalScore}</p>
                  </div>
                </div>
              </div>

              {/* Tournament detail analysis metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">کل پیش‌بینی‌های ارزیابی‌شده</span>
                  <span className="text-lg font-bold text-slate-200 mt-1">{totalProcessed} بازی</span>
                </div>
                <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">پیش‌بینی نتیجه کاملاً دقیق</span>
                  <span className="text-lg font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                    {exactCount} بازی
                  </span>
                </div>
                <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">حدس درست و برنده خالص</span>
                  <span className="text-lg font-bold text-blue-400 mt-1">{winnerOnlyCount} بازی</span>
                </div>
                <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">درصد تفکیک دقیق نتایج</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 font-sans">{exactRate}%</span>
                </div>
                <div className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-center flex flex-col justify-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400">درصد کلی پیش‌بینی موفق</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 font-sans">{successRate}%</span>
                </div>
              </div>

              {/* Rank Progression Chart Component */}
              <div className="bg-slate-950/20 border border-slate-850/65 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between" dir="rtl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📈</span>
                    <h5 className="text-xs font-extrabold text-slate-200">نمودار زمانی صعود و رشد امتیاز کل</h5>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium font-sans">بر اساس مسابقات پیش‌بینی‌شده</span>
                </div>

                {hasChartData ? (
                  <div className="relative h-[180px] w-full bg-slate-950/50 rounded-xl border border-slate-900/60 overflow-hidden flex items-center justify-center p-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        {/* Area gradient */}
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                        </linearGradient>
                        {/* Shadow filters for trace glow */}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.4" />
                        </filter>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                        const yVal = 20 + r * 110;
                        return (
                          <line
                            key={i}
                            x1="40"
                            y1={yVal}
                            x2="460"
                            y2={yVal}
                            stroke="#1e293b"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {/* Render Area path */}
                      {(() => {
                        const paddingX = 40;
                        const paddingY = 20;
                        const activeWidth = 420;
                        const activeHeight = 110;
                        const maxS = Math.max(...chartData.map(d => d.score), 10);
                        const minS = 0;

                        const coords = chartData.map((d, index) => {
                          const x = paddingX + (index / Math.max(chartData.length - 1, 1)) * activeWidth;
                          const ratio = (d.score - minS) / (maxS - minS || 1);
                          const y = paddingY + (1 - ratio) * activeHeight;
                          return { ...d, x, y };
                        });

                        const linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                        const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${paddingY + activeHeight} L ${coords[0].x} ${paddingY + activeHeight} Z`;

                        return (
                          <>
                            {/* Area Fill */}
                            <path d={areaPath} fill="url(#areaGrad)" />
                            
                            {/* Glowing line trace */}
                            <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Dots and interactive hover areas */}
                            {coords.map((pt, idx) => (
                              <g key={idx} className="cursor-pointer">
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={idx === chartData.length - 1 ? "5" : "3.5"}
                                  className={`${idx === chartData.length - 1 ? 'fill-emerald-450 animate-pulse' : 'fill-emerald-400'} stroke-slate-900 stroke-2 transition-all duration-250 hover:r-6`}
                                  onMouseEnter={() => {
                                    setHoveredPoint({
                                      label: pt.label,
                                      score: pt.score,
                                      matchName: pt.matchName,
                                      added: pt.added,
                                      x: pt.x,
                                      y: pt.y
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Interactive Tooltip bubble */}
                    {hoveredPoint ? (
                      <div
                        className="absolute bg-slate-950/95 border border-emerald-500/30 rounded-xl p-2.5 shadow-2xl text-right space-y-1 font-mono transition-all duration-150 pointer-events-none z-20"
                        style={{
                          left: `${(hoveredPoint.x / 500) * 100}%`,
                          bottom: `${100 - (hoveredPoint.y / 180) * 100 + 10}%`,
                          transform: 'translateX(-50%)',
                          minWidth: '160px'
                        }}
                        dir="rtl"
                      >
                        <p className="text-[9px] text-emerald-450 font-extrabold">{hoveredPoint.label}</p>
                        <p className="text-[10px] text-slate-300 font-bold truncate">{hoveredPoint.matchName}</p>
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span className="text-slate-400">نتیجه حدس:</span>
                          <span className="text-emerald-400 font-black">+{hoveredPoint.added} امتیاز</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span className="text-slate-400">امتیاز کل تا اینجا:</span>
                          <span className="text-white font-black font-mono">{hoveredPoint.score}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-medium font-sans">
                        💡 نشانگر ماوس را روی نقاط ببرید تا تحلیل پیش‌بینی‌ها مشخص شود
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[90px] flex items-center justify-center border border-slate-900 border-dashed rounded-xl bg-slate-950/20 text-slate-500 text-xs text-center font-sans">
                    هنوز بازی پیش‌بینی‌شده پایان‌یافته‌ای برای این کاربر ثبت نشده است.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-4 text-center text-slate-400 font-sans text-sm">
              کاربر مورد نظر در بین بازیکنان فعال یافت نشد.
            </div>
          )}

          {/* Predict detail header filter block */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <h5 className="font-extrabold text-white text-sm">لیست پیش‌بینی‌های شرکت‌کننده</h5>
              
              {/* Filter Tabs */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 text-xs text-slate-400">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-1 rounded-md transition-all ${filter === 'all' ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'}`}
                >
                  همه ({predictions.length})
                </button>
                <button
                  onClick={() => setFilter('unlocked')}
                  className={`px-2 py-1 rounded-md transition-all ${filter === 'unlocked' ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'}`}
                >
                  آغاز شده
                </button>
                <button
                  onClick={() => setFilter('locked')}
                  className={`px-2 py-1 rounded-md transition-all ${filter === 'locked' ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'}`}
                >
                  آینده (🔒 پنهان)
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-1.5">
                <Info className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading placeholder */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin"></div>
                <span className="text-xs">در حال فراخوانی لیست پیش‌بینی‌های کاربر...</span>
              </div>
            ) : !token ? (
              /* If unauthenticated and trying to inspect */
              <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-5 text-center space-y-3">
                <Lock className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-slate-300 text-xs font-sans font-medium leading-relaxed leading-6">
                  جهت ضد تقلب و صیانت از صحت رقابت‌ها، پیش‌بینی‌های تفصیلی کاربران تنها برای اعضای ثبت‌نام شده قابل مشاهده است. لطفا ابتدا وارد حساب خود شوید.
                </p>
              </div>
            ) : predictionList.length === 0 ? (
              <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl py-12 text-center text-slate-500 font-sans text-xs">
                {filter === 'locked' && 'پیش‌بینی در آینده یا پنهانی یافت نشد.'}
                {filter === 'unlocked' && 'مسابقه پیش‌بینی شده‌ی آغاز شده‌ای برای این کاربر ثبت نشده است.'}
                {filter === 'all' && 'هیچ پیش‌بینی پیش‌فرضی ثبت نشده است.'}
              </div>
            ) : (
              /* Predictions vertical timeline layout */
              <div className="space-y-3">
                {predictionList.map(({ match, prediction, isPublic, hasFuturePrediction }) => {
                  if (!prediction) return null;
                  
                  return (
                    <div
                      key={match.id}
                      className="bg-slate-950/40 hover:bg-slate-950/60 transition-colors border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-sans"
                    >
                      {/* Match and Teams brief info */}
                      <div className="space-y-1 sm:flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded font-bold">{match.stage}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatLocalDate(match.kickoffTimeUtc)}
                          </span>
                        </div>
                        
                        {/* Match Competitors */}
                        <div className="flex items-center gap-3 pt-1.5">
                          <div className="flex items-center gap-1.5">
                            <FlagIcon teamIdOrCode={match.homeTeamId} className="h-3.5 w-5" />
                            <span className="text-white font-bold">{getTeamName(match.homeTeamId)}</span>
                          </div>
                          
                          <span className="text-slate-650 font-black px-1 text-[10px]">vs</span>

                          <div className="flex items-center gap-1.5">
                            <FlagIcon teamIdOrCode={match.awayTeamId} className="h-3.5 w-5" />
                            <span className="text-white font-bold">{getTeamName(match.awayTeamId)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Prediction Result Display Column */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0 shrink-0">
                        {/* User Forecast Details */}
                        <div className="text-right sm:text-left">
                          <p className="text-[10px] text-slate-500 block mb-0.5 sm:text-left">پیش‌بینی کاربر</p>
                          {isPublic ? (
                            <div className="flex items-center gap-1.5 justify-start sm:justify-end">
                              <span className="font-mono text-base font-black text-slate-100 bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5">
                                {prediction.predictedHome} - {prediction.predictedAway}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                              <Lock className="h-3 w-3" />
                              <span>مخفی (تا شروع بازی)</span>
                            </div>
                          )}
                        </div>

                        {/* actual Match Score results (if finished or live) paired with points badges */}
                        <div className="text-left">
                          <p className="text-[10px] text-slate-500 block mb-0.5 text-left">نتیجه نهایی</p>
                          {match.status === MatchStatus.FINISHED ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-400 bg-slate-900 rounded px-1.5 py-0.5">
                                {match.homeScore} - {match.awayScore}
                              </span>
                              {getPointsBadge(prediction.points, match, prediction.predictedHome, prediction.predictedAway)}
                            </div>
                          ) : match.status === MatchStatus.LIVE ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 animate-pulse">
                                {match.homeScore} - {match.awayScore}
                              </span>
                              {getPointsBadge(prediction.points, match, prediction.predictedHome, prediction.predictedAway)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-600">برگزار نشده</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
