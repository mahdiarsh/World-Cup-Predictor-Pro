import { Trophy, LogOut, User as UserIcon, ShieldAlert, Award, Grid3X3, Crown, Zap } from 'lucide-react';
import { User, UserRole } from '../types';
import Avatar from './Avatar';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, currentUser, onLogout }: NavbarProps) {
  return (
    <nav className="lg:sticky lg:top-0 z-50 lg:bg-slate-900/90 lg:backdrop-blur-md lg:border-b lg:border-emerald-500/20 px-4 lg:py-3 py-0">
      <div className="hidden lg:flex max-w-7xl mx-auto items-center justify-between gap-4">
        
        {/* Brand/Logo */}
        <div 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
            <Trophy className="h-6 w-6 text-slate-950" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
              پیش‌بینی جام <span className="text-amber-400">جهانی</span>
            </h1>
            <p className="text-[10px] font-sans text-emerald-400 tracking-widest uppercase">جام جهانی ۲۰۲۶</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
              currentTab === 'home' || currentTab === 'matches'
                ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span className="text-lg leading-none mb-1">🏆</span>
            <span className="text-xs tracking-tight whitespace-nowrap">مسابقات</span>
          </button>

          <button
            onClick={() => setCurrentTab('standings')}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
              currentTab === 'standings'
                ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span className="text-lg leading-none mb-1">📋</span>
            <span className="text-xs tracking-tight whitespace-nowrap">جدول گروه‌ها</span>
          </button>

          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
              currentTab === 'leaderboard'
                ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span className="text-lg leading-none mb-1">📊</span>
            <span className="text-xs tracking-tight whitespace-nowrap">رده‌بندی کاربران</span>
          </button>

          {currentUser && currentUser.role !== UserRole.ADMIN && (
            <button
               onClick={() => setCurrentTab('quick_predict')}
              className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
                currentTab === 'quick_predict'
                  ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="text-lg leading-none mb-1">⚡</span>
              <span className="text-xs tracking-tight whitespace-nowrap">مقایسه و پیش‌بینی‌ها</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
                currentTab === 'profile'
                  ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="text-lg leading-none mb-1">👤</span>
              <span className="text-xs tracking-tight whitespace-nowrap">حساب کاربری</span>
            </button>
          )}

          {currentUser?.role === UserRole.ADMIN && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
                currentTab === 'admin'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40 font-semibold shadow-inner'
                  : 'text-amber-500/90 hover:text-amber-400 hover:bg-slate-800/80'
              }`}
            >
              <ShieldAlert className="h-4.5 w-4.5 mb-1 text-amber-550 shrink-0" />
              <span className="text-xs tracking-tight whitespace-nowrap">مدیریت سیستم</span>
            </button>
          )}
        </div>

        {/* User Stats / Profile Area */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-950/60 pl-3 pr-1 py-1.5 rounded-full border border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-100 line-clamp-1">{currentUser.fullName}</p>
                <div className="flex items-center justify-end text-[11px] font-medium text-amber-400 gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>{currentUser.totalScore} امتیاز</span>
                </div>
              </div>

              {/* Avatar Dropdown / Profile Tab Router */}
              <div 
                onClick={() => setCurrentTab('profile')}
                className="h-8 w-8 rounded-full border border-emerald-500/30 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all overflow-hidden bg-slate-800"
              >
                <Avatar 
                  avatar={currentUser.avatar} 
                  alt={currentUser.fullName}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Log out */}
              <button 
                onClick={onLogout}
                title="خروج"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide rounded-lg transition-all transform shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.03]"
            >
              ورود / ثبت‌نام
            </button>
          )}
        </div>

      </div>

      {/* Bottom Nav Bar for Mobile and Tablet (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-900/90 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] px-2 py-2 flex items-center justify-around pb-safe">
        
        {/* Tab 1: Matches (Trophy icon) */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
        >
          <div className={`p-1 rounded-lg transition-all ${
            currentTab === 'home' || currentTab === 'matches'
              ? 'text-emerald-400 scale-110'
              : 'text-slate-500 hover:text-slate-400'
          }`}>
            <Trophy className="h-5.5 w-5.5 stroke-[2]" />
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
            currentTab === 'home' || currentTab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-500'
          }`}>
            بازی‌ها
          </span>
          {/* Active indicator dot */}
          {(currentTab === 'home' || currentTab === 'matches') && (
            <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
        </button>

        {/* Tab 2: Groups (Grid3X3 icon) */}
        <button
          onClick={() => setCurrentTab('standings')}
          className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
        >
          <div className={`p-1 rounded-lg transition-all ${
            currentTab === 'standings'
              ? 'text-emerald-400 scale-110'
              : 'text-slate-500 hover:text-slate-400'
          }`}>
            <Grid3X3 className="h-5.5 w-5.5 stroke-[2]" />
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
            currentTab === 'standings' ? 'text-emerald-400 font-bold' : 'text-slate-500'
          }`}>
            گروه‌ها
          </span>
          {currentTab === 'standings' && (
            <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
        </button>

        {/* Tab 3: Leaderboard (Crown icon) */}
        <button
          onClick={() => setCurrentTab('leaderboard')}
          className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
        >
          <div className={`p-1 rounded-lg transition-all ${
            currentTab === 'leaderboard'
              ? 'text-emerald-400 scale-110'
              : 'text-slate-500 hover:text-slate-400'
          }`}>
            <Crown className="h-5.5 w-5.5 stroke-[2]" />
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
            currentTab === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-500'
          }`}>
            رتبه‌ها
          </span>
          {currentTab === 'leaderboard' && (
            <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          )}
        </button>

          {/* Tab 4: Quick Predict (Zap icon) */}
        {currentUser && currentUser.role !== UserRole.ADMIN && (
          <button
            onClick={() => setCurrentTab('quick_predict')}
            className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
          >
            <div className={`p-1 rounded-lg transition-all ${
              currentTab === 'quick_predict'
                ? 'text-emerald-400 scale-110'
                : 'text-slate-500 hover:text-slate-400'
            }`}>
              <Zap className="h-5.5 w-5.5 stroke-[2]" />
            </div>
            <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
              currentTab === 'quick_predict' ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}>
              مقایسه
            </span>
            {currentTab === 'quick_predict' && (
              <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </button>
        )}

        {/* Tab 5: Profile (Circular custom avatar ring, Instagram style!) */}
        {currentUser ? (
          <button
            onClick={() => setCurrentTab('profile')}
            className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
          >
            <div className={`h-6 w-6 rounded-full overflow-hidden border-2 transition-all ${
              currentTab === 'profile' 
                ? 'border-emerald-400 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                : 'border-slate-700 group-hover:border-slate-500'
            }`}>
              <Avatar 
                avatar={currentUser.avatar} 
                alt={currentUser.fullName} 
                className="h-full w-full object-cover" 
              />
            </div>
            <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
              currentTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}>
              پروفایل
            </span>
            {currentTab === 'profile' && (
              <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('login')}
            className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
          >
            <div className={`p-1 rounded-lg transition-all ${
              currentTab === 'login'
                ? 'text-emerald-400 scale-110'
                : 'text-slate-500 hover:text-slate-400'
            }`}>
              <UserIcon className="h-5.5 w-5.5 stroke-[2]" />
            </div>
            <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
              currentTab === 'login' ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}>
              ورود
            </span>
            {currentTab === 'login' && (
              <span className="absolute -bottom-1 h-1 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </button>
        )}

        {/* Tab 6: Admin (Shield/Settings icon) */}
        {currentUser?.role === UserRole.ADMIN && (
          <button
            onClick={() => setCurrentTab('admin')}
            className="flex flex-col items-center justify-center transition-all duration-200 flex-1 relative group py-0.5"
          >
            <div className={`p-1 rounded-lg transition-all ${
              currentTab === 'admin'
                ? 'text-amber-400 scale-110'
                : 'text-slate-500 hover:text-amber-550'
            }`}>
              <ShieldAlert className="h-5.5 w-5.5 stroke-[2]" />
            </div>
            <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 transition-colors ${
              currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-500'
            }`}>
              مدیریت
            </span>
            {currentTab === 'admin' && (
              <span className="absolute -bottom-1 h-1 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
