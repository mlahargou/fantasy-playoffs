'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';

type Step = 'loading' | 'email' | 'password';
type PasswordMode = 'login' | 'set-password' | 'register';

export default function LoginForm() {
   const router = useRouter();

   // Auth state
   const [step, setStep] = useState<Step>('loading');
   const [email, setEmail] = useState('');
   const [name, setName] = useState('');
   const [password, setPassword] = useState('');
   const [passwordMode, setPasswordMode] = useState<PasswordMode>('login');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
               // Already logged in, redirect to manager
               router.push('/manager');
               return;
            }
         }
      } catch (error) {
         console.error('Error checking session:', error);
      }
      setStep('email');
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

         // Successfully authenticated, redirect to manager
         setPassword(''); // Clear password from memory
         router.push('/manager');
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

