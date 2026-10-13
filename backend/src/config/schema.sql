-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(50) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Note: In production, generate this hash properly using bcrypt
INSERT INTO users (username, password_hash)
VALUES ('admin', '$2b$10$rOzJdQZQZQZQZQZQZQZQZuQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ')
ON CONFLICT (username) DO NOTHING;

-- Insert default content
INSERT INTO site_content (section, content)
VALUES
  ('hero', '{"tag":"專業資訊調查與風險評估","title":"瑞信徵信社｜專業調查、合法程序、重視保密","subtitle":"專業調查｜合法程序｜重視保密","description":"面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。","image":"/hero.png","badges":["專業分析","合法程序","客觀評估","資訊保密"],"buttons":[{"label":"立即諮詢","href":"#contact","variant":"primary"},{"label":"了解服務","href":"#services","variant":"secondary"}]}'),
  ('menu', '{"items":[{"label":"首頁","href":"/"},{"label":"服務項目","href":"/#services"},{"label":"關於我們","href":"/#about"},{"label":"常見問題","href":"/#faq"},{"label":"聯絡我們","href":"/#contact"}]}'),
  ('services', '{"tag":"服務項目","title":"專業徵信服務","description":"提供全方位的徵信調查服務，協助您掌握真相","cards":[]}')
ON CONFLICT (section) DO NOTHING;
