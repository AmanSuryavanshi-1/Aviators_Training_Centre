/**
 * Logout API Route
 * Handles user logout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/auth';
import { memberValidationService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Processing logout request');

    // Get tokens from cookies
    const accessToken = request.cookies.get('admin_access_token')?.value;
    const refreshToken = request.cookies.get('admin_refresh_token')?.value;

    // Revoke tokens if they exist
    if (accessToken || refreshToken) {
      await memberValidationService.logoutUser(accessToken || '', refreshToken);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookies
    await sessionService.clearSession(response);

    console.log('✅ Logout successful');

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, clear the session
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    await sessionService.clearSession(response);

    return response;
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}