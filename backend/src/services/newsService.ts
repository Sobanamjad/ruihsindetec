import Parser from 'rss-parser';
import pool from '../config/database.js';

const RSS_URL = 'https://chinanewscloud.com/api/v1/rss-news';
const parser = new Parser();

function normalizeUrl(url: string): string {
  url = url.trim();

  if (url === '') {
    return '';
  }

  // Fix malformed URLs
  if (url.includes('https://https://')) {
    url = url.replace(/https:\/\/https:\/\//g, 'https://');
  }

  if (url.includes('http://https://')) {
    url = url.replace(/http:\/\/https:\/\//g, 'https://');
  }

  if (url.includes('sharpnews.twhttps://')) {
    url = url.replace('sharpnews.twhttps://', 'https://');
  }

  if (url.startsWith('//')) {
    return 'https:' + url;
  }

  if (url.startsWith('/')) {
    return 'https://chinanewscloud.com' + url;
  }

  return url;
}

function makeSlug(link: string, title: string): string {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length > 0) {
      return decodeURIComponent(pathParts[pathParts.length - 1]);
    }
  } catch (_e) {
    // URL parse failed, use title
  }

  return title.trim().replace(/\s+/g, '-');
}

function extractFirstImage(html: string): string {
  if (!html) return '';

  const imgMatch = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  if (imgMatch) {
    const url = normalizeUrl(imgMatch[1]);
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }
  }

  return '';
}

function getFeedCategory(title: string, description: string, category?: string): string {
  if (category && category.trim()) {
    return category.trim();
  }

  const text = title + ' ' + description;

  if (/房產|房市|住宅|租賃|不動產|地產|社宅|房屋|地籍|建案/u.test(text)) {
    return '房產新聞';
  }

  if (/台股|股票|證券|投資|財報|營收|金融|指數|外資|基金|股市|加權|櫃買|ETF/u.test(text)) {
    return '財經新聞';
  }

  return '產經新聞';
}

export async function fetchAndStoreNews(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    console.log('Fetching RSS feed...');
    const feed = await parser.parseURL(RSS_URL);
    
    console.log(`Found ${feed.items.length} items in RSS feed`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of feed.items) {
      try {
        const title = item.title || '';
        const link = item.link || '';
        const pubDate = item.pubDate;
        const description = item.contentSnippet || item.description || '';
        const content = item.content || item['content:encoded'] || '';

        // Extract image
        let image = extractFirstImage(content);
        if (!image) {
          image = extractFirstImage(description);
        }

        // Get category
        const category = getFeedCategory(title, description, item.category);

        const slug = makeSlug(link, title);

        // Insert or update in database
        const result = await pool.query(
          `INSERT INTO news (slug, title, link, date, description, image, category, content_html)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (slug) DO UPDATE 
           SET title = $2, link = $3, date = $4, description = $5, image = $6, category = $7, content_html = $8, updated_at = CURRENT_TIMESTAMP
           RETURNING (xmax = 0) as inserted`,
          [slug, title, link, pubDate, description, image, category, content]
        );

        if (result.rows[0].inserted) {
          insertedCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.error('Error processing news item:', error);
      }
    }

    console.log(`Inserted: ${insertedCount}, Updated: ${updatedCount}`);
    
    return {
      success: true,
      message: `News fetched successfully. Inserted: ${insertedCount}, Updated: ${updatedCount}`,
      count: feed.items.length
    };
  } catch (error) {
    console.error('Error fetching RSS:', error);
    return {
      success: false,
      message: 'Failed to fetch RSS feed'
    };
  }
}

export async function getNewsFromDB(limit: number = 30, category?: string): Promise<any[]> {
  try {
    let query = 'SELECT * FROM news';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY date DESC NULLS LAST LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching news from DB:', error);
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<any | null> {
  try {
    const result = await pool.query('SELECT * FROM news WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    return null;
  }
}
