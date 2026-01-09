import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
   const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

   // No session token - redirect to home
   if (!token) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
   }

   try {
      const sql = neon(process.env.DATABASE_URL!);
      const now = new Date();

      const results = await sql`
         SELECT u.is_admin
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ${token} AND s.expires_at > ${now}
      `;

      // Invalid session or not an admin
      if (results.length === 0 || !results[0].is_admin) {
         return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
      }

      // User is authenticated and is an admin - allow access
      return NextResponse.next();
   } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
   }
}

export const config = {
   matcher: '/admin/:path*',
};

