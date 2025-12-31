'use client';

import { PAYOUT_CONFIG } from '@/lib/config';

interface PayoutCardProps {
  totalPot: number;
}

export default function PayoutCard({ totalPot }: PayoutCardProps) {
  const firstPayout = Math.round(totalPot * PAYOUT_CONFIG.firstPlace);
  const secondPayout = Math.round(totalPot * PAYOUT_CONFIG.secondPlace);

  return (
    <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
      <h3 className="text-white font-semibold mb-2">Payouts</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">1st Place ({PAYOUT_CONFIG.firstPlace * 100}%):</span>
          <span className="text-emerald-400 font-bold ml-2">${firstPayout}</span>
        </div>
        <div>
          <span className="text-slate-400">2nd Place ({PAYOUT_CONFIG.secondPlace * 100}%):</span>
          <span className="text-emerald-400 font-bold ml-2">${secondPayout}</span>
        </div>
      </div>
    </div>
  );
}

