import { Trophy, LogOut, User as UserIcon, ShieldAlert, Award } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
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

          {currentUser && (
            <button
              onClick={() => setCurrentTab('quick_predict')}
              className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all font-sans ${
                currentTab === 'quick_predict'
                  ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="text-lg leading-none mb-1">⚡</span>
              <span className="text-xs tracking-tight whitespace-nowrap">پیش‌بینی سریع</span>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.65)] px-1 sm:px-4 py-1.5 flex items-center justify-around pb-safe">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
            currentTab === 'home' || currentTab === 'matches'
              ? 'text-emerald-400 font-bold scale-105 bg-emerald-950/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="text-lg leading-none mb-0.5">🏆</span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">بازی‌ها</span>
        </button>

        <button
          onClick={() => setCurrentTab('standings')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
            currentTab === 'standings'
              ? 'text-emerald-400 font-bold scale-105 bg-emerald-950/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="text-lg leading-none mb-0.5">📋</span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">گروه‌ها</span>
        </button>

        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
            currentTab === 'leaderboard'
              ? 'text-emerald-400 font-bold scale-105 bg-emerald-950/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="text-lg leading-none mb-0.5">📊</span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">رتبه‌ها</span>
        </button>

        {currentUser && (
          <button
            onClick={() => setCurrentTab('quick_predict')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
              currentTab === 'quick_predict'
                ? 'text-emerald-400 font-bold scale-105 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">⚡</span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">پیش‌بینی</span>
          </button>
        )}

        {currentUser && (
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
              currentTab === 'profile'
                ? 'text-emerald-400 font-bold scale-105 bg-emerald-950/20'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">👤</span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">پروفایل</span>
          </button>
        )}

        {currentUser?.role === UserRole.ADMIN && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all font-sans flex-1 ${
              currentTab === 'admin'
                ? 'text-amber-400 font-bold scale-105 bg-amber-950/20'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">🛡️</span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">مدیریت</span>
          </button>
        )}
      </div>
    </nav>
  );
}
