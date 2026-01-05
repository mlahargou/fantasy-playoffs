import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { calculateTeamScore } from '@/lib/sleeper';
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

    // Calculate scores for all entries in parallel
    const entriesWithScores: EntryWithScore[] = await Promise.all(
      entries.map(async (entry) => {
        const playerIds = [entry.qb_id, entry.wr_id, entry.rb_id, entry.te_id];
        const { total, breakdown } = await calculateTeamScore(playerIds);

        return {
          ...entry,
          total_score: total,
          score_breakdown: {
            qb: breakdown[entry.qb_id] || 0,
            wr: breakdown[entry.wr_id] || 0,
            rb: breakdown[entry.rb_id] || 0,
            te: breakdown[entry.te_id] || 0,
          },
        } as EntryWithScore;
      })
    );

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

