// Real Analytics Tracker - Captures Genuine User Data

import { v4 as uuidv4 } from 'uuid';

interface AnalyticsEvent {
  userId?: string;
  sessionId: string;
  timestamp: Date;
  event: {
    type: 'page_view' | 'conversion' | 'interaction' | 'form_submission';
    page: string;
    data?: any;
  };
  source: {
    source: string;
    medium?: string;
    campaign?: string;
    category: string;
    referrer?: string;
  };
  user: {
    userAgent: string;
    ipAddress?: string;
    location?: {
      country?: string;
      city?: string;
      region?: string;
    };
    device: {
      type: 'desktop' | 'mobile' | 'tablet';
      browser: string;
      os: string;
    };
  };
}

class RealAnalyticsTracker {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: Date;
  private lastActivityTime: Date;
  private pageViews: number = 0;
  private currentPage: string = '';
  private source: any = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = new Date();
    this.lastActivityTime = new Date();
    this.detectTrafficSource();
    this.setupEventListeners();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private detectTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // UTM Parameters
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    // Detect source automatically
    let source = 'Direct';
    let medium = 'none';
    let category = 'direct';

    if (utmSource) {
      source = utmSource;
      medium = utmMedium || 'unknown';
      category = this.categorizeSource(utmSource);
    } else if (referrer) {
      const referrerDomain = new URL(referrer).hostname;
      source = referrerDomain;
      medium = 'referral';
      category = this.categorizeReferrer(referrerDomain);
    }

    // Special detection for AI assistants
    if (this.isAIAssistantTraffic()) {
      category = 'ai_assistant';
      source = this.detectAIAssistant();
    }

    this.source = {
      source,
      medium,
      campaign: utmCampaign,
      category,
      referrer: referrer || undefined,
    };

    // Store source in session for consistency
    sessionStorage.setItem('analytics_source', JSON.stringify(this.source));
  }

  private categorizeSource(source: string): string {
    const lowerSource = source.toLowerCase();
    
    if (['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'].some(s => lowerSource.includes(s))) {
      return 'organic';
    }
    if (['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].some(s => lowerSource.includes(s))) {
      return 'social';
    }
    if (['chatgpt', 'claude', 'bard', 'copilot', 'perplexity'].some(s => lowerSource.includes(s))) {
      return 'ai_assistant';
    }
    if (lowerSource.includes('email') || lowerSource.includes('newsletter')) {
      return 'email';
    }
    if (lowerSource.includes('ad') || lowerSource.includes('paid')) {
      return 'paid';
    }
    
    return 'other';
  }

  private categorizeReferrer(domain: string): string {
    const lowerDomain = domain.toLowerCase();
    
    // Search engines
    if (['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'].some(s => lowerDomain.includes(s))) {
      return 'organic';
    }
    
    // Social media
    if (['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com'].some(s => lowerDomain.includes(s))) {
      return 'social';
    }
    
    // AI Assistants
    if (['chat.openai.com', 'claude.ai', 'bard.google.com', 'copilot.microsoft.com', 'perplexity.ai'].some(s => lowerDomain.includes(s))) {
      return 'ai_assistant';
    }
    
    return 'referral';
  }

  private isAIAssistantTraffic(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const referrer = document.referrer.toLowerCase();
    
    // Check user agent for AI assistant indicators
    const aiIndicators = ['gptbot', 'claude', 'bard', 'copilot', 'chatgpt'];
    if (aiIndicators.some(indicator => userAgent.includes(indicator))) {
      return true;
    }
    
    // Check referrer for AI assistant domains
    const aiDomains = ['chat.openai.com', 'claude.ai', 'bard.google.com', 'copilot.microsoft.com', 'perplexity.ai'];
    if (aiDomains.some(domain => referrer.includes(domain))) {
      return true;
    }
    
    return false;
  }

  private detectAIAssistant(): string {
    const referrer = document.referrer.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (referrer.includes('chat.openai.com') || userAgent.includes('gptbot')) {
      return 'ChatGPT';
    }
    if (referrer.includes('claude.ai') || userAgent.includes('claude')) {
      return 'Claude';
    }
    if (referrer.includes('bard.google.com') || userAgent.includes('bard')) {
      return 'Google Bard';
    }
    if (referrer.includes('copilot.microsoft.com') || userAgent.includes('copilot')) {
      return 'Microsoft Copilot';
    }
    if (referrer.includes('perplexity.ai')) {
      return 'Perplexity';
    }
    
    return 'AI Assistant';
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Device type detection
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|Android(?!.*Mobile)/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    // Browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return { type: deviceType, browser, os };
  }

  private setupEventListeners() {
    // Track page views
    this.trackPageView();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.lastActivityTime = new Date();
      }
    });
    
    // Track user interactions
    ['click', 'scroll', 'keydown', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, this.throttle(() => {
        this.lastActivityTime = new Date();
      }, 1000));
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submission', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
      });
    });
    
    // Track conversions (customize based on your conversion events)
    this.setupConversionTracking();
    
    // Track session end
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
    
    // Periodic session updates
    setInterval(() => {
      this.updateSession();
    }, 30000); // Update every 30 seconds
  }

  private setupConversionTracking() {
    // Track contact form submissions as conversions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form.id === 'contact-form' || form.classList.contains('contact-form')) {
        this.trackConversion('contact_form_submission', {
          formId: form.id,
          page: window.location.pathname,
        });
      }
    });
    
    // Track button clicks that indicate conversion intent
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('conversion-button') || 
          target.getAttribute('data-conversion') === 'true') {
        this.trackConversion('button_click', {
          buttonText: target.textContent,
          buttonId: target.id,
          page: window.location.pathname,
        });
      }
    });
  }

  public trackPageView(customData?: any) {
    this.pageViews++;
    this.currentPage = window.location.pathname;
    
    const event: AnalyticsEvent = {
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      event: {
        type: 'page_view',
        page: this.currentPage,
        data: {
          title: document.title,
          url: window.location.href,
          ...customData,
        },
      },
      source: this.source,
      user: {
        userAgent: navigator.userAgent,
        device: this.getDeviceInfo(),
      },
    };
    
    this.sendEvent(event);
  }

  public trackEvent(eventType: 'interaction' | 'form_submission', data: any) {
    const event: AnalyticsEvent = {
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      event: {
        type: eventType,
        page: this.currentPage,
        data,
      },
      source: this.source,
      user: {
        userAgent: navigator.userAgent,
        device: this.getDeviceInfo(),
      },
    };
    
    this.sendEvent(event);
  }

  public trackConversion(conversionType: string, data: any) {
    const event: AnalyticsEvent = {
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      event: {
        type: 'conversion',
        page: this.currentPage,
        data: {
          conversionType,
          ...data,
        },
      },
      source: this.source,
      user: {
        userAgent: navigator.userAgent,
        device: this.getDeviceInfo(),
      },
    };
    
    this.sendEvent(event);
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      // Store in localStorage for retry
      this.storeEventForRetry(event);
    }
  }

  private storeEventForRetry(event: AnalyticsEvent) {
    const storedEvents = JSON.parse(localStorage.getItem('analytics_retry_queue') || '[]');
    storedEvents.push(event);
    
    // Keep only last 50 events to prevent storage overflow
    if (storedEvents.length > 50) {
      storedEvents.splice(0, storedEvents.length - 50);
    }
    
    localStorage.setItem('analytics_retry_queue', JSON.stringify(storedEvents));
  }

  private async retryFailedEvents() {
    const storedEvents = JSON.parse(localStorage.getItem('analytics_retry_queue') || '[]');
    if (storedEvents.length === 0) return;
    
    for (const event of storedEvents) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        // If retry fails, keep the event for next retry
        break;
      }
    }
    
    // Clear successfully sent events
    localStorage.removeItem('analytics_retry_queue');
  }

  private updateSession() {
    const sessionData = {
      sessionId: this.sessionId,
      lastActivity: this.lastActivityTime,
      pageViews: this.pageViews,
      currentPage: this.currentPage,
      duration: Date.now() - this.sessionStartTime.getTime(),
    };
    
    fetch('/api/analytics/session/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    }).catch(error => {
      console.error('Failed to update session:', error);
    });
  }

  private endSession() {
    const sessionData = {
      sessionId: this.sessionId,
      endTime: new Date(),
      totalDuration: Date.now() - this.sessionStartTime.getTime(),
      totalPageViews: this.pageViews,
      outcome: this.determineSessionOutcome(),
    };
    
    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/session/end', JSON.stringify(sessionData));
    } else {
      fetch('/api/analytics/session/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        keepalive: true,
      }).catch(error => {
        console.error('Failed to end session:', error);
      });
    }
  }

  private determineSessionOutcome(): 'conversion' | 'exit' | 'bounce' {
    // Check if any conversion events were tracked
    const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
    if (events.some((event: any) => event.event.type === 'conversion')) {
      return 'conversion';
    }
    
    // Check for bounce (single page view with short duration)
    if (this.pageViews === 1 && (Date.now() - this.sessionStartTime.getTime()) < 30000) {
      return 'bounce';
    }
    
    return 'exit';
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Public methods for manual tracking
  public setUserId(userId: string) {
    this.userId = userId;
  }

  public trackCustomEvent(eventName: string, properties: any) {
    this.trackEvent('interaction', {
      eventName,
      properties,
    });
  }

  public trackCustomConversion(conversionName: string, value?: number, properties?: any) {
    this.trackConversion(conversionName, {
      value,
      properties,
    });
  }
}

// Global analytics instance
let analyticsTracker: RealAnalyticsTracker;

export function initializeAnalytics() {
  if (typeof window !== 'undefined' && !analyticsTracker) {
    analyticsTracker = new RealAnalyticsTracker();
    
    // Retry failed events on initialization
    setTimeout(() => {
      (analyticsTracker as any).retryFailedEvents();
    }, 1000);
  }
  return analyticsTracker;
}

export function getAnalyticsTracker() {
  return analyticsTracker || initializeAnalytics();
}

export default RealAnalyticsTracker;