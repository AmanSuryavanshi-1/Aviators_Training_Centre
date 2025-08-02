/**
 * Login API Route
 * Handles user authentication with Sanity member validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { memberValidationService } from '@/lib/auth';
import { sessionService } from '@/lib/auth';
import { securityService } from '@/lib/security/securityConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, provider = 'email' } = body;

    // Validate required fields
    if (!email) {
      const response = NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
      return securityService.applyAllSecurityHeaders(request, response);
    }

    console.log(`🔐 Login attempt for: ${email}`);

    // Authenticate user
    const authResult = await memberValidationService.authenticateUser({
      email,
      password,
      provider,
    });

    if (!authResult.success) {
      console.log(`❌ Authentication failed for ${email}: ${authResult.error}`);
      const response = NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
      return securityService.applyAllSecurityHeaders(request, response);
    }

    const { user, tokens } = authResult;

    if (!user || !tokens) {
      const response = NextResponse.json(
        { error: 'Authentication failed - invalid response' },
        { status: 500 }
      );
      return securityService.applyAllSecurityHeaders(request, response);
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      expiresAt: Date.now() + (tokens.expiresIn * 1000),
    });

    // Set secure session cookies
    await sessionService.createSession(response, user, tokens);

    console.log(`✅ Login successful for: ${email} (${user.role})`);

    // Apply security headers
    return securityService.applyAllSecurityHeaders(request, response);

  } catch (error) {
    console.error('Login API error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return securityService.applyAllSecurityHeaders(request, response);
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
  return securityService.applyAllSecurityHeaders(request, response);
}