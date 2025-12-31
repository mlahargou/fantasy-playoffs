'use client';

import { useState, useEffect } from 'react';
import { Entry, ScoringConfig, SortField, SortDirection } from './types';
import {
  LeaderboardHeader,
  StatsCards,
  LeaderboardTable,
  PayoutCard,
  LoadingState,
  ErrorState,
} from './components';
import { ENTRY_CONFIG } from '@/lib/config';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('total_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'total_score' ? 'desc' : 'asc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Calculate stats
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

        <LeaderboardTable
          entries={sortedEntries}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {entries.length > 0 && <PayoutCard totalPot={totalPot} />}

        {/* Back link */}
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
      </div>
    </main>
  );
}

