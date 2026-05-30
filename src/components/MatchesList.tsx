import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckCircle, Clock, ShieldAlert, Edit3, CircleHelp, LayoutGrid, List } from 'lucide-react';
import { Match, MatchStage, MatchStatus, Team, Prediction, User } from '../types';
import { getTeamFlag, getTeamName, getTeamCode } from '../data/teams';
import FlagIcon from './FlagIcon';

interface MatchesListProps {
  matches: Match[];
  predictions: Prediction[];
  currentUser: User | null;
  onSavePrediction: (matchId: string, home: number, away: number) => Promise<boolean>;
  onTriggerAuth: () => void;
  onTeamClick?: (teamId: string) => void;
  settings?: any;
}

export default function MatchesList({ matches, predictions, currentUser, onSavePrediction, onTriggerAuth, onTeamClick, settings }: MatchesListProps) {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [predId, setPredId] = useState<string | null>(null);
  const [homeInput, setHomeInput] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    return (localStorage.getItem('wc_matches_view') as 'card' | 'table') || 'card';
  });
  const [awayInput, setAwayInput] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [realTime, setRealTime] = useState<number>(Date.now());

  // Periodically refresh current time to calculate countdowns down to seconds
  useEffect(() => {
    const timer = setInterval(() => setRealTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const getEffectiveTimeMs = () => {
    if (settings?.syncMode === 'simulation' && settings?.simulatedTime) {
      return new Date(settings.simulatedTime).getTime();
    }
    return realTime;
  };

  const currentTime = getEffectiveTimeMs();

  const getLiveMatchMinute = (m: Match, curTimeMs: number): string => {
    const kickoff = new Date(m.kickoffTimeUtc).getTime();
    const diff = Math.floor((curTimeMs - kickoff) / 60000);
    if (diff < 0) return "۱'";
    if (diff <= 45) return `${diff}'`;
    if (diff <= 60) return "بین دو نیمه";
    if (diff <= 105) return `${diff - 15}'`;
    return "۹۰+'";
  };

  // Set selected stage filters
  const stages = ['ALL', ...Object.values(MatchStage)];

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'ALL': '🏆 همه مراحل',
    'Group Stage': 'مرحله گروهی',
    'Round of 32': 'یک‌سی‌ودوم نهایی',
    'Round of 16': 'یک‌هشتم نهایی',
    'Quarter Finals': 'یک‌چهارم نهایی',
    'Semi Finals': 'نیمه‌نهایی',
    'Third Place Playoff': 'رده‌بندی مقام سوم',
    'Final': 'فینال'
  };

  const filteredMatches = matches.filter(match => {
    if (selectedStage === 'ALL') return true;
    return match.stage === selectedStage;
  });

  // Sort matches by kickoff time
  const sortedMatches = [...filteredMatches].sort(
    (a, b) => new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime()
  );

  const getPredictionForMatch = (matchId: string): Prediction | undefined => {
    return predictions.find(p => p.matchId === matchId);
  };

  const handleOpenPredictModal = (match: Match) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }
    
    const existing = getPredictionForMatch(match.id);
    setSelectedMatch(match);
    setModalError('');
    if (existing) {
      setPredId(existing.id);
      setHomeInput(existing.predictedHome);
      setAwayInput(existing.predictedAway);
    } else {
      setPredId(null);
      setHomeInput(0);
      setAwayInput(0);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    
    setIsSubmitting(true);
    setModalError('');
    
    const success = await onSavePrediction(selectedMatch.id, homeInput, awayInput);
    setIsSubmitting(false);

    if (success) {
      setSelectedMatch(null);
    } else {
      setModalError('خطا در ذخیره پیش‌بینی. بررسی کنید که آیا زمان (ثبت ۳۰ دقیقه قبل بازی) پایان یافته است یا خیر.');
    }
  };

  const getLockStatus = (match: Match): { isLocked: boolean; text: string; urgent: boolean } => {
    if (match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) {
      return { isLocked: true, text: 'قفل شده (بازی آغاز شده)', urgent: false };
    }
    
    const kickoff = new Date(match.kickoffTimeUtc).getTime();
    const diff = kickoff - currentTime;
    const thirtyMins = 30 * 60 * 1000;
    
    if (diff < thirtyMins) {
      return { isLocked: true, text: 'قفل شده (کمتر از ۳۰ دقیقه تا آغاز)', urgent: false };
    }

    const minsLeft = Math.floor(diff / (1000 * 60));
    const hoursLeft = Math.floor(minsLeft / 60);
    const daysLeft = Math.floor(hoursLeft / 24);

    if (minsLeft < 60) {
      return { isLocked: false, text: `اتمام ثبت در ${minsLeft} دقیقه`, urgent: true };
    } else if (hoursLeft < 24) {
      return { isLocked: false, text: `اتمام ثبت در ${hoursLeft} ساعت و ${minsLeft % 60} دقیقه`, urgent: hoursLeft < 3 };
    } else {
      return { isLocked: false, text: `اتمام ثبت در ${daysLeft} روز و ${hoursLeft % 24} ساعت`, urgent: false };
    }
  };

  const formatLocalDate = (utcString: string): string => {
    const d = new Date(utcString);
    return d.toLocaleDateString('fa-IR', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Title block */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          برنامه <span className="text-emerald-400">بازی‌های جام جهانی</span>
        </h2>
        <p className="text-slate-400 text-sm">
          نتایج مسابقات را گمانه‌زنی و پیش‌بینی کنید. با درستی تخمین‌ها امتیاز کسب کنید.
          امکان پیش‌بینی دقیقاً <span className="text-amber-400 font-bold font-sans">۳۰ دقیقه</span> پیش از سوت آغاز هر بازی بسته می‌شود.
        </p>
      </div>

      {/* Filters and View Switcher control center */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-full mx-auto border-b border-slate-800/60 pb-3" dir="rtl">
        {/* Slideable stage filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-grow">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedStage === stage
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-705'
              }`}
            >
              {STAGE_TRANSLATIONS[stage] || stage}
            </button>
          ))}
        </div>

        {/* View Mode Switcher (Single premium toggle button to save horizontal space and responsive layout alignment) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextMode = viewMode === 'card' ? 'table' : 'card';
              setViewMode(nextMode);
              localStorage.setItem('wc_matches_view', nextMode);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-705 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md select-none"
            title={viewMode === 'card' ? 'تغییر به نمای جدولی' : 'تغییر به نمای کارتی'}
          >
            {viewMode === 'card' ? (
              <>
                <List className="h-4 w-4 text-emerald-400" />
                <span>نمای جدولی</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 text-emerald-400" />
                <span>نمای کارتی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Mode Switching conditional block */}
      {viewMode === 'card' ? (
        /* Match Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full mx-auto w-full">
        {sortedMatches.length > 0 ? (
          sortedMatches.map(match => {
            const getTbdName = (teamId: string) => {
              return getTeamName(teamId);
            };

            const getTbdCode = (teamId: string) => {
              return getTeamCode(teamId);
            };

            const homeName = getTbdName(match.homeTeamId);
            const homeCode = getTbdCode(match.homeTeamId);
            
            const awayName = getTbdName(match.awayTeamId);
            const awayCode = getTbdCode(match.awayTeamId);

            const pred = getPredictionForMatch(match.id);
            const timeInfo = getLockStatus(match);

            return (
              <div 
                key={match.id}
                className={`relative overflow-hidden rounded-2xl border bg-slate-900/40 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] ${
                  match.status === MatchStatus.FINISHED 
                    ? 'border-slate-800 bg-slate-950/20 opacity-90 hover:border-slate-700/60' 
                    : 'border-slate-800/80 hover:border-emerald-500/40'
                } group`}
              >
                
                {/* Stage Header & Date */}
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-slate-800/40" dir="rtl">
                  <span className="font-mono bg-slate-800/60 px-2 py-0.5 rounded-md font-semibold text-[10px] text-emerald-400 uppercase tracking-wider">{STAGE_TRANSLATIONS[match.stage] || match.stage}</span>
                  <span className="flex items-center gap-1.5 font-sans font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {formatLocalDate(match.kickoffTimeUtc)}
                  </span>
                </div>

                {/* Score / Team Board Layout */}
                <div className="grid grid-cols-3 items-center py-2">
                  
                  {/* Home Team */}
                  <div 
                    onClick={() => {
                      if (onTeamClick && !match.homeTeamId.startsWith('TBD_')) {
                        onTeamClick(match.homeTeamId);
                      }
                    }}
                    className={`text-center flex flex-col items-center space-y-1.5 ${
                      onTeamClick && !match.homeTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-home' : ''
                    }`}
                    title={onTeamClick && !match.homeTeamId.startsWith('TBD_') ? "مشاهده مشخصات و ترکیب تیم" : undefined}
                  >
                    <FlagIcon teamIdOrCode={match.homeTeamId} className="h-6 w-9 filter drop-shadow-sm group-hover/team-home:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold text-slate-105 block tracking-tight text-xs sm:text-sm group-hover/team-home:text-emerald-400 transition-colors">{homeName}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">{homeCode}</span>
                    </div>
                  </div>

                  {/* Mid-results or Kickoff Area */}
                  <div className="text-center space-y-1 bg-slate-900/10 p-1 rounded-xl">
                    {match.status === MatchStatus.FINISHED ? (
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-2xl font-black text-white font-mono">{match.homeScore}</span>
                          <span className="text-slate-600 font-bold">:</span>
                          <span className="text-2xl font-black text-white font-mono">{match.awayScore}</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-sans font-extrabold tracking-widest uppercase bg-emerald-900/10 border border-emerald-500/10 px-1.5 py-0.5 rounded-md text-emerald-400">پایان بازی</span>
                      </div>
                    ) : match.status === MatchStatus.LIVE ? (
                      <div className="space-y-1.5 animate-pulse">
                        <div className="inline-flex items-center gap-1 bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-500/20">
                          <span className="text-2xl font-black text-red-500 font-mono">{match.homeScore}</span>
                          <span className="text-red-700 font-bold">:</span>
                          <span className="text-2xl font-black text-red-500 font-mono">{match.awayScore}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-red-400 font-sans font-bold">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                          </span>
                          <span>دقیقه {getLiveMatchMinute(match, currentTime)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <span className="block text-slate-500 text-xs font-sans font-medium">در برابر</span>
                        <span className="block text-[10px] text-slate-400 font-medium font-sans">{match.stadium}</span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div 
                    onClick={() => {
                      if (onTeamClick && !match.awayTeamId.startsWith('TBD_')) {
                        onTeamClick(match.awayTeamId);
                      }
                    }}
                    className={`text-center flex flex-col items-center space-y-1.5 ${
                      onTeamClick && !match.awayTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-away' : ''
                    }`}
                    title={onTeamClick && !match.awayTeamId.startsWith('TBD_') ? "مشاهده مشخصات و ترکیب تیم" : undefined}
                  >
                    <FlagIcon teamIdOrCode={match.awayTeamId} className="h-6 w-9 filter drop-shadow-sm group-hover/team-away:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold text-slate-105 block tracking-tight text-xs sm:text-sm group-hover/team-away:text-emerald-400 transition-colors">{awayName}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">{awayCode}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Prediction / Status Rail */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/40 flex items-center justify-between">
                  {/* Left: Open/Closed lock countdown badge */}
                  <div>
                    {timeInfo.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        {timeInfo.text}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${timeInfo.urgent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                        {timeInfo.urgent ? <ShieldAlert className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                        {timeInfo.text}
                      </span>
                    )}
                  </div>

                  {/* Right: User Prediction Display or Action Button */}
                  <div>
                    {pred ? (
                      <div className="flex items-center gap-2" dir="rtl">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-sans leading-none">حدس شما</p>
                          <p className="font-black font-mono text-sm text-amber-400 tracking-tight text-left">
                            {pred.predictedHome} - {pred.predictedAway}
                          </p>
                          {pred.points !== null && (
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-extrabold font-sans ${
                              pred.points >= 10 || pred.points === 3
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20 font-black' 
                                : pred.points === 7
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                : pred.points === 5 || pred.points === 1
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {pred.points >= 10 ? 'دقیق (+۱۰)' : pred.points === 7 ? 'تفاضل (+۷)' : pred.points === 5 ? 'برنده (+۵)' : pred.points === 3 ? 'دقیق (+۳)' : pred.points === 1 ? 'برنده (+۱)' : 'نادرست (۰)'}
                            </span>
                          )}
                        </div>
                        {!timeInfo.isLocked && (
                          <button 
                            onClick={() => handleOpenPredictModal(match)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="ویرایش پیش‌بینی"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        {timeInfo.isLocked ? (
                          <span className="text-xs text-slate-500 font-sans italic">پیش‌بینی ثبت نشده</span>
                        ) : (
                          <button
                            onClick={() => handleOpenPredictModal(match)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wide rounded-lg transition-all transform hover:scale-[1.03] shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            🔮 ثبت پیش‌بینی
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-slate-900/20 border border-slate-800/80 rounded-2xl">
              <p className="text-slate-500 text-sm">هیچ مسابقه‌ای در این مرحله یافت نشد.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-900/30 max-w-full mx-auto shadow-xl" dir="rtl">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/80 text-slate-400 font-extrabold text-[11px] sm:text-xs">
                <th className="p-3 sm:p-4 text-right whitespace-nowrap">مشخصات بازی و ساعت</th>
                <th className="p-2 text-center">میزبان</th>
                <th className="p-2 text-center">نتیجه واقعی</th>
                <th className="p-2 text-center">مهمان</th>
                <th className="p-3 sm:p-4 text-center">پیش‌بینی شما</th>
                <th className="p-3 sm:p-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {sortedMatches.length > 0 ? (
                sortedMatches.map(match => {
                  const getTbdName = (teamId: string) => {
                    return getTeamName(teamId);
                  };

                  const getTbdCode = (teamId: string) => {
                    return getTeamCode(teamId);
                  };

                  const homeName = getTbdName(match.homeTeamId);
                  const homeCode = getTbdCode(match.homeTeamId);
                  
                  const awayName = getTbdName(match.awayTeamId);
                  const awayCode = getTbdCode(match.awayTeamId);

                  const pred = getPredictionForMatch(match.id);
                  const timeInfo = getLockStatus(match);

                  return (
                    <tr 
                      key={match.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        match.status === MatchStatus.FINISHED ? 'opacity-80 bg-slate-950/10' : ''
                      }`}
                    >
                      {/* Match Stage & Date */}
                      <td className="p-3 sm:p-4 text-right">
                        <div className="space-y-1">
                          <span className="inline-block font-mono bg-slate-800/60 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide">
                            {STAGE_TRANSLATIONS[match.stage] || match.stage}
                          </span>
                          <span className="block text-slate-300 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                            {formatLocalDate(match.kickoffTimeUtc)}
                          </span>
                          <span className="block text-slate-500 text-[9px] truncate max-w-[120px] sm:max-w-none">
                            {match.stadium}
                          </span>
                        </div>
                      </td>

                      {/* Home Team */}
                      <td className="p-2 text-center">
                        <div 
                          onClick={() => {
                            if (onTeamClick && !match.homeTeamId.startsWith('TBD_')) {
                              onTeamClick(match.homeTeamId);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 sm:gap-2.5 mx-auto ${
                            onTeamClick && !match.homeTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-tbl-home' : ''
                          }`}
                        >
                          <FlagIcon teamIdOrCode={match.homeTeamId} className="h-5 w-7 filter drop-shadow-sm group-hover/team-tbl-home:scale-105 transition-transform shrink-0" />
                          <div className="text-right">
                            <span className="font-extrabold text-slate-200 block sm:inline group-hover/team-tbl-home:text-emerald-400 transition-colors">{homeName}</span>
                            <span className="hidden sm:inline text-[10px] font-mono text-slate-500 font-medium mr-1">({homeCode})</span>
                          </div>
                        </div>
                      </td>

                      {/* Actual Result / VS */}
                      <td className="p-2 text-center font-mono">
                        {match.status === MatchStatus.FINISHED ? (
                          <div className="inline-flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs sm:text-sm font-black text-white">
                            <span>{match.homeScore}</span>
                            <span className="text-slate-600">:</span>
                            <span>{match.awayScore}</span>
                          </div>
                        ) : match.status === MatchStatus.LIVE ? (
                          <div className="inline-flex flex-col items-center gap-0.5 animate-pulse flex-nowrap">
                            <div className="inline-flex items-center gap-1 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/20 text-xs sm:text-sm font-black text-red-500">
                              <span>{match.homeScore}</span>
                              <span className="text-red-700">:</span>
                              <span>{match.awayScore}</span>
                            </div>
                            <span className="text-[9px] text-red-00 font-sans font-bold whitespace-nowrap">دقیقه {getLiveMatchMinute(match, currentTime)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-bold px-2 py-0.5 bg-slate-950 border border-slate-850 rounded-lg">vs</span>
                        )}
                      </td>

                      {/* Away Team */}
                      <td className="p-2 text-center">
                        <div 
                          onClick={() => {
                            if (onTeamClick && !match.awayTeamId.startsWith('TBD_')) {
                              onTeamClick(match.awayTeamId);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 sm:gap-2.5 mx-auto ${
                            onTeamClick && !match.awayTeamId.startsWith('TBD_') ? 'cursor-pointer hover:text-emerald-400 select-none group/team-tbl-away' : ''
                          }`}
                        >
                          <FlagIcon teamIdOrCode={match.awayTeamId} className="h-5 w-7 filter drop-shadow-sm group-hover/team-tbl-away:scale-105 transition-transform shrink-0" />
                          <div className="text-right">
                            <span className="font-extrabold text-slate-200 block sm:inline group-hover/team-tbl-away:text-emerald-400 transition-colors">{awayName}</span>
                            <span className="hidden sm:inline text-[10px] font-mono text-slate-500 font-medium mr-1">({awayCode})</span>
                          </div>
                        </div>
                      </td>

                      {/* User Prediction */}
                      <td className="p-3 sm:p-4 text-center">
                        {pred ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="font-black font-mono text-xs sm:text-sm text-amber-400">
                              {pred.predictedHome} - {pred.predictedAway}
                            </span>
                            {pred.points !== null && (
                              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-extrabold font-sans scale-90 ${
                                pred.points >= 10 || pred.points === 3
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black' 
                                  : pred.points >= 5 || pred.points === 1
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold' 
                                  : 'bg-slate-800 text-slate-450'
                              }`}>
                                {pred.points >= 10 ? 'دقیق (+۱۰)' : pred.points === 7 ? 'تفاضل (+۷)' : pred.points === 5 ? 'برنده (+۵)' : pred.points === 3 ? 'دقیق (+۳)' : pred.points === 1 ? 'برنده (+۱)' : 'نادرست (۰)'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium italic">ثبت نشده</span>
                        )}
                      </td>

                      {/* Prediction Actions */}
                      <td className="p-3 sm:p-4 text-left">
                        {timeInfo.isLocked ? (
                          <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1 font-semibold">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>قفل</span>
                          </span>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenPredictModal(match)}
                              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all border ${
                                pred
                                  ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-450 hover:border-emerald-500/35 animate-none'
                                  : 'bg-emerald-600/15 border-emerald-500/25 text-emerald-400 hover:bg-emerald-600 hover:text-slate-950 hover:border-transparent font-black shadow-sm'
                              }`}
                            >
                              {pred ? 'ویرایش' : '🔮 پیش‌بینی'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    هیچ مسابقه‌ای در این مرحله یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MATCH PREDICTIONS MODAL FORM */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" dir="rtl">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-950 flex justify-between items-center text-right">
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">🔮 ثبت پیش‌بینی نتیجه مسابقه</h3>
                <p className="text-xs text-slate-400">{STAGE_TRANSLATIONS[selectedMatch.stage] || selectedMatch.stage} · ورزشگاه {selectedMatch.stadium}</p>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Score prediction boxes */}
              <div className="grid grid-cols-7 items-center justify-center p-3 sm:p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                
                {/* Home */}
                <div className="col-span-3 text-center space-y-2">
                  <div className="flex justify-center select-none">
                    <FlagIcon teamIdOrCode={selectedMatch.homeTeamId} className="h-7 w-10" />
                  </div>
                  <span className="font-bold text-slate-100 block text-xs truncate max-w-full">{getTeamName(selectedMatch.homeTeamId)}</span>
                  <div className="inline-flex items-center space-x-1.5">
                    <button 
                      type="button" 
                      onClick={() => setHomeInput(h => Math.max(0, h - 1))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-black rounded-lg text-slate-100 hover:text-emerald-400 transition-all font-mono"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="0"
                      value={homeInput}
                      onChange={(e) => setHomeInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 bg-slate-950 border border-slate-800 text-center text-lg font-black font-mono text-white rounded-lg focus:outline-none focus:border-emerald-500 py-1"
                    />
                    <button 
                      type="button" 
                      onClick={() => setHomeInput(h => h + 1)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-black rounded-lg text-slate-100 hover:text-emerald-400 transition-all font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Divider Colon */}
                <div className="col-span-1 text-center font-black text-xl text-slate-500 font-mono">
                  :
                </div>

                {/* Away */}
                <div className="col-span-3 text-center space-y-2">
                  <div className="flex justify-center select-none">
                    <FlagIcon teamIdOrCode={selectedMatch.awayTeamId} className="h-7 w-10" />
                  </div>
                  <span className="font-bold text-slate-100 block text-xs truncate max-w-full">{getTeamName(selectedMatch.awayTeamId)}</span>
                  <div className="inline-flex items-center space-x-1.5">
                    <button 
                      type="button" 
                      onClick={() => setAwayInput(a => Math.max(0, a - 1))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-black rounded-lg text-slate-100 hover:text-emerald-400 transition-all font-mono"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="0"
                      value={awayInput}
                      onChange={(e) => setAwayInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 bg-slate-950 border border-slate-800 text-center text-lg font-black font-mono text-white rounded-lg focus:outline-none focus:border-emerald-500 py-1"
                    />
                    <button 
                      type="button" 
                      onClick={() => setAwayInput(a => a + 1)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 font-black rounded-lg text-slate-100 hover:text-emerald-400 transition-all font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Point allocation rule banner */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 text-right">
                <p className="font-bold text-slate-300 flex items-center gap-1.5 font-sans"><CircleHelp className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> نحوه امتیازدهی مسابقات:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pr-1 font-sans">
                  <li>اگر نتیجه را <span className="text-amber-400 font-bold">کاملاً دقیق</span> پیش‌بینی کنید: <span className="text-amber-400 font-extrabold font-sans">۱۰+ امتیاز</span></li>
                  <li>تخمینی که <span className="text-blue-400 font-bold">تفاضل گل صحیح</span> به همراه برنده را درست حدس بزند: <span className="text-blue-400 font-extrabold font-sans">۷+ امتیاز</span></li>
                  <li>اگر صرفاً <span className="text-emerald-400 font-bold">برنده یا تساوی</span> درست باشد اما تفاضل متفاوت باشد: <span className="text-emerald-400 font-extrabold font-sans">۵+ امتیاز</span></li>
                  <li>اگر پیش‌بینی شما کاملاً <span className="text-rose-450 font-bold">اشتباه</span> باشد: <span className="text-slate-500 font-bold font-sans">۰ امتیاز</span></li>
                </ul>
              </div>

              {modalError && (
                <div className="p-3.5 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 font-sans font-medium">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-850 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 text-sm font-bold tracking-wide rounded-xl transition-all font-sans shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                >
                  {isSubmitting ? 'در حال ثبت...' : predId ? 'ویرایش پیش‌بینی' : 'ذخیره پیش‌بینی'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
