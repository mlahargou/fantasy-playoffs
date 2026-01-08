// Sleeper API utilities
import { PLAYOFF_TEAM_ABBRS, SCORING_CONFIG } from './config';

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team: string | null;
  position: string | null;
  fantasy_positions: string[] | null;
  status: string;
  active: boolean;
}

export interface SleeperWeekStats {
  stats: {
    pts_ppr?: number;
    pts_half_ppr?: number;
    pts_std?: number;
    [key: string]: number | undefined;
  };
  week: number;
  season: string;
  team: string;
}

// Cache for all players (it's a large dataset)
let cachedPlayers: Record<string, SleeperPlayer> | null = null;
let playersCacheTimestamp: number = 0;
const PLAYERS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchAllPlayers(): Promise<Record<string, SleeperPlayer>> {
  const now = Date.now();

  if (cachedPlayers && (now - playersCacheTimestamp) < PLAYERS_CACHE_DURATION) {
    return cachedPlayers;
  }

  const response = await fetch('https://api.sleeper.app/v1/players/nfl');

  if (!response.ok) {
    throw new Error('Failed to fetch players from Sleeper');
  }

  cachedPlayers = await response.json();
  playersCacheTimestamp = now;

  return cachedPlayers!;
}

export async function getPlayoffPlayers(position: string, search: string = ''): Promise<{
  id: string;
  name: string;
  team: string;
  position: string;
}[]> {
  const allPlayers = await fetchAllPlayers();

  const filtered = Object.values(allPlayers)
    .filter((player) => {
      // Must have a team on a playoff team
      if (!player.team || !PLAYOFF_TEAM_ABBRS.includes(player.team)) return false;

      // Must be active
      if (!player.active || player.status !== 'Active') return false;

      // Must match position
      if (player.position !== position) return false;

      // Match search if provided
      if (search && !player.full_name?.toLowerCase().includes(search.toLowerCase())) return false;

      return true;
    })
    .map((player) => ({
      id: player.player_id,
      name: player.full_name,
      team: player.team!,
      position: player.position!,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return filtered;
}

export async function getPlayerWeeklyStats(playerId: string): Promise<Record<string, SleeperWeekStats>> {
  const { season, season_type } = SCORING_CONFIG;

  const response = await fetch(
    `https://api.sleeper.com/stats/nfl/player/${playerId}?season_type=${season_type}&season=${season}&grouping=week`
  );

  if (!response.ok) {
    console.error(`Failed to fetch stats for player ${playerId}`);
    return {};
  }

  return await response.json();
}

export async function calculatePlayerScore(playerId: string): Promise<number> {
  const stats = await getPlayerWeeklyStats(playerId);
  const { weeks } = SCORING_CONFIG;

  let totalPoints = 0;

  for (const week of weeks) {
    const weekStats = stats[week.toString()];
    if (weekStats?.stats?.pts_ppr) {
      totalPoints += weekStats.stats.pts_ppr;
    }
  }

  return Math.round(totalPoints * 10) / 10; // Round to 1 decimal
}
