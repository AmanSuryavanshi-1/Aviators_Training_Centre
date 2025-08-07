import { google } from 'googleapis';
import { SearchConsoleAuthHandler } from './SearchConsoleAuthHandler';
import { errorHandler } from './ErrorHandler';

interface SearchConsoleConfig {
  siteUrl: string;
  serviceAccountEmail: string;
  privateKey: string;
}

interface SearchPerformanceData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

class GoogleSearchConsoleService {
  private authHandler: SearchConsoleAuthHandler | null = null;
  private searchConsole: any = null;
  private siteUrl: string;

  constructor() {
    this.siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '';
    
    if (this.isConfigured()) {
      try {
        this.authHandler = new SearchConsoleAuthHandler({
          siteUrl: this.siteUrl,
          serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
          privateKey: process.env.GOOGLE_PRIVATE_KEY!,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
      } catch (error) {
        console.error('Failed to initialize Search Console auth handler:', error);
      }
    }
  }

  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      this.authHandler
    );
  }

  /**
   * Get authenticated Search Console client
   */
  private async getClient(): Promise<any> {
    if (!this.authHandler) {
      throw new Error('Search Console auth handler not initialized');
    }

    if (!this.searchConsole) {
      this.searchConsole = await this.authHandler.getClient();
    }

    return this.searchConsole;
  }

  /**
   * Validate access before making API calls
   */
  private async validateAccess(): Promise<void> {
    if (!this.authHandler) {
      throw new Error('Search Console not configured');
    }

    const siteAccess = await this.authHandler.validateSiteAccess();
    if (!siteAccess.siteVerified || !siteAccess.hasPermissions) {
      throw new Error(siteAccess.error || 'Insufficient Search Console permissions');
    }
  }

  async getOverviewData(startDate: string, endDate: string): Promise<SearchPerformanceData> {
    try {
      await this.validateAccess();
      const client = await this.getClient();

      const response = await client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: [],
          aggregationType: 'auto',
        },
      });

      const data = response.data.rows?.[0] || {};
      
      return {
        clicks: data.clicks || 0,
        impressions: data.impressions || 0,
        ctr: data.ctr || 0,
        position: data.position || 0,
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_overview_data',
        timestamp: new Date()
      });

      console.error('Error fetching Search Console overview:', authError.userMessage);
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      };
    }
  }

  async getTopQueries(startDate: string, endDate: string, limit: number = 10): Promise<SearchQuery[]> {
    try {
      await this.validateAccess();
      const client = await this.getClient();

      const response = await client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: limit,
          aggregationType: 'auto',
        },
      });

      return response.data.rows?.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_top_queries',
        timestamp: new Date()
      });

      console.error('Error fetching Search Console top queries:', authError.userMessage);
      return [];
    }
  }

  async getTopPages(startDate: string, endDate: string, limit: number = 10): Promise<SearchPage[]> {
    try {
      await this.validateAccess();
      const client = await this.getClient();

      const response = await client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: limit,
          aggregationType: 'auto',
        },
      });

      return response.data.rows?.map((row: any) => ({
        page: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_top_pages',
        timestamp: new Date()
      });

      console.error('Error fetching Search Console top pages:', authError.userMessage);
      return [];
    }
  }

  async getDeviceBreakdown(startDate: string, endDate: string): Promise<any[]> {
    try {
      await this.validateAccess();
      const client = await this.getClient();

      const response = await client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['device'],
          aggregationType: 'auto',
        },
      });

      return response.data.rows?.map((row: any) => ({
        device: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_device_breakdown',
        timestamp: new Date()
      });

      console.error('Error fetching Search Console device breakdown:', authError.userMessage);
      return [];
    }
  }

  async getCountryBreakdown(startDate: string, endDate: string, limit: number = 10): Promise<any[]> {
    try {
      await this.validateAccess();
      const client = await this.getClient();

      const response = await client.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['country'],
          rowLimit: limit,
          aggregationType: 'auto',
        },
      });

      return response.data.rows?.map((row: any) => ({
        country: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_country_breakdown',
        timestamp: new Date()
      });

      console.error('Error fetching Search Console country breakdown:', authError.userMessage);
      return [];
    }
  }

  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<{
    configured: boolean;
    authenticated: boolean;
    siteVerified: boolean;
    hasPermissions: boolean;
    error?: string;
  }> {
    try {
      if (!this.authHandler) {
        return {
          configured: false,
          authenticated: false,
          siteVerified: false,
          hasPermissions: false,
          error: 'Search Console auth handler not initialized'
        };
      }

      const authStatus = await this.authHandler.getAuthStatus();
      
      return {
        configured: this.isConfigured(),
        authenticated: authStatus.authenticated,
        siteVerified: authStatus.siteVerified,
        hasPermissions: authStatus.hasPermissions,
        error: authStatus.error
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'get_auth_status',
        timestamp: new Date()
      });

      return {
        configured: false,
        authenticated: false,
        siteVerified: false,
        hasPermissions: false,
        error: authError.userMessage
      };
    }
  }

  /**
   * Test Search Console access
   */
  async testAccess(): Promise<{
    success: boolean;
    siteAccess: any;
    error?: string;
  }> {
    try {
      if (!this.authHandler) {
        return {
          success: false,
          siteAccess: null,
          error: 'Search Console auth handler not initialized'
        };
      }

      const connectionTest = await this.authHandler.testConnection();
      
      return {
        success: connectionTest.success,
        siteAccess: connectionTest.siteAccess,
        error: connectionTest.error
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'search-console',
        operation: 'test_access',
        timestamp: new Date()
      });

      return {
        success: false,
        siteAccess: null,
        error: authError.userMessage
      };
    }
  }

  // Helper method to format dates for Search Console API
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to get date ranges (Search Console has a 3-day delay)
  static getDateRange(timeframe: string): { startDate: string; endDate: string } {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // 3-day delay for Search Console data
    
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'all':
        startDate.setMonth(endDate.getMonth() - 16); // Search Console keeps 16 months of data
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }
}

export const searchConsoleService = new GoogleSearchConsoleService();
export type { SearchPerformanceData, SearchQuery, SearchPage };