import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';
import { useAuth } from '../services/auth';

const API_BASE = 'http://localhost:5000/api';

export default function MenuEditor() {
  const { content, saveSection, isLoading } = useContent();
  const { isAuthenticated } = useAuth();

  const [menuItems, setMenuItems] = useState<Array<{ label: string; href: string; variant?: string; createPage?: boolean }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  useEffect(() => {
    if (content?.menu?.items) {
      setMenuItems(content.menu.items);
    }
  }, [content]);

  const generateSlug = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const createPage = async (label: string, href: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('admin_token');
      const slug = generateSlug(label);

      const response = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          title: label,
          type: 'content',
          content: {
            title: label,
            content: '',
          },
          meta_title: label,
          meta_description: '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to create page:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating page:', error);
      return false;
    }
  };

  const handleAddItem = () => {
    setMenuItems([...menuItems, { label: '', href: '', createPage: false }]);
  };

  const handleRemoveItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'label' | 'href' | 'variant' | 'createPage', value: string | boolean) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Create pages for items marked with createPage
      const itemsToProcess = menuItems.filter(item => item.createPage && item.label);
      let pageCreationSuccess = true;

      for (const item of itemsToProcess) {
        if (item.label) {
          const slug = generateSlug(item.label);
          const href = `/${slug}`;

          const pageCreated = await createPage(item.label, href);
          if (pageCreated) {
            // Update the href and remove createPage flag
            const index = menuItems.indexOf(item);
            menuItems[index] = { ...item, href, createPage: false };
          } else {
            pageCreationSuccess = false;
          }
        }
      }

      if (!pageCreationSuccess) {
        setMessage({ type: 'error', text: '部分頁面建立失敗，請檢查後重試' });
        setIsSaving(false);
        return;
      }

      // Save menu without createPage flags
      const menuItemsToSave = menuItems.map(({ createPage, ...item }) => item);
      const result = await saveSection('menu', { items: menuItemsToSave });

      if (result.success) {
        setMessage({ type: 'success', text: '選單已儲存成功！' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '儲存失敗' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">導覽選單編輯</h2>
            <p className="admin-card-subtitle">
              管理網站的主要導覽選單
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSubmit}
              disabled={isSaving || isLoading}
            >
              {isSaving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`admin-alert admin-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          {menuItems.map((item, index) => (
            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>選單項目 {index + 1}</h4>
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-danger"
                  onClick={() => handleRemoveItem(index)}
                >
                  刪除
                </button>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">顯示文字</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={item.label}
                  onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                  placeholder="例如：首頁"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">連結 (href)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={item.href}
                  onChange={(e) => handleItemChange(index, 'href', e.target.value)}
                  placeholder="#section-id 或 URL"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">按鈕樣式</label>
                <select
                  className="admin-form-control"
                  value={item.variant || ''}
                  onChange={(e) => handleItemChange(index, 'variant', e.target.value)}
                >
                  <option value="">普通連結</option>
                  <option value="primary">主要按鈕 (藍色)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={item.createPage || false}
                    onChange={(e) => handleItemChange(index, 'createPage', e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  自動建立頁面
                </label>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  勾選後會根據顯示文字自動建立新頁面並覆蓋連結欄位
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleAddItem}
            style={{ marginBottom: '24px' }}
          >
            + 新增選單項目
          </button>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isSaving || isLoading}
          >
            {isSaving ? '儲存中...' : '儲存變更'}
          </button>
        </form>
      </div>
    </div>
  );
}
