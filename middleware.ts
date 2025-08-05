import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Admin authentication middleware
export async function middleware(request: NextRequest) {
  // Only apply to /studio/admin/* routes
  if (!request.nextUrl.pathname.startsWith('/studio/admin')) {
    return NextResponse.next();
  }

  // Skip authentication for login page and API endpoints
  if (request.nextUrl.pathname === '/studio/admin/login' || 
      request.nextUrl.pathname.startsWith('/api/admin/auth') ||
      request.nextUrl.pathname.startsWith('/api/analytics')) {
    console.log('Middleware: Skipping auth for', request.nextUrl.pathname);
    return NextResponse.next();
  }

  console.log('Middleware: Checking auth for', request.nextUrl.pathname);

  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('admin-session');
    
    console.log('Middleware: Session cookie present:', !!sessionCookie);
    
    if (!sessionCookie) {
      console.log('Middleware: No session cookie, redirecting to login');
      return redirectToLogin(request);
    }

    // Verify JWT session
    const secret = new TextEncoder().encode(
      process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-change-in-production'
    );

    try {
      const { payload } = await jwtVerify(sessionCookie.value, secret);
      
      // Check if session is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return redirectToLogin(request);
      }

      // Session is valid, continue to the requested page
      const response = NextResponse.next();
      
      // Add user info to headers for the page to use
      response.headers.set('X-Admin-User', payload.username as string);
      response.headers.set('X-Admin-Authenticated', 'true');
      
      // Add security headers
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } catch (jwtError) {
      // Invalid JWT, redirect to login
      return redirectToLogin(request);
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    // On error, redirect to login for security
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/studio/admin/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  
  const response = NextResponse.redirect(loginUrl);
  
  // Clear any existing session cookie
  response.cookies.delete('admin-session');
  
  return response;
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/studio/admin/:path*'
  ]
}