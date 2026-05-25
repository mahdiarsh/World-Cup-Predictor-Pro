import React, { useState } from 'react';
import { Trophy, Search, ChevronLeft, ChevronRight, Award, Flame } from 'lucide-react';
import { LeaderboardEntry, User } from '../types';
import Avatar from './Avatar';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUser: User | null;
}

export default function LeaderboardTable({ entries, currentUser }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Title & Description */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500 animate-pulse" />
          جدول رده‌بندی <span className="text-emerald-400">کاربران</span>
        </h2>
        <p className="text-slate-400 text-sm">
          امتیاز رقابت‌های خود را بررسی و دنبال کنید. برای پیش‌بینی‌های دقیق <span className="text-emerald-400 font-semibold">+۳ امتیاز</span> و برای حدس برنده درست
          <span className="text-emerald-400 font-semibold font-sans"> +۱ امتیاز</span> دریافت می‌کنید. اولویت رتبه‌بندی با تعداد حدس‌های دقیق بیشتر است!
        </p>
      </div>

      {/* Premium Spotlights (Top 3 Podium Cards) */}
      {topThree.length > 0 && searchTerm === '' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-6 mt-4 max-w-4xl mx-auto">
          
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="relative bg-slate-900/60 rounded-2xl p-5 border-t-2 border-slate-400/50 border-x border-b border-slate-800 text-center flex flex-col justify-between hover:scale-[1.02] transition-transform order-2 sm:order-1 pt-8 shadow-lg">
              <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-slate-800 text-slate-300 font-bold rounded-md font-mono text-xs">رتبه ۲</div>
              <div className="space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-full border-2 border-slate-400 overflow-hidden bg-slate-800 select-none">
                  <Avatar avatar={topThree[1].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight text-base line-clamp-1">{topThree[1].fullName}</h4>
                  <p className="text-xs text-slate-400">@{topThree[1].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-2xl font-black text-slate-200">{topThree[1].totalScore} <span className="text-xs text-slate-400 font-medium">امتیاز</span></p>
                <p className="text-[10px] text-slate-400 font-sans">{topThree[1].exactPredictions} پیش‌بینی دقیق</p>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Highlight) */}
          {topThree[0] && (
            <div className="relative bg-emerald-950/20 rounded-3xl p-6 border-t-4 border-amber-400 border-x border-b border-emerald-500/20 text-center flex flex-col justify-between hover:scale-[1.04] transition-all order-1 sm:order-2 pt-10 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider font-sans">
                👑 قهرمان
              </div>
              <div className="space-y-3">
                <div className="relative mx-auto w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-slate-800 shadow-[0_0_15px_rgba(245,158,11,0.3)] select-none">
                  <Avatar avatar={topThree[0].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-lg tracking-tight line-clamp-1">{topThree[0].fullName}</h4>
                  <p className="text-xs text-amber-300">@{topThree[0].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20">
                <p className="text-3xl font-black text-amber-400">{topThree[0].totalScore} <span className="text-xs text-slate-300 font-medium">امتیاز</span></p>
                <p className="text-xs text-emerald-400 font-medium font-sans">{topThree[0].exactPredictions} حدس دقیق مسابقات!</p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="relative bg-slate-900/60 rounded-2xl p-5 border-t-2 border-amber-700/50 border-x border-b border-slate-800 text-center flex flex-col justify-between hover:scale-[1.02] transition-transform order-3 pt-8 shadow-lg">
              <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-slate-800 text-amber-600 font-bold rounded-md font-mono text-xs">رتبه ۳</div>
              <div className="space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-full border-2 border-amber-700 overflow-hidden bg-slate-800 select-none">
                  <Avatar avatar={topThree[2].avatar} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight text-base line-clamp-1">{topThree[2].fullName}</h4>
                  <p className="text-xs text-slate-400">@{topThree[2].username}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-2xl font-black text-amber-700">{topThree[2].totalScore} <span className="text-xs text-slate-400 font-medium">امتیاز</span></p>
                <p className="text-[10px] text-slate-400 font-sans">{topThree[2].exactPredictions} پیش‌بینی دقیق</p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Control Bar: Search and Filters */}
      <div className="max-w-4xl mx-auto flex items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800" dir="rtl">
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
      </div>

      {/* Competitor Table */}
      <div className="max-w-4xl mx-auto overflow-hidden bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-2xl" dir="rtl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-emerald-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 text-center font-sans">رتبه</th>
                <th className="px-6 py-4">شرکت‌کننده</th>
                <th className="px-6 py-4 text-center">امتیاز کل</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">حدس دقیق (+۳)</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">تفکیک برنده (+۱)</th>
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
                          <span className="inline-flex items-center justify-center p-1 bg-amber-400/10 border border-amber-400/40 rounded-full text-amber-400 font-bold h-7 w-7 text-xs">🥇</span>
                        ) : user.rank === 2 ? (
                          <span className="inline-flex items-center justify-center p-1 bg-slate-200/10 border border-slate-300/40 rounded-full text-slate-200 font-bold h-7 w-7 text-xs">🥈</span>
                        ) : user.rank === 3 ? (
                          <span className="inline-flex items-center justify-center p-1 bg-amber-800/10 border border-amber-900/40 rounded-full text-amber-700 font-bold h-7 w-7 text-xs">🥉</span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">#{user.rank}</span>
                        )}
                      </td>
                      
                      {/* Participant Profile and Username */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-850 border border-slate-800 select-none">
                            <Avatar 
                              avatar={user.avatar} 
                              alt={user.fullName} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-sm text-slate-100 flex items-center gap-1.5 font-sans font-medium">
                              {user.fullName}
                              {isCurUser && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono border border-emerald-400/20">
                                  شما
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-slate-500 text-left">@{user.username}</span>
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

                      {/* Perfect predictions count (+3) */}
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className="font-mono text-sm inline-flex items-center gap-1 text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                          <Flame className="h-3.5 w-3.5" />
                          {user.exactPredictions}
                        </span>
                      </td>

                      {/* Winner correct guesses count (+1) */}
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
