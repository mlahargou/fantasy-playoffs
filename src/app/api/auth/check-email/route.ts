import { NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
   try {
      await initializeDatabase();
      const db = getDb();

      const { searchParams } = new URL(request.url);
      const email = searchParams.get('email');

      if (!email || !email.includes('@')) {
         return NextResponse.json(
            { error: 'Valid email is required' },
            { status: 400 }
         );
      }

      const normalizedEmail = email.toLowerCase().trim();

      const users = await db`
         SELECT id, name, password_hash FROM users WHERE email = ${normalizedEmail}
      `;

      if (users.length === 0) {
         return NextResponse.json({
            exists: false,
            has_password: false,
            userName: null,
         });
      }

      const user = users[0];
      return NextResponse.json({
         exists: true,
         has_password: !!user.password_hash,
         userName: user.name,
      });
   } catch (error) {
      console.error('Error checking email:', error);
      return NextResponse.json(
         { error: 'Failed to check email' },
         { status: 500 }
      );
   }
}

