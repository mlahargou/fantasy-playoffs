import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getDb, initializeDatabase } from '@/lib/db';
import { getPlayerWeeklyScores, calculatePlayerScore } from '@/lib/sleeper';
import { SCORING_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

interface PlayerWithWeeklyScores {
  id: string;
  name: string;
  team: string;
  totalScore: number;
  weeklyScores: Record<number, number>;
}

interface TeamWithRanking {
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

export async function GET() {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initializeDatabase();
    const sql = getDb();

    // Fetch user's entries
    const userEntries = await sql`
      SELECT * FROM entries WHERE user_id = ${user.id} ORDER BY team_number
    `;

    if (userEntries.length === 0) {
      return NextResponse.json({
        teams: [],
        weeks: SCORING_CONFIG.weeks,
      });
    }

    // Fetch ALL entries to calculate rankings
    const allEntries = await sql`
      SELECT e.id, e.user_id, e.team_number, e.qb_id, e.wr_id, e.rb_id, e.te_id
      FROM entries e
    `;

    // Calculate scores for all unique players across all entries
    const uniquePlayerIds = new Set<string>();
    for (const entry of allEntries) {
      uniquePlayerIds.add(entry.qb_id);
      uniquePlayerIds.add(entry.wr_id);
      uniquePlayerIds.add(entry.rb_id);
      uniquePlayerIds.add(entry.te_id);
    }

    // Fetch total scores for ranking calculation
    const playerTotalScores = new Map<string, number>();
    await Promise.all(
      [...uniquePlayerIds].map(async (playerId) => {
        const score = await calculatePlayerScore(playerId);
        playerTotalScores.set(playerId, score);
      })
    );

    // Calculate total scores for all entries and sort for rankings
    const entryScores = allEntries.map((entry) => {
      const totalScore =
        (playerTotalScores.get(entry.qb_id) || 0) +
        (playerTotalScores.get(entry.wr_id) || 0) +
        (playerTotalScores.get(entry.rb_id) || 0) +
        (playerTotalScores.get(entry.te_id) || 0);
      return {
        id: entry.id,
        totalScore: Math.round(totalScore * 10) / 10,
      };
    });

    // Sort by score descending for rankings
    entryScores.sort((a, b) => b.totalScore - a.totalScore);

    // Create rank lookup map (handle ties by giving same rank)
    const rankMap = new Map<number, number>();
    let currentRank = 1;
    for (let i = 0; i < entryScores.length; i++) {
      if (i > 0 && entryScores[i].totalScore < entryScores[i - 1].totalScore) {
        currentRank = i + 1;
      }
      rankMap.set(entryScores[i].id, currentRank);
    }

    // Now fetch weekly scores for user's players only
    const userPlayerIds = new Set<string>();
    for (const entry of userEntries) {
      userPlayerIds.add(entry.qb_id);
      userPlayerIds.add(entry.wr_id);
      userPlayerIds.add(entry.rb_id);
      userPlayerIds.add(entry.te_id);
    }

    const playerWeeklyScoresMap = new Map<string, { weeklyScores: Record<number, number>; totalScore: number }>();
    await Promise.all(
      [...userPlayerIds].map(async (playerId) => {
        const scores = await getPlayerWeeklyScores(playerId);
        playerWeeklyScoresMap.set(playerId, scores);
      })
    );

    // Build response with user's teams
    const teams: TeamWithRanking[] = userEntries.map((entry) => {
      const qbScores = playerWeeklyScoresMap.get(entry.qb_id)!;
      const wrScores = playerWeeklyScoresMap.get(entry.wr_id)!;
      const rbScores = playerWeeklyScoresMap.get(entry.rb_id)!;
      const teScores = playerWeeklyScoresMap.get(entry.te_id)!;

      const totalScore = Math.round(
        (qbScores.totalScore + wrScores.totalScore + rbScores.totalScore + teScores.totalScore) * 10
      ) / 10;

      return {
        teamNumber: entry.team_number,
        rank: rankMap.get(entry.id) || 0,
        totalEntries: allEntries.length,
        totalScore,
        players: {
          qb: {
            id: entry.qb_id,
            name: entry.qb_name,
            team: entry.qb_team,
            totalScore: qbScores.totalScore,
            weeklyScores: qbScores.weeklyScores,
          },
          wr: {
            id: entry.wr_id,
            name: entry.wr_name,
            team: entry.wr_team,
            totalScore: wrScores.totalScore,
            weeklyScores: wrScores.weeklyScores,
          },
          rb: {
            id: entry.rb_id,
            name: entry.rb_name,
            team: entry.rb_team,
            totalScore: rbScores.totalScore,
            weeklyScores: rbScores.weeklyScores,
          },
          te: {
            id: entry.te_id,
            name: entry.te_name,
            team: entry.te_team,
            totalScore: teScores.totalScore,
            weeklyScores: teScores.weeklyScores,
          },
        },
      };
    });

    // Sort teams by team number
    teams.sort((a, b) => a.teamNumber - b.teamNumber);

    return NextResponse.json({
      teams,
      weeks: SCORING_CONFIG.weeks,
    });
  } catch (error) {
    console.error('Error fetching manager teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
