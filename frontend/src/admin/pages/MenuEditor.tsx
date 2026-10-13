import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function MenuEditor() {
  const { content, saveSection, isLoading } = useContent();

  const [menuItems, setMenuItems] = useState<Array<{ label: string; href: string; variant?: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.menu?.items) {
      setMenuItems(content.menu.items);
    }
  }, [content]);

  const handleAddItem = () => {
    setMenuItems([...menuItems, { label: '', href: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'label' | 'href' | 'variant', value: string) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('menu', { items: menuItems });

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
