import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
   try {
      await initializeDatabase();
      const db = getDb();

      const body = await request.json();
      const { email, name, password } = body;

      // Validate required fields
      if (!email || !name || !password) {
         return NextResponse.json(
            { error: 'Email, name, and password are required' },
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

      // Validate name
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
         return NextResponse.json(
            { error: 'Name must be at least 2 characters' },
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

      // Check if user already exists
      const existingUsers = await db`
         SELECT id FROM users WHERE email = ${normalizedEmail}
      `;

      if (existingUsers.length > 0) {
         return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 400 }
         );
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);

      const newUsers = await db`
         INSERT INTO users (email, name, password_hash)
         VALUES (${normalizedEmail}, ${trimmedName}, ${passwordHash})
         RETURNING id, email, name
      `;

      const user = newUsers[0];

      // Create session
      const token = await createSession(user.id);
      await setSessionCookie(token);

      return NextResponse.json({
         success: true,
         userName: user.name,
      });
   } catch (error) {
      console.error('Error registering user:', error);
      return NextResponse.json(
         { error: 'Failed to register. Please try again.' },
         { status: 500 }
      );
   }
}

