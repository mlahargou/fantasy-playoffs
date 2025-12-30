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
   const [teamNumber, setTeamNumber] = useState(1);
   const [qb, setQb] = useState<Player | null>(null);
   const [wr, setWr] = useState<Player | null>(null);
   const [rb, setRb] = useState<Player | null>(null);
   const [te, setTe] = useState<Player | null>(null);
   const [submitting, setSubmitting] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      if (!email.trim() || !email.includes('@')) {
         setMessage({ type: 'error', text: 'Please enter a valid email address' });
         return;
      }

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
         // Reset form for next team
         setTeamNumber((prev) => Math.min(prev + 1, 5));
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

   const isFormValid = email.trim() && email.includes('@') && qb && wr && rb && te;

   return (
      <form onSubmit={handleSubmit} className="space-y-8">
         {/* Email Input */}
         <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
               Your Email
            </label>
            <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Enter your email"
               className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
         </div>

         {/* Team Number */}
         <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
               Team Number
            </label>
            <div className="flex gap-3">
               {[1, 2, 3, 4, 5].map((num) => (
                  <button
                     key={num}
                     type="button"
                     onClick={() => setTeamNumber(num)}
                     className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${teamNumber === num
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:border-slate-500/50 hover:text-white'
                        }`}
                  >
                     {num}
                  </button>
               ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">You can submit up to 5 teams ($10 each)</p>
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
      </form>
   );
}

