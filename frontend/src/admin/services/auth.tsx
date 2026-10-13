import { type ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { username: string; loginTime: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Simple hardcoded credentials for demo
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; loginTime: string } | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const authData = localStorage.getItem('admin_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setIsAuthenticated(true);
          setUser(parsed.user);
          return true;
        } else {
          localStorage.removeItem('admin_auth');
        }
      }
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // Simple hardcoded check
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const userData = {
          username,
          loginTime: new Date().toISOString(),
        };

        // Store in localStorage with 24 hour expiry
        const authData = {
          user: userData,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        localStorage.setItem('admin_auth', JSON.stringify(authData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true, message: '登入成功' };
      } else {
        return { success: false, message: '用戶名或密碼錯誤' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: '登入失敗，請檢查網路連線' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      localStorage.removeItem('admin_auth');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
