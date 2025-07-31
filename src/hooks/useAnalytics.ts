'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, detectTrafficSource, trackPageView } from '@/lib/analytics/gtag';

export const useAnalytics = () => {
  const pathname = usePathname();
  const hasTrackedSource = useRef(false);

  useEffect(() => {
    // Track page view
    trackPageView(pathname);

    // Detect and track traffic source (only once per session)
    if (!hasTrackedSource.current) {
      detectTrafficSource();
      hasTrackedSource.current = true;
    }

    // Track funnel steps based on page
    if (pathname === '/') {
      analytics.trackFunnelStep('homepage');
    } else if (pathname.startsWith('/blog')) {
      analytics.trackFunnelStep('blog');
    } else if (pathname === '/contact') {
      analytics.trackFunnelStep('contact');
    }
  }, [pathname]);

  return analytics;
};

// Hook for blog post engagement tracking
export const useBlogAnalytics = (postSlug: string, postTitle: string, category?: string) => {
  const startTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    // Track blog view (only once)
    if (!hasTrackedView.current) {
      analytics.trackBlogView(postTitle, postSlug, category);
      hasTrackedView.current = true;
    }

    // Track scroll percentage
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScroll.current = Math.max(maxScroll.current, scrollPercent);
    };

    // Track engagement on page unload
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        analytics.trackBlogEngagement(postSlug, timeSpent, maxScroll.current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track engagement when component unmounts
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 5) {
        analytics.trackBlogEngagement(postSlug, timeSpent, maxScroll.current);
      }
    };
  }, [postSlug, postTitle, category]);

  return analytics;
};

// Hook for contact form tracking
export const useContactAnalytics = () => {
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    if (!hasTrackedView.current) {
      const source = detectTrafficSource();
      analytics.trackContactView(source?.source);
      hasTrackedView.current = true;
    }
  }, []);

  const trackFormStart = () => {
    const source = detectTrafficSource();
    analytics.trackContactFormStart(source?.source);
  };

  const trackFormSubmit = (formData?: any) => {
    const source = detectTrafficSource();
    analytics.trackContactFormSubmit(source?.source, formData);
    analytics.trackFunnelStep('form_submit', source?.source);
  };

  return {
    trackFormStart,
    trackFormSubmit,
    ...analytics,
  };
};