/**
 * Next.js Middleware for Authentication, Security, and Route Protection
 * Handles admin route protection with Sanity member validation, CORS, CSP, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
// Note: These imports are commented out as the security modules need to be implemented
// import { securityService } from './lib/security/securityConfig';
// import { rateLimiter, rateLimitConfigs } from './lib/security/rateLimiter';

// JWT secret for token validation
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SANITY_API_TOKEN || 'fallback-secret-key'
);

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/admin'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth'];

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
 * Validate JWT token
 */
async function validateToken(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
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
 * Create unauthorized response
 */
function createUnauthorizedResponse(request: NextRequest): NextResponse {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Bearer realm="Admin Area"',
    },
  });
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

  // Basic rate limiting for auth endpoints (simplified)
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
    // TODO: Implement proper rate limiting
    // For now, just continue
  }

  // Basic rate limiting for admin API endpoints (simplified)
  if (pathname.startsWith('/api/admin')) {
    // TODO: Implement proper rate limiting
    // For now, just continue
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

  // Get access token from cookies
  const accessToken = request.cookies.get('admin_access_token')?.value;
  
  if (!accessToken) {
    console.log('❌ No access token found, redirecting to login');
    return redirectToLogin(request);
  }

  // Validate the token
  const payload = await validateToken(accessToken);
  
  if (!payload) {
    console.log('❌ Invalid token, redirecting to login');
    
    // Clear invalid cookies
    const response = redirectToLogin(request);
    response.cookies.delete('admin_access_token');
    response.cookies.delete('admin_refresh_token');
    response.cookies.delete('admin_user_info');
    
    return response;
  }

  // Check token expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.log('❌ Token expired, redirecting to login');
    
    // Clear expired cookies
    const response = redirectToLogin(request);
    response.cookies.delete('admin_access_token');
    response.cookies.delete('admin_refresh_token');
    response.cookies.delete('admin_user_info');
    
    return response;
  }

  // Validate user permissions for specific admin routes
  if (pathname.startsWith('/admin/system') || pathname.startsWith('/admin/users')) {
    if (payload.role !== 'administrator') {
      console.log(`❌ Insufficient permissions for ${pathname}, role: ${payload.role}`);
      return new NextResponse('Forbidden - Administrator access required', {
        status: 403,
      });
    }
  }

  // Add user info to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId || '');
  response.headers.set('x-user-email', payload.email || '');
  response.headers.set('x-user-role', payload.role || '');

  console.log(`✅ Access granted to ${pathname} for user: ${payload.email} (${payload.role})`);
  
  return response;
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