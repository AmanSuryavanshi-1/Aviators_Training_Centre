"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { globalErrorHandler, ComprehensiveError } from '@/lib/error-handling/comprehensive-error-handler';
import { useNotifications, ToastContainer } from '@/components/shared/ToastNotifications';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

interface ErrorHandlingContextType {
  errors: ComprehensiveError[];
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  isConnected: boolean;
  lastSyncTime: Date | null;
}

const ErrorHandlingContext = createContext<ErrorHandlingContextType | undefined>(undefined);

export const useErrorHandlingContext = () => {
  const context = useContext(ErrorHandlingContext);
  if (!context) {
    throw new Error('useErrorHandlingContext must be used within ErrorHandlingProvider');
  }
  return context;
};

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
  enableGlobalErrorTracking?: boolean;
  enableToastNotifications?: boolean;
  enableConnectionMonitoring?: boolean;
}

export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({
  children,
  enableGlobalErrorTracking = true,
  enableToastNotifications = true,
  enableConnectionMonitoring = true
}) => {
  const [errors, setErrors] = useState<ComprehensiveError[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { notifications } = useNotifications();

  // Listen for global errors
  useEffect(() => {
    if (!enableGlobalErrorTracking) return;

    const unsubscribe = globalErrorHandler.onError((error) => {
      setErrors(prev => {
        // Prevent duplicate errors
        if (prev.some(e => e.id === error.id)) {
          return prev;
        }
        return [...prev, error];
      });

      // Show toast notifications for certain error types
      if (enableToastNotifications) {
        showErrorNotification(error);
      }

      // Update connection status based on error type
      if (enableConnectionMonitoring) {
        updateConnectionStatus(error);
      }
    });

    return unsubscribe;
  }, [enableGlobalErrorTracking, enableToastNotifications, enableConnectionMonitoring, notifications]);

  // Monitor connection status
  useEffect(() => {
    if (!enableConnectionMonitoring) return;

    const checkConnection = async () => {
      try {
        // Simple connectivity check
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          if (!isConnected) {
            setIsConnected(true);
            setLastSyncTime(new Date());
            if (enableToastNotifications) {
              notifications.connectionRestored();
            }
          }
        } else {
          throw new Error('Health check failed');
        }
      } catch (error) {
        if (isConnected) {
          setIsConnected(false);
          if (enableToastNotifications) {
            notifications.connectionLost();
          }
        }
      }
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [isConnected, enableConnectionMonitoring, enableToastNotifications, notifications]);

  const showErrorNotification = (error: ComprehensiveError) => {
    // Only show notifications for medium+ severity errors
    if (error.severity === 'low') return;

    switch (error.category) {
      case 'sync':
        notifications.syncFailed(error.message, () => {
          // Retry logic would go here
          console.log('Retrying sync operation');
        });
        break;
      
      case 'network':
        notifications.custom({
          type: 'error',
          title: 'Network Error',
          description: error.message,
          action: error.retryable ? {
            label: 'Retry',
            onClick: () => {
              // Retry logic would go here
              console.log('Retrying network operation');
            }
          } : undefined
        });
        break;
      
      case 'permission':
        notifications.permissionDenied(error.operation || 'perform this action');
        break;
      
      case 'validation':
        notifications.validationError(
          error.operation || 'Field',
          error.message
        );
        break;
      
      case 'server':
        notifications.custom({
          type: 'error',
          title: 'Server Error',
          description: error.message,
          duration: 8000
        });
        break;
      
      default:
        if (error.severity === 'high' || error.severity === 'critical') {
          notifications.operationFailed(
            error.operation || 'Operation',
            error.message,
            error.retryable ? () => {
              console.log('Retrying operation');
            } : undefined
          );
        }
    }
  };

  const updateConnectionStatus = (error: ComprehensiveError) => {
    if (error.category === 'network' || error.category === 'timeout') {
      setIsConnected(false);
    } else if (error.category === 'sync' && error.code === 'SYNC_ERROR') {
      // Sync errors might indicate connection issues
      setIsConnected(false);
    }
  };

  const clearError = (errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    globalErrorHandler.clearError(errorId);
  };

  const clearAllErrors = () => {
    setErrors([]);
    globalErrorHandler.clearErrors();
  };

  const contextValue: ErrorHandlingContextType = {
    errors,
    clearError,
    clearAllErrors,
    isConnected,
    lastSyncTime
  };

  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Handle React errors through the global error handler
          globalErrorHandler.handleError(error, {
            operation: 'React Component Render',
            category: 'unknown',
            severity: 'high',
            additionalContext: {
              componentStack: errorInfo.componentStack,
              errorBoundary: true
            }
          });
        }}
      >
        {children}
        {enableToastNotifications && <ToastContainer />}
      </ErrorBoundary>
    </ErrorHandlingContext.Provider>
  );
};

// Higher-order component for wrapping components with error handling
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ComponentType<any>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  } = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={options.onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorHandlingProvider;