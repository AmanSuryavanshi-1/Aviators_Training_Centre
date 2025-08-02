/**
 * Session Management Service
 * Handles secure session storage and management
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AuthUser } from './jwtService';

export interface SessionConfig {
  accessTokenName: string;
  refreshTokenName: string;
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
}

export interface SessionData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
  lastActive: number;
}

export class SessionService {
  private static instance: SessionService;
  private config: SessionConfig;

  constructor() {
    this.config = {
      accessTokenName: 'admin_access_token',
      refreshTokenName: 'admin_refresh_token',
      maxAge: 7 * 24 * 60 * 60, // 7 days for refresh token
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    };
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Create a new session with tokens
   */
  async createSession(
    response: NextResponse,
    user: AuthUser,
    tokens: { accessToken: string; refreshToken: string; expiresIn: number }
  ): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + (tokens.expiresIn * 1000);

      // Set access token cookie (shorter expiry)
      response.cookies.set(this.config.accessTokenName, tokens.accessToken, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        path: this.config.path,
        maxAge: tokens.expiresIn, // 15 minutes
      });

      // Set refresh token cookie (longer expiry)
      response.cookies.set(this.config.refreshTokenName, tokens.refreshToken, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        path: this.config.path,
        maxAge: this.config.maxAge, // 7 days
      });

      // Set user info cookie (non-httpOnly for client access)
      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        expiresAt,
      };

      response.cookies.set('admin_user_info', JSON.stringify(userInfo), {
        httpOnly: false, // Allow client-side access
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        path: this.config.path,
        maxAge: tokens.expiresIn,
      });

      console.log(`✅ Session created for user: ${user.email}`);
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get session from request
   */
  async getSession(request: NextRequest): Promise<SessionData | null> {
    try {
      const accessToken = request.cookies.get(this.config.accessTokenName)?.value;
      const refreshToken = request.cookies.get(this.config.refreshTokenName)?.value;

      if (!accessToken || !refreshToken) {
        return null;
      }

      // Get user info from cookie
      const userInfoCookie = request.cookies.get('admin_user_info')?.value;
      if (!userInfoCookie) {
        return null;
      }

      const userInfo = JSON.parse(userInfoCookie);

      // Create session data
      const sessionData: SessionData = {
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          sanityMemberId: userInfo.id,
          permissions: [], // Will be populated from JWT validation
          sessionExpiry: userInfo.expiresAt,
          lastActive: new Date().toISOString(),
        },
        accessToken,
        refreshToken,
        expiresAt: userInfo.expiresAt,
        createdAt: userInfo.expiresAt - (15 * 60 * 1000), // Estimate creation time
        lastActive: Date.now(),
      };

      return sessionData;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Update session with new tokens
   */
  async updateSession(
    response: NextResponse,
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
    user?: AuthUser
  ): Promise<void> {
    try {
      const now = Date.now();
      const expiresAt = now + (tokens.expiresIn * 1000);

      // Update access token
      response.cookies.set(this.config.accessTokenName, tokens.accessToken, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        path: this.config.path,
        maxAge: tokens.expiresIn,
      });

      // Update refresh token
      response.cookies.set(this.config.refreshTokenName, tokens.refreshToken, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        path: this.config.path,
        maxAge: this.config.maxAge,
      });

      // Update user info if provided
      if (user) {
        const userInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          expiresAt,
        };

        response.cookies.set('admin_user_info', JSON.stringify(userInfo), {
          httpOnly: false,
          secure: this.config.secure,
          sameSite: this.config.sameSite,
          path: this.config.path,
          maxAge: tokens.expiresIn,
        });
      }

      console.log('✅ Session updated with new tokens');
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  /**
   * Clear session (logout)
   */
  async clearSession(response: NextResponse): Promise<void> {
    try {
      // Clear all session cookies
      response.cookies.delete(this.config.accessTokenName);
      response.cookies.delete(this.config.refreshTokenName);
      response.cookies.delete('admin_user_info');

      console.log('✅ Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session: SessionData): boolean {
    return Date.now() >= session.expiresAt;
  }

  /**
   * Check if session needs refresh (expires in less than 5 minutes)
   */
  needsRefresh(session: SessionData): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return (session.expiresAt - Date.now()) < fiveMinutes;
  }

  /**
   * Get session expiry time
   */
  getSessionExpiry(session: SessionData): Date {
    return new Date(session.expiresAt);
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(session: SessionData): number {
    return Math.max(0, session.expiresAt - Date.now());
  }

  /**
   * Validate session activity (check if user is still active)
   */
  isSessionActive(session: SessionData, maxInactiveTime: number = 30 * 60 * 1000): boolean {
    const timeSinceLastActive = Date.now() - session.lastActive;
    return timeSinceLastActive < maxInactiveTime;
  }

  /**
   * Update last active time
   */
  updateLastActive(session: SessionData): void {
    session.lastActive = Date.now();
  }

  /**
   * Get session info for client
   */
  getClientSessionInfo(session: SessionData): {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    expiresAt: number;
    isExpired: boolean;
    needsRefresh: boolean;
    timeUntilExpiry: number;
  } {
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      expiresAt: session.expiresAt,
      isExpired: this.isSessionExpired(session),
      needsRefresh: this.needsRefresh(session),
      timeUntilExpiry: this.getTimeUntilExpiry(session),
    };
  }

  /**
   * Create session from server-side cookies
   */
  async getServerSession(): Promise<SessionData | null> {
    try {
      const cookieStore = cookies();
      const accessToken = cookieStore.get(this.config.accessTokenName)?.value;
      const refreshToken = cookieStore.get(this.config.refreshTokenName)?.value;
      const userInfoCookie = cookieStore.get('admin_user_info')?.value;

      if (!accessToken || !refreshToken || !userInfoCookie) {
        return null;
      }

      const userInfo = JSON.parse(userInfoCookie);

      return {
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          sanityMemberId: userInfo.id,
          permissions: [],
          sessionExpiry: userInfo.expiresAt,
          lastActive: new Date().toISOString(),
        },
        accessToken,
        refreshToken,
        expiresAt: userInfo.expiresAt,
        createdAt: userInfo.expiresAt - (15 * 60 * 1000),
        lastActive: Date.now(),
      };
    } catch (error) {
      console.error('Error getting server session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();