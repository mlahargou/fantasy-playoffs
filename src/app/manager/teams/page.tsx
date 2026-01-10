'use client';

import Link from 'next/link';
import MyTeamsSection from './components/MyTeamsSection';

export default function MyTeamsPage() {
   return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
         <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <Link
                  href="/manager"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
               </Link>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-white">My Teams</h1>
                     <p className="text-slate-400">View your teams with weekly stats and rankings</p>
                  </div>
               </div>
            </div>

            {/* Teams Content */}
            <MyTeamsSection />
         </div>
      </main>
   );
}
