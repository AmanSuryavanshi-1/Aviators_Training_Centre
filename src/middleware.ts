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
 * More comprehensive check for Sanity session cookies
 */
function hasSanityAuth(request: NextRequest): boolean {
  // Get all cookies
  const allCookies = request.cookies.getAll();
  
  // Look for Sanity authentication cookies with various naming patterns
  const sanityAuthCookies = allCookies.filter(cookie => {
    const name = cookie.name.toLowerCase();
    return (
      // Common Sanity cookie patterns
      name.includes('sanity') && (
        name.includes('auth') || 
        name.includes('session') || 
        name.includes('token')
      )
    ) || (
      // Specific known Sanity cookie names
      name === 'sanity-session' ||
      name === '__sanity_auth_token' ||
      name === 'sanity.auth.token' ||
      name === 'sanity-auth-token' ||
      name === 'sanity_auth_token'
    );
  });

  // Check if we have valid auth cookies with actual values
  const hasValidAuth = sanityAuthCookies.some(cookie => 
    cookie.value && cookie.value.length > 10
  );

  // Log for debugging
  console.log('🔍 Auth check:', {
    totalCookies: allCookies.length,
    sanityAuthCookies: sanityAuthCookies.map(c => c.name),
    hasValidAuth,
    pathname: request.nextUrl.pathname
  });

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