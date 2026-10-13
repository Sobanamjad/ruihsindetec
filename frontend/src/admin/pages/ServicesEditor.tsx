import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function ServicesEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    description: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.services) {
      setFormData({
        tag: content.services.tag || '',
        title: content.services.title || '',
        description: content.services.description || '',
      });
    }
  }, [content]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('services', {
        ...formData,
        cards: content?.services?.cards || [],
      });

      if (result.success) {
        setMessage({ type: 'success', text: '服務項目已儲存成功！' });
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
            <h2 className="admin-card-title">服務項目編輯</h2>
            <p className="admin-card-subtitle">編輯服務項目的標題和描述</p>
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
            <label className="admin-form-label">標籤</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">標題</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              目前服務卡片內容為預設值。完整的服務卡片編輯功能將在下一階段開發。
            </p>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isSaving || isLoading}
            style={{ marginTop: '24px' }}
          >
            {isSaving ? '儲存中...' : '儲存變更'}
          </button>
        </form>
      </div>
    </div>
  );
}
