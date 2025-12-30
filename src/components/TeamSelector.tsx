'use client';

interface TeamSelectorProps {
  teamNumber: number;
  submittedTeams: Set<number>;
  isViewingSubmitted: boolean;
  onSelect: (num: number) => void;
}

export default function TeamSelector({
  teamNumber,
  submittedTeams,
  isViewingSubmitted,
  onSelect
}: TeamSelectorProps) {
  return (
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
              onClick={() => onSelect(num)}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 relative ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : isSubmitted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
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
        {isViewingSubmitted
          ? `Viewing Team ${teamNumber} (submitted)`
          : submittedTeams.size > 0
          ? `${submittedTeams.size}/5 teams submitted ($10 each)`
          : 'You can submit up to 5 teams ($10 each)'
        }
      </p>
    </div>
  );
}

