/**
 * Unified Error Handler for Analytics APIs
 * 
 * Centralized error handling system that provides consistent error responses,
 * user-friendly messages, and comprehensive logging for all analytics services.
 */

import { errorHandler, ErrorType, AuthError } from './ErrorHandler';

export interface UnifiedErrorResponse {
  success: false;
  error: {
    code: string;
    type: ErrorType;
    message: string;
    userMessage: string;
    solution?: string;
    service: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  fallbackData?: any;
  retryable: boolean;
  retryAfter?: number;
}

export interface ServiceErrorContext {
  service: 'ga4' | 'firebase' | 'search-console';
  operation: string;
  endpoint?: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  additionalContext?: Record<string, any>;
}

export class UnifiedErrorHandler {
  private static instance: UnifiedErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: Map<string, Date> = new Map();
  private readonly ERROR_THRESHOLD = 5;
  private readonly ERROR_WINDOW = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): UnifiedErrorHandler {
    if (!UnifiedErrorHandler.instance) {
      UnifiedErrorHandler.instance = new UnifiedErrorHandler();
    }
    return UnifiedErrorHandler.instance;
  }

  /**
   * Handle analytics API errors with unified response format
   */
  handleAnalyticsError(
    error: any,
    context: ServiceErrorContext,
    fallbackData?: any
  ): UnifiedErrorResponse {
    // Create standardized error using base error handler
    const authError = errorHandler.createErrorResponse(error, {
      service: context.service,
      operation: context.operation,
      endpoint: context.endpoint,
      timestamp: context.timestamp
    });

    // Track error frequency
    this.trackError(context.service, authError.code);

    // Determine if error is retryable
    const retryable = this.isRetryableError(authError);
    const retryAfter = this.getRetryDelay(context.service, authError.type);

    // Create unified response
    const unifiedResponse: UnifiedErrorResponse = {
      success: false,
      error: {
        code: authError.code,
        type: authError.type,
        message: authError.message,
        userMessage: this.generateContextualUserMessage(authError, context),
        solution: this.generateContextualSolution(authError, context),
        service: context.service,
        timestamp: authError.timestamp,
        severity: authError.severity
      },
      retryable,
      retryAfter: retryable ? retryAfter : undefined
    };

    // Add fallback data if provided
    if (fallbackData !== undefined) {
      unifiedResponse.fallbackData = fallbackData;
    }

    // Log error with context
    this.logErrorWithContext(authError, context);

    return unifiedResponse;
  }

  /**
   * Handle GA4 specific errors
   */
  handleGA4Error(error: any, operation: string, fallbackData?: any): UnifiedErrorResponse {
    const context: ServiceErrorContext = {
      service: 'ga4',
      operation,
      timestamp: new Date(),
      additionalContext: {
        propertyId: process.env.GA4_PROPERTY_ID
      }
    };

    return this.handleAnalyticsError(error, context, fallbackData);
  }

  /**
   * Handle Firebase specific errors
   */
  handleFirebaseError(error: any, operation: string, fallbackData?: any): UnifiedErrorResponse {
    const context: ServiceErrorContext = {
      service: 'firebase',
      operation,
      timestamp: new Date(),
      additionalContext: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    };

    return this.handleAnalyticsError(error, context, fallbackData);
  }

  /**
   * Handle Search Console specific errors
   */
  handleSearchConsoleError(error: any, operation: string, fallbackData?: any): UnifiedErrorResponse {
    const context: ServiceErrorContext = {
      service: 'search-console',
      operation,
      timestamp: new Date(),
      additionalContext: {
        siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
      }
    };

    return this.handleAnalyticsError(error, context, fallbackData);
  }

  /**
   * Generate contextual user messages based on service and error type
   */
  private generateContextualUserMessage(error: AuthError, context: ServiceErrorContext): string {
    const baseMessage = error.userMessage;
    
    switch (context.service) {
      case 'ga4':
        return this.getGA4UserMessage(error, context);
      case 'firebase':
        return this.getFirebaseUserMessage(error, context);
      case 'search-console':
        return this.getSearchConsoleUserMessage(error, context);
      default:
        return baseMessage;
    }
  }

  /**
   * Generate contextual solutions based on service and error type
   */
  private generateContextualSolution(error: AuthError, context: ServiceErrorContext): string {
    const baseSolution = error.solution || 'Please try again later.';
    
    switch (context.service) {
      case 'ga4':
        return this.getGA4Solution(error, context);
      case 'firebase':
        return this.getFirebaseSolution(error, context);
      case 'search-console':
        return this.getSearchConsoleSolution(error, context);
      default:
        return baseSolution;
    }
  }

  /**
   * GA4 specific user messages
   */
  private getGA4UserMessage(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        if (error.message.includes('headers.forEach')) {
          return 'Google Analytics is experiencing a temporary technical issue. Your data will be available shortly.';
        }
        return 'Unable to connect to Google Analytics. Please check your analytics configuration.';
      
      case ErrorType.PERMISSION:
        return 'Your Google Analytics account needs additional permissions to access this data.';
      
      case ErrorType.QUOTA:
        return 'Google Analytics usage limit reached. Data will be available again soon.';
      
      case ErrorType.NETWORK:
        return 'Unable to reach Google Analytics servers. Please check your internet connection.';
      
      default:
        return 'Google Analytics data is temporarily unavailable.';
    }
  }

  /**
   * Firebase specific user messages
   */
  private getFirebaseUserMessage(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.PERMISSION:
        return 'Analytics data access is restricted. Please verify your account permissions.';
      
      case ErrorType.AUTHENTICATION:
        return 'Unable to authenticate with the analytics database. Please try again.';
      
      case ErrorType.NETWORK:
        return 'Unable to connect to the analytics database. Please check your connection.';
      
      default:
        return 'Analytics database is temporarily unavailable.';
    }
  }

  /**
   * Search Console specific user messages
   */
  private getSearchConsoleUserMessage(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.PERMISSION:
        return 'Search performance data is unavailable due to insufficient permissions.';
      
      case ErrorType.AUTHENTICATION:
        return 'Unable to connect to Google Search Console. Please verify your site verification.';
      
      case ErrorType.NETWORK:
        return 'Unable to reach Google Search Console. Please try again later.';
      
      default:
        return 'Search Console data is temporarily unavailable.';
    }
  }

  /**
   * GA4 specific solutions
   */
  private getGA4Solution(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        if (error.message.includes('headers.forEach')) {
          return 'This is a known issue that resolves automatically. Please refresh the page in a few moments.';
        }
        return 'Please verify your GA4 service account credentials and property access permissions.';
      
      case ErrorType.PERMISSION:
        return 'Add your service account email to your Google Analytics property with Viewer permissions.';
      
      case ErrorType.QUOTA:
        return 'Please wait a few minutes for your quota to reset, or consider upgrading your Google Analytics plan.';
      
      default:
        return 'Please refresh the page or contact support if the issue persists.';
    }
  }

  /**
   * Firebase specific solutions
   */
  private getFirebaseSolution(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.PERMISSION:
        return 'Ensure your Firebase service account has Firestore and Analytics permissions.';
      
      case ErrorType.AUTHENTICATION:
        return 'Please verify your Firebase service account credentials are correctly configured.';
      
      default:
        return 'Please check your Firebase project configuration and try again.';
    }
  }

  /**
   * Search Console specific solutions
   */
  private getSearchConsoleSolution(error: AuthError, context: ServiceErrorContext): string {
    switch (error.type) {
      case ErrorType.PERMISSION:
        return 'Add your service account to Google Search Console with Full permissions for your verified site.';
      
      case ErrorType.AUTHENTICATION:
        return 'Please verify your site is verified in Google Search Console and your service account has access.';
      
      default:
        return 'Please check your Search Console configuration and site verification status.';
    }
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: AuthError): boolean {
    switch (error.type) {
      case ErrorType.NETWORK:
      case ErrorType.SERVICE_UNAVAILABLE:
      case ErrorType.QUOTA:
        return true;
      
      case ErrorType.AUTHENTICATION:
        // Metadata plugin errors are often transient
        return error.message.includes('headers.forEach');
      
      default:
        return false;
    }
  }

  /**
   * Get retry delay based on service and error type
   */
  private getRetryDelay(service: string, errorType: ErrorType): number {
    switch (errorType) {
      case ErrorType.QUOTA:
        return 60000; // 1 minute
      
      case ErrorType.NETWORK:
      case ErrorType.SERVICE_UNAVAILABLE:
        return 30000; // 30 seconds
      
      case ErrorType.AUTHENTICATION:
        return 10000; // 10 seconds
      
      default:
        return 5000; // 5 seconds
    }
  }

  /**
   * Track error frequency for circuit breaker pattern
   */
  private trackError(service: string, errorCode: string): void {
    const key = `${service}:${errorCode}`;
    const now = new Date();
    
    // Reset count if outside error window
    const lastError = this.lastErrors.get(key);
    if (lastError && (now.getTime() - lastError.getTime()) > this.ERROR_WINDOW) {
      this.errorCounts.delete(key);
    }
    
    // Increment error count
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
    this.lastErrors.set(key, now);
  }

  /**
   * Check if service should be circuit broken
   */
  isServiceCircuitBroken(service: string): boolean {
    let totalErrors = 0;
    const now = new Date();
    
    for (const [key, count] of this.errorCounts.entries()) {
      if (key.startsWith(`${service}:`)) {
        const lastError = this.lastErrors.get(key);
        if (lastError && (now.getTime() - lastError.getTime()) <= this.ERROR_WINDOW) {
          totalErrors += count;
        }
      }
    }
    
    return totalErrors >= this.ERROR_THRESHOLD;
  }

  /**
   * Log error with comprehensive context
   */
  private logErrorWithContext(error: AuthError, context: ServiceErrorContext): void {
    const logData = {
      error: {
        code: error.code,
        type: error.type,
        message: error.message,
        severity: error.severity
      },
      context: {
        service: context.service,
        operation: context.operation,
        endpoint: context.endpoint,
        timestamp: context.timestamp,
        additionalContext: context.additionalContext
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform
      }
    };

    // Log based on severity
    switch (error.severity) {
      case 'critical':
        console.error('🚨 CRITICAL Analytics Error:', logData);
        break;
      case 'high':
        console.error('❌ High Priority Analytics Error:', logData);
        break;
      case 'medium':
        console.warn('⚠️ Analytics Warning:', logData);
        break;
      case 'low':
        console.info('ℹ️ Analytics Info:', logData);
        break;
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByService: Record<string, number>;
    errorsByType: Record<ErrorType, number>;
    circuitBrokenServices: string[];
  } {
    const stats = {
      totalErrors: 0,
      errorsByService: {} as Record<string, number>,
      errorsByType: {} as Record<ErrorType, number>,
      circuitBrokenServices: [] as string[]
    };

    const now = new Date();
    
    for (const [key, count] of this.errorCounts.entries()) {
      const lastError = this.lastErrors.get(key);
      if (lastError && (now.getTime() - lastError.getTime()) <= this.ERROR_WINDOW) {
        const [service] = key.split(':');
        stats.totalErrors += count;
        stats.errorsByService[service] = (stats.errorsByService[service] || 0) + count;
      }
    }

    // Check for circuit broken services
    const services = ['ga4', 'firebase', 'search-console'];
    for (const service of services) {
      if (this.isServiceCircuitBroken(service)) {
        stats.circuitBrokenServices.push(service);
      }
    }

    return stats;
  }

  /**
   * Clear error tracking data
   */
  clearErrorTracking(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }
}

// Export singleton instance
export const unifiedErrorHandler = UnifiedErrorHandler.getInstance();