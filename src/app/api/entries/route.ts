import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';

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
      if (teamNumber < 1 || teamNumber > 5) {
         return NextResponse.json(
            { error: 'Team number must be between 1 and 5' },
            { status: 400 }
         );
      }

      // Check how many teams this person already has
      const existingTeams = await sql`
      SELECT team_number FROM entries WHERE LOWER(email) = LOWER(${email})
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

      // If email provided, return that user's entries with full details
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

         // Transform into a map of team_number -> selections
         const teams: Record<number, {
            qb: { id: string; name: string; team: string };
            wr: { id: string; name: string; team: string };
            rb: { id: string; name: string; team: string };
            te: { id: string; name: string; team: string };
         }> = {};

         for (const entry of entries) {
            teams[entry.team_number] = {
               qb: { id: entry.qb_id, name: entry.qb_name, team: entry.qb_team },
               wr: { id: entry.wr_id, name: entry.wr_name, team: entry.wr_team },
               rb: { id: entry.rb_id, name: entry.rb_name, team: entry.rb_team },
               te: { id: entry.te_id, name: entry.te_name, team: entry.te_team },
            };
         }

         return NextResponse.json({
            submittedTeams: entries.map((e) => e.team_number),
            teams,
         });
      }

      // Otherwise return all entries (for admin)
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
