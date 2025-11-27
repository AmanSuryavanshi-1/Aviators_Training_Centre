/**
 * UTM Tracker Utility
 * Captures and persists UTM parameters throughout user session
 * Ensures attribution data is available for form submissions
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: string;
}

const STORAGE_KEY = 'atc_utm_params';
const SESSION_STORAGE_KEY = 'atc_session_utm';

/**
 * Captures UTM parameters from current URL and stores them
 * Should be called on initial page load
 */
export function captureUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: UTMParams = {};
    let hasUTM = false;

    // Capture all UTM parameters
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key as keyof UTMParams] = value;
        hasUTM = true;
      }
    });

    // Always capture referrer and landing page
    utmParams.referrer = document.referrer || 'direct';
    utmParams.landing_page = window.location.href;
    utmParams.timestamp = new Date().toISOString();

    // If we have UTM params or it's the first visit, store them
    if (hasUTM || !getStoredUTMParams()) {
      storeUTMParams(utmParams);
      return utmParams;
    }

    // Return existing params if no new UTM params found
    return getStoredUTMParams();
  } catch (error) {
    console.error('Error capturing UTM params:', error);
    return null;
  }
}

/**
 * Stores UTM parameters in both localStorage (persistent) and sessionStorage
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return;

  try {
    const dataToStore = JSON.stringify(params);
    
    // Store in sessionStorage for current session
    sessionStorage.setItem(SESSION_STORAGE_KEY, dataToStore);
    
    // Store in localStorage for attribution (first-touch)
    // Only update if it's a new UTM source or first visit
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing || params.utm_source) {
      localStorage.setItem(STORAGE_KEY, dataToStore);
    }
  } catch (error) {
    console.error('Error storing UTM params:', error);
  }
}

/**
 * Retrieves stored UTM parameters
 * Prioritizes sessionStorage (current session) over localStorage (first-touch)
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try sessionStorage first (current session)
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // Fall back to localStorage (first-touch)
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving UTM params:', error);
    return null;
  }
}

/**
 * Gets a human-readable source description
 */
export function getSourceDescription(params: UTMParams | null): string {
  if (!params) return 'Direct Traffic';

  if (params.utm_source) {
    const source = params.utm_source.toLowerCase();
    const medium = params.utm_medium?.toLowerCase();

    // Facebook Ads
    if (source.includes('facebook') || source.includes('fb')) {
      if (medium === 'cpc' || medium === 'paid') {
        return 'Facebook Ads';
      }
      return 'Facebook (Organic)';
    }

    // Google Ads
    if (source.includes('google')) {
      if (medium === 'cpc' || medium === 'paid') {
        return 'Google Ads';
      }
      return 'Google Search (Organic)';
    }

    // Instagram
    if (source.includes('instagram') || source.includes('ig')) {
      if (medium === 'cpc' || medium === 'paid') {
        return 'Instagram Ads';
      }
      return 'Instagram (Organic)';
    }

    // LinkedIn
    if (source.includes('linkedin')) {
      if (medium === 'cpc' || medium === 'paid') {
        return 'LinkedIn Ads';
      }
      return 'LinkedIn (Organic)';
    }

    // Email
    if (medium === 'email') {
      return 'Email Campaign';
    }

    // Generic
    return `${params.utm_source} (${params.utm_medium || 'referral'})`;
  }

  // Check referrer
  if (params.referrer && params.referrer !== 'direct') {
    try {
      const referrerUrl = new URL(params.referrer);
      const domain = referrerUrl.hostname.replace('www.', '');
      
      // Common search engines
      if (domain.includes('google')) return 'Google Search (Organic)';
      if (domain.includes('bing')) return 'Bing Search';
      if (domain.includes('yahoo')) return 'Yahoo Search';
      if (domain.includes('duckduckgo')) return 'DuckDuckGo Search';
      
      // AI Assistants
      if (domain.includes('chatgpt') || domain.includes('openai')) return 'ChatGPT';
      if (domain.includes('claude') || domain.includes('anthropic')) return 'Claude AI';
      if (domain.includes('perplexity')) return 'Perplexity AI';
      if (domain.includes('gemini') || domain.includes('bard')) return 'Google Gemini';
      
      // Social Media
      if (domain.includes('facebook')) return 'Facebook (Organic)';
      if (domain.includes('instagram')) return 'Instagram (Organic)';
      if (domain.includes('linkedin')) return 'LinkedIn (Organic)';
      if (domain.includes('twitter') || domain.includes('x.com')) return 'Twitter/X';
      
      return `Referral from ${domain}`;
    } catch {
      return 'Referral Traffic';
    }
  }

  return 'Direct Traffic';
}

/**
 * Clears stored UTM parameters (useful for testing)
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing UTM params:', error);
  }
}

/**
 * Initialize UTM tracking on app load
 * Call this in your root layout or _app file
 */
export function initializeUTMTracking(): void {
  if (typeof window === 'undefined') return;

  // Capture UTM params on page load
  captureUTMParams();

  // Re-capture on navigation (for SPAs)
  if (typeof window !== 'undefined' && 'navigation' in window) {
    // @ts-ignore - Navigation API is experimental
    window.navigation?.addEventListener('navigate', () => {
      captureUTMParams();
    });
  }
}
