'use client';

import { useState } from 'react';
import PlayerSelect from './PlayerSelect';

interface Player {
   id: string;
   name: string;
   team: string;
   position: string;
}

export default function EntryForm() {
   const [email, setEmail] = useState('');
   const [emailConfirmed, setEmailConfirmed] = useState(false);
   const [teamNumber, setTeamNumber] = useState(1);
   const [submittedTeams, setSubmittedTeams] = useState<Set<number>>(new Set());
   const [loadingEmail, setLoadingEmail] = useState(false);
   const [qb, setQb] = useState<Player | null>(null);
   const [wr, setWr] = useState<Player | null>(null);
   const [rb, setRb] = useState<Player | null>(null);
   const [te, setTe] = useState<Player | null>(null);
   const [submitting, setSubmitting] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

   const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
         setMessage({ type: 'error', text: 'Please enter a valid email address' });
         return;
      }

      setLoadingEmail(true);
      try {
         const response = await fetch(`/api/entries?email=${encodeURIComponent(trimmedEmail)}`);
         if (response.ok) {
            const data = await response.json();
            const teams = new Set<number>(data.submittedTeams || []);
            setSubmittedTeams(teams);

            // Auto-select first available team number
            const firstAvailable = [1, 2, 3, 4, 5].find((num) => !teams.has(num));
            if (firstAvailable) {
               setTeamNumber(firstAvailable);
            }
         }
         setEmailConfirmed(true);
      } catch (error) {
         console.error('Error checking email:', error);
         setEmailConfirmed(true); // Still proceed even if check fails
      } finally {
         setLoadingEmail(false);
      }
   };

   const handleChangeEmail = () => {
      setEmailConfirmed(false);
      setSubmittedTeams(new Set());
      setMessage(null);
   };

   const handleTeamSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      if (!qb || !wr || !rb || !te) {
         setMessage({ type: 'error', text: 'Please select all 4 players' });
         return;
      }

      setSubmitting(true);

      try {
         const response = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), teamNumber, qb, wr, rb, te }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Failed to submit');
         }

         setMessage({ type: 'success', text: data.message });

         // Mark this team as submitted
         const newSubmittedTeams = new Set([...submittedTeams, teamNumber]);
         setSubmittedTeams(newSubmittedTeams);

         // Find next available team number
         const nextTeam = [1, 2, 3, 4, 5].find((num) => !newSubmittedTeams.has(num));

         if (nextTeam) {
            setTeamNumber(nextTeam);
         }

         // Reset player selections
         setQb(null);
         setWr(null);
         setRb(null);
         setTe(null);
      } catch (error) {
         setMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to submit. Please try again.'
         });
      } finally {
         setSubmitting(false);
      }
   };

   const isFormValid = qb && wr && rb && te;
   const allTeamsSubmitted = submittedTeams.size >= 5;

   // Step 1: Email entry
   if (!emailConfirmed) {
      return (
         <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
               <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
                  Your Email
               </label>
               <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoFocus
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
               />
               <p className="mt-2 text-sm text-slate-500">
                  We&apos;ll use this to track your submissions
               </p>
            </div>

            {message && (
               <div className="p-4 rounded-xl text-center font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                  {message.text}
               </div>
            )}

            <button
               type="submit"
               disabled={!email.trim() || loadingEmail}
               className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${email.trim() && !loadingEmail
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
            >
               {loadingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                     Loading...
                  </span>
               ) : (
                  <span className="flex items-center justify-center gap-2">
                     Continue
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                     </svg>
                  </span>
               )}
            </button>
         </form>
      );
   }

   // Step 2: Team selection
   return (
      <form onSubmit={handleTeamSubmit} className="space-y-8">
         {/* Email display with change button */}
         <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
               </div>
               <div>
                  <p className="text-white font-medium">{email.toLowerCase()}</p>
                  {submittedTeams.size > 0 && (
                     <p className="text-sm text-emerald-400">
                        {submittedTeams.size} team{submittedTeams.size > 1 ? 's' : ''} submitted
                     </p>
                  )}
               </div>
            </div>
            <button
               type="button"
               onClick={handleChangeEmail}
               className="text-sm text-slate-400 hover:text-white transition-colors"
            >
               Change
            </button>
         </div>

         {/* Team Number */}
         <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
               Team Number
            </label>
            <div className="flex gap-3">
               {[1, 2, 3, 4, 5].map((num) => {
                  const isSubmitted = submittedTeams.has(num);
                  const isSelected = teamNumber === num;

                  return (
                     <button
                        key={num}
                        type="button"
                        onClick={() => !isSubmitted && setTeamNumber(num)}
                        disabled={isSubmitted}
                        className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 relative ${isSubmitted
                           ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                           : isSelected
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:border-slate-500/50 hover:text-white'
                           }`}
                     >
                        {isSubmitted ? (
                           <span className="flex items-center justify-center gap-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                           </span>
                        ) : (
                           num
                        )}
                     </button>
                  );
               })}
            </div>
            <p className="mt-2 text-sm text-slate-500">
               {submittedTeams.size > 0
                  ? `${submittedTeams.size}/5 teams submitted ($10 each)`
                  : 'You can submit up to 5 teams ($10 each)'
               }
            </p>
         </div>

         {/* Player Selections */}
         <div className="grid gap-6">
            <PlayerSelect position="QB" label="Quarterback" value={qb} onChange={setQb} />
            <PlayerSelect position="WR" label="Wide Receiver" value={wr} onChange={setWr} />
            <PlayerSelect position="RB" label="Running Back" value={rb} onChange={setRb} />
            <PlayerSelect position="TE" label="Tight End" value={te} onChange={setTe} />
         </div>

         {/* Message */}
         {message && (
            <div
               className={`p-4 rounded-xl text-center font-medium ${message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
            >
               {message.text}
            </div>
         )}

         {/* Submit Button */}
         {allTeamsSubmitted ? (
            <div className="w-full py-4 rounded-xl font-bold text-lg text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
               <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All 5 Teams Submitted!
               </span>
            </div>
         ) : (
            <button
               type="submit"
               disabled={!isFormValid || submitting}
               className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isFormValid && !submitting
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
            >
               {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                     Submitting...
                  </span>
               ) : (
                  `Submit Team ${teamNumber}`
               )}
            </button>
         )}
      </form>
   );
}
