/**
 * Sanity Studio Logout API
 * Clears Sanity Studio session cookies
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clear Sanity Studio session and redirect to studio
 */
export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirectTo: '/studio'
    });

    // Clear any potential Sanity auth cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Clear all known Sanity auth cookie patterns
    const sanityCookieNames = [
      'sanity-session',
      '__sanity_auth_token',
      'sanity.auth.token',
      'sanity-auth-token',
      'sanity_auth_token',
      'sanity-studio-session',
      'sanity_studio_session'
    ];

    sanityCookieNames.forEach(cookieName => {
      response.cookies.set(cookieName, '', cookieOptions);
    });

    console.log('✅ Sanity Studio logout successful - cleared auth cookies');
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}