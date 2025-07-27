import { ErrorInfo } from '@/components/shared/ErrorDisplay';
import { SyncError } from '@/components/shared/SyncErrorHandler';

export type ErrorCategory = 
  | 'sync' 
  | 'api' 
  | 'validation' 
  | 'permission' 
  | 'network' 
  | 'timeout' 
  | 'server' 
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ComprehensiveError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: string;
  context?: Record<string, any>;
  timestamp: Date;
  operation?: string;
  userId?: string;
  sessionId?: string;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
  stack?: string;
}

export interface ErrorHandlerConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableTracking: boolean;
  notificationThreshold: ErrorSeverity;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

class ComprehensiveErrorHandler {
  private config: ErrorHandlerConfig;
  private errors: Map<string, ComprehensiveError> = new Map();
  private retryQueues: Map<string, NodeJS.Timeout> = new Map();
  private errorListeners: Set<(error: ComprehensiveError) => void> = new Set();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      enableLogging: true,
      enableTracking: true,
      notificationThreshold: 'medium',
      ...config
    };
  }

  /**
   * Handle any error and convert it to a comprehensive error
   */
  handleError(
    error: unknown,
    context: {
      operation?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userId?: string;
      sessionId?: string;
      additionalContext?: Record<string, any>;
    } = {}
  ): ComprehensiveError {
    const comprehensiveError = this.createComprehensiveError(error, context);
    
    // Store the error
    this.errors.set(comprehensiveError.id, comprehensiveError);

    // Log the error
    if (this.config.enableLogging) {
      this.logError(comprehensiveError);
    }

    // Track the error
    if (this.config.enableTracking) {
      this.trackError(comprehensiveError);
    }

    // Notify listeners
    this.notifyListeners(comprehensiveError);

    return comprehensiveError;
  }

  /**
   * Create a comprehensive error from any error type
   */
  private createComprehensiveError(
    error: unknown,
    context: {
      operation?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userId?: string;
      sessionId?: string;
      additionalContext?: Record<string, any>;
    }
  ): ComprehensiveError {
    const id = this.generateErrorId();
    const timestamp = new Date();

    let message: string;
    let code: string | undefined;
    let details: string | undefined;
    let category: ErrorCategory;
    let severity: ErrorSeverity;
    let retryable: boolean;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      
      // Categorize based on error type and message
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        category = 'network';
        severity = 'medium';
        retryable = true;
        code = 'NETWORK_ERROR';
      } else if (error.message.includes('timeout')) {
        category = 'timeout';
        severity = 'medium';
        retryable = true;
        code = 'TIMEOUT_ERROR';
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        category = 'permission';
        severity = 'high';
        retryable = false;
        code = 'PERMISSION_ERROR';
      } else if (error.message.includes('validation')) {
        category = 'validation';
        severity = 'low';
        retryable = false;
        code = 'VALIDATION_ERROR';
      } else if (error.message.includes('sync')) {
        category = 'sync';
        severity = 'medium';
        retryable = true;
        code = 'SYNC_ERROR';
      } else {
        category = 'unknown';
        severity = 'medium';
        retryable = true;
        code = 'UNKNOWN_ERROR';
      }
    } else if (typeof error === 'object' && error !== null) {
      const apiError = error as any;
      
      if (apiError.status) {
        code = `HTTP_${apiError.status}`;
        
        if (apiError.status >= 500) {
          category = 'server';
          severity = 'high';
          retryable = true;
        } else if (apiError.status === 401 || apiError.status === 403) {
          category = 'permission';
          severity = 'high';
          retryable = false;
        } else if (apiError.status === 404) {
          category = 'api';
          severity = 'medium';
          retryable = false;
        } else if (apiError.status >= 400) {
          category = 'validation';
          severity = 'low';
          retryable = false;
        } else {
          category = 'api';
          severity = 'medium';
          retryable = true;
        }
      } else {
        category = 'unknown';
        severity = 'medium';
        retryable = true;
      }

      message = apiError.message || 'An API error occurred';
      details = JSON.stringify(apiError, null, 2);
    } else if (typeof error === 'string') {
      message = error;
      category = 'unknown';
      severity = 'low';
      retryable = false;
      code = 'STRING_ERROR';
    } else {
      message = 'An unexpected error occurred';
      category = 'unknown';
      severity = 'medium';
      retryable = false;
      code = 'UNKNOWN_ERROR';
      details = JSON.stringify(error, null, 2);
    }

    // Override with context values if provided
    category = context.category || category;
    severity = context.severity || severity;

    return {
      id,
      category,
      severity,
      message,
      code,
      details,
      context: context.additionalContext,
      timestamp,
      operation: context.operation,
      userId: context.userId,
      sessionId: context.sessionId,
      retryable,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      stack
    };
  }

  /**
   * Retry a failed operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    errorId: string,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const error = this.errors.get(errorId);
    if (!error || !error.retryable) {
      throw new Error('Operation is not retryable');
    }

    const config: RetryConfig = {
      maxRetries: error.maxRetries,
      baseDelay: this.config.retryDelay,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      ...retryConfig
    };

    if (error.retryCount >= config.maxRetries) {
      throw new Error(`Maximum retry attempts (${config.maxRetries}) exceeded`);
    }

    // Calculate delay with exponential backoff
    let delay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, error.retryCount),
      config.maxDelay
    );

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      // Update retry count
      error.retryCount++;
      this.errors.set(errorId, error);

      // Attempt the operation
      const result = await operation();

      // Success - remove error from tracking
      this.errors.delete(errorId);
      this.clearRetryQueue(errorId);

      return result;
    } catch (retryError) {
      // Update the error with retry information
      const updatedError = this.handleError(retryError, {
        operation: error.operation,
        category: error.category,
        severity: error.severity,
        userId: error.userId,
        sessionId: error.sessionId,
        additionalContext: {
          ...error.context,
          originalErrorId: errorId,
          retryAttempt: error.retryCount
        }
      });

      // If we haven't exceeded max retries, schedule another retry
      if (error.retryCount < config.maxRetries) {
        this.scheduleRetry(errorId, operation, retryConfig);
      }

      throw updatedError;
    }
  }

  /**
   * Schedule a retry operation
   */
  private scheduleRetry<T>(
    errorId: string,
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>
  ): void {
    const timeout = setTimeout(() => {
      this.retryOperation(operation, errorId, retryConfig).catch(() => {
        // Retry failed, but we've already handled the error
      });
    }, this.config.retryDelay);

    this.retryQueues.set(errorId, timeout);
  }

  /**
   * Clear retry queue for an error
   */
  private clearRetryQueue(errorId: string): void {
    const timeout = this.retryQueues.get(errorId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryQueues.delete(errorId);
    }
  }

  /**
   * Convert to legacy ErrorInfo format
   */
  toErrorInfo(error: ComprehensiveError): ErrorInfo {
    return {
      type: this.mapCategoryToType(error.category),
      message: error.message,
      code: error.code,
      details: error.details,
      retryable: error.retryable,
      actionable: error.retryable || error.category === 'validation'
    };
  }

  /**
   * Convert to SyncError format
   */
  toSyncError(error: ComprehensiveError): SyncError {
    return {
      type: this.mapCategoryToSyncType(error.category),
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      operation: error.operation,
      retryable: error.retryable
    };
  }

  /**
   * Add error listener
   */
  onError(listener: (error: ComprehensiveError) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Get all errors
   */
  getErrors(): ComprehensiveError[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ComprehensiveError[] {
    return this.getErrors().filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ComprehensiveError[] {
    return this.getErrors().filter(error => error.severity === severity);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear();
    this.retryQueues.forEach(timeout => clearTimeout(timeout));
    this.retryQueues.clear();
  }

  /**
   * Clear specific error
   */
  clearError(errorId: string): void {
    this.errors.delete(errorId);
    this.clearRetryQueue(errorId);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: ComprehensiveError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`;
    
    console[logLevel](logMessage, {
      id: error.id,
      code: error.code,
      operation: error.operation,
      timestamp: error.timestamp,
      details: error.details,
      context: error.context,
      stack: error.stack
    });
  }

  private trackError(error: ComprehensiveError): void {
    // This would integrate with error tracking services like Sentry, LogRocket, etc.
    // For now, we'll just log to console
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('Error tracked:', {
        id: error.id,
        category: error.category,
        severity: error.severity,
        message: error.message,
        operation: error.operation,
        userId: error.userId,
        sessionId: error.sessionId
      });
    }
  }

  private notifyListeners(error: ComprehensiveError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low':
        return 'log';
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'warn';
    }
  }

  private mapCategoryToType(category: ErrorCategory): ErrorInfo['type'] {
    switch (category) {
      case 'network':
        return 'network';
      case 'permission':
        return 'permission';
      case 'validation':
        return 'validation';
      case 'server':
      case 'api':
        return 'server';
      case 'timeout':
        return 'timeout';
      case 'sync':
        return 'connection';
      default:
        return 'unknown';
    }
  }

  private mapCategoryToSyncType(category: ErrorCategory): SyncError['type'] {
    switch (category) {
      case 'network':
        return 'connection_lost';
      case 'permission':
        return 'permission_denied';
      case 'timeout':
        return 'timeout';
      case 'server':
      case 'api':
        return 'server_error';
      case 'sync':
        return 'sync_failed';
      default:
        return 'sync_failed';
    }
  }
}

// Global error handler instance
export const globalErrorHandler = new ComprehensiveErrorHandler({
  maxRetries: 3,
  retryDelay: 2000,
  enableLogging: true,
  enableTracking: true,
  notificationThreshold: 'medium'
});

// Convenience functions
export const handleError = (error: unknown, context?: Parameters<typeof globalErrorHandler.handleError>[1]) => {
  return globalErrorHandler.handleError(error, context);
};

export const retryOperation = <T>(
  operation: () => Promise<T>,
  errorId: string,
  retryConfig?: Partial<RetryConfig>
) => {
  return globalErrorHandler.retryOperation(operation, errorId, retryConfig);
};

export const onError = (listener: (error: ComprehensiveError) => void) => {
  return globalErrorHandler.onError(listener);
};

export default ComprehensiveErrorHandler;