// Contact Form and CTA Tracking System
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  timestamp: string;
  userAgent: string;
  referrer: string;
  sessionId: string;
}

export interface CTAClickData {
  ctaText: string;
  ctaLocation: string;
  pageUrl: string;
  timestamp: string;
  userAgent: string;
  referrer: string;
  sessionId: string;
}

class ContactTracker {
  private static instance: ContactTracker;

  static getInstance(): ContactTracker {
    if (!ContactTracker.instance) {
      ContactTracker.instance = new ContactTracker();
    }
    return ContactTracker.instance;
  }

  // Track CTA clicks
  async trackCTAClick(ctaData: Omit<CTAClickData, 'timestamp' | 'userAgent' | 'referrer' | 'sessionId'>) {
    try {
      const trackingData: CTAClickData = {
        ...ctaData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: this.getSessionId()
      };

      // Send to analytics API
      await fetch('/api/analytics/cta-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });

      // Store in localStorage for immediate feedback
      this.storeCTAClick(trackingData);
      console.log('CTA click tracked:', trackingData);
    } catch (error) {
      console.error('Error tracking CTA click:', error);
    }
  }

  // Track contact form submissions
  async trackContactFormSubmission(formData: Omit<ContactFormData, 'timestamp' | 'userAgent' | 'referrer' | 'sessionId'>) {
    try {
      const trackingData: ContactFormData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: this.getSessionId()
      };

      // Send to analytics API
      await fetch('/api/analytics/contact-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });

      // Store in localStorage
      this.storeContactSubmission(trackingData);
      console.log('Contact form submission tracked:', trackingData);
    } catch (error) {
      console.error('Error tracking contact form submission:', error);
    }
  }

  // Track page visits for conversion funnel
  async trackPageVisit(pageData: {
    page: string;
    title: string;
    source?: string;
  }) {
    try {
      const trackingData = {
        ...pageData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: this.getSessionId()
      };

      await fetch('/api/analytics/page-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Store CTA click locally
  private storeCTAClick(data: CTAClickData) {
    const existing = JSON.parse(localStorage.getItem('cta_clicks') || '[]');
    existing.push(data);
    // Keep only last 50 clicks
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50);
    }
    localStorage.setItem('cta_clicks', JSON.stringify(existing));
  }

  // Store contact submission locally
  private storeContactSubmission(data: ContactFormData) {
    const existing = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
    existing.push(data);
    // Keep only last 20 submissions
    if (existing.length > 20) {
      existing.splice(0, existing.length - 20);
    }
    localStorage.setItem('contact_submissions', JSON.stringify(existing));
  }

  // Get local CTA clicks
  getCTAClicks(): CTAClickData[] {
    return JSON.parse(localStorage.getItem('cta_clicks') || '[]');
  }

  // Get local contact submissions
  getContactSubmissions(): ContactFormData[] {
    return JSON.parse(localStorage.getItem('contact_submissions') || '[]');
  }

  // Detect traffic source from referrer
  detectTrafficSource(referrer: string = document.referrer): string {
    if (!referrer) return 'direct';
    const ref = referrer.toLowerCase();
    
    // AI Platforms
    if (ref.includes('chat.openai.com') || ref.includes('chatgpt')) return 'chatgpt';
    if (ref.includes('claude.ai') || ref.includes('anthropic')) return 'claude';
    if (ref.includes('bard.google.com') || ref.includes('gemini')) return 'gemini';
    if (ref.includes('bing.com/chat') || ref.includes('copilot')) return 'copilot';
    if (ref.includes('perplexity.ai')) return 'perplexity';
    if (ref.includes('you.com')) return 'you_ai';
    
    // Search Engines
    if (ref.includes('google.com')) return 'google';
    if (ref.includes('bing.com')) return 'bing';
    if (ref.includes('yahoo.com')) return 'yahoo';
    if (ref.includes('duckduckgo.com')) return 'duckduckgo';
    
    // Social Media
    if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'facebook';
    if (ref.includes('instagram.com')) return 'instagram';
    if (ref.includes('twitter.com') || ref.includes('x.com')) return 'twitter';
    if (ref.includes('linkedin.com')) return 'linkedin';
    if (ref.includes('youtube.com')) return 'youtube';
    if (ref.includes('tiktok.com')) return 'tiktok';
    if (ref.includes('reddit.com')) return 'reddit';
    if (ref.includes('quora.com')) return 'quora';
    
    return 'other';
  }
}

export const contactTracker = ContactTracker.getInstance();

// React hook for easy tracking
export const useContactTracking = () => {
  const trackCTA = (ctaText: string, ctaLocation: string) => {
    contactTracker.trackCTAClick({
      ctaText,
      ctaLocation,
      pageUrl: window.location.href
    });
  };

  const trackFormSubmission = (formData: Omit<ContactFormData, 'timestamp' | 'userAgent' | 'referrer' | 'sessionId' | 'source'>) => {
    contactTracker.trackContactFormSubmission({
      ...formData,
      source: contactTracker.detectTrafficSource()
    });
  };

  const trackPageVisit = (page: string, title: string) => {
    contactTracker.trackPageVisit({
      page,
      title,
      source: contactTracker.detectTrafficSource()
    });
  };

  return {
    trackCTA,
    trackFormSubmission,
    trackPageVisit
  };
};