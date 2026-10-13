import 'dotenv/config';
import pool from '../config/database.js';

async function createPagesTable() {
  try {
    console.log('Creating pages table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'content',
        content JSONB,
        meta_title VARCHAR(255),
        meta_description TEXT,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(type)
    `);

    console.log('✓ Created pages table with indexes');
    console.log('\n✓ Pages table setup complete!');
  } catch (error) {
    console.error('Error creating pages table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createPagesTable();
