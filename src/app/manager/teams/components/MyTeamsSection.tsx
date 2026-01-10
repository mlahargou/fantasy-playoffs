'use client';

import { useState, useEffect } from 'react';
import TeamCard from './TeamCard';

interface PlayerWithWeeklyScores {
  id: string;
  name: string;
  team: string;
  totalScore: number;
  weeklyScores: Record<number, number>;
}

interface Team {
  teamNumber: number;
  rank: number;
  totalEntries: number;
  totalScore: number;
  players: {
    qb: PlayerWithWeeklyScores;
    wr: PlayerWithWeeklyScores;
    rb: PlayerWithWeeklyScores;
    te: PlayerWithWeeklyScores;
  };
}

interface TeamsResponse {
  teams: Team[];
  weeks: number[];
}

export default function MyTeamsSection() {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/manager/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-slate-700 rounded w-24"></div>
              <div className="h-6 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 bg-slate-700/50 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data || data.teams.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
        <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-400 mb-2">You haven&apos;t created any teams yet</p>
        <p className="text-slate-500 text-sm">Head to &quot;Create teams&quot; to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.teams.map((team) => (
        <TeamCard
          key={team.teamNumber}
          teamNumber={team.teamNumber}
          rank={team.rank}
          totalEntries={team.totalEntries}
          totalScore={team.totalScore}
          players={team.players}
          weeks={data.weeks}
        />
      ))}
    </div>
  );
}
