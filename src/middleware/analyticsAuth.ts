import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/auth/adminAuth';

/**
 * Middleware to protect analytics routes
 * Ensures only authenticated admin users can access analytics
 */
export async function analyticsAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to analytics routes
  if (!pathname.startsWith('/analytics')) {
    return NextResponse.next();
  }

  try {
    // Validate admin session
    const session = await validateAdminSession();

    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/studio/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check analytics permission
    if (!session.permissions?.includes('analytics') && session.role !== 'admin') {
      // Redirect to unauthorized page
      const unauthorizedUrl = new URL('/studio/admin/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Add user context to headers for client-side access
    const response = NextResponse.next();
    response.headers.set('X-User-ID', session.id);
    response.headers.set('X-User-Role', session.role);
    response.headers.set('X-User-Permissions', session.permissions?.join(',') || '');

    return response;

  } catch (error) {
    console.error('Analytics auth middleware error:', error);
    
    // Redirect to login on error
    const loginUrl = new URL('/studio/admin/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    loginUrl.searchParams.set('error', 'auth_error');
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Check if request is for analytics API endpoints
 */
export function isAnalyticsApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/analytics');
}

/**
 * Middleware for analytics API routes
 */
export async function analyticsApiAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAnalyticsApiRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Validate admin session for API routes
    const session = await validateAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check analytics permission for API access
    if (!session.permissions?.includes('analytics') && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user context to headers
    const response = NextResponse.next();
    response.headers.set('X-User-ID', session.id);
    response.headers.set('X-User-Role', session.role);
    response.headers.set('X-User-Permissions', session.permissions?.join(',') || '');

    return response;

  } catch (error) {
    console.error('Analytics API auth middleware error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 500 }
    );
  }
}

/**
 * Combined middleware function
 */
export function createAnalyticsAuthMiddleware() {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // Handle API routes
    if (isAnalyticsApiRoute(pathname)) {
      return analyticsApiAuthMiddleware(request);
    }

    // Handle page routes
    if (pathname.startsWith('/analytics')) {
      return analyticsAuthMiddleware(request);
    }

    // Pass through other routes
    return NextResponse.next();
  };
}