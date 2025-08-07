// Firebase Admin SDK Configuration for Server-Side Operations
// Updated to use enhanced FirebaseAuthHandler for improved authentication

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { FirebaseAuthHandler } from '../analytics/FirebaseAuthHandler';
import { errorHandler } from '../analytics/ErrorHandler';

let adminApp: App;
let adminFirestore: Firestore;
let authHandler: FirebaseAuthHandler | null = null;

// Initialize Firebase Auth Handler
function getAuthHandler(): FirebaseAuthHandler {
  if (!authHandler) {
    authHandler = new FirebaseAuthHandler();
  }
  return authHandler;
}

// Initialize Firebase Admin SDK with enhanced authentication
async function initializeFirebaseAdmin(): Promise<App> {
  try {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      return adminApp;
    }

    // Use the enhanced auth handler for initialization
    const handler = getAuthHandler();
    adminApp = await handler.initializeAdmin();
    
    return adminApp;
  } catch (error) {
    const authError = errorHandler.createErrorResponse(error, {
      service: 'firebase',
      operation: 'initialize_admin',
      timestamp: new Date()
    });

    console.error('❌ Failed to initialize Firebase Admin with enhanced auth:', authError.userMessage);
    
    // Fallback to legacy initialization for backward compatibility
    return initializeFirebaseAdminLegacy();
  }
}

// Legacy Firebase Admin initialization (fallback)
function initializeFirebaseAdminLegacy(): App {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Missing required Firebase Admin SDK environment variables');
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

// Get Admin Firestore instance with enhanced authentication
export async function getAdminFirestore(): Promise<Firestore> {
  if (!adminFirestore) {
    try {
      // Try to use enhanced auth handler first
      const handler = getAuthHandler();
      adminFirestore = await handler.getFirestore();
    } catch (error) {
      console.warn('Enhanced Firestore initialization failed, using legacy method:', error);
      
      // Fallback to legacy initialization
      const app = await initializeFirebaseAdmin();
      adminFirestore = getFirestore(app);
    }
  }
  return adminFirestore;
}

// Synchronous version for backward compatibility
export function getAdminFirestoreSync(): Firestore {
  if (!adminFirestore) {
    const app = initializeFirebaseAdminLegacy();
    adminFirestore = getFirestore(app);
  }
  return adminFirestore;
}

// Initialize admin app with enhanced authentication
export async function getAdminApp(): Promise<App> {
  if (!adminApp) {
    adminApp = await initializeFirebaseAdmin();
  }
  return adminApp;
}

// Synchronous version for backward compatibility
export function getAdminAppSync(): App {
  if (!adminApp) {
    adminApp = initializeFirebaseAdminLegacy();
  }
  return adminApp;
}

// Export aliases for compatibility
export const getFirestoreAdmin = getAdminFirestore;
export const db = getAdminFirestoreSync(); // Keep synchronous for existing code

// Enhanced connection status check with authentication validation
export async function getFirebaseConnectionStatus() {
  try {
    const handler = getAuthHandler();
    
    // Test authentication status
    const authStatus = await handler.getAuthStatus();
    
    if (!authStatus.initialized) {
      return {
        status: 'not_initialized',
        error: authStatus.error || 'Firebase Admin not initialized',
        timestamp: new Date().toISOString(),
        authStatus
      };
    }

    // Test Firestore connection
    const firestore = await getAdminFirestore();
    await firestore.collection('_health_check').limit(1).get();
    
    return {
      status: 'connected',
      timestamp: new Date().toISOString(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authStatus,
      permissions: authStatus.permissions
    };
  } catch (error) {
    const authError = errorHandler.createErrorResponse(error, {
      service: 'firebase',
      operation: 'connection_status',
      timestamp: new Date()
    });

    return {
      status: 'disconnected',
      error: authError.userMessage,
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test Firebase permissions
export async function testFirebasePermissions(): Promise<{
  firestore: boolean;
  analytics: boolean;
  error?: string;
}> {
  try {
    const handler = getAuthHandler();
    const permissions = await handler.validatePermissions();
    
    return {
      firestore: permissions.firestore,
      analytics: permissions.analytics,
    };
  } catch (error) {
    const authError = errorHandler.createErrorResponse(error, {
      service: 'firebase',
      operation: 'test_permissions',
      timestamp: new Date()
    });

    return {
      firestore: false,
      analytics: false,
      error: authError.userMessage
    };
  }
}

// Refresh Firebase authentication
export async function refreshFirebaseAuth(): Promise<boolean> {
  try {
    const handler = getAuthHandler();
    const refreshed = await handler.refreshAuth();
    
    if (refreshed) {
      // Clear cached instances to force reinitialization
      adminApp = null as any;
      adminFirestore = null as any;
    }
    
    return refreshed;
  } catch (error) {
    console.error('Failed to refresh Firebase authentication:', error);
    return false;
  }
}

export { adminApp, adminFirestore };