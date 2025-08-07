'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Home, BookOpen, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { handleReactError, BlogError, BlogErrorType } from '@/lib/blog/comprehensive-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  onError?: (error: BlogError) => void;
}

interface State {
  hasError: boolean;
  blogError: BlogError | null;
  errorId: string;
  retryCount: number;
}

export class ComprehensiveBlogErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      blogError: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `blog-error-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    
    return {
      hasError: true,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Process error through comprehensive handler
    const blogError = handleReactError(error, errorInfo);
    
    this.setState({ blogError });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(blogError);
    }

    // Log error for monitoring
    console.error('Blog Error Boundary caught an error:', {
      errorId: this.state.errorId,
      error: blogError,
      componentStack: errorInfo.componentStack,
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(blogError, errorInfo);
    }
  }

  private reportError(blogError: BlogError, errorInfo: ErrorInfo) {
    // Here you would integrate with your error tracking service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    try {
      // Example Sentry integration:
      // Sentry.captureException(blogError.originalError, {
      //   tags: {
      //     errorType: blogError.type,
      //     component: 'BlogErrorBoundary',
      //   },
      //   extra: {
      //     blogError,
      //     componentStack: errorInfo.componentStack,
      //   },
      // });
      
      console.log('Error reported to monitoring service:', {
        errorId: this.state.errorId,
        type: blogError.type,
        message: blogError.message,
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        blogError: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderErrorUI() {
    const { blogError, errorId, retryCount } = this.state;
    const { showErrorDetails = false } = this.props;

    if (!blogError) {
      return this.renderGenericError();
    }

    const canRetry = blogError.retryable && retryCount < this.maxRetries;
    const isNetworkError = blogError.type === BlogErrorType.NETWORK_ERROR || 
                          blogError.type === BlogErrorType.SANITY_CONNECTION;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-semibold">
              {this.getErrorTitle(blogError.type)}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User-friendly error message */}
            <Alert>
              <AlertDescription className="text-center">
                {blogError.userMessage}
              </AlertDescription>
            </Alert>

            {/* Network-specific guidance */}
            {isNetworkError && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Disable any ad blockers or VPN</li>
                  <li>Clear your browser cache</li>
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again {retryCount > 0 && `(${retryCount}/${this.maxRetries})`}
                </Button>
              )}
              
              <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/blog" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>

            {/* Contact support */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Still having issues? We're here to help.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>

            {/* Technical details for debugging */}
            {showErrorDetails && process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono space-y-2">
                  <div><strong>Error ID:</strong> {errorId}</div>
                  <div><strong>Type:</strong> {blogError.type}</div>
                  <div><strong>Message:</strong> {blogError.message}</div>
                  <div><strong>Retryable:</strong> {blogError.retryable ? 'Yes' : 'No'}</div>
                  <div><strong>Timestamp:</strong> {blogError.timestamp.toISOString()}</div>
                  {blogError.technicalDetails && (
                    <div><strong>Details:</strong> {blogError.technicalDetails}</div>
                  )}
                  {blogError.context && (
                    <div><strong>Context:</strong> {JSON.stringify(blogError.context, null, 2)}</div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  private renderGenericError() {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  private getErrorTitle(errorType: BlogErrorType): string {
    switch (errorType) {
      case BlogErrorType.SANITY_CORS:
        return 'Content Service Unavailable';
      case BlogErrorType.SANITY_PERMISSION:
        return 'Access Denied';
      case BlogErrorType.SANITY_TIMEOUT:
        return 'Request Timed Out';
      case BlogErrorType.SANITY_RATE_LIMIT:
        return 'Service Temporarily Busy';
      case BlogErrorType.NETWORK_ERROR:
        return 'Connection Problem';
      case BlogErrorType.IMAGE_PROCESSING:
        return 'Image Loading Issue';
      case BlogErrorType.MARKDOWN_PARSING:
        return 'Content Formatting Issue';
      case BlogErrorType.VALIDATION_ERROR:
        return 'Invalid Data';
      case BlogErrorType.SERVER_ERROR:
        return 'Server Error';
      case BlogErrorType.CLIENT_ERROR:
        return 'Content Not Found';
      default:
        return 'Unexpected Error';
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withBlogErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ComprehensiveBlogErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComprehensiveBlogErrorBoundary>
  );
  
  WrappedComponent.displayName = `withBlogErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ComprehensiveBlogErrorBoundary;
