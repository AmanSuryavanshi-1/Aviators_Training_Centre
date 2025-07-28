/**
 * React hook for conversion tracking
 */

import { useEffect, useCallback } from 'react';
import { blogConversionTracker, ConversionData } from '@/lib/analytics/blog-conversion-tracker';

export function useConversionTracking() {
  /**
   * Track blog post view
   */
  const trackBlogView = useCallback(async (postId: string, metadata?: Record<string, any>) => {
    await blogConversionTracker.trackBlogView(postId, metadata);
  }, []);

  /**
   * Track CTA click
   */
  const trackCTAClick = useCallback(async (ctaId: string, postId: string, metadata?: Record<string, any>) => {
    await blogConversionTracker.trackCTAClick(ctaId, postId, metadata);
  }, []);

  /**
   * Track contact page visit
   */
  const trackContactPageVisit = useCallback(async (metadata?: Record<string, any>) => {
    await blogConversionTracker.trackContactPageVisit(metadata);
  }, []);

  /**
   * Track form submission
   */
  const trackFormSubmission = useCallback(async (formType: string, metadata?: Record<string, any>) => {
    await blogConversionTracker.trackFormSubmission(formType, metadata);
  }, []);

  /**
   * Get conversion data
   */
  const getConversionData = useCallback(async (timeframe?: 'day' | 'week' | 'month' | 'all'): Promise<ConversionData> => {
    return await blogConversionTracker.getConversionData(timeframe);
  }, []);

  return {
    trackBlogView,
    trackCTAClick,
    trackContactPageVisit,
    trackFormSubmission,
    getConversionData
  };
}

/**
 * Hook for automatic page view tracking
 */
export function usePageViewTracking(pageType: 'blog' | 'contact' | 'other', pageId?: string) {
  const { trackBlogView, trackContactPageVisit } = useConversionTracking();

  useEffect(() => {
    const trackPageView = async () => {
      if (pageType === 'blog' && pageId) {
        await trackBlogView(pageId, {
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      } else if (pageType === 'contact') {
        await trackContactPageVisit({
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Track page view after a short delay to ensure page is loaded
    const timer = setTimeout(trackPageView, 1000);

    return () => clearTimeout(timer);
  }, [pageType, pageId, trackBlogView, trackContactPageVisit]);
}

/**
 * Hook for CTA tracking with click handlers
 */
export function useCTATracking(postId?: string) {
  const { trackCTAClick } = useConversionTracking();

  const createCTAClickHandler = useCallback((ctaId: string, ctaText: string, ctaPosition: string) => {
    return async (event: React.MouseEvent) => {
      if (postId) {
        await trackCTAClick(ctaId, postId, {
          text: ctaText,
          position: ctaPosition,
          timestamp: new Date().toISOString(),
          clickCoordinates: {
            x: event.clientX,
            y: event.clientY
          }
        });
      }
    };
  }, [postId, trackCTAClick]);

  return { createCTAClickHandler };
}