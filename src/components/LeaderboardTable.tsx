import React, { useState } from 'react';
import { Trophy, Search, ChevronLeft, ChevronRight, Award, Flame, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { LeaderboardEntry, User } from '../types';
import Avatar from './Avatar';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUser: User | null;
  onExportExcel?: () => Promise<boolean>;
  onUserClick?: (userId: string) => void;
}

export default function LeaderboardTable({ entries, currentUser, onExportExcel, onUserClick }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 8;

  // Filter based on search term
  const filteredEntries = entries.filter(
    entry =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };

  // Extract Top 3 for special podium spotlight representation!
  const topThree = entries.slice(0, 3);

  // Find top exact prediction striker! (Golden strike king)
  const topStriker = entries.length > 0 ? [...entries].sort((a, b) => {
    if (b.exactPredictions !== a.exactPredictions) {
      return b.exactPredictions - a.exactPredictions;
    }
    return b.totalScore - a.totalScore;
  })[0] : null;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Title & Description */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500 animate-pulse" />
          جدول رده‌بندی <span className="text-emerald-400">کاربران</span>
        </h2>
        <p className="text-slate-400 text-sm">
          امتیاز رقابت‌های خود را دنبال کنید. پیش‌بینی دقیق نتیجه <span className="text-amber-400 font-bold font-sans">۱۰ امتیاز</span>، حدس صحیح برنده با تفاضل گل صحیح <span className="text-blue-400 font-bold font-sans">۷ امتیاز</span> و حدس صحیح برنده یا مساوی <span className="text-emerald-400 font-bold font-sans">۵ امتیاز</span> به همراه دارد!
        </p>
        
        {/* Prizes announcement banner */}
        <div className="inline-block mt-1 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold leading-relaxed max-w-lg shadow-[0_4px_12px_rgba(16,185,129,0.05)] w-full">
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center gap-1.5 text-amber-400 border-b border-emerald-500/20 pb-1.5 justify-center">
              <span>🎁</span>
              <span className="font-extrabold text-sm">جوایز برندگان کلوپ هواداران</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-amber-400/20">
                <div className="text-amber-400 font-black">نفر اول 🥇</div>
                <div className="font-sans font-black text-rose-400 text-sm mt-0.5">۱۰ میلیون</div>
                <div className="text-[9px] text-slate-400 mt-0.5">تومان</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-300/20">
                <div className="text-slate-300 font-extrabold">نفر دوم 🥈</div>
                <div className="font-sans font-black text-rose-400 text-sm mt-0.5">۵ میلیون</div>
                <div className="text-[9px] text-slate-400 mt-0.5">تومان</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-amber-700/20">
                <div className="text-amber-600 font-extrabold">نفر سوم 🥉</div>
                <div className="font-sans font-black text-rose-400 text-sm mt-0.5 font-sans">۲ میلیون</div>
                <div className="text-[9px] text-slate-400 mt-0.5">تومان</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              * مابقی جوایز و تعداد نفرات برنده بعدی، بر اساس تعداد نهایی شرکت‌کنندگان قبل از شروع بازی‌ها مشخص و نهایی می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* Highlights Section for Top Performer of the Week (TOTW Style) */}
      {topStriker && searchTerm === '' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          onClick={() => onUserClick && onUserClick(topStriker.userId)}
          className="max-w-full mx-auto bg-gradient-to-r from-slate-950 via-emerald-950/15 to-slate-950 border border-amber-400/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-amber-450 transition-all duration-300 group ring-1 ring-amber-400/10"
          title="مشاهده نمایه و پیش‌بینی‌های بازیکن برتر"
        >
          {/* Decorative gold background particles */}
          <div className="absolute right-1/4 top-3 text-emerald-500/10 text-3xl select-none animate-pulse">⭐</div>
          <div className="absolute left-1/4 bottom-3 text-amber-500/10 text-4xl select-none animate-ping">👑</div>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full md:w-auto">
            {/* Pulsating premium gold avatar core */}
            <div className="relative shrink-0 select-none">
              <div className="absolute -inset-2 bg-amber-500/15 rounded-full animate-ping duration-[3000ms]" />
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500 to-yellow-400 opacity-60 blur-md rounded-full animate-pulse" />
              <div className="relative w-16 h-16 rounded-full border-2 border-amber-450 overflow-hidden bg-slate-900 shadow-xl">
                <Avatar avatar={topStriker.avatar} className="object-cover w-full h-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow">🏆</div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/35 text-amber-400 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                🌟 ستاره طلایی راندهای اخیر (Team of the Week Style)
              </span>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                {topStriker.fullName}
              </h3>
              <p className="text-slate-400 text-xs font-semibold">
                پرچمدار حدس‌های کاملاً دقیق با ثبت رکورد <span className="text-amber-450 font-black font-sans">{topStriker.exactPredictions} بازی</span> پیش‌بینی شده به صورت بی‌نقص!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-r border-slate-800/80 pt-4 md:pt-0 md:pr-6 shrink-0 w-full md:w-auto justify-center md:justify-end">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">امتیاز کل</span>
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">{topStriker.totalScore}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">دقت حدس‌ها</span>
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">%{topStriker.playedMatches > 0 ? Math.round((topStriker.exactPredictions / topStriker.playedMatches) * 100) : 0}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Premium Spotlights (Top 3 Podium Cards) */}
      {topThree.length > 0 && searchTerm === '' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-6 mt-4 max-w-full mx-auto">
          
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
              onClick={() => onUserClick && onUserClick(topThree[1].userId)}
              className="relative bg-slate-900/60 rounded-2xl p-5 border-t-2 border-slate-400/50 border-x border-b border-slate-800 text-center flex flex-col justify-between hover:scale-[1.02] hover:border-slate-300 transition-all cursor-pointer order-2 sm:order-1 pt-9 shadow-lg group"
              title="مشاهده نمایه و پیش‌بینی‌های کاربر"
            >
              <motion.div 
                initial={{ y: -15, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.3 }}
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider font-sans whitespace-nowrap"
              >
                🥈 رتبه ۲
              </motion.div>
              <div className="space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-full border-2 border-slate-400 overflow-hidden bg-slate-800 select-none group-hover:ring-2 group-hover:ring-emerald-450 transition-all">
                  <Avatar avatar={topThree[1].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">{topThree[1].fullName}</h4>
                  <p className="text-xs text-slate-400">@{topThree[1].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 pb-1">
                <p className="text-2xl font-black text-slate-200">{topThree[1].totalScore} <span className="text-xs text-slate-400 font-medium">امتیاز</span></p>
                <p className="text-[10px] text-slate-400 font-sans">{topThree[1].exactPredictions} پیش‌بینی دقیق</p>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Gold Highlight) */}
          {topThree[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onClick={() => onUserClick && onUserClick(topThree[0].userId)}
              className="relative bg-emerald-950/20 rounded-3xl p-6 border-t-4 border-amber-400 border-x border-b border-emerald-500/20 text-center flex flex-col justify-between hover:scale-[1.04] hover:border-amber-400 transition-all cursor-pointer order-1 sm:order-2 pt-10 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20 group"
              title="مشاهده نمایه و پیش‌بینی‌های کاربر"
            >
              <motion.div 
                initial={{ y: -15, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.25 }}
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider font-sans"
              >
                👑🥇 قهرمان
              </motion.div>
              <div className="space-y-3">
                <div className="relative mx-auto w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-slate-800 shadow-[0_0_15px_rgba(245,158,11,0.3)] select-none group-hover:ring-4 group-hover:ring-amber-300 transition-all">
                  <Avatar avatar={topThree[0].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-lg tracking-tight line-clamp-1 group-hover:text-amber-300 transition-colors">{topThree[0].fullName}</h4>
                  <p className="text-xs text-amber-300 font-bold font-sans">@{topThree[0].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 pb-1">
                <p className="text-3xl font-black text-amber-400">{topThree[0].totalScore} <span className="text-xs text-slate-300 font-medium">امتیاز</span></p>
                <p className="text-xs text-emerald-400 font-medium font-sans">{topThree[0].exactPredictions} حدس دقیق مسابقات!</p>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
              onClick={() => onUserClick && onUserClick(topThree[2].userId)}
              className="relative bg-slate-900/60 rounded-2xl p-5 border-t-2 border-amber-700/50 border-x border-b border-slate-800 text-center flex flex-col justify-between hover:scale-[1.02] hover:border-amber-600/70 transition-all cursor-pointer order-3 pt-9 shadow-lg group"
              title="مشاهده نمایه و پیش‌بینی‌های کاربر"
            >
              <motion.div 
                initial={{ y: -15, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.35 }}
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-700 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider font-sans whitespace-nowrap"
              >
                🥉 رتبه ۳
              </motion.div>
              <div className="space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-full border-2 border-amber-700 overflow-hidden bg-slate-800 select-none group-hover:ring-2 group-hover:ring-amber-500 transition-all">
                  <Avatar avatar={topThree[2].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">{topThree[2].fullName}</h4>
                  <p className="text-xs text-slate-400">@{topThree[2].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 pb-1">
                <p className="text-2xl font-black text-amber-705 text-amber-605 font-mono">{topThree[2].totalScore} <span className="text-xs text-slate-400 font-medium">امتیاز</span></p>
                <p className="text-[10px] text-slate-400 font-sans">{topThree[2].exactPredictions} پیش‌بینی دقیق</p>
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Control Bar: Search and Filters */}
      <div className="max-w-full mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800" dir="rtl">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام یا نام‌کاربری شرکت‌کننده..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pr-10 pl-4 py-2 text-sm text-slate-200 placeholder-slate-500 text-right focus:outline-none focus:border-emerald-500"
          />
        </div>
        {onExportExcel && (
          <button
            onClick={() => {
              setIsExporting(true);
              onExportExcel().finally(() => setIsExporting(false));
            }}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)] select-none shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'در حال خروجی گرفتن...' : 'خروجی اکسل پیش‌بینی‌ها'}</span>
          </button>
        )}
      </div>

      {/* Competitor Table */}
      <div className="max-w-full mx-auto overflow-hidden bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-2xl" dir="rtl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-emerald-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 text-center font-sans">رتبه</th>
                <th className="px-6 py-4">شرکت‌کننده</th>
                <th className="px-6 py-4 text-center">امتیاز کل</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">حدس دقیق</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">تشخیص صحیح</th>
                <th className="px-6 py-4 text-center">بازی‌های پیش‌بینی شده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((user, idx) => {
                  const isCurUser = currentUser?.id === user.userId;
                  return (
                    <tr 
                      key={user.userId} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurUser 
                          ? 'bg-emerald-900/20 font-semibold border-r-4 border-r-emerald-400 ring-1 ring-emerald-500/20' 
                          : 'even:bg-slate-900/10'
                      }`}
                    >
                      {/* Rank Indicator column */}
                      <td className="px-6 py-4 text-center font-mono">
                        {user.rank === 1 ? (
                          <motion.span 
                            initial={{ scale: 0, opacity: 0, rotate: -25 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 14, delay: Math.min(idx * 0.05, 0.45) }}
                            className="inline-flex items-center justify-center p-1 bg-amber-400/10 border border-amber-400/40 rounded-full text-amber-400 font-bold h-7 w-7 text-xs shadow-[0_0_10px_rgba(251,191,36,0.15)]"
                          >
                            🥇
                          </motion.span>
                        ) : user.rank === 2 ? (
                          <motion.span 
                            initial={{ scale: 0, opacity: 0, rotate: -25 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 14, delay: Math.min(idx * 0.05, 0.45) }}
                            className="inline-flex items-center justify-center p-1 bg-slate-200/10 border border-slate-300/40 rounded-full text-slate-200 font-bold h-7 w-7 text-xs shadow-[0_0_10px_rgba(226,232,240,0.1)]"
                          >
                            🥈
                          </motion.span>
                        ) : user.rank === 3 ? (
                          <motion.span 
                            initial={{ scale: 0, opacity: 0, rotate: -25 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 14, delay: Math.min(idx * 0.05, 0.45) }}
                            className="inline-flex items-center justify-center p-1 bg-amber-800/10 border border-amber-900/40 rounded-full text-amber-700 font-bold h-7 w-7 text-xs shadow-[0_0_10px_rgba(180,83,9,0.1)]"
                          >
                            🥉
                          </motion.span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">#{user.rank}</span>
                        )}
                      </td>
                      
                      {/* Participant Profile and Username */}
                      <td 
                        className="px-6 py-4 text-right cursor-pointer hover:bg-slate-800/60 select-none group"
                        onClick={() => onUserClick && onUserClick(user.userId)}
                        title="مشاهده نمایه و پیش‌بینی‌های کاربر"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-850 border border-slate-800 select-none group-hover:ring-2 group-hover:ring-emerald-450 transition-all">
                            <Avatar 
                              avatar={user.avatar} 
                              alt={user.fullName} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-sm text-slate-100 flex items-center gap-1.5 font-sans font-medium group-hover:text-emerald-400 group-hover:underline transition-colors">
                              {user.fullName}
                              {isCurUser && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono border border-emerald-400/20">
                                  شما
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-slate-500 text-right">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Score Accrued */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-base font-black text-white px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 shadow-sm flex items-center justify-center gap-1 w-20 mx-auto">
                          <Award className="h-4 w-4 text-emerald-400" />
                          {user.totalScore}
                        </span>
                      </td>

                      {/* Perfect predictions count (+10) */}
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className="font-mono text-sm inline-flex items-center gap-1 text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                          <Flame className="h-3.5 w-3.5" />
                          {user.exactPredictions}
                        </span>
                      </td>

                      {/* Winner correct guesses count (+5 or +7) */}
                      <td className="px-6 py-4 text-center hidden md:table-cell font-mono text-sm text-slate-400">
                        {user.correctPredictions - user.exactPredictions}
                      </td>

                      {/* Matches played */}
                      <td className="px-6 py-4 text-center font-sans text-xs text-slate-500">
                        {user.playedMatches} مسابقه
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    هیچ شرکت‌کننده‌ای با فیلتر جستجوی شما مطابقت ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Subpanel */}
        {totalPages > 1 && (
          <div className="bg-slate-950/40 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400" dir="rtl">
            <span>
              نمایش <span className="text-slate-200">{startIndex + 1}</span> تا{' '}
              <span className="text-slate-200">
                {Math.min(startIndex + itemsPerPage, filteredEntries.length)}
              </span>{' '}
              از <span className="text-white font-mono font-bold">{filteredEntries.length}</span> شرکت‌کننده
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                title="قبلی"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="font-sans font-bold text-slate-300">
                صفحه {currentPage} از {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                title="بعدی"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
