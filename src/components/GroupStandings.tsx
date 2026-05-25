import React, { useState, useMemo } from 'react';
import { Match, MatchStage, MatchStatus, Team } from '../types';
import { teamsSeed } from '../data/teams';
import { Table, Search, GitBranch, LayoutGrid } from 'lucide-react';
import FlagIcon from './FlagIcon';
import KnockoutBracket from './KnockoutBracket';

interface GroupStandingsProps {
  matches: Match[];
}

interface TeamStanding {
  teamId: string;
  name: string;
  shortCode: string;
  logo: string;
  groupName: string;
  plays: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export default function GroupStandings({ matches }: GroupStandingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'knockout'>('groups');

  // Group teams list
  const groupsList = useMemo(() => {
    const groupsSet = new Set<string>();
    teamsSeed.forEach(t => groupsSet.add(t.groupName));
    return Array.from(groupsSet).sort();
  }, []);

  // Compute standings stats based on matches where status is FINISHED and stage is GROUP stage
  const standingsData = useMemo(() => {
    // 1. Initialize stats for all teams
    const stats: Record<string, TeamStanding> = {};
    teamsSeed.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        name: team.name,
        shortCode: team.shortCode,
        logo: team.logo,
        groupName: team.groupName,
        plays: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      };
    });

    // 2. Loop through matches and aggregate
    matches.forEach(match => {
      if (
        match.stage === MatchStage.GROUP &&
        match.status === MatchStatus.FINISHED &&
        match.homeScore !== null &&
        match.awayScore !== null
      ) {
        const home = stats[match.homeTeamId];
        const away = stats[match.awayTeamId];

        if (home && away) {
          home.plays += 1;
          away.plays += 1;
          home.gf += match.homeScore;
          home.ga += match.awayScore;
          away.gf += match.awayScore;
          away.ga += match.homeScore;

          if (match.homeScore > match.awayScore) {
            home.wins += 1;
            home.pts += 3;
            away.losses += 1;
          } else if (match.homeScore < match.awayScore) {
            away.wins += 1;
            away.pts += 3;
            home.losses += 1;
          } else {
            home.draws += 1;
            home.pts += 1;
            away.draws += 1;
            away.pts += 1;
          }

          home.gd = home.gf - home.ga;
          away.gd = away.gf - away.ga;
        }
      }
    });

    // 3. Group and Sort
    const grouped: Record<string, TeamStanding[]> = {};
    groupsList.forEach(grp => {
      grouped[grp] = [];
    });

    Object.values(stats).forEach(teamStat => {
      if (grouped[teamStat.groupName]) {
        grouped[teamStat.groupName].push(teamStat);
      }
    });

    // Sort order: points (desc) -> Goal Diff (desc) -> Goals For (desc) -> name (asc)
    Object.keys(grouped).forEach(grp => {
      grouped[grp].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  }, [matches, groupsList]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Search and Header panel */}
      <div className="bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-emerald-400" />
            جدول گروه‌ها و رتبه‌بندی تیم‌ها
          </h2>
          <p className="text-xs text-slate-400">
            محاسبه زنده بر اساس نتایج واقعی ثبت شده مرحله گروهی (۳ امتیاز برای برد، ۱ امتیاز برای تساوی).
          </p>
        </div>

        <div className="relative max-w-xs font-sans">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="جستجوی تیم یا گروه..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl pr-9 pl-4 py-1.5 text-xs text-right focus:outline-none focus:border-emerald-550 transition-colors"
          />
        </div>
      </div>

      {/* Sub-tab Selection Bar */}
      <div className="flex items-center gap-2 border-b border-slate-900/80 pb-3">
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeSubTab === 'groups'
              ? 'bg-emerald-950/45 text-emerald-400 border-emerald-550/30 shadow-md shadow-emerald-900/5'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/10'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          مرحله گروهی (جدول امتیازات)
        </button>

        <button
          onClick={() => setActiveSubTab('knockout')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeSubTab === 'knockout'
              ? 'bg-emerald-950/45 text-emerald-400 border-emerald-550/30 shadow-md shadow-emerald-900/5'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/10'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          مراحل حذفی (نمودار صعود هوشمند)
        </button>
      </div>

      {activeSubTab === 'knockout' ? (
        <KnockoutBracket matches={matches} />
      ) : (
        /* Grid displaying 8 pools A to H */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupsList
            .filter(groupName => {
              if (!searchTerm.trim()) return true;
              const clean = searchTerm.toLowerCase();
              const groupMatch = groupName.toLowerCase().includes(clean);
              const teamsInGroup = standingsData[groupName] || [];
              const hasTeamMatch = teamsInGroup.some(
                t => t.name.toLowerCase().includes(clean) || t.shortCode.toLowerCase().includes(clean)
              );
              return groupMatch || hasTeamMatch;
            })
            .map(groupName => {
              const tableRows = standingsData[groupName] || [];

              return (
                <div 
                  key={groupName}
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-xl hover:border-emerald-500/10 transition-colors relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest font-sans">
                       رده‌بندی {groupName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">مرحله گروهی</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-slate-300">
                      <thead>
                        <tr className="text-slate-500 font-sans text-[10px] border-b border-slate-800/40">
                          <th className="py-2 pr-1 text-center w-6">#</th>
                          <th className="py-2 pr-2">تیم</th>
                          <th className="py-2 text-center w-10">بازی</th>
                          <th className="py-2 text-center w-8">برد</th>
                          <th className="py-2 text-center w-8">مساوی</th>
                          <th className="py-2 text-center w-8">باخت</th>
                          <th className="py-2 text-center w-12">زده:خورده</th>
                          <th className="py-2 text-center w-10">تفاضل</th>
                          <th className="py-2 text-center w-10 font-black text-emerald-300">امتیاز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {tableRows.map((teamStats, index) => {
                          const highlight = searchTerm && (
                            teamStats.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            teamStats.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
                          );

                          return (
                            <tr 
                              key={teamStats.teamId}
                              className={`transition-colors text-slate-300 ${
                                highlight 
                                  ? 'bg-emerald-500/10 text-white font-extrabold' 
                                  : index < 2 
                                    ? 'hover:bg-slate-950/20' 
                                    : 'text-slate-400 hover:bg-slate-950/20'
                              }`}
                            >
                              {/* Position */}
                              <td className="py-2.5 pr-1 text-center font-mono">
                                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-md text-[10px] font-bold ${
                                  index < 2 
                                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-550/10' 
                                    : 'text-slate-500'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>

                              {/* Team logo + Name */}
                              <td className="py-2.5 pr-2 font-medium text-right">
                                <div className="flex items-center gap-2">
                                  <FlagIcon teamIdOrCode={teamStats.teamId} className="h-4 w-6 rounded shadow-sm shrink-0" />
                                  <span className="truncate max-w-[120px] sm:max-w-none text-slate-200">
                                    {teamStats.name}{' '}
                                    <span className="text-[10px] text-slate-500 font-mono">({teamStats.shortCode})</span>
                                  </span>
                                </div>
                              </td>

                              {/* Played */}
                              <td className="py-2.5 text-center font-mono">{teamStats.plays}</td>

                              {/* Won */}
                              <td className="py-2.5 text-center font-mono text-slate-450">{teamStats.wins}</td>

                              {/* Drawn */}
                              <td className="py-2.5 text-center font-mono text-slate-500">{teamStats.draws}</td>

                              {/* Lost */}
                              <td className="py-2.5 text-center font-mono text-slate-500">{teamStats.losses}</td>

                              {/* Scored : Conceded */}
                              <td className="py-2.5 text-center font-mono text-slate-500">
                                {teamStats.gf}:{teamStats.ga}
                              </td>

                              {/* Goal Difference */}
                              <td className={`py-2.5 text-center font-mono ${
                                teamStats.gd > 0 ? 'text-emerald-500' : teamStats.gd < 0 ? 'text-red-400' : 'text-slate-500'
                              }`}>
                                {teamStats.gd > 0 ? `+${teamStats.gd}` : teamStats.gd}
                              </td>

                              {/* Points */}
                              <td className="py-2.5 text-center font-black font-mono text-emerald-400 bg-emerald-950/10 rounded-l-lg">
                                {teamStats.pts}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtitle qualification bar indicator */}
                  <div className="pt-2 border-t border-slate-800/20 flex gap-2 justify-end text-[9px] text-slate-500 uppercase font-sans tracking-wider" dir="rtl">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> ۲ تیم برتر مستقیماً صعود می‌کنند
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
