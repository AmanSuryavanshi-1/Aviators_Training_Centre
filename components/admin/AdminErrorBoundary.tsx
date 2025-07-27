'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
}

export function AdminErrorBoundary({ children }: AdminErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set up error handling
  useEffect(() => {
    // Save the original console.error
    const originalConsoleError = console.error;

    // Create a handler for uncaught errors
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
      setErrorMessage(event.message || 'An unknown error occurred');
    };

    // Create a handler for unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setHasError(true);
      setErrorMessage(event.reason?.message || 'An unknown promise rejection occurred');
    };

    // Override console.error to catch React errors
    console.error = (...args) => {
      // Check if this is a React error
      const errorString = args.join(' ');
      if (errorString.includes('React') || errorString.includes('Error:')) {
        setHasError(true);
        setErrorMessage(errorString);
      }
      
      // Call the original console.error
      originalConsoleError.apply(console, args);
    };

    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      console.error = originalConsoleError;
    };
  }, []);

  // Reset error state
  const handleReset = () => {
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-slate-100 mb-4">
            Something went wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            We've encountered an error in the admin interface. This is likely due to the simplified interface missing some features.
          </p>
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 font-mono break-all">
                {errorMessage}
              </p>
            </div>
          )}
          <div className="flex justify-center">
            <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}