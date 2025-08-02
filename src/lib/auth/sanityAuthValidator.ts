/**
 * Sanity Authentication Validator
 * Enhanced validation and debugging for Sanity Studio authentication
 */

import { NextRequest } from 'next/server';

export interface AuthValidationResult {
  isAuthenticated: boolean;
  authMethod: 'sanity' | 'simple' | 'none';
  sessionInfo: {
    cookieCount: number;
    sanitySessionCount: number;
    validTokenCount: number;
    sessionDetails: {
      name: string;
      hasValue: boolean;
      valueLength: number;
      tokenType: 'jwt' | 'session' | 'oauth' | 'unknown';
      isValid: boolean;
    }[];
  };
  debugInfo: {
    pathname: string;
    origin?: string;
    referer?: string;
    userAgent?: string;
    timestamp: string;
  };
  recommendations: string[];
}

export interface CookieAnalysis {
  name: string;
  value: string;
  isValid: boolean;
  tokenType: 'jwt' | 'session' | 'oauth' | 'unknown';
  confidence: number;
  issues: string[];
}

export class SanityAuthValidator {
  private static readonly SANITY_COOKIE_PATTERNS = [
    // Direct Sanity patterns
    /^sanity/i,
    /^__sanity/i,
    
    // Sanity with auth keywords
    /sanity.*auth/i,
    /sanity.*session/i,
    /sanity.*token/i,
    /sanity.*user/i,
    /sanity.*login/i,
    
    // OAuth patterns used by Sanity
    /google.*auth/i,
    /oauth.*(token|session)/i,
  ];

  private static readonly KNOWN_SANITY_COOKIES = [
    'sanity-session',
    '__sanity_auth_token',
    'sanity.auth.token',
    'sanity-auth-token',
    'sanity_auth_token',
    'sanity-studio-session',
    'sanity_studio_session',
    'sanity-auth-session',
    'sanity_auth_session',
    '__sanity_session',
    'sanity.session',
    'sanity-login-session',
    'sanity_login_session',
    'sanity-oauth-session',
    'sanity_oauth_session',
  ];

  /**
   * Validate authentication from request
   */
  static validateAuthentication(request: NextRequest): AuthValidationResult {
    const allCookies = request.cookies.getAll();
    const pathname = request.nextUrl.pathname;
    
    // Analyze cookies
    const cookieAnalyses = allCookies.map(cookie => 
      this.analyzeCookie(cookie.name, cookie.value)
    );
    
    // Filter for Sanity-related cookies
    const sanityAnalyses = cookieAnalyses.filter(analysis => 
      this.isSanityCookie(analysis.name)
    );
    
    // Count valid tokens
    const validSanityTokens = sanityAnalyses.filter(analysis => analysis.isValid);
    
    // Check for simple session
    const hasSimpleSession = request.cookies.get('simple_admin_session')?.value === 'authenticated';
    
    // Determine authentication status
    const isAuthenticated = validSanityTokens.length > 0 || hasSimpleSession;
    const authMethod = validSanityTokens.length > 0 ? 'sanity' : hasSimpleSession ? 'simple' : 'none';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(sanityAnalyses, isAuthenticated);
    
    return {
      isAuthenticated,
      authMethod,
      sessionInfo: {
        cookieCount: allCookies.length,
        sanitySessionCount: sanityAnalyses.length,
        validTokenCount: validSanityTokens.length,
        sessionDetails: sanityAnalyses.map(analysis => ({
          name: analysis.name,
          hasValue: !!analysis.value,
          valueLength: analysis.value.length,
          tokenType: analysis.tokenType,
          isValid: analysis.isValid,
        })),
      },
      debugInfo: {
        pathname,
        origin: request.headers.get('origin') || undefined,
        referer: request.headers.get('referer') || undefined,
        userAgent: request.headers.get('user-agent')?.substring(0, 100) || undefined,
        timestamp: new Date().toISOString(),
      },
      recommendations,
    };
  }

  /**
   * Analyze individual cookie
   */
  private static analyzeCookie(name: string, value: string): CookieAnalysis {
    const analysis: CookieAnalysis = {
      name,
      value,
      isValid: false,
      tokenType: 'unknown',
      confidence: 0,
      issues: [],
    };

    // Check if cookie has value
    if (!value || value === 'undefined' || value === 'null') {
      analysis.issues.push('Empty or invalid value');
      return analysis;
    }

    // Check minimum length
    if (value.length < 5) {
      analysis.issues.push('Value too short');
      return analysis;
    }

    // Analyze token type and validity
    if (this.isJWTToken(value)) {
      analysis.tokenType = 'jwt';
      analysis.confidence = 0.9;
      analysis.isValid = true;
    } else if (this.isSessionToken(value)) {
      analysis.tokenType = 'session';
      analysis.confidence = 0.8;
      analysis.isValid = true;
    } else if (this.isOAuthToken(value)) {
      analysis.tokenType = 'oauth';
      analysis.confidence = 0.7;
      analysis.isValid = true;
    } else if (value.length > 20) {
      analysis.tokenType = 'session';
      analysis.confidence = 0.5;
      analysis.isValid = true;
    } else {
      analysis.issues.push('Unrecognized token format');
    }

    return analysis;
  }

  /**
   * Check if cookie name is Sanity-related
   */
  private static isSanityCookie(name: string): boolean {
    const lowerName = name.toLowerCase();
    
    // Check known cookie names
    if (this.KNOWN_SANITY_COOKIES.includes(lowerName)) {
      return true;
    }
    
    // Check patterns
    return this.SANITY_COOKIE_PATTERNS.some(pattern => pattern.test(name));
  }

  /**
   * Check if value is JWT token
   */
  private static isJWTToken(value: string): boolean {
    const parts = value.split('.');
    return parts.length >= 2 && parts.every(part => part.length > 0);
  }

  /**
   * Check if value is session token
   */
  private static isSessionToken(value: string): boolean {
    return value.length > 20 && /^[a-zA-Z0-9_-]+$/.test(value);
  }

  /**
   * Check if value is OAuth token
   */
  private static isOAuthToken(value: string): boolean {
    return (
      value.startsWith('ya29.') || // Google OAuth
      value.startsWith('1//') ||   // Google OAuth refresh token
      (value.length > 50 && /^[a-zA-Z0-9_-]+$/.test(value)) // Generic OAuth
    );
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(
    analyses: CookieAnalysis[], 
    isAuthenticated: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (!isAuthenticated) {
      recommendations.push('No valid Sanity authentication found');
      recommendations.push('Try logging into Sanity Studio first');
      recommendations.push('Check CORS configuration in Sanity Management Console');
    }

    if (analyses.length === 0) {
      recommendations.push('No Sanity-related cookies found');
      recommendations.push('Ensure you are logged into Sanity Studio');
    }

    const invalidAnalyses = analyses.filter(a => !a.isValid);
    if (invalidAnalyses.length > 0) {
      recommendations.push('Some Sanity cookies appear invalid');
      recommendations.push('Try clearing browser cookies and logging in again');
    }

    const lowConfidenceAnalyses = analyses.filter(a => a.confidence < 0.7);
    if (lowConfidenceAnalyses.length > 0) {
      recommendations.push('Some authentication tokens have low confidence');
      recommendations.push('Consider refreshing your Sanity Studio session');
    }

    return recommendations;
  }

  /**
   * Generate detailed debug report
   */
  static generateDebugReport(validation: AuthValidationResult): string {
    let report = `# Sanity Authentication Debug Report\n\n`;
    
    report += `**Status:** ${validation.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}\n`;
    report += `**Method:** ${validation.authMethod}\n`;
    report += `**Timestamp:** ${validation.debugInfo.timestamp}\n`;
    report += `**Path:** ${validation.debugInfo.pathname}\n\n`;
    
    if (validation.debugInfo.origin) {
      report += `**Origin:** ${validation.debugInfo.origin}\n`;
    }
    
    if (validation.debugInfo.referer) {
      report += `**Referer:** ${validation.debugInfo.referer}\n`;
    }
    
    report += `\n## Session Information\n`;
    report += `- **Total Cookies:** ${validation.sessionInfo.cookieCount}\n`;
    report += `- **Sanity Sessions:** ${validation.sessionInfo.sanitySessionCount}\n`;
    report += `- **Valid Tokens:** ${validation.sessionInfo.validTokenCount}\n\n`;
    
    if (validation.sessionInfo.sessionDetails.length > 0) {
      report += `## Session Details\n`;
      validation.sessionInfo.sessionDetails.forEach(detail => {
        const status = detail.isValid ? '✅' : '❌';
        report += `- ${status} **${detail.name}** (${detail.tokenType}, ${detail.valueLength} chars)\n`;
      });
      report += `\n`;
    }
    
    if (validation.recommendations.length > 0) {
      report += `## Recommendations\n`;
      validation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }
    
    return report;
  }
}

// Export utility functions
export const validateSanityAuth = SanityAuthValidator.validateAuthentication;
export const generateAuthDebugReport = SanityAuthValidator.generateDebugReport;