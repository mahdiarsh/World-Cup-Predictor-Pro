import React, { useState, useEffect } from 'react';
import { Trophy, Mail, Lock, User as UserIcon, ShieldAlert, Smartphone, Key, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, fullName: string, password: string, otpCode?: string) => Promise<boolean>;
  registrationEnabled?: boolean;
}

export default function AuthScreen({ onLogin, onRegister, registrationEnabled = true }: AuthScreenProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // App-wide public settings fetched on mount
  const [appSettings, setAppSettings] = useState<any>(null);
  
  // Verification states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Alert & loader triggers
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentCode, setOtpSentCode] = useState(''); // Shown if simulated is true
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Fetch settings automatically
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAppSettings(data);
      })
      .catch(err => console.error('Failed to load settings in AuthScreen:', err));
  }, []);

  // Cooldown effect for sending OTP
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Handle OTP send
  const handleSendOtp = async (purpose: 'verify' | 'reset') => {
    setAuthError('');
    setAuthSuccess('');
    setOtpSentCode('');
    
    const targetMobile = username.trim();
    if (!targetMobile) {
      setAuthError('وارد کردن شماره همراه جهت ارسال پیامک الزامی است.');
      return;
    }

    const phoneRegex = /^(09\d{8,11}|\+?[0-9]{8,15})$/;
    if (!phoneRegex.test(targetMobile)) {
      setAuthError('شماره همراه معتبر نیست. مثال: 09123456789');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: targetMobile, purpose })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setAuthError(data.error || 'خطا در ارسال پیامک OTP');
        return;
      }

      setOtpCooldown(120); // 2 minute cooldown
      setAuthSuccess(data.message || 'کد تایید با موفقیت ارسال شد.');
      
      if (data.simulated && data.code) {
        setOtpSentCode(data.code);
        setOtpCode(data.code); // Prefill for ultimate UX convenience
      }
    } catch (e: any) {
      setAuthError('خطا در ارتباط با سرور.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Switch to forgot password view
  const triggerForgotPassword = () => {
    setIsForgotPassword(true);
    setAuthError('');
    setAuthSuccess('');
    setOtpSentCode('');
  };

  // Perform reset password action
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    if (!username.trim() || !otpCode.trim() || !newPassword) {
      setAuthError('وارد کردن کلیه اطلاعات شامل کدهای تایید و رمز جدید الزامی است.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/otp/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: username.trim(),
          code: otpCode.trim(),
          newPassword: newPassword
        })
      });
      const data = await res.json();

      setIsLoading(false);
      if (!res.ok) {
        setAuthError(data.error || 'خطا در بازنشانی رمز عبور');
      } else {
        setAuthSuccess(data.message || 'رمز عبور شما با موفقیت تغییر کرد.');
        // Auto go back to login tab after brief delay
        setPassword(newPassword);
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLoginTab(true);
          setAuthSuccess('');
          setOtpCode('');
          setOtpSentCode('');
        }, 3000);
      }
    } catch (err) {
      setIsLoading(false);
      setAuthError('خطا در اتصال به سرور جهت تغییر رمز عبور.');
    }
  };

  // Handle standard login/register submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    const isRegLock = appSettings ? (appSettings.registrationEnabled === false) : !registrationEnabled;

    let success = false;
    if (isLoginTab) {
      success = await onLogin(username.trim(), password);
    } else {
      if (isRegLock) {
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
      
      // If server settings has sms enabled, require code
      const isSmsOn = appSettings ? !!appSettings.smsEnabled : false;
      if (isSmsOn && !otpCode.trim()) {
        setAuthError('وارد کردن کد تایید پیامکی جهت احراز هویت الزامی است.');
        setIsLoading(false);
        return;
      }

      success = await onRegister(username.trim(), fullName.trim(), password, isSmsOn ? otpCode.trim() : undefined);
    }

    setIsLoading(false);
    if (!success) {
      setAuthError(isLoginTab ? 'اطلاعات ورود نادرست است یا کلمه عبور اشتباه است.' : 'کد تایید پیامکی نادرست است یا این شماره از قبل ثبت‌نام شده است.');
    }
  };

  // Immediate fast login for demo
  const handleDirectLogin = async (usr: string, pass: string) => {
    setUsername(usr);
    setPassword(pass);
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);
    const succ = await onLogin(usr, pass);
    setIsLoading(false);
    if (!succ) {
      setAuthError('خطا در ورود مستقیم به حساب دمو.');
    }
  };

  const isRegistrationLocked = appSettings ? (appSettings.registrationEnabled === false) : !registrationEnabled;
  const isSmsEnabledOnSystem = appSettings ? !!appSettings.smsEnabled : false;

  if (isForgotPassword) {
    return (
      <div id="auth-glass-card" className="max-w-md mx-auto my-8 bg-white/85 backdrop-blur-3xl border border-slate-200/90 rounded-[32px] p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] relative overflow-hidden space-y-6">
        <div id="auth-card-glow" className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-[60px] -z-10"></div>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-55 border border-emerald-100 rounded-2xl shadow-sm">
            <Key className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-black tracking-tight">بازیابی کلمه عبور با پیامک</h2>
          <p className="text-slate-500 text-xs">کد یکبار مصرف OTP به شماره همراه شما ارسال خواهد شد.</p>
        </div>

        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          
          <div className="space-y-1.5 text-right font-sans">
            <label className="text-xs font-black text-slate-800">شماره همراه شما (نام کاربری)</label>
            <div className="flex gap-2 font-sans text-right">
              <button
                type="button"
                disabled={isSendingOtp || otpCooldown > 0 || !username.trim()}
                onClick={() => handleSendOtp('reset')}
                className="px-3 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 shrink-0 transition-all font-sans active:scale-95 cursor-pointer"
              >
                {isSendingOtp ? 'درحال ارسال...' : otpCooldown > 0 ? `${otpCooldown} ثانیه` : 'ارسال کد تأیید'}
              </button>
              <div className="relative flex-1">
                <Smartphone className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="09112223344"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 font-sans text-left transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-right font-sans">
            <label className="text-xs font-black text-slate-800">کد تایید پیامک شده</label>
            <div className="relative font-sans text-right">
              <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-500" />
              <input
                type="text"
                required
                dir="ltr"
                placeholder="کد ۵ رقمی"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-center tracking-widest transition-all font-black text-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-right font-sans">
            <label className="text-xs font-black text-slate-800">کلمه عبور جدید</label>
            <div className="relative font-sans text-right">
              <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-500" />
              <input
                type="password"
                required
                dir="ltr"
                placeholder="حداقل ۶ کاراکتر"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-left transition-all font-semibold"
              />
            </div>
          </div>

          {otpSentCode && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-right font-sans flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              <span>رمز یکبار مصرف آزمایشی: </span>
              <strong className="font-mono text-sm bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded border border-slate-800 font-black">{otpSentCode}</strong>
            </div>
          )}

          {authError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 text-right">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
              <span className="font-bold">{authError}</span>
            </div>
          )}

          {authSuccess && !otpSentCode && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-right font-bold">
              {authSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-2xl shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
          >
            {isLoading ? 'در حال تایید و تغییر رمز...' : '💾 ذخیره رمز و ورود به سامانه'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setAuthError('');
              setAuthSuccess('');
              setOtpSentCode('');
            }}
            className="w-full py-2.5 text-slate-600 hover:text-black font-extrabold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به ورود</span>
          </button>
        </form>
      </div>
    );
  }

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
        <p className="text-black text-xs font-black tracking-wide">فوتبال فانتزی و پیش‌بینی کامل جام جهانی ۲۰۲۶</p>
      </div>

      {/* Tabs controllers */}
      <div className="flex border border-slate-200 p-1.5 bg-slate-100/80 rounded-2xl">
        <button
          onClick={() => {
            setIsLoginTab(true);
            setAuthError('');
            setAuthSuccess('');
            setOtpSentCode('');
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
            if (isRegistrationLocked) {
              setAuthError('ثبت‌نام کاربران جدید در حال حاضر توسط مدیریت غیرفعال است.');
            } else {
              setAuthError('');
              setAuthSuccess('');
            }
          }}
          type="button"
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all ${
            !isLoginTab ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md font-black' : 'text-slate-600 hover:text-slate-900 font-extrabold'
          }`}
        >
          ثبت‌نام {isRegistrationLocked && '🔒'}
        </button>
      </div>

      {/* Form credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {!isLoginTab && isRegistrationLocked && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl space-y-1 text-right">
            <span className="font-extrabold block">🚨 ثبت‌نام متوقف شده است</span>
            <span className="text-slate-700 font-bold">مدیر سیستم موقتاً ثبت‌نام حساب‌های کاربری جدید را متوقف کرده است. هم‌اکنون تنها کاربران قبلی امکان ورود دارند.</span>
          </div>
        )}

        {!isLoginTab && !isRegistrationLocked && (
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
            {isLoginTab ? 'شماره همراه' : 'شماره همراه'}
          </label>
          <div className="flex gap-2 font-sans text-right">
            {!isLoginTab && isSmsEnabledOnSystem && (
              <button
                type="button"
                disabled={isSendingOtp || otpCooldown > 0 || !username.trim()}
                onClick={() => handleSendOtp('verify')}
                className="px-3 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 shrink-0 transition-all font-sans active:scale-95 cursor-pointer"
              >
                {isSendingOtp ? 'ارسال...' : otpCooldown > 0 ? `${otpCooldown} ثانیه` : 'دریافت کد تایید'}
              </button>
            )}
            <div className={`relative flex-1 font-sans text-right`}>
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
        </div>

        <div className="space-y-1.5 text-right font-sans">
          <div className="flex justify-between items-center">
            {isLoginTab && (
              <button
                type="button"
                onClick={triggerForgotPassword}
                className="text-[10px] text-emerald-600 hover:underline font-extrabold focus:outline-none"
              >
                فراموشی رمز عبور؟
              </button>
            )}
            <label className="text-xs font-black text-black">کلمه عبور</label>
          </div>
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

        {/* OTP Code input if registering and SMS Panel is enabled */}
        {!isLoginTab && isSmsEnabledOnSystem && (
          <div className="space-y-1.5 text-right font-sans">
            <label className="text-xs font-black text-slate-800">کد تایید پیامک شده (OTP)</label>
            <div className="relative font-sans text-right">
              <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                required
                dir="ltr"
                placeholder="کد ۵ رقمی"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-sans text-center tracking-widest transition-all font-black text-lg"
              />
            </div>
          </div>
        )}

        {otpSentCode && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-right font-sans flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>رمز یکبار مصرف آزمایشی: </span>
            </div>
            <strong className="font-mono text-xs bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-black">{otpSentCode}</strong>
          </div>
        )}

        {authError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 text-right">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
            <span className="font-bold">{authError}</span>
          </div>
        )}

        {authSuccess && !otpSentCode && (
          <div className="p-3 bg-emerald-55/60 border border-emerald-250 text-emerald-800 text-xs rounded-2xl text-right font-bold">
            {authSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!isLoginTab && isRegistrationLocked)}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm tracking-wide rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {isLoading ? 'در حال بررسی اطلاعات...' : isLoginTab ? 'ورود به حساب کاربری' : isRegistrationLocked ? 'ثبت‌نام غیرفعال است' : 'تأیید و ساخت حساب کاربری'}
        </button>

      </form>
    </div>
  );
}
