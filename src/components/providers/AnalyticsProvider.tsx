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