import EntryForm from '@/components/EntryForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative max-w-lg mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            2025-2026 NFL Playoffs
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Fantasy Playoffs
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Bracket Challenge
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Pick your QB, WR, RB, and TE for the entire playoff run.
            Standard scoring from Wild Card through Super Bowl.
          </p>
        </div>

        {/* Rules Card */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </h2>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">•</span>
              Your picks stay with you the entire playoffs
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">•</span>
              Players earn points only for playoff games played
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">•</span>
              Up to 5 teams allowed per person • $10 per team
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">•</span>
              1st place: 90% of pot • 2nd place: 10%
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <EntryForm />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Payment required up front. Contact the commissioner with questions.
        </p>
      </div>
    </main>
  );
}
