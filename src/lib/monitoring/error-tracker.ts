/**
 * Error tracking and alerting system for blog operations
 * Tracks errors, categorizes them, and provides alerting mechanisms
 */

interface ErrorEvent {
  id: string;
  timestamp: Date;
  operation: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    metadata?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface ErrorStats {
  operation: string;
  totalErrors: number;
  errorRate: number;
  commonErrors: Array<{
    message: string;
    count: number;
    lastOccurrence: Date;
  }>;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface AlertRule {
  id: string;
  name: string;
  condition: (errors: ErrorEvent[]) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldownMinutes: number;
  lastTriggered?: Date;
  enabled: boolean;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private readonly maxErrors = 50000; // Keep last 50k errors
  private alertRules: AlertRule[] = [];
  private alertCallbacks: Array<(alert: { rule: AlertRule; errors: ErrorEvent[] }) => void> = [];

  constructor() {
    this.initializeDefaultAlertRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (errors) => {
          const recentErrors = this.getRecentErrors(15); // Last 15 minutes
          const errorRate = recentErrors.length / 15; // Errors per minute
          return errorRate > 5; // More than 5 errors per minute
        },
        severity: 'high',
        cooldownMinutes: 30,
        enabled: true,
      },
      {
        id: 'critical-error',
        name: 'Critical Error Occurred',
        condition: (errors) => {
          const recentCritical = this.getRecentErrors(5).filter(e => e.severity === 'critical');
          return recentCritical.length > 0;
        },
        severity: 'critical',
        cooldownMinutes: 5,
        enabled: true,
      },
      {
        id: 'sanity-sync-failure',
        name: 'Sanity Sync Failure',
        condition: (errors) => {
          const syncErrors = this.getRecentErrors(10).filter(e => 
            e.operation.includes('sanity') || e.operation.includes('sync')
          );
          return syncErrors.length > 3;
        },
        severity: 'high',
        cooldownMinutes: 15,
        enabled: true,
      },
      {
        id: 'blog-loading-failure',
        name: 'Blog Loading Failure',
        condition: (errors) => {
          const loadingErrors = this.getRecentErrors(10).filter(e => 
            e.operation.includes('blog') && e.operation.includes('load')
          );
          return loadingErrors.length > 5;
        },
        severity: 'medium',
        cooldownMinutes: 20,
        enabled: true,
      },
    ];
  }

  /**
   * Track an error
   */
  trackError(
    operation: string,
    error: Error,
    context: ErrorEvent['context'] = {},
    severity: ErrorEvent['severity'] = 'medium'
  ): string {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      operation,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      context,
      severity,
      resolved: false,
    };

    this.errors.push(errorEvent);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Check alert rules
    this.checkAlertRules();

    // Log error based on severity
    this.logError(errorEvent);

    return errorEvent.id;
  }

  /**
   * Generate unique ID for error events
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error based on severity
   */
  private logError(errorEvent: ErrorEvent): void {
    const logMessage = `[${errorEvent.severity.toUpperCase()}] ${errorEvent.operation}: ${errorEvent.error.message}`;
    
    switch (errorEvent.severity) {
      case 'critical':
        console.error(logMessage, errorEvent);
        break;
      case 'high':
        console.error(logMessage);
        break;
      case 'medium':
        console.warn(logMessage);
        break;
      case 'low':
        console.log(logMessage);
        break;
    }
  }

  /**
   * Check alert rules and trigger alerts
   */
  private checkAlertRules(): void {
    const now = new Date();

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldownMinutes * 60 * 1000);
        if (now < cooldownEnd) continue;
      }

      // Check condition
      if (rule.condition(this.errors)) {
        rule.lastTriggered = now;
        const relevantErrors = this.getRecentErrors(rule.cooldownMinutes);
        
        // Trigger alert callbacks
        this.alertCallbacks.forEach(callback => {
          try {
            callback({ rule, errors: relevantErrors });
          } catch (error) {
            console.error('Error in alert callback:', error);
          }
        });
      }
    }
  }

  /**
   * Get recent errors within specified minutes
   */
  private getRecentErrors(minutes: number): ErrorEvent[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(e => e.timestamp > cutoffTime);
  }

  /**
   * Get error statistics for an operation
   */
  getErrorStats(operation: string): ErrorStats | null {
    const operationErrors = this.errors.filter(e => e.operation === operation);
    
    if (operationErrors.length === 0) {
      return null;
    }

    // Calculate error rate (errors per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = operationErrors.filter(e => e.timestamp > oneHourAgo);
    const errorRate = recentErrors.length;

    // Find common errors
    const errorCounts = new Map<string, { count: number; lastOccurrence: Date }>();
    operationErrors.forEach(e => {
      const key = e.error.message;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
        if (e.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = e.timestamp;
        }
      } else {
        errorCounts.set(key, { count: 1, lastOccurrence: e.timestamp });
      }
    });

    const commonErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Severity breakdown
    const severityBreakdown = {
      low: operationErrors.filter(e => e.severity === 'low').length,
      medium: operationErrors.filter(e => e.severity === 'medium').length,
      high: operationErrors.filter(e => e.severity === 'high').length,
      critical: operationErrors.filter(e => e.severity === 'critical').length,
    };

    return {
      operation,
      totalErrors: operationErrors.length,
      errorRate,
      commonErrors,
      severityBreakdown,
    };
  }

  /**
   * Get all error statistics
   */
  getAllErrorStats(): ErrorStats[] {
    const operations = [...new Set(this.errors.map(e => e.operation))];
    return operations.map(op => this.getErrorStats(op)).filter(Boolean) as ErrorStats[];
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number;
    topErrorOperations: Array<{ operation: string; count: number }>;
    alertsTriggered: number;
    lastHour: {
      errors: number;
      criticalErrors: number;
      operations: string[];
    };
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo);
    
    const operationCounts = new Map<string, number>();
    this.errors.forEach(e => {
      operationCounts.set(e.operation, (operationCounts.get(e.operation) || 0) + 1);
    });

    const topErrorOperations = Array.from(operationCounts.entries())
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const alertsTriggered = this.alertRules.filter(rule => rule.lastTriggered).length;

    return {
      totalErrors: this.errors.length,
      criticalErrors: this.errors.filter(e => e.severity === 'critical').length,
      errorRate: recentErrors.length,
      topErrorOperations,
      alertsTriggered,
      lastHour: {
        errors: recentErrors.length,
        criticalErrors: recentErrors.filter(e => e.severity === 'critical').length,
        operations: [...new Set(recentErrors.map(e => e.operation))],
      },
    };
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: { rule: AlertRule; errors: ErrorEvent[] }) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorEvent[] {
    return this.errors.filter(e => !e.resolved);
  }

  /**
   * Clear old errors
   */
  clearOldErrors(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.errors = this.errors.filter(e => e.timestamp > cutoffTime);
  }

  /**
   * Export errors for external analysis
   */
  exportErrors(operation?: string): ErrorEvent[] {
    if (operation) {
      return this.errors.filter(e => e.operation === operation);
    }
    return [...this.errors];
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Utility function for easy error tracking
export function withErrorTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: ErrorEvent['context'],
  severity?: ErrorEvent['severity']
): Promise<T> {
  return fn().catch(error => {
    errorTracker.trackError(operation, error, context, severity);
    throw error;
  });
}

export type { ErrorEvent, ErrorStats, AlertRule };