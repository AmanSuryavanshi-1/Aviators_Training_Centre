import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { rateLimit } from '@/lib/utils/rate-limit';
import { validateAdminConfig, getEnvironmentSpecificConfig } from '@/lib/auth/adminConfig';

// Enhanced rate limiter for login attempts
const loginLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per windowMs
});

// Progressive delay for failed attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

function getProgressiveDelay(identifier: string): number {
  const attempts = failedAttempts.get(identifier);
  if (!attempts) return 0;
  
  // Progressive delay: 1s, 2s, 4s, 8s, 16s...
  return Math.min(Math.pow(2, attempts.count - 1) * 1000, 30000); // Max 30 seconds
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  // Reset count if last attempt was more than 15 minutes ago
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 1;
  } else {
    attempts.count++;
  }
  
  attempts.lastAttempt = now;
  failedAttempts.set(identifier, attempts);
}

function clearFailedAttempts(identifier: string) {
  failedAttempts.delete(identifier);
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Apply rate limiting (temporarily more lenient for testing)
    try {
      await loginLimiter.check(50, identifier); // 50 attempts per 15 minutes (increased for testing)
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again later.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }

    // Apply progressive delay for failed attempts (reduced for testing)
    const delay = Math.min(getProgressiveDelay(identifier), 1000); // Max 1 second delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Validate configuration
    const configValidation = validateAdminConfig();
    if (!configValidation.valid) {
      console.error('Admin configuration invalid:', configValidation.errors);
      
      const envConfig = getEnvironmentSpecificConfig();
      const errorMessage = envConfig.detailedErrors 
        ? `Configuration errors: ${configValidation.errors.join(', ')}`
        : 'Server configuration error. Please contact administrator.';
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          code: 'CONFIG_ERROR',
          ...(envConfig.detailedErrors && { details: configValidation.errors })
        },
        { status: 500 }
      );
    }

    const { username: adminUsername, password: adminPassword } = configValidation.config!;

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username and password are required.',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Debug logging (remove in production)
    console.log('Login attempt:', {
      providedUsername: username,
      expectedUsername: adminUsername,
      providedPassword: password ? '[PROVIDED]' : '[MISSING]',
      expectedPassword: adminPassword ? '[SET]' : '[MISSING]',
      usernameMatch: username === adminUsername,
      passwordMatch: password === adminPassword
    });

    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      // Record failed attempt for progressive delay
      recordFailedAttempt(identifier);
      
      console.log('Login failed - credentials mismatch');
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid credentials.',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(identifier);

    // Create JWT session token using validated config
    const secret = new TextEncoder().encode(configValidation.config.jwtSecret);
    const envConfig = getEnvironmentSpecificConfig();
    const sessionDuration = envConfig.sessionDuration;
    const token = await new SignJWT({ 
      username: adminUsername,
      role: 'admin',
      loginTime: Date.now()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + sessionDuration)
      .sign(secret);

    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        redirectUrl: '/studio/admin'
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie with environment-specific settings
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: envConfig.cookieSecure,
      sameSite: envConfig.cookieSameSite,
      maxAge: sessionDuration,
      path: '/' // Changed from '/studio/admin' to '/' for broader access
    });

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during login. Please try again.',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}