import React, { useState, useMemo } from 'react';
import { allLegends, FootballLegend } from '../data/legends';
import { Search, Sparkles, Award, Filter, ArrowUpDown, Shield, X } from 'lucide-react';
import FlagIcon from './FlagIcon';

export default function LegendsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'rating-desc' | 'rating-asc' | 'name-asc'>('rating-desc');
  const [inspectLegend, setInspectLegend] = useState<FootballLegend | null>(null);

  // Derive unique countries & positions for dropdown filters
  const filterOptions = useMemo(() => {
    const countriesSet = new Set<string>();
    const positionsSet = new Set<string>();

    allLegends.forEach(leg => {
      countriesSet.add(leg.country);
      
      // Clean up position helper like "مهاجم (RW)" to simple "مهاجم" or keep full
      const simplePos = leg.position.split(' ')[0];
      positionsSet.add(simplePos);
    });

    return {
      countries: Array.from(countriesSet).sort(),
      positions: Array.from(positionsSet).sort()
    };
  }, []);

  // Filter and sort legends
  const filteredAndSortedLegends = useMemo(() => {
    let result = [...allLegends];

    // 1. Search filter
    if (searchTerm.trim()) {
      const clean = searchTerm.toLowerCase();
      result = result.filter(
        leg =>
          leg.name.toLowerCase().includes(clean) ||
          leg.nameEn.toLowerCase().includes(clean) ||
          leg.country.toLowerCase().includes(clean) ||
          leg.position.toLowerCase().includes(clean)
      );
    }

    // 2. Position Filter
    if (selectedPosition !== 'ALL') {
      result = result.filter(leg => leg.position.startsWith(selectedPosition));
    }

    // 3. Country Filter
    if (selectedCountry !== 'ALL') {
      result = result.filter(leg => leg.country === selectedCountry);
    }

    // 4. Sort Order
    result.sort((a, b) => {
      if (sortOrder === 'rating-desc') return b.rating - a.rating;
      if (sortOrder === 'rating-asc') return a.rating - b.rating;
      
      // name-asc
      return a.name.localeCompare(b.name, 'fa');
    });

    return result;
  }, [searchTerm, selectedPosition, selectedCountry, sortOrder]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-emerald-500/10 p-6 sm:p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-amber-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-55px] left-[-30px] w-48 h-48 bg-emerald-550/5 rounded-full blur-[80px]" />

        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-955/60 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
            ✨ تاریخ‌سازان مستطیل سبز
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
            ۱۰۰ اسطوره طلایی تاریخ فوتبال
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-6">
            آلبوم کارت‌های مفاخر و ۱۰۰ بازیکن افسانه‌ای دنییا با چهره واقعی برگرفته از کارت‌های اصلی <span className="text-amber-400 font-sans font-bold">FIFA Ultimate Team</span>. از دریبل‌های جادویی پله و مارادونا تا افتخارات مکرر مسی و رونالدو.
          </p>
        </div>
      </div>

      {/* Control Panel: Filters, Search, Sorts */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-4 sm:p-6 rounded-2xl md:flex md:items-center justify-between gap-4 space-y-4 md:space-y-0 text-slate-300">
        
        {/* Universal Search */}
        <div className="relative flex-1 max-w-md font-sans">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="جستجوی اسم بازیکن، کشور، پست بازی..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl pr-10 pl-4 py-2 text-xs text-right focus:outline-none focus:border-amber-500/30 transition-colors"
          />
        </div>

        {/* Dropdown filters grid */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 font-sans">
          
          {/* Pos Filter */}
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <span className="text-[10px] text-slate-500 shrink-0 font-sans">پست:</span>
            <select
              value={selectedPosition}
              onChange={e => setSelectedPosition(e.target.value)}
              className="w-full bg-slate-950 text-slate-300 border border-slate-850 px-2 py-1.5 rounded-xl text-xs text-right cursor-pointer focus:outline-none focus:border-amber-500/25"
            >
              <option value="ALL">همه پست‌ها</option>
              {filterOptions.positions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Nationalities Filter */}
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <span className="text-[10px] text-slate-500 shrink-0 font-sans">کشور:</span>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-950 text-slate-300 border border-slate-850 px-2 py-1.5 rounded-xl text-xs text-right cursor-pointer focus:outline-none focus:border-amber-500/25"
            >
              <option value="ALL">همه کشورها</option>
              {filterOptions.countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <span className="text-[10px] text-slate-500 shrink-0 font-sans">ترتیب:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-300 border border-slate-850 px-2 py-1.5 rounded-xl text-xs text-right cursor-pointer focus:outline-none focus:border-amber-500/25"
            >
              <option value="rating-desc">امتیاز (بیشترین)</option>
              <option value="rating-asc">امتیاز (کمترین)</option>
              <option value="name-asc">حروف الفبا (الف-ی)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid listing the footballers cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {filteredAndSortedLegends.map((leg, index) => {
          return (
            <div
              key={leg.id}
              onClick={() => setInspectLegend(leg)}
              className="relative aspect-[3/4.5] rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 transform hover:scale-[1.03] cursor-pointer shadow-lg group select-none flex flex-col items-center justify-between p-3.5 text-center overflow-hidden"
            >
              
              {/* Premium Glow for top tier 95+ ratings */}
              {leg.rating >= 95 && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/5 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              )}

              {/* FUT-Card Design Elements inside Card */}
              <div className="w-full flex items-start justify-between">
                
                {/* OVR/POS Shield */}
                <div className="flex flex-col items-center">
                  <span className="text-xl font-sans font-black text-amber-400 tracking-tight leading-none">{leg.rating}</span>
                  <span className="text-[9px] font-semibold text-slate-400 font-sans mt-0.5 uppercase">{leg.position.match(/\(([^)]+)\)/)?.[1] || 'ST'}</span>
                  
                  {/* Subtle Flag */}
                  <div className="mt-1.5 h-3 w-5 bg-slate-850 rounded overflow-hidden shadow-sm shrink-0">
                    <FlagIcon teamIdOrCode={leg.countryCode} className="h-full w-full object-cover" />
                  </div>
                </div>

                {/* Fut Legends Logo Tag */}
                <span className="text-[8px] font-black uppercase text-amber-500/65 tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                  LEGEND
                </span>
                
              </div>

              {/* Player face headshot (retrieved from fifarosters) */}
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                <img
                  src={leg.imageUrl}
                  alt={leg.name}
                  className="h-full w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] transform group-hover:scale-105 transition-all duration-300 z-10"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    // fallback to generic shadow face
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://www.fifarosters.com/assets/players/fifa21/faces/238421.png";
                  }}
                />
                
                {/* Shiny card halo backdrop */}
                <div className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-radial-gradient from-amber-500/15 to-transparent blur-md" />
              </div>

              {/* Player Name and Quick country details */}
              <div className="w-full space-y-0.5 z-10 mt-2">
                <h4 className="text-xs font-black text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                  {leg.name}
                </h4>
                <div className="font-sans flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
                  <span>{leg.country}</span>
                  <span>•</span>
                  <span>{leg.era}</span>
                </div>
              </div>

              {/* Index counter Badge */}
              <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-600 font-bold">
                #{index + 1}
              </span>

            </div>
          );
        })}
      </div>

      {filteredAndSortedLegends.length === 0 && (
        <div className="bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <p className="font-extrabold text-slate-400">بازیکنی یافت نشد</p>
          <p className="text-xs">هیچ‌یک از ۱۰۰ بازیکن اسطوره با جستجو یا فیلتر کنونی مطابقت ندارد.</p>
        </div>
      )}

      {/* Detailed Inspector Modal Dialog */}
      {inspectLegend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 select-none animate-fade-in" dir="rtl">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Close */}
            <button
              onClick={() => setInspectLegend(null)}
              className="absolute top-4 left-4 p-2 bg-slate-950/60 border border-slate-800/80 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all z-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Top Highlight Section */}
            <div className="bg-gradient-to-b from-amber-500/15 via-transparent to-slate-900 p-8 flex flex-col items-center justify-center text-center relative border-b border-slate-850">
              
              {/* Country background seal */}
              <div className="absolute inset-0 bg-contain bg-center opacity-5 pointer-events-none" />

              <div className="relative h-32 w-32 shrink-0">
                <img
                  src={inspectLegend.imageUrl}
                  alt={inspectLegend.name}
                  className="h-full w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10 relative"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-4 space-y-1 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-black font-sans shrink-0 uppercase">
                  ⭐ کارت افسانه‌ای رتبه {inspectLegend.rating} • {inspectLegend.position}
                </div>
                <h3 className="text-xl font-black text-white">{inspectLegend.name}</h3>
                <p className="text-xs text-slate-500 font-mono font-bold tracking-widest">{inspectLegend.nameEn}</p>
              </div>

            </div>

            {/* Modal Text content */}
            <div className="p-6 space-y-4 text-right">
              
              <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-300">
                
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <span className="text-[10px] text-slate-500 block font-sans">ملیت رسمی</span>
                  <div className="flex items-center gap-1.5 mt-1 font-sans">
                    <FlagIcon teamIdOrCode={inspectLegend.countryCode} className="h-3 w-5 rounded shrink-0 shadow-sm" />
                    <span className="font-semibold text-slate-200">{inspectLegend.country} ({inspectLegend.countryCode})</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <span className="text-[10px] text-slate-500 block">دوران طلایی حضور</span>
                  <p className="font-semibold text-slate-200 mt-1 font-mono">{inspectLegend.era}</p>
                </div>

              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  بیوگرافی و شرح افتخارات
                </span>
                <p className="text-xs text-slate-300 leading-6 bg-slate-950/20 p-4 rounded-xl border border-slate-850/80">
                  {inspectLegend.description}
                </p>
              </div>

            </div>

            {/* Modal Bottom Button bar */}
            <div className="bg-slate-950 p-4 flex justify-between items-center text-[10px] text-slate-600 font-mono border-t border-slate-850 px-6">
              <span>شناسه اسطوره: {inspectLegend.id}</span>
              <button
                onClick={() => setInspectLegend(null)}
                className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-slate-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                بستن پنجره
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
