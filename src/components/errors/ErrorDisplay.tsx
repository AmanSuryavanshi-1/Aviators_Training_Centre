/**
 * Error Display Components
 * User-friendly error messages for different scenarios
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Shield,
  Clock,
  Wifi,
  Settings,
  RefreshCw,
  Home,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { ErrorType, AppError } from '@/lib/errors/errorHandler';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export function ErrorDisplay({ error, onRetry, onDismiss, showDetails = false }: ErrorDisplayProps) {
  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.AUTHENTICATION_FAILED:
      case ErrorType.MEMBER_VALIDATION_FAILED:
      case ErrorType.UNAUTHORIZED_ACCESS:
        return Shield;
      case ErrorType.SESSION_EXPIRED:
        return Clock;
      case ErrorType.NETWORK_ERROR:
        return Wifi;
      case ErrorType.CONFIGURATION_ERROR:
        return Settings;
      default:
        return AlertTriangle;
    }
  };

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.AUTHENTICATION_FAILED:
      case ErrorType.MEMBER_VALIDATION_FAILED:
      case ErrorType.UNAUTHORIZED_ACCESS:
        return 'text-red-500';
      case ErrorType.SESSION_EXPIRED:
        return 'text-yellow-500';
      case ErrorType.NETWORK_ERROR:
        return 'text-blue-500';
      case ErrorType.CONFIGURATION_ERROR:
        return 'text-purple-500';
      default:
        return 'text-red-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const Icon = getErrorIcon(error.type);
  const iconColor = getErrorColor(error.type);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <CardTitle className="text-lg">Error</CardTitle>
          </div>
          <Badge variant={getSeverityColor(error.severity)}>
            {error.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.userMessage}</AlertDescription>
        </Alert>

        {showDetails && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Error Code:</strong> {error.code}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Time:</strong> {new Date(error.context.timestamp).toLocaleString()}
            </div>
            {error.context.requestId && (
              <div className="text-sm text-gray-600">
                <strong>Request ID:</strong> {error.context.requestId}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          {error.retryable && onRetry && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="outline" size="sm">
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specific error components for common scenarios

export function AuthenticationError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-500" />
            <CardTitle>Authentication Required</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to access this page. Please sign in with your authorized account.
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/login'} className="flex-1">
              Sign In
            </Button>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MemberValidationError({ email }: { email?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-500" />
            <CardTitle>Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {email 
                ? `The email ${email} is not authorized to access this system.`
                : 'You are not authorized to access this system.'
              }
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600">
            <p>Only project members can access the admin dashboard and Studio.</p>
            <p className="mt-2">If you believe this is an error, please contact your administrator.</p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
              Try Different Account
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SessionExpiredError({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-yellow-500" />
            <CardTitle>Session Expired</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your session has expired for security reasons. Please log in again to continue.
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            <Button 
              onClick={onLogin || (() => window.location.href = '/login')} 
              className="flex-1"
            >
              Sign In Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Wifi className="h-6 w-6 text-blue-500" />
          <CardTitle>Connection Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to the server. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfigurationError({ contactEmail }: { contactEmail?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-purple-500" />
            <CardTitle>Configuration Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              The system is not properly configured. Please contact your administrator.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600">
            <p>This error typically occurs when:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Environment variables are missing</li>
              <li>API connections are not configured</li>
              <li>Required services are unavailable</li>
            </ul>
          </div>
          
          <div className="flex space-x-2">
            {contactEmail && (
              <Button 
                onClick={() => window.location.href = `mailto:${contactEmail}`}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StudioNavigationError({ studioUrl, onRetry }: { studioUrl?: string; onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ExternalLink className="h-6 w-6 text-orange-500" />
          <CardTitle>Studio Navigation Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            Unable to navigate to Sanity Studio. The Studio might be temporarily unavailable.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-gray-600">
          <p>You can try:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Accessing Studio directly</li>
          </ul>
        </div>
        
        <div className="flex space-x-2">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {studioUrl && (
            <Button 
              onClick={() => window.open(studioUrl, '_blank')}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Studio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Generic error display for any AppError
export function GenericErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const getSpecificComponent = () => {
    switch (error.type) {
      case ErrorType.AUTHENTICATION_FAILED:
        return <AuthenticationError onRetry={onRetry} />;
      
      case ErrorType.MEMBER_VALIDATION_FAILED:
        return <MemberValidationError email={error.context.email} />;
      
      case ErrorType.SESSION_EXPIRED:
        return <SessionExpiredError onLogin={onRetry} />;
      
      case ErrorType.NETWORK_ERROR:
        return <NetworkError onRetry={onRetry} />;
      
      case ErrorType.CONFIGURATION_ERROR:
        return <ConfigurationError contactEmail="support@example.com" />;
      
      case ErrorType.STUDIO_NAVIGATION_ERROR:
        return <StudioNavigationError onRetry={onRetry} />;
      
      default:
        return <ErrorDisplay error={error} onRetry={onRetry} onDismiss={onDismiss} />;
    }
  };

  return getSpecificComponent();
}