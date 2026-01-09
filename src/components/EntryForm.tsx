'use client';

import { useState, useEffect } from 'react';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';
import EmailHeader from './EmailHeader';
import TeamSelector from './TeamSelector';
import PlayerSelections from './PlayerSelections';
import SubmitButton from './SubmitButton';
import { ENTRY_CONFIG } from '@/lib/config';

interface Player {
   id: string;
   name: string;
   team: string;
   score?: number;
}

interface TeamSelections {
   qb: Player;
   wr: Player;
   rb: Player;
   te: Player;
   totalScore?: number;
}

type Step = 'loading' | 'email' | 'password' | 'teams';
type PasswordMode = 'login' | 'set-password' | 'register';

export default function EntryForm() {
   // Auth state
   const [step, setStep] = useState<Step>('loading');
   const [email, setEmail] = useState('');
   const [name, setName] = useState('');
   const [password, setPassword] = useState('');
   const [passwordMode, setPasswordMode] = useState<PasswordMode>('login');
   const [loading, setLoading] = useState(false);

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
   const [isEditing, setIsEditing] = useState(false);

   const isViewingSubmitted = submittedTeams.has(teamNumber);
   const allTeamsSubmitted = submittedTeams.size >= ENTRY_CONFIG.maxTeamsPerPerson;

   // Get display values - either current selections or saved team (when viewing but not editing)
   const showingSavedTeam = isViewingSubmitted && !isEditing;
   const displayQb = showingSavedTeam ? savedTeams[teamNumber]?.qb || null : qb;
   const displayWr = showingSavedTeam ? savedTeams[teamNumber]?.wr || null : wr;
   const displayRb = showingSavedTeam ? savedTeams[teamNumber]?.rb || null : rb;
   const displayTe = showingSavedTeam ? savedTeams[teamNumber]?.te || null : te;
   const currentTeamScore = isViewingSubmitted ? savedTeams[teamNumber]?.totalScore : undefined;

   const isFormValid = qb && wr && rb && te;

   // Check for existing session on mount
   useEffect(() => {
      checkSession();
   }, []);

   const checkSession = async () => {
      try {
         const response = await fetch('/api/auth/session');
         if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
               setEmail(data.user.email);
               setName(data.user.name);
               await loadUserTeams();
               setStep('teams');
               return;
            }
         }
      } catch (error) {
         console.error('Error checking session:', error);
      }
      setStep('email');
   };

   const loadUserTeams = async () => {
      try {
         const response = await fetch('/api/entries?me=true');
         if (response.ok) {
            const data = await response.json();
            const teams = new Set<number>(data.submittedTeams || []);
            setSubmittedTeams(teams);
            setSavedTeams(data.teams || {});

            // Auto-select first available team number, or first submitted if all done
            const teamNumbers = Array.from({ length: ENTRY_CONFIG.maxTeamsPerPerson }, (_, i) => i + 1);
            const firstAvailable = teamNumbers.find((num) => !teams.has(num));
            if (firstAvailable) {
               setTeamNumber(firstAvailable);
            } else if (teams.size > 0) {
               setTeamNumber(1);
            }
         }
      } catch (error) {
         console.error('Error loading teams:', error);
      }
   };

   // Step 1: Check if email exists and determine password mode
   const handleEmailSubmit = async () => {
      setMessage(null);

      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail || !trimmedEmail.includes('@')) {
         setMessage({ type: 'error', text: 'Please enter a valid email address' });
         return;
      }

      setLoading(true);
      try {
         const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(trimmedEmail)}`);
         if (response.ok) {
            const data = await response.json();

            if (data.exists) {
               setName(data.userName || '');
               if (data.has_password) {
                  setPasswordMode('login');
               } else {
                  setPasswordMode('set-password');
               }
            } else {
               setPasswordMode('register');
            }
            setStep('password');
         } else {
            setMessage({ type: 'error', text: 'Failed to check email. Please try again.' });
         }
      } catch (error) {
         console.error('Error checking email:', error);
         setMessage({ type: 'error', text: 'Network error. Please try again.' });
      } finally {
         setLoading(false);
      }
   };

   // Step 2: Handle password submission (login, set-password, or register)
   const handlePasswordSubmit = async () => {
      setMessage(null);

      if (password.length < 6) {
         setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
         return;
      }

      if (passwordMode === 'register' && name.trim().length < 2) {
         setMessage({ type: 'error', text: 'Please enter your name' });
         return;
      }

      setLoading(true);
      try {
         let endpoint = '/api/auth/login';
         let body: Record<string, string> = {
            email: email.trim().toLowerCase(),
            password,
         };

         if (passwordMode === 'register') {
            endpoint = '/api/auth/register';
            body.name = name.trim();
         } else if (passwordMode === 'set-password') {
            endpoint = '/api/auth/set-password';
         }

         const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
         }

         // Successfully authenticated
         if (data.userName) {
            setName(data.userName);
         }

         await loadUserTeams();
         setPassword(''); // Clear password from memory
         setStep('teams');
      } catch (error) {
         setMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Authentication failed. Please try again.',
         });
      } finally {
         setLoading(false);
      }
   };

   const handleBackToEmail = () => {
      setStep('email');
      setPassword('');
      setMessage(null);
   };

   const handleLogout = async () => {
      try {
         await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
         console.error('Error logging out:', error);
      }

      // Reset all state
      setStep('email');
      setEmail('');
      setName('');
      setPassword('');
      setSubmittedTeams(new Set());
      setSavedTeams({});
      setMessage(null);
      clearPlayerSelections();
   };

   const handleTeamNumberChange = (num: number) => {
      setTeamNumber(num);
      setMessage(null);
      setIsEditing(false);

      // Clear selections when switching to a new (unsubmitted) team
      if (!submittedTeams.has(num)) {
         clearPlayerSelections();
      }
   };

   const handleStartEdit = () => {
      // Load the saved team data into the editable state
      const savedTeam = savedTeams[teamNumber];
      if (savedTeam) {
         setQb(savedTeam.qb);
         setWr(savedTeam.wr);
         setRb(savedTeam.rb);
         setTe(savedTeam.te);
      }
      setIsEditing(true);
      setMessage(null);
   };

   const handleCancelEdit = () => {
      setIsEditing(false);
      clearPlayerSelections();
      setMessage(null);
   };

   const handleTeamUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      if (!qb || !wr || !rb || !te) {
         setMessage({ type: 'error', text: 'Please select all 4 players' });
         return;
      }

      setSubmitting(true);

      try {
         const response = await fetch('/api/entries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               teamNumber,
               qb, wr, rb, te
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Failed to update');
         }

         setMessage({ type: 'success', text: data.message });

         // Reload teams from server
         await loadUserTeams();

         setIsEditing(false);
         clearPlayerSelections();
      } catch (error) {
         setMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to update. Please try again.'
         });
      } finally {
         setSubmitting(false);
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
               teamNumber,
               qb, wr, rb, te
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Failed to submit');
         }

         setMessage({ type: 'success', text: data.message });

         // Reload teams from server
         await loadUserTeams();

         // Find and select next available team number
         const teamNumbers = Array.from({ length: ENTRY_CONFIG.maxTeamsPerPerson }, (_, i) => i + 1);
         const updatedTeams = new Set([...submittedTeams, teamNumber]);
         const nextTeam = teamNumbers.find((num) => !updatedTeams.has(num));
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

   // Loading state
   if (step === 'loading') {
      return (
         <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
         </div>
      );
   }

   // Step 1: Email entry
   if (step === 'email') {
      return (
         <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            loading={loading}
            error={message?.type === 'error' ? message.text : null}
         />
      );
   }

   // Step 2: Password entry
   if (step === 'password') {
      return (
         <PasswordStep
            email={email}
            mode={passwordMode}
            name={name}
            setName={setName}
            password={password}
            setPassword={setPassword}
            onSubmit={handlePasswordSubmit}
            onBack={handleBackToEmail}
            loading={loading}
            error={message?.type === 'error' ? message.text : null}
         />
      );
   }

   // Step 3: Team selection (authenticated)
   return (
      <form onSubmit={isEditing ? handleTeamUpdate : handleTeamSubmit} className="space-y-8">
         <EmailHeader
            email={email}
            submittedCount={submittedTeams.size}
            onLogout={handleLogout}
         />

         <TeamSelector
            teamNumber={teamNumber}
            submittedTeams={submittedTeams}
            isViewingSubmitted={isViewingSubmitted}
            onSelect={handleTeamNumberChange}
         />

         {/* Viewing submitted team banner with total score and edit button */}
         {isViewingSubmitted && !isEditing && (
            <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     <p className="text-sm text-slate-400">
                        Team {teamNumber} picks
                     </p>
                  </div>
                  <div className="flex items-center gap-4">
                     {typeof currentTeamScore === 'number' && (
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-slate-400">Total:</span>
                           <span className="text-xl font-bold text-emerald-400">{currentTeamScore.toFixed(1)}</span>
                           <span className="text-sm text-slate-500">pts</span>
                        </div>
                     )}
                     <button
                        type="button"
                        onClick={handleStartEdit}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 text-sm font-medium transition-all duration-200"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Editing mode banner */}
         {isEditing && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                     <p className="text-sm text-amber-300">
                        Editing Team {teamNumber}
                     </p>
                  </div>
                  <button
                     type="button"
                     onClick={handleCancelEdit}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all duration-200"
                  >
                     Cancel
                  </button>
               </div>
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
            disabled={showingSavedTeam}
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

         {/* Submit/Update Button */}
         {isEditing ? (
            <button
               type="submit"
               disabled={!isFormValid || submitting}
               className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isFormValid && !submitting
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
            >
               {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                     Saving...
                  </span>
               ) : (
                  <span className="flex items-center justify-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     Save Changes
                  </span>
               )}
            </button>
         ) : !isViewingSubmitted && (
            allTeamsSubmitted ? (
               <div className="w-full py-4 rounded-xl font-bold text-lg text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="flex items-center justify-center gap-2">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     All {ENTRY_CONFIG.maxTeamsPerPerson} Teams Submitted!
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
