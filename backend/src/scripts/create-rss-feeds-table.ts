import 'dotenv/config';
import pool from '../config/database.js';

async function createRSSFeedsTable() {
  try {
    console.log('Creating RSS feeds table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rss_feeds_active ON rss_feeds(is_active)
    `);

    // Insert default RSS feed
    await pool.query(`
      INSERT INTO rss_feeds (name, url, description, category, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (url) DO NOTHING
    `, [
      '中華超傳媒',
      'https://chinanewscloud.com/api/v1/rss-news',
      '中華超傳媒即時新聞 RSS',
      '綜合新聞',
      true
    ]);

    console.log('✓ Created RSS feeds table');
    console.log('✓ Inserted default RSS feed');
    console.log('\n✓ RSS feeds table setup complete!');
  } catch (error) {
    console.error('Error creating RSS feeds table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createRSSFeedsTable();
