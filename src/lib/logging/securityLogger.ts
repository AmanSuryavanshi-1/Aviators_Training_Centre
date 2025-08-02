/**
 * Security Event Logging System
 * Logs security-related events for monitoring and compliance
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  MEMBER_VALIDATION_FAILED = 'MEMBER_VALIDATION_FAILED',
  JWT_TOKEN_INVALID = 'JWT_TOKEN_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  STUDIO_ACCESS = 'STUDIO_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
}

export enum SecurityEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  resource?: string;
  action?: string;
  success: boolean;
  message: string;
  metadata?: Record<string, any>;
  riskScore?: number;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  failedLogins: number;
  successfulLogins: number;
  suspiciousActivities: number;
  uniqueUsers: number;
  uniqueIPs: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private eventBuffer: SecurityEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  constructor() {
    this.startFlushTimer();
  }

  /**
   * Log a security event
   */
  async logEvent(
    type: SecurityEventType,
    success: boolean,
    message: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity: this.determineSeverity(type, success),
      timestamp: new Date().toISOString(),
      success,
      message,
      riskScore: this.calculateRiskScore(type, success, context),
      ...context,
    };

    // Add to buffer
    this.eventBuffer.push(event);

    // Immediate flush for critical events
    if (event.severity === SecurityEventSeverity.CRITICAL) {
      await this.flushEvents();
    }

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushEvents();
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 Security Event [${event.severity}]:`, event);
    }
  }

  /**
   * Log successful login
   */
  async logLoginSuccess(userId: string, email: string, context: Partial<SecurityEvent> = {}): Promise<void> {
    await this.logEvent(
      SecurityEventType.LOGIN_SUCCESS,
      true,
      `User ${email} logged in successfully`,
      {
        userId,
        email,
        ...context,
      }
    );
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailed(email: string, reason: string, context: Partial<SecurityEvent> = {}): Promise<void> {
    await this.logEvent(
      SecurityEventType.LOGIN_FAILED,
      false,
      `Login failed for ${email}: ${reason}`,
      {
        email,
        metadata: { reason },
        ...context,
      }
    );
  }

  /**
   * Log logout
   */
  async logLogout(userId: string, email: string, context: Partial<SecurityEvent> = {}): Promise<void> {
    await this.logEvent(
      SecurityEventType.LOGOUT,
      true,
      `User ${email} logged out`,
      {
        userId,
        email,
        ...context,
      }
    );
  }

  /**
   * Log session expiry
   */
  async logSessionExpired(userId: string, email: string, context: Partial<SecurityEvent> = {}): Promise<void> {
    await this.logEvent(
      SecurityEventType.SESSION_EXPIRED,
      false,
      `Session expired for user ${email}`,
      {
        userId,
        email,
        ...context,
      }
    );
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    resource: string,
    action: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      false,
      `Unauthorized access attempt to ${resource} (${action})`,
      {
        resource,
        action,
        ...context,
      }
    );
  }

  /**
   * Log member validation failure
   */
  async logMemberValidationFailed(
    email: string,
    reason: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.MEMBER_VALIDATION_FAILED,
      false,
      `Member validation failed for ${email}: ${reason}`,
      {
        email,
        metadata: { reason },
        ...context,
      }
    );
  }

  /**
   * Log admin access
   */
  async logAdminAccess(
    userId: string,
    email: string,
    resource: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.ADMIN_ACCESS,
      true,
      `Admin ${email} accessed ${resource}`,
      {
        userId,
        email,
        resource,
        ...context,
      }
    );
  }

  /**
   * Log Studio access
   */
  async logStudioAccess(
    userId: string,
    email: string,
    path: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.STUDIO_ACCESS,
      true,
      `User ${email} accessed Studio: ${path}`,
      {
        userId,
        email,
        resource: path,
        ...context,
      }
    );
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    description: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      false,
      `Suspicious activity detected: ${description}`,
      {
        metadata: { description },
        ...context,
      }
    );
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    resource: string,
    context: Partial<SecurityEvent> = {}
  ): Promise<void> {
    await this.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      false,
      `Rate limit exceeded for ${resource}`,
      {
        resource,
        ...context,
      }
    );
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(timeRange?: { start: Date; end: Date }): Promise<SecurityMetrics> {
    const events = await this.getEvents(timeRange);
    
    const metrics: SecurityMetrics = {
      totalEvents: events.length,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: {} as Record<SecurityEventSeverity, number>,
      failedLogins: 0,
      successfulLogins: 0,
      suspiciousActivities: 0,
      uniqueUsers: new Set<string>(),
      uniqueIPs: new Set<string>(),
      timeRange: {
        start: timeRange?.start.toISOString() || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: timeRange?.end.toISOString() || new Date().toISOString(),
      },
    };

    // Initialize counters
    Object.values(SecurityEventType).forEach(type => {
      metrics.eventsByType[type] = 0;
    });
    Object.values(SecurityEventSeverity).forEach(severity => {
      metrics.eventsBySeverity[severity] = 0;
    });

    // Process events
    events.forEach(event => {
      metrics.eventsByType[event.type]++;
      metrics.eventsBySeverity[event.severity]++;

      if (event.type === SecurityEventType.LOGIN_FAILED) {
        metrics.failedLogins++;
      }
      if (event.type === SecurityEventType.LOGIN_SUCCESS) {
        metrics.successfulLogins++;
      }
      if (event.type === SecurityEventType.SUSPICIOUS_ACTIVITY) {
        metrics.suspiciousActivities++;
      }

      if (event.userId) {
        (metrics.uniqueUsers as Set<string>).add(event.userId);
      }
      if (event.ipAddress) {
        (metrics.uniqueIPs as Set<string>).add(event.ipAddress);
      }
    });

    // Convert sets to counts
    metrics.uniqueUsers = (metrics.uniqueUsers as Set<string>).size;
    metrics.uniqueIPs = (metrics.uniqueIPs as Set<string>).size;

    return metrics;
  }

  /**
   * Get recent security events
   */
  async getRecentEvents(limit: number = 50): Promise<SecurityEvent[]> {
    const events = await this.getEvents();
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Determine event severity
   */
  private determineSeverity(type: SecurityEventType, success: boolean): SecurityEventSeverity {
    if (!success) {
      switch (type) {
        case SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT:
        case SecurityEventType.SUSPICIOUS_ACTIVITY:
        case SecurityEventType.ACCOUNT_LOCKED:
          return SecurityEventSeverity.CRITICAL;
        
        case SecurityEventType.LOGIN_FAILED:
        case SecurityEventType.MEMBER_VALIDATION_FAILED:
        case SecurityEventType.JWT_TOKEN_INVALID:
        case SecurityEventType.PERMISSION_DENIED:
          return SecurityEventSeverity.ERROR;
        
        case SecurityEventType.RATE_LIMIT_EXCEEDED:
        case SecurityEventType.SESSION_EXPIRED:
          return SecurityEventSeverity.WARNING;
        
        default:
          return SecurityEventSeverity.WARNING;
      }
    }

    switch (type) {
      case SecurityEventType.ADMIN_ACCESS:
      case SecurityEventType.CONFIGURATION_CHANGE:
        return SecurityEventSeverity.WARNING;
      
      default:
        return SecurityEventSeverity.INFO;
    }
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    type: SecurityEventType,
    success: boolean,
    context: Partial<SecurityEvent>
  ): number {
    let score = 0;

    // Base score by event type
    const typeScores = {
      [SecurityEventType.LOGIN_SUCCESS]: 1,
      [SecurityEventType.LOGIN_FAILED]: 5,
      [SecurityEventType.LOGOUT]: 1,
      [SecurityEventType.SESSION_EXPIRED]: 2,
      [SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT]: 8,
      [SecurityEventType.MEMBER_VALIDATION_FAILED]: 7,
      [SecurityEventType.JWT_TOKEN_INVALID]: 6,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: 4,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: 9,
      [SecurityEventType.ADMIN_ACCESS]: 3,
      [SecurityEventType.STUDIO_ACCESS]: 2,
      [SecurityEventType.PERMISSION_DENIED]: 6,
      [SecurityEventType.ACCOUNT_LOCKED]: 8,
      [SecurityEventType.PASSWORD_RESET_REQUEST]: 3,
      [SecurityEventType.CONFIGURATION_CHANGE]: 5,
    };

    score = typeScores[type] || 1;

    // Adjust for success/failure
    if (!success) {
      score *= 1.5;
    }

    // Adjust for repeated failures from same IP
    if (context.ipAddress && !success) {
      // This would require checking recent events from the same IP
      // For now, we'll add a base increase
      score += 2;
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Flush events to storage
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await this.persistEvents(eventsToFlush);
    } catch (error) {
      console.error('Failed to flush security events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Persist events to storage
   */
  private async persistEvents(events: SecurityEvent[]): Promise<void> {
    // Store in localStorage for client-side events
    if (typeof window !== 'undefined') {
      try {
        const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
        const allEvents = [...existingEvents, ...events];
        
        // Keep only last 1000 events
        if (allEvents.length > 1000) {
          allEvents.splice(0, allEvents.length - 1000);
        }
        
        localStorage.setItem('security_events', JSON.stringify(allEvents));
      } catch (error) {
        console.error('Failed to store security events locally:', error);
      }
    }

    // Send to external logging service
    if (process.env.SECURITY_LOG_ENDPOINT) {
      try {
        await fetch(process.env.SECURITY_LOG_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SECURITY_LOG_API_KEY}`,
          },
          body: JSON.stringify({ events }),
        });
      } catch (error) {
        console.error('Failed to send security events to external service:', error);
      }
    }

    // Log to server-side storage (database, file, etc.)
    if (typeof window === 'undefined') {
      try {
        await this.logToServerStorage(events);
      } catch (error) {
        console.error('Failed to log security events to server storage:', error);
      }
    }
  }

  /**
   * Get events from storage
   */
  private async getEvents(timeRange?: { start: Date; end: Date }): Promise<SecurityEvent[]> {
    let events: SecurityEvent[] = [];

    // Get from localStorage
    if (typeof window !== 'undefined') {
      try {
        events = JSON.parse(localStorage.getItem('security_events') || '[]');
      } catch (error) {
        console.error('Failed to get security events from localStorage:', error);
      }
    }

    // Filter by time range if provided
    if (timeRange) {
      events = events.filter(event => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= timeRange.start && eventTime <= timeRange.end;
      });
    }

    return events;
  }

  /**
   * Log to server-side storage
   */
  private async logToServerStorage(events: SecurityEvent[]): Promise<void> {
    // This would be implemented based on your server-side storage solution
    // Examples: Database, file system, external logging service
    console.log(`Logging ${events.length} security events to server storage`);
  }

  /**
   * Cleanup old events
   */
  async cleanupOldEvents(olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    if (typeof window !== 'undefined') {
      try {
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        const filteredEvents = events.filter((event: SecurityEvent) => 
          new Date(event.timestamp) > cutoffDate
        );
        localStorage.setItem('security_events', JSON.stringify(filteredEvents));
      } catch (error) {
        console.error('Failed to cleanup old security events:', error);
      }
    }
  }

  /**
   * Destroy instance and cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance();