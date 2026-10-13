import 'dotenv/config';
import pool from '../config/database.js';

async function resetDatabase() {
  try {
    console.log('Resetting database...');

    // Clear existing content
    await pool.query('DELETE FROM site_content');
    console.log('✓ Cleared existing content');

    console.log('\n✓ Database reset complete!');
    console.log('Now run: npm run setup-db to insert all content');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
