/**
 * Navigation Context Provider
 * Provides seamless navigation between admin and Studio with session management
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { urlGenerator } from '@/lib/utils/urlGenerator';
import { sessionPersistence, NavigationToken } from '@/lib/auth/sessionPersistence';

interface NavigationContextType {
  // Navigation methods
  navigateToStudio: (path?: string, options?: NavigationOptions) => void;
  navigateToAdmin: (path?: string, options?: NavigationOptions) => void;
  navigateToEditPost: (postId: string, options?: NavigationOptions) => void;
  
  // Navigation state
  isNavigating: boolean;
  lastNavigationError: string | null;
  navigationHistory: NavigationHistoryItem[];
  
  // Configuration
  urlConfig: any;
  refreshUrlConfig: () => void;
  
  // Token management
  createNavigationToken: (source: 'admin' | 'studio', returnUrl?: string) => string;
  consumeNavigationToken: () => NavigationToken | null;
  
  // Navigation validation
  canNavigateToStudio: boolean;
  canNavigateToAdmin: boolean;
}

interface NavigationOptions {
  newTab?: boolean;
  returnUrl?: string;
  preserveAuth?: boolean;
  validateAccess?: boolean;
}

interface NavigationHistoryItem {
  timestamp: number;
  source: 'admin' | 'studio';
  destination: 'admin' | 'studio';
  path: string;
  success: boolean;
  error?: string;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: NavigationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastNavigationError, setLastNavigationError] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const [urlConfig, setUrlConfig] = useState<any>(null);

  // Initialize URL configuration
  useEffect(() => {
    refreshUrlConfig();
  }, []);

  // Check for navigation tokens on mount
  useEffect(() => {
    const token = sessionPersistence.consumeNavigationToken();
    if (token) {
      console.log(`🎯 Navigation token consumed from ${token.source}:`, token);
      
      // Handle return URL if specified
      if (token.returnUrl) {
        window.history.replaceState({}, '', token.returnUrl);
      }
    }
  }, []);

  const refreshUrlConfig = useCallback(() => {
    const config = urlGenerator.getConfigSummary();
    const validation = urlGenerator.validateConfiguration();
    setUrlConfig({ ...config, validation });
  }, []);

  const addToNavigationHistory = useCallback((item: Omit<NavigationHistoryItem, 'timestamp'>) => {
    const historyItem: NavigationHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };
    
    setNavigationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
  }, []);

  const validateNavigation = useCallback((destination: 'admin' | 'studio'): boolean => {
    if (!isAuthenticated || !user) {
      setLastNavigationError('Authentication required for navigation');
      return false;
    }

    if (destination === 'studio' && !urlConfig?.validation?.isValid) {
      setLastNavigationError('Studio URL configuration is invalid');
      return false;
    }

    return true;
  }, [isAuthenticated, user, urlConfig]);

  const navigateToStudio = useCallback(async (path: string = '', options: NavigationOptions = {}) => {
    const { newTab = true, returnUrl, preserveAuth = true, validateAccess = true } = options;
    
    if (validateAccess && !validateNavigation('studio')) {
      return;
    }

    setIsNavigating(true);
    setLastNavigationError(null);

    try {
      let studioUrl = urlGenerator.getStudioNavigationUrl(path);
      
      // Add navigation parameters
      const params = new URLSearchParams();
      
      if (preserveAuth && user) {
        // Create navigation token for seamless auth
        const token = sessionPersistence.createNavigationToken(user, 'admin', returnUrl);
        if (token) {
          params.set('nav_token', token);
        }
        
        params.set('user', user.email);
        params.set('role', user.role);
      }
      
      if (returnUrl) {
        params.set('return', returnUrl);
      }
      
      if (params.toString()) {
        studioUrl += `${studioUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      }
      
      // Test accessibility for production URLs
      if (!urlGenerator.isLocalhostUrl(studioUrl)) {
        try {
          await fetch(studioUrl, { method: 'HEAD', mode: 'no-cors' });
        } catch (error) {
          console.warn('Studio URL accessibility test failed:', error);
        }
      }
      
      // Navigate
      if (newTab) {
        window.open(studioUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = studioUrl;
      }
      
      addToNavigationHistory({
        source: 'admin',
        destination: 'studio',
        path,
        success: true,
      });
      
      console.log(`🎯 Navigated to Studio: ${studioUrl}`);
    } catch (error) {
      const errorMessage = `Failed to navigate to Studio: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setLastNavigationError(errorMessage);
      
      addToNavigationHistory({
        source: 'admin',
        destination: 'studio',
        path,
        success: false,
        error: errorMessage,
      });
      
      console.error('Studio navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [user, validateNavigation, addToNavigationHistory]);

  const navigateToAdmin = useCallback(async (path: string = '', options: NavigationOptions = {}) => {
    const { newTab = false, returnUrl, preserveAuth = true, validateAccess = true } = options;
    
    if (validateAccess && !validateNavigation('admin')) {
      return;
    }

    setIsNavigating(true);
    setLastNavigationError(null);

    try {
      let adminUrl = urlGenerator.getAdminUrl(path);
      
      // Add navigation parameters
      const params = new URLSearchParams();
      
      if (preserveAuth && user) {
        // Create navigation token for seamless auth
        const token = sessionPersistence.createNavigationToken(user, 'studio', returnUrl);
        if (token) {
          params.set('nav_token', token);
        }
        
        params.set('user', user.email);
        params.set('role', user.role);
      }
      
      if (returnUrl) {
        params.set('return', returnUrl);
      }
      
      if (params.toString()) {
        adminUrl += `${adminUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      }
      
      // Navigate
      if (newTab) {
        window.open(adminUrl, '_blank', 'noopener,noreferrer');
      } else {
        if (path) {
          // Use Next.js router for internal navigation
          const { useRouter } = await import('next/navigation');
          // Note: This is a simplified approach - in practice, you'd want to use the router from a hook
          window.location.href = `/admin${path}`;
        } else {
          window.location.href = '/admin';
        }
      }
      
      addToNavigationHistory({
        source: 'studio',
        destination: 'admin',
        path,
        success: true,
      });
      
      console.log(`🎯 Navigated to Admin: ${adminUrl}`);
    } catch (error) {
      const errorMessage = `Failed to navigate to Admin: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setLastNavigationError(errorMessage);
      
      addToNavigationHistory({
        source: 'studio',
        destination: 'admin',
        path,
        success: false,
        error: errorMessage,
      });
      
      console.error('Admin navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [user, validateNavigation, addToNavigationHistory]);

  const navigateToEditPost = useCallback((postId: string, options: NavigationOptions = {}) => {
    const { newTab = true } = options;
    
    if (!validateNavigation('studio')) {
      return;
    }

    try {
      const editUrl = urlGenerator.getEditUrl(postId, 'post');
      
      if (newTab) {
        window.open(editUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = editUrl;
      }
      
      addToNavigationHistory({
        source: 'admin',
        destination: 'studio',
        path: `/desk/post;${postId}`,
        success: true,
      });
      
      console.log(`🎯 Navigated to edit post: ${editUrl}`);
    } catch (error) {
      const errorMessage = `Failed to navigate to edit post: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setLastNavigationError(errorMessage);
      
      addToNavigationHistory({
        source: 'admin',
        destination: 'studio',
        path: `/desk/post;${postId}`,
        success: false,
        error: errorMessage,
      });
      
      console.error('Edit post navigation error:', error);
    }
  }, [validateNavigation, addToNavigationHistory]);

  const createNavigationToken = useCallback((source: 'admin' | 'studio', returnUrl?: string): string => {
    if (!user) {
      console.warn('Cannot create navigation token: user not authenticated');
      return '';
    }
    
    return sessionPersistence.createNavigationToken(user, source, returnUrl);
  }, [user]);

  const consumeNavigationToken = useCallback((): NavigationToken | null => {
    return sessionPersistence.consumeNavigationToken();
  }, []);

  const canNavigateToStudio = isAuthenticated && urlConfig?.validation?.isValid;
  const canNavigateToAdmin = isAuthenticated;

  const value: NavigationContextType = {
    navigateToStudio,
    navigateToAdmin,
    navigateToEditPost,
    isNavigating,
    lastNavigationError,
    navigationHistory,
    urlConfig,
    refreshUrlConfig,
    createNavigationToken,
    consumeNavigationToken,
    canNavigateToStudio,
    canNavigateToAdmin,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Hook for navigation status
export function useNavigationStatus() {
  const { 
    isNavigating, 
    lastNavigationError, 
    navigationHistory, 
    canNavigateToStudio, 
    canNavigateToAdmin 
  } = useNavigation();
  
  const lastNavigation = navigationHistory[0] || null;
  const successfulNavigations = navigationHistory.filter(item => item.success).length;
  const failedNavigations = navigationHistory.filter(item => !item.success).length;
  
  return {
    isNavigating,
    hasError: !!lastNavigationError,
    errorMessage: lastNavigationError,
    lastNavigation,
    successfulNavigations,
    failedNavigations,
    canNavigateToStudio,
    canNavigateToAdmin,
    navigationHistory: navigationHistory.slice(0, 5), // Last 5 items
  };
}

// Hook for quick navigation actions
export function useQuickNavigation() {
  const { navigateToStudio, navigateToAdmin, navigateToEditPost, canNavigateToStudio, canNavigateToAdmin } = useNavigation();
  
  return {
    // Studio navigation
    toStudioPosts: () => canNavigateToStudio && navigateToStudio('/desk/post'),
    toStudioNewPost: () => canNavigateToStudio && navigateToStudio('/desk/post;new'),
    toStudioCategories: () => canNavigateToStudio && navigateToStudio('/desk/category'),
    toStudioAuthors: () => canNavigateToStudio && navigateToStudio('/desk/author'),
    toStudioSettings: () => canNavigateToStudio && navigateToStudio('/desk/settings'),
    
    // Admin navigation
    toAdminDashboard: () => canNavigateToAdmin && navigateToAdmin(),
    toAdminContent: () => canNavigateToAdmin && navigateToAdmin('/content'),
    toAdminAnalytics: () => canNavigateToAdmin && navigateToAdmin('/analytics'),
    toAdminSettings: () => canNavigateToAdmin && navigateToAdmin('/settings'),
    
    // Quick actions
    editPost: (postId: string) => canNavigateToStudio && navigateToEditPost(postId),
    
    // Capabilities
    canNavigateToStudio,
    canNavigateToAdmin,
  };
}