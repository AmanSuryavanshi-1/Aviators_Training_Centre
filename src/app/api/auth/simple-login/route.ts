/**
 * Simple Login API for Testing
 * Creates a simple session for authorized users
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_EMAILS = [
  'amansuryavanshi2002@gmail.com',
  'adude890@gmail.com'
];

/**
 * POST /api/auth/simple-login
 * Simple login for testing
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Check if email is authorized
    if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: 'Email not authorized'
      }, { status: 403 });
    }

    // Create simple session
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email,
        name: email.split('@')[0],
        role: 'administrator'
      }
    });

    // Set simple session cookie
    response.cookies.set('simple_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Simple login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 });
  }
}