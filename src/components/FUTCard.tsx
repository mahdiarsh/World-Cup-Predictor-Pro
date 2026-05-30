import React from 'react';
import FlagIcon from './FlagIcon';
import { Sparkles, Trophy, Zap, Shield, HelpCircle } from 'lucide-react';

export interface FUTCardProps {
  name: string;
  rating: number;
  position: string;
  countryCode: string;
  countryName?: string;
  age?: number;
  clubName?: string;
  theme?: 'gold' | 'hero' | 'radioactive' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export default function FUTCard({
  name,
  rating,
  position,
  countryCode,
  countryName = 'Country',
  age = 25,
  clubName = 'Cup Squad',
  theme = 'gold',
  size = 'md',
}: FUTCardProps) {
  // Translate internal position types to authentic FUT abbreviations
  const getFutPosition = (pos: string) => {
    const p = pos.toUpperCase();
    if (p.includes('GK') || p.includes('دروازه‌بان') || p.includes('دروازه')) return 'GK';
    if (p.includes('DF') || p.includes('CB') || p.includes('مدافع')) {
      if (p.includes('LB') || p.includes('چپ')) return 'LB';
      if (p.includes('RB') || p.includes('راست')) return 'RB';
      return 'CB';
    }
    if (p.includes('MF') || p.includes('MID') || p.includes('هافبک')) {
      if (p.includes('CAM') || p.includes('هجومی')) return 'CAM';
      if (p.includes('CDM') || p.includes('دفاعی')) return 'CDM';
      return 'CM';
    }
    if (p.includes('FW') || p.includes(' مهاجم') || p.includes('ST')) {
      if (p.includes('LW') || p.includes('چپ')) return 'LW';
      if (p.includes('RW') || p.includes('راست')) return 'RW';
      return 'ST';
    }
    return pos.substring(0, 3).toUpperCase();
  };

  const futPos = getFutPosition(position);

  // Generate mock realistic UT player stats based on rating and position
  const generateUTStats = (ovr: number, pos: string) => {
    const base = Math.min(Math.max(ovr, 40), 99);
    
    // Default variations
    let pac = Math.round(base * 0.95);
    let sho = Math.round(base * 0.85);
    let pas = Math.round(base * 0.82);
    let dri = Math.round(base * 0.90);
    let def = Math.round(base * 0.50);
    let phy = Math.round(base * 0.80);

    if (pos === 'GK') {
      pac = Math.round(base * 0.92); // DIV
      sho = Math.round(base * 0.86); // HAN
      pas = Math.round(base * 0.80); // KIC
      dri = Math.round(base * 0.94); // REF
      def = Math.round(base * 0.50); // SPD
      phy = Math.round(base * 0.88); // POS
    } else if (pos === 'CB' || pos === 'LB' || pos === 'RB' || pos === 'DF') {
      pac = Math.round(base * 0.82);
      sho = Math.round(base * 0.45);
      pas = Math.round(base * 0.68);
      dri = Math.round(base * 0.70);
      def = Math.round(base * 0.96);
      phy = Math.round(base * 0.92);
    } else if (pos === 'CAM' || pos === 'CM' || pos === 'CDM' || pos === 'MF') {
      pac = Math.round(base * 0.85);
      sho = Math.round(base * 0.76);
      pas = Math.round(base * 0.94);
      dri = Math.round(base * 0.90);
      def = Math.round(base * 0.65);
      phy = Math.round(base * 0.78);
    } else if (pos === 'ST' || pos === 'LW' || pos === 'RW' || pos === 'FW') {
      pac = Math.round(base * 0.97);
      sho = Math.round(base * 0.94);
      pas = Math.round(base * 0.75);
      dri = Math.round(base * 0.92);
      def = Math.round(base * 0.35);
      phy = Math.round(base * 0.80);
    }

    // Keep between 30 and 99
    const cap = (val: number) => Math.min(Math.max(val, 30), 99);

    return {
      pac: cap(pac),
      sho: cap(sho),
      pas: cap(pas),
      dri: cap(dri),
      def: cap(def),
      phy: cap(phy),
    };
  };

  const stats = generateUTStats(rating, futPos);

  // PlayStyles+ (FC 25/FC 26 style feature) based on rating & position
  const getPlaystyles = (ovr: number, pos: string) => {
    if (ovr < 80) return [];
    if (pos === 'GK') {
      return [
        { label: 'Footwork', desc: 'دفع ضربات عالی با پا' },
        { label: 'Far Reach', desc: 'پوشش فوق‌العاده زوایای دور' }
      ];
    }
    if (pos === 'ST' || pos === 'LW' || pos === 'RW' || pos === 'FW') {
      return [
        { label: 'Finesse Shot+', desc: 'ضربات کات‌دار مرگبار' },
        { label: 'Rapid', desc: 'استارت‌های سرعتی انفجاری' }
      ];
    }
    if (pos === 'CB' || pos === 'LB' || pos === 'RB' || pos === 'DF') {
      return [
        { label: 'Anticipate+', desc: 'توپ‌ربایی‌های تمیز و بدون خطا' },
        { label: 'Block', desc: 'بلاک کردن شوت‌های حریف' }
      ];
    }
    // Midfield
    return [
      { label: 'Incisive Pass+', desc: 'پاس‌های عمقی خط‌کش‌دار' },
      { label: 'Tiki-Taka', desc: 'پاس‌کاری‌های سریع تک‌ضرب' }
    ];
  };

  const playstyles = getPlaystyles(rating, futPos);

  // Theme styling configuration mapping
  let bgClass = 'from-amber-50 via-white to-amber-100/70 text-amber-950 border-amber-400';
  let badgeHighlight = 'bg-amber-100/50 border-amber-300 text-amber-800';
  let haloColor = 'from-amber-300/25';
  let bannerNameBg = 'bg-amber-100/30 border-amber-200';

  if (theme === 'hero') {
    bgClass = 'from-purple-50 via-white to-indigo-100/70 text-purple-950 border-purple-400';
    badgeHighlight = 'bg-purple-100/50 border-purple-300 text-purple-800';
    haloColor = 'from-purple-300/25';
    bannerNameBg = 'bg-purple-100/30 border-purple-200';
  } else if (theme === 'radioactive') {
    bgClass = 'from-emerald-50 via-white to-teal-100/70 text-emerald-950 border-emerald-400';
    badgeHighlight = 'bg-emerald-100/50 border-emerald-300 text-emerald-800';
    haloColor = 'from-emerald-300/25';
    bannerNameBg = 'bg-emerald-50/50 border-emerald-200';
  } else if (theme === 'icon') {
    bgClass = 'from-slate-50 via-white to-slate-200/50 text-slate-950 border-slate-400';
    badgeHighlight = 'bg-slate-100 border-slate-300 text-slate-800';
    haloColor = 'from-slate-300/25';
    bannerNameBg = 'bg-slate-100/50 border-slate-200';
  }

  // Fallback headshot images from FIFA Ultimate Team databases
  const getFUTHeadshot = (nameStr: string) => {
    const cleanName = nameStr.toLowerCase();
    if (cleanName.includes('messi') || cleanName.includes('مسی')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/158023.png';
    if (cleanName.includes('ronaldo') || cleanName.includes('رونالدو')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/20801.png';
    if (cleanName.includes('mbappe') || cleanName.includes('امباپه')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/231747.png';
    if (cleanName.includes('neymar') || cleanName.includes('نیمار')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/190871.png';
    if (cleanName.includes('debruyne') || cleanName.includes('دبروینه')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/192985.png';
    if (cleanName.includes('kane') || cleanName.includes('کین')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/202126.png';
    if (cleanName.includes('haaland') || cleanName.includes('هالند')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/239085.png';
    if (cleanName.includes('salah') || cleanName.includes('صلاح')) return 'https://www.fifarosters.com/assets/players/fifa21/faces/209331.png';
    
    // Generic fallback corresponding to the rating
    const seedId = Math.abs(nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 15;
    const baseIds = [238421, 238442, 238453, 238454, 238455, 238456, 238457, 238458, 238459, 231747, 158023, 20801, 190871];
    return `https://www.fifarosters.com/assets/players/fifa21/faces/${baseIds[seedId] || 238421}.png`;
  };

  const playerPicUrl = getFUTHeadshot(name);

  // Resize styles
  const sizeClasses = {
    sm: 'w-[150px] h-[225px] p-2 rounded-xl text-[10px]',
    md: 'w-[230px] h-[345px] p-3.5 rounded-2xl text-xs',
    lg: 'w-[280px] h-[420px] p-5 rounded-3xl text-sm',
  };

  return (
    <div 
      className={`relative select-none overflow-hidden bg-gradient-to-b border shadow-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-slate-350/20 ${sizeClasses[size]} ${bgClass}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Absolute Background Decors */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <polygon points="10,10 90,10 50,80" />
          <polygon points="50,20 100,60 10,90" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <polygon points="50,10 100,100 0,100" />
        </svg>
      </div>

      {/* Glow overlay */}
      {theme === 'radioactive' && (
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Top Banner: OVR, Position, Nation, Club */}
      <div className="flex justify-between items-start w-full z-10">
        <div className="flex flex-col items-center">
          {/* Big OVR */}
          <span className={`font-black tracking-tighter leading-none ${size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-4xl'}`}>
            {rating}
          </span>
          {/* Position */}
          <span className={`font-extrabold uppercase mt-0.5 tracking-wider ${size === 'sm' ? 'text-[8px]' : 'text-[10px] opacity-80'}`}>
            {futPos}
          </span>
          
          <div className="h-[1px] w-6 bg-current opacity-30 my-1" />

          {/* National Flag */}
          <div className="h-4 w-6 bg-slate-900 rounded overflow-hidden shadow-sm shrink-0 border border-black/10">
            <FlagIcon teamIdOrCode={countryCode} className="h-full w-full object-cover" />
          </div>

          {/* Tiny Brand Deco */}
          <span className="text-[7px] font-black tracking-widest mt-1 opacity-60">SQUAD</span>
        </div>

        {/* Theme Authenticity Badge */}
        <div className="flex flex-col items-end">
          <div className={`px-2 py-0.5 rounded-md font-sans font-black flex items-center gap-1 uppercase tracking-widest ${
            theme === 'gold' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
            theme === 'hero' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
            theme === 'radioactive' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
            'bg-slate-100 text-slate-900 border border-slate-300'
          } ${size === 'sm' ? 'text-[6px]' : 'text-[8px]'}`}>
            <Sparkles className="h-2 w-2 shrink-0" />
            <span>{theme === 'radioactive' ? 'EMERALD' : theme.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Player Big Headshot Image */}
      <div className="relative flex justify-center items-center w-full my-1 shrink-0">
        <div className={`absolute rounded-full bg-radial-gradient ${haloColor} to-transparent blur-lg pointer-events-none rounded-full transform scale-110`} style={{
          width: size === 'sm' ? '70px' : '120px',
          height: size === 'sm' ? '70px' : '120px',
        }} />
        
        <img 
          src={playerPicUrl} 
          alt={name}
          className={`object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-300 z-10 ${
            size === 'sm' ? 'h-24 w-24' : size === 'lg' ? 'h-40 w-40' : 'h-32 w-32'
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://www.fifarosters.com/assets/players/fifa21/faces/238421.png";
          }}
        />
      </div>

      {/* Player Name and statistics board */}
      <div className="w-full space-y-1 sm:space-y-1.5 z-10 text-center">
        {/* Name Plate */}
        <div className={`py-1 px-2 rounded-lg truncate border border-current/15 ${bannerNameBg}`}>
          <h3 className={`font-black tracking-tight leading-snug truncate ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
          }`}>
            {name}
          </h3>
        </div>

        {/* Dynamic UT attributes layout */}
        {size !== 'sm' && (
          <div className="grid grid-cols-6 gap-0.5 border-y border-current/10 py-1.5 font-sans">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'DIV' : 'PAC'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.pac}</span>
            </div>
            <div className="flex flex-col items-center border-r border-current/10">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'HAN' : 'SHO'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.sho}</span>
            </div>
            <div className="flex flex-col items-center border-r border-current/10">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'KIC' : 'PAS'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.pas}</span>
            </div>
            <div className="flex flex-col items-center border-r border-current/10">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'REF' : 'DRI'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.dri}</span>
            </div>
            <div className="flex flex-col items-center border-r border-current/10">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'SPD' : 'DEF'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.def}</span>
            </div>
            <div className="flex flex-col items-center border-r border-current/10">
              <span className="text-[9px] font-bold opacity-60 uppercase">
                {futPos === 'GK' ? 'POS' : 'PHY'}
              </span>
              <span className="text-sm font-extrabold tracking-tighter mt-0.5">{stats.phy}</span>
            </div>
          </div>
        )}

        {/* PlayStyles Badge Row (Signature EA Sports FC layout) */}
        {size === 'lg' && playstyles.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {playstyles.map((ps, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-black border uppercase tracking-wider ${badgeHighlight}`}
                title={ps.desc}
              >
                <Zap className="h-2 w-2 shrink-0 animate-pulse" />
                <span>{ps.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Club Details / Age Footer Info */}
        <div className="flex items-center justify-between text-[8px] sm:text-[9.5px] font-extrabold leading-none opacity-80 pt-0.5">
          <span className="truncate max-w-[60%]">{clubName}</span>
          <span className="font-mono font-bold shrink-0">{age} YRS</span>
        </div>

      </div>

    </div>
  );
}
