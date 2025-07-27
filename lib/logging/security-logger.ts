/**
 * Security-focused logging system
 * Handles security events, audit trails, and threat detection
 */

import { NextRequest } from 'next/server';
import { createLogger } from './production-logger';

const securityLogger = createLogger('security');

// Security event types
export enum SecurityEventType {
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_FAILURE = 'authz_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  ADMIN_ACCESS = 'admin_access',
  DATA_ACCESS = 'data_access',
  CONFIGURATION_CHANGE = 'config_change',
  SECURITY_SCAN_DETECTED = 'security_scan_detected',
}

// Security event severity levels
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  message: string;
  timestamp: string;
  source: {
    ip: string;
    userAgent: string;
    referer?: string;
    country?: string;
  };
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
  };
  metadata?: Record<string, any>;
}

// Threat detection patterns
const THREAT_PATTERNS = {
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\'|\"|;|--|\*|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*(\=|\<|\>)/i,
  ],
  
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
  ],
  
  pathTraversal: [
    /\.\.\//g,
    /\.\.[\\\/]/g,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi,
  ],
  
  suspiciousUserAgents: [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /nmap/i,
    /masscan/i,
  ],
};

// Rate limiting tracking
const rateLimitTracking = new Map<string, { count: number; resetTime: number }>();

class SecurityLogger {
  // Log security event
  logSecurityEvent(event: SecurityEvent): void {
    // Sanitize sensitive data before logging
    const sanitizedEvent = this.sanitizeSecurityEvent(event);
    
    // Log based on severity
    switch (event.severity) {
      case SecuritySeverity.CRITICAL:
      case SecuritySeverity.HIGH:
        securityLogger.error(`Security Event: ${event.type}`, sanitizedEvent);
        break;
      case SecuritySeverity.MEDIUM:
        securityLogger.warn(`Security Event: ${event.type}`, sanitizedEvent);
        break;
      case SecuritySeverity.LOW:
        securityLogger.info(`Security Event: ${event.type}`, sanitizedEvent);
        break;
    }
    
    // Send to external security monitoring if configured
    if (process.env.NODE_ENV === 'production') {
      this.sendToSecurityMonitoring(sanitizedEvent);
    }
  }
  
  // Analyze request for security threats
  analyzeRequest(req: NextRequest): SecurityEvent[] {
    const events: SecurityEvent[] = [];
    const url = req.url;
    const method = req.method;
    const userAgent = req.headers.get('user-agent') || '';
    const ip = this.getClientIP(req);
    
    // Check for SQL injection attempts
    if (this.detectSQLInjection(url)) {
      events.push({
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        message: 'SQL injection attempt detected in URL',
        timestamp: new Date().toISOString(),
        source: {
          ip,
          userAgent,
          referer: req.headers.get('referer') || undefined,
        },
        request: {
          method,
          url,
          headers: this.sanitizeHeaders(req.headers),
        },
      });
    }
    
    // Check for XSS attempts
    if (this.detectXSS(url)) {
      events.push({
        type: SecurityEventType.XSS_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        message: 'XSS attempt detected in URL',
        timestamp: new Date().toISOString(),
        source: {
          ip,
          userAgent,
        },
        request: {
          method,
          url,
          headers: this.sanitizeHeaders(req.headers),
        },
      });
    }
    
    // Check for suspicious user agents
    if (this.detectSuspiciousUserAgent(userAgent)) {
      events.push({
        type: SecurityEventType.SECURITY_SCAN_DETECTED,
        severity: SecuritySeverity.MEDIUM,
        message: 'Security scanning tool detected',
        timestamp: new Date().toISOString(),
        source: {
          ip,
          userAgent,
        },
        request: {
          method,
          url,
          headers: this.sanitizeHeaders(req.headers),
        },
      });
    }
    
    // Check rate limiting
    if (this.checkRateLimit(ip)) {
      events.push({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecuritySeverity.MEDIUM,
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        source: {
          ip,
          userAgent,
        },
        request: {
          method,
          url,
          headers: this.sanitizeHeaders(req.headers),
        },
      });
    }
    
    return events;
  }
  
  // Log admin access
  logAdminAccess(req: NextRequest, userId?: string, action?: string): void {
    this.logSecurityEvent({
      type: SecurityEventType.ADMIN_ACCESS,
      severity: SecuritySeverity.MEDIUM,
      message: `Admin access: ${action || 'general'}`,
      timestamp: new Date().toISOString(),
      source: {
        ip: this.getClientIP(req),
        userAgent: req.headers.get('user-agent') || '',
      },
      user: userId ? { id: userId } : undefined,
      request: {
        method: req.method,
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
      },
    });
  }
  
  // Log data access
  logDataAccess(req: NextRequest, dataType: string, recordId?: string): void {
    this.logSecurityEvent({
      type: SecurityEventType.DATA_ACCESS,
      severity: SecuritySeverity.LOW,
      message: `Data access: ${dataType}`,
      timestamp: new Date().toISOString(),
      source: {
        ip: this.getClientIP(req),
        userAgent: req.headers.get('user-agent') || '',
      },
      request: {
        method: req.method,
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
      },
      metadata: {
        dataType,
        recordId,
      },
    });
  }
  
  // Private helper methods
  private sanitizeSecurityEvent(event: SecurityEvent): SecurityEvent {
    // Remove sensitive data from security events
    const sanitized = { ...event };
    
    // Sanitize request headers
    if (sanitized.request.headers) {
      sanitized.request.headers = this.sanitizeHeaders(new Headers(
        Object.entries(sanitized.request.headers)
      ));
    }
    
    // Remove sensitive body data
    if (sanitized.request.body) {
      sanitized.request.body = '[SANITIZED]';
    }
    
    return sanitized;
  }
  
  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    headers.forEach((value, key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }
  
  private getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0] ||
           req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           'unknown';
  }
  
  private detectSQLInjection(input: string): boolean {
    return THREAT_PATTERNS.sqlInjection.some(pattern => pattern.test(input));
  }
  
  private detectXSS(input: string): boolean {
    return THREAT_PATTERNS.xss.some(pattern => pattern.test(input));
  }
  
  private detectSuspiciousUserAgent(userAgent: string): boolean {
    return THREAT_PATTERNS.suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  }
  
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;
    
    const current = rateLimitTracking.get(ip);
    
    if (!current || now > current.resetTime) {
      rateLimitTracking.set(ip, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    current.count++;
    return current.count > maxRequests;
  }
  
  private async sendToSecurityMonitoring(event: SecurityEvent): Promise<void> {
    try {
      // In production, send to security monitoring service
      // Examples: Sentry, DataDog Security, AWS GuardDuty, etc.
      
      if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.HIGH) {
        // Send immediate alert for high-severity events
        console.log('HIGH SEVERITY SECURITY EVENT:', event.message);
      }
    } catch (error) {
      // Don't let security logging errors break the application
      console.error('Failed to send security event to monitoring:', error);
    }
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Security middleware for API routes
export const withSecurityLogging = (
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) => {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    // Analyze request for security threats
    const securityEvents = securityLogger.analyzeRequest(req);
    
    // Log any detected security events
    securityEvents.forEach(event => securityLogger.logSecurityEvent(event));
    
    // Block request if critical security threat detected
    const criticalEvents = securityEvents.filter(
      event => event.severity === SecuritySeverity.CRITICAL
    );
    
    if (criticalEvents.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Request blocked for security reasons' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    try {
      const response = await handler(req, ...args);
      
      // Log successful admin access if applicable
      if (req.url.includes('/admin/')) {
        securityLogger.logAdminAccess(req);
      }
      
      return response;
    } catch (error) {
      // Log security-related errors
      securityLogger.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.MEDIUM,
        message: 'Request processing error',
        timestamp: new Date().toISOString(),
        source: {
          ip: securityLogger.getClientIP(req),
          userAgent: req.headers.get('user-agent') || '',
        },
        request: {
          method: req.method,
          url: req.url,
          headers: securityLogger.sanitizeHeaders(req.headers),
        },
        metadata: {
          error: (error as Error).message,
        },
      });
      
      throw error;
    }
  };
};

export default securityLogger;