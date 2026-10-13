import { useState } from 'react';
import { useAuth } from '../services/auth';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-container">
      <div className={`admin-layout ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <Header
            user={user}
            onLogout={logout}
            onMenuToggle={toggleSidebar}
          />
          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
