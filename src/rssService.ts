export type NewsItem = {
  slug: string;
  title: string;
  link: string;
  date: string;
  description: string;
  image: string;
  category: string;
  content_html?: string;
};

const RSS_URL = 'https://chinanewscloud.com/api/v1/rss-news';

function normalizeUrl(url: string): string {
  url = url.trim();

  if (url === '') {
    return '';
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
  } catch (e) {
    // URL parse failed, use title
  }

  return title.trim().replace(/\s+/g, '-');
}

function extractFirstImage(html: string): string {
  if (!html) return '';

  const imgMatch = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  if (imgMatch) {
    return normalizeUrl(imgMatch[1]);
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

function sanitizeArticleHtml(html: string): string {
  if (!html || !html.trim()) return '';

  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'img', 'figure', 'figcaption'];

  // Remove script, style, iframe, etc.
  html = html.replace(/<(script|style|iframe|object|embed|form)[^>]*>.*?<\/\1>/gis, '');

  // Create a temporary DOM element for sanitization
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        node.parentNode?.removeChild(node);
        return;
      }

      // Remove event handlers and style attributes
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on') || attr.name === 'style') {
          element.removeAttribute(attr.name);
        }
      });

      // Sanitize img src
      if (tagName === 'img') {
        const src = element.getAttribute('src') || element.getAttribute('data-src');
        if (src) {
          const normalized = normalizeUrl(src);
          element.setAttribute('src', normalized);
          element.removeAttribute('data-src');
          element.setAttribute('loading', 'lazy');
          element.setAttribute('alt', '');
        } else {
          node.parentNode?.removeChild(node);
          return;
        }
      }

      // Sanitize links
      if (tagName === 'a') {
        const href = element.getAttribute('href');
        if (!href || href.startsWith('javascript:') || href.startsWith('data:')) {
          const span = document.createElement('span');
          while (element.firstChild) {
            span.appendChild(element.firstChild);
          }
          node.parentNode?.replaceChild(span, node);
          return;
        } else {
          element.setAttribute('href', normalizeUrl(href));
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }

    // Recursively sanitize children
    const children = Array.from(node.childNodes);
    children.forEach(child => sanitizeNode(child));
  }

  sanitizeNode(tempDiv);

  return tempDiv.innerHTML;
}

function parseRSSItem(item: Element, includeContent: boolean = false): NewsItem {
  const title = item.querySelector('title')?.textContent?.trim() || '';
  const link = item.querySelector('link')?.textContent?.trim() || '';
  const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
  const description = item.querySelector('description')?.textContent?.trim() || '';

  // Get content from various RSS namespaces
  let content = '';
  const contentElem = item.querySelector('content');
  if (contentElem?.textContent) {
    content = contentElem.textContent;
  } else {
    // Try content:encoded
    const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0];
    if (contentEncoded?.textContent) {
      content = contentEncoded.textContent;
    }
  }

  // Extract image
  let image = extractFirstImage(content);

  // Try enclosure
  if (!image) {
    const enclosure = item.querySelector('enclosure');
    const enclosureUrl = enclosure?.getAttribute('url');
    if (enclosureUrl) {
      image = normalizeUrl(enclosureUrl);
    }
  }

  // Try media:content or media:thumbnail
  if (!image) {
    const mediaContent = item.querySelector('[url]');
    const mediaUrl = mediaContent?.getAttribute('url');
    if (mediaUrl) {
      image = normalizeUrl(mediaUrl);
    }
  }

  // Get category
  const categoryElem = item.querySelector('category');
  const category = categoryElem?.textContent?.trim();

  const feedCategory = getFeedCategory(title, description, category);

  const result: NewsItem = {
    slug: makeSlug(link, title),
    title,
    link,
    date: pubDate,
    description: description.replace(/\s+/g, ' '),
    image,
    category: feedCategory,
  };

  if (includeContent) {
    result.content_html = sanitizeArticleHtml(content);
  }

  return result;
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid RSS feed');
    }

    const items = xmlDoc.querySelectorAll('channel > item');
    const news: NewsItem[] = [];

    items.forEach((item) => {
      try {
        news.push(parseRSSItem(item));
      } catch (e) {
        console.error('Error parsing RSS item:', e);
      }
    });

    return news.slice(0, 30);
  } catch (error) {
    console.error('RSS fetch error:', error);
    throw error;
  }
}

export async function fetchArticleBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const response = await fetch(RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid RSS feed');
    }

    const items = xmlDoc.querySelectorAll('channel > item');

    for (const item of items) {
      try {
        const newsItem = parseRSSItem(item, true); // Include content
        if (newsItem.slug === slug) {
          return newsItem;
        }
      } catch (e) {
        console.error('Error parsing RSS item:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Article fetch error:', error);
    throw error;
  }
}
