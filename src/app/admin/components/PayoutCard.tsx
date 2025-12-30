'use client';

interface PayoutCardProps {
  totalPot: number;
}

export default function PayoutCard({ totalPot }: PayoutCardProps) {
  return (
    <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
      <h3 className="text-white font-semibold mb-2">Payouts</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">1st Place (90%):</span>
          <span className="text-emerald-400 font-bold ml-2">${(totalPot * 0.9).toFixed(0)}</span>
        </div>
        <div>
          <span className="text-slate-400">2nd Place (10%):</span>
          <span className="text-emerald-400 font-bold ml-2">${(totalPot * 0.1).toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

