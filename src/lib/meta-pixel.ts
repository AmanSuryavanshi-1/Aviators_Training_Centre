// Meta Pixel utility functions for tracking custom events
// Use this to track specific actions like button clicks, form submissions, etc.

declare global {
  interface Window {
    fbq: (command: string, event?: string, params?: any) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Common tracking functions
export const trackPageView = () => {
  trackEvent('PageView');
};

export const trackViewContent = (contentName: string, contentCategory?: string) => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
  });
};

export const trackLead = (contentName?: string) => {
  trackEvent('Lead', {
    content_name: contentName,
  });
};

export const trackContact = () => {
  trackEvent('Contact');
};

export const trackInitiateCheckout = (contentName?: string, value?: number) => {
  trackEvent('InitiateCheckout', {
    content_name: contentName,
    value: value,
    currency: 'INR',
  });
};

export const trackSearch = (searchTerm: string) => {
  trackEvent('Search', {
    search_string: searchTerm,
  });
};

// Check if Meta Pixel is loaded
export const isMetaPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

// For debugging - check if pixel is working
export const debugMetaPixel = () => {
  if (typeof window !== 'undefined') {
    console.log('Meta Pixel loaded:', isMetaPixelLoaded());
    console.log('fbq function:', typeof window.fbq);
  }
};
