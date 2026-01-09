'use client';

import { useState, useEffect } from 'react';

interface Manager {
   id: number;
   email: string;
   name: string;
   is_admin: boolean;
   created_at: string;
   teams_created: number;
}

export default function AdminManagersPage() {
   const [managers, setManagers] = useState<Manager[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [saving, setSaving] = useState<number | null>(null);
   const [resetting, setResetting] = useState<number | null>(null);

   useEffect(() => {
      fetchManagers();
   }, []);

   const fetchManagers = async () => {
      try {
         const response = await fetch('/api/admin/managers');
         if (!response.ok) throw new Error('Failed to fetch');
         const data = await response.json();
         setManagers(data.managers || []);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
         setLoading(false);
      }
   };

   const toggleAdmin = async (userId: number, currentStatus: boolean) => {
      setSaving(userId);
      try {
         const response = await fetch('/api/admin/managers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isAdmin: !currentStatus }),
         });

         if (!response.ok) throw new Error('Failed to update');

         // Refresh data
         await fetchManagers();
      } catch (err) {
         alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
         setSaving(null);
      }
   };

   const resetPassword = async (userId: number, userName: string) => {
      const confirmed = confirm(
         `Are you sure you want to reset the password for ${userName}?\n\nThis will log them out and require them to set a new password.`
      );
      if (!confirmed) return;

      setResetting(userId);
      try {
         const response = await fetch('/api/admin/managers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
         });

         if (!response.ok) throw new Error('Failed to reset password');

         alert(`Password reset for ${userName}. They will need to set a new password on next login.`);
      } catch (err) {
         alert('Failed to reset password: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
         setResetting(null);
      }
   };

   // Stats
   const totalManagers = managers.length;
   const adminCount = managers.filter(m => m.is_admin).length;
   const totalTeams = managers.reduce((sum, m) => sum + m.teams_created, 0);
   const activeManagers = managers.filter(m => m.teams_created > 0).length;

   // Sort: admins first, then by name
   const sortedManagers = [...managers].sort((a, b) => {
      if (a.is_admin && !b.is_admin) return -1;
      if (!a.is_admin && b.is_admin) return 1;
      return a.name.localeCompare(b.name);
   });

   if (loading) {
      return (
         <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
               <div className="animate-pulse">
                  <div className="h-8 w-64 bg-slate-700/50 rounded mb-8" />
                  <div className="grid grid-cols-4 gap-4 mb-8">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-800/30 rounded-xl" />
                     ))}
                  </div>
                  <div className="h-96 bg-slate-800/30 rounded-xl" />
               </div>
            </div>
         </main>
      );
   }

   if (error) {
      return (
         <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10 flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-400 mb-4">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
               >
                  Retry
               </button>
            </div>
         </main>
      );
   }

   return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                     </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Managers</h1>
               </div>
               <p className="text-slate-400">View and manage all registered users</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Total Managers</div>
                  <div className="text-2xl font-bold text-white">{totalManagers}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Admins</div>
                  <div className="text-2xl font-bold text-violet-400">{adminCount}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Active Managers</div>
                  <div className="text-2xl font-bold text-emerald-400">{activeManagers}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Total Teams</div>
                  <div className="text-2xl font-bold text-white">{totalTeams}</div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-800/50 border-b border-slate-700/50">
                        <tr>
                           <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Manager
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Teams
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Role
                           </th>
                           <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Joined
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Role
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Password
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700/30">
                        {sortedManagers.map((manager) => (
                           <tr
                              key={manager.id}
                              className={`transition-colors ${manager.is_admin ? 'bg-violet-500/5' : ''}`}
                           >
                              <td className="px-4 py-3">
                                 <div className="flex flex-col">
                                    <span className="text-white font-medium">{manager.name}</span>
                                    <span className="text-xs text-slate-500">{manager.email}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-white font-bold">
                                    {manager.teams_created}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 {manager.is_admin ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                                       <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                       </svg>
                                       Admin
                                    </span>
                                 ) : (
                                    <span className="text-slate-500 text-sm">Manager</span>
                                 )}
                              </td>
                              <td className="px-4 py-3">
                                 <span className="text-slate-400 text-sm">
                                    {new Date(manager.created_at).toLocaleDateString()}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <button
                                    onClick={() => toggleAdmin(manager.id, manager.is_admin)}
                                    disabled={saving === manager.id || resetting === manager.id}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                       manager.is_admin
                                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                 >
                                    {saving === manager.id
                                       ? 'Saving...'
                                       : manager.is_admin
                                       ? 'Remove Admin'
                                       : 'Make Admin'}
                                 </button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <button
                                    onClick={() => resetPassword(manager.id, manager.name)}
                                    disabled={saving === manager.id || resetting === manager.id}
                                    className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    {resetting === manager.id ? 'Resetting...' : 'Reset PW'}
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center gap-6">
               <a
                  href="/admin/payments"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payments
               </a>
               <a
                  href="/leaderboard"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Leaderboard
               </a>
            </div>
         </div>
      </main>
   );
}

