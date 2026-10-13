import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('請輸入使用者名稱和密碼');
      setIsLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1 className="admin-login-logo">瑞信徵信社</h1>
          <p className="admin-login-subtitle">管理後台登入</p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="username" className="admin-form-label">
              使用者名稱
            </label>
            <input
              type="text"
              id="username"
              className="admin-form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入使用者名稱"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label">
              密碼
            </label>
            <input
              type="password"
              id="password"
              className="admin-form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isLoading}
            style={{ marginTop: '16px' }}
          >
            {isLoading ? (
              <>
                <span className="admin-loading-spinner" style={{ width: '16px', height: '16px' }} />
                登入中...
              </>
            ) : (
              '登入'
            )}
          </button>
        </form>

        <div className="admin-login-footer" style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            預設帳號: <strong>admin</strong> / 密碼: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
