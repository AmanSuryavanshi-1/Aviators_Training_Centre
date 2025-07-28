'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { 
  enhancedFallbackSystem, 
  ServiceNotification, 
  NotificationType 
} from '@/lib/blog/enhanced-fallback-system';

interface ServiceNotificationsProps {
  className?: string;
  position?: 'top' | 'bottom';
  maxNotifications?: number;
}

export const ServiceNotifications: React.FC<ServiceNotificationsProps> = ({
  className = '',
  position = 'top',
  maxNotifications = 3,
}) => {
  const [notifications, setNotifications] = useState<ServiceNotification[]>([]);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = enhancedFallbackSystem.subscribeToNotifications(
      (newNotifications) => {
        setNotifications(newNotifications.slice(0, maxNotifications));
      }
    );

    // Get initial notifications
    setNotifications(
      enhancedFallbackSystem.getCurrentNotifications().slice(0, maxNotifications)
    );

    return unsubscribe;
  }, [maxNotifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NotificationType.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case NotificationType.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = 'border-l-4 rounded-r-lg shadow-lg backdrop-blur-sm';
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseStyles} bg-green-50/90 border-green-500 text-green-800`;
      case NotificationType.WARNING:
        return `${baseStyles} bg-yellow-50/90 border-yellow-500 text-yellow-800`;
      case NotificationType.ERROR:
        return `${baseStyles} bg-red-50/90 border-red-500 text-red-800`;
      case NotificationType.INFO:
      default:
        return `${baseStyles} bg-blue-50/90 border-blue-500 text-blue-800`;
    }
  };

  const handleDismiss = (notification: ServiceNotification) => {
    if (notification.dismissible) {
      enhancedFallbackSystem.removeNotification(notification);
    }
  };

  const handleAction = (notification: ServiceNotification) => {
    if (notification.action) {
      notification.action.handler();
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  const containerStyles = position === 'top' 
    ? 'fixed top-4 right-4 z-50 space-y-2'
    : 'fixed bottom-4 right-4 z-50 space-y-2';

  return (
    <div className={`${containerStyles} ${className}`}>
      {notifications.map((notification, index) => (
        <div
          key={`${notification.type}-${index}`}
          className={`${getNotificationStyles(notification.type)} p-4 max-w-md animate-in slide-in-from-right duration-300`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={() => handleAction(notification)}
                  className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            {notification.dismissible && (
              <button
                onClick={() => handleDismiss(notification)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Hook for accessing service notifications in components
 */
export const useServiceNotifications = () => {
  const [notifications, setNotifications] = useState<ServiceNotification[]>([]);
  const [systemState, setSystemState] = useState(enhancedFallbackSystem.getSystemState());

  useEffect(() => {
    const unsubscribe = enhancedFallbackSystem.subscribeToNotifications(setNotifications);
    
    // Update system state periodically
    const stateInterval = setInterval(() => {
      setSystemState(enhancedFallbackSystem.getSystemState());
    }, 5000);

    // Get initial state
    setNotifications(enhancedFallbackSystem.getCurrentNotifications());
    setSystemState(enhancedFallbackSystem.getSystemState());

    return () => {
      unsubscribe();
      clearInterval(stateInterval);
    };
  }, []);

  return {
    notifications,
    systemState,
    isHealthy: enhancedFallbackSystem.isHealthy(),
    isDegraded: enhancedFallbackSystem.isDegraded(),
    isUnavailable: enhancedFallbackSystem.isUnavailable(),
    currentDataSource: enhancedFallbackSystem.getCurrentDataSource(),
    forceRecovery: () => enhancedFallbackSystem.forceRecoveryAttempt(),
    clearNotifications: () => enhancedFallbackSystem.clearAllNotifications(),
  };
};

/**
 * Service status indicator component
 */
export const ServiceStatusIndicator: React.FC<{
  className?: string;
  showText?: boolean;
}> = ({ className = '', showText = true }) => {
  const { systemState, isHealthy, isDegraded, isUnavailable } = useServiceNotifications();

  const getStatusColor = () => {
    if (isHealthy) return 'bg-green-500';
    if (isDegraded) return 'bg-yellow-500';
    if (isUnavailable) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isHealthy) return 'All systems operational';
    if (isDegraded) return 'Limited functionality';
    if (isUnavailable) return 'Service issues';
    return 'Status unknown';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      {showText && (
        <span className="text-sm text-gray-600">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

/**
 * Detailed service status component for admin/debug use
 */
export const DetailedServiceStatus: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { systemState, currentDataSource } = useServiceNotifications();
  const [recoveryMetrics, setRecoveryMetrics] = useState(
    enhancedFallbackSystem.getRecoveryMetrics()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRecoveryMetrics(enhancedFallbackSystem.getRecoveryMetrics());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gray-50 rounded-lg p-4 space-y-3 ${className}`}>
      <h3 className="font-semibold text-gray-900">Service Status</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Status:</span>
          <span className="ml-2 font-medium">{systemState.status}</span>
        </div>
        <div>
          <span className="text-gray-600">Data Source:</span>
          <span className="ml-2 font-medium">{currentDataSource}</span>
        </div>
        <div>
          <span className="text-gray-600">Failures:</span>
          <span className="ml-2 font-medium">{systemState.consecutiveFailures}</span>
        </div>
        <div>
          <span className="text-gray-600">Recovery Attempts:</span>
          <span className="ml-2 font-medium">{systemState.recoveryAttempts}</span>
        </div>
      </div>

      {systemState.lastSuccessfulConnection && (
        <div className="text-sm">
          <span className="text-gray-600">Last Success:</span>
          <span className="ml-2">
            {new Date(systemState.lastSuccessfulConnection).toLocaleString()}
          </span>
        </div>
      )}

      <div className="text-sm">
        <span className="text-gray-600">Recovery Rate:</span>
        <span className="ml-2">
          {recoveryMetrics.totalAttempts > 0 
            ? `${Math.round((recoveryMetrics.successfulRecoveries / recoveryMetrics.totalAttempts) * 100)}%`
            : 'N/A'
          }
        </span>
      </div>
    </div>
  );
};