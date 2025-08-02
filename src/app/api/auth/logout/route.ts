/**
 * Simple Logout API
 * Clears Sanity Studio session and redirects
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clear Sanity Studio session
 */
export async function POST(request: NextRequest) {
  try {
    // Create response that redirects to login
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear any potential auth cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Clear common Sanity auth cookies
    response.cookies.set('sanity-session', '', cookieOptions);
    response.cookies.set('__sanity_auth_token', '', cookieOptions);
    response.cookies.set('sanity.auth.token', '', cookieOptions);

    console.log('✅ Logout successful - cleared auth cookies');
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