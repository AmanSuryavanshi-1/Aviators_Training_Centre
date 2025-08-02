/**
 * Environment-Aware URL Generation System
 * Generates production URLs instead of localhost for Studio deep-links and navigation
 */

export interface URLGeneratorConfig {
  siteUrl: string;
  studioPath: string;
  adminPath: string;
  environment: 'development' | 'production' | 'test';
}

export interface StudioDeepLinkOptions {
  documentId?: string;
  documentType?: string;
  action?: 'edit' | 'create' | 'duplicate';
  view?: 'desk' | 'structure';
}

export class URLGenerator {
  private static instance: URLGenerator;
  private config: URLGeneratorConfig;

  constructor() {
    this.config = this.getConfiguration();
  }

  static getInstance(): URLGenerator {
    if (!URLGenerator.instance) {
      URLGenerator.instance = new URLGenerator();
    }
    return URLGenerator.instance;
  }

  /**
   * Get URL generation configuration from environment
   */
  private getConfiguration(): URLGeneratorConfig {
    const siteUrl = this.resolveSiteUrl();
    const environment = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';

    return {
      siteUrl,
      studioPath: '/studio',
      adminPath: '/admin',
      environment,
    };
  }

  /**
   * Resolve the site URL from environment variables with fallbacks
   */
  private resolveSiteUrl(): string {
    // Primary: Use NEXT_PUBLIC_SITE_URL if available
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }

    // Secondary: Use VERCEL_URL if deployed on Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Tertiary: Use NETLIFY_URL if deployed on Netlify
    if (process.env.URL) {
      return process.env.URL;
    }

    // Production fallback
    if (process.env.NODE_ENV === 'production') {
      return 'https://www.aviatorstrainingcentre.in';
    }

    // Development fallback
    return 'http://localhost:3000';
  }

  /**
   * Get the base site URL
   */
  getSiteUrl(): string {
    return this.config.siteUrl;
  }

  /**
   * Get Studio URL with optional path
   */
  getStudioUrl(path: string = ''): string {
    const baseUrl = this.config.siteUrl;
    const studioPath = this.config.studioPath;
    
    // Ensure path starts with / if provided
    const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;
    
    return `${baseUrl}${studioPath}${normalizedPath}`;
  }

  /**
   * Get Admin URL with optional path
   */
  getAdminUrl(path: string = ''): string {
    const baseUrl = this.config.siteUrl;
    const adminPath = this.config.adminPath;
    
    // Ensure path starts with / if provided
    const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;
    
    return `${baseUrl}${adminPath}${normalizedPath}`;
  }

  /**
   * Generate Studio deep-link URL for editing specific documents
   */
  getEditUrl(documentId: string, documentType: string, options: StudioDeepLinkOptions = {}): string {
    const {
      action = 'edit',
      view = 'desk',
    } = options;

    // Construct Studio path based on document type and action
    let studioPath = '';

    if (view === 'desk') {
      // Desk view format: /desk/documentType;documentId
      studioPath = `/desk/${documentType};${documentId}`;
      
      if (action === 'edit') {
        // Default desk view is edit mode
        studioPath = `/desk/${documentType};${documentId}`;
      } else if (action === 'duplicate') {
        studioPath = `/desk/${documentType};${documentId}?duplicate=true`;
      }
    } else if (view === 'structure') {
      // Structure view format
      studioPath = `/structure/${documentType}/${documentId}`;
    }

    return this.getStudioUrl(studioPath);
  }

  /**
   * Generate Studio URL for creating new documents
   */
  getCreateUrl(documentType: string, options: StudioDeepLinkOptions = {}): string {
    const { view = 'desk' } = options;

    let studioPath = '';

    if (view === 'desk') {
      studioPath = `/desk/${documentType}`;
    } else if (view === 'structure') {
      studioPath = `/structure/${documentType}/create`;
    }

    return this.getStudioUrl(studioPath);
  }

  /**
   * Generate Studio URL for document list view
   */
  getListUrl(documentType: string): string {
    return this.getStudioUrl(`/desk/${documentType}`);
  }

  /**
   * Resolve environment-specific URL
   */
  resolveEnvironmentUrl(baseUrl: string, path: string): string {
    // If baseUrl is localhost and we're in production, use production URL
    if (baseUrl.includes('localhost') && this.config.environment === 'production') {
      return `${this.config.siteUrl}${path}`;
    }

    // If baseUrl is production URL but we're in development, keep as is
    // (allows for testing production URLs in development)
    return `${baseUrl}${path}`;
  }

  /**
   * Generate navigation URL with authentication context
   */
  getNavigationUrl(targetPath: string, options: {
    includeAuth?: boolean;
    returnUrl?: string;
    token?: string;
  } = {}): string {
    const { includeAuth = false, returnUrl, token } = options;
    
    let url = `${this.config.siteUrl}${targetPath}`;
    const params = new URLSearchParams();

    if (includeAuth && token) {
      params.set('token', token);
    }

    if (returnUrl) {
      params.set('return', returnUrl);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Generate Studio navigation URL from admin
   */
  getStudioNavigationUrl(studioPath: string = '', options: {
    token?: string;
    returnUrl?: string;
  } = {}): string {
    const studioUrl = this.getStudioUrl(studioPath);
    const params = new URLSearchParams();

    if (options.token) {
      params.set('token', options.token);
    }

    if (options.returnUrl) {
      params.set('return', options.returnUrl);
    }

    if (params.toString()) {
      return `${studioUrl}?${params.toString()}`;
    }

    return studioUrl;
  }

  /**
   * Generate admin navigation URL from studio
   */
  getAdminNavigationUrl(adminPath: string = '', options: {
    token?: string;
    returnUrl?: string;
  } = {}): string {
    const adminUrl = this.getAdminUrl(adminPath);
    const params = new URLSearchParams();

    if (options.token) {
      params.set('token', options.token);
    }

    if (options.returnUrl) {
      params.set('return', options.returnUrl);
    }

    if (params.toString()) {
      return `${adminUrl}?${params.toString()}`;
    }

    return adminUrl;
  }

  /**
   * Check if URL is localhost
   */
  isLocalhostUrl(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }

  /**
   * Convert localhost URL to production URL
   */
  convertToProductionUrl(url: string): string {
    if (!this.isLocalhostUrl(url)) {
      return url;
    }

    // Extract path from localhost URL
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search + urlObj.hash;

    return `${this.config.siteUrl}${path}`;
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): {
    siteUrl: string;
    studioUrl: string;
    adminUrl: string;
    environment: string;
    isProduction: boolean;
    isLocalhost: boolean;
  } {
    return {
      siteUrl: this.config.siteUrl,
      studioUrl: this.getStudioUrl(),
      adminUrl: this.getAdminUrl(),
      environment: this.config.environment,
      isProduction: this.config.environment === 'production',
      isLocalhost: this.isLocalhostUrl(this.config.siteUrl),
    };
  }

  /**
   * Validate environment configuration
   */
  validateConfiguration(): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if site URL is set
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      warnings.push('NEXT_PUBLIC_SITE_URL is not set, using fallback URL');
    }

    // Check if using localhost in production
    if (this.config.environment === 'production' && this.isLocalhostUrl(this.config.siteUrl)) {
      errors.push('Using localhost URL in production environment');
    }

    // Check URL format
    try {
      new URL(this.config.siteUrl);
    } catch {
      errors.push('Invalid site URL format');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Generate URLs for common Studio actions
   */
  getCommonStudioUrls(): {
    dashboard: string;
    posts: string;
    createPost: string;
    categories: string;
    tags: string;
    authors: string;
  } {
    return {
      dashboard: this.getStudioUrl(),
      posts: this.getListUrl('post'),
      createPost: this.getCreateUrl('post'),
      categories: this.getListUrl('category'),
      tags: this.getListUrl('tag'),
      authors: this.getListUrl('author'),
    };
  }

  /**
   * Generate URLs for common admin actions
   */
  getCommonAdminUrls(): {
    dashboard: string;
    posts: string;
    analytics: string;
    settings: string;
    users: string;
  } {
    return {
      dashboard: this.getAdminUrl(),
      posts: this.getAdminUrl('/posts'),
      analytics: this.getAdminUrl('/analytics'),
      settings: this.getAdminUrl('/settings'),
      users: this.getAdminUrl('/users'),
    };
  }
}

// Export singleton instance
export const urlGenerator = URLGenerator.getInstance();

// Export utility functions
export const {
  getSiteUrl,
  getStudioUrl,
  getAdminUrl,
  getEditUrl,
  getCreateUrl,
  getListUrl,
  resolveEnvironmentUrl,
  getNavigationUrl,
  getStudioNavigationUrl,
  getAdminNavigationUrl,
  convertToProductionUrl,
  isLocalhostUrl,
  getConfigSummary,
  validateConfiguration,
  getCommonStudioUrls,
  getCommonAdminUrls,
} = urlGenerator;