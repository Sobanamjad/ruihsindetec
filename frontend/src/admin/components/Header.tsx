import { useLocation } from 'react-router-dom';

interface HeaderProps {
  user: { username: string; loginTime: string } | null;
  onLogout: () => Promise<void>;
  onMenuToggle: () => void;
}

export default function Header({ user, onLogout, onMenuToggle }: HeaderProps) {
  const location = useLocation();

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return '儀表板';
    if (path === '/admin/hero') return '首頁橫幅設定';
    if (path === '/admin/menu') return '導覽選單設定';
    if (path === '/admin/services') return '服務項目設定';
    if (path === '/admin/about') return '關於我們設定';
    if (path === '/admin/faq') return '常見問題設定';
    if (path === '/admin/knowledge') return '徵信知識設定';
    if (path === '/admin/process') return '服務流程設定';
    if (path === '/admin/footer') return '頁尾資訊設定';
    if (path === '/admin/media') return '媒體庫管理';
    if (path === '/admin/settings') return '網站設定';
    if (path === '/admin/pages') return '頁面管理';
    return '管理後台';
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await onLogout();
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div>
          <h1 className="admin-header-title">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="admin-header-actions">
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontWeight: '500' }}>{user?.username || '管理員'}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              登入時間: {user?.loginTime ? new Date(user.loginTime).toLocaleDateString('zh-TW') : '-'}
            </div>
          </div>
        </div>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          登出
        </button>
      </div>
    </header>
  );
}
