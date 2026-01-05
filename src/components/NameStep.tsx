'use client';

interface NameStepProps {
  email: string;
  name: string;
  setName: (name: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function NameStep({ email, name, setName, onSubmit, onBack, loading, error }: NameStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
        <p className="text-sm text-slate-400 mb-1">Signing up as</p>
        <p className="text-white font-medium">{email}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          autoFocus
          className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
        <p className="mt-2 text-sm text-slate-500">
          This will be displayed on the leaderboard
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-center font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-4 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            name.trim() && !loading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
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
      </div>
    </form>
  );
}

