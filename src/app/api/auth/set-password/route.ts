import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';

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

      // Validate password
      if (password.length < 6) {
         return NextResponse.json(
            { error: 'Password must be at least 6 characters' },
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
            { error: 'User not found' },
            { status: 404 }
         );
      }

      const user = users[0];

      // Check if user already has a password
      if (user.password_hash) {
         return NextResponse.json(
            { error: 'Password already set. Please use login instead.' },
            { status: 400 }
         );
      }

      // Hash and set password
      const passwordHash = await hashPassword(password);

      await db`
         UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}
      `;

      // Create session
      const token = await createSession(user.id);
      await setSessionCookie(token);

      return NextResponse.json({
         success: true,
         userName: user.name,
      });
   } catch (error) {
      console.error('Error setting password:', error);
      return NextResponse.json(
         { error: 'Failed to set password. Please try again.' },
         { status: 500 }
      );
   }
}

