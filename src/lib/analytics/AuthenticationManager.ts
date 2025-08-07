/**
 * Authentication Manager
 * 
 * Central coordinator for all analytics service authentication.
 * Handles credential validation, service status checking, and error management.
 */

import { GA4Client } from './GA4Client';
import { searchConsoleService } from './googleSearchConsole';
import { FirebaseAuthHandler } from './FirebaseAuthHandler';
import admin from 'firebase-admin';

export interface ValidationResult {
  ga4: { valid: boolean; error?: string };
  firebase: { valid: boolean; error?: string };
  searchConsole: { valid: boolean; error?: string };
  overall: boolean;
}

export interface ServiceStatus {
  service: string;
  status: 'connected' | 'error' | 'disabled';
  lastChecked: Date;
  error?: string;
  details?: any;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
  userMessage: string;
  solution?: string;
}

export interface ErrorResponse {
  success: false;
  error: AuthError;
  timestamp: Date;
}

export class AuthenticationManager {
  private ga4Client: GA4Client | null = null;
  private firebaseAuthHandler: FirebaseAuthHandler | null = null;
  private lastValidation: Date | null = null;
  private validationCache: ValidationResult | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize all analytics services with enhanced auth handlers
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize GA4 client
      if (process.env.GA4_PROPERTY_ID && process.env.GA4_SERVICE_ACCOUNT_KEY) {
        this.ga4Client = new GA4Client({
          propertyId: process.env.GA4_PROPERTY_ID,
          serviceAccountKey: process.env.GA4_SERVICE_ACCOUNT_KEY,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
      }

      // Initialize Firebase Auth Handler
      if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        this.firebaseAuthHandler = new FirebaseAuthHandler({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
      }

      console.log('✅ Authentication Manager initialized successfully with enhanced auth handlers');
    } catch (error) {
      console.error('❌ Failed to initialize Authentication Manager:', error);
    }
  }

  /**
   * Validate all service credentials
   */
  async validateAllCredentials(): Promise<ValidationResult> {
    // Return cached result if still valid
    if (this.validationCache && this.lastValidation) {
      const cacheAge = Date.now() - this.lastValidation.getTime();
      if (cacheAge < this.CACHE_DURATION) {
        return this.validationCache;
      }
    }

    const result: ValidationResult = {
      ga4: { valid: false },
      firebase: { valid: false },
      searchConsole: { valid: false },
      overall: false
    };

    // Validate GA4
    try {
      if (this.ga4Client) {
        const connected = await this.ga4Client.validateConnection();
        result.ga4 = { valid: connected };
      } else {
        result.ga4 = { 
          valid: false, 
          error: 'GA4 client not initialized - check GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY' 
        };
      }
    } catch (error) {
      result.ga4 = { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown GA4 error' 
      };
    }

    // Validate Firebase using auth handler
    try {
      if (this.firebaseAuthHandler) {
        const connectionTest = await this.firebaseAuthHandler.testConnection();
        result.firebase = { 
          valid: connectionTest.success,
          error: connectionTest.error
        };
      } else {
        result.firebase = { 
          valid: false, 
          error: 'Firebase auth handler not initialized - check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID' 
        };
      }
    } catch (error) {
      result.firebase = { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown Firebase error' 
      };
    }

    // Validate Search Console
    try {
      if (searchConsoleService.isConfigured()) {
        // Test with a simple date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        
        await searchConsoleService.getOverviewData(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        result.searchConsole = { valid: true };
      } else {
        result.searchConsole = { 
          valid: false, 
          error: 'Search Console not configured - check GOOGLE_SEARCH_CONSOLE_SITE_URL, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY' 
        };
      }
    } catch (error) {
      result.searchConsole = { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown Search Console error' 
      };
    }

    // Set overall status
    result.overall = result.ga4.valid || result.firebase.valid || result.searchConsole.valid;

    // Cache the result
    this.validationCache = result;
    this.lastValidation = new Date();

    return result;
  }

  /**
   * Get current status of all services
   */
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const validation = await this.validateAllCredentials();
    const now = new Date();

    return [
      {
        service: 'Google Analytics 4',
        status: validation.ga4.valid ? 'connected' : 'error',
        lastChecked: now,
        error: validation.ga4.error,
        details: this.ga4Client ? {
          propertyId: process.env.GA4_PROPERTY_ID,
          quotaUsage: this.ga4Client.getQuotaUsage()
        } : undefined
      },
      {
        service: 'Firebase Analytics',
        status: validation.firebase.valid ? 'connected' : 'error',
        lastChecked: now,
        error: validation.firebase.error,
        details: this.firebaseAuthHandler ? {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          config: this.firebaseAuthHandler.getConfig()
        } : undefined
      },
      {
        service: 'Google Search Console',
        status: validation.searchConsole.valid ? 'connected' : 'error',
        lastChecked: now,
        error: validation.searchConsole.error,
        details: {
          siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
        }
      }
    ];
  }

  /**
   * Refresh credentials for a specific service
   */
  async refreshCredentials(service: string): Promise<boolean> {
    try {
      switch (service.toLowerCase()) {
        case 'ga4':
        case 'google analytics 4':
          if (this.ga4Client) {
            return await this.ga4Client.validateConnection();
          }
          break;
        
        case 'firebase':
        case 'firebase analytics':
          if (this.firebaseAuthHandler) {
            return await this.firebaseAuthHandler.refreshAuth();
          }
          break;
        
        case 'search console':
        case 'google search console':
          if (searchConsoleService.isConfigured()) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            
            await searchConsoleService.getOverviewData(
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0]
            );
            return true;
          }
          break;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to refresh credentials for ${service}:`, error);
      return false;
    }
  }

  /**
   * Handle authentication errors and provide user-friendly responses
   */
  handleAuthError(error: any): ErrorResponse {
    const authError: AuthError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      userMessage: 'Something went wrong with the analytics service',
      solution: 'Please try again later or contact support'
    };

    // Classify the error
    if (error?.message?.includes('headers.forEach is not a function')) {
      authError.code = 'GA4_METADATA_ERROR';
      authError.message = 'GA4 metadata plugin error';
      authError.userMessage = 'Google Analytics authentication is experiencing issues';
      authError.solution = 'The system is working to resolve this automatically. Please refresh the page in a few moments.';
    } else if (error?.message?.includes('Missing or insufficient permissions')) {
      authError.code = 'FIREBASE_PERMISSION_ERROR';
      authError.message = 'Firebase permission denied';
      authError.userMessage = 'Analytics data access is currently restricted';
      authError.solution = 'Please ensure your Firebase service account has the correct permissions.';
    } else if (error?.message?.includes('User does not have sufficient permission')) {
      authError.code = 'SEARCH_CONSOLE_PERMISSION_ERROR';
      authError.message = 'Search Console permission denied';
      authError.userMessage = 'Search performance data is currently unavailable';
      authError.solution = 'Please verify that your service account has access to Google Search Console.';
    } else if (error?.code === 2 || error?.code === 'UNKNOWN') {
      authError.code = 'API_CONNECTION_ERROR';
      authError.message = 'API connection failed';
      authError.userMessage = 'Unable to connect to analytics services';
      authError.solution = 'Please check your internet connection and try again.';
    } else if (error?.code === 3 || error?.code === 'INVALID_ARGUMENT') {
      authError.code = 'INVALID_REQUEST_ERROR';
      authError.message = 'Invalid API request';
      authError.userMessage = 'Analytics request configuration error';
      authError.solution = 'The system is working to resolve this automatically.';
    }

    authError.details = error;

    return {
      success: false,
      error: authError,
      timestamp: new Date()
    };
  }

  /**
   * Get GA4 client instance
   */
  getGA4Client(): GA4Client | null {
    return this.ga4Client;
  }

  /**
   * Get Firebase auth handler instance
   */
  getFirebaseAuthHandler(): FirebaseAuthHandler | null {
    return this.firebaseAuthHandler;
  }

  /**
   * Get Firebase app instance (through auth handler)
   */
  async getFirebaseApp(): Promise<admin.app.App | null> {
    if (this.firebaseAuthHandler) {
      try {
        return await this.firebaseAuthHandler.getApp();
      } catch (error) {
        console.error('Failed to get Firebase app:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache = null;
    this.lastValidation = null;
  }
}

// Export singleton instance
export const authManager = new AuthenticationManager();
