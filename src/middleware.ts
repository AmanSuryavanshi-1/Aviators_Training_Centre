/**
 * Next.js Middleware for Admin Route Protection
 * Unified authentication using Sanity Studio only
 * Redirects unauthenticated users to /studio instead of /login
 */

import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require Sanity Studio authentication
const PROTECTED_ROUTES = ['/admin'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/studio', '/api/auth', '/api/studio'];

/**
 * Check if a route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Create redirect response to Sanity Studio
 */
function redirectToStudio(request: NextRequest): NextResponse {
  const studioUrl = new URL('/studio', request.url);
  studioUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(studioUrl);
}

/**
 * Check if user has Sanity Studio authentication
 * Comprehensive check for various Sanity session cookie patterns
 */
function hasSanityAuth(request: NextRequest): boolean {
  // Get all cookies
  const allCookies = request.cookies.getAll();
  
  // Known Sanity authentication cookie patterns
  const knownSanityCookieNames = [
    'sanity-session',
    '__sanity_auth_token',
    'sanity.auth.token',
    'sanity-auth-token',
    'sanity_auth_token',
    'sanity-studio-session',
    'sanity_studio_session',
    '__sanity_auth_state',
    'sanity.auth.state'
  ];
  
  // Look for Sanity authentication cookies
  const sanityAuthCookies = allCookies.filter(cookie => {
    const name = cookie.name.toLowerCase();
    
    // Check known cookie names first
    if (knownSanityCookieNames.includes(name)) {
      return true;
    }
    
    // Check for Sanity-related patterns
    return (
      name.startsWith('sanity') && (
        name.includes('auth') || 
        name.includes('session') || 
        name.includes('token') ||
        name.includes('user') ||
        name.includes('state')
      )
    );
  });

  // Check if we have valid auth cookies with actual values
  const hasValidAuth = sanityAuthCookies.some(cookie => {
    const value = cookie.value;
    return value && 
           value.length > 10 && 
           value !== 'undefined' && 
           value !== 'null' &&
           !value.startsWith('deleted');
  });

  // Enhanced logging for debugging (only for admin routes in development)
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 Sanity auth check:', {
      pathname: request.nextUrl.pathname,
      totalCookies: allCookies.length,
      sanityAuthCookies: sanityAuthCookies.map(c => ({ 
        name: c.name, 
        hasValue: !!c.value, 
        valueLength: c.value?.length || 0,
        valuePreview: c.value?.substring(0, 20) + '...'
      })),
      hasValidAuth,
    });
  }

  return hasValidAuth;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') && !pathname.includes('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route needs protection
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Protecting route: ${pathname}`);
  }

  // Check for Sanity Studio authentication only
  const hasSanityStudioAuth = hasSanityAuth(request);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Auth status:', { hasSanityStudioAuth });
  }
  
  if (!hasSanityStudioAuth) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ No Sanity Studio authentication found, redirecting to studio');
    }
    
    return redirectToStudio(request);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Access granted to ${pathname} - Sanity Studio auth detected`);
  }
  
  return NextResponse.next();
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};