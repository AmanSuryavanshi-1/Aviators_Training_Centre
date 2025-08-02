/**
 * JWT Authentication Service
 * Handles token generation, validation, and refresh for production authentication
 */

import { SignJWT, jwtVerify } from 'jose';
import { SanityMember } from './sanityMemberService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'administrator' | 'editor';
  sanityMemberId: string;
  permissions: Permission[];
  sessionExpiry: number;
  lastActive: string;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'administrator' | 'editor';
  sanityMemberId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTAuthService {
  private static instance: JWTAuthService;
  private readonly JWT_SECRET: Uint8Array;
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private readonly ALGORITHM = 'HS256';

  constructor() {
    // Use a strong secret for production
    const secret = process.env.JWT_SECRET || process.env.SANITY_API_TOKEN || 'fallback-secret-key';
    this.JWT_SECRET = new TextEncoder().encode(secret);
  }

  static getInstance(): JWTAuthService {
    if (!JWTAuthService.instance) {
      JWTAuthService.instance = new JWTAuthService();
    }
    return JWTAuthService.instance;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokenPair(user: AuthUser): Promise<TokenPair> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Create access token payload
      const accessPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sanityMemberId: user.sanityMemberId,
        permissions: user.permissions.flatMap(p => p.actions.map(a => `${p.resource}:${a}`)),
        iat: now,
        exp: now + this.ACCESS_TOKEN_EXPIRY,
      };

      // Create refresh token payload (minimal data)
      const refreshPayload = {
        userId: user.id,
        email: user.email,
        type: 'refresh',
        iat: now,
        exp: now + this.REFRESH_TOKEN_EXPIRY,
      };

      // Generate tokens
      const accessToken = await new SignJWT(accessPayload)
        .setProtectedHeader({ alg: this.ALGORITHM })
        .setIssuedAt(now)
        .setExpirationTime(now + this.ACCESS_TOKEN_EXPIRY)
        .sign(this.JWT_SECRET);

      const refreshToken = await new SignJWT(refreshPayload)
        .setProtectedHeader({ alg: this.ALGORITHM })
        .setIssuedAt(now)
        .setExpirationTime(now + this.REFRESH_TOKEN_EXPIRY)
        .sign(this.JWT_SECRET);

      console.log(`✅ Generated token pair for user: ${user.email}`);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      };
    } catch (error) {
      console.error('Error generating token pair:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Validate and decode an access token
   */
  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      
      // Validate payload structure
      if (!this.isValidJWTPayload(payload)) {
        console.warn('Invalid JWT payload structure');
        return null;
      }

      const jwtPayload = payload as unknown as JWTPayload;

      // Convert back to AuthUser format
      const permissions: Permission[] = this.parsePermissions(jwtPayload.permissions);

      const user: AuthUser = {
        id: jwtPayload.userId,
        email: jwtPayload.email,
        name: jwtPayload.email.split('@')[0], // Extract name from email
        role: jwtPayload.role,
        sanityMemberId: jwtPayload.sanityMemberId,
        permissions,
        sessionExpiry: jwtPayload.exp * 1000, // Convert to milliseconds
        lastActive: new Date().toISOString(),
      };

      return user;
    } catch (error) {
      if (error.code === 'ERR_JWT_EXPIRED') {
        console.log('JWT token expired');
      } else {
        console.error('Error validating JWT token:', error);
      }
      return null;
    }
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const { payload } = await jwtVerify(refreshToken, this.JWT_SECRET);
      
      // Validate it's a refresh token
      if (payload.type !== 'refresh') {
        console.warn('Invalid refresh token type');
        return null;
      }

      // Here you would typically fetch the latest user data from your database
      // For now, we'll create a basic user object
      const user: AuthUser = {
        id: payload.userId as string,
        email: payload.email as string,
        name: (payload.email as string).split('@')[0],
        role: 'editor', // Default role, should be fetched from database
        sanityMemberId: payload.userId as string,
        permissions: this.getDefaultPermissions('editor'),
        sessionExpiry: Date.now() + (this.ACCESS_TOKEN_EXPIRY * 1000),
        lastActive: new Date().toISOString(),
      };

      // Generate new token pair
      return await this.generateTokenPair(user);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Revoke a token (add to blacklist)
   */
  async revokeToken(token: string): Promise<void> {
    try {
      // In a production system, you would add this token to a blacklist
      // For now, we'll just log the revocation
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      console.log(`🔒 Token revoked for user: ${payload.email}`);
      
      // TODO: Implement token blacklist in Redis or database
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }

  /**
   * Create AuthUser from SanityMember
   */
  createAuthUserFromMember(member: SanityMember): AuthUser {
    return {
      id: member.id,
      email: member.email,
      name: member.displayName,
      role: member.role,
      sanityMemberId: member.id,
      permissions: this.getDefaultPermissions(member.role),
      sessionExpiry: Date.now() + (this.ACCESS_TOKEN_EXPIRY * 1000),
      lastActive: new Date().toISOString(),
    };
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: 'administrator' | 'editor'): Permission[] {
    const basePermissions: Permission[] = [
      {
        resource: 'blog',
        actions: ['read', 'write'],
      },
      {
        resource: 'admin',
        actions: ['read'],
      },
    ];

    if (role === 'administrator') {
      return [
        ...basePermissions,
        {
          resource: 'admin',
          actions: ['read', 'write', 'delete', 'admin'],
        },
        {
          resource: 'users',
          actions: ['read', 'write', 'admin'],
        },
        {
          resource: 'system',
          actions: ['read', 'admin'],
        },
      ];
    }

    return basePermissions;
  }

  /**
   * Parse permissions from JWT payload
   */
  private parsePermissions(permissionStrings: string[]): Permission[] {
    const permissionMap = new Map<string, Set<string>>();

    permissionStrings.forEach(permStr => {
      const [resource, action] = permStr.split(':');
      if (resource && action) {
        if (!permissionMap.has(resource)) {
          permissionMap.set(resource, new Set());
        }
        permissionMap.get(resource)!.add(action);
      }
    });

    return Array.from(permissionMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions) as ('read' | 'write' | 'delete' | 'admin')[],
    }));
  }

  /**
   * Validate JWT payload structure
   */
  private isValidJWTPayload(payload: any): payload is JWTPayload {
    return (
      payload &&
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.sanityMemberId === 'string' &&
      Array.isArray(payload.permissions) &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    );
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: AuthUser, resource: string, action: 'read' | 'write' | 'delete' | 'admin'): boolean {
    // Administrators have all permissions
    if (user.role === 'administrator') {
      return true;
    }

    // Check specific permissions
    const permission = user.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(token: string): number | null {
    try {
      // Decode without verification to get expiry
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Date.now() >= expiry : true;
  }

  /**
   * Get time until token expires
   */
  getTimeUntilExpiry(token: string): number {
    const expiry = this.getTokenExpiry(token);
    return expiry ? Math.max(0, expiry - Date.now()) : 0;
  }
}

// Export singleton instance
export const jwtAuthService = JWTAuthService.getInstance();

// Also export as jwtService for backward compatibility
export const jwtService = jwtAuthService;