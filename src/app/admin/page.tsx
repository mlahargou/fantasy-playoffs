'use client';

import Link from 'next/link';

const adminPages = [
   {
      href: '/admin/managers',
      title: 'Managers',
      description: 'View and manage all registered users, toggle admin access, reset passwords',
      icon: (
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      ),
      color: 'from-violet-500 to-purple-600',
   },
   {
      href: '/admin/payments',
      title: 'Payments',
      description: 'Track which users have paid for their teams',
      icon: (
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      color: 'from-emerald-500 to-teal-600',
   },
];

export default function AdminIndexPage() {
   return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
         <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
               </div>
               <p className="text-slate-400">Manage your Fantasy Playoffs application</p>
            </div>

            {/* Admin Pages Grid */}
            <div className="grid gap-4 md:grid-cols-2">
               {adminPages.map((page) => (
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
            </div>

            {/* Footer */}
            <div className="mt-8">
               <a
                  href="/manager"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
               </a>
            </div>
         </div>
      </main>
   );
}

