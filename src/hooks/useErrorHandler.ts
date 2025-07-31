"use client";

import { useState, useCallback } from 'react';
import { ErrorInfo } from '@/components/shared/ErrorDisplay';

interface UseErrorHandlerOptions {
  onError?: (error: ErrorInfo) => void;
  defaultRetryDelay?: number;
  maxRetries?: number;
}

interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  isRetrying: boolean;
  retryCount: number;
  setError: (error: ErrorInfo | null) => void;
  clearError: () => void;
  retry: (retryFn: () => Promise<void> | void) => Promise<void>;
  handleError: (error: unknown, context?: string) => ErrorInfo;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn => {
  const { onError, defaultRetryDelay = 1000, maxRetries = 3 } = options;
  
  const [error, setErrorState] = useState<ErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const setError = useCallback((newError: ErrorInfo | null) => {
    setErrorState(newError);
    if (newError) {
      onError?.(newError);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setErrorState(null);
    setRetryCount(0);
  }, []);

  const handleError = useCallback((error: unknown, context?: string): ErrorInfo => {
    let errorInfo: ErrorInfo;

    if (error instanceof Error) {
      // Network/Connection errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.name === 'NetworkError') {
        errorInfo = {
          type: 'network',
          message: 'Unable to connect to the server. Please check your internet connection.',
          code: 'NETWORK_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: true,
          actionable: true
        };
      }
      // Timeout errors
      else if (error.message.includes('timeout') || error.name === 'TimeoutError') {
        errorInfo = {
          type: 'timeout',
          message: 'The request took too long to complete. Please try again.',
          code: 'TIMEOUT_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: true,
          actionable: true
        };
      }
      // Permission/Auth errors
      else if (error.message.includes('permission') || error.message.includes('unauthorized') || error.message.includes('forbidden')) {
        errorInfo = {
          type: 'permission',
          message: 'You don\'t have permission to perform this action. Please check your credentials.',
          code: 'PERMISSION_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: false,
          actionable: true
        };
      }
      // Validation errors
      else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorInfo = {
          type: 'validation',
          message: 'The provided data is invalid. Please check your input and try again.',
          code: 'VALIDATION_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: false,
          actionable: true
        };
      }
      // Server errors
      else if (error.message.includes('server') || error.message.includes('500') || error.message.includes('503')) {
        errorInfo = {
          type: 'server',
          message: 'There was a problem with the server. Please try again later.',
          code: 'SERVER_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: true,
          actionable: true
        };
      }
      // Generic error
      else {
        errorInfo = {
          type: 'unknown',
          message: error.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}${error.message}\n${error.stack}`,
          retryable: true,
          actionable: true
        };
      }
    }
    // Handle API response errors
    else if (typeof error === 'object' && error !== null) {
      const apiError = error as any;
      
      if (apiError.status === 401 || apiError.status === 403) {
        errorInfo = {
          type: 'permission',
          message: 'Authentication failed. Please check your credentials.',
          code: `HTTP_${apiError.status}`,
          details: `${context ? `Context: ${context}\n` : ''}Status: ${apiError.status}\nResponse: ${JSON.stringify(apiError, null, 2)}`,
          retryable: false,
          actionable: true
        };
      }
      else if (apiError.status === 404) {
        errorInfo = {
          type: 'server',
          message: 'The requested resource was not found.',
          code: 'HTTP_404',
          details: `${context ? `Context: ${context}\n` : ''}Status: ${apiError.status}\nResponse: ${JSON.stringify(apiError, null, 2)}`,
          retryable: false,
          actionable: false
        };
      }
      else if (apiError.status >= 500) {
        errorInfo = {
          type: 'server',
          message: 'Server error occurred. Please try again later.',
          code: `HTTP_${apiError.status}`,
          details: `${context ? `Context: ${context}\n` : ''}Status: ${apiError.status}\nResponse: ${JSON.stringify(apiError, null, 2)}`,
          retryable: true,
          actionable: true
        };
      }
      else if (apiError.status >= 400) {
        errorInfo = {
          type: 'validation',
          message: apiError.message || 'Invalid request. Please check your input.',
          code: `HTTP_${apiError.status}`,
          details: `${context ? `Context: ${context}\n` : ''}Status: ${apiError.status}\nResponse: ${JSON.stringify(apiError, null, 2)}`,
          retryable: false,
          actionable: true
        };
      }
      else {
        errorInfo = {
          type: 'unknown',
          message: apiError.message || 'An unexpected error occurred.',
          code: 'API_ERROR',
          details: `${context ? `Context: ${context}\n` : ''}Response: ${JSON.stringify(apiError, null, 2)}`,
          retryable: true,
          actionable: true
        };
      }
    }
    // Handle string errors
    else if (typeof error === 'string') {
      errorInfo = {
        type: 'unknown',
        message: error,
        code: 'STRING_ERROR',
        details: context ? `Context: ${context}\nError: ${error}` : error,
        retryable: true,
        actionable: false
      };
    }
    // Handle unknown error types
    else {
      errorInfo = {
        type: 'unknown',
        message: 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR',
        details: `${context ? `Context: ${context}\n` : ''}Error: ${JSON.stringify(error, null, 2)}`,
        retryable: true,
        actionable: false
      };
    }

    setError(errorInfo);
    return errorInfo;
  }, [setError]);

  const retry = useCallback(async (retryFn: () => Promise<void> | void) => {
    if (retryCount >= maxRetries) {
      setError({
        type: 'unknown',
        message: `Maximum retry attempts (${maxRetries}) exceeded.`,
        code: 'MAX_RETRIES_EXCEEDED',
        retryable: false,
        actionable: false
      });
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Add exponential backoff delay
      const delay = defaultRetryDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await retryFn();
      clearError();
    } catch (retryError) {
      handleError(retryError, 'Retry attempt failed');
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, defaultRetryDelay, clearError, handleError, setError]);

  return {
    error,
    isRetrying,
    retryCount,
    setError,
    clearError,
    retry,
    handleError
  };
};

// Specialized hook for API errors
export const useApiErrorHandler = () => {
  return useErrorHandler({
    defaultRetryDelay: 2000,
    maxRetries: 3,
    onError: (error) => {
      // Log API errors for monitoring
      console.error('API Error:', error);
      
      // Could send to error tracking service here
      // trackError(error);
    }
  });
};

// Specialized hook for connection errors
export const useConnectionErrorHandler = () => {
  return useErrorHandler({
    defaultRetryDelay: 5000,
    maxRetries: 5,
    onError: (error) => {
      console.error('Connection Error:', error);
      
      // Could trigger connection health checks here
      // checkConnectionHealth();
    }
  });
};
