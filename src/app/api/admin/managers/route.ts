import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all managers (users) with their details
export async function GET() {
   try {
      await initializeDatabase();
      const sql = getDb();

      // Get all users with their team counts and admin status
      const managers = await sql`
         SELECT
            u.id,
            u.email,
            u.name,
            u.is_admin,
            u.created_at,
            COUNT(e.id)::integer as teams_created
         FROM users u
         LEFT JOIN entries e ON u.id = e.user_id
         GROUP BY u.id, u.email, u.name, u.is_admin, u.created_at
         ORDER BY u.name ASC
      `;

      return NextResponse.json({ managers });
   } catch (error) {
      console.error('Error fetching managers:', error);
      return NextResponse.json(
         { error: 'Failed to fetch managers' },
         { status: 500 }
      );
   }
}

// PUT - Update manager admin status
export async function PUT(request: Request) {
   try {
      await initializeDatabase();
      const sql = getDb();

      const body = await request.json();
      const { userId, isAdmin } = body;

      if (typeof userId !== 'number') {
         return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
         );
      }

      if (typeof isAdmin !== 'boolean') {
         return NextResponse.json(
            { error: 'isAdmin must be a boolean' },
            { status: 400 }
         );
      }

      await sql`
         UPDATE users
         SET is_admin = ${isAdmin}
         WHERE id = ${userId}
      `;

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error('Error updating manager:', error);
      return NextResponse.json(
         { error: 'Failed to update manager' },
         { status: 500 }
      );
   }
}

