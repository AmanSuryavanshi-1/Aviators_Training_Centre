/**
 * Error Handler Service
 * Centralized error handling with user-friendly messages and logging
 */

import { productionLogger } from '../logging/productionLogger';

export type ErrorCategory = 
  | 'authentication' 
  | 'authorization' 
  | 'validation' 
  | 'network' 
  | 'sanity' 
  | 'firebase' 
  | 'system' 
  | 'unknown';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ProcessedError {
  id: string;
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
  statusCode: number;
  isRetryable: boolean;
  timestamp: string;
  context?: ErrorContext;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount = 0;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Process and handle an error
   */
  handleError(
    error: Error | unknown,
    category: ErrorCategory = 'unknown',
    context?: ErrorContext
  ): ProcessedError {
    const errorId = this.generateErrorId();
    const processedError = this.processError(error, category, errorId, context);

    // Log the error
    this.logError(processedError, error);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(processedError, error);
    }

    return processedError;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(
    error: Error | unknown,
    context?: ErrorContext
  ): ProcessedError {
    const processedError = this.handleError(error, 'authentication', context);

    // Log security event
    productionLogger.logSecurityEvent({
      type: 'login_failure',
      email: context?.metadata?.email,
      ip: context?.ip,
      userAgent: context?.userAgent,
      details: {
        error: processedError.technicalMessage,
        errorId: processedError.id,
      },
    });

    return processedError;
  }

  /**
   * Handle API errors
   */
  handleApiError(
    error: Error | unknown,
    method: string,
    path: string,
    context?: ErrorContext
  ): ProcessedError {
    const enhancedContext = {
      ...context,
      method,
      path,
    };

    const processedError = this.handleError(error, this.categorizeApiError(error), enhancedContext);

    // Log API error
    productionLogger.logApiRequest(
      method,
      path,
      processedError.statusCode,
      0, // Duration not available here
      context?.userId,
      context?.ip
    );

    return processedError;
  }

  /**
   * Handle Sanity-specific errors
   */
  handleSanityError(
    error: Error | unknown,
    operation: string,
    context?: ErrorContext
  ): ProcessedError {
    const enhancedContext = {
      ...context,
      metadata: {
        ...context?.metadata,
        operation,
        service: 'sanity',
      },
    };

    return this.handleError(error, 'sanity', enhancedContext);
  }

  /**
   * Handle Firebase-specific errors
   */
  handleFirebaseError(
    error: Error | unknown,
    operation: string,
    context?: ErrorContext
  ): ProcessedError {
    const enhancedContext = {
      ...context,
      metadata: {
        ...context?.metadata,
        operation,
        service: 'firebase',
      },
    };

    return this.handleError(error, 'firebase', enhancedContext);
  }

  /**
   * Process error into standardized format
   */
  private processError(
    error: Error | unknown,
    category: ErrorCategory,
    errorId: string,
    context?: ErrorContext
  ): ProcessedError {
    const errorObj = this.normalizeError(error);
    const userMessage = this.getUserFriendlyMessage(errorObj, category);
    const statusCode = this.getStatusCode(errorObj, category);
    const isRetryable = this.isRetryableError(errorObj, category);

    return {
      id: errorId,
      category,
      userMessage,
      technicalMessage: errorObj.message,
      statusCode,
      isRetryable,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  /**
   * Normalize error to Error object
   */
  private normalizeError(error: Error | unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(String(error.message));
    }

    return new Error('Unknown error occurred');
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    this.errorCount++;
    const timestamp = Date.now().toString(36);
    const counter = this.errorCount.toString(36);
    return `err_${timestamp}_${counter}`;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
    const message = error.message.toLowerCase();

    switch (category) {
      case 'authentication':
        if (message.includes('invalid credentials') || message.includes('unauthorized')) {
          return 'Invalid email or password. Please check your credentials and try again.';
        }
        if (message.includes('not a sanity project member')) {
          return 'Access denied. Only authorized team members can access the admin dashboard.';
        }
        if (message.includes('session expired') || message.includes('token expired')) {
          return 'Your session has expired. Please log in again.';
        }
        return 'Authentication failed. Please try logging in again.';

      case 'authorization':
        return 'You do not have permission to perform this action.';

      case 'validation':
        if (message.includes('required')) {
          return 'Please fill in all required fields.';
        }
        if (message.includes('invalid format') || message.includes('invalid email')) {
          return 'Please check the format of your input and try again.';
        }
        return 'Please check your input and try again.';

      case 'network':
        if (message.includes('timeout') || message.includes('etimedout')) {
          return 'Request timed out. Please check your connection and try again.';
        }
        if (message.includes('network error') || message.includes('fetch failed')) {
          return 'Network error. Please check your internet connection.';
        }
        return 'Connection error. Please try again.';

      case 'sanity':
        if (message.includes('insufficient permissions')) {
          return 'Unable to save changes. Please check your permissions.';
        }
        if (message.includes('document not found')) {
          return 'The requested content was not found.';
        }
        if (message.includes('validation error')) {
          return 'Content validation failed. Please check your input.';
        }
        return 'Content management system error. Please try again.';

      case 'firebase':
        if (message.includes('permission denied')) {
          return 'Access denied. Please check your permissions.';
        }
        if (message.includes('not found')) {
          return 'The requested resource was not found.';
        }
        return 'Service temporarily unavailable. Please try again.';

      case 'system':
        if (message.includes('configuration')) {
          return 'System configuration error. Please contact support.';
        }
        return 'System error. Please try again or contact support.';

      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get appropriate HTTP status code
   */
  private getStatusCode(error: Error, category: ErrorCategory): number {
    const message = error.message.toLowerCase();

    // Check for specific status codes in error message
    if (message.includes('400') || message.includes('bad request')) return 400;
    if (message.includes('401') || message.includes('unauthorized')) return 401;
    if (message.includes('403') || message.includes('forbidden')) return 403;
    if (message.includes('404') || message.includes('not found')) return 404;
    if (message.includes('429') || message.includes('rate limit')) return 429;
    if (message.includes('500') || message.includes('internal server')) return 500;
    if (message.includes('502') || message.includes('bad gateway')) return 502;
    if (message.includes('503') || message.includes('service unavailable')) return 503;
    if (message.includes('504') || message.includes('gateway timeout')) return 504;

    // Category-based status codes
    switch (category) {
      case 'authentication':
        return 401;
      case 'authorization':
        return 403;
      case 'validation':
        return 400;
      case 'network':
        return 503;
      case 'sanity':
      case 'firebase':
        return 502;
      default:
        return 500;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, category: ErrorCategory): boolean {
    const message = error.message.toLowerCase();

    // Non-retryable errors
    if (message.includes('401') || message.includes('403') || message.includes('404')) {
      return false;
    }

    if (category === 'authentication' || category === 'authorization' || category === 'validation') {
      return false;
    }

    // Retryable errors
    if (message.includes('timeout') || message.includes('network') || message.includes('503') || message.includes('502')) {
      return true;
    }

    if (category === 'network') {
      return true;
    }

    // Default to non-retryable for safety
    return false;
  }

  /**
   * Categorize API errors
   */
  private categorizeApiError(error: Error | unknown): ErrorCategory {
    const errorObj = this.normalizeError(error);
    const message = errorObj.message.toLowerCase();

    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return 'authentication';
    }

    if (message.includes('permission') || message.includes('forbidden')) {
      return 'authorization';
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }

    if (message.includes('sanity')) {
      return 'sanity';
    }

    if (message.includes('firebase')) {
      return 'firebase';
    }

    return 'unknown';
  }

  /**
   * Log error with appropriate level
   */
  private logError(processedError: ProcessedError, originalError: Error | unknown): void {
    const logLevel = processedError.statusCode >= 500 ? 'error' : 'warn';
    const errorObj = this.normalizeError(originalError);

    if (logLevel === 'error') {
      productionLogger.error(
        `${processedError.category.toUpperCase()}: ${processedError.technicalMessage}`,
        processedError.category,
        errorObj,
        {
          errorId: processedError.id,
          statusCode: processedError.statusCode,
          isRetryable: processedError.isRetryable,
          context: processedError.context,
        }
      );
    } else {
      productionLogger.warn(
        `${processedError.category.toUpperCase()}: ${processedError.technicalMessage}`,
        processedError.category,
        {
          errorId: processedError.id,
          statusCode: processedError.statusCode,
          isRetryable: processedError.isRetryable,
          context: processedError.context,
        }
      );
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(processedError: ProcessedError, originalError: Error | unknown): void {
    // In production, send to services like:
    // - Sentry
    // - Datadog
    // - New Relic
    // - Custom monitoring endpoint

    console.log('📊 Sending error to monitoring service:', {
      errorId: processedError.id,
      category: processedError.category,
      statusCode: processedError.statusCode,
      timestamp: processedError.timestamp,
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    categoryCounts: Record<ErrorCategory, number>;
  } {
    // In a real implementation, this would track actual statistics
    return {
      totalErrors: this.errorCount,
      categoryCounts: {
        authentication: 0,
        authorization: 0,
        validation: 0,
        network: 0,
        sanity: 0,
        firebase: 0,
        system: 0,
        unknown: 0,
      },
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const {
  handleError,
  handleAuthError,
  handleApiError,
  handleSanityError,
  handleFirebaseError,
} = errorHandler;