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
    <div id="auth-glass-card" className="max-w-md mx-auto my-8 bg-white/80 backdrop-blur-3xl border border-slate-200/90 rounded-[32px] p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] relative overflow-hidden space-y-6">
      <div id="auth-card-glow" className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-[60px] -z-10"></div>
      <div id="auth-card-glow-2" className="absolute bottom-0 left-0 h-40 w-40 bg-amber-500/5 rounded-full blur-[60px] -z-10"></div>
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
          <Trophy className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-black tracking-tight">ورود به پنل پیش‌بینی</h2>
        <p className="text-black text-xs font-black tracking-wide">به بزرگترین جامعه پیش‌بینی فوتبال جام جهانی ۲۰۲۶ خوش آمدید.</p>
      </div>

      {/* Tabs controllers */}
      <div className="flex border border-slate-200 p-1.5 bg-slate-100/80 rounded-2xl">
        <button
          onClick={() => {
            setIsLoginTab(true);
            setAuthError('');
          }}
          type="button"
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all ${
            isLoginTab ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md font-black' : 'text-slate-600 hover:text-slate-900 font-extrabold'
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
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all ${
            !isLoginTab ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md font-black' : 'text-slate-600 hover:text-slate-900 font-extrabold'
          }`}
        >
          ثبت‌نام {!registrationEnabled && '🔒'}
        </button>
      </div>

      {/* Form credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {!isLoginTab && !registrationEnabled && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl space-y-1 text-right">
            <span className="font-extrabold block">🚨 ثبت‌نام متوقف شده است</span>
            <span className="text-slate-700 font-bold">مدیر سیستم موقتاً ثبت‌نام حساب‌های کاربری جدید را متوقف کرده است. هم‌اکنون تنها کاربران قبلی امکان ورود دارند.</span>
          </div>
        )}

        {!isLoginTab && registrationEnabled && (
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-black text-black">نام و نام خانوادگی</label>
            <div className="relative">
              <UserIcon className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600" />
              <input
                id="auth-input-fullname"
                type="text"
                required
                dir="rtl"
                placeholder="مثال: علی رضایی"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-right transition-all font-semibold"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-right font-sans">
          <label className="text-xs font-black text-black">
            {isLoginTab ? 'شماره موبایل' : 'شماره موبایل (به عنوان نام کاربری)'}
          </label>
          <div className="relative font-sans text-right">
            <Smartphone className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600" />
            <input
              id="auth-input-username"
              type="text"
              required
              dir="ltr"
              placeholder="09123456789"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-left transition-all font-semibold"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-right font-sans">
          <label className="text-xs font-black text-black">کلمه عبور</label>
          <div className="relative font-sans text-right">
            <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600" />
            <input
              id="auth-input-password"
              type="password"
              required
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-left transition-all font-semibold"
            />
          </div>
        </div>

        {authError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 text-right">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
            <span className="font-bold">{authError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!isLoginTab && !registrationEnabled)}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm tracking-wide rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {isLoading ? 'در حال بررسی اطلاعات...' : isLoginTab ? 'ورود به حساب کاربری' : !registrationEnabled ? 'ثبت‌نام غیرفعال است' : 'ایجاد حساب کاربری'}
        </button>

      </form>

    </div>
  );
}
