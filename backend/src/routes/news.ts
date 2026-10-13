import { Router } from 'express';
import { getNewsFromDB, getNewsBySlug, fetchAndStoreNews } from '../services/newsService.js';

const router = Router();

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const category = req.query.category as string;
    
    const news = await getNewsFromDB(limit, category);
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get news by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const news = await getNewsBySlug(slug);
    
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json(news);
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Refresh news from RSS (protected - could add auth if needed)
router.post('/refresh', async (req, res) => {
  try {
    const result = await fetchAndStoreNews();
    res.json(result);
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

export default router;
