/**
 * Production logging system with security and performance considerations
 * Implements structured logging with sensitive data filtering
 */

import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Sensitive data patterns to filter
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /api[_-]?key/i,
  /bearer/i,
  /authorization/i,
  /session/i,
  /cookie/i,
];

// Sensitive header names
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
];

// Production logger class
class ProductionLogger {
  private logLevel: LogLevel;
  private context: string;

  constructor(context: string = 'app', logLevel?: LogLevel) {
    this.context = context;
    this.logLevel = logLevel ?? this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      default: return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  // Sanitize sensitive data
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Check if key matches sensitive patterns
      const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Sanitize request data
  private sanitizeRequest(req: NextRequest): Record<string, any> {
    const headers: Record<string, string> = {};
    
    req.headers.forEach((value, key) => {
      if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
        headers[key] = '[REDACTED]';
      } else {
        headers[key] = value;
      }
    });

    return {
      method: req.method,
      url: req.url,
      headers,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    };
  }

  // Create log entry
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
    };

    if (metadata) {
      entry.metadata = this.sanitizeData(metadata);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    return entry;
  }

  // Output log entry
  private output(entry: LogEntry): void {
    if (entry.level > this.logLevel) {
      return;
    }

    const logString = JSON.stringify(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.INFO:
        console.info(logString);
        break;
      case LogLevel.DEBUG:
        console.debug(logString);
        break;
    }

    // In production, you might want to send logs to external service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Send to Sentry or other logging service
      this.sendToExternalService(entry);
    }
  }

  // Send logs to external service (placeholder)
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Implementation would depend on your logging service
      // Examples: Sentry, LogRocket, DataDog, etc.
      
      if (entry.level === LogLevel.ERROR && entry.error) {
        // Send error to error tracking service
        console.log('Would send error to external service:', entry.error.message);
      }
    } catch (error) {
      // Don't let logging errors break the application
      console.error('Failed to send log to external service:', error);
    }
  }

  // Public logging methods
  error(message: string, metadata?: Record<string, any>, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, error);
    this.output(entry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
    this.output(entry);
  }

  info(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    this.output(entry);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    this.output(entry);
  }

  // Request logging
  logRequest(req: NextRequest, metadata?: Record<string, any>): void {
    const requestData = this.sanitizeRequest(req);
    this.info('HTTP Request', {
      ...requestData,
      ...metadata,
    });
  }

  // Response logging
  logResponse(
    req: NextRequest,
    status: number,
    responseTime: number,
    metadata?: Record<string, any>
  ): void {
    const requestData = this.sanitizeRequest(req);
    this.info('HTTP Response', {
      ...requestData,
      status,
      responseTime,
      ...metadata,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info('Performance Metric', {
      operation,
      duration,
      ...metadata,
    });
  }

  // Security event logging
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', metadata?: Record<string, any>): void {
    this.warn('Security Event', {
      event,
      severity,
      ...metadata,
    });
  }

  // Business event logging
  logBusinessEvent(event: string, metadata?: Record<string, any>): void {
    this.info('Business Event', {
      event,
      ...metadata,
    });
  }
}

// Create logger instances for different contexts
export const createLogger = (context: string): ProductionLogger => {
  return new ProductionLogger(context);
};

// Default logger instances
export const logger = new ProductionLogger('app');
export const apiLogger = new ProductionLogger('api');
export const blogLogger = new ProductionLogger('blog');
export const adminLogger = new ProductionLogger('admin');
export const cacheLogger = new ProductionLogger('cache');
export const securityLogger = new ProductionLogger('security');

// Request logging middleware
export const withRequestLogging = (
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) => {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Log incoming request
    apiLogger.logRequest(req, { requestId });
    
    try {
      const response = await handler(req, ...args);
      const responseTime = Date.now() - startTime;
      
      // Log successful response
      apiLogger.logResponse(req, response.status, responseTime, { requestId });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log error response
      apiLogger.error('Request failed', {
        requestId,
        responseTime,
        url: req.url,
        method: req.method,
      }, error as Error);
      
      throw error;
    }
  };
};

// Performance monitoring decorator
export const withPerformanceLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      logger.logPerformance(operationName, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`Operation failed: ${operationName}`, {
        duration,
        operationName,
      }, error as Error);
      
      throw error;
    }
  };
};

export default logger;