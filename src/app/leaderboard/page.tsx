'use client';

import { useState, useEffect } from 'react';
import { Entry, ScoringConfig } from './types';
import {
  LeaderboardHeader,
  StatsCards,
  LeaderboardTable,
  LeaderboardFilters,
  PayoutCard,
  LoadingState,
  ErrorState,
  Filters,
} from './components';
import { ENTRY_CONFIG } from '@/lib/config';

interface LeaderboardPageProps {
  hideBackLink?: boolean;
}

const emptyFilters: Filters = { email: '', qb: '', wr: '', rb: '', te: '' };

export default function LeaderboardPage({ hideBackLink = false }: LeaderboardPageProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/scores');
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data.entries || []);
        setConfig(data.config || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Apply filters
  const filteredEntries = entries.filter((entry) => {
    if (filters.email && entry.email !== filters.email) return false;
    if (filters.qb && entry.qb_name !== filters.qb) return false;
    if (filters.wr && entry.wr_name !== filters.wr) return false;
    if (filters.rb && entry.rb_name !== filters.rb) return false;
    if (filters.te && entry.te_name !== filters.te) return false;
    return true;
  });

  // Sort by score descending
  const sortedEntries = [...filteredEntries].sort((a, b) => b.total_score - a.total_score);

  // Calculate stats (always from all entries, not filtered)
  const uniqueEmails = new Set(entries.map(e => e.email.toLowerCase()));
  const totalPot = entries.length * ENTRY_CONFIG.entryFee;
  const topScore = entries.length > 0 ? Math.max(...entries.map(e => e.total_score)) : 0;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <LeaderboardHeader config={config} />

        <StatsCards
          totalEntries={entries.length}
          uniquePlayers={uniqueEmails.size}
          totalPot={totalPot}
          topScore={topScore}
        />

        <LeaderboardFilters
          entries={entries}
          filters={filters}
          onFilterChange={setFilters}
        />

        <LeaderboardTable entries={sortedEntries} />

        {entries.length > 0 && <PayoutCard totalPot={totalPot} />}

        {/* Back link - only show when not on homepage */}
        {!hideBackLink && (
          <div className="mt-8">
            <a
              href="/"
              className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Entry Form
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

