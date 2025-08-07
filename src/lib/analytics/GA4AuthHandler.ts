/**
 * Enhanced GA4 Authentication Handler
 * 
 * Fixes the metadata plugin error and improves GA4 authentication.
 * Implements proper service account key parsing and connection testing.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import { errorHandler } from './ErrorHandler';

export interface ConnectionTest {
  success: boolean;
  propertyAccess: boolean;
  quotaAvailable: boolean;
  error?: string;
  details?: any;
}

export interface GA4AuthConfig {
  propertyId: string;
  serviceAccountKey?: string;
  serviceAccountPath?: string;
  projectId?: string;
}

export class GA4AuthHandler {
  private client: BetaAnalyticsDataClient | null = null;
  private auth: GoogleAuth | null = null;
  private config: GA4AuthConfig;
  private lastConnectionTest: Date | null = null;
  private connectionTestResult: ConnectionTest | null = null;
  private readonly CONNECTION_TEST_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: GA4AuthConfig) {
    this.config = config;
  }

  /**
   * Initialize GA4 client with enhanced error handling
   */
  async initializeClient(): Promise<BetaAnalyticsDataClient> {
    try {
      if (this.client) {
        return this.client;
      }

      // Initialize Google Auth with proper error handling
      this.auth = await this.createGoogleAuth();
      
      // Create client with auth
      this.client = new BetaAnalyticsDataClient({ 
        auth: this.auth,
        // Add additional options to prevent metadata plugin errors
        fallback: true,
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ GA4 Client initialized successfully with enhanced auth handler');
      return this.client;

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
   * Create Google Auth instance with proper credential parsing
   */
  private async createGoogleAuth(): Promise<GoogleAuth> {
    try {
      let credentials: any = null;

      if (this.config.serviceAccountKey) {
        // Parse service account key with enhanced error handling
        try {
          credentials = JSON.parse(this.config.serviceAccountKey);
        } catch (parseError) {
          throw new Error('GA4_SERVICE_ACCOUNT_KEY is not valid JSON. Please check the format.');
        }

        // Validate required fields
        const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
        for (const field of requiredFields) {
          if (!credentials[field]) {
            throw new Error(`Service account JSON missing required field: ${field}`);
          }
        }

        // Validate service account type
        if (credentials.type !== 'service_account') {
          throw new Error('Service account type must be "service_account"');
        }

        // Create auth with credentials
        return new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
          // Add project ID if available
          projectId: credentials.project_id || this.config.projectId
        });

      } else if (this.config.serviceAccountPath) {
        // Use service account key file path
        return new GoogleAuth({
          keyFile: this.config.serviceAccountPath,
          scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
          projectId: this.config.projectId
        });

      } else {
        // Use default credentials (for production environments)
        return new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
          projectId: this.config.projectId
        });
      }

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'create_auth',
        timestamp: new Date()
      });

      throw new Error(authError.userMessage);
    }
  }

  /**
   * Validate credentials with comprehensive testing
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const client = await this.initializeClient();
      
      // Test basic connection
      const connectionTest = await this.testConnection();
      
      return connectionTest.success && connectionTest.propertyAccess;

    } catch (error) {
      console.error('GA4 credential validation failed:', error);
      return false;
    }
  }

  /**
   * Test connection with detailed diagnostics
   */
  async testConnection(): Promise<ConnectionTest> {
    // Return cached result if still valid
    if (this.connectionTestResult && this.lastConnectionTest) {
      const cacheAge = Date.now() - this.lastConnectionTest.getTime();
      if (cacheAge < this.CONNECTION_TEST_CACHE_DURATION) {
        return this.connectionTestResult;
      }
    }

    const result: ConnectionTest = {
      success: false,
      propertyAccess: false,
      quotaAvailable: true,
      details: {}
    };

    try {
      const client = await this.initializeClient();

      // Test 1: Basic client initialization
      if (!client) {
        result.error = 'Failed to initialize GA4 client';
        return result;
      }

      result.success = true;

      // Test 2: Property access with metadata request
      try {
        const [metadataResponse] = await client.getMetadata({
          name: `properties/${this.config.propertyId}/metadata`
        });

        if (metadataResponse) {
          result.propertyAccess = true;
          result.details.metadata = {
            dimensions: metadataResponse.dimensions?.length || 0,
            metrics: metadataResponse.metrics?.length || 0
          };
        }

      } catch (metadataError: any) {
        // Handle specific metadata errors
        if (metadataError.message?.includes('headers.forEach')) {
          result.error = 'GA4 metadata plugin error detected - using alternative validation';
          
          // Try alternative validation with a simple report request
          try {
            const [reportResponse] = await client.runReport({
              property: `properties/${this.config.propertyId}`,
              dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
              metrics: [{ name: 'totalUsers' }],
              limit: 1
            });

            if (reportResponse) {
              result.propertyAccess = true;
              result.details.alternativeValidation = true;
            }

          } catch (reportError) {
            result.error = `Property access failed: ${reportError}`;
          }

        } else {
          result.error = `Metadata request failed: ${metadataError.message}`;
        }
      }

      // Test 3: Quota availability (basic check)
      if (result.propertyAccess) {
        try {
          // Make a minimal request to check quota
          await client.runReport({
            property: `properties/${this.config.propertyId}`,
            dateRanges: [{ startDate: 'today', endDate: 'today' }],
            metrics: [{ name: 'totalUsers' }],
            limit: 1
          });

          result.quotaAvailable = true;

        } catch (quotaError: any) {
          if (quotaError.message?.includes('quota') || quotaError.message?.includes('limit')) {
            result.quotaAvailable = false;
            result.details.quotaError = quotaError.message;
          }
        }
      }

    } catch (error: any) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'test_connection',
        timestamp: new Date()
      });

      result.error = authError.userMessage;
      result.details.originalError = error.message;
    }

    // Cache the result
    this.connectionTestResult = result;
    this.lastConnectionTest = new Date();

    return result;
  }

  /**
   * Handle metadata plugin errors gracefully
   */
  handleMetadataError(error: Error): void {
    if (error.message.includes('headers.forEach is not a function')) {
      console.warn('🔧 GA4 metadata plugin error detected - implementing workaround');
      
      // Log the error for tracking
      errorHandler.createErrorResponse(error, {
        service: 'ga4',
        operation: 'metadata_request',
        timestamp: new Date()
      });

      // The error is handled by using alternative validation methods
      // in the testConnection method
    }
  }

  /**
   * Get authenticated client instance
   */
  async getClient(): Promise<BetaAnalyticsDataClient> {
    if (!this.client) {
      return await this.initializeClient();
    }
    return this.client;
  }

  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<{
    authenticated: boolean;
    propertyAccess: boolean;
    quotaAvailable: boolean;
    lastTested: Date | null;
    error?: string;
  }> {
    const connectionTest = await this.testConnection();
    
    return {
      authenticated: connectionTest.success,
      propertyAccess: connectionTest.propertyAccess,
      quotaAvailable: connectionTest.quotaAvailable,
      lastTested: this.lastConnectionTest,
      error: connectionTest.error
    };
  }

  /**
   * Refresh authentication
   */
  async refreshAuth(): Promise<boolean> {
    try {
      // Clear cached client and auth
      this.client = null;
      this.auth = null;
      this.connectionTestResult = null;
      this.lastConnectionTest = null;

      // Reinitialize
      await this.initializeClient();
      const connectionTest = await this.testConnection();

      return connectionTest.success && connectionTest.propertyAccess;

    } catch (error) {
      console.error('Failed to refresh GA4 authentication:', error);
      return false;
    }
  }

  /**
   * Get configuration details (without sensitive data)
   */
  getConfig(): {
    propertyId: string;
    hasServiceAccountKey: boolean;
    hasServiceAccountPath: boolean;
    projectId?: string;
  } {
    return {
      propertyId: this.config.propertyId,
      hasServiceAccountKey: !!this.config.serviceAccountKey,
      hasServiceAccountPath: !!this.config.serviceAccountPath,
      projectId: this.config.projectId
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.client = null;
    this.auth = null;
    this.connectionTestResult = null;
    this.lastConnectionTest = null;
  }
}

/**
 * Create GA4 auth handler from environment variables
 */
export function createGA4AuthHandler(): GA4AuthHandler | null {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    
    if (!propertyId) {
      console.warn('GA4_PROPERTY_ID not configured - GA4 auth handler disabled');
      return null;
    }

    return new GA4AuthHandler({
      propertyId,
      serviceAccountKey: process.env.GA4_SERVICE_ACCOUNT_KEY,
      serviceAccountPath: process.env.GA4_SERVICE_ACCOUNT_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });

  } catch (error) {
    console.error('Failed to create GA4 auth handler:', error);
    return null;
  }
}

// Export singleton instance
export const ga4AuthHandler = createGA4AuthHandler();