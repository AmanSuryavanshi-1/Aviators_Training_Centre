/**
 * Session API Route
 * Handles session validation and refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/auth';
import { memberValidationService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies
    const session = await sessionService.getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Validate the session
    const validation = await memberValidationService.validateSession(session.accessToken);

    if (!validation.isValid) {
      // Try to refresh the token
      const refreshResult = await memberValidationService.refreshUserSession(session.refreshToken);

      if (!refreshResult.success) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }

      // Update session with new tokens
      const response = NextResponse.json({
        success: true,
        user: {
          id: refreshResult.user!.id,
          email: refreshResult.user!.email,
          name: refreshResult.user!.name,
          role: refreshResult.user!.role,
        },
        expiresAt: Date.now() + (refreshResult.tokens!.expiresIn * 1000),
      });

      await sessionService.updateSession(response, refreshResult.tokens!, refreshResult.user);

      return response;
    }

    // Return current session info
    return NextResponse.json({
      success: true,
      user: {
        id: validation.user!.id,
        email: validation.user!.email,
        name: validation.user!.name,
        role: validation.user!.role,
      },
      expiresAt: validation.user!.sessionExpiry,
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Get refresh token from cookies
      const refreshToken = request.cookies.get('admin_refresh_token')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { error: 'No refresh token available' },
          { status: 401 }
        );
      }

      // Refresh the session
      const refreshResult = await memberValidationService.refreshUserSession(refreshToken);

      if (!refreshResult.success) {
        return NextResponse.json(
          { error: refreshResult.error || 'Failed to refresh session' },
          { status: 401 }
        );
      }

      // Update session with new tokens
      const response = NextResponse.json({
        success: true,
        user: {
          id: refreshResult.user!.id,
          email: refreshResult.user!.email,
          name: refreshResult.user!.name,
          role: refreshResult.user!.role,
        },
        expiresAt: Date.now() + (refreshResult.tokens!.expiresIn * 1000),
      });

      await sessionService.updateSession(response, refreshResult.tokens!, refreshResult.user);

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Session refresh API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}