import { NavLink } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navItems = [
    {
      section: '主控台',
      items: [
        { label: '儀表板', path: '/dashboard' },
      ]
    },
    {
      section: '網站內容',
      items: [
        { label: '首頁橫幅', path: '/hero' },
        { label: '導覽選單', path: '/menu' },
        { label: '服務項目', path: '/services' },
        { label: '關於我們', path: '/about' },
        { label: '常見問題', path: '/faq' },
        { label: '徵信知識', path: '/knowledge' },
        { label: '服務流程', path: '/process' },
        { label: '頁尾資訊', path: '/footer' },
      ]
    },
    {
      section: '媒體與設定',
      items: [
        { label: '頁面管理', path: '/pages' },
        { label: '媒體庫', path: '/media' },
        { label: '網站設定', path: '/settings' },
      ]
    }
  ];

  return (
    <>
      <div className={`admin-sidebar ${open ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">瑞信徵信社</div>
          <div className="admin-sidebar-subtitle">管理後台</div>
        </div>

        <nav className="admin-nav">
          {navItems.map((section) => (
            <div key={section.section} className="admin-nav-section">
              <div className="admin-nav-section-title">{section.section}</div>
              <ul className="admin-nav-list">
                {section.items.map((item) => (
                  <li key={item.path} className="admin-nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `admin-nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={onClose}
                    >
                      <span className="admin-nav-text">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer" style={{ padding: '16px', marginTop: 'auto' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} 瑞信徵信社
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
        />
      )}
    </>
  );
}
