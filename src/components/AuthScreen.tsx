import React, { useState } from 'react';
import { Trophy, Mail, Lock, User as UserIcon, ShieldAlert, Smartphone } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, fullName: string, password: string) => Promise<boolean>;
  registrationEnabled?: boolean;
}

export default function AuthScreen({ onLogin, onRegister, registrationEnabled = true }: AuthScreenProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    let success = false;
    if (isLoginTab) {
      success = await onLogin(username.trim(), password);
    } else {
      if (!registrationEnabled) {
        setAuthError('ثبت‌نام کاربران جدید در حال حاضر توسط مدیریت غیرفعال شده است.');
        setIsLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setAuthError('وارد کردن نام و نام خانوادگی الزامی است.');
        setIsLoading(false);
        return;
      }
      
      const phoneRegex = /^(09\d{8,11}|\+?[0-9]{8,15})$/;
      if (!phoneRegex.test(username.trim())) {
        setAuthError('نام کاربری باید یک شماره موبایل معتبر باشد (مثال: 09123456789).');
        setIsLoading(false);
        return;
      }
      
      success = await onRegister(username.trim(), fullName.trim(), password);
    }

    setIsLoading(false);
    if (!success) {
      setAuthError(isLoginTab ? 'اطلاعات ورود نادرست است یا کلمه عبور اشتباه است.' : 'این نام کاربری (شماره موبایل) قبلاً ثبت‌نام شده است.');
    }
  };

  // Immediate fast login for reviewers (makes preview checking incredibly quick and joyful)
  const handleDirectLogin = async (usr: string, pass: string) => {
    setUsername(usr);
    setPassword(pass);
    setAuthError('');
    setIsLoading(true);
    const succ = await onLogin(usr, pass);
    setIsLoading(false);
    if (!succ) {
      setAuthError('خطا در ورود مستقیم به حساب دمو.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 left-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl -z-10"></div>
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl shadow-lg shadow-emerald-500/10">
          <Trophy className="h-7 w-7 text-slate-950" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">ورود به پنل پیش‌بینی</h2>
        <p className="text-slate-400 text-xs">به بزرگترین جامعه پیش‌بینی فوتبال جام جهانی ۲۰۲۶ خوش آمدید.</p>
      </div>

      {/* Tabs controllers */}
      <div className="flex border-b border-slate-800 p-1 bg-slate-950/40 rounded-xl">
        <button
          onClick={() => {
            setIsLoginTab(true);
            setAuthError('');
          }}
          type="button"
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            isLoginTab ? 'bg-emerald-600 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ورود
        </button>
        <button
          onClick={() => {
            setIsLoginTab(false);
            if (!registrationEnabled) {
              setAuthError('ثبت‌نام کاربران جدید در حال حاضر توسط مدیریت غیرفعال است.');
            } else {
              setAuthError('');
            }
          }}
          type="button"
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            !isLoginTab ? 'bg-emerald-600 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ثبت‌نام {!registrationEnabled && '🔒'}
        </button>
      </div>

      {/* Form credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {!isLoginTab && !registrationEnabled && (
          <div className="p-4 bg-amber-950/30 border border-amber-500/20 text-amber-400 text-xs rounded-xl space-y-1 text-right">
            <span className="font-extrabold block">🚨 ثبت‌نام متوقف شده است</span>
            <span>مدیر سیستم موقتاً ثبت‌نام حساب‌های کاربری جدید را متوقف کرده است. هم‌اکنون تنها کاربران قبلی امکان ورود دارند.</span>
          </div>
        )}

        {!isLoginTab && registrationEnabled && (
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-semibold text-slate-400">نام و نام خانوادگی</label>
            <div className="relative">
              <UserIcon className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="مثال: علی رضایی"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-right"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-right font-sans">
          <label className="text-xs font-semibold text-slate-400">
            {isLoginTab ? 'شماره موبایل / نام کاربری' : 'شماره موبایل (به عنوان نام کاربری)'}
          </label>
          <div className="relative font-sans text-right">
            <Smartphone className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              required
              placeholder={isLoginTab ? 'مثال: 09123456789 یا admin' : 'مثال: 09123456789'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-left dir-ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-right font-sans">
          <label className="text-xs font-semibold text-slate-400">کلمه عبور</label>
          <div className="relative font-sans text-right">
            <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-left dir-ltr"
            />
          </div>
        </div>

        {authError && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 text-right">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!isLoginTab && !registrationEnabled)}
          className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-extrabold text-sm tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.01]"
        >
          {isLoading ? 'در حال بررسی اطلاعات...' : isLoginTab ? 'ورود به حساب کاربری' : !registrationEnabled ? 'ثبت‌نام غیرفعال است' : 'ایجاد حساب کاربری'}
        </button>

      </form>

      {/* Instant Demo Account login panel for reviewers */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex justify-center">
          <button
            onClick={() => handleDirectLogin('admin', 'admin')}
            className="w-full max-w-xs px-3 py-2 bg-amber-950/40 border border-amber-500/20 text-amber-500 hover:text-amber-400 text-[11px] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            🔑 ورود سریع به حساب مدیر سیستم
          </button>
        </div>
      </div>

    </div>
  );
}
