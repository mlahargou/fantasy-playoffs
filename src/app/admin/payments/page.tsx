'use client';

import { useState, useEffect } from 'react';
import { ENTRY_CONFIG } from '@/lib/config';

interface UserPayment {
   id: number;
   email: string;
   name: string;
   created_at: string;
   teams_created: number;
   teams_paid: number;
   notes: string | null;
   payment_updated_at: string | null;
}

export default function AdminPaymentsPage() {
   const [users, setUsers] = useState<UserPayment[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [saving, setSaving] = useState<number | null>(null);

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const response = await fetch('/api/admin/payments');
         if (!response.ok) throw new Error('Failed to fetch');
         const data = await response.json();
         setUsers(data.users || []);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
         setLoading(false);
      }
   };

   const updatePayment = async (userId: number, teamsPaid: number, notes: string | null) => {
      setSaving(userId);
      try {
         const response = await fetch('/api/admin/payments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, teamsPaid, notes }),
         });

         if (!response.ok) throw new Error('Failed to update');

         // Refresh data
         await fetchUsers();
      } catch (err) {
         alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
         setSaving(null);
      }
   };

   // Stats
   const totalUsers = users.length;
   const totalTeams = users.reduce((sum, u) => sum + u.teams_created, 0);
   const totalPaid = users.reduce((sum, u) => sum + u.teams_paid, 0);
   const fullyPaidUsers = users.filter(u => u.teams_paid >= u.teams_created && u.teams_created > 0).length;
   const unpaidTeams = totalTeams - totalPaid;
   const expectedRevenue = totalTeams * ENTRY_CONFIG.entryFee;
   const collectedRevenue = totalPaid * ENTRY_CONFIG.entryFee;

   // Sort users: unpaid first, then fully paid, then no teams
   const sortedUsers = [...users].sort((a, b) => {
      const aFullyPaid = a.teams_paid >= a.teams_created && a.teams_created > 0;
      const bFullyPaid = b.teams_paid >= b.teams_created && b.teams_created > 0;
      const aNoTeams = a.teams_created === 0;
      const bNoTeams = b.teams_created === 0;

      // Users with no teams go to the very bottom
      if (aNoTeams && !bNoTeams) return 1;
      if (!aNoTeams && bNoTeams) return -1;

      // Fully paid users go after unpaid users
      if (aFullyPaid && !bFullyPaid) return 1;
      if (!aFullyPaid && bFullyPaid) return -1;

      // Within same category, sort by name
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Payment Tracking</h1>
               </div>
               <p className="text-slate-400">Track which users have paid for their teams</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{totalUsers}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Teams Created</div>
                  <div className="text-2xl font-bold text-white">{totalTeams}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Fully Paid</div>
                  <div className="text-2xl font-bold text-emerald-400">{fullyPaidUsers}/{totalUsers}</div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Unpaid Teams</div>
                  <div className={`text-2xl font-bold ${unpaidTeams > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                     {unpaidTeams}
                  </div>
               </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-slate-400 text-sm mb-1">Revenue Collected</div>
                     <div className="text-3xl font-bold text-emerald-400">
                        ${collectedRevenue.toLocaleString()}
                        <span className="text-lg text-slate-500 font-normal"> / ${expectedRevenue.toLocaleString()}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-slate-400 text-sm mb-1">Outstanding</div>
                     <div className={`text-2xl font-bold ${unpaidTeams > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${(expectedRevenue - collectedRevenue).toLocaleString()}
                     </div>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-800/50 border-b border-slate-700/50">
                        <tr>
                           <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              User
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Teams Created
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Teams Paid
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Status
                           </th>
                           <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Notes
                           </th>
                           <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700/30">
                        {sortedUsers.map((user) => (
                           <UserRow
                              key={user.id}
                              user={user}
                              onUpdate={updatePayment}
                              saving={saving === user.id}
                           />
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Footer */}
            <div className="mt-8">
               <a
                  href="/leaderboard"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Leaderboard
               </a>
            </div>
         </div>
      </main>
   );
}

interface UserRowProps {
   user: UserPayment;
   onUpdate: (userId: number, teamsPaid: number, notes: string | null) => Promise<void>;
   saving: boolean;
}

function UserRow({ user, onUpdate, saving }: UserRowProps) {
   const [teamsPaid, setTeamsPaid] = useState(user.teams_paid);
   const [notes, setNotes] = useState(user.notes || '');
   const [editing, setEditing] = useState(false);

   const hasChanges = teamsPaid !== user.teams_paid || notes !== (user.notes || '');
   const isPaidUp = user.teams_paid >= user.teams_created && user.teams_created > 0;
   const owesMore = user.teams_created > user.teams_paid;
   const amountOwed = (user.teams_created - user.teams_paid) * ENTRY_CONFIG.entryFee;

   const handleSave = async () => {
      await onUpdate(user.id, teamsPaid, notes || null);
      setEditing(false);
   };

   const handleCancel = () => {
      setTeamsPaid(user.teams_paid);
      setNotes(user.notes || '');
      setEditing(false);
   };

   // Update local state when user prop changes
   useEffect(() => {
      setTeamsPaid(user.teams_paid);
      setNotes(user.notes || '');
   }, [user.teams_paid, user.notes]);

   return (
      <tr className={`transition-colors ${owesMore ? 'bg-amber-500/5' : isPaidUp ? 'bg-emerald-500/5' : ''}`}>
         <td className="px-4 py-3">
            <div className="flex flex-col">
               <span className="text-white font-medium">{user.name}</span>
               <span className="text-xs text-slate-500">{user.email}</span>
            </div>
         </td>
         <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-white font-bold">
               {user.teams_created}
            </span>
         </td>
         <td className="px-4 py-3 text-center">
            {editing ? (
               <input
                  type="number"
                  min={0}
                  max={user.teams_created}
                  value={teamsPaid}
                  onChange={(e) => setTeamsPaid(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 rounded bg-slate-700 border border-slate-600 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
               />
            ) : (
               <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${isPaidUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-white'
                     }`}
               >
                  {user.teams_paid}
               </span>
            )}
         </td>
         <td className="px-4 py-3 text-center">
            {user.teams_created === 0 ? (
               <span className="text-slate-500 text-sm">No teams</span>
            ) : isPaidUp ? (
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Paid
               </span>
            ) : (
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Owes ${amountOwed}
               </span>
            )}
         </td>
         <td className="px-4 py-3">
            {editing ? (
               <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full px-2 py-1 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
               />
            ) : (
               <span className="text-slate-400 text-sm">{user.notes || '—'}</span>
            )}
         </td>
         <td className="px-4 py-3 text-center">
            {editing ? (
               <div className="flex items-center justify-center gap-2">
                  <button
                     onClick={handleSave}
                     disabled={saving || !hasChanges}
                     className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                  >
                     {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                     onClick={handleCancel}
                     disabled={saving}
                     className="px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium transition-colors"
                  >
                     Cancel
                  </button>
               </div>
            ) : (
               <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
               >
                  Edit
               </button>
            )}
         </td>
      </tr>
   );
}

