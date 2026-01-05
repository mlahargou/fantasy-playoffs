import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all users with their payment status and team counts
export async function GET() {
   try {
      await initializeDatabase();
      const sql = getDb();

      // Get all users with their team counts and payment info
      const users = await sql`
         SELECT
            u.id,
            u.email,
            u.name,
            u.created_at,
            COUNT(e.id)::integer as teams_created,
            COALESCE(p.teams_paid, 0)::integer as teams_paid,
            p.notes,
            p.updated_at as payment_updated_at
         FROM users u
         LEFT JOIN entries e ON u.id = e.user_id
         LEFT JOIN user_payments p ON u.id = p.user_id
         GROUP BY u.id, u.email, u.name, u.created_at, p.teams_paid, p.notes, p.updated_at
         ORDER BY u.name ASC
      `;

      return NextResponse.json({ users });
   } catch (error) {
      console.error('Error fetching payment data:', error);
      return NextResponse.json(
         { error: 'Failed to fetch payment data' },
         { status: 500 }
      );
   }
}

// PUT - Update payment info for a user
export async function PUT(request: Request) {
   try {
      await initializeDatabase();
      const sql = getDb();

      const body = await request.json();
      const { userId, teamsPaid, notes } = body;

      if (typeof userId !== 'number') {
         return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
         );
      }

      if (typeof teamsPaid !== 'number' || teamsPaid < 0) {
         return NextResponse.json(
            { error: 'Teams paid must be a non-negative number' },
            { status: 400 }
         );
      }

      // Upsert the payment record
      await sql`
         INSERT INTO user_payments (user_id, teams_paid, notes, updated_at)
         VALUES (${userId}, ${teamsPaid}, ${notes || null}, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET
            teams_paid = ${teamsPaid},
            notes = ${notes || null},
            updated_at = NOW()
      `;

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error('Error updating payment:', error);
      return NextResponse.json(
         { error: 'Failed to update payment' },
         { status: 500 }
      );
   }
}

