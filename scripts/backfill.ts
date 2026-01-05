import { backfillUserIds, initializeDatabase } from '../src/lib/db';

async function main() {
   console.log('Initializing database...');
   await initializeDatabase();

   console.log('Backfilling user IDs for existing entries...');
   const count = await backfillUserIds();

   console.log(`✅ Done! Backfilled ${count} entries.`);
}

main()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error('❌ Backfill failed:', error);
      process.exit(1);
   });

