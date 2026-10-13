import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './admin.css';

import { useAuth, AuthProvider } from './services/auth';
import { ContentProvider } from './services/content';

// Admin pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HeroEditor from './pages/HeroEditor';
import MenuEditor from './pages/MenuEditor';
import ServicesEditor from './pages/ServicesEditor';
import AboutEditor from './pages/AboutEditor';
import FAQEditor from './pages/FAQEditor';
import KnowledgeEditor from './pages/KnowledgeEditor';
import ProcessEditor from './pages/ProcessEditor';
import FooterEditor from './pages/FooterEditor';
import PageEditor from './pages/PageEditor';

// Layout components
import AdminLayout from './components/AdminLayout';

// Protected route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>檢查登入狀態...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

// Public route wrapper (for login)
const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>檢查登入狀態...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Main Admin App
export default function AdminApp() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Routes>
          {/* Root admin path - redirect to login or dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes (no auth required) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected routes (require auth) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hero" element={<HeroEditor />} />
            <Route path="/menu" element={<MenuEditor />} />
            <Route path="/services" element={<ServicesEditor />} />
            <Route path="/about" element={<AboutEditor />} />
            <Route path="/faq" element={<FAQEditor />} />
            <Route path="/knowledge" element={<KnowledgeEditor />} />
            <Route path="/process" element={<ProcessEditor />} />
            <Route path="/footer" element={<FooterEditor />} />
            <Route path="/pages" element={<PageEditor />} />
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ContentProvider>
    </AuthProvider>
  );
}
