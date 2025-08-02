/**
 * Navigation Context Service
 * Handles seamless navigation between admin and Studio with authentication context
 */

import { urlGenerator } from '@/lib/utils/urlGenerator';
import { jwtAuthService } from './jwtService';
import { sessionService } from './sessionService';

export interface NavigationToken {
  userId: string;
  email: string;
  role: string;
  timestamp: number;
  source: 'admin' | 'studio';
  returnUrl?: string;
}

export interface NavigationOptions {
  returnUrl?: string;
  preserveAuth?: boolean;
  openInNewTab?: boolean;
  includeToken?: boolean;
}

export class NavigationContextService {
  private static instance: NavigationContextService;
  private readonly TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static getInstance(): NavigationContextService {
    if (!NavigationContextService.instance) {
      NavigationContextService.instance = new NavigationContextService();
    }
    return NavigationContextService.instance;
  }

  /**
   * Generate navigation token for seamless transitions
   */
  generateNavigationToken(user: any, source: 'admin' | 'studio', returnUrl?: string): string {
    const token: NavigationToken = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
      source,
      returnUrl,
    };

    // Simple base64 encoding (in production, use proper JWT signing)
    return btoa(JSON.stringify(token));
  }

  /**
   * Validate navigation token
   */
  validateNavigationToken(token: string): NavigationToken | null {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (Date.now() - decoded.timestamp > this.TOKEN_EXPIRY) {
        console.warn('Navigation token expired');
        return null;
      }

      // Validate token structure
      if (!decoded.userId || !decoded.email || !decoded.role || !decoded.source) {
        console.warn('Invalid navigation token structure');
        return null;
      }

      return decoded as NavigationToken;
    } catch (error) {
      console.error('Error validating navigation token:', error);
      return null;
    }
  }

  /**
   * Navigate from Admin to Studio with authentication context
   */
  async navigateToStudio(
    studioPath: string = '',
    options: NavigationOptions = {}
  ): Promise<void> {
    try {
      const {
        returnUrl = '/admin',
        preserveAuth = true,
        openInNewTab = false,
        includeToken = true,
      } = options;

      let navigationUrl = urlGenerator.getStudioUrl(studioPath);

      if (preserveAuth && includeToken) {
        // Get current user session
        const session = await sessionService.getServerSession();
        
        if (session?.user) {
          const navToken = this.generateNavigationToken(
            session.user,
            'admin',
            returnUrl
          );

          navigationUrl = urlGenerator.getStudioNavigationUrl(studioPath, {
            token: navToken,
            returnUrl,
          });
        }
      }

      console.log(`🔄 Navigating to Studio: ${navigationUrl}`);

      if (openInNewTab) {
        window.open(navigationUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = navigationUrl;
      }
    } catch (error) {
      console.error('Error navigating to Studio:', error);
      // Fallback to basic navigation
      const fallbackUrl = urlGenerator.getStudioUrl(studioPath);
      window.location.href = fallbackUrl;
    }
  }

  /**
   * Navigate from Studio to Admin with authentication context
   */
  async navigateToAdmin(
    adminPath: string = '',
    options: NavigationOptions = {}
  ): Promise<void> {
    try {
      const {
        returnUrl = '/studio',
        preserveAuth = true,
        openInNewTab = false,
        includeToken = true,
      } = options;

      let navigationUrl = urlGenerator.getAdminUrl(adminPath);

      if (preserveAuth && includeToken) {
        // Get current user session
        const session = await sessionService.getServerSession();
        
        if (session?.user) {
          const navToken = this.generateNavigationToken(
            session.user,
            'studio',
            returnUrl
          );

          navigationUrl = urlGenerator.getAdminNavigationUrl(adminPath, {
            token: navToken,
            returnUrl,
          });
        }
      }

      console.log(`🔄 Navigating to Admin: ${navigationUrl}`);

      if (openInNewTab) {
        window.open(navigationUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = navigationUrl;
      }
    } catch (error) {
      console.error('Error navigating to Admin:', error);
      // Fallback to basic navigation
      const fallbackUrl = urlGenerator.getAdminUrl(adminPath);
      window.location.href = fallbackUrl;
    }
  }

  /**
   * Handle navigation token from URL parameters
   */
  async handleNavigationToken(token: string): Promise<{
    success: boolean;
    user?: any;
    returnUrl?: string;
    error?: string;
  }> {
    try {
      const navToken = this.validateNavigationToken(token);
      
      if (!navToken) {
        return {
          success: false,
          error: 'Invalid or expired navigation token',
        };
      }

      // Verify user session is still valid
      const session = await sessionService.getServerSession();
      
      if (!session?.user || session.user.id !== navToken.userId) {
        return {
          success: false,
          error: 'Session mismatch - please log in again',
        };
      }

      console.log(`✅ Navigation token validated for user: ${navToken.email}`);

      return {
        success: true,
        user: session.user,
        returnUrl: navToken.returnUrl,
      };
    } catch (error) {
      console.error('Error handling navigation token:', error);
      return {
        success: false,
        error: 'Failed to process navigation token',
      };
    }
  }

  /**
   * Create seamless edit link for specific documents
   */
  createEditLink(
    documentId: string,
    documentType: string,
    options: NavigationOptions = {}
  ): string {
    const { returnUrl = '/admin', includeToken = true } = options;

    if (includeToken) {
      // This would need to be called from a component with access to user session
      return urlGenerator.getEditUrl(documentId, documentType);
    }

    return urlGenerator.getEditUrl(documentId, documentType);
  }

  /**
   * Create seamless create link for new documents
   */
  createCreateLink(
    documentType: string,
    options: NavigationOptions = {}
  ): string {
    const { returnUrl = '/admin' } = options;
    return urlGenerator.getCreateUrl(documentType);
  }

  /**
   * Get navigation breadcrumbs
   */
  getNavigationBreadcrumbs(currentPath: string): Array<{
    label: string;
    href: string;
    active: boolean;
  }> {
    const breadcrumbs = [];

    if (currentPath.startsWith('/admin')) {
      breadcrumbs.push({
        label: 'Admin Dashboard',
        href: '/admin',
        active: currentPath === '/admin',
      });

      if (currentPath.startsWith('/admin/posts')) {
        breadcrumbs.push({
          label: 'Posts',
          href: '/admin/posts',
          active: currentPath === '/admin/posts',
        });
      } else if (currentPath.startsWith('/admin/analytics')) {
        breadcrumbs.push({
          label: 'Analytics',
          href: '/admin/analytics',
          active: currentPath === '/admin/analytics',
        });
      }
    } else if (currentPath.startsWith('/studio')) {
      breadcrumbs.push({
        label: 'Sanity Studio',
        href: '/studio',
        active: currentPath === '/studio',
      });

      if (currentPath.includes('/desk/post')) {
        breadcrumbs.push({
          label: 'Posts',
          href: urlGenerator.getListUrl('post'),
          active: false,
        });
      }
    }

    return breadcrumbs;
  }

  /**
   * Check if current environment supports seamless navigation
   */
  supportsSeamlessNavigation(): boolean {
    const config = urlGenerator.getConfigSummary();
    
    // Seamless navigation works best when both admin and studio are on same domain
    return !config.isLocalhost || config.environment === 'development';
  }

  /**
   * Get navigation status for debugging
   */
  getNavigationStatus(): {
    supportsSeamless: boolean;
    currentDomain: string;
    studioUrl: string;
    adminUrl: string;
    environment: string;
  } {
    const config = urlGenerator.getConfigSummary();
    
    return {
      supportsSeamless: this.supportsSeamlessNavigation(),
      currentDomain: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      studioUrl: config.studioUrl,
      adminUrl: config.adminUrl,
      environment: config.environment,
    };
  }

  /**
   * Clear navigation context (on logout)
   */
  clearNavigationContext(): void {
    // Clear any stored navigation tokens or context
    if (typeof window !== 'undefined') {
      // Remove navigation-related items from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('nav_') || key.includes('navigation')) {
          localStorage.removeItem(key);
        }
      });
    }

    console.log('🧹 Navigation context cleared');
  }

  /**
   * Handle cross-system logout
   */
  async handleCrossSystemLogout(): Promise<void> {
    try {
      // Clear navigation context
      this.clearNavigationContext();

      // Clear session
      await sessionService.clearSession(new Response());

      // Redirect to login
      const loginUrl = urlGenerator.getNavigationUrl('/login');
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error handling cross-system logout:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
  }
}

// Export singleton instance
export const navigationContextService = NavigationContextService.getInstance();