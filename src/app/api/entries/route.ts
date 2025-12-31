import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { calculatePlayerScore } from '@/lib/sleeper';
import { ENTRY_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
   try {
      // Initialize database table if it doesn't exist
      await initializeDatabase();
      const sql = getDb();

      const body = await request.json();
      const { email, teamNumber, qb, wr, rb, te } = body;

      // Validate required fields
      if (!email || !teamNumber || !qb || !wr || !rb || !te) {
         return NextResponse.json(
            { error: 'All fields are required' },
            { status: 400 }
         );
      }

      // Validate email format
      if (!email.includes('@')) {
         return NextResponse.json(
            { error: 'Please enter a valid email address' },
            { status: 400 }
         );
      }

      // Validate team number
      if (teamNumber < 1 || teamNumber > ENTRY_CONFIG.maxTeamsPerPerson) {
         return NextResponse.json(
            { error: `Team number must be between 1 and ${ENTRY_CONFIG.maxTeamsPerPerson}` },
            { status: 400 }
         );
      }

      // Check how many teams this person already has
      const existingTeams = await sql`
      SELECT team_number FROM entries WHERE LOWER(email) = LOWER(${email})
    `;

      if (existingTeams.length >= ENTRY_CONFIG.maxTeamsPerPerson) {
         return NextResponse.json(
            { error: `You have already submitted ${ENTRY_CONFIG.maxTeamsPerPerson} teams (the maximum allowed)` },
            { status: 400 }
         );
      }

      // Check if this specific team number already exists for this person
      const existingTeamNumber = existingTeams.find(
         (t) => t.team_number === teamNumber
      );
      if (existingTeamNumber) {
         return NextResponse.json(
            { error: `You have already submitted Team ${teamNumber}. Please choose a different team number.` },
            { status: 400 }
         );
      }

      // Insert the entry
      await sql`
      INSERT INTO entries (
        email, team_number,
        qb_id, qb_name, qb_team,
        wr_id, wr_name, wr_team,
        rb_id, rb_name, rb_team,
        te_id, te_name, te_team
      ) VALUES (
        ${email.toLowerCase()}, ${teamNumber},
        ${qb.id}, ${qb.name}, ${qb.team},
        ${wr.id}, ${wr.name}, ${wr.team},
        ${rb.id}, ${rb.name}, ${rb.team},
        ${te.id}, ${te.name}, ${te.team}
      )
    `;

      return NextResponse.json({
         success: true,
         message: `Team ${teamNumber} submitted successfully!`,
         teamsSubmitted: existingTeams.length + 1
      });
   } catch (error) {
      console.error('Error saving entry:', error);
      return NextResponse.json(
         { error: 'Failed to save entry. Please try again.' },
         { status: 500 }
      );
   }
}

export async function GET(request: Request) {
   try {
      await initializeDatabase();
      const sql = getDb();

      const { searchParams } = new URL(request.url);
      const email = searchParams.get('email');

      // If email provided, return that user's entries with full details and scores
      if (email) {
         const entries = await sql`
          SELECT
            team_number,
            qb_id, qb_name, qb_team,
            wr_id, wr_name, wr_team,
            rb_id, rb_name, rb_team,
            te_id, te_name, te_team
          FROM entries
          WHERE LOWER(email) = LOWER(${email})
          ORDER BY team_number
        `;

         // Collect all unique player IDs to fetch scores
         const playerIds = new Set<string>();
         for (const entry of entries) {
            playerIds.add(entry.qb_id);
            playerIds.add(entry.wr_id);
            playerIds.add(entry.rb_id);
            playerIds.add(entry.te_id);
         }

         // Fetch all player scores in parallel
         const scorePromises = Array.from(playerIds).map(async (id) => {
            const score = await calculatePlayerScore(id);
            return { id, score };
         });
         const scoreResults = await Promise.all(scorePromises);
         const scores: Record<string, number> = {};
         for (const { id, score } of scoreResults) {
            scores[id] = score;
         }

         // Transform into a map of team_number -> selections with scores
         const teams: Record<number, {
            qb: { id: string; name: string; team: string; score: number };
            wr: { id: string; name: string; team: string; score: number };
            rb: { id: string; name: string; team: string; score: number };
            te: { id: string; name: string; team: string; score: number };
            totalScore: number;
         }> = {};

         for (const entry of entries) {
            const qbScore = scores[entry.qb_id] || 0;
            const wrScore = scores[entry.wr_id] || 0;
            const rbScore = scores[entry.rb_id] || 0;
            const teScore = scores[entry.te_id] || 0;

            teams[entry.team_number] = {
               qb: { id: entry.qb_id, name: entry.qb_name, team: entry.qb_team, score: qbScore },
               wr: { id: entry.wr_id, name: entry.wr_name, team: entry.wr_team, score: wrScore },
               rb: { id: entry.rb_id, name: entry.rb_name, team: entry.rb_team, score: rbScore },
               te: { id: entry.te_id, name: entry.te_name, team: entry.te_team, score: teScore },
               totalScore: Math.round((qbScore + wrScore + rbScore + teScore) * 10) / 10,
            };
         }

         return NextResponse.json({
            submittedTeams: entries.map((e) => e.team_number),
            teams,
         });
      }

      // Otherwise return all entries (for leaderboard)
      const entries = await sql`
      SELECT * FROM entries ORDER BY created_at DESC
    `;

      return NextResponse.json({ entries });
   } catch (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json(
         { error: 'Failed to fetch entries' },
         { status: 500 }
      );
   }
}
