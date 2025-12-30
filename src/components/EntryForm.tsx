'use client';

import { useState } from 'react';
import EmailStep from './EmailStep';
import EmailHeader from './EmailHeader';
import TeamSelector from './TeamSelector';
import PlayerSelections from './PlayerSelections';
import SubmitButton from './SubmitButton';

interface Player {
   id: string;
   name: string;
   team: string;
}

interface TeamSelections {
   qb: Player;
   wr: Player;
   rb: Player;
   te: Player;
}

export default function EntryForm() {
   // Email state
   const [email, setEmail] = useState('');
   const [emailConfirmed, setEmailConfirmed] = useState(false);
   const [loadingEmail, setLoadingEmail] = useState(false);

   // Team state
   const [teamNumber, setTeamNumber] = useState(1);
   const [submittedTeams, setSubmittedTeams] = useState<Set<number>>(new Set());
   const [savedTeams, setSavedTeams] = useState<Record<number, TeamSelections>>({});

   // Player selections
   const [qb, setQb] = useState<Player | null>(null);
   const [wr, setWr] = useState<Player | null>(null);
   const [rb, setRb] = useState<Player | null>(null);
   const [te, setTe] = useState<Player | null>(null);

   // UI state
   const [submitting, setSubmitting] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

   const isViewingSubmitted = submittedTeams.has(teamNumber);
   const allTeamsSubmitted = submittedTeams.size >= 5;

   // Get display values - either current selections or saved team
   const displayQb = isViewingSubmitted ? savedTeams[teamNumber]?.qb || null : qb;
   const displayWr = isViewingSubmitted ? savedTeams[teamNumber]?.wr || null : wr;
   const displayRb = isViewingSubmitted ? savedTeams[teamNumber]?.rb || null : rb;
   const displayTe = isViewingSubmitted ? savedTeams[teamNumber]?.te || null : te;

   const isFormValid = qb && wr && rb && te;

   const handleEmailSubmit = async () => {
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
            setSavedTeams(data.teams || {});

            // Auto-select first available team number, or first submitted if all done
            const firstAvailable = [1, 2, 3, 4, 5].find((num) => !teams.has(num));
            if (firstAvailable) {
               setTeamNumber(firstAvailable);
            } else if (teams.size > 0) {
               setTeamNumber(1);
            }
         }
         setEmailConfirmed(true);
      } catch (error) {
         console.error('Error checking email:', error);
         setEmailConfirmed(true);
      } finally {
         setLoadingEmail(false);
      }
   };

   const handleChangeEmail = () => {
      setEmailConfirmed(false);
      setSubmittedTeams(new Set());
      setSavedTeams({});
      setMessage(null);
      clearPlayerSelections();
   };

   const handleTeamNumberChange = (num: number) => {
      setTeamNumber(num);
      setMessage(null);

      // Clear selections when switching to a new (unsubmitted) team
      if (!submittedTeams.has(num)) {
         clearPlayerSelections();
      }
   };

   const clearPlayerSelections = () => {
      setQb(null);
      setWr(null);
      setRb(null);
      setTe(null);
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
            body: JSON.stringify({
               email: email.trim().toLowerCase(),
               teamNumber,
               qb, wr, rb, te
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Failed to submit');
         }

         setMessage({ type: 'success', text: data.message });

         // Mark this team as submitted and save selections
         const newSubmittedTeams = new Set([...submittedTeams, teamNumber]);
         setSubmittedTeams(newSubmittedTeams);
         setSavedTeams((prev) => ({
            ...prev,
            [teamNumber]: { qb, wr, rb, te },
         }));

         // Find and select next available team number
         const nextTeam = [1, 2, 3, 4, 5].find((num) => !newSubmittedTeams.has(num));
         if (nextTeam) {
            setTeamNumber(nextTeam);
            clearPlayerSelections();
         }
      } catch (error) {
         setMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to submit. Please try again.'
         });
      } finally {
         setSubmitting(false);
      }
   };

   // Step 1: Email entry
   if (!emailConfirmed) {
      return (
         <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            loading={loadingEmail}
            error={message?.type === 'error' ? message.text : null}
         />
      );
   }

   // Step 2: Team selection
   return (
      <form onSubmit={handleTeamSubmit} className="space-y-8">
         <EmailHeader
            email={email}
            submittedCount={submittedTeams.size}
            onChangeEmail={handleChangeEmail}
         />

         <TeamSelector
            teamNumber={teamNumber}
            submittedTeams={submittedTeams}
            isViewingSubmitted={isViewingSubmitted}
            onSelect={handleTeamNumberChange}
         />

         {/* Viewing submitted team banner */}
         {isViewingSubmitted && (
            <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/50 flex items-center gap-3">
               <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               <p className="text-sm text-slate-400">
                  Viewing your submitted picks for Team {teamNumber}
               </p>
            </div>
         )}

         <PlayerSelections
            qb={displayQb}
            wr={displayWr}
            rb={displayRb}
            te={displayTe}
            setQb={setQb}
            setWr={setWr}
            setRb={setRb}
            setTe={setTe}
            disabled={isViewingSubmitted}
         />

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

         {/* Submit Button - only show for non-submitted teams */}
         {!isViewingSubmitted && (
            allTeamsSubmitted ? (
               <div className="w-full py-4 rounded-xl font-bold text-lg text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="flex items-center justify-center gap-2">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     All 5 Teams Submitted!
                  </span>
               </div>
            ) : (
               <SubmitButton
                  teamNumber={teamNumber}
                  isValid={!!isFormValid}
                  submitting={submitting}
               />
            )
         )}
      </form>
   );
}
