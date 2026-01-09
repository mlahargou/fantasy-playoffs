'use client';

interface PasswordStepProps {
   email: string;
   mode: 'login' | 'set-password' | 'register';
   name: string;
   setName: (name: string) => void;
   password: string;
   setPassword: (password: string) => void;
   onSubmit: () => void;
   onBack: () => void;
   loading: boolean;
   error: string | null;
}

export default function PasswordStep({
   email,
   mode,
   name,
   setName,
   password,
   setPassword,
   onSubmit,
   onBack,
   loading,
   error,
}: PasswordStepProps) {
   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   const getTitle = () => {
      switch (mode) {
         case 'login':
            return 'Welcome back!';
         case 'set-password':
            return 'Create a password';
         case 'register':
            return 'Create your account';
      }
   };

   const getSubtitle = () => {
      switch (mode) {
         case 'login':
            return 'Enter your password to continue';
         case 'set-password':
            return 'Secure your account with a password';
         case 'register':
            return 'Set up your account to get started';
      }
   };

   const getButtonText = () => {
      if (loading) return 'Please wait...';
      switch (mode) {
         case 'login':
            return 'Log In';
         case 'set-password':
            return 'Set Password & Continue';
         case 'register':
            return 'Create Account';
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">{getTitle()}</h2>
            <p className="text-slate-400 text-sm">{getSubtitle()}</p>
         </div>

         {/* Email display */}
         <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
               <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
               <span className="text-slate-300 text-sm">{email}</span>
            </div>
            <button
               type="button"
               onClick={onBack}
               className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
               Change
            </button>
         </div>

         {/* Name input (only for register mode) */}
         {mode === 'register' && (
            <div>
               <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name
               </label>
               <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  autoComplete="name"
                  required
               />
            </div>
         )}

         {/* Password input */}
         <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
               {mode === 'login' ? 'Password' : 'Create Password'}
            </label>
            <input
               type="password"
               id="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
               className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
               autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
               required
               minLength={6}
            />
            {mode !== 'login' && (
               <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
            )}
         </div>

         {/* Error message */}
         {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
               {error}
            </div>
         )}

         {/* Submit button */}
         <button
            type="submit"
            disabled={loading || password.length < 6 || (mode === 'register' && name.trim().length < 2)}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
               !loading && password.length >= 6 && (mode !== 'register' || name.trim().length >= 2)
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
         >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {getButtonText()}
               </span>
            ) : (
               getButtonText()
            )}
         </button>
      </form>
   );
}

