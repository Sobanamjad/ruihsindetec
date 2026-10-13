import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function HeroEditor() {
  const { content, saveSection, isLoading } = useContent();

  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    badges: ['', '', '', ''],
    buttons: [
      { label: '', href: '', variant: 'primary' },
      { label: '', href: '', variant: 'secondary' },
    ],
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing content
  useEffect(() => {
    if (content?.hero) {
      setFormData({
        tag: content.hero.tag || '',
        title: content.hero.title || '',
        subtitle: content.hero.subtitle || '',
        description: content.hero.description || '',
        image: content.hero.image || '',
        badges: content.hero.badges || ['', '', '', ''],
        buttons: content.hero.buttons || [
          { label: '', href: '', variant: 'primary' },
          { label: '', href: '', variant: 'secondary' },
        ],
      });
    }
  }, [content]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBadgeChange = (index: number, value: string) => {
    const newBadges = [...formData.badges];
    newBadges[index] = value;
    setFormData(prev => ({ ...prev, badges: newBadges }));
  };

  const handleButtonChange = (index: number, field: 'label' | 'href', value: string) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setFormData(prev => ({ ...prev, buttons: newButtons }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('hero', formData);

      if (result.success) {
        setMessage({ type: 'success', text: '首頁橫幅已儲存成功！' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '儲存失敗，請稍後再試' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('確定要還原為預設值嗎？這會覆蓋目前的設定。')) {
      const defaultHero = {
        tag: '專業資訊調查與風險評估',
        title: '瑞信徵信社｜專業調查、合法程序、重視保密',
        subtitle: '專業調查｜合法程序｜重視保密',
        description: '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。',
        image: '/hero.png',
        badges: ['專業分析', '合法程序', '客觀評估', '資訊保密'],
        buttons: [
          { label: '立即諮詢', href: '#contact', variant: 'primary' },
          { label: '了解服務', href: '#services', variant: 'secondary' },
        ],
      };

      setFormData(defaultHero);
      setMessage({ type: 'success', text: '已還原為預設值' });
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">首頁橫幅編輯</h2>
            <p className="admin-card-subtitle">
              編輯網站首頁的主要橫幅區域
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              還原預設
            </button>
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
            <label className="admin-form-label">標籤文字</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              placeholder="例如：專業資訊調查與風險評估"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">主標題</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例如：瑞信徵信社｜專業調查、合法程序、重視保密"
              rows={2}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">副標題</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="例如：專業調查｜合法程序｜重視保密"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">描述文字</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="簡介文字..."
              rows={4}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">橫幅圖片 URL</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="/hero.png"
            />
            {formData.image && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">特色標籤 (最多4個)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {formData.badges.map((badge, index) => (
                <input
                  key={index}
                  type="text"
                  className="admin-form-control"
                  value={badge}
                  onChange={(e) => handleBadgeChange(index, e.target.value)}
                  placeholder={`標籤 ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">按鈕設定</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {formData.buttons.map((button, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                  <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                    <label className="admin-form-label" style={{ fontSize: '12px' }}>
                      按鈕 {index + 1} 文字
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={button.label}
                      onChange={(e) => handleButtonChange(index, 'label', e.target.value)}
                      placeholder="按鈕文字"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontSize: '12px' }}>
                      按鈕 {index + 1} 連結
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={button.href}
                      onChange={(e) => handleButtonChange(index, 'href', e.target.value)}
                      placeholder="#section-id 或 URL"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              還原預設
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSaving || isLoading}
            >
              {isSaving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
