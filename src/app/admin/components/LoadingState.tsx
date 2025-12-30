'use client';

export default function LoadingState() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent mb-4" />
        <p className="text-slate-400">Loading entries and calculating scores...</p>
        <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
      </div>
    </main>
  );
}

