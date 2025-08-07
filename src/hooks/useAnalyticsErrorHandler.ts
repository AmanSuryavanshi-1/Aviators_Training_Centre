'use client';

import { useState, useCallback } from 'react';

export interface AnalyticsError {
  type: 'network' | 'auth' | 'data' | 'permission' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  retryable: boolean;
}

export interface ErrorHandlerState {
  errors: AnalyticsError[];
  hasErrors: boolean;
  isRetrying: boolean;
  retryCount: number;
}

export interface ErrorHandlerActions {
  addError: (error: Error | string, type?: AnalyticsError['type']) => void;
  clearErrors: () => void;
  clearError: (index: number) => void;
  retry: (retryFn: () => Promise<void>) => Promise<void>;
  getLatestError: () => AnalyticsError | null;
  getErrorsByType: (type: AnalyticsError['type']) => AnalyticsError[];
}

export function useAnalyticsErrorHandler(): ErrorHandlerState & ErrorHandlerActions {
  const [errors, setErrors] = useState<AnalyticsError[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const categorizeError = useCallback((error: Error | string): AnalyticsError['type'] => {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      return 'network';
    }
    
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('token')) {
      return 'auth';
    }
    
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || lowerMessage.includes('access')) {
      return 'permission';
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('parse') || lowerMessage.includes('invalid')) {
      return 'data';
    }
    
    return 'unknown';
  }, []);

  const isRetryable = useCallback((type: AnalyticsError['type']): boolean => {
    return ['network', 'data', 'unknown'].includes(type);
  }, []);

  const addError = useCallback((error: Error | string, type?: AnalyticsError['type']) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorType = type || categorizeError(error);
    
    const analyticsError: AnalyticsError = {
      type: errorType,
      message: errorMessage,
      code: typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
      details: typeof error === 'object' ? error : undefined,
      timestamp: Date.now(),
      retryable: isRetryable(errorType)
    };

    setErrors(prev => [...prev, analyticsError]);

    // Log error for monitoring
    console.error('Analytics Error:', analyticsError);

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Add your error monitoring service here
      // e.g., Sentry, LogRocket, etc.
    }
  }, [categorizeError, isRetryable]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await retryFn();
      // Clear retryable errors on successful retry
      setErrors(prev => prev.filter(error => !error.retryable));
    } catch (error) {
      addError(error as Error);
    } finally {
      setIsRetrying(false);
    }
  }, [addError]);

  const getLatestError = useCallback((): AnalyticsError | null => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  const getErrorsByType = useCallback((type: AnalyticsError['type']): AnalyticsError[] => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  return {
    errors,
    hasErrors: errors.length > 0,
    isRetrying,
    retryCount,
    addError,
    clearErrors,
    clearError,
    retry,
    getLatestError,
    getErrorsByType
  };
}

// Helper hook for specific error types
export function useNetworkErrorHandler() {
  const errorHandler = useAnalyticsErrorHandler();
  
  const handleNetworkError = useCallback((error: Error | string) => {
    errorHandler.addError(error, 'network');
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleNetworkError,
    networkErrors: errorHandler.getErrorsByType('network')
  };
}

export function useAuthErrorHandler() {
  const errorHandler = useAnalyticsErrorHandler();
  
  const handleAuthError = useCallback((error: Error | string) => {
    errorHandler.addError(error, 'auth');
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleAuthError,
    authErrors: errorHandler.getErrorsByType('auth')
  };
}

export function useDataErrorHandler() {
  const errorHandler = useAnalyticsErrorHandler();
  
  const handleDataError = useCallback((error: Error | string) => {
    errorHandler.addError(error, 'data');
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleDataError,
    dataErrors: errorHandler.getErrorsByType('data')
  };
}