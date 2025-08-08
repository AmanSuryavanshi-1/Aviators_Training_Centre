/**
 * Firebase Authentication Handler
 * 
 * Handles Firebase Admin SDK initialization with proper service account authentication.
 * Implements permission validation for Firestore and Analytics access.
 */

import admin from 'firebase-admin';
import { errorHandler } from './ErrorHandler';

export interface PermissionCheck {
  firestore: boolean;
  analytics: boolean;
  auth: boolean;
  storage: boolean;
  missingPermissions: string[];
}

export interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
  databaseURL?: string;
  storageBucket?: string;
}

export class FirebaseAuthHandler {
  private app: admin.app.App | null = null;
  private config: FirebaseConfig;
  private lastPermissionCheck: Date | null = null;
  private permissionCheckResult: PermissionCheck | null = null;
  private readonly PERMISSION_CHECK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: FirebaseConfig) {
    this.config = config;
  }

  /**
   * Initialize Firebase Admin SDK with proper error handling
   */
  async initializeAdmin(): Promise<admin.app.App> {
    try {
      if (this.app) {
        return this.app;
      }

      // Check if app already exists
      try {
        this.app = admin.app();
        console.log('✅ Using existing Firebase Admin app');
        return this.app;
      } catch (error) {
        // App doesn't exist, create it
      }

      // Validate configuration
      this.validateConfig();

      // Create service account credentials
      const serviceAccount: admin.ServiceAccount = {
        type: 'service_account',
        project_id: this.config.projectId,
        private_key: this.config.privateKey.replace(/\\n/g, '\n'),
        client_email: this.config.clientEmail,
      };

      // Initialize Firebase Admin
      const appConfig: admin.AppOptions = {
        credential: admin.credential.cert(serviceAccount),
        projectId: this.config.projectId,
      };

      // Add optional configurations
      if (this.config.databaseURL) {
        appConfig.databaseURL = this.config.databaseURL;
      }

      if (this.config.storageBucket) {
        appConfig.storageBucket = this.config.storageBucket;
      }

      this.app = admin.initializeApp(appConfig);
      console.log('✅ Firebase Admin initialized successfully');

      return this.app;

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'initialize_admin',
        timestamp: new Date()
      });

      console.error('❌ Failed to initialize Firebase Admin:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Validate Firebase configuration
   */
  private validateConfig(): void {
    const errors: string[] = [];

    if (!this.config.projectId) {
      errors.push('Project ID is required');
    }

    if (!this.config.privateKey) {
      errors.push('Private key is required');
    } else if (!this.config.privateKey.includes('BEGIN PRIVATE KEY')) {
      errors.push('Private key format is invalid');
    }

    if (!this.config.clientEmail) {
      errors.push('Client email is required');
    } else if (!this.config.clientEmail.includes('@') || 
               !this.config.clientEmail.includes('.iam.gserviceaccount.com')) {
      errors.push('Client email format is invalid');
    }

    if (errors.length > 0) {
      throw new Error(`Firebase configuration errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate permissions for Firebase services
   */
  async validatePermissions(): Promise<PermissionCheck> {
    // Return cached result if still valid
    if (this.permissionCheckResult && this.lastPermissionCheck) {
      const cacheAge = Date.now() - this.lastPermissionCheck.getTime();
      if (cacheAge < this.PERMISSION_CHECK_CACHE_DURATION) {
        return this.permissionCheckResult;
      }
    }

    const result: PermissionCheck = {
      firestore: false,
      analytics: false,
      auth: false,
      storage: false,
      missingPermissions: []
    };

    try {
      const app = await this.initializeAdmin();

      // Test Firestore access
      try {
        const db = admin.firestore(app);
        await db.collection('_test_').limit(1).get();
        result.firestore = true;
      } catch (error) {
        result.missingPermissions.push('Firestore read access');
        console.warn('Firestore permission test failed:', error);
      }

      // Test Auth access
      try {
        const auth = admin.auth(app);
        await auth.listUsers(1);
        result.auth = true;
      } catch (error) {
        result.missingPermissions.push('Firebase Auth access');
        console.warn('Auth permission test failed:', error);
      }

      // Test Storage access (if configured)
      if (this.config.storageBucket) {
        try {
          const storage = admin.storage(app);
          await storage.bucket().getFiles({ maxResults: 1 });
          result.storage = true;
        } catch (error) {
          result.missingPermissions.push('Storage access');
          console.warn('Storage permission test failed:', error);
        }
      } else {
        result.storage = true; // Not configured, so consider it "available"
      }

      // Analytics is typically available if Firestore works
      result.analytics = result.firestore;

    } catch (error) {
      result.missingPermissions.push('Firebase Admin initialization');
      console.error('Permission validation failed:', error);
    }

    // Cache the result
    this.permissionCheckResult = result;
    this.lastPermissionCheck = new Date();

    return result;
  }

  /**
   * Test Firestore access specifically
   */
  async testFirestoreAccess(): Promise<boolean> {
    try {
      const app = await this.initializeAdmin();
      const db = admin.firestore(app);

      // Try to read from a test collection
      await db.collection('_test_').limit(1).get();
      
      // Try to write to a test document
      const testDoc = db.collection('_test_').doc('connection_test');
      await testDoc.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true
      });

      // Clean up test document
      await testDoc.delete();

      return true;

    } catch (error) {
      console.error('Firestore access test failed:', error);
      return false;
    }
  }

  /**
   * Test Analytics access (through Firestore)
   */
  async testAnalyticsAccess(): Promise<boolean> {
    try {
      const app = await this.initializeAdmin();
      const db = admin.firestore(app);

      // Test access to analytics collections
      const collections = ['analytics_events', 'user_sessions', 'daily_summaries'];
      
      for (const collection of collections) {
        try {
          await db.collection(collection).limit(1).get();
        } catch (error) {
          console.warn(`Analytics collection ${collection} access failed:`, error);
        }
      }

      return true;

    } catch (error) {
      console.error('Analytics access test failed:', error);
      return false;
    }
  }

  /**
   * Get Firebase app instance
   */
  async getApp(): Promise<admin.app.App> {
    if (!this.app) {
      return await this.initializeAdmin();
    }
    return this.app;
  }

  /**
   * Get Firestore instance
   */
  async getFirestore(): Promise<admin.firestore.Firestore> {
    const app = await this.getApp();
    return admin.firestore(app);
  }

  /**
   * Get Auth instance
   */
  async getAuth(): Promise<admin.auth.Auth> {
    const app = await this.getApp();
    return admin.auth(app);
  }

  /**
   * Get Storage instance
   */
  async getStorage(): Promise<admin.storage.Storage> {
    const app = await this.getApp();
    return admin.storage(app);
  }

  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<{
    initialized: boolean;
    permissions: PermissionCheck;
    lastChecked: Date | null;
    error?: string;
  }> {
    try {
      const initialized = !!this.app;
      const permissions = await this.validatePermissions();

      return {
        initialized,
        permissions,
        lastChecked: this.lastPermissionCheck
      };
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_auth_status',
        timestamp: new Date()
      });

      return {
        initialized: false,
        permissions: {
          firestore: false,
          analytics: false,
          auth: false,
          storage: false,
          missingPermissions: ['Authentication failed']
        },
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
      // Clear cached app and permissions
      this.app = null;
      this.permissionCheckResult = null;
      this.lastPermissionCheck = null;

      // Reinitialize
      await this.initializeAdmin();
      const permissions = await this.validatePermissions();

      return permissions.firestore || permissions.analytics;

    } catch (error) {
      console.error('Failed to refresh Firebase authentication:', error);
      return false;
    }
  }

  /**
   * Get configuration details (without sensitive data)
   */
  getConfig(): {
    projectId: string;
    hasPrivateKey: boolean;
    hasClientEmail: boolean;
    hasDatabaseURL: boolean;
    hasStorageBucket: boolean;
  } {
    return {
      projectId: this.config.projectId,
      hasPrivateKey: !!this.config.privateKey,
      hasClientEmail: !!this.config.clientEmail,
      hasDatabaseURL: !!this.config.databaseURL,
      hasStorageBucket: !!this.config.storageBucket
    };
  }

  /**
   * Test connection with detailed diagnostics
   */
  async testConnection(): Promise<{
    success: boolean;
    initialized: boolean;
    permissions: PermissionCheck;
    error?: string;
    details?: any;
  }> {
    try {
      // Test initialization
      const app = await this.initializeAdmin();
      const initialized = !!app;

      // Test permissions
      const permissions = await this.validatePermissions();

      const success = initialized && (permissions.firestore || permissions.analytics);

      return {
        success,
        initialized,
        permissions,
        details: {
          appName: app.name,
          projectId: this.config.projectId
        }
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'test_connection',
        timestamp: new Date()
      });

      return {
        success: false,
        initialized: false,
        permissions: {
          firestore: false,
          analytics: false,
          auth: false,
          storage: false,
          missingPermissions: ['Connection test failed']
        },
        error: authError.userMessage
      };
    }
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    try {
      if (this.app) {
        await this.app.delete();
        this.app = null;
      }
      
      this.permissionCheckResult = null;
      this.lastPermissionCheck = null;

    } catch (error) {
      console.warn('Error disposing Firebase app:', error);
    }
  }
}

/**
 * Create Firebase auth handler from environment variables
 */
export function createFirebaseAuthHandler(): FirebaseAuthHandler | null {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase credentials not fully configured - Firebase auth handler disabled');
      return null;
    }

    return new FirebaseAuthHandler({
      projectId,
      privateKey,
      clientEmail,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });

  } catch (error) {
    console.error('Failed to create Firebase auth handler:', error);
    return null;
  }
}

// Export singleton instance
export const firebaseAuthHandler = createFirebaseAuthHandler();