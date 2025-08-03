/**
 * Sanity Studio Route Handler
 * Clean studio experience without navbar/footer
 */

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../studio/sanity.config';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Simple loading component
function StudioLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Content Studio</h2>
        <p className="text-sm text-gray-600">Initializing Sanity Studio...</p>
      </div>
    </div>
  );
}

// Main Studio component
export default function StudioPage() {
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Set loaded after a short delay to prevent flash
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading during SSR and initial client render
  if (!isClient || !isLoaded) {
    return <StudioLoading />;
  }

  return (
    <div className="studio-container min-h-screen bg-white">
      <Suspense fallback={<StudioLoading />}>
        <NextStudio config={config} />
      </Suspense>
    </div>
  );
}