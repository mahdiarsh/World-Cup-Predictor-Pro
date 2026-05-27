import React, { useState, useRef } from 'react';
import { Award, CheckCircle, Flame, Percent, Sparkles, Activity, Camera, Upload, Check, RefreshCw, X, User as UserIcon, Lock, ShieldAlert, Smartphone, LogOut } from 'lucide-react';
import { User, Prediction, Match, MatchStatus } from '../types';
import { getTeamFlag, getTeamName } from '../data/teams';
import Avatar from './Avatar';
import FlagIcon from './FlagIcon';

const PRESET_AVATARS = [
  { name: '🦁 شیر هیجان‌زده', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=lion' },
  { name: '🐼 پاندای شکمو', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=panda' },
  { name: '🦊 روباه شادمان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=fox' },
  { name: '🤖 ربات آهنی باهوش', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot' },
  { name: '🐙 اختاپوس شیطون', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=octopus' },
  { name: '🐵 میمون بازیگوش', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monkey' },
  { name: '🐸 قورباغه مهربان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=frog' },
  { name: '🐨 کوالای خواب‌آلود', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=koala' },
  { name: '🐥 جوجه خوشحال', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=chick' },
  { name: '🐯 ببر جنگجو', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=tiger' },
  { name: '🦄 تک‌شاخ رویایی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=unicorn' },
  { name: '🐱 گربه ملوس صورتی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat' },
  { name: '🐷 خک صورتی کوچاکو', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=pig' },
  { name: '🐰 خرگوش پرتلاش', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=rabbit' },
  { name: '👽 فضایی ناشناخته', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=alien' },
  { name: '🦖 دایناسور مهربان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=dino' },
  { name: '🦈 کوسه تیزبین', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=shark' },
  { name: '🦉 جغد دانا', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=owl' },
  { name: '🕶️ عینک دودی باحال', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool' },
  { name: '🔥 روح پرانرژی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=fire' },
  { name: '🍕 پیتزای متحرک', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=pizza' },
  { name: '🍩 دونات خوشمزه', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=donut' },
  { name: '🍦 بستنی خندان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=icecream' },
  { name: '🎈 بادکنک شاد', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=balloon' },
  { name: '⭐ ستاره درخشان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=star' },
  { name: '👻 شبح بامزه', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ghost' },
  { name: '🦾 ربات پیشرفته', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=superbot' },
  { name: '⚡ صاعقه پرسرعت', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=thunder' },
  { name: '🧁 کاپ‌کیک رنگی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cupcake' },
  { name: '🥑 آووکادوی خندان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=avocado' },
  { name: '🍉 هندوانه هندسی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=watermelon' },
  { name: '🍓 توت‌فرنگی شیرین', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=strawberry' },
  { name: '🍍 آناناس طلایی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=pineapple' },
  { name: '🍎 سیب خوش‌رو', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=apple' },
  { name: '🥦 کلم بروکلی قهرمان', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=broccoli' },
  { name: '🥕 هویج پر انرژی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=carrot' },
  { name: '🧀 پنیر خوشحال', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cheese' },
  { name: '🎃 کدو تنبل هالووین', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=pumpkin' },
  { name: '🍪 کوکی شکلاتی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cookie' },
  { name: '🍟 سیب‌زمینی سرخ‌کرده', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=fries' },
  { name: '🍔 برگر غول‌آسا', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=burger' },
  { name: '🚀 موشک فضایی', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rocket' },
  { name: '👾 غول فضای مجازی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=monster' },
  { name: '🔮 گوی جادویی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=magic' },
  { name: '🎨 پالت نقاشی', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=palette' }
];

const HAIR_OPTIONS = [
  { id: 'variant01', name: 'Buzz Cut', tag: 'variant01' },
  { id: 'variant02', name: 'Short Clean', tag: 'variant02' },
  { id: 'variant03', name: 'Messy Crop', tag: 'variant03' },
  { id: 'variant04', name: 'Classic Curl', tag: 'variant04' },
  { id: 'variant05', name: 'Long Flowing', tag: 'variant05' },
  { id: 'variant06', name: 'High Volume Afro', tag: 'variant06' },
  { id: 'variant07', name: 'Wavy Fringe', tag: 'variant07' },
  { id: 'variant08', name: 'Modern Pompadour', tag: 'variant08' }
];

const HAIR_COLORS = [
  { id: '010101', name: 'Coal Black', value: '010101', hex: '#010101' },
  { id: '4a3728', name: 'Dark Brown', value: '4a3728', hex: '#4a3728' },
  { id: '724124', name: 'Amber Brown', value: '724124', hex: '#724124' },
  { id: 'e8ba51', name: 'Golden Blonde', value: 'e8ba51', hex: '#e8ba51' },
  { id: '685b53', name: 'Silver Grey', value: '685b53', hex: '#685b53' },
  { id: 'ff6b6b', name: 'Crimson Red', value: 'ff6b6b', hex: '#ff6b6b' }
];

const SKIN_COLORS = [
  { id: 'f8d9be', name: 'Fair Peach', value: 'f8d9be', hex: '#f8d9be' },
  { id: 'e2ba8f', name: 'Light Honey', value: 'e2ba8f', hex: '#e2ba8f' },
  { id: 'b18561', name: 'Warm Olive', value: 'b18561', hex: '#b18561' },
  { id: '8c5a3c', name: 'Bronze Cocoa', value: '8c5a3c', hex: '#8c5a3c' },
  { id: '503335', name: 'Deep Charcoal', value: '503335', hex: '#503335' }
];

const EYE_OPTIONS = [
  { id: 'variant01', name: 'Focused Natural' },
  { id: 'variant02', name: 'Bright Energetic' },
  { id: 'variant03', name: 'Calm Relaxed' },
  { id: 'variant04', name: 'Thoughtful Side' },
  { id: 'variant05', name: 'Smart Confident' },
  { id: 'variant06', name: 'Charming Wink' }
];

const EYEBROW_OPTIONS = [
  { id: 'variant01', name: 'Natural Soft' },
  { id: 'variant02', name: 'Clean Arch' },
  { id: 'variant03', name: 'Intense Combat' },
  { id: 'variant04', name: 'Curious Up' },
  { id: 'variant05', name: 'Flat Simple' }
];

const MOUTH_OPTIONS = [
  { id: 'variant01', name: 'Neutral Calm' },
  { id: 'variant02', name: 'Cheerful Smile' },
  { id: 'variant03', name: 'Triumphant Laugh' },
  { id: 'variant04', name: 'Smart Smirk' },
  { id: 'variant05', name: 'Determined Line' }
];

const GLASSES_OPTIONS = [
  { id: 'variant01', name: 'Classic Rectangular' },
  { id: 'variant02', name: 'Modern Round' },
  { id: 'variant03', name: 'Sport Active' },
  { id: 'variant04', name: 'Retro Aviators' },
  { id: 'variant05', name: 'Bold Wayfarer' }
];

const MUSTACHE_OPTIONS = [
  { id: 'variant01', name: 'Classic Line' },
  { id: 'variant02', name: 'Magnum Chevron' },
  { id: 'variant03', name: 'Walrus Heavy' },
  { id: 'variant04', name: 'Smart Pencil' },
  { id: 'variant05', name: 'Curled Handlebar' }
];

const BEARD_OPTIONS = [
  { id: 'variant01', name: 'Light Stubble' },
  { id: 'variant02', name: 'Heavy Five O\'Clock' },
  { id: 'variant03', name: 'Chiseled Chin Strap' },
  { id: 'variant04', name: 'Goatee Accent' },
  { id: 'variant05', name: 'Majestic Full Beard' }
];

const parseDicebearUrl = (url: string) => {
  const defaults = {
    hair: 'variant02',
    hairProbability: 100,
    hairColor: '4a3728',
    skinColor: 'e2ba8f',
    eyes: 'variant01',
    eyebrows: 'variant01',
    mouth: 'variant01',
    glasses: 'variant01',
    glassesProbability: 0,
    mustache: 'variant01',
    mustacheProbability: 0,
    beard: 'variant01',
    beardProbability: 0
  };

  if (!url || !url.includes('api.dicebear.com/7.x/lorelei/svg')) {
    return defaults;
  }

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    return {
      hair: params.get('hair') || defaults.hair,
      hairProbability: params.has('hairProbability') ? Number(params.get('hairProbability')) : 100,
      hairColor: params.get('hairColor') || defaults.hairColor,
      skinColor: params.get('skinColor') || defaults.skinColor,
      eyes: params.get('eyes') || defaults.eyes,
      eyebrows: params.get('eyebrows') || defaults.eyebrows,
      mouth: params.get('mouth') || defaults.mouth,
      glasses: params.get('glasses') || defaults.glasses,
      glassesProbability: params.has('glassesProbability') ? Number(params.get('glassesProbability')) : 0,
      mustache: params.get('mustache') || defaults.mustache,
      mustacheProbability: params.has('mustacheProbability') ? Number(params.get('mustacheProbability')) : 0,
      beard: params.get('beard') || defaults.beard,
      beardProbability: params.has('beardProbability') ? Number(params.get('beardProbability')) : 0,
    };
  } catch (e) {
    return defaults;
  }
};

interface UserProfileProps {
  currentUser: User | null;
  predictions: Prediction[];
  matches: Match[];
  userRank: number;
  onUpdateAvatar: (newAvatar: string) => Promise<boolean>;
  onUpdateProfile: (fullName?: string, password?: string) => Promise<boolean>;
  onLogout?: () => void;
}

export default function UserProfile({ 
  currentUser, 
  predictions, 
  matches, 
  userRank, 
  onUpdateAvatar,
  onUpdateProfile,
  onLogout
}: UserProfileProps) {
  if (!currentUser) return null;

  // Local state for avatar customization panel
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [activeAvatarTab, setActiveAvatarTab] = useState<'presets' | 'upload'>('presets');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isPendingUpload, setIsPendingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for name and password edits
  const [editFullName, setEditFullName] = useState(currentUser.fullName);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Parse initial states from user's current avatar
  const initialParsed = React.useMemo(() => parseDicebearUrl(currentUser.avatar || ''), [currentUser.avatar]);

  const [customHairEnabled, setCustomHairEnabled] = useState(initialParsed.hairProbability > 0);
  const [customHair, setCustomHair] = useState(initialParsed.hair);
  const [customHairColor, setCustomHairColor] = useState(initialParsed.hairColor);
  const [customSkinColor, setCustomSkinColor] = useState(initialParsed.skinColor);
  const [customEyes, setCustomEyes] = useState(initialParsed.eyes);
  const [customEyebrows, setCustomEyebrows] = useState(initialParsed.eyebrows);
  const [customMouth, setCustomMouth] = useState(initialParsed.mouth);
  const [customGlassesEnabled, setCustomGlassesEnabled] = useState(initialParsed.glassesProbability > 0);
  const [customGlasses, setCustomGlasses] = useState(initialParsed.glasses);
  const [customMustacheEnabled, setCustomMustacheEnabled] = useState(initialParsed.mustacheProbability > 0);
  const [customMustache, setCustomMustache] = useState(initialParsed.mustache);
  const [customBeardEnabled, setCustomBeardEnabled] = useState(initialParsed.beardProbability > 0);
  const [customBeard, setCustomBeard] = useState(initialParsed.beard);

  // Re-synchronize when modal is toggled or avatar matches/changes
  React.useEffect(() => {
    if (showAvatarEdit) {
      const parsed = parseDicebearUrl(currentUser.avatar || '');
      setCustomHairEnabled(parsed.hairProbability > 0);
      setCustomHair(parsed.hair);
      setCustomHairColor(parsed.hairColor);
      setCustomSkinColor(parsed.skinColor);
      setCustomEyes(parsed.eyes);
      setCustomEyebrows(parsed.eyebrows);
      setCustomMouth(parsed.mouth);
      setCustomGlassesEnabled(parsed.glassesProbability > 0);
      setCustomGlasses(parsed.glasses);
      setCustomMustacheEnabled(parsed.mustacheProbability > 0);
      setCustomMustache(parsed.mustache);
      setCustomBeardEnabled(parsed.beardProbability > 0);
      setCustomBeard(parsed.beard);
    }
  }, [showAvatarEdit, currentUser.avatar]);

  // Construct real-time live avatar SVG URL
  const liveAvatarUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    
    if (customHairEnabled) {
      params.set('hair', customHair);
      params.set('hairProbability', '100');
    } else {
      params.set('hairProbability', '0');
    }
    params.set('hairColor', customHairColor);
    params.set('skinColor', customSkinColor);
    params.set('eyes', customEyes);
    params.set('eyebrows', customEyebrows);
    params.set('mouth', customMouth);
    
    if (customGlassesEnabled) {
      params.set('glasses', customGlasses);
      params.set('glassesProbability', '100');
    } else {
      params.set('glassesProbability', '0');
    }
    
    if (customMustacheEnabled) {
      params.set('mustache', customMustache);
      params.set('mustacheProbability', '100');
    } else {
      params.set('mustacheProbability', '0');
    }
    
    if (customBeardEnabled) {
      params.set('beard', customBeard);
      params.set('beardProbability', '100');
    } else {
      params.set('beardProbability', '0');
    }
    
    return `https://api.dicebear.com/7.x/lorelei/svg?${params.toString()}`;
  }, [
    customHairEnabled,
    customHair,
    customHairColor,
    customSkinColor,
    customEyes,
    customEyebrows,
    customMouth,
    customGlassesEnabled,
    customGlasses,
    customMustacheEnabled,
    customMustache,
    customBeardEnabled,
    customBeard
  ]);

  const saveCustomAvatar = async () => {
    setUploadError('');
    setIsPendingUpload(true);
    const success = await onUpdateAvatar(liveAvatarUrl);
    setIsPendingUpload(false);
    if (success) {
      setShowAvatarEdit(false);
    } else {
      setUploadError('Could not save custom avatar to the database.');
    }
  };

  // Compute detailed statistics
  const totalPredictionsCount = predictions.length;
  const finishedPredictions = predictions.filter(p => {
    const match = matches.find(m => m.id === p.matchId);
    return match && match.status === MatchStatus.FINISHED;
  });

  const exactHitsCount = finishedPredictions.filter(p => p.points === 10).length;
  const winnerHitsCount = finishedPredictions.filter(p => p.points === 7 || p.points === 5).length;
  const totalProcessedMatchesCount = finishedPredictions.length;

  const exactRate = totalProcessedMatchesCount > 0 
    ? Math.round((exactHitsCount / totalProcessedMatchesCount) * 100) 
    : 0;

  const successRate = totalProcessedMatchesCount > 0 
    ? Math.round(((exactHitsCount + winnerHitsCount) / totalProcessedMatchesCount) * 100) 
    : 0;

  const formatLocalDate = (utcString: string): string => {
    const d = new Date(utcString);
    return d.toLocaleDateString('fa-IR', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Avatar Actions
  const pickPreset = async (url: string) => {
    setUploadError('');
    setIsPendingUpload(true);
    const success = await onUpdateAvatar(url);
    setIsPendingUpload(false);
    if (success) {
      setShowAvatarEdit(false);
    } else {
      setUploadError('Unable to update profile avatar on server.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please select or drop an image file.');
      return;
    }
    // limit size to 1.5MB to make sure json DB storage is lightweight and fits nicely
    if (file.size > 1.5 * 1024 * 1024) {
      setUploadError('Image size exceeds limit. Please upload an image under 1.5MB.');
      return;
    }

    const reader = new FileReader();
    setIsPendingUpload(true);
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        const success = await onUpdateAvatar(base64String);
        if (success) {
          setShowAvatarEdit(false);
        } else {
          setUploadError('Could not synchronize base64 image with server.');
        }
      }
      setIsPendingUpload(false);
    };
    reader.onerror = () => {
      setUploadError('Error parsing image stream.');
      setIsPendingUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!editFullName.trim()) {
      setProfileError('Display Name / Full Name cannot be empty.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        setProfileError('Password must be at least 4 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileError('Entered passwords do not match.');
        return;
      }
    }

    setIsUpdatingProfile(true);
    const success = await onUpdateProfile(editFullName.trim(), newPassword || undefined);
    setIsUpdatingProfile(false);

    if (success) {
      setProfileSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      // Dismiss success state after 4 seconds
      setTimeout(() => setProfileSuccess(false), 4000);
    } else {
      setProfileError('Failed to save profile modifications.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right font-sans" dir="rtl">
      
      {/* Top Banner Cards with User Identity */}
      <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 rounded-3xl p-6 border border-emerald-500/20 shadow-2xl overflow-hidden min-h-[160px] flex flex-col md:flex-row items-center md:items-start md:justify-between text-center md:text-right gap-4">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        
        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 hover:text-rose-400 border border-rose-500/25 rounded-xl text-xs font-bold transition-all shadow-md group active:scale-95 z-20 cursor-pointer select-none"
            title="خروج از حساب کاربری"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>خروج</span>
          </button>
        )}
        
        {/* Profile Card left */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Avatar holding wrapper with interaction overlay */}
          <div 
            onClick={() => setShowAvatarEdit(!showAvatarEdit)}
            className="h-20 w-20 rounded-full overflow-hidden bg-slate-850 border-2 border-emerald-400 p-0.5 shadow-xl relative cursor-pointer group select-none"
            title="برای تغییر عکس کلیک کنید"
          >
            <Avatar avatar={currentUser.avatar} alt={currentUser.fullName} className="h-full w-full rounded-full object-cover transition-all group-hover:brightness-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white rounded-full">
              <Camera className="h-4.5 w-4.5" />
              <span className="text-[8px] font-black uppercase tracking-wider font-sans">ویرایش</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 font-bold uppercase rounded-full">
              🏆 شرکت‌کننده
            </span>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{currentUser.fullName}</h3>
              <button 
                onClick={() => setShowAvatarEdit(!showAvatarEdit)}
                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
                title="تغییر عکس نمایه"
                type="button"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm font-sans font-medium">@{currentUser.username}</p>
          </div>
        </div>

        {/* Dynamic Badge Card right */}
        <div className="flex gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl min-w-[100px] text-center shadow-lg">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">رتبه</p>
            <p className="text-3xl font-black text-amber-400 font-sans">#{userRank}</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl min-w-[100px] text-center shadow-lg">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">امتیاز</p>
            <p className="text-3xl font-black text-emerald-400 font-sans">{currentUser.totalScore}</p>
          </div>
        </div>

      </div>

      {/* Avatar Customization Drawer / Panel */}
      {showAvatarEdit && (
        <div className="bg-slate-900 border border-emerald-500/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                🎨 ویرایش تصویر نمایه
              </h4>
              <p className="text-xs text-slate-400">یک آواتار از میان اساطیر فوتبال ترجیحی انتخاب نموده یا عکس دلخواه‌تان را مستقیماً بارگذاری کنید.</p>
            </div>
            <button 
              onClick={() => setShowAvatarEdit(false)}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs (English only) */}
          <div className="flex border-b border-slate-800 flex-wrap gap-1">
            <button
              onClick={() => setActiveAvatarTab('presets')}
              className={`pb-2.5 px-4 font-bold text-sm transition-all focus:outline-none relative ${
                activeAvatarTab === 'presets' 
                  ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🦊 آواتارهای فانتزی و بامزه
            </button>
            <button
              onClick={() => setActiveAvatarTab('upload')}
              className={`pb-2.5 px-4 font-bold text-sm transition-all focus:outline-none relative ${
                activeAvatarTab === 'upload' 
                  ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📤 بارگذاری آواتار دلخواه
            </button>
          </div>

          {/* TAB 1: LIVE INTERACTIVE BUILDER (Disabled) */}
          {false && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Live Preview Grid Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-slate-800 rounded-2xl gap-4">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-emerald-400 p-1 shadow-2xl bg-slate-900 select-none flex items-center justify-center">
                  {/* Instantly loaded preview as image stream with safety background */}
                  <img src={liveAvatarUrl} alt="Live Preview" className="h-full w-full rounded-full object-cover" />
                </div>
                
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">Live Preview</span>
                  <p className="text-xs text-slate-400">Updates instantly as you pick the details below.</p>
                </div>

                <button
                  type="button"
                  onClick={saveCustomAvatar}
                  disabled={isPendingUpload}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                >
                  {isPendingUpload ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[3]" />
                  )}
                  Save This Avatar
                </button>
              </div>

              {/* Right Selection Customization Grid Column (8 cols) */}
              <div className="lg:col-span-8 space-y-5 h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. Skin Color */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-300 block">Skin Tone:</span>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_COLORS.map(item => {
                      const isSelected = customSkinColor === item.value;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCustomSkinColor(item.value)}
                          className={`h-9 px-3 rounded-lg border flex items-center gap-2 text-xs transition-all ${
                            isSelected 
                              ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                          }`}
                        >
                          <span className="h-4.5 w-4.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: item.hex }} />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Hair Options */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 block">Hair Selection:</span>
                    <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCustomHairEnabled(false)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          !customHairEnabled 
                            ? 'bg-red-500/15 text-red-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Bald
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomHairEnabled(true)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          customHairEnabled 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                    </div>
                  </div>

                  {customHairEnabled && (
                    <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {HAIR_OPTIONS.map(item => {
                          const isSelected = customHair === item.tag;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setCustomHair(item.tag)}
                              className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                                isSelected 
                                  ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                              }`}
                            >
                              👨‍💼 {item.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Hair Color selection within hair tab */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Hair Color:</span>
                        <div className="flex flex-wrap gap-2">
                          {HAIR_COLORS.map(item => {
                            const isSelected = customHairColor === item.value;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setCustomHairColor(item.value)}
                                className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs transition-all ${
                                  isSelected 
                                    ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                                }`}
                              >
                                <span className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: item.hex }} />
                                <span className="text-[10px]">{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Eyes Shape */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <span className="text-xs font-extrabold text-slate-300 block">Eyes Style:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EYE_OPTIONS.map(item => {
                      const isSelected = customEyes === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCustomEyes(item.id)}
                          className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                            isSelected 
                              ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                          }`}
                        >
                          👁️ {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Eyebrows Shape */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <span className="text-xs font-extrabold text-slate-300 block">Eyebrow Expression:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EYEBROW_OPTIONS.map(item => {
                      const isSelected = customEyebrows === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCustomEyebrows(item.id)}
                          className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                            isSelected 
                              ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                          }`}
                        >
                          〰️ {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Mouth Style */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <span className="text-xs font-extrabold text-slate-300 block">Mouth & Smile:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOUTH_OPTIONS.map(item => {
                      const isSelected = customMouth === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCustomMouth(item.id)}
                          className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                            isSelected 
                              ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                          }`}
                        >
                          👄 {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Glasses Selection */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 block">Glasses Selection:</span>
                    <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCustomGlassesEnabled(false)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          !customGlassesEnabled 
                            ? 'bg-red-500/15 text-red-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Disabled
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomGlassesEnabled(true)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          customGlassesEnabled 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                    </div>
                  </div>

                  {customGlassesEnabled && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 animate-in fade-in duration-150">
                      {GLASSES_OPTIONS.map(item => {
                        const isSelected = customGlasses === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCustomGlasses(item.id)}
                            className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                              isSelected 
                                ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                            }`}
                          >
                            🕶️ {item.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 7. Mustache Selection */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 block">Mustache Model (Upper Facial Hair):</span>
                    <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCustomMustacheEnabled(false)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          !customMustacheEnabled 
                            ? 'bg-red-500/15 text-red-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Disabled
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomMustacheEnabled(true)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          customMustacheEnabled 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                    </div>
                  </div>

                  {customMustacheEnabled && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 animate-in fade-in duration-150">
                      {MUSTACHE_OPTIONS.map(item => {
                        const isSelected = customMustache === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCustomMustache(item.id)}
                            className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                              isSelected 
                                ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                            }`}
                          >
                            🧔 {item.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 8. Beard Selection */}
                <div className="space-y-2 border-t border-slate-800/60 pt-3 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 block">Beard Model (Lower Facial Hair):</span>
                    <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCustomBeardEnabled(false)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          !customBeardEnabled 
                            ? 'bg-red-500/15 text-red-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Disabled
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomBeardEnabled(true)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          customBeardEnabled 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Active
                      </button>
                    </div>
                  </div>

                  {customBeardEnabled && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 animate-in fade-in duration-150">
                      {BEARD_OPTIONS.map(item => {
                        const isSelected = customBeard === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCustomBeard(item.id)}
                            className={`py-2 px-3 rounded-lg border text-xs text-left transition-all truncate ${
                              isSelected 
                                ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold' 
                                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                            }`}
                          >
                            🧔 {item.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PRESET CHARACTERS PICKER (Grid optimized, names below styled nicely) */}
          {activeAvatarTab === 'presets' && (
            <div className="space-y-4 pt-2">
              <span className="text-xs text-slate-400 block font-medium">یکی از شکل‌های فانتزی و بامزه زیر را برای آواتار خود انتخاب کنید:</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 h-[300px] overflow-y-auto pr-1">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = currentUser.avatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => pickPreset(preset.url)}
                      disabled={isPendingUpload}
                      className={`flex flex-col items-center bg-slate-950/50 p-3 rounded-2xl border transition-all duration-200 outline-none hover:scale-[1.03] ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Avatar preview inside private box with clean background */}
                      <div className="relative h-16 w-16 mb-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        <Avatar avatar={preset.url} alt={preset.name} className="h-full w-full object-cover scale-[1.1]" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-950/55 flex items-center justify-center">
                            <Check className="h-5 w-5 text-emerald-400 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-300 font-sans truncate max-w-full block text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM FILE ATTACHMENT UPLOAD */}
          {activeAvatarTab === 'upload' && (
            <div className="space-y-3 pt-2">
              <span className="text-xs text-slate-400 block pb-1">تصویر دلخواه خود (عکس واقعی یا تصویر آواتار) را بارگذاری یا رها کنید:</span>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-emerald-400 bg-emerald-950/20' 
                    : 'border-slate-800 hover:border-emerald-500/20 bg-slate-950/40 hover:bg-slate-950/80'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex flex-col items-center justify-center gap-2 select-none">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                    {isPendingUpload ? (
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      {isPendingUpload ? 'در حال بارگذاری عکس شما...' : 'عکس نمایه دلخواه را به این کادر بکشید یا برای انتخاب فایل کلیک نمایید'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans mt-1">پسوندهای مجاز: PNG, JPG, WEBP (حداکثر ۱.۵ مگابایت)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-lg text-red-400 text-xs text-center">
              ⚠️ {uploadError}
            </div>
          )}

        </div>
      )}

      {/* Account Details & Security Settings Form Component */}
      <div id="account-settings-card" className="bg-slate-900 border border-emerald-500/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-right">
        <div>
          <h4 className="font-extrabold text-white text-base flex items-center gap-2">
            🔒 تنظیمات حساب کاربری و امنیت
          </h4>
          <p className="text-xs text-slate-400">نام نمایشی کاربری خود را بروزرسانی کنید یا رمز عبور جدید امنی برای حسابتان تعریف نمایید.</p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Field 1: Full Name */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-400">نام و نام خانوادگی شما</label>
              <div className="relative">
                <UserIcon className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="مثال: علی کریمی"
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-right"
                />
              </div>
            </div>

            {/* Field 2: Mobile Number (Non-changeable) */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 justify-start">
                <span>شماره تلفن همراه</span>
                <span className="text-[10px] text-slate-600 font-sans italic">(شناسه غیرقابل تغییر)</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute right-3.5 top-3 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  disabled
                  value={currentUser.username}
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-500 font-sans select-none cursor-not-allowed opacity-80 text-right"
                  title="شماره همراه شما به عنوان شناسه یکتای کاربری قفل شده است."
                />
              </div>
            </div>

            {/* Field 3: New Password */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-400">گذرواژه جدید</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-right"
                />
              </div>
              <p className="text-[10px] text-slate-500">اگر مایل به تغییر رمز عبور نیستید، این کادر را خالی بگذارید</p>
            </div>

            {/* Field 4: Confirm New Password */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-400">تکرار گذرواژه جدید</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={!newPassword}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:border-slate-900 disabled:bg-slate-955/40 disabled:text-slate-600 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans text-right"
                />
              </div>
            </div>

          </div>

          {profileError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 justify-start">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 justify-start">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
              <span>تنظیمات حساب کاربری شما با موفقیت ذخیره و بروزرسانی شد!</span>
            </div>
          )}

          <div className="flex justify-start pt-1">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-extrabold text-xs  rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isUpdatingProfile ? (
                <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <Check className="h-4 w-4 stroke-[3] text-slate-950" />
              )}
              ذخیره تنظیمات
            </button>
          </div>

        </form>
      </div>

      {/* Stats Bento Grid Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        
        {/* Exact guess points */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 shadow-md">
          <div className="flex items-center justify-between text-slate-400 pb-2">
            <span className="text-xs font-semibold">پیش‌بینی‌های دقیق (۱۰+ امتیاز)</span>
            <Flame className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-sans">{exactHitsCount}</p>
          <p className="text-[10px] text-slate-500">پیش‌بینی‌های کاملاً منطبق با نتیجه واقعی</p>
        </div>

        {/* Winner correct guesses */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 shadow-md">
          <div className="flex items-center justify-between text-slate-400 pb-2">
            <span className="text-xs font-semibold">تفاضل/برنده صحیح (۵+ یا ۷+ امتیاز)</span>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-sans">{winnerHitsCount}</p>
          <p className="text-[10px] text-slate-500">حدس درست تیم برنده یا تفاضل گل صحیح</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 shadow-md">
          <div className="flex items-center justify-between text-slate-400 pb-2">
            <span className="text-xs font-semibold">درصد حدس‌های دقیق</span>
            <Sparkles className="h-4.5 w-4.5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-sans">{exactRate}%</p>
          <p className="text-[10px] text-slate-500">نسبت نتایج کاملاً دقیق به بازی‌های تمام‌شده</p>
        </div>

        {/* Overall Hit Rate */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 shadow-md">
          <div className="flex items-center justify-between text-slate-400 pb-2">
            <span className="text-xs font-semibold">درصد موفقیت کل پیش‌بینی‌ها</span>
            <Percent className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-white font-sans">{successRate}%</p>
          <p className="text-[10px] text-slate-500">سهم تمام حدس‌های امتیازآور از کل بازی‌ها</p>
        </div>

      </div>

      {/* Predictions list history logs */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-2 justify-start">
          <Activity className="h-5 w-5 text-emerald-400" />
          <span>تاریخچه پیش‌بینی‌های شما ({totalPredictionsCount})</span>
        </h4>

        {predictions.length > 0 ? (
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pl-1">
            {predictions.map(pred => {
              const match = matches.find(m => m.id === pred.matchId);
              if (!match) return null;

              const homeFlag = getTeamFlag(match.homeTeamId);
              const homeName = getTeamName(match.homeTeamId);
              const awayFlag = getTeamFlag(match.awayTeamId);
              const awayName = getTeamName(match.awayTeamId);

              const isFinished = match.status === MatchStatus.FINISHED;

              return (
                <div 
                  key={pred.id}
                  className="bg-slate-900/50 hover:bg-slate-900 p-4 rounded-xl border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors text-right"
                  dir="rtl"
                >
                  {/* Left: Team structures and short codes */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto justify-start">
                    <div className="text-center font-bold text-slate-300 whitespace-nowrap flex items-center gap-2.5 text-sm md:text-base">
                      <div className="flex items-center gap-1.5">
                        <FlagIcon teamIdOrCode={match.homeTeamId} className="h-4 w-6 rounded shadow-sm" />
                        <span>{homeName}</span>
                      </div>
                      <span className="text-slate-600 text-xs">مقابل</span>
                      <div className="flex items-center gap-1.5">
                        <span>{awayName}</span>
                        <FlagIcon teamIdOrCode={match.awayTeamId} className="h-4 w-6 rounded shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Mid: Scores overview representation */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between sm:justify-end w-full sm:w-auto">
                    
                    {/* Your prediction */}
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest">پیش‌بینی شما</span>
                      <span className="font-black text-sm text-amber-300 font-sans">{pred.predictedHome} - {pred.predictedAway}</span>
                    </div>

                    {/* Actual outcome score */}
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest">نتیجه واقعی</span>
                      <span className="font-black text-sm text-slate-300 font-sans">
                        {isFinished ? `${match.homeScore} - ${match.awayScore}` : 'برگزار نشده'}
                      </span>
                    </div>

                    {/* Payout badges */}
                    <div>
                      {isFinished ? (
                        <div className="text-right">
                          <span className="block text-[9px] text-slate-500 uppercase tracking-widest">امتیاز کسب شده</span>
                          <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md ${
                            pred.points === 10 
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                              : pred.points === 7 
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' 
                              : pred.points === 5 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-500 border border-slate-800'
                          }`}>
                            {pred.points === 10 ? '۱۰+ امتیاز (کامل) ⭐' : pred.points === 7 ? '۷+ امتیاز (تفاضل) 🔥' : pred.points === 5 ? '۵+ امتیاز (برنده) 👍' : '۰ امتیاز ❌'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-500/10">در انتظار شروع بازی</span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">شما هنوز هیچ پیش‌بینی ثبت نکرده‌اید.</p>
          </div>
        )}
      </div>

    </div>
  );
}
