'use client';

import { ScoringConfig } from '../types';

interface AdminHeaderProps {
  config: ScoringConfig | null;
}

export default function AdminHeader({ config }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-slate-400">Fantasy Playoffs Bracket Challenge</p>
      {config && (
        <p className="text-slate-500 text-sm mt-1">
          Scoring: {config.season} {config.seasonType} • Weeks {config.weeks.join(', ')}
        </p>
      )}
    </div>
  );
}

