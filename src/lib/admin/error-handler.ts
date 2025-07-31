import { BlogHealthChecker, BlogErrorBoundary, blogCircuitBreakers } from '@/lib/blog/error-handling';

// Admin-specific error handling
export class AdminErrorHandler {
  private static errorLog: Array<{
    timestamp: string;
    component: string;
    operation: string;
    error: string;
    stack?: string;
    context?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  private static readonly MAX_ERROR_LOG = 500;

  static logError(
    error: Error,
    context: {
      component: string;
      operation: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      additionalContext?: any;
    }
  ): void {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      component: context.component,
      operation: context.operation,
      error: error.message,
      stack: error.stack,
      context: context.additionalContext,
      severity: context.severity || 'medium',
    };

    this.errorLog.push(errorEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.MAX_ERROR_LOG) {
      this.errorLog.shift();
    }

    // Log to console with appropriate level
    const logLevel = this.getConsoleLogLevel(errorEntry.severity);
    console[logLevel](`[Admin Error - ${context.component}:${context.operation}]`, {
      error: error.message,
      severity: errorEntry.severity,
      timestamp: errorEntry.timestamp,
      context: context.additionalContext,
    });

    // Report critical errors immediately
    if (errorEntry.severity === 'critical') {
      this.reportCriticalError(errorEntry);
    }
  }

  private static getConsoleLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low': return 'log';
      case 'medium': return 'warn';
      case 'high':
      case 'critical': return 'error';
      default: return 'warn';
    }
  }

  private static reportCriticalError(errorEntry: typeof this.errorLog[0]): void {
    // In production, this would send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to analytics or error tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: `Critical Admin Error: ${errorEntry.component}:${errorEntry.operation}`,
            fatal: true,
          });
        }
      } catch (reportingError) {
        console.error('Failed to report critical error:', reportingError);
      }
    }
  }

  static getErrorLog(options: {
    component?: string;
    severity?: string;
    limit?: number;
    since?: string;
  } = {}): typeof this.errorLog {
    let filteredLog = [...this.errorLog];

    if (options.component) {
      filteredLog = filteredLog.filter(entry => 
        entry.component.toLowerCase().includes(options.component!.toLowerCase())
      );
    }

    if (options.severity) {
      filteredLog = filteredLog.filter(entry => entry.severity === options.severity);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      filteredLog = filteredLog.filter(entry => 
        new Date(entry.timestamp) >= sinceDate
      );
    }

    if (options.limit) {
      filteredLog = filteredLog.slice(-options.limit);
    }

    return filteredLog.reverse(); // Most recent first
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    recentErrors: number;
    criticalErrors: number;
  } {
    const total = this.errorLog.length;
    const bySeverity = this.errorLog.reduce((acc, entry) => {
      acc[entry.severity] = (acc[entry.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byComponent = this.errorLog.reduce((acc, entry) => {
      acc[entry.component] = (acc[entry.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.errorLog.filter(entry => 
      new Date(entry.timestamp) >= oneHourAgo
    ).length;

    const criticalErrors = this.errorLog.filter(entry => 
      entry.severity === 'critical'
    ).length;

    return {
      total,
      bySeverity,
      byComponent,
      recentErrors,
      criticalErrors,
    };
  }

  // Wrapper for admin operations with comprehensive error handling
  static async safeAdminOperation<T>(
    operation: () => Promise<T>,
    context: {
      component: string;
      operation: string;
      fallback?: () => T;
      retries?: number;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const { component, operation: operationName, fallback, retries = 2 } = context;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await operation();
        
        // Log successful operation (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Admin operation successful: ${component}:${operationName}`);
        }
        
        return { success: true, data: result };
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const severity = isLastAttempt ? 'high' : 'medium';
        
        this.logError(error as Error, {
          component,
          operation: operationName,
          severity,
          additionalContext: { attempt: attempt + 1, maxAttempts: retries + 1 },
        });

        if (isLastAttempt) {
          if (fallback) {
            try {
              const fallbackResult = fallback();
              console.warn(`Using fallback for ${component}:${operationName}`);
              return { success: true, data: fallbackResult };
            } catch (fallbackError) {
              this.logError(fallbackError as Error, {
                component,
                operation: `${operationName}_fallback`,
                severity: 'critical',
              });
            }
          }
          
          return { 
            success: false, 
            error: (error as Error).message 
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return { success: false, error: 'Operation failed after all retries' };
  }

  // Check admin system health
  static async checkAdminHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
    systemStatus: any;
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check overall system health
      const systemHealth = await BlogHealthChecker.performHealthCheck();
      
      if (!systemHealth.overall) {
        issues.push('System health check failed');
        recommendations.push('Check Sanity connection and API endpoints');
      }

      // Check circuit breaker states
      const openCircuitBreakers = Object.entries(blogCircuitBreakers)
        .filter(([_, breaker]) => breaker.getState() === 'OPEN')
        .map(([name]) => name);

      if (openCircuitBreakers.length > 0) {
        issues.push(`Circuit breakers open: ${openCircuitBreakers.join(', ')}`);
        recommendations.push('Reset circuit breakers or wait for auto-recovery');
      }

      // Check error rates
      const errorStats = this.getErrorStats();
      if (errorStats.criticalErrors > 0) {
        issues.push(`${errorStats.criticalErrors} critical errors logged`);
        recommendations.push('Review critical errors and fix underlying issues');
      }

      if (errorStats.recentErrors > 10) {
        issues.push(`High error rate: ${errorStats.recentErrors} errors in the last hour`);
        recommendations.push('Investigate recent error patterns');
      }

      // Check fallback mode
      if (BlogErrorBoundary.isFallbackMode()) {
        issues.push('System is in fallback mode');
        recommendations.push('Reset error boundary or restart the application');
      }

      return {
        healthy: issues.length === 0,
        issues,
        recommendations,
        systemStatus: systemHealth,
      };
    } catch (error) {
      this.logError(error as Error, {
        component: 'AdminErrorHandler',
        operation: 'checkAdminHealth',
        severity: 'critical',
      });

      return {
        healthy: false,
        issues: ['Failed to perform admin health check'],
        recommendations: ['Check system logs and restart if necessary'],
        systemStatus: null,
      };
    }
  }

  // Auto-fix common admin issues
  static async autoFixIssues(): Promise<{
    attempted: string[];
    successful: string[];
    failed: string[];
  }> {
    const attempted: string[] = [];
    const successful: string[] = [];
    const failed: string[] = [];

    try {
      // Reset error boundary if in fallback mode
      if (BlogErrorBoundary.isFallbackMode()) {
        attempted.push('Reset error boundary');
        try {
          BlogErrorBoundary.resetErrorCount();
          successful.push('Reset error boundary');
        } catch (error) {
          failed.push('Reset error boundary');
        }
      }

      // Reset open circuit breakers
      const openBreakers = Object.entries(blogCircuitBreakers)
        .filter(([_, breaker]) => breaker.getState() === 'OPEN');

      for (const [name, breaker] of openBreakers) {
        attempted.push(`Reset ${name} circuit breaker`);
        try {
          breaker.reset();
          successful.push(`Reset ${name} circuit breaker`);
        } catch (error) {
          failed.push(`Reset ${name} circuit breaker`);
        }
      }

      // Clear old error logs
      if (this.errorLog.length > 100) {
        attempted.push('Clear old error logs');
        try {
          this.errorLog = this.errorLog.slice(-50); // Keep last 50
          successful.push('Clear old error logs');
        } catch (error) {
          failed.push('Clear old error logs');
        }
      }

      return { attempted, successful, failed };
    } catch (error) {
      this.logError(error as Error, {
        component: 'AdminErrorHandler',
        operation: 'autoFixIssues',
        severity: 'high',
      });

      return {
        attempted: ['Auto-fix operation'],
        successful: [],
        failed: ['Auto-fix operation'],
      };
    }
  }
}

// Export singleton instance
export const adminErrorHandler = AdminErrorHandler;
