'use client';

import { useEffect } from 'react';
import { initGA, GA_MEASUREMENT_ID } from '@/lib/analytics/gtag';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Google Analytics only in production or when measurement ID is available
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      initGA();
    }

    // Initialize custom analytics tracker
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        import('@/lib/analytics/realAnalyticsTracker').then(({ initializeAnalytics, getAnalyticsTracker }) => {
          console.log('🔧 Initializing custom analytics tracker...');
          const tracker = initializeAnalytics();
          
          // Make tracker globally available for testing
          (window as any).analyticsTracker = tracker;
          (window as any).getAnalyticsTracker = getAnalyticsTracker;
          
          console.log('✅ Custom analytics tracker initialized and made globally available');
          console.log('🔍 Tracker available at window.analyticsTracker');
          
          // Verify tracker is working
          if (tracker && typeof tracker.trackPageView === 'function') {
            console.log('✅ Tracker methods verified');
          } else {
            console.error('❌ Tracker methods not available');
          }
          
        }).catch(error => {
          console.error('❌ Failed to initialize custom analytics tracker:', error);
          console.error('   Error details:', error.stack);
        });
      }, 100);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Google Analytics Script */}
      {GA_MEASUREMENT_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  custom_map: {
                    'custom_parameter_1': 'traffic_source',
                    'custom_parameter_2': 'ai_platform'
                  }
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
};