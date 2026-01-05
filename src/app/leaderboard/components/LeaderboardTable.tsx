'use client';

import { useState } from 'react';
import { Entry } from '../types';

const ENTRIES_PER_PAGE = 10;

interface LeaderboardTableProps {
  entries: Entry[];
  hidePlayerSelections?: boolean;
}

function PlayerCell({ name, team, score }: { name: string; team: string; score: number }) {
  return (
    <td className="px-4 py-3">
      <div className="flex flex-col">
        <span className="text-white text-sm">{name}</span>
        <span className="text-xs text-slate-500">{team} • {score.toFixed(1)}</span>
      </div>
    </td>
  );
}

function HiddenCell() {
  return (
    <td className="px-4 py-3">
      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    </td>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colorClass =
    rank === 1 ? 'bg-amber-500/20 text-amber-400' :
      rank === 2 ? 'bg-slate-400/20 text-slate-300' :
        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
          'text-slate-500';

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${colorClass}`}>
      {rank}
    </span>
  );
}

export default function LeaderboardTable({ entries, hidePlayerSelections = false }: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const endIndex = startIndex + ENTRIES_PER_PAGE;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  if (entries.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
        <p className="text-slate-400">No entries yet</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                QB
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                WR
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                RB
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                TE
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider sticky right-0 bg-slate-800/50">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {paginatedEntries.map((entry, index) => {
              const rank = startIndex + index + 1;
              const isLeader = rank === 1 && !hidePlayerSelections;

              return (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-700/20 transition-colors ${isLeader ? 'bg-amber-500/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <RankBadge rank={rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{entry.user_name || entry.email}</span>
                      {entry.user_name && (
                        <span className="text-xs text-slate-500">{entry.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                      {entry.team_number}
                    </span>
                  </td>
                  {hidePlayerSelections ? (
                    <>
                      <HiddenCell />
                      <HiddenCell />
                      <HiddenCell />
                      <HiddenCell />
                      <td className="px-4 py-3 text-right sticky right-0 bg-slate-900">
                        <span className="text-slate-500 text-sm">—</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <PlayerCell name={entry.qb_name} team={entry.qb_team} score={entry.score_breakdown.qb} />
                      <PlayerCell name={entry.wr_name} team={entry.wr_team} score={entry.score_breakdown.wr} />
                      <PlayerCell name={entry.rb_name} team={entry.rb_team} score={entry.score_breakdown.rb} />
                      <PlayerCell name={entry.te_name} team={entry.te_team} score={entry.score_breakdown.te} />
                      <td className={`px-4 py-3 text-right sticky right-0 ${isLeader ? 'bg-[#1a1f2e]' : 'bg-slate-900'}`}>
                        <span className={`text-lg font-bold ${isLeader ? 'text-amber-400' : 'text-white'}`}>
                          {entry.total_score.toFixed(1)}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-700/50 bg-slate-800/20">
          <div className="text-sm text-slate-400 order-2 sm:order-1">
            {startIndex + 1}–{Math.min(endIndex, entries.length)} of {entries.length}
          </div>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-2 py-1 text-sm text-slate-300 whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
