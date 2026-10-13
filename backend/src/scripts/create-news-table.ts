import 'dotenv/config';
import pool from '../config/database.js';

async function createNewsTable() {
  try {
    console.log('Creating news table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        date TIMESTAMP,
        description TEXT,
        image TEXT,
        category VARCHAR(100),
        content_html TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on slug for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)
    `);

    // Create index on category for filtering
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)
    `);

    // Create index on date for sorting
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC)
    `);

    console.log('✓ Created news table with indexes');
    console.log('\n✓ News table setup complete!');
  } catch (error) {
    console.error('Error creating news table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createNewsTable();
