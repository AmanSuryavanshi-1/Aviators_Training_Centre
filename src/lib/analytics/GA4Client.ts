/**
 * GA4Client Service
 * 
 * Production-ready Google Analytics 4 client for fetching genuine analytics data.
 * Handles authentication, rate limiting, and data validation for the analytics dashboard.
 * Updated to use enhanced GA4AuthHandler for improved authentication.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GA4AuthHandler } from './GA4AuthHandler';
import { errorHandler } from './ErrorHandler';

export interface GA4Config {
  propertyId: string;
  serviceAccountKey?: string;
  serviceAccountPath?: string;
  projectId?: string;
}

export interface GA4RealtimeData {
  activeUsers: number;
  pageViews: number;
  conversions: number;
  topPages: PageData[];
  trafficSources: SourceData[];
  timestamp: Date;
  dataRetention: number;
}

export interface GA4HistoricalData {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  totalConversions: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversionRate: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  timestamp: Date;
}

export interface PageData {
  page: string;
  title?: string;
  views: number;
  users: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
}

export interface SourceData {
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  conversions: number;
}

export interface GA4Dimension {
  name: string;
  value: string;
}

export interface GA4Metric {
  name: string;
  value: number;
}

export interface GA4Response {
  data: any[];
  metadata: {
    source: 'GA4-Production';
    timestamp: Date;
    propertyId: string;
    dataRetention: number;
    quotaUsed: number;
    quotaRemaining: number;
  };
  success: boolean;
  error?: string;
}

export class GA4Client {
  private client: BetaAnalyticsDataClient | null = null;
  private config: GA4Config;
  private authHandler: GA4AuthHandler;
  private quotaUsed: number = 0;
  private quotaLimit: number = 25000; // GA4 daily quota limit
  private lastResetTime: Date = new Date();

  constructor(config: GA4Config) {
    this.config = config;
    this.authHandler = new GA4AuthHandler(config);
    this.initializeClient();
  }

  /**
   * Initialize the GA4 client with enhanced authentication handler
   */
  private async initializeClient(): Promise<void> {
    try {
      // Use the enhanced auth handler to get authenticated client
      this.client = await this.authHandler.initializeClient();
      console.log('✅ GA4 Client initialized successfully with enhanced auth handler');
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'initialize_client',
        timestamp: new Date()
      });
      
      console.error('❌ Failed to initialize GA4 Client:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Validate connection to GA4 API using enhanced auth handler
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Use auth handler's comprehensive connection testing
      const connectionTest = await this.authHandler.testConnection();
      return connectionTest.success && connectionTest.propertyAccess;
    } catch (error) {
      console.error('GA4 connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get real-time analytics data with enhanced error handling
   */
  async getRealtimeData(): Promise<GA4RealtimeData> {
    try {
      // Ensure client is initialized and connection is valid
      await this.ensureValidConnection();
      
      this.checkQuotaLimit();

      // Get real-time active users
      const [realtimeResponse] = await this.client!.runRealtimeReport({
        property: `properties/${this.config.propertyId}`,
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ],
        dimensions: [
          { name: 'unifiedPageScreen' }
        ]
      });

      this.quotaUsed += 1;

      // Process real-time data
      const activeUsers = realtimeResponse.totals?.[0]?.metricValues?.[0]?.value || '0';
      const pageViews = realtimeResponse.totals?.[0]?.metricValues?.[1]?.value || '0';

      // Get top pages from real-time data
      const topPages: PageData[] = (realtimeResponse.rows || [])
        .slice(0, 10)
        .map(row => ({
          page: row.dimensionValues?.[0]?.value || '',
          views: parseInt(row.metricValues?.[1]?.value || '0'),
          users: parseInt(row.metricValues?.[0]?.value || '0')
        }));

      // Get traffic sources (requires separate call)
      const sourcesData = await this.getTrafficSources('today');

      return {
        activeUsers: parseInt(activeUsers),
        pageViews: parseInt(pageViews),
        conversions: 0, // Would need conversion events setup
        topPages,
        trafficSources: sourcesData,
        timestamp: new Date(),
        dataRetention: await this.getDataRetention()
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'get_realtime_data',
        timestamp: new Date()
      });
      
      console.error('Failed to fetch GA4 realtime data:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Get historical analytics data with enhanced error handling
   */
  async getHistoricalData(dateRange: { startDate: string; endDate: string }): Promise<GA4HistoricalData> {
    try {
      // Ensure client is initialized and connection is valid
      await this.ensureValidConnection();
      
      this.checkQuotaLimit();

      const [response] = await this.client!.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [dateRange],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ]
      });

      this.quotaUsed += 1;

      const totals = response.totals?.[0]?.metricValues || [];
      const totalUsers = parseInt(totals[0]?.value || '0');
      const totalSessions = parseInt(totals[1]?.value || '0');
      const totalPageViews = parseInt(totals[2]?.value || '0');
      const totalConversions = parseInt(totals[3]?.value || '0');
      const bounceRate = parseFloat(totals[4]?.value || '0');
      const averageSessionDuration = parseFloat(totals[5]?.value || '0');

      return {
        totalUsers,
        totalSessions,
        totalPageViews,
        totalConversions,
        bounceRate,
        averageSessionDuration,
        conversionRate: totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0,
        dateRange,
        timestamp: new Date()
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'get_historical_data',
        timestamp: new Date()
      });
      
      console.error('Failed to fetch GA4 historical data:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Get traffic sources data with enhanced error handling
   */
  private async getTrafficSources(dateRange: string = '7daysAgo'): Promise<SourceData[]> {
    try {
      // Ensure client is initialized and connection is valid
      await this.ensureValidConnection();

      const [response] = await this.client!.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [{ startDate: dateRange, endDate: 'today' }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' }
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'conversions' }
        ],
        orderBys: [
          {
            metric: { metricName: 'totalUsers' },
            desc: true
          }
        ],
        limit: 10
      });

      this.quotaUsed += 1;

      return (response.rows || []).map(row => ({
        source: row.dimensionValues?.[0]?.value || 'unknown',
        medium: row.dimensionValues?.[1]?.value || 'unknown',
        visitors: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        conversions: parseInt(row.metricValues?.[2]?.value || '0')
      }));
    } catch (error) {
      console.error('Failed to fetch traffic sources:', error);
      return [];
    }
  }

  /**
   * Get data retention period
   */
  async getDataRetention(): Promise<number> {
    try {
      // GA4 standard retention is 14 months, but this could be configured
      // In a real implementation, you'd fetch this from the property settings
      return 14; // months
    } catch (error) {
      console.error('Failed to get data retention:', error);
      return 14; // default
    }
  }

  /**
   * Ensure client is initialized and connection is valid
   */
  private async ensureValidConnection(): Promise<void> {
    if (!this.client) {
      await this.initializeClient();
    }

    // Validate connection using auth handler
    const connectionTest = await this.authHandler.testConnection();
    if (!connectionTest.success || !connectionTest.propertyAccess) {
      throw new Error(connectionTest.error || 'GA4 connection validation failed');
    }
  }

  /**
   * Check quota limits and reset if needed
   */
  private checkQuotaLimit(): void {
    const now = new Date();
    const timeSinceReset = now.getTime() - this.lastResetTime.getTime();
    const hoursElapsed = timeSinceReset / (1000 * 60 * 60);

    // Reset quota daily
    if (hoursElapsed >= 24) {
      this.quotaUsed = 0;
      this.lastResetTime = now;
    }

    if (this.quotaUsed >= this.quotaLimit) {
      throw new Error('GA4 API quota limit exceeded. Please try again later.');
    }
  }

  /**
   * Get current quota usage
   */
  getQuotaUsage(): { used: number; limit: number; remaining: number } {
    return {
      used: this.quotaUsed,
      limit: this.quotaLimit,
      remaining: this.quotaLimit - this.quotaUsed
    };
  }

  /**
   * Comprehensive connection validation with retry logic
   */
  async validateConnectionWithRetry(maxRetries: number = 3): Promise<{
    success: boolean;
    attempts: number;
    lastError?: string;
    connectionDetails?: any;
  }> {
    let attempts = 0;
    let lastError: string | undefined;

    for (let i = 0; i < maxRetries; i++) {
      attempts++;
      
      try {
        const connectionTest = await this.authHandler.testConnection();
        
        if (connectionTest.success && connectionTest.propertyAccess) {
          return {
            success: true,
            attempts,
            connectionDetails: connectionTest
          };
        } else {
          lastError = connectionTest.error || 'Connection test failed';
          
          // Wait before retry (exponential backoff)
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        // Wait before retry
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    return {
      success: false,
      attempts,
      lastError
    };
  }

  /**
   * Test property access with specific permissions
   */
  async testPropertyAccess(): Promise<{
    hasReadAccess: boolean;
    hasMetadataAccess: boolean;
    hasRealtimeAccess: boolean;
    error?: string;
  }> {
    const result = {
      hasReadAccess: false,
      hasMetadataAccess: false,
      hasRealtimeAccess: false,
      error: undefined as string | undefined
    };

    try {
      await this.ensureValidConnection();

      // Test 1: Basic read access with historical data
      try {
        const [response] = await this.client!.runReport({
          property: `properties/${this.config.propertyId}`,
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'totalUsers' }],
          limit: 1
        });

        if (response) {
          result.hasReadAccess = true;
        }
      } catch (error) {
        console.warn('Historical data access test failed:', error);
      }

      // Test 2: Metadata access
      try {
        const [metadataResponse] = await this.client!.getMetadata({
          name: `properties/${this.config.propertyId}/metadata`
        });

        if (metadataResponse) {
          result.hasMetadataAccess = true;
        }
      } catch (error) {
        // Metadata errors are common, don't fail the entire test
        console.warn('Metadata access test failed (this is often expected):', error);
      }

      // Test 3: Realtime access
      try {
        const [realtimeResponse] = await this.client!.runRealtimeReport({
          property: `properties/${this.config.propertyId}`,
          metrics: [{ name: 'activeUsers' }],
          limit: 1
        });

        if (realtimeResponse) {
          result.hasRealtimeAccess = true;
        }
      } catch (error) {
        console.warn('Realtime data access test failed:', error);
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Get detailed authentication diagnostics
   */
  async getAuthDiagnostics(): Promise<{
    authHandlerStatus: any;
    connectionTest: any;
    propertyAccess: any;
    quotaStatus: any;
    configValidation: any;
  }> {
    try {
      const authHandlerStatus = await this.authHandler.getAuthStatus();
      const connectionTest = await this.authHandler.testConnection();
      const propertyAccess = await this.testPropertyAccess();
      const quotaStatus = this.getQuotaUsage();
      const configValidation = this.authHandler.getConfig();

      return {
        authHandlerStatus,
        connectionTest,
        propertyAccess,
        quotaStatus,
        configValidation
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'get_auth_diagnostics',
        timestamp: new Date()
      });

      throw new Error(authError.userMessage);
    }
  }

  /**
   * Refresh authentication and test connection
   */
  async refreshAndTest(): Promise<{
    refreshed: boolean;
    connected: boolean;
    error?: string;
  }> {
    try {
      // Refresh auth handler
      const refreshed = await this.authHandler.refreshAuth();
      
      if (refreshed) {
        // Clear existing client to force reinitialization
        this.client = null;
        
        // Test connection
        const connected = await this.validateConnection();
        
        return { refreshed, connected };
      } else {
        return { 
          refreshed: false, 
          connected: false, 
          error: 'Failed to refresh authentication' 
        };
      }
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'refresh_and_test',
        timestamp: new Date()
      });

      return {
        refreshed: false,
        connected: false,
        error: authError.userMessage
      };
    }
  }

  /**
   * Run custom GA4 query with enhanced error handling
   */
  async runCustomQuery(request: any): Promise<GA4Response> {
    try {
      // Ensure client is initialized and connection is valid
      await this.ensureValidConnection();
      
      this.checkQuotaLimit();

      const [response] = await this.client!.runReport({
        property: `properties/${this.config.propertyId}`,
        ...request
      });

      this.quotaUsed += 1;
      const quotaUsage = this.getQuotaUsage();

      return {
        data: response.rows || [],
        metadata: {
          source: 'GA4-Production',
          timestamp: new Date(),
          propertyId: this.config.propertyId,
          dataRetention: await this.getDataRetention(),
          quotaUsed: quotaUsage.used,
          quotaRemaining: quotaUsage.remaining
        },
        success: true
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'run_custom_query',
        timestamp: new Date()
      });
      
      console.error('GA4 custom query failed:', authError.userMessage);
      return {
        data: [],
        metadata: {
          source: 'GA4-Production',
          timestamp: new Date(),
          propertyId: this.config.propertyId,
          dataRetention: 0,
          quotaUsed: this.quotaUsed,
          quotaRemaining: this.quotaLimit - this.quotaUsed
        },
        success: false,
        error: authError.userMessage
      };
    }
  }

  /**
   * Test API connection and return detailed status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    propertyId: string;
    quotaUsage: { used: number; limit: number; remaining: number };
    authStatus?: any;
    lastError?: string;
  }> {
    try {
      const connected = await this.validateConnection();
      const authStatus = await this.authHandler.getAuthStatus();
      
      return {
        connected,
        propertyId: this.config.propertyId,
        quotaUsage: this.getQuotaUsage(),
        authStatus
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'get_connection_status',
        timestamp: new Date()
      });
      
      return {
        connected: false,
        propertyId: this.config.propertyId,
        quotaUsage: this.getQuotaUsage(),
        lastError: authError.userMessage
      };
    }
  }
}

/**
 * Create GA4 client instance from environment variables with enhanced auth
 */
export function createGA4Client(): GA4Client | null {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const serviceAccountKey = process.env.GA4_SERVICE_ACCOUNT_KEY;
    const serviceAccountPath = process.env.GA4_SERVICE_ACCOUNT_PATH;

    if (!propertyId) {
      console.warn('GA4_PROPERTY_ID not configured - GA4 client disabled');
      return null;
    }

    return new GA4Client({
      propertyId,
      serviceAccountKey,
      serviceAccountPath,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
  } catch (error) {
    const authError = errorHandler.createErrorResponse(error, {
      service: 'ga4',
      operation: 'create_client',
      timestamp: new Date()
    });
    
    console.error('Failed to create GA4 client:', authError.userMessage);
    return null;
  }
}

// Export singleton instance
export const ga4Client = createGA4Client();