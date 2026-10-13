export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  link: string;
  date: string;
  description: string;
  image: string;
  category: string;
  content_html?: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = 'http://localhost:5000/api';

export async function fetchNews(limit: number = 30, category?: string): Promise<NewsItem[]> {
  try {
    let url = `${API_BASE}/news?limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const news = await response.json();
    return news;
  } catch (error) {
    console.error('News fetch error:', error);
    throw error;
  }
}

export async function fetchArticleBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const response = await fetch(`${API_BASE}/news/${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const news = await response.json();
    return news;
  } catch (error) {
    console.error('Article fetch error:', error);
    throw error;
  }
}
