/**
 * Next.js Middleware for Admin Route Protection
 * Uses Sanity Studio authentication for admin access
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
 * Create redirect response to login
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Check if user has Sanity Studio authentication
 * Comprehensive check for various Sanity session cookie patterns
 */
function hasSanityAuth(request: NextRequest): boolean {
  // Get all cookies
  const allCookies = request.cookies.getAll();
  
  // Look for Sanity authentication cookies with various naming patterns
  const sanityAuthCookies = allCookies.filter(cookie => {
    const name = cookie.name.toLowerCase();
    return (
      // Sanity Studio session cookies (most common patterns)
      name.startsWith('sanity') ||
      name.includes('sanity') && (
        name.includes('auth') || 
        name.includes('session') || 
        name.includes('token') ||
        name.includes('user')
      ) ||
      // Specific known Sanity cookie names
      [
        'sanity-session',
        '__sanity_auth_token',
        'sanity.auth.token',
        'sanity-auth-token',
        'sanity_auth_token',
        'sanity-studio-session',
        'sanity_studio_session'
      ].includes(name)
    );
  });

  // Check if we have valid auth cookies with actual values
  const hasValidAuth = sanityAuthCookies.some(cookie => 
    cookie.value && cookie.value.length > 10 && cookie.value !== 'undefined'
  );

  // Enhanced logging for debugging
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 Detailed auth check:', {
      pathname: request.nextUrl.pathname,
      totalCookies: allCookies.length,
      allCookieNames: allCookies.map(c => c.name),
      sanityAuthCookies: sanityAuthCookies.map(c => ({ 
        name: c.name, 
        hasValue: !!c.value, 
        valueLength: c.value?.length || 0 
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

  console.log(`🔐 Protecting route: ${pathname}`);

  // Check for authentication (Sanity Studio or simple session)
  const hasSanityStudioAuth = hasSanityAuth(request);
  const hasSimpleSession = request.cookies.get('simple_admin_session')?.value === 'authenticated';
  
  const hasAuth = hasSanityStudioAuth || hasSimpleSession;
  
  console.log('🔍 Auth status:', { hasSanityStudioAuth, hasSimpleSession, hasAuth });
  
  if (!hasAuth) {
    console.log('❌ No authentication found, redirecting to login');
    
    // Add debug info to redirect URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('debug', 'no-auth');
    
    return NextResponse.redirect(loginUrl);
  }

  console.log(`✅ Access granted to ${pathname} - Sanity auth detected`);
  
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