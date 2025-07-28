// Comprehensive conversion tracking and attribution system
// This module handles lead generation tracking from blog posts to course inquiries

export interface ConversionEvent {
  id: string;
  type: 'blog_view' | 'cta_click' | 'course_page_view' | 'inquiry_form' | 'enrollment' | 'payment';
  blogPostId?: string;
  blogPostSlug?: string;
  courseId?: string;
  courseSlug?: string;
  ctaId?: string;
  ctaPosition?: string;
  ctaVariant?: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  value?: number;
  metadata?: Record<string, any>;
  attribution?: AttributionData;
}

export interface AttributionData {
  firstTouch: TouchPoint;
  lastTouch: TouchPoint;
  touchPoints: TouchPoint[];
  conversionPath: string[];
  timeToConversion: number; // in seconds
  touchPointCount: number;
}

export interface TouchPoint {
  type: 'blog_post' | 'cta' | 'course_page' | 'social_media' | 'email' | 'direct' | 'search';
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
  timestamp: string;
  value?: number;
}

export interface ConversionFunnel {
  blogViews: number;
  ctaClicks: number;
  coursePageViews: number;
  inquiries: number;
  enrollments: number;
  payments: number;
  conversionRates: {
    blogToCTA: number;
    ctaToCourse: number;
    courseToInquiry: number;
    inquiryToEnrollment: number;
    enrollmentToPayment: number;
    overallConversion: number;
  };
  revenue: {
    total: number;
    averageOrderValue: number;
    revenuePerVisitor: number;
    revenuePerLead: number;
  };
}

export interface LeadAttribution {
  leadId: string;
  blogPostId: string;
  blogPostTitle: string;
  courseId: string;
  courseName: string;
  conversionValue: number;
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  attributionWeight: number;
  touchPoints: TouchPoint[];
  conversionTime: number;
}

class ConversionTracker {
  private events: ConversionEvent[] = [];
  private userSessions: Map<string, ConversionEvent[]> = new Map();

  // Track a conversion event
  async trackEvent(event: Omit<ConversionEvent, 'id' | 'timestamp'>): Promise<ConversionEvent> {
    const fullEvent: ConversionEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      attribution: await this.calculateAttribution(event.userId, event.sessionId)
    };

    // Store event locally
    this.events.push(fullEvent);
    
    // Update user session
    const userEvents = this.userSessions.get(event.userId) || [];
    userEvents.push(fullEvent);
    this.userSessions.set(event.userId, userEvents);

    // Send to analytics service
    await this.sendToAnalyticsService(fullEvent);

    // Store in database
    await this.storeInDatabase(fullEvent);

    return fullEvent;
  }

  // Track blog post view
  async trackBlogView(blogPostId: string, blogPostSlug: string, userId: string, sessionId: string, metadata?: Record<string, any>): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'blog_view',
      blogPostId,
      blogPostSlug,
      userId,
      sessionId,
      metadata: {
        ...metadata,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      }
    });
  }

  // Track CTA click
  async trackCTAClick(
    ctaId: string, 
    ctaPosition: string, 
    ctaVariant: string, 
    blogPostId: string, 
    blogPostSlug: string, 
    courseId: string, 
    userId: string, 
    sessionId: string,
    metadata?: Record<string, any>
  ): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'cta_click',
      blogPostId,
      blogPostSlug,
      courseId,
      ctaId,
      ctaPosition,
      ctaVariant,
      userId,
      sessionId,
      value: 1, // CTA click value
      metadata
    });
  }

  // Track course page view
  async trackCoursePageView(courseId: string, courseSlug: string, userId: string, sessionId: string, referrerBlogPost?: string): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'course_page_view',
      courseId,
      courseSlug,
      userId,
      sessionId,
      metadata: {
        referrerBlogPost,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track inquiry form submission
  async trackInquiry(courseId: string, courseSlug: string, userId: string, sessionId: string, inquiryValue: number = 50): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'inquiry_form',
      courseId,
      courseSlug,
      userId,
      sessionId,
      value: inquiryValue,
      metadata: {
        leadQuality: 'qualified',
        source: 'blog_funnel'
      }
    });
  }

  // Track enrollment
  async trackEnrollment(courseId: string, courseSlug: string, userId: string, sessionId: string, enrollmentValue: number): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'enrollment',
      courseId,
      courseSlug,
      userId,
      sessionId,
      value: enrollmentValue,
      metadata: {
        conversionType: 'enrollment',
        source: 'blog_funnel'
      }
    });
  }

  // Track payment
  async trackPayment(courseId: string, courseSlug: string, userId: string, sessionId: string, paymentValue: number): Promise<ConversionEvent> {
    return this.trackEvent({
      type: 'payment',
      courseId,
      courseSlug,
      userId,
      sessionId,
      value: paymentValue,
      metadata: {
        conversionType: 'payment',
        source: 'blog_funnel',
        finalConversion: true
      }
    });
  }

  // Calculate attribution for a user
  private async calculateAttribution(userId: string, sessionId: string): Promise<AttributionData | undefined> {
    const userEvents = this.userSessions.get(userId) || [];
    
    if (userEvents.length === 0) return undefined;

    const touchPoints: TouchPoint[] = userEvents.map(event => ({
      type: this.mapEventTypeToTouchPoint(event.type),
      source: event.blogPostSlug || event.courseSlug || 'direct',
      timestamp: event.timestamp,
      value: event.value
    }));

    const firstTouch = touchPoints[0];
    const lastTouch = touchPoints[touchPoints.length - 1];
    const conversionPath = touchPoints.map(tp => tp.source);
    
    const timeToConversion = touchPoints.length > 1 
      ? (new Date(lastTouch.timestamp).getTime() - new Date(firstTouch.timestamp).getTime()) / 1000
      : 0;

    return {
      firstTouch,
      lastTouch,
      touchPoints,
      conversionPath,
      timeToConversion,
      touchPointCount: touchPoints.length
    };
  }

  // Map event type to touch point type
  private mapEventTypeToTouchPoint(eventType: ConversionEvent['type']): TouchPoint['type'] {
    switch (eventType) {
      case 'blog_view':
        return 'blog_post';
      case 'cta_click':
        return 'cta';
      case 'course_page_view':
        return 'course_page';
      default:
        return 'direct';
    }
  }

  // Generate conversion funnel data
  async getConversionFunnel(
    dateRange?: { start: string; end: string },
    blogPostId?: string,
    courseId?: string
  ): Promise<ConversionFunnel> {
    let filteredEvents = this.events;

    // Apply date filter
    if (dateRange) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= dateRange.start && event.timestamp <= dateRange.end
      );
    }

    // Apply blog post filter
    if (blogPostId) {
      filteredEvents = filteredEvents.filter(event => event.blogPostId === blogPostId);
    }

    // Apply course filter
    if (courseId) {
      filteredEvents = filteredEvents.filter(event => event.courseId === courseId);
    }

    // Calculate funnel metrics
    const blogViews = filteredEvents.filter(e => e.type === 'blog_view').length;
    const ctaClicks = filteredEvents.filter(e => e.type === 'cta_click').length;
    const coursePageViews = filteredEvents.filter(e => e.type === 'course_page_view').length;
    const inquiries = filteredEvents.filter(e => e.type === 'inquiry_form').length;
    const enrollments = filteredEvents.filter(e => e.type === 'enrollment').length;
    const payments = filteredEvents.filter(e => e.type === 'payment').length;

    // Calculate conversion rates
    const conversionRates = {
      blogToCTA: blogViews > 0 ? (ctaClicks / blogViews) * 100 : 0,
      ctaToCourse: ctaClicks > 0 ? (coursePageViews / ctaClicks) * 100 : 0,
      courseToInquiry: coursePageViews > 0 ? (inquiries / coursePageViews) * 100 : 0,
      inquiryToEnrollment: inquiries > 0 ? (enrollments / inquiries) * 100 : 0,
      enrollmentToPayment: enrollments > 0 ? (payments / enrollments) * 100 : 0,
      overallConversion: blogViews > 0 ? (payments / blogViews) * 100 : 0
    };

    // Calculate revenue metrics
    const totalRevenue = filteredEvents
      .filter(e => e.type === 'payment')
      .reduce((sum, e) => sum + (e.value || 0), 0);

    const averageOrderValue = payments > 0 ? totalRevenue / payments : 0;
    const revenuePerVisitor = blogViews > 0 ? totalRevenue / blogViews : 0;
    const revenuePerLead = inquiries > 0 ? totalRevenue / inquiries : 0;

    return {
      blogViews,
      ctaClicks,
      coursePageViews,
      inquiries,
      enrollments,
      payments,
      conversionRates,
      revenue: {
        total: totalRevenue,
        averageOrderValue,
        revenuePerVisitor,
        revenuePerLead
      }
    };
  }

  // Get lead attribution data
  async getLeadAttribution(
    attributionModel: LeadAttribution['attributionModel'] = 'last_touch',
    dateRange?: { start: string; end: string }
  ): Promise<LeadAttribution[]> {
    let conversionEvents = this.events.filter(e => e.type === 'payment' || e.type === 'enrollment');

    if (dateRange) {
      conversionEvents = conversionEvents.filter(event => 
        event.timestamp >= dateRange.start && event.timestamp <= dateRange.end
      );
    }

    const attributions: LeadAttribution[] = [];

    for (const conversionEvent of conversionEvents) {
      const userEvents = this.userSessions.get(conversionEvent.userId) || [];
      const blogEvents = userEvents.filter(e => e.type === 'blog_view');
      
      if (blogEvents.length === 0) continue;

      let attributedBlogPost: ConversionEvent;
      let attributionWeight = 1;

      // Apply attribution model
      switch (attributionModel) {
        case 'first_touch':
          attributedBlogPost = blogEvents[0];
          break;
        case 'last_touch':
          attributedBlogPost = blogEvents[blogEvents.length - 1];
          break;
        case 'linear':
          attributedBlogPost = blogEvents[0]; // For simplicity, using first touch
          attributionWeight = 1 / blogEvents.length;
          break;
        case 'time_decay':
          attributedBlogPost = blogEvents[blogEvents.length - 1]; // More recent gets more credit
          attributionWeight = 0.8;
          break;
        case 'position_based':
          attributedBlogPost = blogEvents[0]; // 40% to first, 40% to last, 20% to middle
          attributionWeight = blogEvents.length === 1 ? 1 : 0.4;
          break;
        default:
          attributedBlogPost = blogEvents[blogEvents.length - 1];
      }

      const touchPoints: TouchPoint[] = userEvents.map(event => ({
        type: this.mapEventTypeToTouchPoint(event.type),
        source: event.blogPostSlug || event.courseSlug || 'direct',
        timestamp: event.timestamp,
        value: event.value
      }));

      const conversionTime = new Date(conversionEvent.timestamp).getTime() - 
                           new Date(attributedBlogPost.timestamp).getTime();

      attributions.push({
        leadId: conversionEvent.id,
        blogPostId: attributedBlogPost.blogPostId!,
        blogPostTitle: attributedBlogPost.metadata?.title || 'Unknown Post',
        courseId: conversionEvent.courseId!,
        courseName: conversionEvent.metadata?.courseName || 'Unknown Course',
        conversionValue: conversionEvent.value || 0,
        attributionModel,
        attributionWeight,
        touchPoints,
        conversionTime: conversionTime / 1000 // Convert to seconds
      });
    }

    return attributions;
  }

  // Calculate ROI for blog content with enhanced attribution
  async calculateBlogROI(
    blogPostId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<{
    blogPostId?: string;
    totalRevenue: number;
    totalCost: number;
    roi: number;
    roiPercentage: number;
    conversions: number;
    costPerConversion: number;
    revenuePerConversion: number;
    leadGenerationMetrics: {
      totalLeads: number;
      qualifiedLeads: number;
      leadToCustomerRate: number;
      costPerLead: number;
      leadValue: number;
    };
    attributionBreakdown: {
      directConversions: number;
      assistedConversions: number;
      influencedRevenue: number;
      attributionWeight: number;
    };
  }> {
    const attributions = await this.getLeadAttribution('last_touch', dateRange);
    const allAttributions = await this.getLeadAttribution('linear', dateRange);
    
    let filteredAttributions = attributions;
    let allFilteredAttributions = allAttributions;
    
    if (blogPostId) {
      filteredAttributions = attributions.filter(a => a.blogPostId === blogPostId);
      allFilteredAttributions = allAttributions.filter(a => a.blogPostId === blogPostId);
    }

    const totalRevenue = filteredAttributions.reduce((sum, a) => sum + a.conversionValue, 0);
    const conversions = filteredAttributions.length;
    
    // Enhanced cost calculation including promotion and maintenance
    const baseContentCost = blogPostId ? 5000 : filteredAttributions.length * 5000;
    const promotionCost = baseContentCost * 0.3; // 30% for promotion
    const maintenanceCost = baseContentCost * 0.1; // 10% for maintenance
    const totalCost = baseContentCost + promotionCost + maintenanceCost;
    
    const roi = totalRevenue - totalCost;
    const roiPercentage = totalCost > 0 ? (roi / totalCost) * 100 : 0;
    const costPerConversion = conversions > 0 ? totalCost / conversions : 0;
    const revenuePerConversion = conversions > 0 ? totalRevenue / conversions : 0;

    // Calculate lead generation metrics
    const inquiryEvents = this.events.filter(e => 
      e.type === 'inquiry_form' && 
      (!blogPostId || e.blogPostId === blogPostId) &&
      (!dateRange || (e.timestamp >= dateRange.start && e.timestamp <= dateRange.end))
    );
    
    const totalLeads = inquiryEvents.length;
    const qualifiedLeads = inquiryEvents.filter(e => e.metadata?.leadQuality === 'qualified').length;
    const leadToCustomerRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;
    const costPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;
    const leadValue = totalLeads > 0 ? totalRevenue / totalLeads : 0;

    // Calculate attribution breakdown
    const directConversions = filteredAttributions.filter(a => a.touchPoints.length === 1).length;
    const assistedConversions = filteredAttributions.filter(a => a.touchPoints.length > 1).length;
    const influencedRevenue = allFilteredAttributions.reduce((sum, a) => sum + (a.conversionValue * a.attributionWeight), 0);
    const averageAttributionWeight = allFilteredAttributions.length > 0 
      ? allFilteredAttributions.reduce((sum, a) => sum + a.attributionWeight, 0) / allFilteredAttributions.length 
      : 0;

    return {
      blogPostId,
      totalRevenue,
      totalCost,
      roi,
      roiPercentage,
      conversions,
      costPerConversion,
      revenuePerConversion,
      leadGenerationMetrics: {
        totalLeads,
        qualifiedLeads,
        leadToCustomerRate,
        costPerLead,
        leadValue
      },
      attributionBreakdown: {
        directConversions,
        assistedConversions,
        influencedRevenue,
        attributionWeight: averageAttributionWeight
      }
    };
  }

  // Enhanced lead scoring and qualification
  async scoreLeadQuality(
    userId: string,
    sessionId: string,
    additionalData?: {
      email?: string;
      phone?: string;
      courseInterest?: string;
      experience?: string;
      timeline?: string;
    }
  ): Promise<{
    score: number;
    quality: 'hot' | 'warm' | 'cold' | 'unqualified';
    factors: string[];
    recommendations: string[];
  }> {
    const userEvents = this.userSessions.get(userId) || [];
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Engagement scoring
    const blogViews = userEvents.filter(e => e.type === 'blog_view').length;
    const ctaClicks = userEvents.filter(e => e.type === 'cta_click').length;
    const courseViews = userEvents.filter(e => e.type === 'course_page_view').length;

    if (blogViews >= 3) {
      score += 20;
      factors.push('High content engagement (3+ blog posts)');
    } else if (blogViews >= 1) {
      score += 10;
      factors.push('Some content engagement');
    }

    if (ctaClicks >= 2) {
      score += 25;
      factors.push('Multiple CTA interactions');
    } else if (ctaClicks >= 1) {
      score += 15;
      factors.push('CTA interaction');
    }

    if (courseViews >= 2) {
      score += 30;
      factors.push('Multiple course page views');
    } else if (courseViews >= 1) {
      score += 20;
      factors.push('Course page interest');
    }

    // Contact information scoring
    if (additionalData?.email) {
      score += 15;
      factors.push('Email provided');
    }

    if (additionalData?.phone) {
      score += 20;
      factors.push('Phone number provided');
    }

    // Intent scoring
    if (additionalData?.courseInterest) {
      score += 25;
      factors.push('Specific course interest indicated');
    }

    if (additionalData?.timeline === 'immediate') {
      score += 30;
      factors.push('Immediate enrollment timeline');
    } else if (additionalData?.timeline === 'within_3_months') {
      score += 20;
      factors.push('Near-term enrollment timeline');
    }

    // Experience scoring
    if (additionalData?.experience === 'beginner') {
      score += 15;
      factors.push('Beginner - high training need');
    } else if (additionalData?.experience === 'some_experience') {
      score += 10;
      factors.push('Some experience - upgrade potential');
    }

    // Determine quality and recommendations
    let quality: 'hot' | 'warm' | 'cold' | 'unqualified';
    
    if (score >= 80) {
      quality = 'hot';
      recommendations.push('Immediate follow-up recommended');
      recommendations.push('Direct phone contact within 24 hours');
      recommendations.push('Personalized course consultation');
    } else if (score >= 60) {
      quality = 'warm';
      recommendations.push('Follow-up within 48 hours');
      recommendations.push('Send detailed course information');
      recommendations.push('Schedule consultation call');
    } else if (score >= 30) {
      quality = 'cold';
      recommendations.push('Add to nurture email sequence');
      recommendations.push('Send educational content');
      recommendations.push('Follow-up in 1 week');
    } else {
      quality = 'unqualified';
      recommendations.push('Add to general newsletter');
      recommendations.push('Monitor for increased engagement');
    }

    return {
      score,
      quality,
      factors,
      recommendations
    };
  }

  // Advanced conversion path analysis
  async analyzeConversionPaths(
    dateRange?: { start: string; end: string }
  ): Promise<{
    commonPaths: Array<{
      path: string[];
      frequency: number;
      averageConversionTime: number;
      averageConversionValue: number;
      conversionRate: number;
    }>;
    pathEfficiency: {
      shortestPath: string[];
      longestPath: string[];
      mostEfficientPath: string[];
      averagePathLength: number;
    };
    dropOffPoints: Array<{
      step: string;
      dropOffRate: number;
      suggestions: string[];
    }>;
  }> {
    const attributions = await this.getLeadAttribution('last_touch', dateRange);
    
    // Analyze conversion paths
    const pathFrequency = new Map<string, {
      count: number;
      totalTime: number;
      totalValue: number;
      conversions: number;
    }>();

    attributions.forEach(attribution => {
      const pathKey = attribution.touchPoints.map(tp => tp.type).join(' -> ');
      const existing = pathFrequency.get(pathKey) || {
        count: 0,
        totalTime: 0,
        totalValue: 0,
        conversions: 0
      };

      existing.count += 1;
      existing.totalTime += attribution.conversionTime;
      existing.totalValue += attribution.conversionValue;
      existing.conversions += 1;

      pathFrequency.set(pathKey, existing);
    });

    // Convert to common paths array
    const commonPaths = Array.from(pathFrequency.entries())
      .map(([pathString, data]) => ({
        path: pathString.split(' -> '),
        frequency: data.count,
        averageConversionTime: data.totalTime / data.count,
        averageConversionValue: data.totalValue / data.count,
        conversionRate: (data.conversions / data.count) * 100
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Calculate path efficiency metrics
    const pathLengths = attributions.map(a => a.touchPoints.length);
    const shortestPath = attributions.reduce((shortest, current) => 
      current.touchPoints.length < shortest.touchPoints.length ? current : shortest
    ).touchPoints.map(tp => tp.type);

    const longestPath = attributions.reduce((longest, current) => 
      current.touchPoints.length > longest.touchPoints.length ? current : longest
    ).touchPoints.map(tp => tp.type);

    const mostEfficientPath = attributions.reduce((efficient, current) => {
      const currentEfficiency = current.conversionValue / current.conversionTime;
      const efficientEfficiency = efficient.conversionValue / efficient.conversionTime;
      return currentEfficiency > efficientEfficiency ? current : efficient;
    }).touchPoints.map(tp => tp.type);

    const averagePathLength = pathLengths.reduce((sum, length) => sum + length, 0) / pathLengths.length;

    // Identify drop-off points
    const dropOffPoints = [
      {
        step: 'Blog to CTA',
        dropOffRate: 100 - (await this.getConversionFunnel(dateRange)).conversionRates.blogToCTA,
        suggestions: [
          'Improve CTA visibility and placement',
          'Enhance CTA messaging and value proposition',
          'A/B test different CTA designs'
        ]
      },
      {
        step: 'CTA to Course Page',
        dropOffRate: 100 - (await this.getConversionFunnel(dateRange)).conversionRates.ctaToCourse,
        suggestions: [
          'Ensure CTA links work correctly',
          'Optimize page loading speed',
          'Improve course page relevance'
        ]
      },
      {
        step: 'Course Page to Inquiry',
        dropOffRate: 100 - (await this.getConversionFunnel(dateRange)).conversionRates.courseToInquiry,
        suggestions: [
          'Simplify inquiry form',
          'Add social proof and testimonials',
          'Improve course information clarity'
        ]
      }
    ];

    return {
      commonPaths,
      pathEfficiency: {
        shortestPath,
        longestPath,
        mostEfficientPath,
        averagePathLength
      },
      dropOffPoints
    };
  }

  // Send event to external analytics service
  private async sendToAnalyticsService(event: ConversionEvent): Promise<void> {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          event_category: 'Blog Conversion',
          event_label: event.type,
          value: event.value || 0,
          custom_parameter_1: event.blogPostSlug,
          custom_parameter_2: event.courseSlug,
          custom_parameter_3: event.ctaId,
        });
      }

      // Facebook Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        if (event.type === 'enrollment' || event.type === 'payment') {
          (window as any).fbq('track', 'Purchase', {
            value: event.value || 0,
            currency: 'INR',
            content_name: event.courseSlug,
            content_category: 'Aviation Course',
          });
        } else if (event.type === 'inquiry_form') {
          (window as any).fbq('track', 'Lead', {
            content_name: event.courseSlug,
            content_category: 'Aviation Course',
          });
        }
      }

      // Custom analytics endpoint
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Error sending event to analytics service:', error);
    }
  }

  // Store event in database
  private async storeInDatabase(event: ConversionEvent): Promise<void> {
    try {
      await fetch('/api/admin/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Error storing event in database:', error);
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get user ID from storage or generate new one
  getUserId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let userId = localStorage.getItem('atc_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('atc_user_id', userId);
    }
    return userId;
  }

  // Get session ID from storage or generate new one
  getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('atc_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('atc_session_id', sessionId);
    }
    return sessionId;
  }
}

// Export singleton instance
export const conversionTracker = new ConversionTracker();

// Convenience functions
export const trackBlogView = (blogPostId: string, blogPostSlug: string, metadata?: Record<string, any>) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackBlogView(blogPostId, blogPostSlug, userId, sessionId, metadata);
};

export const trackCTAClick = (
  ctaId: string, 
  ctaPosition: string, 
  ctaVariant: string, 
  blogPostId: string, 
  blogPostSlug: string, 
  courseId: string,
  metadata?: Record<string, any>
) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackCTAClick(ctaId, ctaPosition, ctaVariant, blogPostId, blogPostSlug, courseId, userId, sessionId, metadata);
};

export const trackCoursePageView = (courseId: string, courseSlug: string, referrerBlogPost?: string) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackCoursePageView(courseId, courseSlug, userId, sessionId, referrerBlogPost);
};

export const trackInquiry = (courseId: string, courseSlug: string, inquiryValue?: number) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackInquiry(courseId, courseSlug, userId, sessionId, inquiryValue);
};

export const trackEnrollment = (courseId: string, courseSlug: string, enrollmentValue: number) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackEnrollment(courseId, courseSlug, userId, sessionId, enrollmentValue);
};

export const trackPayment = (courseId: string, courseSlug: string, paymentValue: number) => {
  const userId = conversionTracker.getUserId();
  const sessionId = conversionTracker.getSessionId();
  return conversionTracker.trackPayment(courseId, courseSlug, userId, sessionId, paymentValue);
};

export default conversionTracker;