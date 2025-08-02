/**
 * Comprehensive Error Handling System
 * Provides structured error handling for authentication and system failures
 */

export enum ErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  MEMBER_VALIDATION_FAILED = 'MEMBER_VALIDATION_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SANITY_API_ERROR = 'SANITY_API_ERROR',
  JWT_TOKEN_ERROR = 'JWT_TOKEN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  STUDIO_NAVIGATION_ERROR = 'STUDIO_NAVIGATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  userId?: string;
  email?: string;
  userAgent?: string;
  ipAddress?: string;
  requestId?: string;
  timestamp: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  stackTrace?: string;
  additionalData?: Record<string, any>;
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code: string;
  context: ErrorContext;
  originalError?: Error;
  retryable: boolean;
  shouldLog: boolean;
  shouldAlert: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: Map<ErrorType, ((error: AppError) => void)[]> = new Map();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Create a structured error
   */
  createError(
    type: ErrorType,
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    const errorConfig = this.getErrorConfiguration(type);
    
    return {
      type,
      severity: errorConfig.severity,
      message,
      userMessage: errorConfig.userMessage,
      code: errorConfig.code,
      context: {
        timestamp: new Date().toISOString(),
        stackTrace: originalError?.stack || new Error().stack,
        ...context,
      },
      originalError,
      retryable: errorConfig.retryable,
      shouldLog: errorConfig.shouldLog,
      shouldAlert: errorConfig.shouldAlert,
    };
  }

  /**
   * Handle an error with appropriate logging and user feedback
   */
  async handleError(error: AppError): Promise<void> {
    try {
      // Log the error
      if (error.shouldLog) {
        await this.logError(error);
      }

      // Send alerts for critical errors
      if (error.shouldAlert) {
        await this.sendAlert(error);
      }

      // Execute registered callbacks
      const callbacks = this.errorCallbacks.get(error.type) || [];
      callbacks.forEach(callback => {
        try {
          callback(error);
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError);
        }
      });

      // Track error metrics
      this.trackErrorMetrics(error);

    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
      // Fallback logging
      console.error('Original error:', error);
    }
  }

  /**
   * Register error callback
   */
  onError(type: ErrorType, callback: (error: AppError) => void): void {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, []);
    }
    this.errorCallbacks.get(type)!.push(callback);
  }

  /**
   * Create authentication error
   */
  createAuthenticationError(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(ErrorType.AUTHENTICATION_FAILED, message, context, originalError);
  }

  /**
   * Create member validation error
   */
  createMemberValidationError(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(ErrorType.MEMBER_VALIDATION_FAILED, message, context, originalError);
  }

  /**
   * Create session expired error
   */
  createSessionExpiredError(
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(
      ErrorType.SESSION_EXPIRED,
      'User session has expired',
      context,
      originalError
    );
  }

  /**
   * Create Sanity API error
   */
  createSanityApiError(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(ErrorType.SANITY_API_ERROR, message, context, originalError);
  }

  /**
   * Create JWT token error
   */
  createJwtTokenError(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(ErrorType.JWT_TOKEN_ERROR, message, context, originalError);
  }

  /**
   * Create Studio navigation error
   */
  createStudioNavigationError(
    message: string,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ): AppError {
    return this.createError(ErrorType.STUDIO_NAVIGATION_ERROR, message, context, originalError);
  }

  /**
   * Get error configuration
   */
  private getErrorConfiguration(type: ErrorType) {
    const configs = {
      [ErrorType.AUTHENTICATION_FAILED]: {
        severity: ErrorSeverity.HIGH,
        userMessage: 'Authentication failed. Please check your credentials and try again.',
        code: 'AUTH_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.MEMBER_VALIDATION_FAILED]: {
        severity: ErrorSeverity.HIGH,
        userMessage: 'Access denied. You are not authorized to access this system.',
        code: 'AUTH_002',
        retryable: false,
        shouldLog: true,
        shouldAlert: true,
      },
      [ErrorType.SESSION_EXPIRED]: {
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Your session has expired. Please log in again.',
        code: 'AUTH_003',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.UNAUTHORIZED_ACCESS]: {
        severity: ErrorSeverity.HIGH,
        userMessage: 'You do not have permission to access this resource.',
        code: 'AUTH_004',
        retryable: false,
        shouldLog: true,
        shouldAlert: true,
      },
      [ErrorType.SANITY_API_ERROR]: {
        severity: ErrorSeverity.HIGH,
        userMessage: 'Unable to connect to content management system. Please try again later.',
        code: 'API_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: true,
      },
      [ErrorType.JWT_TOKEN_ERROR]: {
        severity: ErrorSeverity.HIGH,
        userMessage: 'Authentication token is invalid. Please log in again.',
        code: 'JWT_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.NETWORK_ERROR]: {
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Network connection error. Please check your internet connection and try again.',
        code: 'NET_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.CONFIGURATION_ERROR]: {
        severity: ErrorSeverity.CRITICAL,
        userMessage: 'System configuration error. Please contact support.',
        code: 'CFG_001',
        retryable: false,
        shouldLog: true,
        shouldAlert: true,
      },
      [ErrorType.STUDIO_NAVIGATION_ERROR]: {
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Unable to navigate to Studio. Please try again or contact support.',
        code: 'NAV_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.RATE_LIMIT_EXCEEDED]: {
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: false,
      },
      [ErrorType.VALIDATION_ERROR]: {
        severity: ErrorSeverity.LOW,
        userMessage: 'Please check your input and try again.',
        code: 'VAL_001',
        retryable: true,
        shouldLog: false,
        shouldAlert: false,
      },
      [ErrorType.INTERNAL_SERVER_ERROR]: {
        severity: ErrorSeverity.CRITICAL,
        userMessage: 'An unexpected error occurred. Please try again or contact support.',
        code: 'SRV_001',
        retryable: true,
        shouldLog: true,
        shouldAlert: true,
      },
    };

    return configs[type];
  }

  /**
   * Log error to appropriate destination
   */
  private async logError(error: AppError): Promise<void> {
    const logEntry = {
      timestamp: error.context.timestamp,
      type: error.type,
      severity: error.severity,
      code: error.code,
      message: error.message,
      context: error.context,
      stackTrace: error.context.stackTrace,
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Application Error:', logEntry);
    }

    // Production logging
    if (process.env.NODE_ENV === 'production') {
      try {
        // Send to logging service (e.g., Vercel, DataDog, etc.)
        await this.sendToLoggingService(logEntry);
      } catch (loggingError) {
        console.error('Failed to send error to logging service:', loggingError);
      }
    }

    // Store in local error log for debugging
    this.storeLocalErrorLog(logEntry);
  }

  /**
   * Send alert for critical errors
   */
  private async sendAlert(error: AppError): Promise<void> {
    if (error.severity === ErrorSeverity.CRITICAL) {
      try {
        // Send to alerting service (e.g., Slack, email, etc.)
        await this.sendCriticalAlert(error);
      } catch (alertError) {
        console.error('Failed to send critical alert:', alertError);
      }
    }
  }

  /**
   * Track error metrics
   */
  private trackErrorMetrics(error: AppError): void {
    try {
      // Track error occurrence
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'error', {
          error_type: error.type,
          error_severity: error.severity,
          error_code: error.code,
          user_id: error.context.userId,
        });
      }

      // Update error counters
      this.updateErrorCounters(error);
    } catch (trackingError) {
      console.error('Failed to track error metrics:', trackingError);
    }
  }

  /**
   * Send to external logging service
   */
  private async sendToLoggingService(logEntry: any): Promise<void> {
    // Implementation would depend on your logging service
    // Example: Vercel Analytics, DataDog, LogRocket, etc.
    
    if (process.env.LOGGING_ENDPOINT) {
      try {
        await fetch(process.env.LOGGING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`,
          },
          body: JSON.stringify(logEntry),
        });
      } catch (error) {
        console.error('Failed to send to logging service:', error);
      }
    }
  }

  /**
   * Send critical alert
   */
  private async sendCriticalAlert(error: AppError): Promise<void> {
    const alertMessage = {
      text: `🚨 Critical Error in Production`,
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Error Type', value: error.type, short: true },
            { title: 'Code', value: error.code, short: true },
            { title: 'Message', value: error.message, short: false },
            { title: 'User', value: error.context.email || 'Unknown', short: true },
            { title: 'Timestamp', value: error.context.timestamp, short: true },
          ],
        },
      ],
    };

    // Send to Slack webhook if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertMessage),
        });
      } catch (error) {
        console.error('Failed to send Slack alert:', error);
      }
    }

    // Send email alert if configured
    if (process.env.ALERT_EMAIL) {
      try {
        await this.sendEmailAlert(error);
      } catch (error) {
        console.error('Failed to send email alert:', error);
      }
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(error: AppError): Promise<void> {
    // Implementation would use your email service (Resend, SendGrid, etc.)
    // This is a placeholder for the actual implementation
    console.log('Email alert would be sent for:', error.type);
  }

  /**
   * Store local error log
   */
  private storeLocalErrorLog(logEntry: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errorLogs.push(logEntry);
        
        // Keep only last 100 errors
        if (errorLogs.length > 100) {
          errorLogs.splice(0, errorLogs.length - 100);
        }
        
        localStorage.setItem('error_logs', JSON.stringify(errorLogs));
      }
    } catch (error) {
      console.error('Failed to store local error log:', error);
    }
  }

  /**
   * Update error counters
   */
  private updateErrorCounters(error: AppError): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const counters = JSON.parse(localStorage.getItem('error_counters') || '{}');
        counters[error.type] = (counters[error.type] || 0) + 1;
        localStorage.setItem('error_counters', JSON.stringify(counters));
      }
    } catch (error) {
      console.error('Failed to update error counters:', error);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Record<string, number> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return JSON.parse(localStorage.getItem('error_counters') || '{}');
      }
    } catch (error) {
      console.error('Failed to get error statistics:', error);
    }
    return {};
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('error_logs');
        localStorage.removeItem('error_counters');
      }
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();