import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, HelpCircle } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);
    
    // Auto default the active guide tab based on OS
    if (ios) {
      setActiveGuideTab('ios');
    } else {
      setActiveGuideTab('android');
    }

    // Listen for beforeinstallprompt event (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if user hasn't dismissed it from sessionStorage in this session
      const dismissed = sessionStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const handleTriggerInstall = () => {
      // If we have the native install prompt, trigger it!
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }: any) => {
          console.log(`User response to install prompt: ${outcome}`);
          setDeferredPrompt(null);
          setShowPrompt(false);
        });
      } else {
        // Otherwise, show the step-by-step instructions
        setShowTutorial(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    // Dynamic show timer for iOS or General browsers since they don't have beforeinstallprompt
    const dismissed = sessionStorage.getItem('pwa_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds of engagement
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      setShowTutorial(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt && !showTutorial) return null;

  return (
    <>
      {/* Floating Action Banner */}
      {showPrompt && (
        <div 
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs sm:text-xs font-black text-slate-100 leading-tight">پلتفرم را به اپلیکیشن موبایل تبدیل کنید!</h4>
              <p className="text-[10px] sm:text-[10px] text-slate-400 mt-1 leading-normal">
                با نصب مستقیم برنامه (PWA)، بدون نیاز به فیلترشکن، سریع‌تر پیش‌بینی کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              نصب برنامه
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
              title="بعدا"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Multi-Platform Installation Guide Dialog */}
      {showTutorial && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl animate-in fade-in scale-in-95 duration-200">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 left-4 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="font-black text-slate-200 text-base">راهنمای تصویری نصب اپلیکیشن</h3>
              <p className="text-xs text-slate-400 mt-1.5">یکی از راه‌های زیر را متناسب با گوشی خود انتخاب کنید:</p>
            </div>

            {/* Tab Swapper */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-5 gap-1.5">
              <button
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                گوشی اندروید (رسمی)
              </button>
              <button
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'ios'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                گوشی آیفون (Safari)
              </button>
            </div>

            {/* Dynamic steps content based on selected tab */}
            {activeGuideTab === 'android' ? (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-2xl leading-relaxed text-[10px] sm:text-[11px]">
                  <strong>⚠️ نکته کلیدی:</strong> اگر در مرورگرِ داخلی برنامه‌هایی مانند <strong>تلگرام یا اینستاگرام</strong> هستید، حتما روی سه نقطه بالا زده و گزینه <strong>Open in Chrome (باز کردن در کروم)</strong> را انتخاب نمایید، سپس مراحل زیر را بروید.
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۱</div>
                  <div className="leading-relaxed">
                    در بالای مرورگر گوگل کروم اندروید، روی دکمه <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900">سه نقطه (⋮)</span> در گوشه بالا اشاره کنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۲</div>
                  <div className="leading-relaxed">
                    گزینه <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900">Add to Home Screen</span> یا <span className="text-emerald-400 font-bold">نصب برنامه (Install App)</span> را بفشارید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۳</div>
                  <div className="leading-relaxed">
                    در پیغام ظاهر شده گزینه <span className="text-emerald-500 font-black">Install</span> را بزنید تا برنامه بلافاصله روی صفحه اصلی گوشی اضافه گردد.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-2xl leading-relaxed text-[10px] sm:text-[11px]">
                  <strong>⚠️ نکته کلیدی:</strong> این نصب فقط مخصوص مرورگر <strong>Safari (سافاری آیفون)</strong> است. در برنامه‌های دیگر (مثل تلگرام)، لینک را کپی کرده و دستی در سافاری باز کنید.
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۱</div>
                  <div className="leading-relaxed">
                    در پایین صفحه سافاری، روی دکمه <span className="text-sky-400 font-bold inline-flex items-center gap-0.5 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900"><Share className="h-3 w-3 inline" /> اشتراک‌گذاری (Share)</span> ضربه بزنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۲</div>
                  <div className="leading-relaxed">
                    در گزینه‌ها اسکرول کرده و <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900"><PlusSquare className="h-3 w-3 inline" /> افزودن به صفحه اصلی (Add to Home Screen)</span> را انتخاب کنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۳</div>
                  <div className="leading-relaxed">
                    در بالای صفحه روی دکمه <span className="text-emerald-500 font-black">Add (افزودن)</span> یا تایید اشاره کنید تا آیکون به صفحه آیفون اضافه شود.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-extrabold text-xs rounded-xl border border-slate-700/50 transition-all cursor-pointer"
            >
              متوجه شدم، انجام می‌دهم!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
