"use client";

import React from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  RefreshCw, 
  Clock,
  Shield,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export interface SyncError {
  type: 'sync_failed' | 'connection_lost' | 'permission_denied' | 'timeout' | 'server_error';
  message: string;
  code?: string;
  details?: string;
  timestamp: Date;
  operation?: string;
  retryable: boolean;
}

interface SyncErrorHandlerProps {
  error: SyncError;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  className?: string;
  showRetryProgress?: boolean;
}

const SyncErrorHandler: React.FC<SyncErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  showRetryProgress = true
}) => {
  const { isRetrying, retryCount, retry } = useErrorHandler({
    maxRetries: 3,
    defaultRetryDelay: 2000
  });

  const [retryProgress, setRetryProgress] = React.useState(0);

  const handleRetry = async () => {
    if (!onRetry) return;

    try {
      if (showRetryProgress) {
        setRetryProgress(0);
        const progressInterval = setInterval(() => {
          setRetryProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await retry(onRetry);
        clearInterval(progressInterval);
        setRetryProgress(100);
        
        setTimeout(() => setRetryProgress(0), 1000);
      } else {
        await retry(onRetry);
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case 'connection_lost':
        return WifiOff;
      case 'permission_denied':
        return Shield;
      case 'timeout':
        return Clock;
      case 'server_error':
        return Database;
      case 'sync_failed':
      default:
        return AlertTriangle;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'connection_lost':
        return 'text-orange-600';
      case 'permission_denied':
        return 'text-red-600';
      case 'timeout':
        return 'text-yellow-600';
      case 'server_error':
        return 'text-red-600';
      case 'sync_failed':
      default:
        return 'text-red-600';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'connection_lost':
        return 'Connection Lost';
      case 'permission_denied':
        return 'Permission Denied';
      case 'timeout':
        return 'Request Timeout';
      case 'server_error':
        return 'Server Error';
      case 'sync_failed':
      default:
        return 'Sync Failed';
    }
  };

  const getErrorGuidance = () => {
    switch (error.type) {
      case 'connection_lost':
        return [
          'Check your internet connection',
          'Verify Sanity CMS is accessible',
          'Try refreshing the page'
        ];
      case 'permission_denied':
        return [
          'Verify your Sanity API token has the required permissions',
          'Check if the token has expired',
          'Ensure you have read/write access to the dataset'
        ];
      case 'timeout':
        return [
          'The request took too long to complete',
          'Check your network connection speed',
          'Try again in a few moments'
        ];
      case 'server_error':
        return [
          'There was an issue with the server',
          'This has been logged for investigation',
          'Try again in a few minutes'
        ];
      case 'sync_failed':
      default:
        return [
          'The synchronization process failed',
          'Your changes may not be reflected immediately',
          'Try the operation again'
        ];
    }
  };

  const ErrorIcon = getErrorIcon();
  const errorColor = getErrorColor();
  const errorTitle = getErrorTitle();
  const guidance = getErrorGuidance();

  return (
    <Card className={`border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ErrorIcon className={`h-5 w-5 ${errorColor}`} />
            {errorTitle}
            {error.code && (
              <Badge variant="outline" className="text-xs">
                {error.code}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {error.timestamp.toLocaleTimeString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {error.message}
            </p>
            {error.operation && (
              <p className="text-xs text-muted-foreground">
                Operation: <span className="font-mono">{error.operation}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {error.retryable ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {error.retryable ? 'Retryable' : 'Manual fix required'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            What you can do:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            {guidance.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {showRetryProgress && isRetrying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Retrying...</span>
              <span>{retryProgress}%</span>
            </div>
            <Progress value={retryProgress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {error.retryable && onRetry && (
              <Button
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {retryCount > 0 ? `Retry (${retryCount}/3)` : 'Retry'}
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncErrorHandler;
