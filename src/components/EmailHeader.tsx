'use client';

interface EmailHeaderProps {
  email: string;
  submittedCount: number;
  onChangeEmail: () => void;
}

export default function EmailHeader({ email, submittedCount, onChangeEmail }: EmailHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{email.toLowerCase()}</p>
          {submittedCount > 0 && (
            <p className="text-sm text-emerald-400">
              {submittedCount} team{submittedCount > 1 ? 's' : ''} submitted
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeEmail}
        className="text-sm text-slate-400 hover:text-white transition-colors flex-shrink-0"
      >
        Change
      </button>
    </div>
  );
}

