import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false>;

export function getDb() {
   if (!sql) {
      if (!process.env.DATABASE_URL) {
         throw new Error('DATABASE_URL environment variable is not set');
      }
      sql = neon(process.env.DATABASE_URL);
   }
   return sql;
}

export async function initializeDatabase() {
   const db = getDb();

   // Create users table
   await db`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

   // Create entries table
   await db`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      team_number INTEGER NOT NULL CHECK (team_number >= 1 AND team_number <= 5),
      qb_id VARCHAR(100) NOT NULL,
      qb_name VARCHAR(255) NOT NULL,
      qb_team VARCHAR(50) NOT NULL,
      wr_id VARCHAR(100) NOT NULL,
      wr_name VARCHAR(255) NOT NULL,
      wr_team VARCHAR(50) NOT NULL,
      rb_id VARCHAR(100) NOT NULL,
      rb_name VARCHAR(255) NOT NULL,
      rb_team VARCHAR(50) NOT NULL,
      te_id VARCHAR(100) NOT NULL,
      te_name VARCHAR(255) NOT NULL,
      te_team VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email, team_number)
    )
  `;

   // Add user_id column if it doesn't exist (for existing databases)
   await db`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'entries' AND column_name = 'user_id'
      ) THEN
        ALTER TABLE entries ADD COLUMN user_id INTEGER REFERENCES users(id);
      END IF;
    END $$;
  `;
}

// Helper to get or create a user by email
export async function getOrCreateUser(email: string, name: string): Promise<{ id: number; email: string; name: string }> {
   const db = getDb();
   const normalizedEmail = email.toLowerCase().trim();

   // Try to find existing user
   const existingUsers = await db`
    SELECT id, email, name FROM users WHERE email = ${normalizedEmail}
  `;

   if (existingUsers.length > 0) {
      // Update name if provided and different (allows users to update their name)
      if (name && existingUsers[0].name !== name) {
         await db`UPDATE users SET name = ${name} WHERE id = ${existingUsers[0].id}`;
         return { id: existingUsers[0].id, email: existingUsers[0].email, name };
      }
      return existingUsers[0] as { id: number; email: string; name: string };
   }

   // Create new user
   const newUsers = await db`
    INSERT INTO users (email, name) VALUES (${normalizedEmail}, ${name})
    RETURNING id, email, name
  `;

   return newUsers[0] as { id: number; email: string; name: string };
}

// Helper to backfill user_id for existing entries
export async function backfillUserIds(): Promise<number> {
   const db = getDb();

   // Create users for any emails that don't have users yet (using email as name placeholder)
   await db`
    INSERT INTO users (email, name)
    SELECT DISTINCT LOWER(email), LOWER(email)
    FROM entries
    WHERE LOWER(email) NOT IN (SELECT email FROM users)
    ON CONFLICT (email) DO NOTHING
  `;

   // Update entries that don't have user_id set
   const result = await db`
    UPDATE entries e
    SET user_id = u.id
    FROM users u
    WHERE LOWER(e.email) = u.email AND e.user_id IS NULL
    RETURNING e.id
  `;

   return result.length;
}
