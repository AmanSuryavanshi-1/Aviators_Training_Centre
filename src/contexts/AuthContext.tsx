/**
 * Shared Authentication Context
 * Provides authentication state and navigation context between admin and Studio
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';
import { sessionPersistence, SessionData } from '@/lib/auth/sessionPersistence';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  sessionExpiry: number | null;
  timeUntilExpiry: number;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const router = useRouter();

  // Initialize from stored session
  useEffect(() => {
    const storedSession = sessionPersistence.getStoredSession();
    if (storedSession) {
      setUser(storedSession.user);
      setSessionExpiry(storedSession.expiresAt);
      setTimeUntilExpiry(Math.max(0, storedSession.expiresAt - Date.now()));
    }
    
    // Always check with server to validate session
    checkSession();
    
    // Setup automatic session management
    const cleanup = sessionPersistence.setupAutoManagement();
    
    return cleanup;
  }, []);

  // Session monitoring
  useEffect(() => {
    if (!user || !sessionExpiry) return;
    
    const interval = setInterval(() => {
      const remaining = sessionExpiry - Date.now();
      setTimeUntilExpiry(Math.max(0, remaining));
      
      // Auto-refresh if session expires in less than 5 minutes
      if (remaining < 5 * 60 * 1000 && remaining > 0) {
        refreshSession();
      }
      
      // Auto-logout if session expired
      if (remaining <= 0) {
        handleSessionExpired();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, sessionExpiry]);

  const handleSessionExpired = useCallback(async () => {
    console.log('🔒 Session expired, logging out');
    await logout();
  }, []);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const sessionData: SessionData = {
            user: data.user,
            expiresAt: data.expiresAt,
            lastActive: Date.now(),
          };
          
          // Store in persistence layer
          sessionPersistence.storeSession(sessionData);
          
          setUser(data.user);
          setSessionExpiry(data.expiresAt);
          setTimeUntilExpiry(Math.max(0, data.expiresAt - Date.now()));
          return true;
        }
      }
      
      // Clear user state if session check failed
      sessionPersistence.clearStoredSession();
      setUser(null);
      setSessionExpiry(null);
      setTimeUntilExpiry(0);
      return false;
    } catch (error) {
      console.error('Session check failed:', error);
      sessionPersistence.clearStoredSession();
      setUser(null);
      setSessionExpiry(null);
      setTimeUntilExpiry(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password?: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          provider: 'email',
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const sessionData: SessionData = {
          user: data.user,
          expiresAt: data.expiresAt,
          lastActive: Date.now(),
        };
        
        // Store in persistence layer
        sessionPersistence.storeSession(sessionData);
        
        setUser(data.user);
        setSessionExpiry(data.expiresAt);
        setTimeUntilExpiry(Math.max(0, data.expiresAt - Date.now()));
        console.log(`✅ Login successful: ${data.user.email}`);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all session data
      sessionPersistence.clearStoredSession();
      setUser(null);
      setSessionExpiry(null);
      setTimeUntilExpiry(0);
      setIsLoading(false);
      
      // Redirect to login page
      router.push('/login');
    }
  }, [router]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
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
          const sessionData: SessionData = {
            user: data.user,
            expiresAt: data.expiresAt,
            lastActive: Date.now(),
          };
          
          // Store in persistence layer
          sessionPersistence.storeSession(sessionData);
          
          setUser(data.user);
          setSessionExpiry(data.expiresAt);
          setTimeUntilExpiry(Math.max(0, data.expiresAt - Date.now()));
          console.log('🔄 Session refreshed successfully');
          return true;
        }
      }
      
      console.warn('Session refresh failed');
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
    checkSession,
    sessionExpiry,
    timeUntilExpiry,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for session status
export function useSessionStatus() {
  const { user, isLoading, sessionExpiry, timeUntilExpiry } = useAuth();
  
  const isExpired = sessionExpiry ? Date.now() >= sessionExpiry : false;
  const isExpiringSoon = timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
  const expiryDate = sessionExpiry ? new Date(sessionExpiry) : null;
  
  return {
    isAuthenticated: !!user,
    isLoading,
    isExpired,
    isExpiringSoon,
    timeUntilExpiry,
    expiryDate,
    user,
  };
}