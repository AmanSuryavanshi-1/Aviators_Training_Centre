/**
 * Blog Conversion Tracker Service
 * Tracks user journey from blog posts to conversions
 */

interface ConversionEvent {
  id: string;
  userId: string;
  sessionId: string;
  blogPostId?: string;
  eventType: 'blog_view' | 'cta_click' | 'contact_visit' | 'form_submit';
  timestamp: Date;
  metadata: Record<string, any>;
  conversionValue: number;
  source: string;
}

interface ConversionData {
  totalBlogViews: number;
  uniqueVisitors: number;
  ctaClicks: number;
  contactPageVisits: number;
  formSubmissions: number;
  conversionRate: number;
  blogToContactRate: number;
}

interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  blogPostsViewed: string[];
  ctasClicked: string[];
  hasVisitedContact: boolean;
  hasSubmittedForm: boolean;
}

class BlogConversionTracker {
  private events: ConversionEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique user ID (in production, this would come from auth or cookies)
   */
  private generateUserId(): string {
    // Check if user ID exists in localStorage
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('blog_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('blog_user_id', userId);
      }
      return userId;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create user session
   */
  private getOrCreateSession(): UserSession {
    const userId = this.generateUserId();
    
    // Find existing active session for user
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && 
          Date.now() - session.lastActivity.getTime() < this.SESSION_TIMEOUT) {
        session.lastActivity = new Date();
        return session;
      }
    }

    // Create new session
    const sessionId = this.generateSessionId();
    const newSession: UserSession = {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      blogPostsViewed: [],
      ctasClicked: [],
      hasVisitedContact: false,
      hasSubmittedForm: false
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  /**
   * Track blog post view
   */
  async trackBlogView(postId: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const session = this.getOrCreateSession();
      
      // Don't track duplicate views in same session
      if (session.blogPostsViewed.includes(postId)) {
        return;
      }

      session.blogPostsViewed.push(postId);

      const event: ConversionEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        sessionId: session.sessionId,
        blogPostId: postId,
        eventType: 'blog_view',
        timestamp: new Date(),
        metadata: {
          ...metadata,
          postTitle: metadata.title || 'Unknown',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
        },
        conversionValue: 1,
        source: 'blog'
      };

      this.events.push(event);
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('conversion_events', JSON.stringify(storedEvents.slice(-100))); // Keep last 100 events
        
        // Sync with server periodically
        this.syncEventsWithServer();
      }

      console.log('Blog view tracked:', { postId, userId: session.userId, sessionId: session.sessionId });
    } catch (error) {
      console.error('Error tracking blog view:', error);
    }
  }

  /**
   * Track CTA click
   */
  async trackCTAClick(ctaId: string, postId: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const session = this.getOrCreateSession();
      
      session.ctasClicked.push(ctaId);

      const event: ConversionEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        sessionId: session.sessionId,
        blogPostId: postId,
        eventType: 'cta_click',
        timestamp: new Date(),
        metadata: {
          ...metadata,
          ctaId,
          ctaText: metadata.text || 'Unknown CTA',
          ctaPosition: metadata.position || 'unknown'
        },
        conversionValue: 5,
        source: 'blog_cta'
      };

      this.events.push(event);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('conversion_events', JSON.stringify(storedEvents.slice(-100)));
        
        // Sync with server periodically
        this.syncEventsWithServer();
      }

      console.log('CTA click tracked:', { ctaId, postId, userId: session.userId });
    } catch (error) {
      console.error('Error tracking CTA click:', error);
    }
  }

  /**
   * Track contact page visit
   */
  async trackContactPageVisit(metadata: Record<string, any> = {}): Promise<void> {
    try {
      const session = this.getOrCreateSession();
      
      // Don't track duplicate contact visits in same session
      if (session.hasVisitedContact) {
        return;
      }

      session.hasVisitedContact = true;

      const event: ConversionEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        sessionId: session.sessionId,
        eventType: 'contact_visit',
        timestamp: new Date(),
        metadata: {
          ...metadata,
          fromBlog: session.blogPostsViewed.length > 0,
          blogPostsViewed: session.blogPostsViewed,
          ctasClicked: session.ctasClicked
        },
        conversionValue: 10,
        source: 'contact_page'
      };

      this.events.push(event);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('conversion_events', JSON.stringify(storedEvents.slice(-100)));
        
        // Sync with server periodically
        this.syncEventsWithServer();
      }

      console.log('Contact page visit tracked:', { userId: session.userId, fromBlog: session.blogPostsViewed.length > 0 });
    } catch (error) {
      console.error('Error tracking contact page visit:', error);
    }
  }

  /**
   * Track form submission
   */
  async trackFormSubmission(formType: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const session = this.getOrCreateSession();
      
      session.hasSubmittedForm = true;

      const event: ConversionEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        sessionId: session.sessionId,
        eventType: 'form_submit',
        timestamp: new Date(),
        metadata: {
          ...metadata,
          formType,
          fromBlog: session.blogPostsViewed.length > 0,
          blogPostsViewed: session.blogPostsViewed,
          ctasClicked: session.ctasClicked,
          hasVisitedContact: session.hasVisitedContact
        },
        conversionValue: 50,
        source: 'form_submission'
      };

      this.events.push(event);
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('conversion_events', JSON.stringify(storedEvents.slice(-100)));
        
        // Sync with server periodically
        this.syncEventsWithServer();
      }

      console.log('Form submission tracked:', { formType, userId: session.userId, fromBlog: session.blogPostsViewed.length > 0 });
    } catch (error) {
      console.error('Error tracking form submission:', error);
    }
  }

  /**
   * Sync events with server
   */
  private async syncEventsWithServer(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
      const allEvents = [...this.events, ...storedEvents];

      if (allEvents.length === 0) return;

      const response = await fetch('/api/analytics/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: allEvents }),
      });

      if (response.ok) {
        console.log('Conversion events synced with server');
      }
    } catch (error) {
      console.warn('Failed to sync events with server:', error);
    }
  }

  /**
   * Get conversion data for analytics
   */
  async getConversionData(timeframe: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<ConversionData> {
    try {
      // Try to get data from server first
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch(`/api/analytics/conversions?timeframe=${timeframe}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              return result.data;
            }
          }
        } catch (serverError) {
          console.warn('Failed to fetch from server, using local data:', serverError);
        }
      }

      // Fallback to local calculation
      // Load events from localStorage if available
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
        this.events = [...this.events, ...storedEvents];
      }

      // Filter events by timeframe
      const now = new Date();
      let startDate = new Date(0); // Beginning of time
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const filteredEvents = this.events.filter(event => 
        new Date(event.timestamp) >= startDate
      );

      // Calculate metrics
      const blogViews = filteredEvents.filter(e => e.eventType === 'blog_view').length;
      const uniqueVisitors = new Set(filteredEvents.filter(e => e.eventType === 'blog_view').map(e => e.userId)).size;
      const ctaClicks = filteredEvents.filter(e => e.eventType === 'cta_click').length;
      const contactPageVisits = filteredEvents.filter(e => e.eventType === 'contact_visit').length;
      const formSubmissions = filteredEvents.filter(e => e.eventType === 'form_submit').length;

      // Calculate blog-to-contact conversions
      const blogToContactConversions = filteredEvents.filter(e => 
        e.eventType === 'contact_visit' && e.metadata.fromBlog
      ).length;

      const conversionRate = uniqueVisitors > 0 ? (formSubmissions / uniqueVisitors) * 100 : 0;
      const blogToContactRate = uniqueVisitors > 0 ? (blogToContactConversions / uniqueVisitors) * 100 : 0;

      return {
        totalBlogViews: blogViews,
        uniqueVisitors,
        ctaClicks,
        contactPageVisits,
        formSubmissions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        blogToContactRate: Math.round(blogToContactRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting conversion data:', error);
      return {
        totalBlogViews: 0,
        uniqueVisitors: 0,
        ctaClicks: 0,
        contactPageVisits: 0,
        formSubmissions: 0,
        conversionRate: 0,
        blogToContactRate: 0
      };
    }
  }

  /**
   * Get blog-to-contact conversion rate
   */
  async getBlogToContactConversionRate(): Promise<number> {
    const data = await this.getConversionData();
    return data.blogToContactRate;
  }

  /**
   * Get all conversion events for analysis
   */
  async getAllEvents(): Promise<ConversionEvent[]> {
    // Load events from localStorage if available
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
      return [...this.events, ...storedEvents];
    }
    return this.events;
  }

  /**
   * Clear old events (for maintenance)
   */
  async clearOldEvents(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => new Date(event.timestamp) >= cutoffDate);
    
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('conversion_events') || '[]');
      const filteredStoredEvents = storedEvents.filter((event: ConversionEvent) => 
        new Date(event.timestamp) >= cutoffDate
      );
      localStorage.setItem('conversion_events', JSON.stringify(filteredStoredEvents));
    }
  }
}

// Export singleton instance
export const blogConversionTracker = new BlogConversionTracker();
export type { ConversionEvent, ConversionData, UserSession };
