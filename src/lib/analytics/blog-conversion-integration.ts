// Integration layer for blog conversion tracking
// This module provides easy-to-use functions for tracking conversions from blog posts

import { conversionTracker, trackBlogView, trackCTAClick, trackCoursePageView } from './conversion-tracking';

export interface BlogConversionConfig {
  blogPostId: string;
  blogPostSlug: string;
  blogPostTitle: string;
  category: string;
  author: string;
  publishedAt: string;
}

export interface CTAConversionConfig {
  ctaId: string;
  ctaPosition: 'top' | 'middle' | 'bottom' | 'sidebar';
  ctaVariant: 'card' | 'banner' | 'inline' | 'floating';
  targetCourse: {
    id: string;
    slug: string;
    name: string;
    category: string;
  };
}

class BlogConversionIntegration {
  private pageViewTracked = new Set<string>();
  private ctaClicksTracked = new Map<string, number>();

  // Initialize blog post tracking
  async initializeBlogTracking(config: BlogConversionConfig): Promise<void> {
    const trackingKey = `${config.blogPostId}_${conversionTracker.getSessionId()}`;
    
    // Avoid duplicate page view tracking in the same session
    if (this.pageViewTracked.has(trackingKey)) {
      return;
    }

    try {
      await trackBlogView(config.blogPostId, config.blogPostSlug, {
        title: config.blogPostTitle,
        category: config.category,
        author: config.author,
        publishedAt: config.publishedAt,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        timestamp: new Date().toISOString()
      });

      this.pageViewTracked.add(trackingKey);
      
      // Track reading progress
      this.initializeReadingProgressTracking(config);
      
      // Track scroll depth
      this.initializeScrollDepthTracking(config);
      
      console.log(`Blog view tracked for: ${config.blogPostTitle}`);
    } catch (error) {
      console.error('Error initializing blog tracking:', error);
    }
  }

  // Track CTA click with intelligent course routing
  async trackCTAConversion(
    blogConfig: BlogConversionConfig,
    ctaConfig: CTAConversionConfig,
    additionalMetadata?: Record<string, any>
  ): Promise<void> {
    const clickKey = `${ctaConfig.ctaId}_${conversionTracker.getSessionId()}`;
    const clickCount = this.ctaClicksTracked.get(clickKey) || 0;
    
    try {
      await trackCTAClick(
        ctaConfig.ctaId,
        ctaConfig.ctaPosition,
        ctaConfig.ctaVariant,
        blogConfig.blogPostId,
        blogConfig.blogPostSlug,
        ctaConfig.targetCourse.id,
        {
          blogTitle: blogConfig.blogPostTitle,
          blogCategory: blogConfig.category,
          courseTitle: ctaConfig.targetCourse.name,
          courseCategory: ctaConfig.targetCourse.category,
          clickCount: clickCount + 1,
          timeOnPage: this.getTimeOnPage(),
          scrollDepth: this.getScrollDepth(),
          ...additionalMetadata
        }
      );

      this.ctaClicksTracked.set(clickKey, clickCount + 1);
      
      console.log(`CTA click tracked: ${ctaConfig.ctaId} -> ${ctaConfig.targetCourse.name}`);
    } catch (error) {
      console.error('Error tracking CTA conversion:', error);
    }
  }

  // Track course page view from blog referral
  async trackCoursePageFromBlog(
    courseId: string,
    courseSlug: string,
    referrerBlogPost: string,
    additionalMetadata?: Record<string, any>
  ): Promise<void> {
    try {
      await trackCoursePageView(courseId, courseSlug, referrerBlogPost);
      
      // Additional course engagement tracking
      this.initializeCourseEngagementTracking(courseId, courseSlug, referrerBlogPost);
      
      console.log(`Course page view tracked: ${courseSlug} from blog: ${referrerBlogPost}`);
    } catch (error) {
      console.error('Error tracking course page view:', error);
    }
  }

  // Initialize reading progress tracking
  private initializeReadingProgressTracking(config: BlogConversionConfig): void {
    if (typeof window === 'undefined') return;

    const milestones = [25, 50, 75, 100];
    const trackedMilestones = new Set<number>();

    const trackReadingProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          
          // Track reading milestone
          this.trackReadingMilestone(config, milestone);
        }
      });
    };

    window.addEventListener('scroll', trackReadingProgress, { passive: true });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('scroll', trackReadingProgress);
    });
  }

  // Track reading milestone
  private async trackReadingMilestone(config: BlogConversionConfig, milestone: number): Promise<void> {
    try {
      // Send reading progress event
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reading_progress',
          blogPostId: config.blogPostId,
          blogPostSlug: config.blogPostSlug,
          userId: conversionTracker.getUserId(),
          sessionId: conversionTracker.getSessionId(),
          value: milestone,
          metadata: {
            milestone,
            timeOnPage: this.getTimeOnPage(),
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error tracking reading milestone:', error);
    }
  }

  // Initialize scroll depth tracking
  private initializeScrollDepthTracking(config: BlogConversionConfig): void {
    if (typeof window === 'undefined') return;

    let maxScrollDepth = 0;
    
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    // Send final scroll depth on page unload
    window.addEventListener('beforeunload', () => {
      this.trackFinalScrollDepth(config, maxScrollDepth);
      window.removeEventListener('scroll', trackScrollDepth);
    });
  }

  // Track final scroll depth
  private async trackFinalScrollDepth(config: BlogConversionConfig, scrollDepth: number): Promise<void> {
    try {
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scroll_depth',
          blogPostId: config.blogPostId,
          blogPostSlug: config.blogPostSlug,
          userId: conversionTracker.getUserId(),
          sessionId: conversionTracker.getSessionId(),
          value: scrollDepth,
          metadata: {
            maxScrollDepth: scrollDepth,
            timeOnPage: this.getTimeOnPage(),
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error tracking scroll depth:', error);
    }
  }

  // Initialize course engagement tracking
  private initializeCourseEngagementTracking(
    courseId: string, 
    courseSlug: string, 
    referrerBlogPost: string
  ): void {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    let engagementEvents = 0;

    // Track various engagement events
    const trackEngagement = (eventType: string) => {
      engagementEvents++;
      
      // Send engagement event every 5 interactions
      if (engagementEvents % 5 === 0) {
        this.trackCourseEngagement(courseId, courseSlug, referrerBlogPost, eventType, engagementEvents);
      }
    };

    // Track clicks, scrolls, and other interactions
    ['click', 'scroll', 'keydown'].forEach(eventType => {
      window.addEventListener(eventType, () => trackEngagement(eventType), { passive: true });
    });

    // Track time spent on course page
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      this.trackCourseTimeSpent(courseId, courseSlug, referrerBlogPost, timeSpent, engagementEvents);
    });
  }

  // Track course engagement event
  private async trackCourseEngagement(
    courseId: string,
    courseSlug: string,
    referrerBlogPost: string,
    eventType: string,
    totalEvents: number
  ): Promise<void> {
    try {
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'course_engagement',
          courseId,
          courseSlug,
          userId: conversionTracker.getUserId(),
          sessionId: conversionTracker.getSessionId(),
          value: totalEvents,
          metadata: {
            referrerBlogPost,
            eventType,
            totalEvents,
            timeOnPage: this.getTimeOnPage(),
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error tracking course engagement:', error);
    }
  }

  // Track time spent on course page
  private async trackCourseTimeSpent(
    courseId: string,
    courseSlug: string,
    referrerBlogPost: string,
    timeSpent: number,
    totalEvents: number
  ): Promise<void> {
    try {
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'course_time_spent',
          courseId,
          courseSlug,
          userId: conversionTracker.getUserId(),
          sessionId: conversionTracker.getSessionId(),
          value: timeSpent,
          metadata: {
            referrerBlogPost,
            timeSpent,
            totalEvents,
            engagementRate: totalEvents / Math.max(timeSpent / 60, 1), // Events per minute
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error tracking course time spent:', error);
    }
  }

  // Get time spent on current page
  private getTimeOnPage(): number {
    if (typeof window === 'undefined') return 0;
    
    const navigationStart = performance.timing?.navigationStart || Date.now();
    return Math.round((Date.now() - navigationStart) / 1000);
  }

  // Get current scroll depth
  private getScrollDepth(): number {
    if (typeof window === 'undefined') return 0;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrollTop / docHeight) * 100);
  }

  // Generate conversion report for a specific blog post
  async generateBlogConversionReport(blogPostId: string, dateRange?: { start: string; end: string }) {
    try {
      const [funnelData, attributions, roiData] = await Promise.all([
        conversionTracker.getConversionFunnel(dateRange, blogPostId),
        conversionTracker.getLeadAttribution('last_touch', dateRange),
        conversionTracker.calculateBlogROI(blogPostId, dateRange)
      ]);

      const blogAttributions = attributions.filter(attr => attr.blogPostId === blogPostId);

      return {
        blogPostId,
        dateRange,
        performance: {
          views: funnelData.blogViews,
          ctaClicks: funnelData.ctaClicks,
          conversions: funnelData.payments,
          revenue: funnelData.revenue.total,
          conversionRate: funnelData.conversionRates.overallConversion,
          ctaConversionRate: funnelData.conversionRates.blogToCTA
        },
        attribution: {
          totalAttributions: blogAttributions.length,
          averageTimeToConversion: blogAttributions.length > 0 
            ? blogAttributions.reduce((sum, attr) => sum + attr.conversionTime, 0) / blogAttributions.length / 3600
            : 0,
          averageTouchPoints: blogAttributions.length > 0
            ? blogAttributions.reduce((sum, attr) => sum + attr.touchPoints.length, 0) / blogAttributions.length
            : 0
        },
        roi: roiData,
        recommendations: this.generateOptimizationRecommendations(funnelData, roiData)
      };
    } catch (error) {
      console.error('Error generating blog conversion report:', error);
      throw error;
    }
  }

  // Generate optimization recommendations
  private generateOptimizationRecommendations(funnelData: any, roiData: any): string[] {
    const recommendations: string[] = [];

    // CTA optimization recommendations
    if (funnelData.conversionRates.blogToCTA < 5) {
      recommendations.push('Consider improving CTA placement and messaging - current blog-to-CTA rate is below 5%');
    }

    // Course page optimization
    if (funnelData.conversionRates.ctaToCourse < 80) {
      recommendations.push('Optimize CTA targeting - less than 80% of CTA clicks reach course pages');
    }

    // Conversion optimization
    if (funnelData.conversionRates.courseToInquiry < 10) {
      recommendations.push('Improve course page conversion elements - inquiry rate is below 10%');
    }

    // ROI optimization
    if (roiData.roiPercentage < 200) {
      recommendations.push('Focus on higher-value course promotion to improve ROI above 200%');
    }

    // Revenue optimization
    if (funnelData.revenue.revenuePerVisitor < 100) {
      recommendations.push('Consider promoting higher-value courses or improving conversion funnel');
    }

    return recommendations;
  }
}

// Export singleton instance
export const blogConversionIntegration = new BlogConversionIntegration();

// Convenience functions for easy integration
export const initializeBlogTracking = (config: BlogConversionConfig) => {
  return blogConversionIntegration.initializeBlogTracking(config);
};

export const trackCTAConversion = (
  blogConfig: BlogConversionConfig,
  ctaConfig: CTAConversionConfig,
  metadata?: Record<string, any>
) => {
  return blogConversionIntegration.trackCTAConversion(blogConfig, ctaConfig, metadata);
};

export const trackCoursePageFromBlog = (
  courseId: string,
  courseSlug: string,
  referrerBlogPost: string,
  metadata?: Record<string, any>
) => {
  return blogConversionIntegration.trackCoursePageFromBlog(courseId, courseSlug, referrerBlogPost, metadata);
};

export const generateBlogConversionReport = (
  blogPostId: string,
  dateRange?: { start: string; end: string }
) => {
  return blogConversionIntegration.generateBlogConversionReport(blogPostId, dateRange);
};

export default blogConversionIntegration;
