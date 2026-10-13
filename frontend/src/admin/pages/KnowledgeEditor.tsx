import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function KnowledgeEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
  });
  const [cards, setCards] = useState<Array<{ title: string; description: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.knowledge) {
      setFormData({
        tag: content.knowledge.tag || '',
        title: content.knowledge.title || '',
        description: content.knowledge.description || '',
        ctaLabel: content.knowledge.cta?.label || '',
        ctaHref: content.knowledge.cta?.href || '',
      });
      setCards(content.knowledge.cards || []);
    }
  }, [content]);

  const handleAddCard = () => {
    setCards([...cards, { title: '', description: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: 'title' | 'description', value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('knowledge', {
        ...formData,
        cta: { label: formData.ctaLabel, href: formData.ctaHref },
        cards,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '徵信知識已儲存成功！' });
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
            <h2 className="admin-card-title">徵信知識編輯</h2>
            <p className="admin-card-subtitle">管理徵信知識卡片</p>
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

          <div style={{ marginBottom: '24px' }}>
            <label className="admin-form-label">知識卡片</label>
            {cards.map((card, index) => (
              <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0 }}>卡片 {index + 1}</h4>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => handleRemoveCard(index)}
                  >
                    刪除
                  </button>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">標題</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={card.title}
                    onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">描述</label>
                  <textarea
                    className="admin-form-control admin-form-textarea"
                    value={card.description}
                    onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleAddCard}
            >
              + 新增卡片
            </button>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">CTA 按鈕文字</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.ctaLabel}
              onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">CTA 連結</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.ctaHref}
              onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
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
