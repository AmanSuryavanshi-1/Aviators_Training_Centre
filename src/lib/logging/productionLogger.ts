/**
 * Production Logger
 * Structured logging for authentication events and system monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_expired' | 'unauthorized_access' | 'rate_limit_exceeded';
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    // Start periodic flush in production
    if (process.env.NODE_ENV === 'production') {
      this.startPeriodicFlush();
    }
  }

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  /**
   * Log debug message
   */
  debug(message: string, category: string = 'general', metadata?: Record<string, any>): void {
    this.log('debug', message, category, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, category: string = 'general', metadata?: Record<string, any>): void {
    this.log('info', message, category, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, category: string = 'general', metadata?: Record<string, any>): void {
    this.log('warn', message, category, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, category: string = 'general', error?: Error, metadata?: Record<string, any>): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log('error', message, category, metadata, errorData);
  }

  /**
   * Log critical message
   */
  critical(message: string, category: string = 'general', error?: Error, metadata?: Record<string, any>): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log('critical', message, category, metadata, errorData);

    // Immediately flush critical logs
    this.flush();
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: SecurityEvent): void {
    const message = this.formatSecurityEventMessage(event);
    
    this.log('info', message, 'security', {
      eventType: event.type,
      userId: event.userId,
      email: this.sanitizeEmail(event.email),
      ip: event.ip,
      userAgent: this.sanitizeUserAgent(event.userAgent),
      details: event.details,
    });

    // Log failed attempts as warnings
    if (event.type === 'login_failure' || event.type === 'unauthorized_access' || event.type === 'rate_limit_exceeded') {
      this.warn(`Security event: ${event.type}`, 'security', {
        eventType: event.type,
        ip: event.ip,
        email: this.sanitizeEmail(event.email),
      });
    }
  }

  /**
   * Log authentication attempt
   */
  logAuthAttempt(email: string, ip: string, userAgent: string, success: boolean, error?: string): void {
    this.logSecurityEvent({
      type: success ? 'login_success' : 'login_failure',
      email,
      ip,
      userAgent,
      details: error ? { error } : undefined,
    });
  }

  /**
   * Log session event
   */
  logSessionEvent(type: 'created' | 'refreshed' | 'expired' | 'destroyed', userId: string, sessionId: string, metadata?: Record<string, any>): void {
    this.info(`Session ${type}`, 'session', {
      userId,
      sessionId,
      ...metadata,
    });
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string, ip?: string): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    this.log(level, `${method} ${path} - ${statusCode}`, 'api', {
      method,
      path,
      statusCode,
      duration,
      userId,
      ip,
    });
  }

  /**
   * Log system event
   */
  logSystemEvent(event: string, category: string = 'system', metadata?: Record<string, any>): void {
    this.info(event, category, metadata);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    category: string,
    metadata?: Record<string, any>,
    error?: { name: string; message: string; stack?: string }
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      metadata,
      error,
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Console output in development or for critical logs
    if (process.env.NODE_ENV === 'development' || level === 'critical') {
      this.consoleOutput(entry);
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flush();
    }
  }

  /**
   * Console output for development
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = entry.timestamp.substring(11, 19); // HH:MM:SS
    const prefix = `[${timestamp}] ${entry.level.toUpperCase()} [${entry.category}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix} ${entry.message}`, entry.metadata || '');
        break;
      case 'info':
        console.info(`${prefix} ${entry.message}`, entry.metadata || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${entry.message}`, entry.metadata || '');
        break;
      case 'error':
      case 'critical':
        console.error(`${prefix} ${entry.message}`, entry.error || entry.metadata || '');
        break;
    }
  }

  /**
   * Format security event message
   */
  private formatSecurityEventMessage(event: SecurityEvent): string {
    switch (event.type) {
      case 'login_attempt':
        return `Login attempt for ${this.sanitizeEmail(event.email)}`;
      case 'login_success':
        return `Successful login for ${this.sanitizeEmail(event.email)}`;
      case 'login_failure':
        return `Failed login attempt for ${this.sanitizeEmail(event.email)}`;
      case 'logout':
        return `User logout: ${event.userId}`;
      case 'session_expired':
        return `Session expired for user: ${event.userId}`;
      case 'unauthorized_access':
        return `Unauthorized access attempt to protected resource`;
      case 'rate_limit_exceeded':
        return `Rate limit exceeded from IP: ${event.ip}`;
      default:
        return `Security event: ${event.type}`;
    }
  }

  /**
   * Sanitize email for logging (keep domain, mask username)
   */
  private sanitizeEmail(email?: string): string {
    if (!email) return 'unknown';
    
    const [username, domain] = email.split('@');
    if (!domain) return 'invalid-email';
    
    const maskedUsername = username.length > 2 
      ? `${username[0]}***${username[username.length - 1]}`
      : '***';
    
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Sanitize user agent for logging
   */
  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    // Extract browser and OS info, remove detailed version numbers
    const simplified = userAgent
      .replace(/\d+\.\d+\.\d+/g, 'x.x.x') // Replace version numbers
      .substring(0, 100); // Limit length
    
    return simplified;
  }

  /**
   * Flush log buffer
   */
  private flush(): void {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    // In production, send logs to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logs).catch(error => {
        console.error('Failed to send logs to external service:', error);
        // Re-add logs to buffer for retry
        this.logBuffer.unshift(...logs.slice(-10)); // Keep last 10 logs
      });
    }
  }

  /**
   * Send logs to external logging service
   */
  private async sendToExternalService(logs: LogEntry[]): Promise<void> {
    // In a real implementation, send to services like:
    // - CloudWatch Logs
    // - Datadog
    // - LogRocket
    // - Sentry
    
    // For now, just log to console in production
    console.log('📊 Flushing logs to external service:', {
      count: logs.length,
      levels: logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Stop periodic flush
   */
  private stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    bufferSize: number;
    totalLogged: number;
    levelCounts: Record<LogLevel, number>;
  } {
    const levelCounts = this.logBuffer.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    return {
      bufferSize: this.logBuffer.length,
      totalLogged: this.logBuffer.length, // In real implementation, track total
      levelCounts,
    };
  }

  /**
   * Clear log buffer (for testing)
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Destroy logger instance
   */
  destroy(): void {
    this.stopPeriodicFlush();
    this.flush();
    this.clearBuffer();
  }
}

// Export singleton instance
export const productionLogger = ProductionLogger.getInstance();

// Export convenience functions
export const {
  debug,
  info,
  warn,
  error,
  critical,
  logSecurityEvent,
  logAuthAttempt,
  logSessionEvent,
  logApiRequest,
  logSystemEvent,
} = productionLogger;