import { type ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './auth';
import type { ContentData } from '../../publicContent';
import { defaultContent } from '../../publicContent';

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
      const storedContent = localStorage.getItem('site_content');
      if (storedContent) {
        setContent(JSON.parse(storedContent));
      } else {
        setContent(defaultContent);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      setError('載入內容失敗');
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
      const currentContent = content || defaultContent;
      const updatedContent = { ...currentContent, [section]: data };

      localStorage.setItem('site_content', JSON.stringify(updatedContent));
      setContent(updatedContent);
      // Dispatch event to notify main app
      window.dispatchEvent(new Event('local-storage-updated'));
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
      const currentContent = content || defaultContent;
      const defaultSection = defaultContent[section];
      const updatedContent = { ...currentContent, [section]: defaultSection };

      localStorage.setItem('site_content', JSON.stringify(updatedContent));
      setContent(updatedContent);
      // Dispatch event to notify main app
      window.dispatchEvent(new Event('local-storage-updated'));
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
      const storedContent = localStorage.getItem('site_content');
      if (storedContent) {
        return JSON.parse(storedContent);
      }
      return defaultContent;
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
