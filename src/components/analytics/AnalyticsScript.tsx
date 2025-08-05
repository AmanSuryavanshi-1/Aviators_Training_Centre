'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function AnalyticsScript() {
  useEffect(() => {
    // Initialize analytics when the component mounts
    if (typeof window !== 'undefined') {
      import('@/lib/analytics/realAnalyticsTracker').then(({ initializeAnalytics }) => {
        const tracker = initializeAnalytics();
        // Make tracker globally available for testing
        (window as any).analyticsTracker = tracker;
        console.log('✅ Analytics tracker initialized in AnalyticsScript');
      }).catch(error => {
        console.error('❌ Failed to initialize analytics tracker:', error);
      });
    }
  }, []);

  return (
    <>
      {/* Analytics tracking script */}
      <Script id="analytics-tracker" strategy="afterInteractive">
        {`
          // Initialize analytics tracking
          window.analyticsConfig = {
            trackPageViews: true,
            trackInteractions: true,
            trackConversions: true,
            debug: ${process.env.NODE_ENV === 'development'}
          };
          
          // Function to wait for analytics tracker
          function waitForAnalyticsTracker(callback, maxAttempts = 50) {
            let attempts = 0;
            const checkTracker = () => {
              attempts++;
              if (window.analyticsTracker) {
                console.log('✅ Analytics tracker found after', attempts, 'attempts');
                callback(window.analyticsTracker);
              } else if (attempts < maxAttempts) {
                setTimeout(checkTracker, 100);
              } else {
                console.error('❌ Analytics tracker not found after', maxAttempts, 'attempts');
              }
            };
            checkTracker();
          }
          
          // Track initial page view when tracker is ready
          if (typeof window !== 'undefined') {
            window.addEventListener('load', function() {
              waitForAnalyticsTracker(function(tracker) {
                console.log('📊 Tracking initial page view');
                tracker.trackPageView();
              });
            });
          }
          
          // Make waitForAnalyticsTracker globally available for testing
          window.waitForAnalyticsTracker = waitForAnalyticsTracker;
        `}
      </Script>
    </>
  );
}