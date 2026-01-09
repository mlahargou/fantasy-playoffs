import { NextResponse } from 'next/server';
import { getSessionToken, deleteSession, clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
   try {
      const token = await getSessionToken();

      if (token) {
         await deleteSession(token);
      }

      await clearSessionCookie();

      return NextResponse.json({
         success: true,
      });
   } catch (error) {
      console.error('Error logging out:', error);
      // Still try to clear the cookie even if there's an error
      try {
         await clearSessionCookie();
      } catch {
         // Ignore cookie clearing errors
      }
      return NextResponse.json({
         success: true,
      });
   }
}

