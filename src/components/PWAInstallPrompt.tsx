import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, HelpCircle, Copy, ExternalLink, Check } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'apk'>('android');
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
    };

    const handleTriggerInstall = () => {
      // If we have the native install prompt, trigger it!
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }: any) => {
          console.log(`User response to install prompt: ${outcome}`);
          setDeferredPrompt(null);
        });
      } else {
        // Otherwise, show the step-by-step instructions
        setShowTutorial(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  if (!showTutorial) return null;

  return (
    <>
      {/* Unified Multi-Platform Installation Guide Dialog */}
      {showTutorial && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-in fade-in scale-in-95 duration-200">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-4 left-4 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="font-black text-slate-200 text-base">راهنمای نصب برنامه و دریافت APK</h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">سریع‌ترین و بهترین روش را برای دستگاه خود برگزینید:</p>
            </div>

            {/* Tab Swapper */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 mb-5 gap-1">
              <button
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                اندروید (PWA)
              </button>
              <button
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'ios'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                آیفون iOS
              </button>
              <button
                onClick={() => setActiveGuideTab('apk')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'apk'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                📦 خروجی APK
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
            ) : activeGuideTab === 'ios' ? (
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
            ) : (
              <div className="space-y-4 text-xs text-slate-350">
                <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl leading-relaxed text-[11px]">
                  <strong>💡 خبر خوش:</strong> پلتفرم ما کاملاً با استانداردهای رسمی PWA سازگار است؛ لذا می‌توانید در ۲ دقیقه خروجی رسمی <strong>APK خام اندروید</strong> آن را بسازید.
                </div>

                <div className="space-y-3">
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    ۱. ابتدا آدرس این پلتفرم را با زدن کلید زیر کپی نمایید:
                  </p>
                  
                  <button
                    onClick={handleCopyUrl}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-200 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">آدرس کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-400" />
                        <span className="font-extrabold text-[10px]">کپی کردن لینک سایت جهت تبدیل</span>
                      </>
                    )}
                  </button>

                  <div className="text-[10px] bg-slate-950/40 px-3 py-1.5 text-center select-all shrink-0 font-mono text-slate-400 rounded-lg break-all border border-slate-850">
                    {window.location.origin}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40 text-[11px] text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۲</div>
                  <div className="leading-relaxed">
                    وارد ابزار رسمی و رایگان مایکروسافت به آدرس <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-amber-400 font-black underline hover:text-amber-300 inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="h-3 w-3 inline" /></a> شده و آدرس را جایگذاری کنید.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40 text-[11px] text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold font-mono">۳</div>
                  <div className="leading-relaxed">
                    بر روی دکمه <span className="text-emerald-400 font-bold">Generate APK / Build</span> کلیک کنید تا فایل تایید شده اصلی به همراه پکیج دانلود شود!
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
