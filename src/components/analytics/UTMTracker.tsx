'use client';

import { useEffect } from 'react';
import { initializeUTMTracking } from '@/lib/utils/utmTracker';

/**
 * UTM Tracker Component
 * Initializes UTM parameter tracking on mount
 * Should be included in the root layout
 */
export default function UTMTracker() {
  useEffect(() => {
    // Initialize UTM tracking when component mounts
    initializeUTMTracking();
    
    // Log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 UTM Tracker initialized');
    }
  }, []);

  // This component doesn't render anything
  return null;
}
