import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// NFL teams in the 2025-2026 playoffs
const PLAYOFF_TEAMS = [
   'BUF', 'BAL', 'KC', 'HOU', 'LAC', 'PIT', 'DEN', // AFC
   'DET', 'PHI', 'TB', 'LAR', 'MIN', 'WAS', 'GB'   // NFC
];

interface ESPNAthlete {
   id: string;
   fullName: string;
   position?: {
      abbreviation: string;
   };
   team?: {
      abbreviation: string;
   };
}

interface ESPNResponse {
   athletes?: ESPNAthlete[];
}

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const position = searchParams.get('position');
   const search = searchParams.get('search')?.toLowerCase() || '';

   if (!position || !['QB', 'WR', 'RB', 'TE'].includes(position)) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
   }

   try {
      // Fetch players from ESPN's public API
      const response = await fetch(
         `https://site.api.espn.com/apis/site/v2/sports/football/nfl/athletes?limit=1000`,
         { next: { revalidate: 3600 } } // Cache for 1 hour
      );

      if (!response.ok) {
         throw new Error('Failed to fetch players');
      }

      const data: ESPNResponse = await response.json();

      // Filter players by position and playoff teams
      const players = (data.athletes || [])
         .filter((player: ESPNAthlete) => {
            const teamAbbr = player.team?.abbreviation;
            const positionAbbr = player.position?.abbreviation;
            const matchesPosition = positionAbbr === position;
            const isPlayoffTeam = teamAbbr && PLAYOFF_TEAMS.includes(teamAbbr);
            const matchesSearch = search === '' || player.fullName.toLowerCase().includes(search);

            return matchesPosition && isPlayoffTeam && matchesSearch;
         })
         .map((player: ESPNAthlete) => ({
            id: player.id,
            name: player.fullName,
            team: player.team?.abbreviation || 'Unknown',
            position: player.position?.abbreviation || position,
         }))
         .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

      return NextResponse.json({ players });
   } catch (error) {
      console.error('Error fetching players:', error);
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
   }
}

