// Google Analytics 4 Configuration and Event Tracking

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('✅ Google Analytics 4 initialized:', GA_MEASUREMENT_ID);
  }
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Custom event tracking for your specific needs
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 GA4 Event:', eventName, parameters);
  }
};

// Specific tracking functions for your business needs
export const analytics = {
  // Blog engagement tracking
  trackBlogView: (postTitle: string, postSlug: string, category?: string) => {
    trackEvent('blog_view', {
      content_type: 'blog_post',
      item_id: postSlug,
      item_name: postTitle,
      item_category: category || 'uncategorized',
      engagement_time_msec: 1000, // Will be updated with real time
    });
  },

  // Track blog reading time (call this when user scrolls or stays on page)
  trackBlogEngagement: (postSlug: string, timeSpent: number, scrollPercent: number) => {
    trackEvent('blog_engagement', {
      item_id: postSlug,
      engagement_time_msec: timeSpent * 1000,
      scroll_percent: scrollPercent,
      event_category: 'engagement',
    });
  },

  // Contact form interactions
  trackContactView: (source?: string) => {
    trackEvent('contact_page_view', {
      event_category: 'contact',
      source: source || 'direct',
      page_location: window.location.href,
    });
  },

  trackContactFormStart: (source?: string) => {
    trackEvent('contact_form_start', {
      event_category: 'contact',
      source: source || 'direct',
      form_type: 'contact_inquiry',
    });
  },

  trackContactFormSubmit: (source?: string, formData?: any) => {
    trackEvent('contact_form_submit', {
      event_category: 'contact',
      source: source || 'direct',
      form_type: 'contact_inquiry',
      value: 1, // Assign value for conversion tracking
    });
  },

  // CTA button clicks
  trackCTAClick: (ctaText: string, location: string, destination: string) => {
    trackEvent('cta_click', {
      event_category: 'cta',
      cta_text: ctaText,
      cta_location: location,
      destination: destination,
    });
  },

  // Traffic source tracking (for AI platforms and ads)
  trackTrafficSource: (source: string, medium?: string, campaign?: string) => {
    trackEvent('traffic_source_identified', {
      event_category: 'traffic',
      source: source,
      medium: medium || 'unknown',
      campaign: campaign || 'none',
      custom_source: source, // Custom parameter for our analytics
    });
  },

  // Meta ads specific tracking
  trackMetaAdClick: (adId?: string, campaignName?: string) => {
    trackEvent('meta_ad_interaction', {
      event_category: 'advertising',
      ad_platform: 'meta',
      ad_id: adId || 'unknown',
      campaign_name: campaignName || 'unknown',
      value: 1,
    });
  },

  // AI platform referrals
  trackAIReferral: (platform: 'chatgpt' | 'claude' | 'other', query?: string) => {
    trackEvent('ai_referral', {
      event_category: 'ai_traffic',
      ai_platform: platform,
      referral_query: query || 'unknown',
      source: platform,
    });
  },

  // Conversion funnel tracking
  trackFunnelStep: (step: 'homepage' | 'blog' | 'contact' | 'form_submit', source?: string) => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      funnel_step: step,
      source: source || 'direct',
      step_number: {
        homepage: 1,
        blog: 2,
        contact: 3,
        form_submit: 4,
      }[step],
    });
  },

  // Course interest tracking
  trackCourseInterest: (courseType: string, action: 'view' | 'inquiry' | 'download') => {
    trackEvent('course_interest', {
      event_category: 'courses',
      course_type: courseType,
      action: action,
      value: action === 'inquiry' ? 5 : 1, // Higher value for inquiries
    });
  },

  // Search functionality
  trackSearch: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: 'search',
    });
  },

  // File downloads
  trackDownload: (fileName: string, fileType: string) => {
    trackEvent('file_download', {
      event_category: 'downloads',
      file_name: fileName,
      file_type: fileType,
      value: 1,
    });
  },

  // Social media clicks
  trackSocialClick: (platform: string, action: 'follow' | 'share' | 'visit') => {
    trackEvent('social_interaction', {
      event_category: 'social',
      social_platform: platform,
      social_action: action,
    });
  },
};

// Utility to detect traffic source from URL parameters and referrer
export const detectTrafficSource = () => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  const currentDomain = window.location.hostname;
  
  // Log domain information for debugging
  console.log('🌐 Analytics Domain Info:', {
    currentDomain,
    isProduction: currentDomain === 'www.aviatorstrainingcentre.in',
    referrer,
    fullUrl: window.location.href
  });
  
  // Check for UTM parameters (for Meta ads and campaigns)
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  
  if (utmSource) {
    analytics.trackTrafficSource(utmSource, utmMedium || undefined, utmCampaign || undefined);
    return { source: utmSource, medium: utmMedium, campaign: utmCampaign, domain: currentDomain };
  }

  // Check for AI platform referrals
  if (referrer.includes('chat.openai.com') || referrer.includes('chatgpt.com')) {
    analytics.trackAIReferral('chatgpt');
    return { source: 'chatgpt', medium: 'ai_referral' };
  }
  
  if (referrer.includes('claude.ai') || referrer.includes('anthropic.com')) {
    analytics.trackAIReferral('claude');
    return { source: 'claude', medium: 'ai_referral' };
  }

  // Check for social media referrals
  if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
    analytics.trackTrafficSource('facebook', 'social');
    return { source: 'facebook', medium: 'social' };
  }
  
  if (referrer.includes('instagram.com')) {
    analytics.trackTrafficSource('instagram', 'social');
    return { source: 'instagram', medium: 'social' };
  }
  
  if (referrer.includes('linkedin.com')) {
    analytics.trackTrafficSource('linkedin', 'social');
    return { source: 'linkedin', medium: 'social' };
  }
  
  if (referrer.includes('twitter.com') || referrer.includes('t.co')) {
    analytics.trackTrafficSource('twitter', 'social');
    return { source: 'twitter', medium: 'social' };
  }

  // Check for Google search
  if (referrer.includes('google.com')) {
    analytics.trackTrafficSource('google', 'organic');
    return { source: 'google', medium: 'organic' };
  }

  // Direct traffic
  if (!referrer) {
    analytics.trackTrafficSource('direct', 'none');
    return { source: 'direct', medium: 'none' };
  }

  // Other referrals
  const domain = new URL(referrer).hostname;
  analytics.trackTrafficSource(domain, 'referral');
  return { source: domain, medium: 'referral' };
};

// Type declarations for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}