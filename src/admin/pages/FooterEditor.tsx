import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function FooterEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    logo: '',
    description: '',
    disclaimer: '',
    copyright: '',
  });
  const [navItems, setNavItems] = useState<Array<{ label: string; href: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.footer) {
      setFormData({
        logo: content.footer.logo || '',
        description: content.footer.description || '',
        disclaimer: content.footer.disclaimer || '',
        copyright: content.footer.copyright || '',
      });
      setNavItems(content.footer.nav_items || []);
    }
  }, [content]);

  const handleAddNavItem = () => {
    setNavItems([...navItems, { label: '', href: '' }]);
  };

  const handleRemoveNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  const handleNavItemChange = (index: number, field: 'label' | 'href', value: string) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setNavItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('footer', {
        ...formData,
        nav_items: navItems,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '頁尾資訊已儲存成功！' });
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
            <h2 className="admin-card-title">頁尾資訊編輯</h2>
            <p className="admin-card-subtitle">管理網站頁尾內容</p>
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
          <div className="admin-form-group">
            <label className="admin-form-label">Logo 文字</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">描述</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="admin-form-label">頁尾導覽</label>
            {navItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="admin-form-control"
                  style={{ flex: 1 }}
                  value={item.label}
                  onChange={(e) => handleNavItemChange(index, 'label', e.target.value)}
                  placeholder="顯示文字"
                />
                <input
                  type="text"
                  className="admin-form-control"
                  style={{ flex: 1 }}
                  value={item.href}
                  onChange={(e) => handleNavItemChange(index, 'href', e.target.value)}
                  placeholder="#section-id"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-danger"
                  onClick={() => handleRemoveNavItem(index)}
                >
                  刪除
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleAddNavItem}
            >
              + 新增導覽項目
            </button>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">免責聲明</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.disclaimer}
              onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
              rows={2}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">版權資訊</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.copyright}
              onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
            />
          </div>

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
