import { useEffect, useState } from 'react';
import { fetchNews, fetchArticleBySlug, type NewsItem } from './rssService';

type NewsDetailItem = NewsItem & {
  content_html?: string;
};

type NewsDetailProps = {
  slug: string;
};

function NewsDetail({ slug }: NewsDetailProps) {
  const [article, setArticle] = useState<NewsDetailItem | null>(null);
  const [latest, setLatest] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError('');

        const [articleData, newsData] = await Promise.all([
          fetchArticleBySlug(slug),
          fetchNews(4),
        ]);

        if (!articleData) {
          throw new Error('Article not found');
        }

        setArticle(articleData);

        if (newsData.length > 0) {
          setLatest(
            newsData
              .filter((item: NewsItem) => item.slug !== slug)
              .slice(0, 4)
          );
        }

        document.title = `${articleData.title}｜瑞信徵信社`;
      } catch (err) {
        console.error(err);
        setError('找不到此新聞，或新聞目前無法載入。');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  return (
    <div className="app news-detail-page">
      <header className="header header-scrolled">
        <div className="container header-container">
          <a href="/#home" className="logo">瑞信徵信社</a>

          <nav className="nav-desktop news-detail-nav">
            <a href="/#home">首頁</a>
            <a href="/#about">關於瑞信</a>
            <a href="/#services">服務項目</a>
            <a href="/#news">即時新聞</a>
            <a href="/#knowledge">徵信知識</a>
            <a href="/#contact">聯絡諮詢</a>
            <a href="/#contact" className="btn-primary">立即諮詢</a>
          </nav>
        </div>
      </header>

      <main className="reference-detail-main">
        <div className="reference-detail-container">
          {loading && <p className="news-status">新聞載入中...</p>}

          {!loading && error && (
            <div className="reference-detail-error">
              <h1>新聞無法載入</h1>
              <p>{error}</p>
              <a href="/#news" className="btn-outline">返回即時新聞</a>
            </div>
          )}

          {!loading && !error && article && (
            <>
              <article className="reference-news-article">
                <a href="/#news" className="reference-back-link">
                  ← 返回即時新聞
                </a>

                {article.category && (
                  <p className="reference-detail-category">{article.category}</p>
                )}

                <h1>{article.title}</h1>

                <div className="reference-detail-meta">
                  <span>
                    ◫{' '}
                    {article.date
                      ? new Date(article.date).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : ''}
                  </span>
                  <span>◷ 最新</span>
                </div>

                <div className="reference-detail-divider" />

                {article.image && (
                  <div className="reference-detail-hero">
                    <img src={article.image} alt={article.title} />
                  </div>
                )}

                {article.content_html ? (
                  <div
                    className="reference-detail-content"
                    dangerouslySetInnerHTML={{ __html: article.content_html }}
                  />
                ) : (
                  <p className="reference-detail-empty">
                    此文章暫無詳細內容。
                  </p>
                )}

                <div className="reference-source-note">
                  <span>資料來源：中華超傳媒</span>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看原始新聞來源 →
                  </a>
                </div>
              </article>

              {latest.length > 0 && (
                <section className="reference-related">
                  <div className="reference-related-title">
                    <p className="section-tag">最新消息</p>
                    <h2>更多即時新聞</h2>
                  </div>

                  <div className="reference-related-grid">
                    {latest.map((item) => (
                      <a
                        key={item.slug}
                        href={`/news/${encodeURIComponent(item.slug)}`}
                        className="reference-related-card"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="reference-related-placeholder">
                            即時新聞
                          </div>
                        )}
                        <div>
                          <span>{item.category}</span>
                          <h3>{item.title}</h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <p className="footer-logo">瑞信徵信社</p>
            <p className="footer-desc">
              提供婚姻徵信、商業調查與企業風險管理相關服務，協助個人與企業釐清資訊、降低風險。
            </p>
          </div>
          <nav className="footer-nav">
            <a href="/#about">關於瑞信</a>
            <a href="/#services">服務項目</a>
            <a href="/#news">即時新聞</a>
            <a href="/#knowledge">徵信知識</a>
            <a href="/#contact">聯絡諮詢</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            本網站內容為一般資訊與服務介紹，不構成法律意見。實際案件應依個別情況進行評估，必要時應諮詢專業律師。
          </p>
          <p className="footer-copy">© 2026 瑞信徵信社 All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default NewsDetail;
