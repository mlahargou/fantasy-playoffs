import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = 'session_token';
const SESSION_EXPIRY_DAYS = 7;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
   return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
   return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(userId: number): Promise<string> {
   const db = getDb();
   const token = crypto.randomUUID();
   const expiresAt = new Date();
   expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

   await db`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt})
   `;

   return token;
}

export async function setSessionCookie(token: string): Promise<void> {
   const cookieStore = await cookies();
   const expiresAt = new Date();
   expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

   cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
   });
}

export async function getSessionToken(): Promise<string | undefined> {
   const cookieStore = await cookies();
   return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function clearSessionCookie(): Promise<void> {
   const cookieStore = await cookies();
   cookieStore.delete(SESSION_COOKIE_NAME);
}

export interface SessionUser {
   id: number;
   email: string;
   name: string;
   isAdmin: boolean;
}

export async function validateSession(): Promise<SessionUser | null> {
   const token = await getSessionToken();
   if (!token) {
      return null;
   }

   const db = getDb();
   const now = new Date();

   const results = await db`
      SELECT u.id, u.email, u.name, u.is_admin
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > ${now}
   `;

   if (results.length === 0) {
      return null;
   }

   const row = results[0];
   return {
      id: row.id,
      email: row.email,
      name: row.name,
      isAdmin: row.is_admin ?? false,
   } as SessionUser;
}

export async function deleteSession(token: string): Promise<void> {
   const db = getDb();
   await db`DELETE FROM sessions WHERE token = ${token}`;
}

// Delete all sessions for a user (useful for password changes)
export async function deleteAllUserSessions(userId: number): Promise<void> {
   const db = getDb();
   await db`DELETE FROM sessions WHERE user_id = ${userId}`;
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
   const db = getDb();
   const now = new Date();
   await db`DELETE FROM sessions WHERE expires_at < ${now}`;
}

