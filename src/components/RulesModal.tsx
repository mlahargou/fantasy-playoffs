'use client';

import { useEffect, useRef } from 'react';
import { ENTRY_CONFIG, PAYOUT_CONFIG, SCORING_CONFIG } from '@/lib/config';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-3xl shadow-2xl shadow-emerald-500/10 animate-modal-in"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl border-b border-slate-700/50">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Official Rules
              </h2>
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
                aria-label="Close rules"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 pt-6 space-y-6">
          {/* The Basics */}
          <section>
            <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">1</span>
              The Basics
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-emerald-400 mt-1">→</span>
                <span>Pick <strong className="text-white">1 QB, 1 WR, 1 RB, and 1 TE</strong> from any team in the postseason</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 mt-1">→</span>
                <span>Your picks are <strong className="text-white">locked for the entire postseason</strong> — choose wisely!</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 mt-1">→</span>
                <span>Players accumulate points from Wild Card through Super Bowl</span>
              </li>
            </ul>
          </section>

          {/* Entry & Deadline */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">2</span>
              Entry & Deadline
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span>Entry fee: <strong className="text-white">${ENTRY_CONFIG.entryFee}</strong> per team</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span>Maximum <strong className="text-white">{ENTRY_CONFIG.maxTeamsPerPerson} teams</strong> per person</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span>Submissions close <strong className="text-white">{ENTRY_CONFIG.submissionDeadline.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span>Payment required by deadline or your teams will be <strong className="text-red-400">invalidated</strong></span>
              </li>
            </ul>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">3</span>
              Scoring
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-purple-400 mt-1">→</span>
                <span><strong className="text-white">Standard scoring</strong> (non-PPR)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 mt-1">→</span>
                <span>Only postseason game stats count toward your total</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 mt-1">→</span>
                <span>When your player&apos;s team gets eliminated, they stop earning points</span>
              </li>
            </ul>
          </section>

          {/* Payouts */}
          <section>
            <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">4</span>
              Payouts
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🥇</div>
                <div className="text-2xl font-black text-amber-400">{PAYOUT_CONFIG.firstPlace * 100}%</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider">First Place</div>
              </div>
              <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🥈</div>
                <div className="text-2xl font-black text-slate-300">{PAYOUT_CONFIG.secondPlace * 100}%</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider">Second Place</div>
              </div>
            </div>
            {/* Tiebreakers subsection */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Tiebreakers</h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Tie for 1st? <strong className="text-slate-200">All winners split the entire pot</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Tie for 2nd? The 10% prize is split evenly</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Important Notes</h3>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• All decisions by the commissioner are final</li>
              <li>• No refunds after submission deadline</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            Got it, let&apos;s play!
          </button>
        </div>
      </div>
    </div>
  );
}

