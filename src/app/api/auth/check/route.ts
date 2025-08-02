/**
 * Authentication Check API
 * Validates if user is authenticated with Sanity Studio
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/check
 * Check if user has valid authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get all cookies for debugging
    const allCookies = request.cookies.getAll();
    console.log('🍪 Checking cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

    // Check for Sanity authentication cookies
    const sanityAuthCookies = allCookies.filter(cookie => 
      cookie.name.toLowerCase().includes('sanity') && 
      (cookie.name.toLowerCase().includes('auth') || 
       cookie.name.toLowerCase().includes('session') ||
       cookie.name.toLowerCase().includes('token'))
    );

    const isAuthenticated = sanityAuthCookies.length > 0 && 
                           sanityAuthCookies.some(cookie => cookie.value && cookie.value.length > 10);

    console.log('🔍 Auth check result:', { 
      isAuthenticated, 
      sanityAuthCookies: sanityAuthCookies.map(c => c.name) 
    });

    return NextResponse.json({
      authenticated: isAuthenticated,
      cookiesFound: sanityAuthCookies.map(c => c.name),
      totalCookies: allCookies.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Auth check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}