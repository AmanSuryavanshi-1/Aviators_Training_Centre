import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Firebase Admin configuration interface
interface FirebaseAdminConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

// Connection validation interface
interface ConnectionValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    projectId: string;
    hasCredentials: boolean;
    firestoreConnected: boolean;
    authConnected: boolean;
  };
  latency?: number;
}

class FirebaseAdminService {
  private static instance: FirebaseAdminService;
  private app: App | null = null;
  private firestore: Firestore | null = null;
  private auth: Auth | null = null;
  private connectionValidated = false;
  private lastValidationTime = 0;
  private validationCacheDuration = 300000; // 5 minutes

  static getInstance(): FirebaseAdminService {
    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = new FirebaseAdminService();
    }
    return FirebaseAdminService.instance;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initializeFirebaseAdmin(): void {
    try {
      // Check if already initialized
      if (this.app) {
        return;
      }

      // Check if Firebase Admin is already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
        this.firestore = getFirestore(this.app);
        this.auth = getAuth(this.app);
        return;
      }

      // Get configuration from environment variables
      const config = this.getFirebaseConfig();
      
      // Initialize Firebase Admin
      this.app = initializeApp({
        credential: cert({
          projectId: config.projectId,
          privateKey: config.privateKey.replace(/\\n/g, '\n'),
          clientEmail: config.clientEmail,
        }),
        projectId: config.projectId,
      });

      // Initialize services
      this.firestore = getFirestore(this.app);
      this.auth = getAuth(this.app);

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error);
      throw new Error(`Failed to initialize Firebase Admin: ${(error as Error).message}`);
    }
  }

  /**
   * Get Firebase configuration from environment variables
   */
  private getFirebaseConfig(): FirebaseAdminConfig {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    if (!privateKey || 
        privateKey.includes('YOUR_PRIVATE_KEY_HERE') || 
        privateKey.includes('PLACEHOLDER_NOT_CONFIGURED') ||
        privateKey === 'PLACEHOLDER_NOT_CONFIGURED') {
      throw new Error('Firebase Admin SDK not configured. Please set up FIREBASE_PRIVATE_KEY with a valid service account private key.');
    }

    if (!clientEmail || 
        clientEmail.includes('firebase-adminsdk-xxxxx') || 
        clientEmail.includes('PLACEHOLDER_NOT_CONFIGURED') ||
        clientEmail === 'PLACEHOLDER_NOT_CONFIGURED') {
      throw new Error('Firebase Admin SDK not configured. Please set up FIREBASE_CLIENT_EMAIL with a valid service account email.');
    }

    return {
      projectId,
      privateKey,
      clientEmail,
    };
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    if (!this.firestore) {
      this.initializeFirebaseAdmin();
    }

    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }

    return this.firestore;
  }

  /**
   * Get Auth instance
   */
  getAuth(): Auth {
    if (!this.auth) {
      this.initializeFirebaseAdmin();
    }

    if (!this.auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    return this.auth;
  }

  /**
   * Validate Firebase Admin connection
   */
  async validateConnection(forceRevalidation = false): Promise<ConnectionValidationResult> {
    const now = Date.now();
    
    // Use cached validation if recent and not forcing revalidation
    if (!forceRevalidation && 
        this.connectionValidated && 
        (now - this.lastValidationTime) < this.validationCacheDuration) {
      return {
        isValid: true,
        details: {
          projectId: process.env.FIREBASE_PROJECT_ID || 'unknown',
          hasCredentials: !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL),
          firestoreConnected: !!this.firestore,
          authConnected: !!this.auth,
        }
      };
    }

    const startTime = Date.now();
    
    try {
      // Check environment variables
      const config = this.getFirebaseConfig();
      
      // Initialize if not already done
      this.initializeFirebaseAdmin();
      
      // Test Firestore connection
      const firestore = this.getFirestore();
      await firestore.collection('_health_check').limit(1).get();
      
      // Test Auth connection (optional, just check if it's available)
      const auth = this.getAuth();
      
      const latency = Date.now() - startTime;
      this.connectionValidated = true;
      this.lastValidationTime = now;

      return {
        isValid: true,
        details: {
          projectId: config.projectId,
          hasCredentials: true,
          firestoreConnected: true,
          authConnected: !!auth,
        },
        latency,
      };

    } catch (error) {
      const errorMessage = (error as Error).message;
      let friendlyError = this.getFriendlyErrorMessage(error as Error);

      return {
        isValid: false,
        error: friendlyError,
        details: {
          projectId: process.env.FIREBASE_PROJECT_ID || 'unknown',
          hasCredentials: !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL),
          firestoreConnected: false,
          authConnected: false,
        },
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Get user-friendly error messages
   */
  private getFriendlyErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();

    // Configuration errors
    if (message.includes('firebase_project_id')) {
      return 'FIREBASE_PROJECT_ID environment variable is missing. Please check your environment configuration.';
    }

    if (message.includes('firebase_private_key')) {
      return 'FIREBASE_PRIVATE_KEY environment variable is missing. Please check your environment configuration.';
    }

    if (message.includes('firebase_client_email')) {
      return 'FIREBASE_CLIENT_EMAIL environment variable is missing. Please check your environment configuration.';
    }

    // Authentication errors
    if (message.includes('invalid_argument') || message.includes('invalid key')) {
      return 'Invalid Firebase service account credentials. Please check your FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL.';
    }

    if (message.includes('permission denied') || message.includes('insufficient permissions')) {
      return 'Insufficient permissions. Please ensure your Firebase service account has the required permissions.';
    }

    // Network errors
    if (message.includes('network error') || message.includes('fetch failed')) {
      return 'Unable to connect to Firebase. Please check your internet connection and try again.';
    }

    if (message.includes('timeout') || message.includes('etimedout')) {
      return 'Connection to Firebase timed out. The service may be temporarily unavailable.';
    }

    // Project errors
    if (message.includes('project not found') || message.includes('404')) {
      return 'Firebase project not found. Please verify your FIREBASE_PROJECT_ID is correct.';
    }

    // Generic fallback
    return `Firebase Admin connection error: ${error.message}`;
  }

  /**
   * Get connection status for debugging
   */
  async getConnectionStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connection: ConnectionValidationResult;
      services: {
        firestore: boolean;
        auth: boolean;
      };
    };
  }> {
    try {
      const connection = await this.validateConnection();
      
      const services = {
        firestore: !!this.firestore,
        auth: !!this.auth,
      };

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (connection.isValid && services.firestore) {
        status = 'healthy';
      } else if (connection.isValid && !services.firestore) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          connection,
          services,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: {
            isValid: false,
            error: (error as Error).message,
          },
          services: {
            firestore: false,
            auth: false,
          },
        }
      };
    }
  }

  /**
   * Reset connection validation cache
   */
  resetValidationCache(): void {
    this.connectionValidated = false;
    this.lastValidationTime = 0;
    console.log('Firebase Admin connection validation cache reset');
  }

  /**
   * Get configuration summary (safe for logging)
   */
  getConfigurationSummary(): {
    projectId: string;
    hasPrivateKey: boolean;
    hasClientEmail: boolean;
    isInitialized: boolean;
  } {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || 'not-configured',
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      isInitialized: !!this.app,
    };
  }
}

// Export singleton instance
export const firebaseAdmin = FirebaseAdminService.getInstance();

// Export individual services for convenience
export const getFirestoreAdmin = () => firebaseAdmin.getFirestore();
export const getAuthAdmin = () => firebaseAdmin.getAuth();
export const validateFirebaseConnection = () => firebaseAdmin.validateConnection();
export const getFirebaseConnectionStatus = () => firebaseAdmin.getConnectionStatus();
