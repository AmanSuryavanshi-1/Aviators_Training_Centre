"use client";

import { useState, useCallback, useEffect } from 'react';
import { globalErrorHandler, ComprehensiveError, handleError } from '@/lib/error-handling/comprehensive-error-handler';
import { useNotifications } from '@/components/shared/ToastNotifications';
import { ErrorInfo } from '@/components/shared/ErrorDisplay';
import { SyncError } from '@/components/shared/SyncErrorHandler';

export interface UseComprehensiveErrorHandlingOptions {
  showToastNotifications?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  context?: {
    operation?: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface UseComprehensiveErrorHandlingReturn {
  // Error state
  errors: ComprehensiveError[];
  currentError: ComprehensiveError | null;
  hasErrors: boolean;
  isRetrying: boolean;

  // Error handling methods
  handleError: (error: unknown, context?: any) => ComprehensiveError;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  retryError: (errorId: string) => Promise<void>;

  // Conversion methods for legacy components
  toErrorInfo: (error: ComprehensiveError) => ErrorInfo;
  toSyncError: (error: ComprehensiveError) => SyncError;

  // Operation wrappers
  withErrorHandling: <T>(operation: () => Promise<T>, context?: any) => Promise<T>;
  withRetry: <T>(operation: () => Promise<T>, maxRetries?: number) => Promise<T>;
}

export const useComprehensiveErrorHandling = (
  options: UseComprehensiveErrorHandlingOptions = {}
): UseComprehensiveErrorHandlingReturn => {
  const {
    showToastNotifications = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 2000,
    context = {}
  } = options;

  const [errors, setErrors] = useState<ComprehensiveError[]>([]);
  const [currentError, setCurrentError] = useState<ComprehensiveError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { notifications } = useNotifications();

  // Listen for new errors from the global handler
  useEffect(() => {
    const unsubscribe = globalErrorHandler.onError((error) => {
      setErrors(prev => [...prev, error]);
      setCurrentError(error);

      // Show toast notification if enabled
      if (showToastNotifications) {
        showErrorNotification(error);
      }

      // Auto-retry if enabled and error is retryable
      if (autoRetry && error.retryable && error.retryCount < maxRetries) {
        setTimeout(() => {
          // This would need the original operation to retry
          // For now, we'll just log that auto-retry is attempted
          console.log(`Auto-retry attempted for error ${error.id}`);
        }, retryDelay);
      }
    });

    return unsubscribe;
  }, [showToastNotifications, autoRetry, maxRetries, retryDelay, notifications]);

  const showErrorNotification = useCallback((error: ComprehensiveError) => {
    switch (error.category) {
      case 'sync':
        notifications.syncFailed(error.message);
        break;
      case 'permission':
        notifications.permissionDenied(error.operation || 'perform this action');
        break;
      case 'validation':
        notifications.validationError(error.operation || 'Field', error.message);
        break;
      case 'network':
        notifications.custom({
          type: 'error',
          title: 'Network Error',
          description: error.message,
        });
        break;
      default:
        notifications.operationFailed(
          error.operation || 'Operation',
          error.message
        );
    }
  }, [notifications]);

  const handleErrorCallback = useCallback((error: unknown, additionalContext?: any) => {
    const fullContext = {
      ...context,
      ...additionalContext
    };

    return handleError(error, fullContext);
  }, [context]);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    if (currentError?.id === errorId) {
      setCurrentError(null);
    }
    globalErrorHandler.clearError(errorId);
  }, [currentError]);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setCurrentError(null);
    globalErrorHandler.clearErrors();
  }, []);

  const retryError = useCallback(async (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.retryable) {
      throw new Error('Error is not retryable');
    }

    setIsRetrying(true);
    try {
      // This is a placeholder - in practice, you'd need to store the original operation
      // For now, we'll simulate a retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearError(errorId);
      
      if (showToastNotifications) {
        notifications.operationCompleted('Retry');
      }
    } catch (retryError) {
      handleErrorCallback(retryError, { 
        operation: `Retry ${error.operation}`,
        originalErrorId: errorId 
      });
    } finally {
      setIsRetrying(false);
    }
  }, [errors, clearError, showToastNotifications, notifications, handleErrorCallback]);

  const toErrorInfo = useCallback((error: ComprehensiveError): ErrorInfo => {
    return globalErrorHandler.toErrorInfo(error);
  }, []);

  const toSyncError = useCallback((error: ComprehensiveError): SyncError => {
    return globalErrorHandler.toSyncError(error);
  }, []);

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    operationContext?: any
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      const comprehensiveError = handleErrorCallback(error, operationContext);
      throw comprehensiveError;
    }
  }, [handleErrorCallback]);

  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationMaxRetries: number = maxRetries
  ): Promise<T> => {
    let lastError: ComprehensiveError | null = null;
    
    for (let attempt = 0; attempt <= operationMaxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = handleErrorCallback(error, {
          operation: context.operation,
          retryAttempt: attempt,
          maxRetries: operationMaxRetries
        });

        // If this is the last attempt, throw the error
        if (attempt === operationMaxRetries) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [maxRetries, retryDelay, handleErrorCallback, context]);

  return {
    errors,
    currentError,
    hasErrors: errors.length > 0,
    isRetrying,
    handleError: handleErrorCallback,
    clearError,
    clearAllErrors,
    retryError,
    toErrorInfo,
    toSyncError,
    withErrorHandling,
    withRetry
  };
};

// Specialized hooks for specific operations
export const useBlogErrorHandling = () => {
  return useComprehensiveErrorHandling({
    showToastNotifications: true,
    autoRetry: true,
    maxRetries: 3,
    context: {
      operation: 'Blog Operation'
    }
  });
};

export const useSyncErrorHandling = () => {
  return useComprehensiveErrorHandling({
    showToastNotifications: true,
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 3000,
    context: {
      operation: 'Sync Operation'
    }
  });
};

export const useApiErrorHandling = () => {
  return useComprehensiveErrorHandling({
    showToastNotifications: true,
    autoRetry: false,
    context: {
      operation: 'API Operation'
    }
  });
};

export default useComprehensiveErrorHandling;