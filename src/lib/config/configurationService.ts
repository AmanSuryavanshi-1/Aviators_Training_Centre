/**
 * Configuration Service
 * Manages environment-specific settings and provides typed configuration access
 */

import { environmentValidator } from './environmentValidator';

export interface DatabaseConfig {
  sanity: {
    projectId: string;
    dataset: string;
    apiVersion: string;
    token?: string;
    useCdn: boolean;
  };
}

export interface AuthConfig {
  jwtSecret: string;
  sessionTimeout: number;
  refreshTokenTimeout: number;
  adminCredentials: {
    username: string;
    password: string;
  };
}

export interface EmailConfig {
  provider: 'resend';
  apiKey: string;
  fromEmail: string;
  ownerEmails: string[];
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  adminCredentials?: {
    privateKey: string;
    clientEmail: string;
  };
}

export interface SiteConfig {
  url: string;
  environment: 'development' | 'production' | 'test';
  isProduction: boolean;
  analytics?: {
    googleAnalyticsId?: string;
  };
}

export interface AppConfiguration {
  site: SiteConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  firebase: FirebaseConfig;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: AppConfiguration | null = null;
  private isInitialized = false;

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Initialize configuration from environment variables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Validate environment first
    const validation = environmentValidator.validateStartupConfiguration();
    
    if (!validation.canStart) {
      throw new Error(`Configuration validation failed:\n${validation.criticalErrors.join('\n')}`);
    }

    // Log warnings but continue
    if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:', validation.warnings);
    }

    this.config = this.buildConfiguration();
    this.isInitialized = true;

    console.log('✅ Configuration service initialized successfully');
  }

  /**
   * Build configuration from environment variables
   */
  private buildConfiguration(): AppConfiguration {
    const environment = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
    const isProduction = environment === 'production';

    return {
      site: {
        url: this.getRequiredEnv('NEXT_PUBLIC_SITE_URL'),
        environment,
        isProduction,
        analytics: {
          googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        },
      },
      database: {
        sanity: {
          projectId: this.getRequiredEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
          dataset: this.getRequiredEnv('NEXT_PUBLIC_SANITY_DATASET'),
          apiVersion: this.getRequiredEnv('NEXT_PUBLIC_SANITY_API_VERSION'),
          token: process.env.SANITY_API_TOKEN,
          useCdn: isProduction,
        },
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || this.getRequiredEnv('SANITY_API_TOKEN'),
        sessionTimeout: 15 * 60 * 1000, // 15 minutes
        refreshTokenTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
        adminCredentials: {
          username: this.getRequiredEnv('ADMIN_USERNAME'),
          password: this.getRequiredEnv('ADMIN_PASSWORD'),
        },
      },
      email: {
        provider: 'resend',
        apiKey: this.getRequiredEnv('RESEND_API_KEY'),
        fromEmail: this.getRequiredEnv('FROM_EMAIL'),
        ownerEmails: [
          process.env.OWNER1_EMAIL,
          process.env.OWNER2_EMAIL,
        ].filter(Boolean) as string[],
      },
      firebase: {
        // Using NEXT_PUBLIC_ variables for client-side Firebase configuration
        // These are safe to expose as they're meant for client-side Firebase initialization
        apiKey: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
        authDomain: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        databaseURL: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL'),
        projectId: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: this.getRequiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        adminCredentials: process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL ? {
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        } : undefined,
      },
    };
  }

  /**
   * Get required environment variable with error handling
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get complete configuration
   */
  getConfig(): AppConfiguration {
    if (!this.isInitialized || !this.config) {
      throw new Error('Configuration service not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Get site configuration
   */
  getSiteConfig(): SiteConfig {
    return this.getConfig().site;
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    return this.getConfig().database;
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig(): AuthConfig {
    return this.getConfig().auth;
  }

  /**
   * Get email configuration
   */
  getEmailConfig(): EmailConfig {
    return this.getConfig().email;
  }

  /**
   * Get Firebase configuration
   */
  getFirebaseConfig(): FirebaseConfig {
    return this.getConfig().firebase;
  }

  /**
   * Check if service is configured
   */
  isServiceConfigured(service: 'sanity' | 'firebase' | 'email' | 'auth'): boolean {
    if (!this.isInitialized || !this.config) {
      return false;
    }

    switch (service) {
      case 'sanity':
        return !!(this.config.database.sanity.projectId && this.config.database.sanity.dataset);
      case 'firebase':
        return !!(this.config.firebase.apiKey && this.config.firebase.projectId);
      case 'email':
        return !!(this.config.email.apiKey && this.config.email.fromEmail);
      case 'auth':
        return !!(this.config.auth.adminCredentials.username && this.config.auth.adminCredentials.password);
      default:
        return false;
    }
  }

  /**
   * Check if Firebase Admin SDK is configured
   */
  hasFirebaseAdminSDK(): boolean {
    if (!this.isInitialized || !this.config) {
      return false;
    }
    return !!this.config.firebase.adminCredentials;
  }

  /**
   * Check if Sanity write access is available
   */
  hasSanityWriteAccess(): boolean {
    if (!this.isInitialized || !this.config) {
      return false;
    }
    return !!this.config.database.sanity.token;
  }

  /**
   * Get environment-specific settings
   */
  getEnvironmentSettings(): {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    environment: string;
  } {
    const siteConfig = this.getSiteConfig();
    return {
      isDevelopment: siteConfig.environment === 'development',
      isProduction: siteConfig.environment === 'production',
      isTest: siteConfig.environment === 'test',
      environment: siteConfig.environment,
    };
  }

  /**
   * Get configuration for client-side use (safe values only)
   */
  getClientConfig(): {
    site: {
      url: string;
      environment: string;
    };
    firebase: {
      apiKey: string;
      authDomain: string;
      databaseURL: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      measurementId?: string;
    };
    sanity: {
      projectId: string;
      dataset: string;
      apiVersion: string;
    };
    analytics?: {
      googleAnalyticsId?: string;
    };
  } {
    const config = this.getConfig();
    
    return {
      site: {
        url: config.site.url,
        environment: config.site.environment,
      },
      firebase: {
        apiKey: config.firebase.apiKey,
        authDomain: config.firebase.authDomain,
        databaseURL: config.firebase.databaseURL,
        projectId: config.firebase.projectId,
        storageBucket: config.firebase.storageBucket,
        messagingSenderId: config.firebase.messagingSenderId,
        appId: config.firebase.appId,
        measurementId: config.firebase.measurementId,
      },
      sanity: {
        projectId: config.database.sanity.projectId,
        dataset: config.database.sanity.dataset,
        apiVersion: config.database.sanity.apiVersion,
      },
      analytics: config.site.analytics,
    };
  }

  /**
   * Validate current configuration
   */
  validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    services: {
      sanity: boolean;
      firebase: boolean;
      email: boolean;
      auth: boolean;
    };
  } {
    if (!this.isInitialized || !this.config) {
      return {
        isValid: false,
        errors: ['Configuration not initialized'],
        warnings: [],
        services: {
          sanity: false,
          firebase: false,
          email: false,
          auth: false,
        },
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate site configuration
    try {
      new URL(this.config.site.url);
    } catch {
      errors.push('Invalid site URL format');
    }

    // Check for production-specific requirements
    if (this.config.site.isProduction) {
      if (this.config.site.url.includes('localhost')) {
        errors.push('Production environment should not use localhost URLs');
      }

      if (!this.config.firebase.adminCredentials) {
        warnings.push('Firebase Admin SDK not configured for production');
      }
    }

    // Check service configurations
    const services = {
      sanity: this.isServiceConfigured('sanity'),
      firebase: this.isServiceConfigured('firebase'),
      email: this.isServiceConfigured('email'),
      auth: this.isServiceConfigured('auth'),
    };

    // Add warnings for missing optional services
    if (!services.firebase) {
      warnings.push('Firebase not configured - contact forms may not work');
    }

    if (!services.email) {
      warnings.push('Email service not configured - notifications may not work');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      services,
    };
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigurationSummary(): {
    initialized: boolean;
    environment: string;
    services: Record<string, boolean>;
    urls: {
      site: string;
      sanityStudio?: string;
    };
  } {
    if (!this.isInitialized || !this.config) {
      return {
        initialized: false,
        environment: 'unknown',
        services: {},
        urls: { site: 'not-configured' },
      };
    }

    return {
      initialized: true,
      environment: this.config.site.environment,
      services: {
        sanity: this.isServiceConfigured('sanity'),
        sanityWrite: this.hasSanityWriteAccess(),
        firebase: this.isServiceConfigured('firebase'),
        firebaseAdmin: this.hasFirebaseAdminSDK(),
        email: this.isServiceConfigured('email'),
        auth: this.isServiceConfigured('auth'),
      },
      urls: {
        site: this.config.site.url,
        sanityStudio: `${this.config.site.url}/studio`,
      },
    };
  }

  /**
   * Reset configuration (for testing)
   */
  reset(): void {
    this.config = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const configurationService = ConfigurationService.getInstance();

// Auto-initialize in non-test environments
if (process.env.NODE_ENV !== 'test') {
  configurationService.initialize().catch(error => {
    console.error('Failed to initialize configuration service:', error);
    process.exit(1);
  });
}