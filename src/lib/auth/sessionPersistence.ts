/**
 * Session Persistence Utility
 * Handles session persistence and automatic session refresh
 */

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresAt: number;
  lastActive: number;
}

export interface NavigationToken {
  userId: string;
  email: string;
  role: string;
  timestamp: number;
  returnUrl?: string;
  source: 'admin' | 'studio';
}

export class SessionPersistence {
  private static instance: SessionPersistence;
  private readonly SESSION_KEY = 'admin_session_data';
  private readonly NAV_TOKEN_KEY = 'admin_nav_token';
  private readonly STORAGE_PREFIX = 'atc_admin_';

  static getInstance(): SessionPersistence {
    if (!SessionPersistence.instance) {
      SessionPersistence.instance = new SessionPersistence();
    }
    return SessionPersistence.instance;
  }

  /**
   * Store session data in localStorage
   */
  storeSession(sessionData: SessionData): void {
    try {
      const data = {
        ...sessionData,
        lastActive: Date.now(),
      };
      
      localStorage.setItem(
        this.STORAGE_PREFIX + this.SESSION_KEY,
        JSON.stringify(data)
      );
      
      console.log('📦 Session data stored locally');
    } catch (error) {
      console.error('Failed to store session data:', error);
    }
  }

  /**
   * Retrieve session data from localStorage
   */
  getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + this.SESSION_KEY);
      if (!stored) return null;
      
      const sessionData: SessionData = JSON.parse(stored);
      
      // Check if session is expired
      if (Date.now() >= sessionData.expiresAt) {
        this.clearStoredSession();
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error('Failed to retrieve session data:', error);
      this.clearStoredSession();
      return null;
    }
  }

  /**
   * Clear stored session data
   */
  clearStoredSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + this.SESSION_KEY);
      localStorage.removeItem(this.STORAGE_PREFIX + this.NAV_TOKEN_KEY);
      console.log('🗑️ Session data cleared from storage');
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }
  }

  /**
   * Update last active timestamp
   */
  updateLastActive(): void {
    const session = this.getStoredSession();
    if (session) {
      session.lastActive = Date.now();
      this.storeSession(session);
    }
  }

  /**
   * Check if session needs refresh (expires in less than 5 minutes)
   */
  needsRefresh(): boolean {
    const session = this.getStoredSession();
    if (!session) return false;
    
    const fiveMinutes = 5 * 60 * 1000;
    return (session.expiresAt - Date.now()) < fiveMinutes;
  }

  /**
   * Create navigation token for seamless transitions
   */
  createNavigationToken(user: SessionData['user'], source: 'admin' | 'studio', returnUrl?: string): string {
    const token: NavigationToken = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
      returnUrl,
      source,
    };
    
    try {
      const tokenString = btoa(JSON.stringify(token));
      
      // Store token temporarily (5 minutes)
      setTimeout(() => {
        this.clearNavigationToken();
      }, 5 * 60 * 1000);
      
      localStorage.setItem(
        this.STORAGE_PREFIX + this.NAV_TOKEN_KEY,
        tokenString
      );
      
      return tokenString;
    } catch (error) {
      console.error('Failed to create navigation token:', error);
      return '';
    }
  }

  /**
   * Validate and consume navigation token
   */
  consumeNavigationToken(): NavigationToken | null {
    try {
      const tokenString = localStorage.getItem(this.STORAGE_PREFIX + this.NAV_TOKEN_KEY);
      if (!tokenString) return null;
      
      const token: NavigationToken = JSON.parse(atob(tokenString));
      
      // Check if token is expired (5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - token.timestamp > fiveMinutes) {
        this.clearNavigationToken();
        return null;
      }
      
      // Clear token after consumption
      this.clearNavigationToken();
      
      return token;
    } catch (error) {
      console.error('Failed to consume navigation token:', error);
      this.clearNavigationToken();
      return null;
    }
  }

  /**
   * Clear navigation token
   */
  clearNavigationToken(): void {
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + this.NAV_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear navigation token:', error);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    hasStoredSession: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    timeUntilExpiry: number;
    lastActive: number;
  } {
    const session = this.getStoredSession();
    
    if (!session) {
      return {
        hasStoredSession: false,
        isExpired: true,
        needsRefresh: false,
        timeUntilExpiry: 0,
        lastActive: 0,
      };
    }
    
    const now = Date.now();
    const timeUntilExpiry = Math.max(0, session.expiresAt - now);
    const isExpired = timeUntilExpiry === 0;
    const needsRefresh = timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
    
    return {
      hasStoredSession: true,
      isExpired,
      needsRefresh,
      timeUntilExpiry,
      lastActive: session.lastActive,
    };
  }

  /**
   * Sync session with server
   */
  async syncWithServer(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.storeSession({
            user: data.user,
            expiresAt: data.expiresAt,
            lastActive: Date.now(),
          });
          return true;
        }
      }
      
      // Clear local session if server session is invalid
      this.clearStoredSession();
      return false;
    } catch (error) {
      console.error('Failed to sync session with server:', error);
      return false;
    }
  }

  /**
   * Auto-refresh session if needed
   */
  async autoRefreshSession(): Promise<boolean> {
    if (!this.needsRefresh()) {
      return true; // No refresh needed
    }
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'refresh' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.storeSession({
            user: data.user,
            expiresAt: data.expiresAt,
            lastActive: Date.now(),
          });
          console.log('🔄 Session auto-refreshed');
          return true;
        }
      }
      
      console.warn('Session auto-refresh failed');
      return false;
    } catch (error) {
      console.error('Session auto-refresh error:', error);
      return false;
    }
  }

  /**
   * Setup automatic session management
   */
  setupAutoManagement(): () => void {
    // Update last active on user interaction
    const updateActivity = () => this.updateLastActive();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Auto-refresh check interval
    const refreshInterval = setInterval(async () => {
      await this.autoRefreshSession();
    }, 2 * 60 * 1000); // Check every 2 minutes
    
    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(refreshInterval);
    };
  }
}

// Export singleton instance
export const sessionPersistence = SessionPersistence.getInstance();