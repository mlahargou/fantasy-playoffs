import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// NFL teams in the 2025-2026 playoffs (team abbreviations)
const PLAYOFF_TEAM_ABBRS = [
   'BUF', 'BAL', 'KC', 'HOU', 'LAC', 'PIT', 'DEN', // AFC
   'DET', 'PHI', 'TB', 'LAR', 'MIN', 'WAS', 'GB'   // NFC
];

interface Player {
   id: string;
   name: string;
   team: string;
   position: string;
}

interface ESPNTeam {
   id: string;
   abbreviation: string;
}

interface ESPNAthlete {
   id: string;
   displayName: string;
   position?: {
      abbreviation: string;
   };
}

interface ESPNRosterResponse {
   athletes?: Array<{
      items?: ESPNAthlete[];
   }>;
}

// Cache for playoff team IDs and player data
let playoffTeamIds: Map<string, string> | null = null; // abbreviation -> id
let cachedPlayers: Player[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getPlayoffTeamIds(): Promise<Map<string, string>> {
   if (playoffTeamIds) {
      return playoffTeamIds;
   }

   const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams'
   );

   if (!response.ok) {
      throw new Error('Failed to fetch teams');
   }

   const data = await response.json();
   playoffTeamIds = new Map();

   for (const teamData of data.sports?.[0]?.leagues?.[0]?.teams || []) {
      const team: ESPNTeam = teamData.team;
      if (PLAYOFF_TEAM_ABBRS.includes(team.abbreviation)) {
         playoffTeamIds.set(team.abbreviation, team.id);
      }
   }

   return playoffTeamIds;
}

async function fetchTeamRoster(teamId: string, teamAbbr: string): Promise<Player[]> {
   const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`
   );

   if (!response.ok) {
      console.error(`Failed to fetch roster for team ${teamId}`);
      return [];
   }

   const data: ESPNRosterResponse = await response.json();
   const players: Player[] = [];

   // Roster is grouped by position groups (offense, defense, special teams)
   for (const group of data.athletes || []) {
      for (const athlete of group.items || []) {
         const pos = athlete.position?.abbreviation;
         if (pos && ['QB', 'WR', 'RB', 'TE'].includes(pos)) {
            players.push({
               id: athlete.id,
               name: athlete.displayName,
               team: teamAbbr,
               position: pos,
            });
         }
      }
   }

   return players;
}

async function fetchAllPlayoffPlayers(): Promise<Player[]> {
   const now = Date.now();

   // Return cached data if still valid
   if (cachedPlayers && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedPlayers;
   }

   const teamIds = await getPlayoffTeamIds();

   // Fetch all team rosters in parallel
   const rosterPromises: Promise<Player[]>[] = [];
   for (const [abbr, id] of teamIds) {
      rosterPromises.push(fetchTeamRoster(id, abbr));
   }

   const rosters = await Promise.all(rosterPromises);
   cachedPlayers = rosters.flat().sort((a, b) => a.name.localeCompare(b.name));
   cacheTimestamp = now;

   return cachedPlayers;
}

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const position = searchParams.get('position');
   const search = searchParams.get('search')?.toLowerCase() || '';

   if (!position || !['QB', 'WR', 'RB', 'TE'].includes(position)) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
   }

   try {
      const allPlayers = await fetchAllPlayoffPlayers();

      // Filter by position and search term
      const players = allPlayers.filter((player) => {
         const matchesPosition = player.position === position;
         const matchesSearch = search === '' || player.name.toLowerCase().includes(search);
         return matchesPosition && matchesSearch;
      });

      return NextResponse.json({ players });
   } catch (error) {
      console.error('Error fetching players:', error);
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
   }
}
