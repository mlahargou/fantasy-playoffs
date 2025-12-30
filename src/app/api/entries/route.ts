import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
   try {
      // Initialize database table if it doesn't exist
      await initializeDatabase();
      const sql = getDb();

      const body = await request.json();
      const { name, teamNumber, qb, wr, rb, te } = body;

      // Validate required fields
      if (!name || !teamNumber || !qb || !wr || !rb || !te) {
         return NextResponse.json(
            { error: 'All fields are required' },
            { status: 400 }
         );
      }

      // Validate team number
      if (teamNumber < 1 || teamNumber > 5) {
         return NextResponse.json(
            { error: 'Team number must be between 1 and 5' },
            { status: 400 }
         );
      }

      // Check how many teams this person already has
      const existingTeams = await sql`
      SELECT team_number FROM entries WHERE LOWER(name) = LOWER(${name})
    `;

      if (existingTeams.length >= 5) {
         return NextResponse.json(
            { error: 'You have already submitted 5 teams (the maximum allowed)' },
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
        name, team_number,
        qb_id, qb_name, qb_team,
        wr_id, wr_name, wr_team,
        rb_id, rb_name, rb_team,
        te_id, te_name, te_team
      ) VALUES (
        ${name}, ${teamNumber},
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

export async function GET() {
   try {
      await initializeDatabase();
      const sql = getDb();

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
