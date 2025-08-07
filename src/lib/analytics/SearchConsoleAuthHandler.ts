/**
 * Search Console Authentication Handler
 * 
 * Handles Google Search Console API authentication with proper site verification
 * and permission checking. Implements enhanced error handling for access issues.
 */

import { google } from 'googleapis';
import { errorHandler } from './ErrorHandler';

export interface SiteAccessCheck {
  siteVerified: boolean;
  hasPermissions: boolean;
  permissionLevel: 'none' | 'restricted' | 'full';
  error?: string;
  details?: any;
}

export interface SearchConsoleConfig {
  siteUrl: string;
  serviceAccountEmail: string;
  privateKey: string;
  projectId?: string;
}

export class SearchConsoleAuthHandler {
  private searchConsole: any = null;
  private auth: any = null;
  private config: SearchConsoleConfig;
  private lastAccessCheck: Date | null = null;
  private accessCheckResult: SiteAccessCheck | null = null;
  private readonly ACCESS_CHECK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: SearchConsoleConfig) {
    this.config = config;
  }

  /**
   * Initialize Google APIs client with enhanced error handling
   */
  async initializeClient(): Promise<any> {
    try {
      if (this.searchConsole) {
        return this.searchConsole;
      }

      // Validate configuration
      this.validateConfig();

      // Create Google Auth instance
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.config.serviceAccountEmail,
          private_key: this.config.privateKey.replace(/\\n/g, '\n'),
          type: 'service_account',
          project_id: this.config.projectId
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        projectId: this.config.projectId
      });

      // Create Search Console client
      this.searchConsole = google.searchconsole({ 
        version: 'v1', 
        auth: this.auth 
      });

      console.log('✅ Search Console client initialized successfully');
      return this.searchConsole;

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'initialize_client',
        timestamp: new Date()
      });

      console.error('❌ Failed to initialize Search Console client:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Validate Search Console configuration
   */
  private validateConfig(): void {
    const errors: string[] = [];

    if (!this.config.siteUrl) {
      errors.push('Site URL is required');
    } else {
      try {
        const url = new URL(this.config.siteUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Site URL must use http:// or https://');
        }
      } catch (error) {
        errors.push('Site URL is not a valid URL');
      }
    }

    if (!this.config.serviceAccountEmail) {
      errors.push('Service account email is required');
    } else if (!this.config.serviceAccountEmail.includes('@') || 
               !this.config.serviceAccountEmail.includes('.iam.gserviceaccount.com')) {
      errors.push('Service account email format is invalid');
    }

    if (!this.config.privateKey) {
      errors.push('Private key is required');
    } else if (!this.config.privateKey.includes('BEGIN PRIVATE KEY')) {
      errors.push('Private key format is invalid');
    }

    if (errors.length > 0) {
      throw new Error(`Search Console configuration errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate site access with comprehensive checking
   */
  async validateSiteAccess(): Promise<SiteAccessCheck> {
    // Return cached result if still valid
    if (this.accessCheckResult && this.lastAccessCheck) {
      const cacheAge = Date.now() - this.lastAccessCheck.getTime();
      if (cacheAge < this.ACCESS_CHECK_CACHE_DURATION) {
        return this.accessCheckResult;
      }
    }

    const result: SiteAccessCheck = {
      siteVerified: false,
      hasPermissions: false,
      permissionLevel: 'none',
      details: {}
    };

    try {
      const client = await this.initializeClient();

      // Test 1: Check if site is verified and accessible
      try {
        const sitesResponse = await client.sites.list();
        const sites = sitesResponse.data.siteEntry || [];
        
        const site = sites.find((s: any) => s.siteUrl === this.config.siteUrl);
        
        if (site) {
          result.siteVerified = true;
          result.details.siteInfo = site;
          
          // Check permission level based on site info
          if (site.permissionLevel === 'siteFullUser') {
            result.permissionLevel = 'full';
            result.hasPermissions = true;
          } else if (site.permissionLevel === 'siteRestrictedUser') {
            result.permissionLevel = 'restricted';
            result.hasPermissions = true;
          } else {
            result.permissionLevel = 'none';
          }
        } else {
          result.error = `Site ${this.config.siteUrl} not found in verified sites list`;
        }

      } catch (siteError: any) {
        if (siteError.code === 403) {
          result.error = 'Service account does not have permission to list sites';
        } else {
          result.error = `Site verification check failed: ${siteError.message}`;
        }
      }

      // Test 2: Try to access search analytics data (if site is verified)
      if (result.siteVerified) {
        try {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 7);

          await client.searchanalytics.query({
            siteUrl: this.config.siteUrl,
            requestBody: {
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              dimensions: [],
              rowLimit: 1
            }
          });

          result.hasPermissions = true;
          result.details.dataAccess = true;

        } catch (dataError: any) {
          if (dataError.code === 403) {
            result.error = 'Service account has site access but insufficient permissions for data retrieval';
            result.hasPermissions = false;
          } else {
            result.details.dataAccessError = dataError.message;
          }
        }
      }

    } catch (error: any) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'validate_site_access',
        timestamp: new Date()
      });

      result.error = authError.userMessage;
      result.details.originalError = error.message;
    }

    // Cache the result
    this.accessCheckResult = result;
    this.lastAccessCheck = new Date();

    return result;
  }

  /**
   * Verify site ownership
   */
  async verifySiteOwnership(): Promise<boolean> {
    try {
      const client = await this.initializeClient();
      
      // Check if site is in the verified sites list
      const sitesResponse = await client.sites.list();
      const sites = sitesResponse.data.siteEntry || [];
      
      const site = sites.find((s: any) => s.siteUrl === this.config.siteUrl);
      
      return !!site;

    } catch (error) {
      console.error('Site ownership verification failed:', error);
      return false;
    }
  }

  /**
   * Test data access with sample query
   */
  async testDataAccess(): Promise<boolean> {
    try {
      const client = await this.initializeClient();
      
      // Try a minimal data request
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const response = await client.searchanalytics.query({
        siteUrl: this.config.siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: [],
          rowLimit: 1
        }
      });

      return !!response.data;

    } catch (error) {
      console.error('Data access test failed:', error);
      return false;
    }
  }

  /**
   * Get authenticated client instance
   */
  async getClient(): Promise<any> {
    if (!this.searchConsole) {
      return await this.initializeClient();
    }
    return this.searchConsole;
  }

  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<{
    authenticated: boolean;
    siteVerified: boolean;
    hasPermissions: boolean;
    permissionLevel: string;
    lastChecked: Date | null;
    error?: string;
  }> {
    try {
      const siteAccess = await this.validateSiteAccess();
      
      return {
        authenticated: !!this.searchConsole,
        siteVerified: siteAccess.siteVerified,
        hasPermissions: siteAccess.hasPermissions,
        permissionLevel: siteAccess.permissionLevel,
        lastChecked: this.lastAccessCheck,
        error: siteAccess.error
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_auth_status',
        timestamp: new Date()
      });

      return {
        authenticated: false,
        siteVerified: false,
        hasPermissions: false,
        permissionLevel: 'none',
        lastChecked: null,
        error: authError.userMessage
      };
    }
  }

  /**
   * Refresh authentication
   */
  async refreshAuth(): Promise<boolean> {
    try {
      // Clear cached client and access check
      this.searchConsole = null;
      this.auth = null;
      this.accessCheckResult = null;
      this.lastAccessCheck = null;

      // Reinitialize
      await this.initializeClient();
      const siteAccess = await this.validateSiteAccess();

      return siteAccess.siteVerified && siteAccess.hasPermissions;

    } catch (error) {
      console.error('Failed to refresh Search Console authentication:', error);
      return false;
    }
  }

  /**
   * Get configuration details (without sensitive data)
   */
  getConfig(): {
    siteUrl: string;
    hasServiceAccountEmail: boolean;
    hasPrivateKey: boolean;
    projectId?: string;
  } {
    return {
      siteUrl: this.config.siteUrl,
      hasServiceAccountEmail: !!this.config.serviceAccountEmail,
      hasPrivateKey: !!this.config.privateKey,
      projectId: this.config.projectId
    };
  }

  /**
   * Test connection with detailed diagnostics
   */
  async testConnection(): Promise<{
    success: boolean;
    clientInitialized: boolean;
    siteAccess: SiteAccessCheck;
    error?: string;
  }> {
    try {
      // Test client initialization
      const client = await this.initializeClient();
      const clientInitialized = !!client;

      // Test site access
      const siteAccess = await this.validateSiteAccess();

      const success = clientInitialized && siteAccess.siteVerified && siteAccess.hasPermissions;

      return {
        success,
        clientInitialized,
        siteAccess
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'test_connection',
        timestamp: new Date()
      });

      return {
        success: false,
        clientInitialized: false,
        siteAccess: {
          siteVerified: false,
          hasPermissions: false,
          permissionLevel: 'none',
          error: 'Connection test failed'
        },
        error: authError.userMessage
      };
    }
  }

  /**
   * Get detailed diagnostics
   */
  async getDiagnostics(): Promise<{
    config: any;
    authStatus: any;
    siteAccess: SiteAccessCheck;
    connectionTest: any;
  }> {
    try {
      const config = this.getConfig();
      const authStatus = await this.getAuthStatus();
      const siteAccess = await this.validateSiteAccess();
      const connectionTest = await this.testConnection();

      return {
        config,
        authStatus,
        siteAccess,
        connectionTest
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_diagnostics',
        timestamp: new Date()
      });

      throw new Error(authError.userMessage);
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.searchConsole = null;
    this.auth = null;
    this.accessCheckResult = null;
    this.lastAccessCheck = null;
  }
}

/**
 * Create Search Console auth handler from environment variables
 */
export function createSearchConsoleAuthHandler(): SearchConsoleAuthHandler | null {
  try {
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!siteUrl || !serviceAccountEmail || !privateKey) {
      console.warn('Search Console credentials not fully configured - Search Console auth handler disabled');
      return null;
    }

    return new SearchConsoleAuthHandler({
      siteUrl,
      serviceAccountEmail,
      privateKey,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });

  } catch (error) {
    console.error('Failed to create Search Console auth handler:', error);
    return null;
  }
}

// Export singleton instance
export const searchConsoleAuthHandler = createSearchConsoleAuthHandler();