/**
 * Error Boundary Component
 * Catches and handles React errors with user-friendly messages
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorHandler, ErrorType } from '@/lib/errors/errorHandler';
import { securityLogger } from '@/lib/logging/securityLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log the error
    const appError = errorHandler.createError(
      ErrorType.INTERNAL_SERVER_ERROR,
      error.message,
      {
        stackTrace: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      error
    );

    errorHandler.handleError(appError);

    // Log security event if it might be security-related
    if (this.isSecurityRelatedError(error)) {
      securityLogger.logSuspiciousActivity(
        `React error boundary caught potential security issue: ${error.message}`,
        {
          metadata: {
            errorMessage: error.message,
            componentStack: errorInfo.componentStack,
          },
        }
      );
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private isSecurityRelatedError(error: Error): boolean {
    const securityKeywords = [
      'unauthorized',
      'forbidden',
      'authentication',
      'permission',
      'token',
      'csrf',
      'xss',
      'injection',
    ];

    const errorMessage = error.message.toLowerCase();
    return securityKeywords.some(keyword => errorMessage.includes(keyword));
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    
    // Show success message (you might want to use a toast here)
    alert('Error details copied to clipboard. Please share this with support.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <CardTitle className="text-red-700">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We encountered an unexpected error. Our team has been notified and is working to fix this issue.
                </AlertDescription>
              </Alert>

              {errorId && (
                <div className="text-sm text-gray-600">
                  <strong>Error ID:</strong> {errorId}
                </div>
              )}

              {isDevelopment && error && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-800 mb-2">Development Error Details:</h4>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleRetry} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                
                <Button onClick={this.handleReportError} variant="ghost">
                  <Bug className="h-4 w-4 mr-2" />
                  Report Error
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                If this problem persists, please contact support with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;