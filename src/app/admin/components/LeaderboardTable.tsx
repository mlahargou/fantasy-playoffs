'use client';

import { Entry, SortField, SortDirection } from '../types';

interface LeaderboardTableProps {
  entries: Entry[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return null;
  return (
    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  );
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

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return null;

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

export default function LeaderboardTable({ entries, sortField, sortDirection, onSort }: LeaderboardTableProps) {
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
                Rank
              </th>
              <th
                onClick={() => onSort('email')}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                Email
                <SortIcon active={sortField === 'email'} direction={sortDirection} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                #
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
              <th
                onClick={() => onSort('total_score')}
                className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                Total
                <SortIcon active={sortField === 'total_score'} direction={sortDirection} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {entries.map((entry, index) => {
              const rank = sortField === 'total_score' && sortDirection === 'desc' ? index + 1 : null;
              const isLeader = rank === 1;

              return (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-700/20 transition-colors ${isLeader ? 'bg-amber-500/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <RankBadge rank={rank} />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{entry.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                      {entry.team_number}
                    </span>
                  </td>
                  <PlayerCell name={entry.qb_name} team={entry.qb_team} score={entry.score_breakdown.qb} />
                  <PlayerCell name={entry.wr_name} team={entry.wr_team} score={entry.score_breakdown.wr} />
                  <PlayerCell name={entry.rb_name} team={entry.rb_team} score={entry.score_breakdown.rb} />
                  <PlayerCell name={entry.te_name} team={entry.te_team} score={entry.score_breakdown.te} />
                  <td className="px-4 py-3 text-right">
                    <span className={`text-lg font-bold ${isLeader ? 'text-amber-400' : 'text-white'}`}>
                      {entry.total_score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

