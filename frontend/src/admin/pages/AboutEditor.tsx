import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function AboutEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    paragraphs: [''],
    quote: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.about) {
      setFormData({
        tag: content.about.tag || '',
        title: content.about.title || '',
        paragraphs: content.about.paragraphs || [''],
        quote: content.about.quote || '',
      });
    }
  }, [content]);

  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...formData.paragraphs];
    newParagraphs[index] = value;
    setFormData({ ...formData, paragraphs: newParagraphs });
  };

  const handleAddParagraph = () => {
    setFormData({ ...formData, paragraphs: [...formData.paragraphs, ''] });
  };

  const handleRemoveParagraph = (index: number) => {
    setFormData({ ...formData, paragraphs: formData.paragraphs.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('about', formData);

      if (result.success) {
        setMessage({ type: 'success', text: '關於我們已儲存成功！' });
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
            <h2 className="admin-card-title">關於我們編輯</h2>
            <p className="admin-card-subtitle">編輯關於我們頁面的內容</p>
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
            <label className="admin-form-label">段落內容</label>
            {formData.paragraphs.map((para, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <textarea
                  className="admin-form-control admin-form-textarea"
                  value={para}
                  onChange={(e) => handleParagraphChange(index, e.target.value)}
                  rows={3}
                  placeholder={`段落 ${index + 1}`}
                />
                {formData.paragraphs.length > 1 && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => handleRemoveParagraph(index)}
                    style={{ marginTop: '8px' }}
                  >
                    刪除此段落
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleAddParagraph}
              style={{ marginTop: '8px' }}
            >
              + 新增段落
            </button>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">引用語句</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              rows={2}
              placeholder="例如：真相，是每一次正確決策的開始。"
            />
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
