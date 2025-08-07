/**
 * Studio Navigation Manager
 * Handles seamless navigation between admin dashboard and Sanity Studio
 */

export interface NavigationOptions {
  studioPath?: string;
  returnUrl?: string;
  preserveSession?: boolean;
  openInNewTab?: boolean;
  token?: string;
}

export interface NavigationResult {
  success: boolean;
  url: string;
  method: 'redirect' | 'window_open' | 'location_replace';
  error?: string;
}

export interface SessionPreservationData {
  timestamp: number;
  returnUrl: string;
  userAgent: string;
  sessionId: string;
}

export class StudioNavigationManager {
  private static readonly SESSION_STORAGE_KEY = 'studio_navigation_session';
  private static readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Navigate to Sanity Studio with session preservation
   */
  static navigateToStudio(options: NavigationOptions = {}): NavigationResult {
    const {
      studioPath = '',
      returnUrl = '/admin',
      preserveSession = true,
      openInNewTab = false,
      token,
    } = options;

    try {
      // Build studio URL
      const baseUrl = this.getStudioBaseUrl();
      const fullPath = studioPath.startsWith('/') ? studioPath : `/${studioPath}`;
      let studioUrl = `${baseUrl}${fullPath}`;

      // Add query parameters if needed
      const params = new URLSearchParams();
      
      if (token) {
        params.set('token', token);
      }
      
      if (returnUrl) {
        params.set('return', returnUrl);
      }

      if (params.toString()) {
        studioUrl += `?${params.toString()}`;
      }

      // Preserve session data if requested
      if (preserveSession && typeof window !== 'undefined') {
        this.preserveNavigationSession({
          timestamp: Date.now(),
          returnUrl,
          userAgent: navigator.userAgent,
          sessionId: this.generateSessionId(),
        });
      }

      // Determine navigation method
      if (openInNewTab) {
        if (typeof window !== 'undefined') {
          window.open(studioUrl, '_blank', 'noopener,noreferrer');
        }
        return {
          success: true,
          url: studioUrl,
          method: 'window_open',
        };
      } else {
        // Navigate in same tab
        if (typeof window !== 'undefined') {
          window.location.href = studioUrl;
        }
        return {
          success: true,
          url: studioUrl,
          method: 'location_replace',
        };
      }
    } catch (error) {
      return {
        success: false,
        url: '',
        method: 'redirect',
        error: error instanceof Error ? error.message : 'Navigation failed',
      };
    }
  }

  /**
   * Navigate back to admin from studio
   */
  static navigateToAdmin(adminPath: string = ''): NavigationResult {
    try {
      // Get preserved session data
      const sessionData = this.getPreservedSession();
      
      // Build admin URL
      const baseUrl = this.getAdminBaseUrl();
      const fullPath = adminPath.startsWith('/') ? adminPath : `/${adminPath}`;
      let adminUrl = `${baseUrl}${fullPath}`;

      // Use return URL from session if available
      if (sessionData && sessionData.returnUrl && !adminPath) {
        adminUrl = sessionData.returnUrl;
      }

      // Navigate
      if (typeof window !== 'undefined') {
        window.location.href = adminUrl;
      }

      // Clear session data
      this.clearNavigationSession();

      return {
        success: true,
        url: adminUrl,
        method: 'location_replace',
      };
    } catch (error) {
      return {
        success: false,
        url: '',
        method: 'redirect',
        error: error instanceof Error ? error.message : 'Navigation failed',
      };
    }
  }

  /**
   * Check if user is coming from admin dashboard
   */
  static isNavigatingFromAdmin(): boolean {
    if (typeof window === 'undefined') return false;

    const sessionData = this.getPreservedSession();
    if (!sessionData) return false;

    // Check if session is still valid (not expired)
    const isExpired = Date.now() - sessionData.timestamp > this.SESSION_TIMEOUT;
    if (isExpired) {
      this.clearNavigationSession();
      return false;
    }

    return true;
  }

  /**
   * Get studio navigation context
   */
  static getNavigationContext(): {
    isFromAdmin: boolean;
    returnUrl?: string;
    sessionAge?: number;
  } {
    const sessionData = this.getPreservedSession();
    
    if (!sessionData) {
      return { isFromAdmin: false };
    }

    const sessionAge = Date.now() - sessionData.timestamp;
    const isExpired = sessionAge > this.SESSION_TIMEOUT;

    if (isExpired) {
      this.clearNavigationSession();
      return { isFromAdmin: false };
    }

    return {
      isFromAdmin: true,
      returnUrl: sessionData.returnUrl,
      sessionAge,
    };
  }

  /**
   * Generate studio URL with proper configuration
   */
  static generateStudioUrl(path: string = '', params: Record<string, string> = {}): string {
    const baseUrl = this.getStudioBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    
    return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Generate admin URL with proper configuration
   */
  static generateAdminUrl(path: string = '', params: Record<string, string> = {}): string {
    const baseUrl = this.getAdminBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    
    return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Handle authentication errors during navigation
   */
  static handleAuthenticationError(error: string): NavigationResult {
    console.error('Studio navigation authentication error:', error);
    
    // Clear any existing session data
    this.clearNavigationSession();
    
    // Redirect to login or show error
    const loginUrl = this.generateAdminUrl('/login', {
      error: 'auth_failed',
      message: error,
      redirect: '/admin',
    });

    if (typeof window !== 'undefined') {
      window.location.href = loginUrl;
    }

    return {
      success: false,
      url: loginUrl,
      method: 'redirect',
      error,
    };
  }

  /**
   * Preserve navigation session data
   */
  private static preserveNavigationSession(data: SessionPreservationData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to preserve navigation session:', error);
    }
  }

  /**
   * Get preserved navigation session data
   */
  private static getPreservedSession(): SessionPreservationData | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(this.SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to get preserved navigation session:', error);
      return null;
    }
  }

  /**
   * Clear navigation session data
   */
  private static clearNavigationSession(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear navigation session:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return crypto.randomUUID().slice(0, 15) + 
           crypto.randomUUID().slice(0, 15);
  }

  /**
   * Get studio base URL
   */
  private static getStudioBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}/studio`;
    }
    
    // Fallback for server-side
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';
    return `${siteUrl}/studio`;
  }

  /**
   * Get admin base URL
   */
  private static getAdminBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}/admin`;
    }
    
    // Fallback for server-side
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';
    return `${siteUrl}/admin`;
  }
}

// Export utility functions
export const navigateToStudio = StudioNavigationManager.navigateToStudio;
export const navigateToAdmin = StudioNavigationManager.navigateToAdmin;
export const isNavigatingFromAdmin = StudioNavigationManager.isNavigatingFromAdmin;
export const getNavigationContext = StudioNavigationManager.getNavigationContext;