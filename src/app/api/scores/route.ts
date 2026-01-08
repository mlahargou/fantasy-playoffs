import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { calculatePlayerScore } from '@/lib/sleeper';
import { SCORING_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

interface EntryWithScore {
  id: number;
  email: string;
  user_name: string | null;
  team_number: number;
  qb_id: string;
  qb_name: string;
  qb_team: string;
  wr_id: string;
  wr_name: string;
  wr_team: string;
  rb_id: string;
  rb_name: string;
  rb_team: string;
  te_id: string;
  te_name: string;
  te_team: string;
  created_at: string;
  total_score: number;
  score_breakdown: {
    qb: number;
    wr: number;
    rb: number;
    te: number;
  };
}

export async function GET() {
  try {
    await initializeDatabase();
    const sql = getDb();

    // Join with users table to get names and emails
    const entries = await sql`
      SELECT e.*, u.name as user_name, u.email as email
      FROM entries e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `;

    // Step 1: Collect all unique player IDs from all entries
    const uniquePlayerIds = new Set<string>();
    for (const entry of entries) {
      uniquePlayerIds.add(entry.qb_id);
      uniquePlayerIds.add(entry.wr_id);
      uniquePlayerIds.add(entry.rb_id);
      uniquePlayerIds.add(entry.te_id);
    }

    // Step 2: Fetch scores for each unique player once (in parallel)
    const playerScores = new Map<string, number>();
    await Promise.all(
      [...uniquePlayerIds].map(async (playerId) => {
        const score = await calculatePlayerScore(playerId);
        playerScores.set(playerId, score);
      })
    );

    // Step 3: Build entry scores using the cached player scores
    const entriesWithScores: EntryWithScore[] = entries.map((entry) => {
      const qbScore = playerScores.get(entry.qb_id) || 0;
      const wrScore = playerScores.get(entry.wr_id) || 0;
      const rbScore = playerScores.get(entry.rb_id) || 0;
      const teScore = playerScores.get(entry.te_id) || 0;
      const totalScore = Math.round((qbScore + wrScore + rbScore + teScore) * 10) / 10;

      return {
        ...entry,
        total_score: totalScore,
        score_breakdown: {
          qb: qbScore,
          wr: wrScore,
          rb: rbScore,
          te: teScore,
        },
      } as EntryWithScore;
    });

    // Sort by total score descending
    entriesWithScores.sort((a, b) => b.total_score - a.total_score);

    return NextResponse.json({
      entries: entriesWithScores,
      config: {
        season: SCORING_CONFIG.season,
        seasonType: SCORING_CONFIG.season_type,
        weeks: SCORING_CONFIG.weeks,
      },
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

