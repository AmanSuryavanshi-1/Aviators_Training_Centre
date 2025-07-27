import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple basic auth for admin routes
// In production, you should use a proper authentication system
export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');
    const url = request.nextUrl;

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Simple credentials - in production, use environment variables and proper hashing
      const validUser = process.env.ADMIN_USERNAME || 'admin';
      const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (user === validUser && pwd === validPassword) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/auth';

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};