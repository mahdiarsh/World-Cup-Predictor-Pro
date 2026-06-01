import { useState, useEffect } from 'react';
import { Trophy, Award, Gamepad, Compass, Star, ArrowRight, ShieldAlert, BadgeCheck, Search } from 'lucide-react';
import { User, Match, Prediction, LeaderboardEntry, UserRole, MatchStatus } from './types';
import { getTeamFlag, getTeamCode, teamsSeed } from './data/teams';
import Navbar from './components/Navbar';
import LeaderboardTable from './components/LeaderboardTable';
import MatchesList from './components/MatchesList';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import AuthScreen from './components/AuthScreen';
import GroupStandings from './components/GroupStandings';
import QuickPredictor from './components/QuickPredictor';
import FeaturedMatchCard from './components/FeaturedMatchCard';
import Avatar from './components/Avatar';
import FlagIcon from './components/FlagIcon';
import LegendsList from './components/LegendsList';
import TeamDetail from './components/TeamDetail';
import UserPublicProfileModal from './components/UserPublicProfileModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wc_token'));
  const [settings, setSettings] = useState<any>({ registrationEnabled: true });
  const [selectedPublicUserId, setSelectedPublicUserId] = useState<string | null>(null);
  const [displayTime, setDisplayTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync client-side display clock with backend simulation settings
  useEffect(() => {
    if (settings?.simulatedTime) {
      setDisplayTime(new Date(settings.simulatedTime));
    } else {
      setDisplayTime(null);
    }
  }, [settings?.simulatedTime]);

  // Client-side 1-second interval ticker to ensure smooth second-by-second progression
  useEffect(() => {
    if (settings?.syncMode !== 'simulation' || !displayTime || settings?.isFastForwarding) {
      return;
    }
    const tick = setInterval(() => {
      setDisplayTime(prev => prev ? new Date(prev.getTime() + 1000) : null);
    }, 1000);
    return () => clearInterval(tick);
  }, [settings?.syncMode, settings?.isFastForwarding, !displayTime]);

  // Global State
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Page loaders/errors
  const [errorBanner, setErrorBanner] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Initial loads
  useEffect(() => {
    fetchMatches();
    fetchLeaderboard();
    fetchSettings();
  }, []);

  // Background polling for real-time live match and score updates (every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMatches();
      fetchLeaderboard();
      fetchSettings();
      if (token && currentUser) {
        fetchCurrentUser();
        fetchMyPredictions();
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [token, currentUser?.id]);

  // Sync token loading
  useEffect(() => {
    if (token) {
      localStorage.setItem('wc_token', token);
      fetchCurrentUser();
    } else {
      localStorage.removeItem('wc_token');
      setCurrentUser(null);
      setPredictions([]);
      setUsers([]);
    }
  }, [token]);

  // Sync user forecasts
  useEffect(() => {
    if (currentUser) {
      fetchMyPredictions();
      if (currentUser.role === UserRole.ADMIN) {
        fetchAdminUsers();
      }
    }
  }, [currentUser]);

  // API fetches helpers
  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const triggerError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(''), 4500);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (res.ok) {
        const u = await res.json();
        setCurrentUser(u);
      } else {
        // Token expired/invalid
        setToken(null);
      }
    } catch (err) {
      console.error('Me fetch failed', err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const m = await res.json();
        setMatches(m);
      }
    } catch (err) {
      console.error('Matches fetch failed', err);
    }
  };

  const fetchMyPredictions = async () => {
    try {
      const res = await fetch('/api/predictions/my', { headers: getHeaders() });
      if (res.ok) {
        const p = await res.json();
        setPredictions(p);
      }
    } catch (err) {
      console.error('My predictions fetch failed', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const l = await res.json();
        setLeaderboard(l);
      }
    } catch (err) {
      console.error('Leaderboard fetch failed', err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers: getHeaders() });
      if (res.ok) {
        const u = await res.json();
        setUsers(u);
      }
    } catch (err) {
      console.error('Admin users fetch failed', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const s = await res.json();
        setSettings(s);
      }
    } catch (err) {
      console.error('Settings fetch failed', err);
    }
  };

  const handleUpdateSettings = async (enabled: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ registrationEnabled: enabled })
      });
      if (res.ok) {
        const s = await res.json();
        setSettings(s);
        triggerSuccess(`ثبت‌نام کاربران جدید با موفقیت ${enabled ? 'فعال (آزاد)' : 'غیرفعال (مسدود)'} شد.`);
        return true;
      }
    } catch (err) {
      console.error('Failed to change registration configuration', err);
    }
    return false;
  };

  const handleUpdateFullSettings = async (updatedFields: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const s = await res.json();
        setSettings(s);
        // Instant reload everything to reflect advanced dates, score progressions or standings
        fetchMatches();
        fetchLeaderboard();
        if (currentUser) {
          fetchCurrentUser();
          fetchMyPredictions();
        }
        triggerSuccess(`تنظیمات سامانه شبیه‌سازی با موفقیت اعمال گردید.`);
        return true;
      }
    } catch (err) {
      console.error('Failed to change settings', err);
    }
    return false;
  };

  const handleUpdateAvatar = async (newAvatar: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/users/me/avatar', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ avatar: newAvatar })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        triggerSuccess('تصویر آواتار پروفایل شما با موفقیت به‌روزرسانی شد!');
        fetchLeaderboard();
        return true;
      } else {
        const errData = await res.json();
        triggerError(errData.error || 'خطا در به‌روزرسانی تصویر پروفایل.');
      }
    } catch (err) {
      console.error('Update avatar failed', err);
      triggerError('خطای شبکه در به‌روزرسانی تصویر پروفایل.');
    }
    return false;
  };

  const handleUpdateProfile = async (fullName?: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ fullName, password })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        triggerSuccess('اطلاعات حساب کاربری شما با موفقیت به‌روزرسانی شد!');
        fetchLeaderboard();
        return true;
      } else {
        const errData = await res.json();
        triggerError(errData.error || 'خطا در به‌روزرسانی اطلاعات حساب کاربری.');
      }
    } catch (err) {
      console.error('Update profile failed', err);
      triggerError('خطای شبکه در به‌روزرسانی اطلاعات حساب کاربری.');
    }
    return false;
  };

  // Auth Operations
  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        triggerSuccess(`با موفقیت وارد حساب @${data.user.username} شدید. خوش آمدید.`);
        setCurrentTab('home');
        return true;
      }
    } catch (err) {
      console.error('Login action failed', err);
    }
    return false;
  };

  const handleRegister = async (username: string, fullName: string, pass: string, otpCode?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, password: pass, otpCode })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        triggerSuccess(`عضویت با موفقیت انجام شد! با آرزوی موفقیت در پیش‌بینی مسابقات.`);
        setCurrentTab('home');
        return true;
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در ثبت نام. لطفا اطلاعات را مجددا بررسی کنید.');
      }
    } catch (err) {
      console.error('Register action failed', err);
    }
    return false;
  };

  const handleLogout = () => {
    setToken(null);
    triggerSuccess('با موفقیت از حساب کاربری خود خارج شدید.');
    setCurrentTab('home');
  };

  // Prediction Operations
  const handleSavePrediction = async (matchId: string, home: number, away: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ matchId, predictedHome: home, predictedAway: away })
      });
      if (res.ok) {
        triggerSuccess('پیش‌بینی مسابقه با موفقیت ثبت شد!');
        fetchMyPredictions();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Save prediction failed', err);
    }
    return false;
  };

  const handleSaveBatchPredictions = async (preds: Array<{ matchId: string, home: number, away: number }>): Promise<boolean> => {
    try {
      const res = await fetch('/api/predictions/batch', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ predictions: preds })
      });
      if (res.ok) {
        triggerSuccess(`پیش‌بینی ${preds.length} مسابقه با موفقیت ذخیره شد!`);
        fetchMyPredictions();
        fetchMatches();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Batch save predictions failed', err);
    }
    return false;
  };

  const handleSyncFifa = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/matches/sync-fifa', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        triggerSuccess('نتایج رسمی زنده فیفا با موفقیت همگام‌سازی شد!');
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        return data.message || 'مسابقات با موفقیت با نتایج زنده فیفا همگام‌سازی شدند.';
      } else {
        return data.error || 'خطا در همگام‌سازی مسابقات با فیفا.';
      }
    } catch (err) {
      console.error('Sync FIFA failed', err);
    }
    return null;
  };

  // Admin Matches Operations
  const handleAddMatch = async (match: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(match)
      });
      if (res.ok) {
        fetchMatches();
        return true;
      }
    } catch (err) {
      console.error('Add match failed', err);
    }
    return false;
  };

  const handleEditMatch = async (id: string, updates: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchMatches();
        return true;
      }
    } catch (err) {
      console.error('Edit match failed', err);
    }
    return false;
  };

  const handleSetMatchResult = async (id: string, home: number | null, away: number | null): Promise<boolean> => {
    try {
      const res = await fetch(`/api/matches/${id}/result`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ homeScore: home, awayScore: away })
      });
      if (res.ok) {
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        if (currentUser?.role === UserRole.ADMIN) {
          fetchAdminUsers();
        }
        return true;
      }
    } catch (err) {
      console.error('Set match result failed', err);
    }
    return false;
  };

  const handleDeleteMatch = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Delete match failed', err);
    }
    return false;
  };

  // Admin Users Operations
  const handleAddUser = async (user: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(user)
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Add user failed', err);
    }
    return false;
  };

  const handleEditUser = async (id: string, updates: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Edit user failed', err);
    }
    return false;
  };

  const handleDisableUser = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}/disable`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Disable user failed', err);
    }
    return false;
  };

  const handleResetPassword = async (id: string, newPass: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword: newPass })
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.error('Reset password failed', err);
    }
    return false;
  };

  const handleDeleteUser = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchLeaderboard();
        return true;
      }
    } catch (err) {
      console.error('Delete user failed', err);
    }
    return false;
  };

  const handleRecalculateScores = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/recalculate', {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        if (currentUser?.role === UserRole.ADMIN) {
          fetchAdminUsers();
        }
        return true;
      }
    } catch (err) {
      console.error('Recalculate failed', err);
    }
    return false;
  };

  const handleExportExcel = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/predictions/export-excel', {
        headers: getHeaders()
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'worldcup_predictions_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
      } else {
        const errData = await res.json();
        alert(errData.error || 'خطا در خروجی گرفتن اکسل');
      }
    } catch (err) {
      console.error('Export excel report failed', err);
    }
    return false;
  };

  const handleDownloadDB = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/download-db', {
        headers: getHeaders()
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
      }
    } catch (err) {
      console.error('Download database failed', err);
    }
    return false;
  };

  const handleUploadDB = async (dbContent: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/import-db', {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbContent)
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'پایگاه داده با موفقیت بازگردانی کامل شد!');
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        if (currentUser?.role === UserRole.ADMIN) {
          fetchAdminUsers();
        }
        return true;
      } else {
        const errData = await res.json();
        alert(errData.error || 'خطا در بارگذاری نسخه پشتیبان پی دیتابیس');
      }
    } catch (err) {
      console.error('Import database failed', err);
      alert('خطای اتصال در آپلود فایل نسخه پشتیبان.');
    }
    return false;
  };

  // Get active user rank for Profile placement
  const activeUserRank = leaderboard.find(l => l.userId === currentUser?.id)?.rank || 0;

  // Render main screen contents based on active tab
  const renderContent = () => {
    if (currentTab === 'login') {
      return (
        <AuthScreen 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          registrationEnabled={settings.registrationEnabled}
        />
      );
    }

    if (currentTab === 'standings') {
      return (
        <GroupStandings 
          matches={matches} 
          onTeamClick={setSelectedTeamId}
        />
      );
    }

    if (currentTab === 'legends') {
      return (
        <LegendsList />
      );
    }

    if (currentTab === 'leaderboard') {
      return (
        <LeaderboardTable 
          entries={leaderboard} 
          currentUser={currentUser} 
          onExportExcel={currentUser?.role === 'admin' ? handleExportExcel : undefined}
          onUserClick={setSelectedPublicUserId}
        />
      );
    }

    if (currentTab === 'profile') {
      return (
        <UserProfile 
          currentUser={currentUser} 
          predictions={predictions} 
          matches={matches} 
          userRank={activeUserRank}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      );
    }

    if (currentTab === 'admin') {
      return (
        <AdminPanel
          currentUser={currentUser}
          users={users}
          matches={matches}
          onAddMatch={handleAddMatch}
          onEditMatch={handleEditMatch}
          onSetMatchResult={handleSetMatchResult}
          onDeleteMatch={handleDeleteMatch}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDisableUser={handleDisableUser}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUser}
          onRecalculateScores={handleRecalculateScores}
          registrationEnabled={settings.registrationEnabled}
          onToggleRegistration={handleUpdateSettings}
          onDownloadDB={handleDownloadDB}
          onUploadDB={handleUploadDB}
          onExportExcel={handleExportExcel}
          settings={settings}
          onUpdateSettings={handleUpdateFullSettings}
        />
      );
    }

    if (currentTab === 'quick_predict' && currentUser?.role !== 'admin') {
      return (
        <QuickPredictor 
          matches={matches} 
          predictions={predictions} 
          currentUser={currentUser} 
          onTriggerAuth={() => setCurrentTab('login')}
        />
      );
    }

    // Default: 'home' / matches dashboard listing are joined in home view
    const getTeamName = (teamId: string) => {
      const team = teamsSeed.find(t => t.id === teamId);
      return team ? team.name : teamId;
    };

    const searchResults = searchQuery.trim() === '' ? [] : matches.filter(m => {
      const homeName = getTeamName(m.homeTeamId).toLowerCase();
      const awayName = getTeamName(m.awayTeamId).toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      return homeName.includes(query) || awayName.includes(query);
    });

    return (
      <div className="space-y-10">
        
        {/* Smart Country/Team Search Panel */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle field grid decoration background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `radial-gradient(#10b981 1.5px, transparent 1.5px), radial-gradient(#10b981 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }} />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-400" />
                  جستجوی هوشمند مسابقات
                </h3>
                <p className="text-xs text-slate-400">جستجوی زنده بازی‌ها بر اساس نام کشور یا تیم</p>
              </div>
              
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-slate-500">جستجوی سریع:</span>
                {['ایران', 'برزیل', 'اسپانیا', 'آلمان', 'فرانسه', 'آرژانتین'].map(teamName => (
                  <button
                    key={teamName}
                    onClick={() => setSearchQuery(teamName)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-bold ${
                      searchQuery === teamName 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {teamName}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام کشور مورد نظر را بنویسید (مثلاً: ایران)..."
                className="w-full pr-11 pl-16 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500/30 font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-900 border border-slate-800 px-2 py-1 rounded transition-colors"
                >
                  پاک کردن
                </button>
              )}
            </div>

            {/* Results output tab */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    نتایج جستجو برای <span className="text-emerald-400">"{searchQuery}"</span>: <span className="text-emerald-400 font-sans">{searchResults.length}</span> بازی پیدا شد
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-300">
                    {searchResults.map(m => {
                      const pred = predictions.find(p => p.matchId === m.id);
                      return (
                        <div key={m.id}>
                          <FeaturedMatchCard
                            match={m}
                            prediction={pred}
                            currentUser={currentUser}
                            onSavePrediction={handleSavePrediction}
                            onTriggerAuth={() => setCurrentTab('login')}
                            onTeamClick={setSelectedTeamId}
                            settings={settings}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800/80">
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">مسابقه‌ای برای تیمی با نام "{searchQuery}" در تورنمنت یافت نشد.</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Display full MatchesList if user clicks inside */}
        <div className="max-w-full mx-auto space-y-4">
          <MatchesList 
            matches={matches} 
            predictions={predictions} 
            currentUser={currentUser} 
            onSavePrediction={handleSavePrediction} 
            onTriggerAuth={() => setCurrentTab('login')}
            onTeamClick={setSelectedTeamId}
            settings={settings}
          />
        </div>

      </div>
    );
  };

  if (!currentUser) {
    return (
      <div id="login-gate-screen" dir="rtl" className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center overflow-hidden font-sans select-none selection:bg-emerald-500 selection:text-white px-4 py-12">
        
        {/* Dynamic Dark Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          
          {/* Subtle Soccer Grid Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: `radial-gradient(#10b981 1.5px, transparent 1.5px), radial-gradient(#10b981 1.5px, #020617 1.5px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }} />

          {/* Clean ambient light flows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[120px]" />
          
          {/* Futuristic Triangles */}
          <div className="absolute top-20 left-20 w-44 h-44 opacity-20 border border-slate-850 rotate-45 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="absolute bottom-20 right-20 w-72 h-72 opacity-10 border border-slate-800 -rotate-12 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        </div>

        {/* World Cup Premium Theme Banner */}
        <div className="relative z-10 w-full max-w-sm px-4 text-center space-y-4 pt-4 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/20 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wide shadow-md">
            🎮 پیش‌بینی پیشرفته و هوش مصنوعی ترکیب جام جهانی
          </div>
          
          {/* Big United Host branding */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase font-sans">
              CUP <span className="text-emerald-400">PREDICTOR</span>
            </h1>
            <p className="text-xs font-mono font-black tracking-widest text-emerald-400/80 uppercase">
              🏆 ULTIMATE WORLD CUP SQUAD SIMULATOR 🏆
            </p>
          </div>
        </div>

        {/* Login/Signup Dialog container */}
        <div className="relative z-10 w-full">
          <AuthScreen 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            registrationEnabled={settings.registrationEnabled}
          />
        </div>

        {/* Informative, humble landing page footer */}
        <div className="relative z-10 text-[10px] text-slate-400 font-bold tracking-wider mt-5 text-center px-4 bg-slate-900/80 border border-slate-800/60 rounded-full py-1.5 shadow-md max-w-[90%] mx-auto">
          دروازه ورودی هواداران کلوپ آلتیمیت • شبیه‌ساز گیم‌پلی و محاسبات هوش مصنوعی OpenRouter
        </div>

      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 pb-28 lg:pb-12 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top branding bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setSelectedTeamId(null);
          setCurrentTab(tab);
          fetchMatches();
          fetchLeaderboard();
        }} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main Containers */}
      <main className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* FIFA Simulated Tournament Virtual Clock Banner */}
        {settings?.syncMode === 'simulation' && (
          <div className="bg-emerald-950/25 border border-emerald-500/15 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between text-right gap-4">
            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <span>🚀 به روز رسانی خودکار زنده فیفا (FIFA Live-Sync)</span>
                  {settings?.isFastForwarding && <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-sans font-black animate-pulse">شبیه‌سازی مداوم ⏩</span>}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">مسابقات در زمان واقعی اجرا و امتیاز پیش‌بینی‌ها فوراً محاسبه می‌شوند.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-center bg-slate-950/40 p-1.5 sm:p-2 rounded-xl border border-slate-800/60 font-sans">
               <span className="text-[11px] text-slate-400 px-2">تقویم مسابقات:</span>
               <span className="text-xs font-black text-black bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg select-none">
                 {(displayTime || new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z')).toLocaleDateString('fa-IR', {
                   weekday: 'long',
                   month: 'long',
                   day: 'numeric'
                 })}
                 {" ساعت "}
                 {(displayTime || new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z')).toLocaleTimeString('fa-IR', {
                   hour: '2-digit',
                   minute: '2-digit',
                   second: '2-digit'
                 })}
               </span>
            </div>
          </div>
        )}
        
        {/* Top Predictors mini board (beneath the main menu) */}
        {currentTab !== 'login' && leaderboard.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 gap-4 flex flex-col md:flex-row items-center justify-between font-sans overflow-hidden">
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <span className="p-2 bg-slate-950 rounded-xl text-amber-400 border border-slate-800 font-bold text-xs select-none shrink-0">🏆 برترین‌ها</span>
              <div className="text-right">
                <h4 className="text-xs font-extrabold text-white tracking-tight uppercase">پیش‌بینی‌کنندگان برتر</h4>
                <p className="text-[10px] text-slate-500 font-sans">جدول لحظه‌ای سکوی رقابت کاربران</p>
              </div>
            </div>
            
            <div className="flex overflow-x-auto md:overflow-x-visible items-center justify-start md:justify-center gap-3 w-full md:w-auto pb-2 md:pb-0 scrollbar-none snap-x snap-mandatory">
              {leaderboard.slice(0, 4).map((entry, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
                const isMe = currentUser?.id === entry.userId;
                return (
                  <div 
                    key={entry.userId} 
                    onClick={() => setSelectedPublicUserId(entry.userId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 snap-center cursor-pointer select-none ${
                      isMe 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-950/60' 
                        : 'bg-slate-950/60 border-slate-800/85 text-slate-350 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                    title="مشاهده نمایه و پیش‌بینی‌های کاربر"
                  >
                    <span className="text-[10px] font-mono leading-none">{medal}</span>
                    <div className="h-5 w-5 rounded-full overflow-hidden border border-slate-700/80 shrink-0">
                      <Avatar 
                        avatar={entry.avatar} 
                        alt={entry.fullName} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="text-right font-sans shrink-0">
                      <p className="text-[11px] font-extrabold truncate max-w-[80px] sm:max-w-[100px] text-slate-200">{entry.fullName}</p>
                      <p className="text-[9px] text-slate-500 font-sans">رتبه {entry.rank} • {entry.totalScore} امتیاز</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alert banners */}
        {errorBanner && (
          <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-400 text-xs flex gap-2 font-semibold">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {successBanner && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex gap-2 font-semibold shadow-lg">
            <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Active router views */}
        {selectedTeamId ? (
          <TeamDetail
            teamId={selectedTeamId}
            teams={teamsSeed}
            matches={matches}
            predictions={predictions}
            currentUser={currentUser}
            onBack={() => setSelectedTeamId(null)}
            onSavePrediction={handleSavePrediction}
            onTriggerAuth={() => setCurrentTab('login')}
            onTeamClick={setSelectedTeamId}
            settings={settings}
          />
        ) : (
          renderContent()
        )}

      </main>

      {/* User Public Profile details modal popup */}
      {selectedPublicUserId && (
        <UserPublicProfileModal
          userId={selectedPublicUserId}
          onClose={() => setSelectedPublicUserId(null)}
          leaderboard={leaderboard}
          matches={matches}
          token={token}
        />
      )}

      {/* PWA Mobile Application Install Promotion Banner */}
      <PWAInstallPrompt />

    </div>
  );
}
