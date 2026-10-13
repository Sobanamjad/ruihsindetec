import { useState, useEffect } from 'react';
import { useAuth } from '../services/auth';

const API_BASE = 'http://localhost:5000/api';

interface Page {
  id: number;
  slug: string;
  title: string;
  type: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function PageEditor() {
  const { isAuthenticated } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: true,
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/pages/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          content: {
            title: formData.title,
            content: formData.content,
          },
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '頁面建立成功！' });
        setShowCreateForm(false);
        setFormData({
          slug: '',
          title: '',
          content: '',
          meta_title: '',
          meta_description: '',
          is_published: true,
        });
        loadPages();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '建立失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '建立失敗' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/pages/${selectedPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          content: {
            title: formData.title,
            content: formData.content,
          },
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '頁面更新成功！' });
        loadPages();
        setSelectedPage(null);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || '更新失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新失敗' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm('確定要刪除此頁面嗎？')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/pages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '頁面刪除成功！' });
        loadPages();
        if (selectedPage?.id === id) {
          setSelectedPage(null);
        }
      } else {
        setMessage({ type: 'error', text: '刪除失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '刪除失敗' });
    }
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content?.content || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
    });
  };

  const handleCancelEdit = () => {
    setSelectedPage(null);
    setFormData({
      slug: '',
      title: '',
      content: '',
      meta_title: '',
      meta_description: '',
      is_published: true,
    });
  };

  if (isLoading) {
    return <div className="admin-loading">載入中...</div>;
  }

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">頁面管理</h2>
            <p className="admin-card-subtitle">
              管理動態頁面內容
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '取消' : '+ 新增頁面'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`admin-alert admin-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {showCreateForm && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>新增頁面</h3>
            <form className="admin-form" onSubmit={handleCreatePage}>
              <div className="admin-form-group">
                <label className="admin-form-label">網址 (slug)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="例如：about-us"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">頁面標題</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="頁面標題"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">頁面內容</label>
                <textarea
                  className="admin-form-control"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  placeholder="輸入頁面內容..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Meta 標題</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO 標題"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Meta 描述</label>
                <textarea
                  className="admin-form-control"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  placeholder="SEO 描述"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  發布頁面
                </label>
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSaving}
              >
                {isSaving ? '建立中...' : '建立頁面'}
              </button>
            </form>
          </div>
        )}

        {selectedPage && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>編輯頁面: {selectedPage.title}</h3>
            <form className="admin-form" onSubmit={handleUpdatePage}>
              <div className="admin-form-group">
                <label className="admin-form-label">網址 (slug)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">頁面標題</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">頁面內容</label>
                <textarea
                  className="admin-form-control"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  placeholder="輸入頁面內容..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Meta 標題</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="SEO 標題"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Meta 描述</label>
                <textarea
                  className="admin-form-control"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  placeholder="SEO 描述"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  發布頁面
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? '更新中...' : '更新頁面'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleCancelEdit}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>所有頁面</h3>
          {pages.length === 0 ? (
            <p style={{ color: '#6b7280' }}>尚無頁面</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pages.map((page) => (
                <div
                  key={page.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{page.title}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      /{page.slug} • {page.is_published ? '已發布' : '未發布'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() => handleEditPage(page)}
                    >
                      編輯
                    </button>
                    <button
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
