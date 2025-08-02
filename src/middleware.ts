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
 * This is a simplified check - in production you'd validate the actual session
 */
function hasSanityAuth(request: NextRequest): boolean {
  // Check for Sanity session cookies
  const sanitySession = request.cookies.get('sanity-session')?.value ||
                       request.cookies.get('__sanity_auth_token')?.value ||
                       request.cookies.get('sanity.auth.token')?.value;
  
  return !!sanitySession;
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

  // Check for Sanity Studio authentication
  if (!hasSanityAuth(request)) {
    console.log('❌ No Sanity authentication found, redirecting to login');
    return redirectToLogin(request);
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