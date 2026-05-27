import { useState, useEffect } from 'react';
import { Trophy, Award, Gamepad, Compass, Star, ArrowRight, ShieldAlert, BadgeCheck } from 'lucide-react';
import { User, Match, Prediction, LeaderboardEntry, UserRole, MatchStatus } from './types';
import { getTeamFlag, getTeamCode } from './data/teams';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wc_token'));
  const [settings, setSettings] = useState<{ registrationEnabled: boolean }>({ registrationEnabled: true });

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
        triggerSuccess(`Registration is now ${enabled ? 'ENABLED (Allowed)' : 'DISABLED (Blocked)'}.`);
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
        triggerSuccess('Profile avatar updated successfully!');
        fetchLeaderboard();
        return true;
      } else {
        const errData = await res.json();
        triggerError(errData.error || 'Failed to update avatar.');
      }
    } catch (err) {
      console.error('Update avatar failed', err);
      triggerError('Network error updating avatar.');
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
        triggerSuccess('Profile information updated successfully!');
        fetchLeaderboard();
        return true;
      } else {
        const errData = await res.json();
        triggerError(errData.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile failed', err);
      triggerError('Network error updating profile.');
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
        triggerSuccess(`Logged in as @${data.user.username}! Welcome back.`);
        setCurrentTab('home');
        return true;
      }
    } catch (err) {
      console.error('Login action failed', err);
    }
    return false;
  };

  const handleRegister = async (username: string, fullName: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        triggerSuccess(`Successfully registered! Good luck in predictions.`);
        setCurrentTab('home');
        return true;
      }
    } catch (err) {
      console.error('Register action failed', err);
    }
    return false;
  };

  const handleLogout = () => {
    setToken(null);
    triggerSuccess('Logged out successfully.');
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
        triggerSuccess('Score prediction registered successfully!');
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
        triggerSuccess('Saved ' + preds.length + ' predictions!');
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
        triggerSuccess('FIFA official live results synced!');
        fetchMatches();
        fetchMyPredictions();
        fetchLeaderboard();
        return data.message || 'Successfully synchronized matches with FIFA live scores.';
      } else {
        return data.error || 'Failed to sync with FIFA scores.';
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

  const handleSetMatchResult = async (id: string, home: number, away: number): Promise<boolean> => {
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
          onExportExcel={handleExportExcel}
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

    if (currentTab === 'quick_predict') {
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
    const recentCompleted = matches
      .filter(m => m.status === MatchStatus.FINISHED)
      .sort((a, b) => new Date(b.kickoffTimeUtc).getTime() - new Date(a.kickoffTimeUtc).getTime())
      .slice(0, 3);

    const upcomingOrLive = matches
      .filter(m => m.status === MatchStatus.SCHEDULED || m.status === MatchStatus.LIVE)
      .sort((a, b) => new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime())
      .slice(0, 3);

    const recentAndUpcomingMatches = [...recentCompleted, ...upcomingOrLive];

    return (
      <div className="space-y-10">
        
        {/* Quick Bento features (Recent & Upcoming matches with inline prediction) */}
        {recentAndUpcomingMatches.length > 0 && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800/85 pb-2">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-400" />
                بازی‌های اخیر و آینده
              </h3>
              <button
                onClick={() => setCurrentTab('matches_list')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans transition-colors"
              >
                مشاهده تمام مسابقات <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>

            {/* Render featured dynamic cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentAndUpcomingMatches.map(m => {
                const pred = predictions.find(p => p.matchId === m.id);
                return (
                  <FeaturedMatchCard
                    key={m.id}
                    match={m}
                    prediction={pred}
                    currentUser={currentUser}
                    onSavePrediction={handleSavePrediction}
                    onTriggerAuth={() => setCurrentTab('login')}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Display full MatchesList if user clicks inside */}
        <div className="max-w-4xl mx-auto space-y-4">
          <MatchesList 
            matches={matches} 
            predictions={predictions} 
            currentUser={currentUser} 
            onSavePrediction={handleSavePrediction} 
            onTriggerAuth={() => setCurrentTab('login')}
          />
        </div>

      </div>
    );
  };

  if (!currentUser) {
    return (
      <div id="login-gate-screen" dir="rtl" className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center overflow-hidden font-sans select-none selection:bg-emerald-500 selection:text-slate-950 px-4 py-12">
        
        {/* Dynamic Stadium-like Professional Background */}
        <div className="absolute inset-0 z-0 bg-slate-955">
          {/* Main Soccer Pitch spotlight/pitch gradient lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-600/40 via-slate-950 to-slate-950" />
          
          {/* Subtle Soccer Grid Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
            backgroundImage: `radial-gradient(#10b981 1.5px, transparent 1.5px), radial-gradient(#10b981 1.5px, #0b0f19 1.5px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }} />

          {/* Stadium lights spotlight ray designs */}
          <div className="absolute -top-40 left-1/4 w-[1px] h-[350px] bg-gradient-to-b from-emerald-400/30 to-transparent rotate-[25deg] blur-[2px]" />
          <div className="absolute -top-40 right-1/4 w-[1px] h-[350px] bg-gradient-to-b from-amber-400/30 to-transparent -rotate-[15deg] blur-[2px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]" />
          
          {/* Stars & FIFA World Cup 2026 hosts glow */}
          <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-slate-400/30 blur-[1px]" />
          <div className="absolute top-24 right-20 w-1.5 h-1.5 rounded-full bg-slate-500/20 blur-[1px]" />
          <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full bg-emerald-500/20 blur-[2px]" />
          <div className="absolute bottom-40 right-1/4 w-2 h-2 rounded-full bg-amber-500/20" />
        </div>

        {/* FIFA 2026 World Cup Premium Theme Banner */}
        <div className="relative z-10 w-full max-w-md px-6 text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/85 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium uppercase tracking-widest font-extrabold animate-pulse">
            🏆 سامانه پیش‌بینی مسابقات جام جهانی ۲۰۲۶
          </div>
          
          {/* Big United Host branding (USA • MEXICO • CANADA) */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tighter uppercase font-sans">
              جام جهانی ۲۰۲۶
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/95 uppercase">
              🇺🇸 آمریکا • 🇲🇽 مکزیک • 🇨🇦 کانادا
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

        {/* Informative, humble landing page footer (strictly English) */}
        <div className="relative z-10 text-[10px] text-slate-600 font-mono tracking-wider mt-2 text-center px-4">
          دروازه امنیتی ورودی کاربران • وب‌سایت پیش‌بینی جام جهانی فیفا ۲۰۲۶ نسخه ۲.۶
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
          setCurrentTab(tab);
          fetchMatches();
          fetchLeaderboard();
        }} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main Containers */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
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
               <span className="text-xs font-black text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg select-none">
                 {new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z').toLocaleDateString('fa-IR', {
                   weekday: 'long',
                   month: 'long',
                   day: 'numeric'
                 })}
                 {" ساعت "}
                 {new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z').toLocaleTimeString('fa-IR', {
                   hour: 'numeric',
                   minute: 'numeric'
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 snap-center ${
                      isMe 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 font-bold' 
                        : 'bg-slate-950/60 border-slate-800/85 text-slate-350 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono leading-none">{medal}</span>
                    <div className="h-5 w-5 rounded-full overflow-hidden border border-slate-700/80 shrink-0 select-none">
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
        {renderContent()}

      </main>

    </div>
  );
}
