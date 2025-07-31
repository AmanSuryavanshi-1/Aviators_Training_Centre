"use client";

import React from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Clock,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export interface ErrorInfo {
  type: 'connection' | 'permission' | 'validation' | 'server' | 'network' | 'timeout' | 'unknown';
  message: string;
  code?: string;
  details?: string;
  retryable?: boolean;
  actionable?: boolean;
}

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
  variant = 'inline',
  showDetails = false
}) => {
  const [detailsVisible, setDetailsVisible] = React.useState(showDetails);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'connection':
      case 'network':
        return WifiOff;
      case 'permission':
        return Shield;
      case 'timeout':
        return Clock;
      case 'server':
        return Database;
      case 'validation':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'connection':
      case 'network':
        return 'text-orange-600';
      case 'permission':
        return 'text-red-600';
      case 'timeout':
        return 'text-yellow-600';
      case 'server':
        return 'text-red-600';
      case 'validation':
        return 'text-blue-600';
      default:
        return 'text-red-600';
    }
  };

  const getActionableGuidance = () => {
    switch (error.type) {
      case 'connection':
        return {
          title: 'Connection Issue',
          guidance: [
            'Check your internet connection',
            'Verify Sanity CMS is accessible',
            'Try refreshing the page'
          ],
          links: [
            { text: 'Check Sanity Status', url: 'https://status.sanity.io' }
          ]
        };
      case 'permission':
        return {
          title: 'Permission Error',
          guidance: [
            'Verify your Sanity API token has the required permissions',
            'Check if the token has expired',
            'Ensure you have read/write access to the dataset'
          ],
          links: [
            { text: 'Sanity Token Management', url: 'https://www.sanity.io/docs/api-tokens' }
          ]
        };
      case 'timeout':
        return {
          title: 'Request Timeout',
          guidance: [
            'The request took too long to complete',
            'Check your network connection speed',
            'Try again in a few moments'
          ]
        };
      case 'server':
        return {
          title: 'Server Error',
          guidance: [
            'There was an issue with the server',
            'This has been logged for investigation',
            'Try again in a few minutes'
          ]
        };
      case 'validation':
        return {
          title: 'Validation Error',
          guidance: [
            'Check that all required fields are filled',
            'Verify data formats are correct',
            'Review any field-specific error messages'
          ]
        };
      default:
        return {
          title: 'Unexpected Error',
          guidance: [
            'An unexpected error occurred',
            'Try refreshing the page',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const ErrorIcon = getErrorIcon();
  const errorColor = getErrorColor();
  const guidance = getActionableGuidance();

  if (variant === 'banner') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
        <div className="flex items-start">
          <ErrorIcon className={`h-5 w-5 ${errorColor} mt-0.5 flex-shrink-0`} />
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {guidance.title}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error.message}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {error.retryable && onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {isRetrying ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Retry
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="text-red-700 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ErrorIcon className="h-5 w-5" />
            {guidance.title}
            {error.code && (
              <Badge variant="outline" className="text-xs">
                {error.code}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message}
          </p>

          {error.actionable && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {guidance.guidance.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guidance.links && guidance.links.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Helpful resources:</h4>
              <div className="flex flex-wrap gap-2">
                {guidance.links.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.text}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Try Again
                </Button>
              )}
              {error.details && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDetailsVisible(!detailsVisible)}
                >
                  {detailsVisible ? 'Hide' : 'Show'} Details
                </Button>
              )}
            </div>
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>

          {detailsVisible && error.details && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Technical Details:</h4>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {error.details}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default inline variant
  return (
    <Alert variant="destructive" className={className}>
      <ErrorIcon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium">{guidance.title}:</span> {error.message}
          {error.code && (
            <Badge variant="outline" className="ml-2 text-xs">
              {error.code}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {error.retryable && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              ×
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
