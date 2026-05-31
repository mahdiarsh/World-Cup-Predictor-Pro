import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, Play, Square, Check, CheckCircle2, 
  AlertTriangle, Cpu, Sparkles, Search, ChevronDown, CheckCircle
} from 'lucide-react';
import { teamsSeed, getTeamFlag } from '../data/teams';

interface SquadStatus {
  isAiSynced: boolean;
  playerCount: number;
  coach: string;
}

interface AdminSquadSyncProps {
  onNotify?: (message: string, isError?: boolean) => void;
}

export default function AdminSquadSync({ onNotify }: AdminSquadSyncProps) {
  const [statuses, setStatuses] = useState<Record<string, SquadStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'synced' | 'unsynced'>('all');
  
  // Batch sync states
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [currentSyncIndex, setCurrentSyncIndex] = useState(-1);
  const [syncQueue, setSyncQueue] = useState<string[]>([]);
  const [syncDelay, setSyncDelay] = useState<number>(3); // default 3 seconds
  const [logs, setLogs] = useState<string[]>([]);
  
  const isCancelledRef = useRef(false);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('wc_token');
      const res = await fetch('/api/admin/squads/status', {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      if (!res.ok) throw new Error('خطا در دریافت وضعیت همگام‌سازی بازیکنان.');
      const data = await res.json();
      if (data.status) {
        setStatuses(data.status);
      }
    } catch (err: any) {
      console.error('Error fetching squad statuses:', err);
      if (onNotify) onNotify(err.message || 'خطا در بارگیری آمار بازیکنان.', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('fa-IR');
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 49)]);
  };

  const handleStopSync = () => {
    isCancelledRef.current = true;
    setIsSyncingAll(false);
    addLog('⚠️ همگام‌سازی دسته جمعی توسط مدیر سیستم متوقف شد.');
    if (onNotify) onNotify('همگام‌سازی بازیکنان متوقف گردید.', false);
  };

  const startBatchSync = async (onlyUnsynced: boolean) => {
    if (isSyncingAll) return;
    
    // Check if AI credentials exist
    const token = localStorage.getItem('wc_token');
    
    // Find eligible teams
    const queue: string[] = [];
    for (const team of teamsSeed) {
      const isSynced = statuses[team.id]?.isAiSynced;
      if (!onlyUnsynced || !isSynced) {
        queue.push(team.id);
      }
    }

    if (queue.length === 0) {
      addLog('✅ تمامی تیم‌های انتخاب شده از قبل با هوش مصنوعی همگام‌بندی شده‌اند.');
      if (onNotify) onNotify('هیچ تیمی برای همگام‌سازی یافت نشد.', false);
      return;
    }

    // Set states
    setSyncQueue(queue);
    setIsSyncingAll(true);
    setCurrentSyncIndex(0);
    isCancelledRef.current = false;
    setLogs([]);
    addLog(`🚀 شروع عملیات همگام‌سازی ${queue.length} تیم با هوش مصنوعی (${syncDelay} ثانیه فاصله بین درخواست‌ها)...`);

    // Execution loop
    for (let i = 0; i < queue.length; i++) {
      if (isCancelledRef.current) {
        break;
      }

      setCurrentSyncIndex(i);
      const teamId = queue[i];
      const team = teamsSeed.find(t => t.id === teamId);
      if (!team) continue;

      addLog(`🔊 همگام‌سازی (${i + 1} از ${queue.length}): شروع استخراج بازیکنان کشور [${team.name}] ...`);

      try {
        const res = await fetch(`/api/teams/${teamId}/squad/sync-ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token || ''}`
          }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'پاسخ نامعتبر از سرور.');
        }

        if (data.success && data.squad) {
          // Update status in local state
          setStatuses(prev => ({
            ...prev,
            [teamId]: {
              isAiSynced: true,
              playerCount: data.squad.players?.length || 0,
              coach: data.squad.coach || ''
            }
          }));
          addLog(`✅ [${team.name}] با موفقیت بروز شد! (${data.squad.players?.length || 0} بازیکن واقعی، سرمربی: ${data.squad.coach})`);
        } else {
          throw new Error('ساختار داده هوش مصنوعی نامعتبر بود.');
        }
      } catch (err: any) {
        console.error(`Error syncing squad for ${team.name}:`, err);
        addLog(`❌ خطا در همگام‌سازی تیم [${team.name}]: ${err.message || err}`);
      }

      // Check cancellation and sleep if not last item
      if (i < queue.length - 1 && !isCancelledRef.current) {
        addLog(`⏱️ وقفه ایمن به مدت ${syncDelay} ثانیه برای صرفه‌جویی در مصرف توکن...`);
        await new Promise(resolve => setTimeout(resolve, syncDelay * 1000));
      }
    }

    setIsSyncingAll(false);
    setCurrentSyncIndex(-1);
    if (!isCancelledRef.current) {
      addLog('🏁 عملیات همگام‌سازی دسته‌جمعی با موفقیت به پایان رسید!');
      if (onNotify) onNotify('همگام‌سازی دسته‌جمعی بازیکنان با موفقیت خاتمه یافت!', false);
    }
  };

  // Filter and compute statistics
  const totalTeamsCount = teamsSeed.length;
  const syncedCount = Object.keys(statuses).filter(id => statuses[id]?.isAiSynced).length;
  const unsyncedCount = totalTeamsCount - syncedCount;

  const filteredTeams = teamsSeed.filter(team => {
    const status = statuses[team.id];
    const isSynced = status?.isAiSynced;
    
    if (filterType === 'synced' && !isSynced) return false;
    if (filterType === 'unsynced' && isSynced) return false;
    
    if (searchQuery) {
      return team.name.includes(searchQuery) || team.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) || team.groupName.includes(searchQuery);
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 text-right" dir="rtl">
      
      {/* Header and description */}
      <div className="space-y-2 border-b border-slate-850 pb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400" />
              <span>همگام‌سازی دسته‌جمعی بازیکنان و کادر فنی با هوش مصنوعی</span>
            </h3>
            <p className="text-slate-400 text-xs">
              لیست بازیکنان واقعی، سرمربی و ریتینگ‌های رسمی ۴۸ تیم جام جهانی را در یک فرآیند دسته‌جمعی هوشمند از طریق وب‌سرویس OpenRouter استخراج و بازنویسی کنید.
            </p>
          </div>
          <button
            onClick={fetchStatuses}
            disabled={isLoading || isSyncingAll}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-[11px] text-slate-300 transition-all font-bold cursor-pointer disabled:opacity-40"
          >
            {isLoading ? 'در حال دریافت...' : '🔄 بروزرسانی وضعیت'}
          </button>
        </div>
      </div>

      {/* Info Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500">مجموع تیم‌ها</p>
            <p className="text-xl font-black text-white mt-1 font-sans">{totalTeamsCount} تیم</p>
          </div>
          <span className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-lg border border-slate-800">🌍</span>
        </div>
        
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex items-center justify-between border-r-2 border-r-emerald-500">
          <div>
            <p className="text-[10px] text-slate-500">بروز شده با هوش مصنوعی</p>
            <p className="text-xl font-black text-emerald-400 mt-1 font-sans">{syncedCount} تیم</p>
          </div>
          <span className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center text-lg text-emerald-400">🤖</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex items-center justify-between border-r-2 border-r-amber-500">
          <div>
            <p className="text-[10px] text-slate-500">ترکیب فرضی اولیه / غیرافتتاحی</p>
            <p className="text-xl font-black text-amber-500 mt-1 font-sans">{unsyncedCount} تیم</p>
          </div>
          <span className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/25 flex items-center justify-center text-lg text-amber-400">⚙️</span>
        </div>
      </div>

      {/* Controller Station */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-300">⚙️ کنسول کنترل فرآیند شبیه‌ساز</h4>
            <p className="text-[10px] text-slate-500">فرآیند همگام‌ساز را به صورت زمان‌دار آغاز کنید. برای حفاظت از سهمیه توکن، حتماً گزینه همگام‌سازی تیم‌های باقی‌مانده را ترجیح دهید.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold pr-1">فاصله وقفه مکالمه:</span>
            <select
              value={syncDelay}
              onChange={e => setSyncDelay(Number(e.target.value))}
              disabled={isSyncingAll}
              className="bg-transparent text-amber-400 text-[10px] font-black focus:outline-none cursor-pointer outline-none font-sans"
            >
              <option value="1" className="bg-slate-950 text-slate-350">۱ ثانیه (آزمایشی سریع)</option>
              <option value="3" className="bg-slate-950 text-slate-350">۳ ثانیه (توصیه امن)</option>
              <option value="5" className="bg-slate-950 text-slate-350">۵ ثانیه (حداکثر سهمیه)</option>
              <option value="8" className="bg-slate-950 text-slate-350">۸ ثانیه (کند و ایمن)</option>
            </select>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isSyncingAll ? (
            <button
              onClick={handleStopSync}
              className="flex-1 py-3 bg-red-650 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Square className="h-4 w-4 fill-white" />
              <span>توقف فوری و لغو همگام‌سازی دسته جمعی</span>
            </button>
          ) : (
            <>
              <button
                disabled={isLoading || unsyncedCount === 0}
                onClick={() => startBatchSync(true)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:opacity-40 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20 active:scale-95 text-center"
              >
                <Sparkles className="h-4 w-4 text-slate-950" />
                <span>همگام‌سازی فقط تیم‌های باقی‌مانده ({unsyncedCount} تیم - ذخیره کلید توکن)</span>
              </button>

              <button
                disabled={isLoading}
                onClick={() => {
                  if (window.confirm('آیا مطمئن هستید که می‌خواهید فرآیند خواندن ترکیب تمامی ۴۸ تیم را بازنویسی کنید؟ این فرآیند ممکن است توکن‌های زیادی مصرف کند.')) {
                    startBatchSync(false);
                  }
                }}
                className="py-3 px-5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className="h-4 w-4" />
                <span>بروزرسانی مجدد کل ۴۸ تیم</span>
              </button>
            </>
          )}
        </div>

        {/* Sync Progress Indicator */}
        {isSyncingAll && (
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">تیم در حال پردازش:</span>
              <span className="font-bold text-white font-sans">
                {currentSyncIndex + 1} از {syncQueue.length} (
                {Math.round(((currentSyncIndex + 1) / syncQueue.length) * 100)}%)
              </span>
            </div>

            {/* Simulated progress slider/bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentSyncIndex + 1) / syncQueue.length) * 100}%` }}
              />
            </div>

            {(() => {
              const activeId = syncQueue[currentSyncIndex];
              const activeTeam = teamsSeed.find(t => t.id === activeId);
              if (!activeTeam) return null;
              return (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 text-xs">
                  <span className="text-sm">{getTeamFlag(activeId)}</span>
                  <span className="font-extrabold text-emerald-400">{activeTeam.name}</span>
                  <span className="text-slate-500 text-[10px] pr-2 border-r border-slate-850">درگاه OpenRouter در حال پاسخ‌دهی است...</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* Console Logger Block */}
        {(logs.length > 0 || isSyncingAll) && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400">🖥️ ریز گزارشات زنده (Logs):</span>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] text-slate-500 hover:text-slate-400"
              >
                پاک کردن لاگ‌ها
              </button>
            </div>
            <div className="h-32 bg-slate-950 rounded-xl border border-slate-850 p-3 overflow-y-auto block text-left font-mono text-[9px] text-slate-350 space-y-1 leading-relaxed shadow-inner" dir="ltr">
              {logs.length === 0 ? (
                <p className="text-slate-650 italic text-center py-8">لاگی ثبت نشده است.</p>
              ) : (
                logs.map((log, index) => (
                  <p key={index} className="truncate select-none">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Roster list explorer & search tool */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="جستجو در نام کشور، کد یا گروه مسابقه..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pr-9 pl-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            {(['all', 'synced', 'unsynced'] as const).map(type => {
              const labelMap = { all: 'همه تیم‌ها', synced: 'فقط هوش مصنوعی', unsynced: 'فقط ترکیب فرضی' };
              const isSelected = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {labelMap[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Teams Grid list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filteredTeams.map(team => {
            const status = statuses[team.id];
            const isSynced = status?.isAiSynced;
            
            return (
              <div 
                key={team.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all text-right relative overflow-hidden group ${
                  isSynced 
                    ? 'bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/20' 
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                }`}
              >
                {/* Glow decor for synced items */}
                {isSynced && (
                  <div className="absolute top-0 right-0 h-10 w-10 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">{team.groupName}</span>
                    <span className="text-base select-none shrink-0">{getTeamFlag(team.id)}</span>
                  </div>
                  <h5 className="font-extrabold text-white text-xs truncate pt-1">{team.name}</h5>
                  {isSynced ? (
                    <div className="space-y-1 pt-1.5 border-t border-slate-900">
                      <p className="text-[9px] text-slate-400 truncate">سرمربی: <span className="text-white font-bold">{status.coach || 'نامشخص'}</span></p>
                      <p className="text-[9px] text-slate-500 font-sans">{status.playerCount} بازیکن واقعی ثبت‌شده</p>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-slate-900">
                      <p className="text-[9px] text-amber-500 italic">لیست اولیه فرضی</p>
                      <p className="text-[9px] text-slate-500">بدون همگام‌سازی زنده</p>
                    </div>
                  )}
                </div>

                <div className="pt-1 text-left flex justify-between items-center font-sans">
                  {isSynced ? (
                    <span className="inline-flex items-center gap-1 text-[8.5px] px-1.5 py-0.5 bg-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-md font-bold font-sans">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                      بروز شده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8.5px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-bold font-sans">
                      آماده بروزرسانی
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTeams.length === 0 && (
            <div className="p-8 text-center col-span-full border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 font-medium">هیچ تیمی مطابق فیلتر یا جستجوی شما یافت نشد.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
