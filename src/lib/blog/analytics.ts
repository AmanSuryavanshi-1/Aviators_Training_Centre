// Blog CTA Analytics tracking system
// This module provides comprehensive tracking for CTA interactions and conversions

export interface CTAInteractionData {
  ctaId: string;
  blogPostId: string;
  blogPostSlug: string;
  ctaType: 'course-promo' | 'consultation' | 'newsletter' | 'download' | 'contact';
  ctaPosition: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  targetCourse?: string;
  action: 'primary' | 'secondary' | 'view' | 'hover' | 'click' | 'impression';
  variant: 'card' | 'banner' | 'inline' | 'minimal' | 'gradient' | 'testimonial';
  testId?: string;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface CTAAnalyticsResponse {
  success: boolean;
  interactionId: string;
  timestamp: string;
  data: CTAInteractionData;
}

// Track CTA interactions with comprehensive data collection
export async function trackCTAInteraction(data: CTAInteractionData): Promise<CTAAnalyticsResponse> {
  try {
    // Generate unique interaction ID
    const interactionId = `cta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Enhance data with browser information
    const enhancedData: CTAInteractionData = {
      ...data,
      timestamp,
      userId: getUserId(),
      sessionId: getSessionId(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined') {
      // Google Analytics 4 event tracking
      if ((window as any).gtag) {
        (window as any).gtag('event', 'cta_interaction', {
          event_category: 'CTA',
          event_label: `${data.variant}_${data.ctaPosition}`,
          cta_id: data.ctaId,
          blog_post_slug: data.blogPostSlug,
          course_target: data.targetCourse,
          action_type: data.action,
          custom_parameter_1: data.testId,
        });
      }

      // Facebook Pixel tracking
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: data.blogPostSlug,
          content_category: 'Blog CTA',
          value: data.action === 'primary' ? 1 : 0.5,
        });
      }

      // Custom analytics endpoint (if available)
      try {
        await fetch('/api/analytics/cta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enhancedData),
        });
      } catch (error) {
        console.warn('Failed to send CTA analytics to custom endpoint:', error);
      }
    }

    // Store in local storage for offline tracking
    storeOfflineAnalytics(enhancedData);

    return {
      success: true,
      interactionId,
      timestamp,
      data: enhancedData,
    };
  } catch (error) {
    console.error('Error tracking CTA interaction:', error);
    
    return {
      success: false,
      interactionId: 'error',
      timestamp: new Date().toISOString(),
      data,
    };
  }
}

// Generate or retrieve user ID for tracking
function getUserId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let userId = localStorage.getItem('atc_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('atc_user_id', userId);
  }
  return userId;
}

// Generate or retrieve session ID for tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('atc_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('atc_session_id', sessionId);
  }
  return sessionId;
}

// Store analytics data offline for later sync
function storeOfflineAnalytics(data: CTAInteractionData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const offlineData = JSON.parse(localStorage.getItem('atc_offline_analytics') || '[]');
    offlineData.push(data);
    
    // Keep only last 100 interactions to prevent storage bloat
    if (offlineData.length > 100) {
      offlineData.splice(0, offlineData.length - 100);
    }
    
    localStorage.setItem('atc_offline_analytics', JSON.stringify(offlineData));
  } catch (error) {
    console.warn('Failed to store offline analytics:', error);
  }
}

// Sync offline analytics when connection is restored
export function syncOfflineAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const offlineData = JSON.parse(localStorage.getItem('atc_offline_analytics') || '[]');
    
    if (offlineData.length > 0) {
      // Send batch analytics data
      fetch('/api/analytics/cta/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interactions: offlineData }),
      }).then(() => {
        // Clear offline data after successful sync
        localStorage.removeItem('atc_offline_analytics');
      }).catch((error) => {
        console.warn('Failed to sync offline analytics:', error);
      });
    }
  } catch (error) {
    console.warn('Error syncing offline analytics:', error);
  }
}

// Initialize analytics system
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Sync offline data on page load
  syncOfflineAnalytics();
  
  // Set up online/offline event listeners
  window.addEventListener('online', syncOfflineAnalytics);
  
  // Track page visibility for engagement metrics
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncOfflineAnalytics();
    }
  });
}

// CTA Performance Analytics
export interface CTAPerformanceMetrics {
  ctaId: string;
  variant: string;
  position: string;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averageTimeToClick: number;
  topPerformingPosts: Array<{
    postSlug: string;
    postTitle: string;
    clicks: number;
    conversions: number;
  }>;
}

// Get CTA performance metrics (would typically fetch from analytics API)
export async function getCTAPerformanceMetrics(
  ctaId: string,
  dateRange?: { start: string; end: string }
): Promise<CTAPerformanceMetrics | null> {
  try {
    // This would typically make an API call to your analytics service
    // For now, return mock data structure
    return {
      ctaId,
      variant: 'card',
      position: 'middle',
      impressions: 1000,
      clicks: 150,
      conversions: 25,
      clickThroughRate: 15.0,
      conversionRate: 16.7,
      averageTimeToClick: 45.2,
      topPerformingPosts: [
        {
          postSlug: 'aviation-career-guide',
          postTitle: 'Complete Guide to Starting Your Aviation Career',
          clicks: 45,
          conversions: 8,
        },
        {
          postSlug: 'pilot-training-requirements',
          postTitle: 'Pilot Training Requirements in India',
          clicks: 32,
          conversions: 6,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching CTA performance metrics:', error);
    return null;
  }
}

// A/B Testing utilities
export function getABTestVariant(testId: string, variants: string[]): string {
  if (typeof window === 'undefined') return variants[0];
  
  // Use consistent hashing based on user ID to ensure same user sees same variant
  const userId = getUserId();
  const hash = simpleHash(userId + testId);
  const variantIndex = hash % variants.length;
  
  return variants[variantIndex];
}

// Simple hash function for A/B testing
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get top performing blog posts based on CTA interactions
export async function getTopPerformingBlogPosts(
  limit: number = 10,
  dateRange?: { start: string; end: string }
): Promise<Array<{
  postSlug: string;
  postTitle: string;
  views: number;
  ctaClicks: number;
  conversions: number;
  conversionRate: number;
}>> {
  try {
    // This would typically make an API call to your analytics service
    // For now, return mock data structure
    return [
      {
        postSlug: 'dgca-exam-preparation-guide',
        postTitle: 'Complete Guide to DGCA Exam Preparation',
        views: 2500,
        ctaClicks: 180,
        conversions: 32,
        conversionRate: 17.8,
      },
      {
        postSlug: 'aviation-career-guide',
        postTitle: 'Aviation Career Guide: From Student to Captain',
        views: 1800,
        ctaClicks: 145,
        conversions: 28,
        conversionRate: 19.3,
      },
      {
        postSlug: 'aircraft-systems-fundamentals',
        postTitle: 'Aircraft Systems Fundamentals',
        views: 1200,
        ctaClicks: 95,
        conversions: 18,
        conversionRate: 18.9,
      },
    ].slice(0, limit);
  } catch (error) {
    console.error('Error fetching top performing blog posts:', error);
    return [];
  }
}

// Get blog to course conversion funnel data
export async function getBlogToCourseFunnel(
  blogPostSlug?: string,
  courseSlug?: string,
  dateRange?: { start: string; end: string }
): Promise<{
  blogViews: number;
  ctaClicks: number;
  coursePageViews: number;
  inquiries: number;
  enrollments: number;
  conversionRates: {
    blogToCTA: number;
    ctaToCourse: number;
    courseToInquiry: number;
    inquiryToEnrollment: number;
    overallConversion: number;
  };
}> {
  try {
    // This would typically make an API call to your analytics service
    // For now, return mock data structure
    return {
      blogViews: 5000,
      ctaClicks: 400,
      coursePageViews: 320,
      inquiries: 85,
      enrollments: 28,
      conversionRates: {
        blogToCTA: 8.0,
        ctaToCourse: 80.0,
        courseToInquiry: 26.6,
        inquiryToEnrollment: 32.9,
        overallConversion: 0.56,
      },
    };
  } catch (error) {
    console.error('Error fetching blog to course funnel data:', error);
    return {
      blogViews: 0,
      ctaClicks: 0,
      coursePageViews: 0,
      inquiries: 0,
      enrollments: 0,
      conversionRates: {
        blogToCTA: 0,
        ctaToCourse: 0,
        courseToInquiry: 0,
        inquiryToEnrollment: 0,
        overallConversion: 0,
      },
    };
  }
}

// Initialize analytics (alias for initializeAnalytics)
export function initialize(): void {
  initializeAnalytics();
}

// Export analytics initialization for use in app
export default {
  trackCTAInteraction,
  syncOfflineAnalytics,
  initializeAnalytics,
  initialize,
  getCTAPerformanceMetrics,
  getABTestVariant,
  getTopPerformingBlogPosts,
  getBlogToCourseFunnel,
};
