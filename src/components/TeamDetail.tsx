import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Team, Match, MatchStatus, Prediction, User, MatchStage } from '../types';
import { getSquadForTeam, Player } from '../data/squads';
import { getTeamCode, getTeamFlag, getTeamName } from '../data/teams';
import FlagIcon from './FlagIcon';
import FeaturedMatchCard from './FeaturedMatchCard';
import FUTCard from './FUTCard';
import { ArrowLeft, User as UserIcon, Calendar, Info, Award, ShieldAlert, CheckCircle, Flame, Sparkles, CircleHelp } from 'lucide-react';

interface TeamDetailProps {
  teamId: string;
  teams: Team[];
  matches: Match[];
  predictions: Prediction[];
  currentUser: User | null;
  onBack: () => void;
  onSavePrediction: (matchId: string, home: number, away: number) => Promise<boolean>;
  onTriggerAuth: () => void;
  onTeamClick?: (teamId: string) => void;
  settings?: any;
}

interface ShirtIconProps {
  primaryColor: string;
  secondaryColor: string;
  number: number;
  isChosen: boolean;
}

function ShirtIcon({ primaryColor, secondaryColor, number, isChosen }: ShirtIconProps) {
  return (
    <div className={`relative flex items-center justify-center transition-all duration-300 ${
      isChosen ? 'scale-120 z-20 filter drop-shadow-[0_12px_24px_rgba(16,185,129,0.55)]' : 'hover:scale-115 hover:z-10'
    }`}>
      <svg viewBox="0 0 100 100" className="w-10 h-10 sm:w-14 sm:h-14 filter drop-shadow-[0_4px_7px_rgba(0,0,0,0.55)]">
        {/* Main T-Shirt Body from the elegant first version */}
        <path 
          d="M 50,14 C 47,14 43,16 41,18 L 22,25 C 20,26 19,28 20,30 L 25,48 C 26,50 28,51 30,50 L 35,46 L 35,88 C 35,90 37,92 39,92 L 61,92 C 63,92 65,90 65,88 L 65,46 L 70,50 C 72,51 74,50 75,48 L 80,30 C 81,28 80,26 78,25 L 59,18 C 57,16 53,14 50,14 Z" 
          fill={primaryColor}
          stroke="#0b1329"
          strokeWidth="1.5"
        />
        {/* Sleeve cuff accents */}
        <path d="M 22,25 L 20,30 L 25,48 L 27,41 Z" fill={secondaryColor} opacity="0.45" />
        <path d="M 78,25 L 80,30 L 75,48 L 73,41 Z" fill={secondaryColor} opacity="0.45" />
        {/* High-quality crew collar */}
        <path d="M 40,19 Q 50,29 60,19 Z" fill={secondaryColor} opacity="0.9" />
        {/* Torso athletic striping */}
        <path d="M 35,52 L 37.5,52 L 37.5,88 L 35,88 Z" fill={secondaryColor} opacity="0.25" />
        <path d="M 65,52 L 62.5,52 L 62.5,88 L 65,88 Z" fill={secondaryColor} opacity="0.25" />
        
        {/* High-Contrast pure solid white centered bold text inside SVG for perfect responsive rendering */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#ffffff"
          className="font-mono font-black select-none pointer-events-none"
          style={{
            fontSize: '28px',
            textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95), -1px -1px 0 rgba(0,0,0,0.95), 1px -1px 0 rgba(0,0,0,0.95), -1px 1px 0 rgba(0,0,0,0.95), 1px 1px 0 rgba(0,0,0,0.95)'
          }}
        >
          {number}
        </text>
      </svg>
    </div>
  );
}

export default function TeamDetail({
  teamId,
  teams,
  matches,
  predictions,
  currentUser,
  onBack,
  onSavePrediction,
  onTriggerAuth,
  onTeamClick,
  settings
}: TeamDetailProps) {
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <p className="text-rose-400 font-bold">تیم مورد نظر یافت نشد.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-slate-300">بازگشت</button>
      </div>
    );
  }

  const [squad, setSquad] = useState<any>(() => getSquadForTeam(team.id, team.name));
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cardTheme, setCardTheme] = useState<'gold' | 'hero' | 'radioactive' | 'icon'>('gold');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // States and functions for root-level large prediction modal
  const [selectedPredictMatch, setSelectedPredictMatch] = useState<Match | null>(null);
  const [predId, setPredId] = useState<string | null>(null);
  const [homeInput, setHomeInput] = useState<number>(0);
  const [awayInput, setAwayInput] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleOpenPredictModal = (match: Match) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }
    const existing = predictions.find(p => p.matchId === match.id);
    setSelectedPredictMatch(match);
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

  const handleSavePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPredictMatch) return;
    
    setIsSubmitting(true);
    setModalError('');
    
    try {
      const success = await onSavePrediction(selectedPredictMatch.id, homeInput, awayInput);
      if (success) {
        setSelectedPredictMatch(null);
      } else {
        setModalError('خطا در ذخیره پیش‌بینی. بررسی کنید زمان آغاز بازی سپری نشده باشد.');
      }
    } catch (err) {
      console.error(err);
      setModalError('مشکلی در ذخیره پیش‌بینی پیش آمد. لطفاً مجدداً امتحان کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncAISquad = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const tokenVal = localStorage.getItem('wc_token');
      const res = await fetch(`/api/teams/${team.id}/squad/sync-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenVal || ''}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ارتباط با سرور.');
      }
      if (data.success && data.squad) {
        setSquad(data.squad);
        setSyncSuccess('لیست بازیکنان و اطلاعات سرمربی با موفقیت توسط هوش مصنوعی (OpenRouter) به‌روزرسانی شد!');
        setTimeout(() => setSyncSuccess(null), 8000);
      } else {
        throw new Error('ساختار داده برگشتی از هوش مصنوعی معتبر نبود.');
      }
    } catch (err: any) {
      console.error('Error syncing squad with AI:', err);
      setSyncError(err.message || 'خطا در همگام‌سازی ترکیب بازیکنان با هوش مصنوعی.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Load squad from our server cache on mount or ID change
  useEffect(() => {
    let active = true;
    const fetchCachedSquad = async () => {
      try {
        const res = await fetch(`/api/teams/${team.id}/squad`);
        if (res.ok && active) {
          const data = await res.json();
          setSquad(data);
        }
      } catch (err) {
        console.error('Error loading server-cached squad:', err);
      }
    };
    
    // Reset to local preset initially for instant rendering speed
    setSquad(getSquadForTeam(team.id, team.name));
    fetchCachedSquad();
    
    return () => {
      active = false;
    };
  }, [team.id]);

  // Sync selected player when squad updates
  useEffect(() => {
    if (squad && squad.players) {
      setSelectedPlayer(squad.players[0] || null);
    } else {
      setSelectedPlayer(null);
    }
  }, [squad]);

  // Get matching team matches (excluding finished ones)
  const teamMatches = matches
    .filter(m => (m.homeTeamId === team.id || m.awayTeamId === team.id) && m.status !== MatchStatus.FINISHED)
    .sort((a, b) => new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime());

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-l from-slate-900 via-slate-950 to-emerald-950/20 border border-slate-800/80 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Back and Team Name */}
        <div className="flex items-center gap-4 z-10">
          <button 
            onClick={onBack}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition-all flex items-center justify-center shrink-0"
            title="بازگشت"
          >
            <ArrowLeft className="h-5 w-5 transform rotate-180" />
          </button>
          
          <div className="flex items-center gap-3.5">
            <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
              <span className="text-4xl select-none leading-none filter drop-shadow-md"><FlagIcon teamIdOrCode={team.id} className="h-10 w-14 rounded-md object-contain" /></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white tracking-tight leading-none text-[21px] sm:text-[21px]">{team.name}</h1>
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-lg font-mono uppercase tracking-widest">{getTeamCode(team.id)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">سرمربی: <span className="text-slate-200 font-bold">{squad ? squad.coach : 'در حال بارگذاری...'}</span> | گروه: <span className="text-amber-400 font-bold">{team.groupName}</span></p>
            </div>
          </div>
        </div>

        {/* Team Overall Stats Indicators */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/80 border border-slate-800/60 p-3 sm:p-4 rounded-2xl z-10 w-full md:w-auto md:min-w-[340px] shadow-lg">
          <div className="text-center px-1">
            <span className="text-[10px] text-rose-400 font-extrabold block">حمله</span>
            <span className="text-md sm:text-lg font-black text-rose-500 font-mono block mt-1">{squad ? squad.stats.attack : '...'}</span>
          </div>
          <div className="text-center border-r border-slate-800/60 px-1">
            <span className="text-[10px] text-amber-400 font-extrabold block">هافبک</span>
            <span className="text-md sm:text-lg font-black text-amber-500 font-mono block mt-1">{squad ? squad.stats.midfield : '...'}</span>
          </div>
          <div className="text-center border-r border-slate-800/60 px-1">
            <span className="text-[10px] text-emerald-400 font-extrabold block">دفاع</span>
            <span className="text-md sm:text-lg font-black text-emerald-500 font-mono block mt-1">{squad ? squad.stats.defense : '...'}</span>
          </div>
          <div className="text-center border-r border-slate-800/60 bg-emerald-500/5 rounded-lg py-0.5 px-1">
            <span className="text-[10px] text-emerald-400 font-extrabold block">امتیاز کلی</span>
            <span className="text-md sm:text-lg font-black text-emerald-400 font-mono block mt-1">{squad ? squad.stats.overall : '...'}</span>
          </div>
        </div>

      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Left Column on desktop (second item in RTL order) - Starting 11 Visual Soccer pitch */}
        <div className="lg:col-span-7 order-1 lg:order-2 bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-xl min-h-[580px] relative">
          
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
            <div>
              <h2 className="font-extrabold text-white text-[13px] sm:text-[13px]">ترکیب بازی و چیدمان اصلی ({squad.formation})</h2>
              <p className="text-[10px] text-slate-500 font-bold">برای مشاهده مشخصات بازیکن روی پیراهن وی در زمین ضربه بزنید.</p>
            </div>
            <span 
              className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 py-1 rounded-full inline-flex items-center justify-center text-center truncate shrink-0"
              style={{ width: '83.5156px' }}
            >
              {squad.formation}
            </span>
          </div>

          {/* Interactive Soccer pitch layout wrapper with Alternating grass strips */}
          <div 
            className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] border-2 border-white/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-1 select-none"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(180deg, #115e59 0px, #115e59 45px, #134e4a 45px, #134e4a 90px)' 
            }}
          >
            {/* Lawn Visual highlights for high visual depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-emerald-950/20 pointer-events-none" />
            
            {/* Soccer Pitch Graphic lines overlay - White/Green high contrast lines */}
            <div className="absolute inset-0 border-x-4 border-white/20 pointer-events-none" />
            
            {/* Center Line & Center circle line */}
            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/25 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/20 pointer-events-none" />
            
            {/* Top Penalty Area Box (Opposition Side) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/35 rounded-full pointer-events-none" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-8 rounded-b-full border-b border-x-2 border-white/20 pointer-events-none" />

            {/* Bottom Penalty Area Box (Defending Side with Goalkeeper) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/35 rounded-full pointer-events-none" />

            {/* Graphical Goal Nets (دروازه ها) at top and bottom */}
            {/* Top Goal Net Representation */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-emerald-900/40 border-x border-b border-white/50 rounded-b shadow-[0_3px_6px_rgba(0,0,0,0.5)] z-0 flex items-center justify-center opacity-85" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 15%, transparent 20%)', backgroundSize: '3px 3px' }} />
            
            {/* Bottom Goal Net Representation */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-emerald-900/40 border-x border-t border-white/50 rounded-t shadow-[0_-3px_6px_rgba(0,0,0,0.5)] z-0 flex items-center justify-center opacity-85" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 15%, transparent 20%)', backgroundSize: '3px 3px' }} />

            {/* Starting 11 Visual Placement mapping with Inverted Y orientation (Goalkeeper at bottom) */}
            {(() => {
              const startingPlayers = squad.players.filter(p => p.isStarting);
              const maxS = startingPlayers.length > 0 ? Math.max(...startingPlayers.map(p => p.rating || 0)) : 80;

              return startingPlayers.map((player) => {
                const isChosen = selectedPlayer?.number === player.number;
                const isStar = player.rating === maxS && player.rating >= 80;
                
                // Color configuration of soccer jerseys based on playing roles
                let primaryColor = '#2563eb'; // Default royal blue
                let secondaryColor = '#ffffff'; // White

                if (player.position === 'GK') {
                  primaryColor = '#fbbf24'; // Vivid Gold
                  secondaryColor = '#1e293b'; // Slate Dark
                } else if (player.position === 'DF') {
                  primaryColor = '#1e3a8a'; // Deep Navy Blue
                  secondaryColor = '#93c5fd'; // Light Blue
                } else if (player.position === 'MF') {
                  primaryColor = '#059669'; // Rich Emerald
                  secondaryColor = '#a7f3d0'; // Mint Accent
                } else if (player.position === 'FW') {
                  primaryColor = '#dc2626'; // Energetic Crimson Red
                  secondaryColor = '#fef08a'; // Bright Yellow
                }

                return (
                  <button
                    key={`${player.name}-${player.number}`}
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-200 focus:outline-none"
                    style={{ 
                      top: `${100 - player.gridPos.y}%`, 
                      left: `${player.gridPos.x}%` 
                    }}
                  >
                    {/* Pulsating glowing star ring behind star players */}
                    {isStar && (
                      <div className="absolute top-[8px] sm:top-[12px] left-1/2 -translate-x-1/2 w-8 h-8 sm:w-11 sm:h-11 pointer-events-none -z-5">
                        <span className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping duration-1500" />
                        <span className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 blur-md rounded-full animate-pulse" />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black px-1.5 py-[1px] rounded-full text-[6px] sm:text-[7.5px] tracking-wide uppercase shadow-lg border border-amber-300">⭐ STAR</div>
                      </div>
                    )}

                    {/* Visual Jersey representation with readable number */}
                    <ShirtIcon 
                      primaryColor={primaryColor} 
                      secondaryColor={secondaryColor} 
                      number={player.number} 
                      isChosen={isChosen} 
                    />

                    {/* Highly legible player name tag beneath the jersey */}
                    <div className={`mt-1 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9.5px] font-extrabold shadow-md max-w-[70px] sm:max-w-[95px] truncate text-center transition-all ${
                      isChosen 
                        ? 'bg-emerald-400 text-slate-950 font-black scale-105 border border-emerald-300' 
                        : 'bg-slate-950/90 text-slate-200 group-hover:bg-slate-900 border border-slate-800'
                    }`}>
                      {player.name.split(' ').slice(-1)[0]}
                    </div>
                  </button>
                );
              });
            })()}

          </div>

          {/* Render selected player stats & profile details */}
          {selectedPlayer && (
            <div className="mt-5 p-5 bg-slate-900 border border-slate-800/80 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-3 duration-250 text-right" dir="rtl">
              
              {/* Left Column: Visual representation of rating without any player photos or virtual cards */}
              <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl w-full md:w-44 text-center">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">قدرت کل بازیکن</span>
                <div className="relative my-4 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600/10 to-amber-500/20 border-2 border-amber-500/30 shadow-inner">
                  <span className="text-4xl font-black text-amber-500 font-sans tracking-tighter">
                    {selectedPlayer.rating || 78}
                  </span>
                </div>
                <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black font-mono text-slate-300">
                  {selectedPlayer.position}
                </div>
              </div>

              {/* Right Column: Attribute Details and Info card */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5 mb-2.5">
                    <h3 className="text-xl font-black text-white">
                      {selectedPlayer.name}
                    </h3>
                    <span className="text-xs bg-slate-950 text-emerald-400 border border-emerald-950 px-3 py-1 rounded-xl font-mono font-black">
                      شماره {selectedPlayer.number}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-3 font-sans">
                    <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[10px] font-bold">پست تخصصی</span>
                      <span className="text-slate-200 font-black block mt-0.5">
                        {selectedPlayer.position === 'GK' ? '💥 دروازه‌بان' : selectedPlayer.position === 'DF' ? '🛡️ مدافع' : selectedPlayer.position === 'MF' ? '⚡ هافبک' : '⚽ مهاجم'}
                      </span>
                    </div>
                    <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[10px] font-bold">سن بازیکن</span>
                      <span className="text-slate-200 font-black block mt-0.5">{selectedPlayer.age || 26} سال</span>
                    </div>
                    <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[10px] font-bold">باشگاه فعلی</span>
                      <span className="text-slate-200 font-black block mt-0.5 truncate">{selectedPlayer.club || 'تیم ملی'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Visual Right Column on desktop (first item in RTL order) - Fixtures and full roster squad */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
          
          {/* 1. All Fixtures and Matches Schedule panel */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
            <h2 className="text-md sm:text-lg font-extrabold text-white border-b border-slate-800/60 pb-3 mb-4 flex items-center gap-2">
              📅 بازی‌های جام جهانی {team.name}
            </h2>

            <div className="space-y-4">
              {teamMatches.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 space-y-2">
                  <p className="text-xs text-slate-400 font-extrabold leading-relaxed">بازی برنامه‌ریزی‌ شده‌ای در حال حاضر وجود ندارد.</p>
                  <p className="text-[10px] text-emerald-400 font-bold bg-emerald-950/25 border border-emerald-900 px-3 py-1.5 rounded-xl">
                    💡 با صعود این تیم از مرحله گروهی، بازی‌های مراحل بعدی حذفی به‌صورت خودکار در این صفحه نمایش داده خواهند شد.
                  </p>
                </div>
              ) : (
                teamMatches.map((m) => {
                  const pred = predictions.find(p => p.matchId === m.id);
                  return (
                    <FeaturedMatchCard
                      key={m.id}
                      match={m}
                      prediction={pred}
                      currentUser={currentUser}
                      onSavePrediction={onSavePrediction}
                      onTriggerAuth={onTriggerAuth}
                      onTeamClick={onTeamClick}
                      onPredictClick={handleOpenPredictModal}
                      settings={settings}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Full Squad Roster List with detailed cards */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-md sm:text-lg font-extrabold text-white flex items-center gap-2">
                  👤 بازیکنان تیمی
                </h2>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-extrabold px-2 py-0.5 rounded-full">{squad.players.length} بازیکن</span>
              </div>
              
              {currentUser?.role === 'admin' && (
                <button
                  id="btn-sync-ai-squad"
                  onClick={handleSyncAISquad}
                  disabled={isSyncing}
                  className="text-[10px] bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-extrabold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <span className="animate-spin text-emerald-400">⚡</span>
                      در حال همگام‌سازی...
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      بروزرسانی با هوش مصنوعی (OpenRouter)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Call Feedback Banners */}
            {syncError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium leading-relaxed">
                ⚠️ {syncError}
              </div>
            )}
            {syncSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold leading-relaxed">
                ✅ {syncSuccess}
              </div>
            )}

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {squad.players.map((p) => {
                const isChosen = selectedPlayer?.number === p.number;
                return (
                  <div 
                    key={`${p.name}-${p.number}`}
                    onClick={() => setSelectedPlayer(p)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-right ${
                      isChosen 
                        ? 'bg-slate-900 border-emerald-500/30 shadow-md' 
                        : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/55 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-black text-white ${
                        p.position === 'GK' ? 'bg-amber-500/30' : p.position === 'DF' ? 'bg-blue-500/30' : p.position === 'MF' ? 'bg-emerald-500/30' : 'bg-rose-500/30'
                      }`}>
                        {p.number}
                      </span>
                      <div>
                        <h4 className={`text-xs font-black ${isChosen ? 'text-amber-400' : 'text-slate-200'}`}>{p.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-sans font-bold">
                          {p.position === 'GK' ? '💥 دروازه‌بان' : p.position === 'DF' ? '🛡️ مدافع' : p.position === 'MF' ? '⚡ هافبک' : '⚽ مهاجم'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-amber-400 font-mono bg-slate-950 border border-slate-850/65 px-2 py-0.5 rounded-lg">
                        امتیاز: {p.rating || 78}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* MATCH PREDICTIONS MODAL FORM */}
      {selectedPredictMatch && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col justify-start sm:justify-center items-center bg-slate-955/95 backdrop-blur-md overflow-y-auto p-0 sm:p-4 text-slate-200" dir="rtl">
          <div className="w-full h-full min-h-screen sm:min-h-0 sm:h-auto sm:max-w-xl bg-slate-900 sm:rounded-3xl border-0 sm:border border-emerald-500/30 overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-950 flex justify-between items-center text-right shrink-0">
              <div>
                <h3 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">🔮 ثبت پیش‌بینی نتیجه مسابقه</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPredictMatch.stage === 'Group Stage' ? 'مرحله گروهی' : selectedPredictMatch.stage === 'Round of 32' ? 'یک‌شانزدهم نهایی' : selectedPredictMatch.stage === 'Round of 16' ? 'یک‌هشتم نهایی' : selectedPredictMatch.stage === 'Quarter Finals' ? 'یک‌چهارم نهایی' : selectedPredictMatch.stage === 'Semi Finals' ? 'نیمه‌نهایی' : selectedPredictMatch.stage === 'Third Place Playoff' ? 'رده‌بندی مقام سوم' : selectedPredictMatch.stage === 'Final' ? 'فینال' : selectedPredictMatch.stage} · ورزشگاه {selectedPredictMatch.stadium}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedPredictMatch(null)}
                className="text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 font-bold transition-all text-sm cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePredict} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Score prediction boxes */}
                <div className="grid grid-cols-7 items-center justify-center p-4 sm:p-6 bg-slate-955/60 rounded-2xl border border-slate-800/80">
                  
                  {/* Home */}
                  <div className="col-span-3 text-center space-y-3">
                    <div className="flex justify-center select-none">
                      <FlagIcon teamIdOrCode={selectedPredictMatch.homeTeamId} className="h-10 w-14 rounded shadow-lg object-contain" />
                    </div>
                    <span className="font-bold text-slate-100 block text-sm truncate max-w-full">{getTeamName(selectedPredictMatch.homeTeamId)}</span>
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
                        className="w-14 bg-slate-955 border border-slate-800 text-center text-xl font-black font-mono text-white rounded-xl focus:outline-none focus:border-emerald-500 py-1.5 focus:ring-1 focus:ring-emerald-500/30"
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
                      <FlagIcon teamIdOrCode={selectedPredictMatch.awayTeamId} className="h-10 w-14 rounded shadow-lg object-contain" />
                    </div>
                    <span className="font-bold text-slate-100 block text-sm truncate max-w-full">{getTeamName(selectedPredictMatch.awayTeamId)}</span>
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
                        className="w-14 bg-slate-955 border border-slate-800 text-center text-xl font-black font-mono text-white rounded-xl focus:outline-none focus:border-emerald-500 py-1.5 focus:ring-1 focus:ring-emerald-500/30"
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
                <div className="p-4 bg-slate-955/40 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-2 text-right">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5 font-sans"><CircleHelp className="h-4 w-4 text-emerald-400 animate-pulse" /> نحوه امتیازدهی مسابقات:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 pr-1 font-sans leading-relaxed">
                    <li>اگر نتیجه را <span className="text-amber-400 font-bold">کاملاً دقیق</span> پیش‌بینی کنید: <span className="text-amber-400 font-extrabold font-sans">۱۰+ امتیاز</span></li>
                    <li>تخمینی که <span className="text-blue-400 font-bold">تفاضل گل صحیح</span> به همراه برنده را درست حدس بزند: <span className="text-blue-400 font-extrabold font-sans">۷+ امتیاز</span></li>
                    <li>اگر صرفاً <span className="text-emerald-400 font-bold">برنده یا تساوی</span> درست باشد اما تفاضل متفاوت باشد: <span className="text-emerald-400 font-extrabold font-sans">۵+ امتیاز</span></li>
                    <li>اگر پیش‌بینی شما کاملاً <span className="text-rose-450 font-bold">اشتباه</span> باشد: <span className="text-slate-500 font-bold font-sans">۰ امتیاز</span></li>
                  </ul>
                </div>

                {modalError && (
                  <div className="p-4 bg-red-955/40 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 font-sans font-medium">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setSelectedPredictMatch(null)}
                  className="flex-1 py-3 bg-slate-850 hover:bg-slate-805 text-slate-300 text-sm font-semibold rounded-xl border border-slate-800 transition-colors font-sans"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-white text-sm font-bold tracking-wide rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  {isSubmitting ? 'در حال ثبت...' : predId ? 'ویرایش پیش‌بینی' : 'ذخیره پیش‌بینی'}
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
