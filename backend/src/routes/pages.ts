import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all published pages (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT slug, title, type, meta_title, meta_description, updated_at FROM pages WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get all pages (including unpublished) - for admin (protected)
// Must be before /:slug route
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get specific page by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM pages WHERE slug = $1 AND is_published = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// Create new page (protected)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { slug, title, type = 'content', content, meta_title, meta_description } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO pages (slug, title, type, content, meta_title, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [slug, title, type, content || {}, meta_title, meta_description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating page:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Page with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update page (protected)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { slug, title, type, content, meta_title, meta_description, is_published } = req.body;

    const result = await pool.query(
      `UPDATE pages
       SET slug = COALESCE($1, slug),
           title = COALESCE($2, title),
           type = COALESCE($3, type),
           content = COALESCE($4, content),
           meta_title = COALESCE($5, meta_title),
           meta_description = COALESCE($6, meta_description),
           is_published = COALESCE($7, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [slug, title, type, content, meta_title, meta_description, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating page:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Page with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete page (protected)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM pages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;
