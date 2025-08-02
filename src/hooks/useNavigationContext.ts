/**
 * React Hook for Navigation Context
 * Provides seamless navigation between admin and Studio
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { navigationContextService, NavigationOptions } from '@/lib/auth/navigationContext';
import { urlGenerator } from '@/lib/utils/urlGenerator';

export interface UseNavigationContextReturn {
  // Navigation functions
  navigateToStudio: (path?: string, options?: NavigationOptions) => Promise<void>;
  navigateToAdmin: (path?: string, options?: NavigationOptions) => Promise<void>;
  
  // Link generators
  createEditLink: (documentId: string, documentType: string) => string;
  createCreateLink: (documentType: string) => string;
  
  // Navigation state
  isNavigating: boolean;
  navigationError: string | null;
  supportsSeamless: boolean;
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href: string; active: boolean }>;
  
  // Status
  navigationStatus: any;
}

export function useNavigationContext(): UseNavigationContextReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; href: string; active: boolean }>>([]);

  // Handle navigation token from URL parameters
  useEffect(() => {
    const handleNavigationToken = async () => {
      const token = searchParams.get('token');
      const returnUrl = searchParams.get('return');

      if (token) {
        try {
          const result = await navigationContextService.handleNavigationToken(token);
          
          if (result.success) {
            console.log('✅ Navigation token processed successfully');
            
            // Clean up URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            url.searchParams.delete('return');
            
            // Replace URL without token parameters
            window.history.replaceState({}, '', url.toString());
          } else {
            console.warn('❌ Navigation token validation failed:', result.error);
            setNavigationError(result.error || 'Navigation failed');
          }
        } catch (error) {
          console.error('Error processing navigation token:', error);
          setNavigationError('Failed to process navigation');
        }
      }
    };

    handleNavigationToken();
  }, [searchParams]);

  // Update breadcrumbs based on current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const newBreadcrumbs = navigationContextService.getNavigationBreadcrumbs(currentPath);
      setBreadcrumbs(newBreadcrumbs);
    }
  }, []);

  // Navigation functions
  const navigateToStudio = useCallback(async (path?: string, options?: NavigationOptions) => {
    try {
      setIsNavigating(true);
      setNavigationError(null);
      
      await navigationContextService.navigateToStudio(path, options);
    } catch (error) {
      console.error('Navigation to Studio failed:', error);
      setNavigationError('Failed to navigate to Studio');
    } finally {
      setIsNavigating(false);
    }
  }, []);

  const navigateToAdmin = useCallback(async (path?: string, options?: NavigationOptions) => {
    try {
      setIsNavigating(true);
      setNavigationError(null);
      
      await navigationContextService.navigateToAdmin(path, options);
    } catch (error) {
      console.error('Navigation to Admin failed:', error);
      setNavigationError('Failed to navigate to Admin');
    } finally {
      setIsNavigating(false);
    }
  }, []);

  // Link generators
  const createEditLink = useCallback((documentId: string, documentType: string) => {
    return navigationContextService.createEditLink(documentId, documentType);
  }, []);

  const createCreateLink = useCallback((documentType: string) => {
    return navigationContextService.createCreateLink(documentType);
  }, []);

  // Get navigation status
  const navigationStatus = navigationContextService.getNavigationStatus();
  const supportsSeamless = navigationContextService.supportsSeamlessNavigation();

  return {
    navigateToStudio,
    navigateToAdmin,
    createEditLink,
    createCreateLink,
    isNavigating,
    navigationError,
    supportsSeamless,
    breadcrumbs,
    navigationStatus,
  };
}

// Hook for Studio-specific navigation
export function useStudioNavigation() {
  const navigation = useNavigationContext();

  const editPost = useCallback((postId: string) => {
    return navigation.navigateToStudio(`/desk/post;${postId}`, {
      returnUrl: '/admin/posts',
    });
  }, [navigation]);

  const createPost = useCallback(() => {
    return navigation.navigateToStudio('/desk/post', {
      returnUrl: '/admin/posts',
    });
  }, [navigation]);

  const editAuthor = useCallback((authorId: string) => {
    return navigation.navigateToStudio(`/desk/author;${authorId}`, {
      returnUrl: '/admin/authors',
    });
  }, [navigation]);

  const editCategory = useCallback((categoryId: string) => {
    return navigation.navigateToStudio(`/desk/category;${categoryId}`, {
      returnUrl: '/admin/categories',
    });
  }, [navigation]);

  return {
    ...navigation,
    editPost,
    createPost,
    editAuthor,
    editCategory,
  };
}

// Hook for Admin-specific navigation
export function useAdminNavigation() {
  const navigation = useNavigationContext();

  const viewPosts = useCallback(() => {
    return navigation.navigateToAdmin('/posts', {
      returnUrl: '/studio',
    });
  }, [navigation]);

  const viewAnalytics = useCallback(() => {
    return navigation.navigateToAdmin('/analytics', {
      returnUrl: '/studio',
    });
  }, [navigation]);

  const viewDashboard = useCallback(() => {
    return navigation.navigateToAdmin('/', {
      returnUrl: '/studio',
    });
  }, [navigation]);

  return {
    ...navigation,
    viewPosts,
    viewAnalytics,
    viewDashboard,
  };
}

// Hook for navigation breadcrumbs component
export function useNavigationBreadcrumbs() {
  const { breadcrumbs } = useNavigationContext();
  
  return breadcrumbs;
}