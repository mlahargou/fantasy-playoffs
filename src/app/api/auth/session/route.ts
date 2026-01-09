import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { validateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
   try {
      await initializeDatabase();

      const user = await validateSession();

      if (!user) {
         return NextResponse.json({
            authenticated: false,
            user: null,
         });
      }

      return NextResponse.json({
         authenticated: true,
         user: {
            id: user.id,
            email: user.email,
            name: user.name,
         },
      });
   } catch (error) {
      console.error('Error validating session:', error);
      return NextResponse.json({
         authenticated: false,
         user: null,
      });
   }
}

