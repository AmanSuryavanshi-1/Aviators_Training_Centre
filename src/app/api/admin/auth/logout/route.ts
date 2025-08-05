import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logout successful' 
      },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.delete('admin-session');
    
    // Also set an expired cookie to ensure it's cleared across all browsers
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/studio/admin',
      expires: new Date(0)
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during logout.',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}