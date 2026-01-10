'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EntryForm from './EntryForm';
import RulesModal from '@/components/RulesModal';
import { DISPLAY_CONFIG } from '@/lib/config';

const RULES_SEEN_KEY = 'fantasy-playoffs-rules-seen';

export default function EntryFormPage() {
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    // Show rules modal on first visit
    const hasSeenRules = localStorage.getItem(RULES_SEEN_KEY);
    if (!hasSeenRules) {
      setShowRules(true);
    }
  }, []);

  const handleCloseRules = () => {
    setShowRules(false);
    localStorage.setItem(RULES_SEEN_KEY, 'true');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative max-w-lg mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {DISPLAY_CONFIG.seasonLabel}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {DISPLAY_CONFIG.title}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              {DISPLAY_CONFIG.subtitle}
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Pick your QB, WR, RB, and TE for the entire playoff run.
            Standard scoring from Wild Card through Super Bowl.
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowRules(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              View Official Rules
            </button>
            <a
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Leaderboard
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <EntryForm />
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/manager"
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={handleCloseRules} />
    </main>
  );
}

