/**
 * Member Validation Service
 * Handles validation of users against Sanity project members
 */

import { sanityMemberService, SanityMember, SanityMemberValidationResult } from './sanityMemberService';
import { jwtAuthService, AuthUser } from './jwtService';

export interface LoginCredentials {
  email: string;
  password?: string;
  provider?: 'email' | 'google';
}

export interface AuthenticationResult {
  success: boolean;
  user?: AuthUser;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}

export class MemberValidationService {
  private static instance: MemberValidationService;

  static getInstance(): MemberValidationService {
    if (!MemberValidationService.instance) {
      MemberValidationService.instance = new MemberValidationService();
    }
    return MemberValidationService.instance;
  }

  /**
   * Authenticate user with email and validate against Sanity members
   */
  async authenticateUser(credentials: LoginCredentials): Promise<AuthenticationResult> {
    try {
      console.log(`🔐 Authenticating user: ${credentials.email}`);

      // Validate email format
      if (!this.isValidEmail(credentials.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Check if user is a Sanity project member
      const memberValidation = await sanityMemberService.validateMemberEmail(credentials.email);
      
      if (!memberValidation.isValid) {
        console.warn(`❌ Authentication failed: ${credentials.email} is not a Sanity project member`);
        return {
          success: false,
          error: 'Access denied. Only Sanity project members can access the admin dashboard.',
        };
      }

      const member = memberValidation.member!;

      // For now, we'll use a simple authentication mechanism
      // In production, you might integrate with Google OAuth or other providers
      if (credentials.provider === 'email') {
        // For email authentication, we'll validate against admin credentials as a fallback
        const isValidCredentials = await this.validateEmailCredentials(credentials);
        if (!isValidCredentials) {
          return {
            success: false,
            error: 'Invalid credentials',
          };
        }
      }

      // Create AuthUser from SanityMember
      const user = jwtAuthService.createAuthUserFromMember(member);

      // Generate JWT tokens
      const tokens = await jwtAuthService.generateTokenPair(user);

      console.log(`✅ Authentication successful for: ${user.email} (${user.role})`);

      return {
        success: true,
        user,
        tokens,
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed due to system error',
      };
    }
  }

  /**
   * Validate session token and return user
   */
  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      // Validate JWT token
      const user = await jwtAuthService.validateToken(token);
      
      if (!user) {
        return {
          isValid: false,
          error: 'Invalid or expired token',
        };
      }

      // Re-validate that user is still a Sanity member
      const memberValidation = await sanityMemberService.validateMemberEmail(user.email);
      
      if (!memberValidation.isValid) {
        console.warn(`⚠️ User ${user.email} is no longer a Sanity project member`);
        return {
          isValid: false,
          error: 'User is no longer authorized',
        };
      }

      // Update last active time
      user.lastActive = new Date().toISOString();

      return {
        isValid: true,
        user,
      };

    } catch (error) {
      console.error('Session validation error:', error);
      return {
        isValid: false,
        error: 'Session validation failed',
      };
    }
  }

  /**
   * Check if user has specific permission
   */
  checkPermission(user: AuthUser, resource: string, action: 'read' | 'write' | 'delete' | 'admin'): boolean {
    return jwtAuthService.hasPermission(user, resource, action);
  }

  /**
   * Get all authorized members
   */
  async getAuthorizedMembers(): Promise<SanityMember[]> {
    try {
      return await sanityMemberService.getProjectMembers();
    } catch (error) {
      console.error('Error fetching authorized members:', error);
      return [];
    }
  }

  /**
   * Check if email is authorized
   */
  async isEmailAuthorized(email: string): Promise<boolean> {
    try {
      const validation = await sanityMemberService.validateMemberEmail(email);
      return validation.isValid;
    } catch (error) {
      console.error('Error checking email authorization:', error);
      return false;
    }
  }

  /**
   * Get member role by email
   */
  async getMemberRole(email: string): Promise<'administrator' | 'editor' | null> {
    try {
      return await sanityMemberService.getMemberRole(email);
    } catch (error) {
      console.error('Error getting member role:', error);
      return null;
    }
  }

  /**
   * Refresh user session
   */
  async refreshUserSession(refreshToken: string): Promise<AuthenticationResult> {
    try {
      const tokens = await jwtAuthService.refreshToken(refreshToken);
      
      if (!tokens) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Validate the new access token to get user data
      const user = await jwtAuthService.validateToken(tokens.accessToken);
      
      if (!user) {
        return {
          success: false,
          error: 'Failed to validate refreshed token',
        };
      }

      return {
        success: true,
        user,
        tokens,
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh session',
      };
    }
  }

  /**
   * Logout user (revoke tokens)
   */
  async logoutUser(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await jwtAuthService.revokeToken(accessToken);
      if (refreshToken) {
        await jwtAuthService.revokeToken(refreshToken);
      }
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate email credentials (fallback authentication)
   */
  private async validateEmailCredentials(credentials: LoginCredentials): Promise<boolean> {
    // For now, we'll use the admin credentials as a fallback
    // In production, you might integrate with a proper authentication provider
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check if this is an admin login
    if (credentials.email === 'amansuryavanshi2002@gmail.com' || credentials.email === 'adude890@gmail.com') {
      // For authorized Sanity members, we'll allow login without password for now
      // In production, implement proper OAuth or password authentication
      return true;
    }

    // For other emails, require admin credentials
    if (credentials.password && adminUsername && adminPassword) {
      // Simple credential check (in production, use proper password hashing)
      return credentials.password === adminPassword;
    }

    return false;
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      sanityMemberService: any;
      authorizedMemberCount: number;
      cacheStatus: any;
    };
  }> {
    try {
      const sanityHealth = await sanityMemberService.performHealthCheck();
      const members = await sanityMemberService.getProjectMembers();
      const cacheStatus = sanityMemberService.getCacheStatus();

      return {
        status: sanityHealth.status,
        details: {
          sanityMemberService: sanityHealth,
          authorizedMemberCount: members.length,
          cacheStatus,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          sanityMemberService: { status: 'unhealthy', error: (error as Error).message },
          authorizedMemberCount: 0,
          cacheStatus: { isCached: false, expiresIn: 0, memberCount: 0 },
        },
      };
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    sanityMemberService.clearCache();
    console.log('✅ All authentication caches cleared');
  }
}

// Export singleton instance
export const memberValidationService = MemberValidationService.getInstance();