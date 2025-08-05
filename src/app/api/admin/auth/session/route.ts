import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('admin-session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No session found'
        },
        { status: 200 } // Changed from 401 to 200 since this is expected behavior
      );
    }

    // Verify JWT session
    const secret = new TextEncoder().encode(
      process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-change-in-production'
    );

    try {
      const { payload } = await jwtVerify(sessionCookie.value, secret);
      
      // Check if session is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return NextResponse.json(
          { 
            authenticated: false,
            message: 'Session expired'
          },
          { status: 200 } // Changed from 401 to 200
        );
      }

      // Session is valid
      return NextResponse.json(
        { 
          authenticated: true,
          username: payload.username,
          role: payload.role,
          expiresAt: payload.exp ? payload.exp * 1000 : null, // Convert to milliseconds
          loginTime: payload.loginTime
        },
        { status: 200 }
      );

    } catch (jwtError) {
      // Invalid JWT
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'Invalid session'
        },
        { status: 200 } // Changed from 401 to 200
      );
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        message: 'Session validation failed',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}