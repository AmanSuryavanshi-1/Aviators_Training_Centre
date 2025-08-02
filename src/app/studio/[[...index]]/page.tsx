/**
 * Sanity Studio Route Handler
 * Serves Sanity Studio at /studio with production configuration
 */

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../studio/sanity.config';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for Studio
function StudioLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Sanity Studio</h2>
        <p className="text-sm text-gray-600">Please wait while we initialize the content management system...</p>
      </div>
    </div>
  );
}

// Error boundary component
function StudioErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Studio Loading Error</h1>
              <p className="text-gray-600 mb-4">
                There was an error loading Sanity Studio. This might be due to:
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-1 mb-6">
                <li>• Network connectivity issues</li>
                <li>• Configuration problems</li>
                <li>• Authentication requirements</li>
              </ul>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry Loading Studio
                </button>
                <a
                  href="/admin"
                  className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-center"
                >
                  Return to Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

// Main Studio component
export default function StudioPage() {
  const [isClient, setIsClient] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Validate configuration
    const requiredEnvVars = {
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      setConfigError(`Missing environment variables: ${missingVars.join(', ')}`);
    }
  }, []);

  // Show loading during SSR
  if (!isClient) {
    return <StudioLoading />;
  }

  // Show configuration error
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h1>
            <p className="text-gray-600 mb-4">{configError}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <a
                href="/admin"
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                Return to Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StudioErrorBoundary>
      <Suspense fallback={<StudioLoading />}>
        <NextStudio config={config} />
      </Suspense>
    </StudioErrorBoundary>
  );
}

// Note: metadata export removed due to 'use client' directive
// Metadata should be handled at the layout level for client components