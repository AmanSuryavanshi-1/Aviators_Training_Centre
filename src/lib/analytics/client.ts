'use client';

// Client-side analytics tracking for blog and user interactions
import { v4 as uuidv4 } from 'uuid';

// Types for analytics events
interface BaseAnalyticsEvent {
  userId: string;
  sessionId: string;
  timestamp: string;
}

interface PageviewEvent extends BaseAnalyticsEvent {
  postSlug: string;
  referrer?: string;
  userAgent?: string;
}

interface CTAClickEvent extends BaseAnalyticsEvent {
  postSlug: string;
  ctaPosition: number;
  ctaType: string;
  ctaText?: string;
  targetUrl?: string;
}

interface ContactVisitEvent extends BaseAnalyticsEvent {
  source: string;
  referrerSlug?: string;
}

interface FormSubmissionEvent extends BaseAnalyticsEvent {
  formType: 'contact' | 'newsletter' | 'course_inquiry' | 'demo_booking';
  source: string;
  referrerSlug?: string;
  formData?: Record<string, any>;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
}

class ClientAnalytics {
  private static instance: ClientAnalytics;
  private userId: string;
  private sessionId: string;
  private config: AnalyticsConfig;
  private eventQueue: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;

  private constructor() {
    this.config = {
      enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      retryAttempts: 3,
    };

    // Initialize user and session IDs
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.getOrCreateSessionId();

    // Set up online/offline detection
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushEvents(); // Flush queued events when back online
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Set up periodic flushing
      this.startPeriodicFlush();

      // Flush events before page unload
      window.addEventListener('beforeunload', () => {
        this.flushEvents(true); // Synchronous flush
      });
    }

    if (this.config.debug) {
      console.log('🔍 Analytics initialized:', {
        userId: this.userId,
        sessionId: this.sessionId,
        enabled: this.config.enabled,
      });
    }
  }

  static getInstance(): ClientAnalytics {
    if (!ClientAnalytics.instance) {
      ClientAnalytics.instance = new ClientAnalytics();
    }
    return ClientAnalytics.instance;
  }

  /**
   * Get or create persistent user ID
   */
  private getOrCreateUserId(): string {
    if (typeof window === 'undefined') return 'server-side';

    const storageKey = 'atc_user_id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem(storageKey, userId);
    }
    
    return userId;
  }

  /**
   * Get or create session ID (expires with browser session)
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-side';

    const storageKey = 'atc_session_id';
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Track blog post page view
   */
  async trackPageview(postSlug: string, options: { 
    referrer?: string; 
    immediate?: boolean 
  } = {}): Promise<void> {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('📊 [DEBUG] Pageview tracked:', postSlug);
      }
      return;
    }

    const event: PageviewEvent = {
      postSlug,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      referrer: options.referrer || (typeof window !== 'undefined' ? document.referrer : undefined),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    if (options.immediate) {
      await this.sendEvent('/api/analytics/pageview', event);
    } else {
      this.queueEvent('/api/analytics/pageview', event);
    }

    if (this.config.debug) {
      console.log('📊 Pageview tracked:', event);
    }
  }

  /**
   * Track CTA button click
   */
  async trackCTAClick(
    postSlug: string,
    ctaType: string,
    options: {
      ctaPosition?: number;
      ctaText?: string;
      targetUrl?: string;
      immediate?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('🎯 [DEBUG] CTA click tracked:', ctaType, 'on', postSlug);
      }
      return;
    }

    const event: CTAClickEvent = {
      postSlug,
      ctaType,
      ctaPosition: options.ctaPosition || 0,
      ctaText: options.ctaText,
      targetUrl: options.targetUrl,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    if (options.immediate) {
      await this.sendEvent('/api/analytics/cta', event);
    } else {
      this.queueEvent('/api/analytics/cta', event);
    }

    if (this.config.debug) {
      console.log('🎯 CTA click tracked:', event);
    }
  }

  /**
   * Track contact page visit
   */
  async trackContactVisit(
    source: string,
    options: {
      referrerSlug?: string;
      immediate?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('📞 [DEBUG] Contact visit tracked:', source);
      }
      return;
    }

    const event: ContactVisitEvent = {
      source,
      referrerSlug: options.referrerSlug,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    if (options.immediate) {
      await this.sendEvent('/api/analytics/contactVisit', event);
    } else {
      this.queueEvent('/api/analytics/contactVisit', event);
    }

    if (this.config.debug) {
      console.log('📞 Contact visit tracked:', event);
    }
  }

  /**
   * Track form submission
   */
  async trackFormSubmission(
    formType: 'contact' | 'newsletter' | 'course_inquiry' | 'demo_booking',
    source: string,
    options: {
      referrerSlug?: string;
      formData?: Record<string, any>;
      immediate?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('📝 [DEBUG] Form submission tracked:', formType, 'from', source);
      }
      return;
    }

    const event: FormSubmissionEvent = {
      formType,
      source,
      referrerSlug: options.referrerSlug,
      formData: options.formData,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    // Form submissions are always sent immediately for accuracy
    await this.sendEvent('/api/analytics/formSubmission', event);

    if (this.config.debug) {
      console.log('📝 Form submission tracked:', event);
    }
  }

  /**
   * Queue event for batch processing
   */
  private queueEvent(endpoint: string, event: any): void {
    this.eventQueue.push({ endpoint, event });

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Send event immediately
   */
  private async sendEvent(endpoint: string, event: any, retryCount = 0): Promise<void> {
    if (!this.isOnline && retryCount === 0) {
      // Queue for later if offline
      this.queueEvent(endpoint, event);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analytics tracking failed');
      }

      if (this.config.debug) {
        console.log('✅ Analytics event sent successfully:', endpoint);
      }

    } catch (error) {
      console.error('❌ Analytics tracking error:', error);

      // Retry logic
      if (retryCount < this.config.retryAttempts) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          this.sendEvent(endpoint, event, retryCount + 1);
        }, delay);
      } else {
        // Store failed events for later retry
        this.queueEvent(endpoint, event);
      }
    }
  }

  /**
   * Flush all queued events
   */
  private async flushEvents(synchronous = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    if (this.config.debug) {
      console.log(`🚀 Flushing ${eventsToSend.length} analytics events`);
    }

    const sendPromises = eventsToSend.map(({ endpoint, event }) => 
      this.sendEvent(endpoint, event)
    );

    if (synchronous) {
      // Use sendBeacon for synchronous sending during page unload
      eventsToSend.forEach(({ endpoint, event }) => {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, JSON.stringify(event));
        }
      });
    } else {
      await Promise.allSettled(sendPromises);
    }
  }

  /**
   * Start periodic event flushing
   */
  private startPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Get current user and session IDs
   */
  getIdentifiers(): { userId: string; sessionId: string } {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (this.config.debug) {
      console.log('🔍 Analytics', enabled ? 'enabled' : 'disabled');
    }
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue = [];
    
    if (this.config.debug) {
      console.log('🗑️ Analytics queue cleared');
    }
  }
}

// Export singleton instance
export const analytics = ClientAnalytics.getInstance();

// Export convenience functions
export const trackPageview = (postSlug: string, options?: { referrer?: string; immediate?: boolean }) =>
  analytics.trackPageview(postSlug, options);

export const trackCTAClick = (
  postSlug: string,
  ctaType: string,
  options?: {
    ctaPosition?: number;
    ctaText?: string;
    targetUrl?: string;
    immediate?: boolean;
  }
) => analytics.trackCTAClick(postSlug, ctaType, options);

export const trackContactVisit = (
  source: string,
  options?: {
    referrerSlug?: string;
    immediate?: boolean;
  }
) => analytics.trackContactVisit(source, options);

export const trackFormSubmission = (
  formType: 'contact' | 'newsletter' | 'course_inquiry' | 'demo_booking',
  source: string,
  options?: {
    referrerSlug?: string;
    formData?: Record<string, any>;
    immediate?: boolean;
  }
) => analytics.trackFormSubmission(formType, source, options);
