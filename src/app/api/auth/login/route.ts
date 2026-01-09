import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
   try {
      await initializeDatabase();
      const db = getDb();

      const body = await request.json();
      const { email, password } = body;

      // Validate required fields
      if (!email || !password) {
         return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
         );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const users = await db`
         SELECT id, name, password_hash FROM users WHERE email = ${normalizedEmail}
      `;

      if (users.length === 0) {
         return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
         );
      }

      const user = users[0];

      // Check if user has a password set
      if (!user.password_hash) {
         return NextResponse.json(
            { error: 'Please set a password first' },
            { status: 400 }
         );
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
         return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
         );
      }

      // Create session
      const token = await createSession(user.id);
      await setSessionCookie(token);

      return NextResponse.json({
         success: true,
         userName: user.name,
      });
   } catch (error) {
      console.error('Error logging in:', error);
      return NextResponse.json(
         { error: 'Failed to login. Please try again.' },
         { status: 500 }
      );
   }
}

