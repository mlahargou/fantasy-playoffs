'use client';

import Link from 'next/link';
import { ENTRY_CONFIG, DISPLAY_CONFIG } from '@/lib/config';
import EntryFormPage from './components/EntryFormPage';

export default function ManagerEntryPage() {
   const now = new Date();
   const submissionsClosed = now >= ENTRY_CONFIG.submissionWindowClosed;

   if (submissionsClosed) {
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     Submissions Closed
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                     {DISPLAY_CONFIG.title}
                     <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {DISPLAY_CONFIG.subtitle}
                     </span>
                  </h1>

                  <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
                     The submission window has closed. You can no longer create or edit team entries.
                  </p>

                  {/* Message card */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 text-left">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold text-white mb-2">What&apos;s Next?</h2>
                           <p className="text-sm text-slate-400 mb-4">
                              The playoffs have begun! Check out the leaderboard to see how all the entries are performing.
                           </p>
                           <Link
                              href="/leaderboard"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-200"
                           >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              View Leaderboard
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* Back link */}
                  <div className="mt-8">
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
            </div>
         </main>
      );
   }

   return <EntryFormPage />;
}

