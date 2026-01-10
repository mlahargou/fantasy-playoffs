'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const managerPages = [
   {
      href: '/manager/entry',
      title: 'Create Teams',
      description: 'Create and edit your playoff teams',
      icon: (
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      color: 'from-emerald-500 to-teal-600',
   },
   {
      href: '/manager/teams',
      title: 'My Teams',
      description: 'View your teams with weekly stats and rankings',
      icon: (
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      color: 'from-blue-500 to-indigo-600',
   },
   {
      href: '/leaderboard',
      title: 'Leaderboard',
      description: 'See standings and scores for all entries',
      icon: (
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      color: 'from-violet-500 to-purple-600',
   },
];

export default function ManagerIndexPage() {
   const router = useRouter();
   const [isAdmin, setIsAdmin] = useState(false);

   useEffect(() => {
      const checkAdmin = async () => {
         try {
            const response = await fetch('/api/auth/session');
            if (response.ok) {
               const data = await response.json();
               setIsAdmin(data.user?.isAdmin ?? false);
            }
         } catch (error) {
            console.error('Error checking session:', error);
         }
      };
      checkAdmin();
   }, []);

   const handleSignOut = async () => {
      try {
         await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
         console.error('Error logging out:', error);
      }
      router.push('/');
   };

   return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
         <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
               </div>
               <p className="text-slate-400">Manage your Fantasy Playoffs entries</p>
            </div>

            {/* Manager Pages Grid */}
            <div className="grid gap-4 md:grid-cols-2">
               {managerPages.map((page) => (
                  <Link
                     key={page.href}
                     href={page.href}
                     className="group bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
                  >
                     <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center shrink-0`}>
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {page.icon}
                           </svg>
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {page.title}
                           </h2>
                           <p className="text-sm text-slate-400 mt-1">
                              {page.description}
                           </p>
                        </div>
                     </div>
                  </Link>
               ))}
               {isAdmin && (
                  <Link
                     href="/admin"
                     className="group bg-slate-800/30 border border-amber-500/30 rounded-xl p-6 hover:bg-slate-800/50 hover:border-amber-500/50 transition-all"
                  >
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                              Admin
                           </h2>
                           <p className="text-sm text-slate-400 mt-1">
                              Manage users and payments
                           </p>
                        </div>
                     </div>
                  </Link>
               )}
            </div>

            {/* Footer */}
            <div className="mt-8">
               <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
               </button>
            </div>
         </div>
      </main>
   );
}

