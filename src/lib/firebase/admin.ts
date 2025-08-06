// Firebase Admin SDK Configuration for Server-Side Operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminFirestore: Firestore;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): App {
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

// Get Admin Firestore instance
export function getAdminFirestore(): Firestore {
  if (!adminFirestore) {
    const app = initializeFirebaseAdmin();
    adminFirestore = getFirestore(app);
  }
  return adminFirestore;
}

// Initialize admin app
export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
}

// Export aliases for compatibility
export const getFirestoreAdmin = getAdminFirestore;
export const db = getAdminFirestore();

// Connection status check
export async function getFirebaseConnectionStatus() {
  try {
    const firestore = getAdminFirestore();
    // Simple test query to check connection
    await firestore.collection('_health_check').limit(1).get();
    return {
      status: 'connected',
      timestamp: new Date().toISOString(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export { adminApp, adminFirestore };