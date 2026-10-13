import { useState, useEffect } from 'react';
import './App.css';
import NewsDetail from './NewsDetail';
import { fetchNews, type NewsItem } from './rssService';
import { getPublicContent } from './publicContent';
import type { ContentData } from './publicContent';

interface PageData {
  id: number;
  slug: string;
  title: string;
  type: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('全部分類');
  const [visibleNewsCount, setVisibleNewsCount] = useState(12);
  const [content, setContent] = useState<ContentData | null>(null);
  const [currentPage, setCurrentPage] = useState<PageData | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Load content from API on mount
  useEffect(() => {
    const loadContent = async () => {
      const data = await getPublicContent();
      setContent(data);
    };
    loadContent();
  }, []);

  // Listen for content updates from admin panel
  useEffect(() => {
    const handleContentUpdate = async () => {
      const data = await getPublicContent();
      setContent(data);
    };

    window.addEventListener('content-updated', handleContentUpdate);

    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
    };
  }, []);

  // Check if current path is a dynamic page
  useEffect(() => {
    const pathname = currentPath;

    // Skip news pages and home
    if (pathname.startsWith('/news/') || pathname === '/' || pathname.startsWith('#')) {
      setCurrentPage(null);
      return;
    }

    // Check if it's a section anchor link
    if (pathname.startsWith('/#') || pathname === '') {
      setCurrentPage(null);
      return;
    }

    // Try to fetch as a dynamic page
    const fetchPage = async () => {
      try {
        setPageLoading(true);
        const slug = pathname.replace(/^\//, '');
        const response = await fetch(`http://localhost:5000/api/pages/${slug}`);

        if (response.ok) {
          const pageData = await response.json();
          setCurrentPage(pageData);
        } else {
          setCurrentPage(null);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setCurrentPage(null);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPage();
  }, [currentPath]);

  // Listen for navigation changes
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);

    // Also intercept link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && link.origin === window.location.origin) {
        const pathname = new URL(link.href).pathname;
        if (pathname !== window.location.pathname) {
          setCurrentPath(pathname);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError('');

        const newsData = await fetchNews(30);
        setNews(newsData);
      } catch (error) {
        console.error('News loading error:', error);
        setNewsError('目前無法載入新聞，請稍後再試。');
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
  }, []);

  const rssCategories = Array.from(
    new Set(news.map((item) => item.category).filter(Boolean))
  );

  const newsCategories = ['全部分類', ...rssCategories];

  const categoryNews =
    selectedNewsCategory === '全部分類'
      ? news
      : news.filter((item) => item.category === selectedNewsCategory);

  const filteredNews = categoryNews.slice(0, visibleNewsCount);

  const categoryCount = (category: string) =>
    category === '全部分類'
      ? news.length
      : news.filter((item) => item.category === category).length;

  const handleCategoryChange = (category: string) => {
    setSelectedNewsCategory(category);
    setVisibleNewsCount(12); // Reset pagination when category changes
  };

  const pathname = decodeURIComponent(window.location.pathname);

  if (pathname.startsWith('/news/')) {
    const slug = pathname.replace(/^\/news\//, '');
    return <NewsDetail slug={slug} />;
  }

  // Render dynamic page if found
  if (currentPage) {
    return (
      <div className="app">
        <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="container header-container">
            <a href="/" className="logo">{content?.site.site_name || '瑞信徵信社'}</a>

            <nav className="nav-desktop">
              {content?.menu.items.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={item.variant === 'primary' ? 'btn-primary' : ''}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
          </div>

          {isMenuOpen && (
            <nav className="nav-mobile">
              {content?.menu.items.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={item.variant === 'primary' ? 'btn-primary' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </header>

        <section className="section" style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="section-header">
              <h1 className="section-title">{currentPage.title}</h1>
            </div>
            <div className="page-content" style={{ lineHeight: '1.8', fontSize: '16px' }}>
              {currentPage.content?.content ? (
                <div dangerouslySetInnerHTML={{ __html: currentPage.content.content }} />
              ) : (
                <p style={{ color: '#6b7280' }}>此頁面內容尚未建立，請前往管理後台編輯</p>
              )}
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer-container">
            <div className="footer-brand">
              <p className="footer-logo">{content?.footer.logo || '瑞信徵信社'}</p>
              <p className="footer-desc">{content?.footer.description || ''}</p>
            </div>
            <nav className="footer-nav">
              {content?.footer.nav_items.map((item, index) => (
                <a key={index} href={item.href}>{item.label}</a>
              ))}
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-disclaimer">{content?.footer.disclaimer || ''}</p>
            <p className="footer-copy">{content?.footer.copyright || ''}</p>
          </div>
        </footer>
      </div>
    );
  }

  if (pageLoading) {
    return <div className="app">Loading page...</div>;
  }

  if (!content) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container">
          <a href="#home" className="logo">{content.site.site_name}</a>
          
          <nav className="nav-desktop">
            {content.menu.items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={item.variant === 'primary' ? 'btn-primary' : ''}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="nav-mobile">
            {content.menu.items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={item.variant === 'primary' ? 'btn-primary' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <p className="hero-tag">專業資訊調查與風險評估</p>
            <h1 className="hero-title">瑞信徵信社｜專業調查、合法程序、重視保密</h1>
            <p className="hero-subtitle">專業調查｜合法程序｜重視保密</p>
            <p className="hero-desc">
              面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。
              瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。
            </p>
            <div className="hero-buttons">
              <a href="#contact" className="btn-primary">立即諮詢</a>
              <a href="#services" className="btn-secondary">了解服務</a>
            </div>
            <ul className="hero-badges">
              <li>專業分析</li>
              <li>合法程序</li>
              <li>客觀評估</li>
              <li>資訊保密</li>
            </ul>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <img src="/hero.png" alt="瑞信徵信社專業調查服務" className="hero-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEEDS SECTION ===== */}
      <section id="needs" className="section needs">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">常見需求</p>
            <h2 className="section-title">當資訊不足，重要決定往往更加困難</h2>
            <p className="section-desc">
              有些疑問無法只靠猜測確認，有些合作也不能只憑表面資訊判斷。
              瑞信從實際需求出發，協助整理資訊、確認方向，逐步釐清問題。
            </p>
          </div>
          <div className="needs-grid">
            <div className="card">
              <span className="card-line"></span>
              <h3>關係中的疑慮</h3>
              <p>當關係出現異常或資訊不一致時，透過合法方式了解狀況，避免在情緒與猜測中做出決定。</p>
            </div>
            <div className="card">
              <span className="card-line"></span>
              <h3>合作前的查核</h3>
              <p>在建立合作、交易或委任關係前，先了解相關背景資訊，降低資訊不對稱造成的風險。</p>
            </div>
            <div className="card">
              <span className="card-line"></span>
              <h3>企業決策風險</h3>
              <p>面對重要商業決策時，透過資訊整理與風險分析，提高決策的完整度與安全性。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="section about">
        <div className="container about-container">
          <div className="about-header">
            <p className="section-tag">關於瑞信</p>
            <h2 className="section-title">以事實為基礎，協助您做出更清楚的判斷</h2>
          </div>
          <div className="about-content">
            <p>瑞信徵信社以專業、客觀與保密為服務原則，提供婚姻徵信、商業調查及企業風險管理相關服務。</p>
            <p>我們重視每一項委託背後的實際需求，從初步諮詢、問題評估到資訊整理，皆以合法程序與謹慎態度進行。</p>
            <p>徵信服務的目的，不是製造衝突，而是協助委託人降低資訊落差、釐清事實，為後續行動提供更完整的判斷依據。</p>
            <blockquote>真相，是每一次正確決策的開始。</blockquote>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section id="services" className="section services">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">服務項目</p>
            <h2 className="section-title">個人與企業的專業調查服務</h2>
            <p className="section-desc">依照不同情境與需求，提供適合的資訊調查與風險評估方向。</p>
          </div>
          <div className="services-grid">
            {/* Service 1: Marriage */}
            <div className="service-card">
              <div className="service-image">
                <img src="/marriage.jpg" alt="婚姻徵信服務" className="service-img" />
              </div>
              <div className="service-content">
                <h3>婚姻徵信</h3>
                <p className="service-sub">婚姻與關係資訊釐清</p>
                <p className="service-desc">
                  當婚姻或伴侶關係出現疑慮時，單靠猜測容易加深不安與衝突。
                  瑞信協助委託人整理需求，透過合法程序了解相關資訊。
                </p>
                <ul className="service-list">
                  <li>婚姻狀況相關資訊確認</li>
                  <li>關係疑問與異常情況釐清</li>
                  <li>婚前背景資訊了解</li>
                  <li>合法蒐證方向諮詢</li>
                  <li>家庭與關係問題資訊整理</li>
                </ul>
                <a href="#contact" className="btn-outline">了解婚姻徵信</a>
              </div>
            </div>

            {/* Service 2: Business */}
            <div className="service-card">
              <div className="service-image">
                <img src="/business.jpg" alt="商業調查服務" className="service-img" />
              </div>
              <div className="service-content">
                <h3>商業調查</h3>
                <p className="service-sub">合作之前，先了解潛在風險</p>
                <p className="service-desc">
                  商業合作常伴隨資訊不對稱。瑞信協助企業與個人進行合作前資訊查核，
                  整理可取得的背景資訊與潛在風險。
                </p>
                <ul className="service-list">
                  <li>合作對象背景資訊查核</li>
                  <li>商業合作風險評估</li>
                  <li>企業與廠商資訊整理</li>
                  <li>合作前基本盡職調查</li>
                  <li>商業爭議相關資訊釐清</li>
                </ul>
                <a href="#contact" className="btn-outline">了解商業調查</a>
              </div>
            </div>

            {/* Service 3: Risk Management */}
            <div className="service-card">
              <div className="service-image">
                <img src="/risk.jpg" alt="企業風險管理服務" className="service-img" />
              </div>
              <div className="service-content">
                <h3>企業風險管理</h3>
                <p className="service-sub">為重要決策補足關鍵資訊</p>
                <p className="service-desc">
                  企業在合作、管理或重大決策前，若缺乏足夠資訊，容易低估潛在風險。
                  瑞信透過資訊整理、背景查核與風險分析協助企業。
                </p>
                <ul className="service-list">
                  <li>企業背景與關係資訊整理</li>
                  <li>合作風險初步評估</li>
                  <li>重要決策前資訊查核</li>
                  <li>異常情況與爭議資訊分析</li>
                  <li>企業安全與風險管理諮詢</li>
                </ul>
                <a href="#contact" className="btn-outline">了解企業風險管理</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLES SECTION ===== */}
      <section id="principles" className="section principles">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">服務原則</p>
            <h2 className="section-title">每一項委託，都需要更謹慎的處理</h2>
          </div>
          <div className="principles-grid">
            <div className="principle-card">
              <span className="principle-icon">
                {/* Scale / 合法程序 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v18"/>
                  <path d="M19 8 22 16a5 5 0 0 1-6 0"/>
                  <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>
                  <path d="M5 8 2 16a5 5 0 0 0 6 0"/>
                  <path d="M7 21h10"/>
                </svg>
              </span>
              <h3>合法程序</h3>
              <p>依照實際需求評估可行方向，重視法律界線與合法資訊取得方式。</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                {/* Lock / 重視保密 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <h3>重視保密</h3>
              <p>重視委託內容與個人資訊，降低敏感資料在服務過程中的暴露風險。</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                {/* Chart Line / 客觀分析 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </span>
              <h3>客觀分析</h3>
              <p>以可確認的資訊為基礎，協助委託人釐清事實，不以猜測取代判斷。</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                {/* Clipboard List / 需求評估 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M12 11h4"/><path d="M12 16h4"/>
                  <path d="M8 11h.01"/><path d="M8 16h.01"/>
                </svg>
              </span>
              <h3>需求評估</h3>
              <p>不同案件有不同背景與目的，先理解問題，再規劃適合的處理方向。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS SECTION ===== */}
      <section id="process" className="section process">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">服務流程</p>
            <h2 className="section-title">從需求確認開始，逐步釐清問題</h2>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <span className="step-number">01</span>
              <h3>初步諮詢</h3>
              <p>了解目前遇到的狀況、疑問與希望確認的資訊。</p>
            </div>
            <div className="process-step">
              <span className="step-number">02</span>
              <h3>需求評估</h3>
              <p>評估案件方向、資訊條件與可採取的合法處理方式。</p>
            </div>
            <div className="process-step">
              <span className="step-number">03</span>
              <h3>確認服務內容</h3>
              <p>說明預計進行的工作項目、範圍與注意事項。</p>
            </div>
            <div className="process-step">
              <span className="step-number">04</span>
              <h3>資訊整理與分析</h3>
              <p>依照確認方向進行資訊蒐集、查核與內容整理。</p>
            </div>
            <div className="process-step">
              <span className="step-number">05</span>
              <h3>結果說明</h3>
              <p>說明已整理的資訊與可供後續判斷的重點。</p>
            </div>
          </div>
          <p className="process-note">
            每項委託的情況、可取得資訊與處理方式皆不同，實際服務內容需經初步評估後確認。
          </p>
        </div>
      </section>

      {/* ===== KNOWLEDGE SECTION ===== */}
      <section id="knowledge" className="section knowledge">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">徵信知識</p>
            <h2 className="section-title">先了解，再決定下一步</h2>
            <p className="section-desc">透過基礎徵信、蒐證與商業風險知識，協助您在尋求服務前建立正確觀念。</p>
          </div>
          <div className="knowledge-grid">
            <div className="knowledge-card">
              <h3>徵信服務是否合法？</h3>
              <p>徵信服務本身並不代表可以使用任何方式取得資訊，實際調查仍應遵守相關法律規範。</p>
            </div>
            <div className="knowledge-card">
              <h3>外遇調查需要注意哪些法律問題？</h3>
              <p>蒐集資訊時應注意隱私權、個人資料及相關法律界線，並非所有方式都能合法使用。</p>
            </div>
            <div className="knowledge-card">
              <h3>商業合作前為什麼需要背景調查？</h3>
              <p>合作前查核有助了解對方背景與潛在風險，降低資訊不對稱造成的合作損失。</p>
            </div>
            <div className="knowledge-card">
              <h3>企業如何降低合作風險？</h3>
              <p>除了契約審查，也應重視合作對象背景、履約能力與過往爭議資訊。</p>
            </div>
          </div>
          <div className="knowledge-cta">
            <a href="#contact" className="btn-outline">查看更多徵信知識 →</a>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="section faq">
        <div className="container faq-container">
          <div className="section-header">
            <p className="section-tag">常見問題</p>
            <h2 className="section-title">諮詢前，先了解常見疑問</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h4>找徵信社是否合法？</h4>
              <p>徵信社本身是合法的行業，但必須遵守相關法律規定，不得使用非法手段獲取資訊。</p>
            </div>
            <div className="faq-item">
              <h4>委託內容會不會外洩？</h4>
              <p>瑞信徵信社高度重視保密，所有委託內容均嚴格保護，不會向第三方透露。</p>
            </div>
            <div className="faq-item">
              <h4>可以保證一定查到結果嗎？</h4>
              <p>調查結果取決於多種因素，我們會盡全力調查，但無法保證特定結果。</p>
            </div>
            <div className="faq-item">
              <h4>諮詢時需要準備哪些資料？</h4>
              <p>建議準備相關背景資訊、已知線索及您希望釐清的問題清單。</p>
            </div>
            <div className="faq-item">
              <h4>企業也可以委託徵信服務嗎？</h4>
              <p>是的，我們為企業提供商業調查和風險管理服務。</p>
            </div>
            <div className="faq-item">
              <h4>費用如何計算？</h4>
              <p>費用根據案件複雜程度、所需時間和資源而定，請聯繫我們進行評估。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="container cta-container">
          <span className="cta-line"></span>
          <h2>需要協助釐清資訊？</h2>
          <p>
            面對不確定的關係、合作或企業風險，先了解問題與可行方向，再決定下一步。
            瑞信徵信社提供專業、客觀且重視保密的初步諮詢服務。
          </p>
          <a href="#contact" className="btn-gold">立即聯絡瑞信</a>
          <p className="cta-note">聯絡方式、電話、LINE 與服務時間待品牌資料確認後補充。</p>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="section contact">
        <div className="container contact-container">
          <div className="section-header">
            <p className="section-tag">聯絡諮詢</p>
            <h2 className="section-title">填寫初步諮詢需求</h2>
          </div>
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">姓名或稱呼</label>
                <input type="text" id="name" placeholder="請輸入您的姓名" required />
              </div>
              <div className="form-group">
                <label htmlFor="contact">聯絡方式</label>
                <input type="text" id="contact" placeholder="電話或 Email" required />
              </div>
              <div className="form-group">
                <label htmlFor="service">希望諮詢的服務</label>
                <select id="service" required>
                  <option value="">請選擇</option>
                  <option value="婚姻徵信">婚姻徵信</option>
                  <option value="商業調查">商業調查</option>
                  <option value="企業風險管理">企業風險管理</option>
                  <option value="其他需求">其他需求</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">需求簡述</label>
                <textarea id="message" rows={5} placeholder="請簡述您的需求..."></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="time">方便聯絡的時間</label>
                <input type="text" id="time" placeholder="例如：週一至週五 14:00-17:00" />
              </div>
              <p className="form-note">
                請勿在尚未確認聯絡管道安全前，填寫過度敏感或可識別第三人的完整資料。
              </p>
              <button type="submit" className="btn-primary">送出諮詢需求</button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== NEWS SECTION ===== */}
      <section id="news" className="section news">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">即時新聞</p>
            <h2 className="section-title">最新資訊</h2>
            <p className="section-desc">來自中華超傳媒的最新新聞資訊</p>
          </div>

          {newsLoading && <p className="news-status">新聞載入中...</p>}

          {newsError && <p className="news-status error">{newsError}</p>}

          {!newsLoading && !newsError && news.length > 0 && (
            <div className="rss-news-layout">
              <aside className="rss-news-sidebar">
                <div className="rss-sidebar-heading">
                  <p className="section-tag">分類</p>
                  <h3>新聞分類</h3>
                </div>
                <div className="rss-category-list">
                  {newsCategories.map((category) => (
                    <button
                      key={category}
                      className={`rss-category-button ${
                        selectedNewsCategory === category ? 'active' : ''
                      }`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                      <span className="rss-category-count">
                        ({categoryCount(category)})
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="rss-news-main">
                <div className="rss-news-toolbar">
                  <p>顯示 {filteredNews.length} 則新聞</p>
                  <span className="rss-latest-pill">◷ 最新</span>
                </div>

                <div className="rss-news-grid">
                  {filteredNews.map((item) => (
                    <article className="rss-news-card" key={item.slug}>
                      <a
                        href={`/news/${encodeURIComponent(item.slug)}`}
                        className="rss-news-image"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="rss-news-image-placeholder">
                            <span>即時新聞</span>
                          </div>
                        )}
                      </a>
                      <div className="rss-news-card-body">
                        <div className="rss-news-meta">
                          {item.category && (
                            <span className="rss-category-badge">
                              {item.category}
                            </span>
                          )}
                          {item.date && (
                            <span className="rss-news-date">
                              {new Date(item.date).toLocaleDateString('zh-TW', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <h3>
                          <a href={`/news/${encodeURIComponent(item.slug)}`}>
                            {item.title}
                          </a>
                        </h3>
                        <p className="rss-news-description">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {categoryNews.length > visibleNewsCount && (
                  <div className="rss-news-load-more">
                    <button
                      className="btn-outline"
                      onClick={() => setVisibleNewsCount((prev) => prev + 12)}
                    >
                      載入更多新聞
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <p className="footer-logo">{content.footer.logo}</p>
            <p className="footer-desc">
              {content.footer.description}
            </p>
          </div>
          <nav className="footer-nav">
            {content.footer.nav_items.map((item, index) => (
              <a key={index} href={item.href}>{item.label}</a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            {content.footer.disclaimer}
          </p>
          <p className="footer-copy">{content.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;