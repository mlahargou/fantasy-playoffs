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
   await db`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
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
}
