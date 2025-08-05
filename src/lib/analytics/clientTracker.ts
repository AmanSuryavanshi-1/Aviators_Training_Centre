// Enhanced Client-Side Analytics Tracking

import { TrafficSourceTracker } from './trafficSourceTracker';
import { UserJourneyTracker } from './userJourneyTracker';

interface TrackingConfig {
  apiEndpoint: string;
  batchSize: number;
  flushInterval: number;
  enableScrollTracking: boolean;
  enableClickTracking: boolean;
  enableFormTracking: boolean;
  enablePerformanceTracking: boolean;
  debug: boolean;
}

interface AnalyticsEvent {
  type: 'page_view' | 'interaction' | 'conversion' | 'performance';
  timestamp: number;
  userId: string;
  sessionId: string;
  data: any;
}

export class ClientAnalyticsTracker {
  private config: TrackingConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private trafficSourceTracker: TrafficSourceTracker;
  private journeyTracker: UserJourneyTracker;
  private userId: string;
  private sessionId: string;
  private currentJourneyId: string | null = null;
  private pageStartTime: number = 0;
  private maxScrollDepth: number = 0;
  private interactions: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/analytics/realtime',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableScrollTracking: true,
      enableClickTracking: true,
      enableFormTracking: true,
      enablePerformanceTracking: true,
      debug: false,
      ...config
    };

    this.trafficSourceTracker = new TrafficSourceTracker();
    this.journeyTracker = new UserJourneyTracker();
    this.userId = this.generateUserId();
    this.sessionId = this.generateSessionId();

    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Set up event listeners
    this.setupEventListeners();
    
    // Start flush timer
    this.startFlushTimer();
    
    // Track initial page view
    this.trackPageView();
    
    // Start user journey
    this.startUserJourney();

    if (this.config.debug) {
      console.log('ClientAnalyticsTracker initialized', {
        userId: this.userId,
        sessionId: this.sessionId
      });
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });

    // Page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
      this.flush(true); // Force immediate flush
    });

    // Scroll tracking
    if (this.config.enableScrollTracking) {
      this.setupScrollTracking();
    }

    // Click tracking
    if (this.config.enableClickTracking) {
      this.setupClickTracking();
    }

    // Form tracking
    if (this.config.enableFormTracking) {
      this.setupFormTracking();
    }

    // Performance tracking
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }
  }

  private setupScrollTracking() {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTime = 0;

    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScrollTime < 100) return; // Throttle
      lastScrollTime = now;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = this.calculateScrollPercentage();
        if (scrollPercentage > this.maxScrollDepth) {
          this.maxScrollDepth = scrollPercentage;
          
          // Track scroll milestones
          const milestones = [25, 50, 75, 90, 100];
          milestones.forEach(milestone => {
            if (scrollPercentage >= milestone && 
                !this.interactions.some(i => i.type === 'scroll' && i.value === milestone)) {
              this.trackInteraction('scroll', {
                element: 'page',
                value: milestone,
                scrollDepth: scrollPercentage
              });
            }
          });
        }
      }, 150);
    });
  }

  private setupClickTracking() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      this.trackInteraction('click', {
        element: target.tagName.toLowerCase(),
        elementId: target.id,
        elementClass: target.className,
        elementText: target.textContent?.substring(0, 100),
        coordinates: { x: event.clientX, y: event.clientY },
        isButton: target.tagName === 'BUTTON' || target.type === 'button',
        isLink: target.tagName === 'A',
        href: target.tagName === 'A' ? (target as HTMLAnchorElement).href : undefined
      });
    });
  }

  private setupFormTracking() {
    // Track form interactions
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        this.trackInteraction('form_input', {
          element: target.tagName.toLowerCase(),
          elementId: target.id,
          elementName: target.name,
          inputType: target.type,
          formId: target.form?.id,
          valueLength: target.value.length
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackInteraction('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: form.elements.length
      });

      // Track as conversion if it's a contact form
      if (form.id?.includes('contact') || form.className?.includes('contact')) {
        this.trackConversion('contact_form', {
          formId: form.id,
          value: 100 // Default conversion value
        });
      }
    });
  }

  private setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.trackEvent('performance', {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
            largestContentfulPaint: this.getLargestContentfulPaint()
          });
        }
      }, 1000);
    });
  }

  public trackPageView(customData: any = {}) {
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.interactions = [];

    const pageData = {
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      category: this.determinePageCategory(window.location.pathname),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ...customData
    };

    // Detect traffic source
    const utmParams = this.trafficSourceTracker.parseUTMParameters(window.location.href);
    const trafficSource = this.trafficSourceTracker.detectTrafficSource(
      document.referrer,
      navigator.userAgent,
      window.location.href,
      utmParams
    );

    this.trackEvent('page_view', {
      ...pageData,
      trafficSource: trafficSource.source,
      utmParams,
      timestamp: Date.now()
    });

    // Update journey tracker
    if (this.currentJourneyId) {
      this.journeyTracker.trackPageVisit(this.currentJourneyId, pageData);
    }
  }

  public trackInteraction(type: string, data: any) {
    const interaction = {
      type,
      timestamp: Date.now(),
      timeOnPage: Date.now() - this.pageStartTime,
      scrollDepth: this.calculateScrollPercentage(),
      ...data
    };

    this.interactions.push(interaction);

    this.trackEvent('interaction', interaction);

    // Update journey tracker
    if (this.currentJourneyId) {
      this.journeyTracker.trackInteraction(this.currentJourneyId, {
        type: type as any,
        element: data.element || 'unknown',
        elementId: data.elementId,
        elementClass: data.elementClass,
        elementText: data.elementText,
        timestamp: new Date(),
        coordinates: data.coordinates,
        value: data.value
      });
    }
  }

  public trackConversion(type: string, data: any = {}) {
    this.trackEvent('conversion', {
      conversionType: type,
      timestamp: Date.now(),
      timeOnPage: Date.now() - this.pageStartTime,
      scrollDepth: this.maxScrollDepth,
      interactionCount: this.interactions.length,
      ...data
    });

    // Complete journey with conversion
    if (this.currentJourneyId) {
      this.journeyTracker.completeJourney(this.currentJourneyId, {
        type: 'conversion',
        conversionType: type,
        conversionValue: data.value
      });
      this.currentJourneyId = null;
    }
  }

  public trackCustomEvent(eventName: string, data: any = {}) {
    this.trackEvent('custom', {
      eventName,
      timestamp: Date.now(),
      ...data
    });
  }

  private trackPageExit() {
    const timeSpent = Date.now() - this.pageStartTime;
    
    this.trackEvent('page_exit', {
      timeSpent,
      scrollDepth: this.maxScrollDepth,
      interactionCount: this.interactions.length,
      exitType: 'navigation'
    });

    // Update journey tracker
    if (this.currentJourneyId) {
      this.journeyTracker.updateTimeSpent(this.currentJourneyId);
    }
  }

  private trackEvent(type: string, data: any) {
    const event: AnalyticsEvent = {
      type: type as any,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        }
      }
    };

    this.eventQueue.push(event);

    if (this.config.debug) {
      console.log('Analytics event tracked:', event);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private async startUserJourney() {
    try {
      const entryPageData = {
        url: window.location.href,
        title: document.title,
        path: window.location.pathname,
        category: this.determinePageCategory(window.location.pathname),
        referrer: document.referrer,
        userAgent: navigator.userAgent
      };

      const utmParams = this.trafficSourceTracker.parseUTMParameters(window.location.href);

      this.currentJourneyId = await this.journeyTracker.startJourney(
        this.userId,
        this.sessionId,
        entryPageData,
        utmParams
      );

      if (this.config.debug) {
        console.log('User journey started:', this.currentJourneyId);
      }
    } catch (error) {
      console.error('Failed to start user journey:', error);
    }
  }

  private async flush(immediate: boolean = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'batch_events',
          data: events
        }),
        keepalive: immediate // Use keepalive for page unload
      });

      if (!response.ok) {
        // Re-queue events if request failed
        this.eventQueue.unshift(...events);
        console.error('Failed to send analytics events:', response.statusText);
      } else if (this.config.debug) {
        console.log(`Flushed ${events.length} analytics events`);
      }
    } catch (error) {
      // Re-queue events if request failed
      this.eventQueue.unshift(...events);
      console.error('Failed to send analytics events:', error);
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private generateUserId(): string {
    // Try to get existing user ID from localStorage
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  private generateSessionId(): string {
    // Try to get existing session ID from sessionStorage
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private calculateScrollPercentage(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
  }

  private determinePageCategory(path: string): 'blog' | 'home' | 'contact' | 'courses' | 'about' {
    if (path === '/') return 'home';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/about')) return 'about';
    return 'home';
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 1000);
    }) as any;
  }

  // Public API methods
  public setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('analytics_user_id', userId);
  }

  public setCustomData(data: any) {
    // Add custom data to all future events
    this.trackEvent('custom_data', data);
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(true);
  }
}

// Global instance
let globalTracker: ClientAnalyticsTracker | null = null;

export function initializeAnalytics(config?: Partial<TrackingConfig>) {
  if (typeof window !== 'undefined' && !globalTracker) {
    globalTracker = new ClientAnalyticsTracker(config);
  }
  return globalTracker;
}

export function getAnalyticsTracker(): ClientAnalyticsTracker | null {
  return globalTracker;
}

// Convenience functions
export function trackPageView(data?: any) {
  globalTracker?.trackPageView(data);
}

export function trackInteraction(type: string, data: any) {
  globalTracker?.trackInteraction(type, data);
}

export function trackConversion(type: string, data?: any) {
  globalTracker?.trackConversion(type, data);
}

export function trackCustomEvent(eventName: string, data?: any) {
  globalTracker?.trackCustomEvent(eventName, data);
}