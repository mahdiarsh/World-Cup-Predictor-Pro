import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Calendar, Trophy, Zap, Trash2, 
  UserX, UserCheck, Key, Plus, Edit2, Check, RefreshCw, Download
} from 'lucide-react';
import { User, Match, UserRole, MatchStage, MatchStatus } from '../types';
import { teamsSeed, getTeamName, getTeamFlag } from '../data/teams';
import Avatar from './Avatar';
import FlagIcon from './FlagIcon';

interface AdminPanelProps {
  currentUser: User | null;
  users: User[];
  matches: Match[];
  onAddMatch: (match: any) => Promise<boolean>;
  onEditMatch: (id: string, updates: any) => Promise<boolean>;
  onSetMatchResult: (id: string, home: number, away: number) => Promise<boolean>;
  onDeleteMatch: (id: string) => Promise<boolean>;
  onAddUser: (user: any) => Promise<boolean>;
  onEditUser: (id: string, updates: any) => Promise<boolean>;
  onDisableUser: (id: string) => Promise<boolean>;
  onResetPassword: (id: string, newPass: string) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onRecalculateScores: () => Promise<boolean>;
  registrationEnabled?: boolean;
  onToggleRegistration?: (enabled: boolean) => Promise<boolean>;
  onDownloadDB?: () => Promise<boolean>;
  settings?: any;
  onUpdateSettings?: (updates: any) => Promise<boolean>;
}

export default function AdminPanel({
  currentUser,
  users,
  matches,
  onAddMatch,
  onEditMatch,
  onSetMatchResult,
  onDeleteMatch,
  onAddUser,
  onEditUser,
  onDisableUser,
  onResetPassword,
  onDeleteUser,
  onRecalculateScores,
  registrationEnabled = true,
  onToggleRegistration,
  onDownloadDB,
  settings = {},
  onUpdateSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'engine'>('matches');

  // Success / Error alerts
  const [statusMsg, setStatusMsg] = useState('');
  const [statusErr, setStatusErr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDatabase = async () => {
    if (!onDownloadDB) return;
    setIsDownloading(true);
    const succ = await onDownloadDB();
    setIsDownloading(false);
    if (succ) {
      triggerAlert('پایگاه داده کل با موفقیت دانلود شد!');
    } else {
      triggerAlert('خطا در بارگیری نسخه پشتیبان دیتابیس.', true);
    }
  };

  // Users forms states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [uUsername, setUUsername] = useState('');
  const [uFullName, setUFullName] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<UserRole>(UserRole.USER);

  const [passResetOpen, setPassResetOpen] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Matches forms states
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [mHomeTeamId, setMHomeTeamId] = useState('t1');
  const [mAwayTeamId, setMAwayTeamId] = useState('t2');
  const [mStage, setMStage] = useState<MatchStage>(MatchStage.GROUP);
  const [mStadium, setMStadium] = useState('');
  const [mKickoff, setMKickoff] = useState('');

  const [scoreSetOpen, setScoreSetOpen] = useState<string | null>(null);
  const [sHomeScore, setSHomeScore] = useState<number>(0);
  const [sAwayScore, setSAwayScore] = useState<number>(0);

  const triggerAlert = (msg: string, isErr = false) => {
    if (isErr) {
      setStatusErr(msg);
      setStatusMsg('');
    } else {
      setStatusMsg(msg);
      setStatusErr('');
    }
    setTimeout(() => {
      setStatusMsg('');
      setStatusErr('');
    }, 4500);
  };

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'Group Stage': 'مرحله گروهی',
    'Round of 32': 'یک‌سی‌ودوم نهایی',
    'Round of 16': 'یک‌هشتم نهایی',
    'Quarter Finals': 'یک‌چهارم نهایی',
    'Semi Finals': 'نیمه‌نهایی',
    'Third Place Playoff': 'رده‌بندی مقام سوم',
    'Final': 'فینال'
  };

  // User submissions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uUsername || !uFullName || !uPassword) {
      triggerAlert('لطفاً اطلاعات تمام فیلدهای مشخص شده کاربر را وارد کنید.', true);
      return;
    }
    const succ = await onAddUser({ username: uUsername, fullName: uFullName, password: uPassword, role: uRole });
    if (succ) {
      triggerAlert(`کاربر شرکت‌کننده "${uUsername}" با موفقیت ایجاد شد!`);
      setUserFormOpen(false);
      setUUsername('');
      setUFullName('');
      setUPassword('');
    } else {
      triggerAlert('خطا در ایجاد کاربر. بررسی کنید که نام کاربری از پیش وجود نداشته باشد.', true);
    }
  };

  const handleResetPasswordSubmit = async (userId: string) => {
    if (!newPassword.trim()) return;
    const succ = await onResetPassword(userId, newPassword);
    if (succ) {
      triggerAlert('گذرواژه جدید با موفقیت بروزرسانی شد!');
      setPassResetOpen(null);
      setNewPassword('');
    } else {
      triggerAlert('خطا در بروزرسانی گذرواژه کاربر.', true);
    }
  };

  // Match submissions
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mHomeTeamId === mAwayTeamId) {
      triggerAlert('تیم میزبان و میهمان نمی‌توانند یکسان باشند.', true);
      return;
    }
    if (!mStadium || !mKickoff) {
      triggerAlert('لطفاً استادیوم محل برگزاری و زمان برگزاری بازی را مشخص کنید.', true);
      return;
    }
    const succ = await onAddMatch({
      homeTeamId: mHomeTeamId,
      awayTeamId: mAwayTeamId,
      stage: mStage,
      stadium: mStadium,
      kickoffTimeUtc: new Date(mKickoff).toISOString()
    });

    if (succ) {
      triggerAlert('مسابقه تورنمنت جدید با موفقیت ثبت گردید!');
      setMatchFormOpen(false);
      setMStadium('');
      setMKickoff('');
    } else {
      triggerAlert('خطا در ثبت اطلاعات مسابقه.', true);
    }
  };

  const handleSetResults = async (matchId: string) => {
    const succ = await onSetMatchResult(matchId, sHomeScore, sAwayScore);
    if (succ) {
      triggerAlert('نتیجه با موفقیت ثبت شد و جدول امتیاز کاربران مجدداً محاسبه گردید!');
      setScoreSetOpen(null);
    } else {
      triggerAlert('خطا در ثبت نتایج مسابقه.', true);
    }
  };

  const handleRecalculateEngine = async () => {
    setIsRefreshing(true);
    const succ = await onRecalculateScores();
    setIsRefreshing(false);
    if (succ) {
      triggerAlert('موتور محاسباتی با موفقیت اجرا شد! جداول امتیازدهی کاملاً همگام هستند.');
    } else {
      triggerAlert('خطا در پردازش مجدد نتایج در هسته محاسباتی.', true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-right font-sans" dir="rtl">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-500 rounded-xl text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              سامانه کنترل مدیریت <span className="text-amber-400">پیش‌بینی فوتبال</span>
            </h2>
            <p className="text-xs text-slate-400">مدیریت شرکت‌ها، مسابقات، تنظیم نتایج نهایی و اجرای دقیق پردازش امتیازات.</p>
          </div>
        </div>

        {/* Global Notifications Banners */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 inline ml-1.5" /> کاربران ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'matches' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4 inline ml-1.5" /> مسابقات ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'engine' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4 inline ml-1.5" /> هندل امتیازات
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4.5 w-4.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      {statusErr && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <span>⚠️ {statusErr}</span>
        </div>
      )}

      {/* -------------------- USERS MANAGEMENT TAB -------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">مدیریت شرکت‌کنندگان</h3>
            <button
              onClick={() => setUserFormOpen(prev => !prev)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> تعریف شرکت‌کننده جدید
            </button>
          </div>

          {/* User Registration Form Collapse */}
          {userFormOpen && (
            <form onSubmit={handleCreateUser} className="bg-slate-900/50 p-5 rounded-2xl border border-emerald-500/10 grid grid-cols-1 sm:grid-cols-4 gap-4" dir="rtl">
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">نام کاربری</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 09123456789"
                  value={uUsername}
                  onChange={e => setUUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  placeholder="لیونل مسی"
                  value={uFullName}
                  onChange={e => setUFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">گذرواژه اولیه</label>
                <input
                  type="password"
                  required
                  placeholder="********"
                  value={uPassword}
                  onChange={e => setUPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider rounded-lg transition-colors"
                >
                  ایجاد حساب کاربری شرکت‌کننده
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto bg-slate-900/10 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="px-5 py-3 text-right">شرکت‌کننده</th>
                  <th className="px-5 py-3 text-center">نقش</th>
                  <th className="px-5 py-3 text-center">کل امتیاز</th>
                  <th className="px-5 py-3 text-center">دقیق / درست</th>
                  <th className="px-5 py-3 text-center">وضعیت</th>
                  <th className="px-5 py-3 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/30">
                    <td className="px-5 py-3 flex items-center gap-3 text-right">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 shrink-0 select-none">
                        <Avatar avatar={u.avatar} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-100 block">{u.fullName}</span>
                        <span className="text-slate-500 font-mono">@{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-sans ${u.role === UserRole.ADMIN ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' : 'bg-slate-800 text-slate-400'}`}>
                        {u.role === UserRole.ADMIN ? 'مدیر ارشد' : 'کاربر'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold font-mono text-emerald-400 text-sm">
                      {u.totalScore}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-slate-400">
                      {u.exactPredictions} <span className="text-slate-600">/</span> {u.correctPredictions}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${u.isDisabled ? 'bg-red-500' : 'bg-emerald-500'}`} title={u.isDisabled ? 'مسدود شده' : 'فعال و معتبر'}></span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Disable */}
                        <button
                          onClick={() => onDisableUser(u.id)}
                          className={`p-1.5 rounded-lg border hover:scale-105 transition-all ${
                            u.isDisabled 
                              ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' 
                              : 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/11'
                          }`}
                          title={u.isDisabled ? 'فعالسازی کاربر' : 'مسدودسازی موقت کاربر'}
                          disabled={u.role === UserRole.ADMIN}
                        >
                          {u.isDisabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>

                        {/* Password reset collapse controller */}
                        <button
                          onClick={() => setPassResetOpen(passResetOpen === u.id ? null : u.id)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 bg-slate-950/40 hover:text-white"
                          title="تنظیم گذرواژه جدید"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => {
                            if (window.confirm(`آیا از حذف دائمی کاربر "${u.fullName}" برای همیشه اطمینان دارید؟ این عملیات به غیرقابل بازیافت است!`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300"
                          title="حذف دائمی کاربر از دیتابیس"
                          disabled={u.role === UserRole.ADMIN}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Reset input collapse */}
                      {passResetOpen === u.id && (
                        <div className="mt-2 flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850" dir="rtl">
                          <input
                            type="text"
                            placeholder="رمز جدید..."
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="bg-slate-900 border-none p-1 rounded text-xs text-white placeholder-slate-600 focus:outline-none"
                          />
                          <button
                            onClick={() => handleResetPasswordSubmit(u.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded font-bold text-[10px]"
                          >
                            ثبت
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- FIXTURES MANAGEMENT TAB -------------------- */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">لیست کل مسابقات تورنمنت</h3>
            <button
              onClick={() => setMatchFormOpen(prev => !prev)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> تعریف مسابقه فوتبالی جدید
            </button>
          </div>

          {/* New Match Register Collapse */}
          {matchFormOpen && (
            <form onSubmit={handleCreateMatch} className="bg-slate-900/55 p-5 rounded-2xl border border-emerald-500/15 space-y-4" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">تیم میزبان (داخل خانه)</label>
                  <select
                    value={mHomeTeamId}
                    onChange={e => setMHomeTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg"
                  >
                    {teamsSeed.map(t => (
                      <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">تیم میهمان (خارج خانه)</label>
                  <select
                    value={mAwayTeamId}
                    onChange={e => setMAwayTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg"
                  >
                    {teamsSeed.map(t => (
                      <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">مرحله برگزاری</label>
                  <select
                    value={mStage}
                    onChange={e => setMStage(e.target.value as MatchStage)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg hover:cursor-pointer"
                  >
                    {Object.values(MatchStage).map(v => (
                      <option key={v} value={v}>{STAGE_TRANSLATIONS[v] || v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">استادیوم محل برگزاری</label>
                  <input
                    type="text"
                    required
                    placeholder="استادیوم آزادی"
                    value={mStadium}
                    onChange={e => setMStadium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">شروع مسابقه (به وقت محلی/UTC)</label>
                  <input
                    type="datetime-local"
                    required
                    value={mKickoff}
                    onChange={e => setMKickoff(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider rounded-xl transition-colors"
                >
                  تایید و ذخیره رسمی بازی در تقویم مسابقات
                </button>
              </div>
            </form>
          )}

          {/* Match listings list admin control rows */}
          <div className="space-y-3">
            {matches.map(m => {
              const homeFlag = getTeamFlag(m.homeTeamId);
              const homeName = getTeamName(m.homeTeamId);
              const awayFlag = getTeamFlag(m.awayTeamId);
              const awayName = getTeamName(m.awayTeamId);

              const kickoffTime = new Date(m.kickoffTimeUtc);

              return (
                <div key={m.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-sans text-emerald-400 uppercase tracking-widest block font-bold">{STAGE_TRANSLATIONS[m.stage] || m.stage}</span>
                    <span className="font-extrabold text-white text-base inline-flex items-center gap-2">
                      <FlagIcon teamIdOrCode={m.homeTeamId} className="h-4 w-6 rounded" />
                      <span>{homeName}</span>
                      <span className="text-slate-500 font-normal text-xs font-sans">در برابر</span>
                      <span>{awayName}</span>
                      <FlagIcon teamIdOrCode={m.awayTeamId} className="h-4 w-6 rounded" />
                    </span>
                    <span className="block text-xs text-slate-500 font-sans mt-1">آغاز مسابقه: {kickoffTime.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · محل برگزاری استادیوم: {m.stadium}</span>
                  </div>

                  {/* Right Score action details */}
                  <div className="flex items-center gap-3.5">
                    {m.status === MatchStatus.FINISHED ? (
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 font-sans">نتیجه نهایی ثبت شده</span>
                        <span className="font-black text-emerald-400 text-lg font-mono">{m.homeScore} : {m.awayScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-500 font-sans tracking-wide px-2 py-0.5 bg-amber-500/5 rounded border border-amber-500/10">برگزار نشده / آینده</span>
                    )}

                    {/* Action toggles */}
                    <div className="flex items-center gap-1.5">
                      
                      {/* Open results edit log panel */}
                      <button
                        onClick={() => {
                          setScoreSetOpen(scoreSetOpen === m.id ? null : m.id);
                          setSHomeScore(m.homeScore || 0);
                          setSAwayScore(m.awayScore || 0);
                        }}
                        className="px-3 py-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-emerald-500/30 text-xs font-bold font-sans transition-colors"
                      >
                        {m.status === MatchStatus.FINISHED ? 'ویرایش نتیجه نهایی' : 'ثبت نتیجه بازی'}
                      </button>

                      {/* Delete Match */}
                      <button
                        onClick={() => {
                          if (window.confirm('آیا مطمئن هستید که می‌خواهید مسابقه و کل پیش‌بینی‌های متصل به آن را حذف کنید؟ این فرآیند امتیازات تمام کاربران را بازنویسی می‌کند!')) {
                            onDeleteMatch(m.id);
                          }
                        }}
                        className="p-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20"
                        title="حذف دائمی بازی از دیتابیس"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </div>

                  {/* Record Match Scores collapsing panel */}
                  {scoreSetOpen === m.id && (
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 mt-2 md:mt-0" dir="rtl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{homeName}</span>
                        <input
                          type="number"
                          min="0"
                          value={sHomeScore}
                          onChange={e => setSHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 bg-slate-900 border border-slate-800 text-center font-black font-mono text-white rounded p-1 text-sm focus:outline-none"
                        />
                        <span className="text-slate-600 font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          value={sAwayScore}
                          onChange={e => setSAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 bg-slate-900 border border-slate-800 text-center font-black font-mono text-white rounded p-1 text-sm focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">{awayName}</span>
                      </div>
                      
                      <button
                        onClick={() => handleSetResults(m.id)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs rounded"
                      >
                        ثبت و اعمال نهایی نتایج
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* -------------------- STATS / ENGINE TAB -------------------- */}
      {activeTab === 'engine' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="text-right space-y-2">
            <h3 className="font-extrabold text-white text-lg">بخش تنظیمات فنی و هسته محاسباتی</h3>
            <p className="text-slate-400 text-xs">
              پیکربندی کلیدی، باز یا بسته کردن مسدودیت ثبت نام کاربران عادی جدید و اجرای موتور پردازش امتیازها.
            </p>
          </div>

          {/* Registration Lock Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
            <div className="space-y-1 text-right">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-sans border ${
                registrationEnabled 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' 
                  : 'bg-red-950/40 text-red-500 border-red-500/10'
              }`}>
                {registrationEnabled ? '🟢 عضویت جدید آزاد است' : '🔴 عضویت جدید بسته است'}
              </span>
              <p className="font-extrabold text-slate-200 text-sm">ارائه دسترسی ثبت‌نام همگانی</p>
              <p className="text-slate-500 text-xs">
                {registrationEnabled 
                  ? 'هر کسی با مراجعه به صفحه تعریف حساب کاربر می‌تواند ثبت نام نماید.' 
                  : 'امکان ساخت کاربر عمومی جدید قفل شده است؛ فقط حساب‌های قدیمی قابل دسترسی می‌باشند.'}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (onToggleRegistration) {
                  onToggleRegistration(!registrationEnabled);
                }
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                registrationEnabled 
                  ? 'bg-red-650 hover:bg-red-500 text-white shadow-lg' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg'
              }`}
            >
              {registrationEnabled ? 'مسدودسازی عضویت عمومی 🔒' : 'آزادسازی عضویت عمومی 🔓'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
            <div className="space-y-1 text-right">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-950/40 text-amber-400 rounded-md font-sans border border-amber-500/10">موتور پردازشی فعال کلاود</span>
              <p className="font-extrabold text-slate-200 text-sm font-sans">محاسبه و همگام‌ساز امتیاز کـل کاربران</p>
              <p className="text-slate-500 text-xs text-right">اجرای محاسبات کامل امتیازدهی با تحلیل دوباره تک به تک پیش‌بینی‌های کل مسابقات جهت سنکرون‌سازی کل جداول رتبه‌ها.</p>
            </div>
            
            <button
              onClick={handleRecalculateEngine}
              disabled={isRefreshing}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 font-sans"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'در حال بازنویسی جدول امتیازها...' : 'اجرای بازنگری مجدد امتیازها'}
            </button>
          </div>

          {/* FIFA Live Sync & Intelligent Simulation Engine */}
          <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 space-y-5 text-right">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-md font-sans border border-emerald-500/15">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  بروزرسانی خودکار زنده فیفا (FIFA Live Sync)
                </span>
                <p className="font-extrabold text-slate-100 text-base">موتور همگام‌ساز زنده هوشمند مسابقات</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  سیستم به صورت خودکار بازی‌ها، نتایج، گل‌ها و صعود تیم‌ها را شبیه‌سازی و زنده همگام‌سازی می‌کند. شما نیازی به وارد کردن تک تک نتایج ندارید!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ syncMode: 'simulation' })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    (settings?.syncMode || 'simulation') === 'simulation'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-250'
                  }`}
                >
                  شبیه‌ساز هوشمند زنده فیفا ⚽
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ syncMode: 'manual' })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    settings?.syncMode === 'manual'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-250'
                  }`}
                >
                  کنترل دستی ادمین 🛠️
                </button>
              </div>
            </div>

            {(settings?.syncMode || 'simulation') === 'simulation' && (
              <div className="space-y-4 pt-1">
                {/* Simulated Time Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1 text-center sm:text-right w-full sm:w-auto">
                    <p className="text-[11px] text-slate-500">تقویم زمانی جاری تورنمنت (Virtual Tournament Time)</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-sm sm:text-lg font-black font-sans text-white tracking-wide">
                        {new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z').toLocaleDateString('fa-IR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-700/30">
                        {new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z').toLocaleTimeString('fa-IR', {
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ isFastForwarding: !settings?.isFastForwarding })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        settings?.isFastForwarding
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse shadow-amber-500/20 shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{settings?.isFastForwarding ? '⏸️ توقف گذر زمان' : '⏩ فعالسازی جلوبر خودکار زمان'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 text-right font-sans block">
                      {settings?.isFastForwarding 
                        ? 'زمان فرضی با سرعت ۶ ساعت در هر ۱۰ ثانیه به جلو می‌رود.' 
                        : 'زمان فرضی سیستم متغیر نیست. برای جلو بردن از پرش‌های زیر استفاده کنید.'}
                    </span>
                  </div>
                </div>

                {/* Quick Jumps */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-extrabold mb-2.5">پرش سریع به مراحل مختلف جام جهانی ۲۰۲۶:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-11T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">مرحله اول گروهی</span>
                      افتتاحیه (۲۱ خرداد) ⚽
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-20T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">مرحله دوم گروهی</span>
                      دور هیجانی (۳۰ خرداد) 🔥
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-26T23:59:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">پایان مرحله گروهی</span>
                      صعود طلایی (۵ تیر) 🥇
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-07-02T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">آغاز بازی‌های حذفی</span>
                      یک شانزدهم (۱۲ تیر) 🏆
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-07-20T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-emerald-950/20 hover:bg-emerald-950/35 border border-emerald-500/10 rounded-lg text-[11px] font-bold text-emerald-400 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-emerald-600">پایان فینال جام جهانی</span>
                      معرفی قهرمان (۲۹ تیر) 🥇
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Database Backup Download Card */}
          {onDownloadDB && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-blue-950/40 text-blue-400 rounded-md font-sans border border-blue-500/10">نسخه پشتیبان سیستم</span>
                <p className="font-extrabold text-slate-200 text-sm">بارگیری مستقیم فایل پایگاه داده (db.json)</p>
                <p className="text-slate-500 text-xs text-right">دانلود نسخه پشتیبان آنلاین کل پروژه شامل لیست کاربران، گذرواژه‌ها و پاسخ‌های ارسالی.</p>
              </div>
              
              <button
                onClick={handleDownloadDatabase}
                disabled={isDownloading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 font-sans"
              >
                <Download className={`h-4.5 w-4.5 ${isDownloading ? 'animate-spin' : ''}`} />
                {isDownloading ? 'در حال بارگیری...' : 'دانلود فایل دیتابیس (JSON)'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
