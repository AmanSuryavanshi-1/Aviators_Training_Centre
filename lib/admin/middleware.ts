import { NextRequest, NextResponse } from 'next/server';
import { adminErrorHandler } from './error-handler';
import { BlogHealthChecker } from '@/lib/blog/error-handling';

// Admin middleware for error handling and health checks
export async function adminMiddleware(request: NextRequest) {
  try {
    // Check if this is an admin route
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // Perform basic health check for admin routes
    const healthCheck = await BlogHealthChecker.performHealthCheck();
    
    // If system is severely degraded, show maintenance page
    if (!healthCheck.overall && healthCheck.services.fallbackMode) {
      return NextResponse.redirect(new URL('/admin/maintenance', request.url));
    }

    // Add health status to response headers for admin pages
    const response = NextResponse.next();
    response.headers.set('X-System-Health', healthCheck.overall ? 'healthy' : 'degraded');
    response.headers.set('X-Fallback-Mode', healthCheck.services.fallbackMode ? 'true' : 'false');
    
    return response;
  } catch (error) {
    // Log middleware error
    adminErrorHandler.logError(error as Error, {
      component: 'AdminMiddleware',
      operation: 'request_processing',
      severity: 'high',
      additionalContext: {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    });

    // Continue with request even if health check fails
    return NextResponse.next();
  }
}

// Error boundary wrapper for admin API routes
export function withAdminErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: {
    component: string;
    operation: string;
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      adminErrorHandler.logError(error as Error, {
        component: context.component,
        operation: context.operation,
        severity: 'high',
        additionalContext: { args },
      });

      // Re-throw the error to be handled by the calling code
      throw error;
    }
  };
}

// Safe admin operation wrapper
export async function safeAdminOperation<T>(
  operation: () => Promise<T>,
  context: {
    component: string;
    operation: string;
    fallback?: T;
  }
): Promise<{ success: boolean; data?: T; error?: string }> {
  return adminErrorHandler.safeAdminOperation(
    operation,
    {
      component: context.component,
      operation: context.operation,
      fallback: context.fallback ? () => context.fallback! : undefined,
    }
  );
}

// Admin request validator
export function validateAdminRequest(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  try {
    // Basic validation
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return { valid: false, error: 'Not an admin route' };
    }

    // Check for required headers in API requests
    if (request.nextUrl.pathname.startsWith('/admin/api/')) {
      const contentType = request.headers.get('content-type');
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        if (!contentType || !contentType.includes('application/json')) {
          return { valid: false, error: 'Invalid content type' };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Validation error' };
  }
}

// Rate limiting for admin operations
class AdminRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 100; // per minute
  private readonly windowMs = 60 * 1000; // 1 minute

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (userRequests.count >= this.maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - userRequests.count);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return Date.now() + this.windowMs;
    }
    return userRequests.resetTime;
  }
}

export const adminRateLimiter = new AdminRateLimiter();

// Admin response wrapper with error handling
export function createAdminResponse<T>(
  data: T,
  options: {
    status?: number;
    headers?: Record<string, string>;
    cache?: boolean;
  } = {}
): NextResponse {
  const { status = 200, headers = {}, cache = false } = options;

  const response = NextResponse.json(data, { status });

  // Add standard admin headers
  response.headers.set('X-Admin-Response', 'true');
  response.headers.set('X-Timestamp', new Date().toISOString());

  // Add cache control
  if (!cache) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Admin error response
export function createAdminErrorResponse(
  error: string | Error,
  options: {
    status?: number;
    code?: string;
    details?: any;
  } = {}
): NextResponse {
  const { status = 500, code = 'ADMIN_ERROR', details } = options;

  const errorMessage = error instanceof Error ? error.message : error;

  return createAdminResponse(
    {
      success: false,
      error: {
        message: errorMessage,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
    },
    { status, cache: false }
  );
}