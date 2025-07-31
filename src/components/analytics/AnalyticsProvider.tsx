'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { comprehensiveTracker } from '@/lib/analytics/comprehensive-tracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize tracker when component mounts
    if (typeof window !== 'undefined') {
      // Track page view for new route
      comprehensiveTracker.trackEvent('pageview', {
        page: pathname,
        metadata: {
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [pathname]);

  useEffect(() => {
    // Track contact page visits
    if (pathname === '/contact') {
      comprehensiveTracker.trackContactVisit();
    }
  }, [pathname]);

  return <>{children}</>;
}