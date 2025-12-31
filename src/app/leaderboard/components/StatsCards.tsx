'use client';

interface StatsCardsProps {
  totalEntries: number;
  uniquePlayers: number;
  totalPot: number;
  topScore: number;
}

export default function StatsCards({ totalEntries, uniquePlayers, totalPot, topScore }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg md:rounded-xl p-3 md:p-5">
        <p className="text-slate-400 text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Total Entries</p>
        <p className="text-xl md:text-3xl font-bold text-white">{totalEntries}</p>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg md:rounded-xl p-3 md:p-5">
        <p className="text-slate-400 text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Unique Players</p>
        <p className="text-xl md:text-3xl font-bold text-white">{uniquePlayers}</p>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg md:rounded-xl p-3 md:p-5">
        <p className="text-emerald-400 text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Total Pot</p>
        <p className="text-xl md:text-3xl font-bold text-emerald-400">${totalPot}</p>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg md:rounded-xl p-3 md:p-5">
        <p className="text-amber-400 text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Top Score</p>
        <p className="text-xl md:text-3xl font-bold text-amber-400">{topScore.toFixed(1)}</p>
      </div>
    </div>
  );
}

