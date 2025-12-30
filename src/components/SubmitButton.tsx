'use client';

interface SubmitButtonProps {
  teamNumber: number;
  isValid: boolean;
  submitting: boolean;
}

export default function SubmitButton({ teamNumber, isValid, submitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={!isValid || submitting}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
        isValid && !submitting
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
  );
}

