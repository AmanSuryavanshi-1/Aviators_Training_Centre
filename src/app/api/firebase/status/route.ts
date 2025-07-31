import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseConnectionStatus } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const connectionStatus = await getFirebaseConnectionStatus();
    
    return NextResponse.json({
      success: true,
      data: connectionStatus
    });
  } catch (error) {
    console.error('Firebase status check failed:', error);
    
    // Check if it's a configuration error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isConfigError = errorMessage.includes('environment variable') || 
                         errorMessage.includes('YOUR_PRIVATE_KEY_HERE') ||
                         errorMessage.includes('firebase-adminsdk-xxxxx');
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'unhealthy',
        details: {
          connection: {
            isValid: false,
            error: isConfigError ? 'Firebase credentials not configured' : errorMessage
          },
          services: {
            firestore: false,
            auth: false
          }
        }
      },
      error: {
        message: isConfigError ? 'Firebase credentials not configured. Please set up FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env.local' : errorMessage,
        status: 'unhealthy',
        isConfigurationError: isConfigError
      }
    }, { status: isConfigError ? 200 : 500 }); // Return 200 for config errors since it's expected in dev
  }
}
