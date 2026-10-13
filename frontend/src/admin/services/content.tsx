import { type ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './auth';
import type { ContentData } from '../../publicContent';
import { defaultContent } from '../../publicContent';

const API_BASE = 'http://localhost:5000/api';

interface ContentContextType {
  content: ContentData | null;
  isLoading: boolean;
  error: string | null;
  loadContent: () => Promise<void>;
  saveSection: (section: keyof ContentData, data: any) => Promise<{ success: boolean; message: string }>;
  resetSection: (section: keyof ContentData) => Promise<{ success: boolean; message: string }>;
  fetchPublicContent: () => Promise<ContentData | null>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider = ({ children }: ContentProviderProps) => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadContent = useCallback(async () => {
    if (!isAuthenticated) {
      setError('需要登入才能載入內容');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
      setError('載入內容失敗');
      setContent(defaultContent);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const saveSection = async (section: keyof ContentData, data: any): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) {
      return { success: false, message: '需要登入才能儲存內容' };
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/content/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      const result = await response.json();
      
      // Update local state with the saved content from server
      const currentContent = content || defaultContent;
      const updatedContent = { ...currentContent, [section]: result.content || data };
      setContent(updatedContent);
      
      // Dispatch event to notify main app
      window.dispatchEvent(new Event('content-updated'));
      
      return { success: true, message: '儲存成功' };
    } catch (error) {
      console.error('Failed to save section:', error);
      return { success: false, message: '儲存失敗' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetSection = async (section: keyof ContentData): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) {
      return { success: false, message: '需要登入才能重置內容' };
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/content/${section}/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset content');
      }

      const result = await response.json();
      
      // Update local state
      const currentContent = content || defaultContent;
      const updatedContent = { ...currentContent, [section]: result.content };
      setContent(updatedContent);
      
      // Dispatch event to notify main app
      window.dispatchEvent(new Event('content-updated'));
      
      return { success: true, message: '重置成功' };
    } catch (error) {
      console.error('Failed to reset section:', error);
      return { success: false, message: '重置失敗' };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicContent = async (): Promise<ContentData | null> => {
    try {
      const response = await fetch(`${API_BASE}/content`);
      if (!response.ok) {
        return defaultContent;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch public content:', error);
      return defaultContent;
    }
  };

  return (
    <ContentContext.Provider value={{
      content,
      isLoading,
      error,
      loadContent,
      saveSection,
      resetSection,
      fetchPublicContent
    }}>
      {children}
    </ContentContext.Provider>
  );
};
