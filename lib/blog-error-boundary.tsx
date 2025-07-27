'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Enhanced Error Boundary for Blog Components
export class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Blog Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="blog-error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong with the blog content
              </h3>
            </div>
          </div>
          
          <div className="text-sm text-red-700 mb-4">
            <p>
              We're experiencing technical difficulties loading this content. 
              Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-red-100 rounded border">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping blog components with error boundary
export function withBlogErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <BlogErrorBoundary fallback={fallback}>
      <Component {...props} />
    </BlogErrorBoundary>
  );

  WrappedComponent.displayName = `withBlogErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling async errors in functional components
export function useBlogErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Blog error${context ? ` in ${context}` : ''}:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    });

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: { context } });
    }
  }, []);

  return { handleError };
}

// Fallback components for different blog sections
export const BlogPostFallback = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Blog post temporarily unavailable
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            This blog post is currently unavailable. Please try again later or browse our other content.
          </p>
          <div className="mt-4">
            <a
              href="/blog"
              className="text-yellow-800 hover:text-yellow-900 underline text-sm"
            >
              ← Back to all blog posts
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const BlogListFallback = () => (
  <div className="max-w-7xl mx-auto p-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Blog posts temporarily unavailable
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            We're having trouble loading the blog posts right now. Please check back in a few minutes.
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-blue-800 hover:text-blue-900 underline text-sm"
            >
              Try refreshing the page
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);