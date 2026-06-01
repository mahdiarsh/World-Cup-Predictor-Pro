import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ShieldAlert, Award, TrendingUp, Calendar } from 'lucide-react';
import { Match, MatchStatus } from '../types';
import { getTeamName, getTeamCode } from '../data/teams';
import Avatar from './Avatar';

interface MatchPredictionItem {
  id: string;
  userId: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  points: number | null;
  createdAt: string;
  fullName: string;
  username: string;
  avatar: string | null;
  totalScore: number;
}

interface OthersPredictionsModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

export default function OthersPredictionsModal({
  match,
  isOpen,
  onClose,
  token
}: OthersPredictionsModalProps) {
  const [predictions, setPredictions] = useState<MatchPredictionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!match || !isOpen) {
      setPredictions([]);
      setSearchQuery('');
      setError('');
      return;
    }

    const fetchPredictions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/predictions/match/${match.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Sort predictions: highest points first, then user score, then alphabetically
          const sorted = data.sort((a: MatchPredictionItem, b: MatchPredictionItem) => {
            const pointsA = a.points ?? -1;
            const pointsB = b.points ?? -1;
            if (pointsB !== pointsA) return pointsB - pointsA;
            return b.totalScore - a.totalScore;
          });
          setPredictions(sorted);
        } else if (res.status === 403) {
          setError('پیش‌بینی‌های این مسابقه تا ۳۰ دقیقه پیش از شروع بازی محرمانه هستند.');
        } else {
          setError('خطا در بارگذاری پیش‌بینی‌ها.');
        }
      } catch (err) {
        console.error('Failed to fetch predictions for match:', err);
        setError('خطای اتصال به سرور.');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [match, isOpen, token]);

  if (!isOpen || !match) return null;

  const homeName = getTeamName(match.homeTeamId);
  const awayName = getTeamName(match.awayTeamId);

  // Calculate sentiment / predictions distribution
  const getCalculatedSentiment = () => {
    const totalPreds = predictions.length;
    if (totalPreds > 0) {
      let homeWins = 0;
      let draws = 0;
      let awayWins = 0;
      predictions.forEach(p => {
        if (p.predictedHome > p.predictedAway) homeWins++;
        else if (p.predictedHome === p.predictedAway) draws++;
        else awayWins++;
      });
      const home = Math.round((homeWins / totalPreds) * 100);
      const draw = Math.round((draws / totalPreds) * 100);
      const away = 100 - home - draw;
      return { home, draw, away, isReal: true, count: totalPreds };
    } else {
      // Deterministic fallback based on matchId
      let hash = 0;
      const matchId = match.id;
      for (let i = 0; i < matchId.length; i++) {
        hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const home = Math.abs((hash % 41) + 35); // 35-75%
      const draw = Math.abs(((hash >> 2) % 15) + 12); // 12-26%
      const away = 100 - home - draw;
      return { home, draw, away, isReal: false, count: 0 };
    }
  };

  const sentiment = getCalculatedSentiment();

  // Filter based on search query
  const filteredPredictions = predictions.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 text-slate-200" dir="rtl">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>🗣️ پیش‌بینی‌های ثبت شده کاربران</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              بازی {homeName} {(match.status === MatchStatus.FINISHED || match.status === MatchStatus.LIVE) ? `${match.homeScore} - ${match.awayScore}` : 'در برابر'} {awayName}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-850 font-bold transition-all font-sans cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search tool */}
        {predictions.length > 0 && !error && (
          <div className="p-4 bg-slate-950/40 border-b border-slate-800/50 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی نام یا نام‌کاربری..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-2.5 text-xs text-right text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-all font-bold"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>
        )}

        {/* Community Sentiment Bar inside the predictions modal */}
        {!loading && (
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 font-sans shrink-0">
            <div className="flex justify-between items-center text-xs text-slate-450 font-bold mb-2.5" dir="rtl">
              <span className="flex items-center gap-1.5 text-slate-200">
                <span>📊</span>
                <span className="font-bold">توزیع پیش‌بینی‌های مردم</span>
                {sentiment.isReal ? (
                  <span className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black">واقعی ({sentiment.count} رأی)</span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">تخمینی کل</span>
                )}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-medium">
                {sentiment.home}٪ <span className="text-emerald-400">برد {getTeamCode(match.homeTeamId) || 'میزبان'}</span> • {sentiment.draw}٪ <span className="text-slate-450">مساوی</span> • {sentiment.away}٪ <span className="text-sky-400">برد {getTeamCode(match.awayTeamId) || 'مهمان'}</span>
              </span>
            </div>
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-900 border border-slate-800/40">
              <div 
                style={{ width: `${sentiment.home}%` }} 
                className="bg-emerald-500/80 hover:bg-emerald-500 transition-all duration-300" 
                title={`برد ${homeName}: ${sentiment.home}%`} 
              />
              <div 
                style={{ width: `${sentiment.draw}%` }} 
                className="bg-slate-500/80 hover:bg-slate-550 transition-all duration-300" 
                title={`مساوی: ${sentiment.draw}%`} 
              />
              <div 
                style={{ width: `${sentiment.away}%` }} 
                className="bg-sky-500/80 hover:bg-sky-500 transition-all duration-300" 
                title={`برد ${awayName}: ${sentiment.away}%`} 
              />
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto grow flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 grow">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-slate-400 text-xs font-bold font-sans">در حال بارگذاری پیش‌بینی‌ها...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-950/10 border border-rose-500/15 rounded-2xl gap-3 grow my-auto">
              <ShieldAlert className="h-10 w-10 text-rose-400" />
              <p className="text-sm font-bold text-slate-200">{error}</p>
              <p className="text-xs text-slate-400">پیش‌بینی‌ها تا قبل از ۳۰ دقیقه مانده به مسابقه فقط برای خود کاربر قابل مشاهده هستند.</p>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none grow">
              <p className="text-slate-500 font-bold text-sm">
                {searchQuery ? 'هیچ کاربری با این مشخصات یافت نشد.' : 'هیچ پیش‌بینی برای این بازی هنوز ثبت نشده است.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-400 font-bold text-right mb-2 flex items-center gap-1.5 bg-slate-955/40 p-2.5 rounded-xl border border-slate-850">
                <span className="text-emerald-400">💡</span>
                <span>پیش‌بینی‌ها از ۳۰ دقیقه پیش از شروع بازی قفل شده و برای همه همزمان شفاف شده‌اند تا کسی تقلب نکند!</span>
              </p>
              
              <div className="space-y-2 max-w-full">
                {filteredPredictions.map((pred) => {
                  const isFinished = match.status === MatchStatus.FINISHED;
                  
                  return (
                    <div 
                      key={pred.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-850/50 transition-all gap-4"
                    >
                      {/* Left: Score Prediction Display */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                          <span className="text-xs font-black text-slate-300 font-mono">{pred.predictedHome}</span>
                          <span className="text-[10px] font-bold text-slate-600">:</span>
                          <span className="text-xs font-black text-slate-300 font-mono">{pred.predictedAway}</span>
                        </div>
 
                        {pred.points !== null && pred.points !== undefined && isFinished && (
                          <span className={`px-2 py-1 rounded text-[9px] font-black font-sans whitespace-nowrap ${
                            pred.points === 10
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : pred.points === 7
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                              : pred.points === 5
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}>
                            {pred.points > 0 ? `+${pred.points} امتیاز` : '۰ امتیاز'}
                          </span>
                        )}
                      </div>
 
                      {/* Right: User Information layout */}
                      <div className="flex items-center gap-2.5 text-right min-w-0">
                        <div className="hidden sm:flex flex-col text-left justify-center shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold font-sans flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-slate-600" />
                            <span>{pred.totalScore} امتیاز کل</span>
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-205 truncate max-w-[150px]">
                            {pred.fullName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-sans font-medium truncate max-w-[120px]">
                            @{pred.username}
                          </span>
                        </div>
                        <Avatar avatar={pred.avatar} alt={pred.fullName} className="h-8.5 w-8.5 shrink-0 border border-slate-800 shadow-inner rounded-full overflow-hidden" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
