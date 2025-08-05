import { SignJWT, jwtVerify } from 'jose';

export interface AdminSession {
  username: string;
  role: string;
  loginTime: number;
  expiresAt: number;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: AdminSession;
  error?: string;
}

// JWT secret for session signing
const getJWTSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-change-in-production';
  return new TextEncoder().encode(secret);
};

// Session duration (24 hours)
const SESSION_DURATION = 24 * 60 * 60; // seconds

/**
 * Create a new admin session token
 */
export async function createSession(username: string): Promise<string> {
  const secret = getJWTSecret();
  const now = Math.floor(Date.now() / 1000);
  
  const token = await new SignJWT({
    username,
    role: 'admin',
    loginTime: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_DURATION)
    .sign(secret);

  return token;
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<SessionValidationResult> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);

    // Check if session is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return {
        valid: false,
        error: 'Session expired'
      };
    }

    const session: AdminSession = {
      username: payload.username as string,
      role: payload.role as string,
      loginTime: payload.loginTime as number,
      expiresAt: (payload.exp as number) * 1000 // Convert to milliseconds
    };

    return {
      valid: true,
      session
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid session token'
    };
  }
}

/**
 * Check if session needs refresh (within 1 hour of expiry)
 */
export function shouldRefreshSession(session: AdminSession): boolean {
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  const timeUntilExpiry = session.expiresAt - Date.now();
  return timeUntilExpiry < oneHour;
}

/**
 * Refresh a session token
 */
export async function refreshSession(currentToken: string): Promise<string | null> {
  const validation = await validateSession(currentToken);
  
  if (!validation.valid || !validation.session) {
    return null;
  }

  // Create new session with same username
  return await createSession(validation.session.username);
}

/**
 * Get session cookie configuration
 */
export function getSessionCookieConfig() {
  return {
    name: 'admin-session',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: SESSION_DURATION,
      path: '/studio/admin'
    }
  };
}

/**
 * Validate admin credentials
 */
export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error('Admin credentials not configured');
  }

  return username === adminUsername && password === adminPassword;
}

/**
 * Check if admin credentials are properly configured
 */
export function isAdminConfigured(): boolean {
  return !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

/**
 * Get session info from request headers (set by middleware)
 */
export function getSessionFromHeaders(headers: Headers): AdminSession | null {
  const username = headers.get('X-Admin-User');
  const authenticated = headers.get('X-Admin-Authenticated');

  if (!username || authenticated !== 'true') {
    return null;
  }

  // Note: This is a simplified version since middleware already validated the session
  // In a real scenario, you might want to include more session data in headers
  return {
    username,
    role: 'admin',
    loginTime: Date.now(), // This would ideally come from the JWT
    expiresAt: Date.now() + (SESSION_DURATION * 1000)
  };
}

/**
 * Client-side session management utilities
 */
export const clientSessionUtils = {
  /**
   * Check session status from client-side
   */
  async checkSession(): Promise<SessionValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('/api/admin/auth/session', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Always try to parse the response since we changed status codes to 200
      const data = await response.json();
      
      if (!data.authenticated) {
        return {
          valid: false,
          error: data.message || 'Not authenticated'
        };
      }

      return {
        valid: true,
        session: {
          username: data.username,
          role: data.role,
          loginTime: data.loginTime,
          expiresAt: data.expiresAt
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            valid: false,
            error: 'Session check timed out'
          };
        }
        return {
          valid: false,
          error: `Network error: ${error.message}`
        };
      }
      return {
        valid: false,
        error: 'Unknown error during session check'
      };
    }
  },

  /**
   * Login from client-side
   */
  async login(username: string, password: string): Promise<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  }> {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error during login'
      };
    }
  },

  /**
   * Logout from client-side
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error during logout'
      };
    }
  }
};