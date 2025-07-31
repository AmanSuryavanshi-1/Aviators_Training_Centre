import { logAutomationAction } from './audit-logger';
import { sendEditorNotification } from './notifications';
import { circuitBreakers } from './retry-handler';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for better classification
export type ErrorCategory = 
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'data_corruption'
  | 'system_resource'
  | 'external_service'
  | 'configuration'
  | 'user_input'
  | 'unknown';

// Enhanced error interface
export interface AutomationError {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context: {
    automationId?: string;
    operationName: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  };
  resolution?: {
    status: 'pending' | 'investigating' | 'resolved' | 'ignored';
    assignedTo?: string;
    notes?: string;
    resolvedAt?: string;
    resolution?: string;
  };
  impact: {
    affectedUsers?: number;
    affectedAutomations?: string[];
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    dataLoss: boolean;
    serviceDisruption: boolean;
  };
  recurrence?: {
    count: number;
    firstOccurrence: string;
    lastOccurrence: string;
    pattern?: string;
  };
}

// Error monitoring configuration
export interface ErrorMonitoringConfig {
  alertThresholds: {
    errorRatePercentage: number;
    errorCountPerHour: number;
    criticalErrorCount: number;
    circuitBreakerActivations: number;
  };
  notificationSettings: {
    immediateAlerts: ErrorSeverity[];
    digestFrequency: 'immediate' | 'hourly' | 'daily';
    escalationRules: Array<{
      condition: string;
      escalateTo: 'admin' | 'developer' | 'manager';
      delay: number; // minutes
    }>;
  };
  retentionPolicy: {
    lowSeverityDays: number;
    mediumSeverityDays: number;
    highSeverityDays: number;
    criticalSeverityDays: number;
  };
}

// Default configuration
const DEFAULT_CONFIG: ErrorMonitoringConfig = {
  alertThresholds: {
    errorRatePercentage: 10, // Alert if error rate exceeds 10%
    errorCountPerHour: 50,   // Alert if more than 50 errors per hour
    criticalErrorCount: 1,   // Alert immediately on any critical error
    circuitBreakerActivations: 1 // Alert on any circuit breaker activation
  },
  notificationSettings: {
    immediateAlerts: ['high', 'critical'],
    digestFrequency: 'hourly',
    escalationRules: [
      {
        condition: 'unresolved_critical_error_30min',
        escalateTo: 'manager',
        delay: 30
      },
      {
        condition: 'high_error_rate_1hour',
        escalateTo: 'developer',
        delay: 60
      }
    ]
  },
  retentionPolicy: {
    lowSeverityDays: 30,
    mediumSeverityDays: 90,
    highSeverityDays: 180,
    criticalSeverityDays: 365
  }
};

/**
 * Enhanced error handler with monitoring and alerting
 */
export class AutomationErrorMonitor {
  private config: ErrorMonitoringConfig;
  private errorBuffer: Map<string, AutomationError> = new Map();
  private alertCooldowns: Map<string, number> = new Map();

  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Reports an error to the monitoring system
   */
  async reportError(
    error: Error | string,
    context: AutomationError['context'],
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'unknown'
  ): Promise<string> {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const automationError: AutomationError = {
      id: errorId,
      timestamp,
      severity,
      category,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      impact: this.assessImpact(error, context, severity),
      resolution: {
        status: 'pending'
      }
    };

    // Check for recurring errors
    const recurrence = await this.checkRecurrence(automationError);
    if (recurrence) {
      automationError.recurrence = recurrence;
    }

    // Store error in buffer for analysis
    this.errorBuffer.set(errorId, automationError);

    // Log to audit system
    await logAutomationAction({
      type: 'system_error',
      automationId: context.automationId,
      status: 'failed',
      error: automationError.message,
      timestamp,
      metadata: {
        errorId,
        severity,
        category,
        operationName: context.operationName,
        impact: automationError.impact,
        recurrence: automationError.recurrence
      }
    });

    // Check if alerts should be triggered
    await this.checkAlertConditions(automationError);

    // Persist error for long-term storage
    await this.persistError(automationError);

    return errorId;
  }

  /**
   * Checks for recurring error patterns
   */
  private async checkRecurrence(error: AutomationError): Promise<AutomationError['recurrence'] | undefined> {
    try {
      // Look for similar errors in the last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // This would query your error storage system
      // For now, we'll simulate the check
      const similarErrors = Array.from(this.errorBuffer.values()).filter(e => 
        e.message === error.message &&
        e.context.operationName === error.context.operationName &&
        e.timestamp >= last24Hours
      );

      if (similarErrors.length > 0) {
        const firstOccurrence = similarErrors.reduce((earliest, current) => 
          current.timestamp < earliest.timestamp ? current : earliest
        ).timestamp;

        return {
          count: similarErrors.length + 1,
          firstOccurrence,
          lastOccurrence: error.timestamp,
          pattern: this.identifyPattern(similarErrors)
        };
      }

      return undefined;
    } catch (err) {
      console.error('Error checking recurrence:', err);
      return undefined;
    }
  }

  /**
   * Identifies patterns in recurring errors
   */
  private identifyPattern(errors: AutomationError[]): string {
    // Simple pattern detection - could be enhanced with ML
    const intervals = errors.slice(1).map((error, index) => 
      new Date(error.timestamp).getTime() - new Date(errors[index].timestamp).getTime()
    );

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval < 60000) { // Less than 1 minute
      return 'rapid_succession';
    } else if (avgInterval < 3600000) { // Less than 1 hour
      return 'frequent';
    } else if (avgInterval < 86400000) { // Less than 1 day
      return 'periodic';
    } else {
      return 'sporadic';
    }
  }

  /**
   * Assesses the impact of an error
   */
  private assessImpact(
    error: Error | string,
    context: AutomationError['context'],
    severity: ErrorSeverity
  ): AutomationError['impact'] {
    const message = error instanceof Error ? error.message : error;
    
    // Determine business impact based on error characteristics
    let businessImpact: AutomationError['impact']['businessImpact'] = 'low';
    let dataLoss = false;
    let serviceDisruption = false;

    // Check for critical system failures
    if (severity === 'critical' || message.includes('database') || message.includes('connection')) {
      businessImpact = 'critical';
      serviceDisruption = true;
    } else if (severity === 'high' || message.includes('validation') || message.includes('authentication')) {
      businessImpact = 'high';
    } else if (severity === 'medium') {
      businessImpact = 'medium';
    }

    // Check for data loss indicators
    if (message.includes('data loss') || message.includes('corruption') || message.includes('delete')) {
      dataLoss = true;
      businessImpact = 'critical';
    }

    return {
      businessImpact,
      dataLoss,
      serviceDisruption,
      affectedAutomations: context.automationId ? [context.automationId] : undefined
    };
  }

  /**
   * Checks if alert conditions are met and triggers notifications
   */
  private async checkAlertConditions(error: AutomationError): Promise<void> {
    const now = Date.now();
    
    // Check immediate alert conditions
    if (this.config.notificationSettings.immediateAlerts.includes(error.severity)) {
      await this.sendImmediateAlert(error);
    }

    // Check error rate thresholds
    await this.checkErrorRateThresholds();

    // Check circuit breaker status
    await this.checkCircuitBreakerStatus();

    // Check for escalation conditions
    await this.checkEscalationConditions(error);
  }

  /**
   * Sends immediate alert for critical errors
   */
  private async sendImmediateAlert(error: AutomationError): Promise<void> {
    const now = Date.now();
    const cooldownKey = `immediate_${error.severity}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
    const cooldownPeriod = error.severity === 'critical' ? 0 : 300000; // 5 minutes for non-critical

    if (now - lastAlert < cooldownPeriod) {
      return; // Still in cooldown period
    }

    try {
      await sendEditorNotification({
        type: 'system_alert',
        title: `${error.severity.toUpperCase()} Error Detected`,
        message: `A ${error.severity} error occurred in ${error.context.operationName}: ${error.message}`,
        priority: error.severity === 'critical' ? 'urgent' : 'high',
        automationId: error.context.automationId,
        timestamp: error.timestamp,
        recipientRole: 'admin'
      });

      this.alertCooldowns.set(cooldownKey, now);
    } catch (alertError) {
      console.error('Failed to send immediate alert:', alertError);
    }
  }

  /**
   * Checks error rate thresholds
   */
  private async checkErrorRateThresholds(): Promise<void> {
    const now = Date.now();
    const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
    const recentErrors = Array.from(this.errorBuffer.values()).filter(e => e.timestamp >= oneHourAgo);
    
    if (recentErrors.length >= this.config.alertThresholds.errorCountPerHour) {
      const cooldownKey = 'error_rate_threshold';
      const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
      
      if (now - lastAlert >= 3600000) { // 1 hour cooldown
        await sendEditorNotification({
          type: 'system_alert',
          title: 'High Error Rate Detected',
          message: `Error rate threshold exceeded: ${recentErrors.length} errors in the last hour`,
          priority: 'high',
          timestamp: new Date().toISOString(),
          recipientRole: 'admin'
        });
        
        this.alertCooldowns.set(cooldownKey, now);
      }
    }
  }

  /**
   * Checks circuit breaker status
   */
  private async checkCircuitBreakerStatus(): Promise<void> {
    const now = Date.now();
    const openCircuits = Object.entries(circuitBreakers)
      .filter(([_, breaker]) => breaker.getState().state === 'open');

    if (openCircuits.length >= this.config.alertThresholds.circuitBreakerActivations) {
      const cooldownKey = 'circuit_breaker_alert';
      const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
      
      if (now - lastAlert >= 1800000) { // 30 minutes cooldown
        await sendEditorNotification({
          type: 'system_alert',
          title: 'Circuit Breakers Activated',
          message: `${openCircuits.length} circuit breaker(s) are currently open: ${openCircuits.map(([name]) => name).join(', ')}`,
          priority: 'urgent',
          timestamp: new Date().toISOString(),
          recipientRole: 'admin'
        });
        
        this.alertCooldowns.set(cooldownKey, now);
      }
    }
  }

  /**
   * Checks escalation conditions
   */
  private async checkEscalationConditions(error: AutomationError): Promise<void> {
    // This would implement escalation rules based on configuration
    // For now, we'll implement basic escalation for critical unresolved errors
    
    if (error.severity === 'critical' && error.resolution?.status === 'pending') {
      // Schedule escalation check after 30 minutes
      setTimeout(async () => {
        const currentError = this.errorBuffer.get(error.id);
        if (currentError && currentError.resolution?.status === 'pending') {
          await sendEditorNotification({
            type: 'system_alert',
            title: 'Critical Error Escalation',
            message: `Critical error ${error.id} remains unresolved after 30 minutes: ${error.message}`,
            priority: 'urgent',
            timestamp: new Date().toISOString(),
            recipientRole: 'admin'
          });
        }
      }, 30 * 60 * 1000); // 30 minutes
    }
  }

  /**
   * Persists error for long-term storage and analysis
   */
  private async persistError(error: AutomationError): Promise<void> {
    try {
      // This would persist to your database/storage system
      // For now, we'll log it as an audit action
      await logAutomationAction({
        type: 'system_error',
        automationId: error.context.automationId,
        status: 'failed',
        error: error.message,
        timestamp: error.timestamp,
        metadata: {
          errorId: error.id,
          severity: error.severity,
          category: error.category,
          impact: error.impact,
          recurrence: error.recurrence,
          fullError: error
        }
      });
    } catch (persistError) {
      console.error('Failed to persist error:', persistError);
    }
  }

  /**
   * Generates a unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Gets error statistics for monitoring dashboard
   */
  async getErrorStatistics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalErrors: number;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    errorRate: number;
    topErrors: Array<{ message: string; count: number; severity: ErrorSeverity }>;
    resolutionStats: {
      resolved: number;
      pending: number;
      investigating: number;
      ignored: number;
    };
  }> {
    const cutoffTime = this.getCutoffTime(timeRange);
    const errors = Array.from(this.errorBuffer.values()).filter(e => e.timestamp >= cutoffTime);

    const errorsBySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const errorsByCategory = errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorCounts = new Map<string, { count: number; severity: ErrorSeverity }>();
    errors.forEach(error => {
      const key = error.message;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        errorCounts.set(key, { count: 1, severity: error.severity });
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const resolutionStats = errors.reduce((acc, error) => {
      const status = error.resolution?.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { resolved: 0, pending: 0, investigating: 0, ignored: 0 });

    return {
      totalErrors: errors.length,
      errorsBySeverity,
      errorsByCategory,
      errorRate: this.calculateErrorRate(errors, timeRange),
      topErrors,
      resolutionStats
    };
  }

  /**
   * Gets cutoff time for time range
   */
  private getCutoffTime(timeRange: '1h' | '24h' | '7d' | '30d'): string {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Calculates error rate as percentage
   */
  private calculateErrorRate(errors: AutomationError[], timeRange: string): number {
    // This would calculate based on total operations vs errors
    // For now, return a simplified calculation
    const hoursInRange = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const expectedOperations = hoursInRange * 10; // Assume 10 operations per hour baseline
    return errors.length > 0 ? (errors.length / expectedOperations) * 100 : 0;
  }

  /**
   * Updates error resolution status
   */
  async updateErrorResolution(
    errorId: string,
    resolution: Partial<AutomationError['resolution']>
  ): Promise<void> {
    const error = this.errorBuffer.get(errorId);
    if (error && error.resolution) {
      error.resolution = {
        ...error.resolution,
        ...resolution,
        ...(resolution.status === 'resolved' && { resolvedAt: new Date().toISOString() })
      };

      await logAutomationAction({
        type: 'system_error',
        automationId: error.context.automationId,
        status: 'success',
        timestamp: new Date().toISOString(),
        metadata: {
          action: 'error_resolution_updated',
          errorId,
          resolution
        }
      });
    }
  }

  /**
   * Cleans up old errors based on retention policy
   */
  async cleanupOldErrors(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [errorId, error] of Array.from(this.errorBuffer.entries())) {
      const errorAge = now - new Date(error.timestamp).getTime();
      const retentionDays = this.config.retentionPolicy[`${error.severity}SeverityDays` as keyof typeof this.config.retentionPolicy];
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

      if (errorAge > retentionMs) {
        this.errorBuffer.delete(errorId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await logAutomationAction({
        type: 'system_error',
        status: 'success',
        timestamp: new Date().toISOString(),
        metadata: {
          action: 'error_cleanup',
          cleanedCount,
          retentionPolicy: this.config.retentionPolicy
        }
      });
    }

    return cleanedCount;
  }
}

// Global error monitor instance
export const errorMonitor = new AutomationErrorMonitor();

// Global error handler for unhandled errors
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    await errorMonitor.reportError(
      reason instanceof Error ? reason : new Error(String(reason)),
      {
        operationName: 'unhandled_promise_rejection',
        metadata: { promise: promise.toString() }
      },
      'high',
      'unknown'
    );
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    
    await errorMonitor.reportError(
      error,
      {
        operationName: 'uncaught_exception'
      },
      'critical',
      'system_resource'
    );

    // Give time for error reporting before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}

// Health check for error monitoring system
export async function performErrorMonitoringHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    activeErrors: number;
    criticalErrors: number;
    errorRate: number;
    alertsInCooldown: number;
  };
  timestamp: string;
}> {
  const stats = await errorMonitor.getErrorStatistics('1h');
  const alertsInCooldown = Array.from(errorMonitor['alertCooldowns'].keys()).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (stats.errorsBySeverity.critical > 0 || stats.errorRate > 20) {
    status = 'unhealthy';
  } else if (stats.errorsBySeverity.high > 5 || stats.errorRate > 10) {
    status = 'degraded';
  }

  return {
    status,
    metrics: {
      activeErrors: stats.totalErrors,
      criticalErrors: stats.errorsBySeverity.critical || 0,
      errorRate: stats.errorRate,
      alertsInCooldown
    },
    timestamp: new Date().toISOString()
  };
}
