import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function FAQEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    tag: '',
    title: '',
  });
  const [items, setItems] = useState<Array<{ question: string; answer: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.faq) {
      setFormData({
        tag: content.faq.tag || '',
        title: content.faq.title || '',
      });
      setItems(content.faq.items || []);
    }
  }, [content]);

  const handleAddItem = () => {
    setItems([...items, { question: '', answer: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('faq', {
        ...formData,
        items,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '常見問題已儲存成功！' });
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
            <h2 className="admin-card-title">常見問題編輯</h2>
            <p className="admin-card-subtitle">管理網站的常見問題</p>
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

          <div style={{ marginBottom: '24px' }}>
            <label className="admin-form-label">問題列表</label>
            {items.map((item, index) => (
              <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0 }}>問題 {index + 1}</h4>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => handleRemoveItem(index)}
                  >
                    刪除
                  </button>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">問題</label>
                  <textarea
                    className="admin-form-control admin-form-textarea"
                    value={item.question}
                    onChange={(e) => handleItemChange(index, 'question', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">答案</label>
                  <textarea
                    className="admin-form-control admin-form-textarea"
                    value={item.answer}
                    onChange={(e) => handleItemChange(index, 'answer', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleAddItem}
            >
              + 新增問題
            </button>
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
