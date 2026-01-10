'use client';

import { useState } from 'react';

interface PlayerWithWeeklyScores {
  id: string;
  name: string;
  team: string;
  totalScore: number;
  weeklyScores: Record<number, number>;
}

interface TeamCardProps {
  teamNumber: number;
  rank: number;
  totalEntries: number;
  totalScore: number;
  players: {
    qb: PlayerWithWeeklyScores;
    wr: PlayerWithWeeklyScores;
    rb: PlayerWithWeeklyScores;
    te: PlayerWithWeeklyScores;
  };
  weeks: number[];
}

function RankBadge({ rank, totalEntries }: { rank: number; totalEntries: number }) {
  const colorClass =
    rank === 1
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : rank === 2
        ? 'bg-slate-400/20 text-slate-300 border-slate-400/30'
        : rank === 3
          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
          : 'bg-slate-700/30 text-slate-400 border-slate-600/30';

  const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${colorClass}`}>
      {rank}{suffix} of {totalEntries}
    </span>
  );
}

function PlayerCell({ position, player }: { position: string; player: PlayerWithWeeklyScores }) {
  return (
    <div className="flex-1 min-w-0 md:text-center flex md:block items-center gap-3">
      <div className="text-xs font-semibold text-slate-400 uppercase md:mb-1 w-8 md:w-auto">{position}</div>
      <div className="text-white text-sm truncate flex-1 md:flex-none">{player.name}</div>
      <div className="flex items-center md:justify-center gap-2">
        <span className="text-slate-500 text-xs">{player.team}</span>
        <span className="text-emerald-400 text-sm font-semibold">{player.totalScore.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function TeamCard({ teamNumber, rank, totalEntries, totalScore, players, weeks }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positions = ['qb', 'wr', 'rb', 'te'] as const;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
            {teamNumber}
          </span>
          <span className="text-white font-semibold">Team {teamNumber}</span>
        </div>
        <div className="flex items-center gap-4">
          <RankBadge rank={rank} totalEntries={totalEntries} />
          <div className="text-right">
            <span className="text-lg font-bold text-white">{totalScore.toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">pts</span>
          </div>
        </div>
      </div>

      {/* Players Row - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex flex-col md:flex-row md:items-start gap-2 md:gap-4 hover:bg-slate-700/20 transition-colors"
      >
        <div className="hidden md:block w-16 shrink-0" /> {/* Spacer to align with Week column */}
        <PlayerCell position="QB" player={players.qb} />
        <PlayerCell position="WR" player={players.wr} />
        <PlayerCell position="RB" player={players.rb} />
        <PlayerCell position="TE" player={players.te} />
        <div className="hidden md:flex w-16 shrink-0 items-center justify-end self-center">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {/* Mobile chevron */}
        <div className="md:hidden flex justify-center pt-2">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Weekly Breakdown - Expanded */}
      {isExpanded && (
        <div className="border-t border-slate-700/50">
          {/* Header Row */}
          <div className="px-4 py-2 bg-slate-800/30 flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase">
            <div className="w-16">Week</div>
            <div className="flex-1 text-center">QB</div>
            <div className="flex-1 text-center">WR</div>
            <div className="flex-1 text-center">RB</div>
            <div className="flex-1 text-center">TE</div>
            <div className="w-16 text-right">Total</div>
          </div>

          {/* Week Rows */}
          {weeks.map((week) => {
            const weekTotal =
              (players.qb.weeklyScores[week] || 0) +
              (players.wr.weeklyScores[week] || 0) +
              (players.rb.weeklyScores[week] || 0) +
              (players.te.weeklyScores[week] || 0);

            return (
              <div
                key={week}
                className="px-4 py-3 flex items-center gap-4 border-t border-slate-700/30 hover:bg-slate-700/10"
              >
                <div className="w-16 text-slate-300 font-medium">Week {week}</div>
                {positions.map((pos) => {
                  const score = players[pos].weeklyScores[week] || 0;
                  return (
                    <div
                      key={pos}
                      className={`flex-1 text-center text-sm font-medium ${score > 0 ? 'text-white' : 'text-slate-500'}`}
                    >
                      {score.toFixed(1)}
                    </div>
                  );
                })}
                <div className="w-16 text-right text-emerald-400 font-semibold">
                  {weekTotal.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
