/**
 * Security Configuration Service
 * Handles CORS, CSP, and other security headers for production
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
  csp: {
    directives: Record<string, string[]>;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;

  constructor() {
    this.config = this.getSecurityConfig();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Get security configuration based on environment
   */
  private getSecurityConfig(): SecurityConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';
    
    // Parse site URL to get different variations
    const url = new URL(siteUrl);
    const domain = url.hostname;
    const wwwDomain = domain.startsWith('www.') ? domain : `www.${domain}`;
    const nonWwwDomain = domain.startsWith('www.') ? domain.substring(4) : domain;

    const allowedOrigins = [
      siteUrl,
      `https://${wwwDomain}`,
      `https://${nonWwwDomain}`,
      `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`,
    ];

    // Add development origins in non-production
    if (!isProduction) {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3333',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3333'
      );
    }

    return {
      cors: {
        origins: allowedOrigins.filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        headers: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin',
          'Cache-Control',
          'X-File-Name',
        ],
      },
      csp: {
        directives: {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://cdn.sanity.io',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            ...(isProduction ? [] : ["'unsafe-eval'"]),
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdn.sanity.io',
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https:',
            'https://cdn.sanity.io',
            'https://www.google-analytics.com',
          ],
          'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'https://cdn.sanity.io',
          ],
          'connect-src': [
            "'self'",
            'https://*.sanity.io',
            'https://api.sanity.io',
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            siteUrl,
          ],
          'frame-src': [
            "'self'",
            'https://*.sanity.io',
          ],
          'worker-src': [
            "'self'",
            'blob:',
          ],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'upgrade-insecure-requests': [],
        },
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: isProduction ? 100 : 1000, // More restrictive in production
      },
    };
  }

  /**
   * Apply CORS headers to response
   */
  applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
    const origin = request.headers.get('origin');
    const { cors } = this.config;

    // Check if origin is allowed
    if (origin && cors.origins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (!origin && request.url.includes('/api/')) {
      // Allow same-origin requests
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    if (cors.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', cors.headers.join(', '));
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    return response;
  }

  /**
   * Apply Content Security Policy headers
   */
  applyCSPHeaders(response: NextResponse): NextResponse {
    const { csp } = this.config;
    
    const cspString = Object.entries(csp.directives)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    response.headers.set('Content-Security-Policy', cspString);
    
    return response;
  }

  /**
   * Apply general security headers
   */
  applySecurityHeaders(response: NextResponse): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    // Strict Transport Security (HTTPS only in production)
    if (isProduction) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // X-DNS-Prefetch-Control
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    return response;
  }

  /**
   * Handle preflight OPTIONS requests
   */
  handlePreflightRequest(request: NextRequest): NextResponse {
    const response = new NextResponse(null, { status: 200 });
    return this.applyCorsHeaders(request, response);
  }

  /**
   * Check if origin is allowed
   */
  isOriginAllowed(origin: string | null): boolean {
    if (!origin) return true; // Same-origin requests
    return this.config.cors.origins.includes(origin);
  }

  /**
   * Get allowed origins for configuration
   */
  getAllowedOrigins(): string[] {
    return this.config.cors.origins;
  }

  /**
   * Apply all security headers to a response
   */
  applyAllSecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
    response = this.applyCorsHeaders(request, response);
    response = this.applyCSPHeaders(response);
    response = this.applySecurityHeaders(response);
    
    return response;
  }

  /**
   * Create a secure response with all headers applied
   */
  createSecureResponse(
    request: NextRequest,
    body?: BodyInit | null,
    init?: ResponseInit
  ): NextResponse {
    const response = new NextResponse(body, init);
    return this.applyAllSecurityHeaders(request, response);
  }

  /**
   * Validate request against security policies
   */
  validateRequest(request: NextRequest): {
    isValid: boolean;
    reason?: string;
  } {
    const origin = request.headers.get('origin');
    
    // Check origin if present
    if (origin && !this.isOriginAllowed(origin)) {
      return {
        isValid: false,
        reason: `Origin ${origin} is not allowed`,
      };
    }

    // Check for required headers in certain requests
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type');
      if (!contentType) {
        return {
          isValid: false,
          reason: 'Content-Type header is required for POST/PUT requests',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get rate limiting configuration
   */
  getRateLimitConfig(): { windowMs: number; maxRequests: number } {
    return this.config.rateLimit;
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();