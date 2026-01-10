'use client';

import { useState, useEffect, Suspense } from 'react';
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
import RulesModal from '@/components/RulesModal';
import { ENTRY_CONFIG } from '@/lib/config';

interface LeaderboardPageProps {
  hideBackLink?: boolean;
}

const emptyFilters: Filters = { email: '', qb: '', wr: '', rb: '', te: '' };

export default function LeaderboardPage({ hideBackLink = false }: LeaderboardPageProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <LeaderboardContent hideBackLink={hideBackLink} />
    </Suspense>
  );
}

function LeaderboardContent({ hideBackLink = false }: LeaderboardPageProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showRules, setShowRules] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check submission window status
  const now = new Date();
  const windowOpened = now > ENTRY_CONFIG.submissionWindowOpened;
  const windowClosed = now > ENTRY_CONFIG.submissionWindowClosed;
  const duringSubmissionWindow = windowOpened && !windowClosed;

  // Hide player selections during submission window (unless user is admin)
  const hidePlayerSelections = duringSubmissionWindow && !isAdmin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch entries and session in parallel
        const [scoresResponse, sessionResponse] = await Promise.all([
          fetch('/api/scores'),
          fetch('/api/auth/session'),
        ]);

        if (!scoresResponse.ok) throw new Error('Failed to fetch entries');
        const scoresData = await scoresResponse.json();
        setEntries(scoresData.entries || []);
        setConfig(scoresData.config || null);

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setIsAuthenticated(sessionData.authenticated ?? false);
          setIsAdmin(sessionData.user?.isAdmin ?? false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          topScore={hidePlayerSelections ? null : topScore}
        />

        {hidePlayerSelections ? (
          <div className="bg-slate-800/30 border border-amber-500/30 rounded-xl p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-amber-400 font-semibold">Player Selections Hidden</span>
            </div>
            <p className="text-slate-400">
              Selected players will be revealed when the league starts on{' '}
              <span className="text-white font-medium">
                {ENTRY_CONFIG.submissionWindowClosed.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            </p>
          </div>
        ) : (
          <LeaderboardFilters
            entries={entries}
            filters={filters}
            onFilterChange={setFilters}
          />
        )}

        <LeaderboardTable entries={sortedEntries} hidePlayerSelections={hidePlayerSelections} />

        {entries.length > 0 && <PayoutCard totalPot={totalPot} />}

        {/* Footer links */}
        <div className="mt-8 flex items-center gap-6">
          {!hideBackLink && (
            <a
              href={isAuthenticated ? '/manager' : '/'}
              className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
            </a>
          )}
          <button
            onClick={() => setShowRules(true)}
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            View Rules
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}

