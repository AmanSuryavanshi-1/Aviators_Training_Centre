'use client';

interface TrafficSourceData {
  source: string;
  medium: string;
  campaign?: string;
  referrer?: string;
  page: string;
  userAgent?: string;
  userId: string;
  sessionId: string;
  country?: string;
  city?: string;
}

interface UserBehaviorData {
  eventType: string;
  page: string;
  element?: string;
  value?: number;
  userId: string;
  sessionId: string;
  userAgent?: string;
  screenSize?: string;
  deviceType: string;
  metadata?: Record<string, any>;
}

class ComprehensiveAnalyticsTracker {
  private userId: string;
  private sessionId: string;
  private deviceType: string;
  private isInitialized: boolean = false;
  private pageStartTime: number = 0;
  private scrollDepth: number = 0;
  private maxScrollDepth: number = 0;

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.getOrCreateSessionId();
    this.deviceType = this.detectDeviceType();
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.pageStartTime = Date.now();
    
    // Track initial page load
    this.trackPageLoad();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Track traffic source
    this.trackTrafficSource();
  }

  private getOrCreateUserId(): string {
    if (typeof window === 'undefined') return 'server_user';
    
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private detectDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad|android(?!.*mobile)/i.test(userAgent) || (screenWidth >= 768 && screenWidth <= 1024)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth();
      }, 100);
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // Page visibility change (for time tracking)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackTimeOnPage();
      } else {
        this.pageStartTime = Date.now();
      }
    });

    // Before unload (track final time on page)
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
    });

    // Resize tracking
    window.addEventListener('resize', () => {
      this.trackUserBehavior({
        eventType: 'resize',
        page: window.location.pathname,
        value: window.innerWidth,
        metadata: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    });
  }

  private async trackTrafficSource() {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    
    // Determine traffic source
    let source = 'direct';
    let medium = 'none';
    let campaign = null;

    // UTM parameters
    if (urlParams.get('utm_source')) {
      source = urlParams.get('utm_source') || 'unknown';
      medium = urlParams.get('utm_medium') || 'unknown';
      campaign = urlParams.get('utm_campaign');
    }
    // Referrer analysis
    else if (referrer) {
      const referrerDomain = new URL(referrer).hostname.toLowerCase();
      
      if (referrerDomain.includes('google')) {
        source = 'google';
        medium = 'organic';
      } else if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter') || 
                 referrerDomain.includes('linkedin') || referrerDomain.includes('instagram')) {
        source = 'social';
        medium = 'social';
      } else if (referrerDomain !== window.location.hostname) {
        source = 'referral';
        medium = 'referral';
      }
    }

    const trafficData: TrafficSourceData = {
      source,
      medium,
      campaign,
      referrer,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Get location data if available
    try {
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json();
      trafficData.country = locationData.country_name;
      trafficData.city = locationData.city;
    } catch (error) {
      console.log('Could not fetch location data:', error);
    }

    this.sendTrafficSourceData(trafficData);
  }

  private trackPageLoad() {
    this.trackUserBehavior({
      eventType: 'pageview',
      page: window.location.pathname,
      metadata: {
        title: document.title,
        url: window.location.href,
        loadTime: Date.now() - this.pageStartTime,
      },
    });
  }

  private trackScrollDepth() {
    if (typeof window === 'undefined') return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

    this.scrollDepth = scrollPercent;
    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);

    // Track significant scroll milestones
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !this.hasTrackedScrollMilestone(milestone)) {
        this.trackUserBehavior({
          eventType: 'scroll',
          page: window.location.pathname,
          value: milestone,
          metadata: {
            milestone,
            actualPercent: scrollPercent,
          },
        });
        this.markScrollMilestoneTracked(milestone);
      }
    });
  }

  private hasTrackedScrollMilestone(milestone: number): boolean {
    const key = `scroll_${milestone}_${window.location.pathname}`;
    return sessionStorage.getItem(key) === 'true';
  }

  private markScrollMilestoneTracked(milestone: number) {
    const key = `scroll_${milestone}_${window.location.pathname}`;
    sessionStorage.setItem(key, 'true');
  }

  private trackClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    const element = this.getElementSelector(target);
    const isImportantElement = this.isImportantElement(target);

    if (isImportantElement) {
      this.trackUserBehavior({
        eventType: 'click',
        page: window.location.pathname,
        element,
        metadata: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          text: target.textContent?.substring(0, 100),
          href: target.getAttribute('href'),
        },
      });
    }
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private isImportantElement(element: HTMLElement): boolean {
    const importantTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    const importantClasses = ['cta', 'button', 'link', 'nav', 'menu'];
    
    if (importantTags.includes(element.tagName)) return true;
    
    const className = element.className.toLowerCase();
    return importantClasses.some(cls => className.includes(cls));
  }

  private trackTimeOnPage() {
    if (this.pageStartTime === 0) return;

    const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
    
    if (timeSpent > 5) { // Only track if user spent more than 5 seconds
      this.trackUserBehavior({
        eventType: 'time_on_page',
        page: window.location.pathname,
        value: timeSpent,
        metadata: {
          maxScrollDepth: this.maxScrollDepth,
          finalScrollDepth: this.scrollDepth,
        },
      });
    }
  }

  private async sendTrafficSourceData(data: TrafficSourceData) {
    try {
      await fetch('/api/analytics/traffic-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to track traffic source:', error);
    }
  }

  private async trackUserBehavior(data: Partial<UserBehaviorData>) {
    const behaviorData: UserBehaviorData = {
      eventType: data.eventType || 'unknown',
      page: data.page || window.location.pathname,
      element: data.element,
      value: data.value,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      deviceType: this.deviceType,
      metadata: data.metadata,
    };

    try {
      await fetch('/api/analytics/user-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(behaviorData),
      });
    } catch (error) {
      console.error('Failed to track user behavior:', error);
    }
  }

  // Public methods for manual tracking
  public trackEvent(eventType: string, data?: Partial<UserBehaviorData>) {
    this.trackUserBehavior({
      eventType,
      ...data,
    });
  }

  public trackCTAClick(ctaName: string, position?: string) {
    this.trackUserBehavior({
      eventType: 'cta_click',
      element: ctaName,
      metadata: {
        position,
        ctaName,
      },
    });
  }

  public trackFormSubmission(formType: string) {
    this.trackUserBehavior({
      eventType: 'form_submission',
      element: formType,
      metadata: {
        formType,
      },
    });
  }

  public trackContactVisit() {
    this.trackUserBehavior({
      eventType: 'contact_visit',
      page: '/contact',
    });
  }
}

// Create singleton instance
export const comprehensiveTracker = new ComprehensiveAnalyticsTracker();

// Export for manual usage
export default ComprehensiveAnalyticsTracker;