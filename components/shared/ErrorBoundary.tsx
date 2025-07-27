"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console and external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo || undefined}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  errorInfo 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              An unexpected error occurred while loading this page. This has been logged and our team will investigate.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You can try refreshing the page or return to the homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Error Details
            </Button>

            {showDetails && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <h4 className="font-semibold mb-2">Error Details:</h4>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\nStack Trace:\n'}
                      {error.stack}
                    </>
                  )}
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
export { type ErrorFallbackProps };