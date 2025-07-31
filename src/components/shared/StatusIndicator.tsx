"use client";

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type OperationStatus = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'syncing' 
  | 'connected' 
  | 'disconnected';

export interface StatusIndicatorProps {
  status: OperationStatus;
  message?: string;
  details?: string;
  timestamp?: Date;
  onRetry?: () => void;
  className?: string;
  variant?: 'badge' | 'inline' | 'detailed';
  showTimestamp?: boolean;
  animated?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  details,
  timestamp,
  onRetry,
  className = '',
  variant = 'badge',
  showTimestamp = false,
  animated = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Idle',
          badgeVariant: 'secondary' as const
        };
      case 'loading':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          label: 'Loading',
          badgeVariant: 'secondary' as const,
          animate: true
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          label: 'Syncing',
          badgeVariant: 'secondary' as const,
          animate: true
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Success',
          badgeVariant: 'default' as const
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Error',
          badgeVariant: 'destructive' as const
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Warning',
          badgeVariant: 'secondary' as const
        };
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Connected',
          badgeVariant: 'default' as const
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Disconnected',
          badgeVariant: 'destructive' as const
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          badgeVariant: 'secondary' as const
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayMessage = message || config.label;

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={config.badgeVariant}
              className={cn(
                "flex items-center gap-1 cursor-help",
                className
              )}
            >
              <Icon 
                className={cn(
                  "h-3 w-3",
                  config.color,
                  animated && config.animate && "animate-spin"
                )} 
              />
              {displayMessage}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {details && <p className="text-sm">{details}</p>}
              {showTimestamp && timestamp && (
                <p className="text-xs text-muted-foreground">
                  {timestamp.toLocaleString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Icon 
          className={cn(
            "h-4 w-4",
            config.color,
            animated && config.animate && "animate-spin"
          )} 
        />
        <span className="text-sm">{displayMessage}</span>
        {showTimestamp && timestamp && (
          <span className="text-xs text-muted-foreground">
            ({timestamp.toLocaleTimeString()})
          </span>
        )}
        {status === 'error' && onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <Icon 
        className={cn(
          "h-5 w-5 mt-0.5 flex-shrink-0",
          config.color,
          animated && config.animate && "animate-spin"
        )} 
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{displayMessage}</h4>
          {showTimestamp && timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleString()}
            </span>
          )}
        </div>
        {details && (
          <p className="text-sm text-muted-foreground mt-1">{details}</p>
        )}
        {status === 'error' && onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

// Specialized status indicators for common operations
export const SyncStatusIndicator: React.FC<{
  isConnected: boolean;
  isSyncing: boolean;
  lastSync?: Date;
  error?: string;
  onRetry?: () => void;
}> = ({ isConnected, isSyncing, lastSync, error, onRetry }) => {
  let status: OperationStatus;
  let message: string;
  let details: string | undefined;

  if (error) {
    status = 'error';
    message = 'Sync Error';
    details = error;
  } else if (isSyncing) {
    status = 'syncing';
    message = 'Syncing...';
  } else if (isConnected) {
    status = 'connected';
    message = 'Connected';
    details = lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : undefined;
  } else {
    status = 'disconnected';
    message = 'Disconnected';
  }

  return (
    <StatusIndicator
      status={status}
      message={message}
      details={details}
      timestamp={lastSync}
      onRetry={onRetry}
      variant="inline"
      showTimestamp={false}
    />
  );
};

export const OperationStatusIndicator: React.FC<{
  operation: string;
  status: OperationStatus;
  progress?: number;
  error?: string;
  onRetry?: () => void;
}> = ({ operation, status, progress, error, onRetry }) => {
  const getMessage = () => {
    switch (status) {
      case 'loading':
        return `${operation}${progress ? ` (${progress}%)` : '...'}`;
      case 'success':
        return `${operation} completed`;
      case 'error':
        return `${operation} failed`;
      default:
        return operation;
    }
  };

  return (
    <StatusIndicator
      status={status}
      message={getMessage()}
      details={error}
      onRetry={onRetry}
      variant="detailed"
    />
  );
};

export default StatusIndicator;
