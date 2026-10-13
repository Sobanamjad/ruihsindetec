import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all content (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT section, content FROM site_content ORDER BY section');
    const contentMap: Record<string, any> = {};
    result.rows.forEach(row => {
      contentMap[row.section] = row.content;
    });
    res.json(contentMap);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get specific section (public)
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const result = await pool.query('SELECT content FROM site_content WHERE section = $1', [section]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json(result.rows[0].content);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Update specific section (protected)
router.put('/:section', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    const { content } = req.body;
    
    const result = await pool.query(
      'INSERT INTO site_content (section, content) VALUES ($1, $2) ON CONFLICT (section) DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP RETURNING content',
      [section, content]
    );
    
    res.json({ success: true, content: result.rows[0].content });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Reset section to default (protected)
router.post('/:section/reset', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    
    // Default content values
    const defaults: Record<string, any> = {
      hero: {
        tag: '專業資訊調查與風險評估',
        title: '瑞信徵信社｜專業調查、合法程序、重視保密',
        subtitle: '專業調查｜合法程序｜重視保密',
        description: '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。',
        image: '/hero.png',
        badges: ['專業分析', '合法程序', '客觀評估', '資訊保密'],
        buttons: [
          { label: '立即諮詢', href: '#contact', variant: 'primary' },
          { label: '了解服務', href: '#services', variant: 'secondary' },
        ],
      },
      menu: {
        items: [
          { label: '首頁', href: '/' },
          { label: '服務項目', href: '/#services' },
          { label: '關於我們', href: '/#about' },
          { label: '常見問題', href: '/#faq' },
          { label: '聯絡我們', href: '/#contact' },
        ],
      },
      services: {
        tag: '服務項目',
        title: '專業徵信服務',
        description: '提供全方位的徵信調查服務，協助您掌握真相',
        cards: [],
      },
    };
    
    const defaultContent = defaults[section];
    if (!defaultContent) {
      return res.status(400).json({ error: 'No default content for this section' });
    }
    
    const result = await pool.query(
      'UPDATE site_content SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE section = $2 RETURNING content',
      [JSON.stringify(defaultContent), section]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json({ success: true, content: result.rows[0].content });
  } catch (error) {
    console.error('Error resetting section:', error);
    res.status(500).json({ error: 'Failed to reset section' });
  }
});

export default router;
