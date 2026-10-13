import { type FormEvent, useState, useEffect } from 'react';
import { useContent } from '../services/content';

export default function ProcessEditor() {
  const { content, saveSection, isLoading } = useContent();
  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    note: '',
  });
  const [steps, setSteps] = useState<Array<{ number: string; title: string; description: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content?.process) {
      setFormData({
        tag: content.process.tag || '',
        title: content.process.title || '',
        note: content.process.note || '',
      });
      setSteps(content.process.steps || []);
    }
  }, [content]);

  const handleAddStep = () => {
    const nextNumber = String(steps.length + 1).padStart(2, '0');
    setSteps([...steps, { number: nextNumber, title: '', description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      number: String(i + 1).padStart(2, '0'),
    }));
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSection('process', {
        ...formData,
        steps,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '服務流程已儲存成功！' });
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
            <h2 className="admin-card-title">服務流程編輯</h2>
            <p className="admin-card-subtitle">管理服務流程步驟</p>
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
            <label className="admin-form-label">流程步驟</label>
            {steps.map((step, index) => (
              <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0 }}>步驟 {step.number}</h4>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => handleRemoveStep(index)}
                  >
                    刪除
                  </button>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">標題</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">描述</label>
                  <textarea
                    className="admin-form-control admin-form-textarea"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleAddStep}
            >
              + 新增步驟
            </button>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">注意事項</label>
            <textarea
              className="admin-form-control admin-form-textarea"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
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
