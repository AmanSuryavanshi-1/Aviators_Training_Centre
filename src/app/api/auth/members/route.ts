/**
 * Members API Route
 * Handles Sanity project member management
 */

import { NextRequest, NextResponse } from 'next/server';
import { memberValidationService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // This endpoint requires authentication
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session
    const validation = await memberValidationService.validateSession(accessToken);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    if (validation.user!.role !== 'administrator') {
      return NextResponse.json(
        { error: 'Administrator access required' },
        { status: 403 }
      );
    }

    // Get authorized members
    const members = await memberValidationService.getAuthorizedMembers();

    return NextResponse.json({
      success: true,
      members: members.map(member => ({
        id: member.id,
        email: member.email,
        displayName: member.displayName,
        role: member.role,
        isActive: member.isActive,
        addedDate: member.addedDate,
        lastActive: member.lastActive,
      })),
    });

  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email } = body;

    // This endpoint requires authentication
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session
    const validation = await memberValidationService.validateSession(accessToken);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    if (validation.user!.role !== 'administrator') {
      return NextResponse.json(
        { error: 'Administrator access required' },
        { status: 403 }
      );
    }

    if (action === 'check') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      const isAuthorized = await memberValidationService.isEmailAuthorized(email);
      const role = await memberValidationService.getMemberRole(email);

      return NextResponse.json({
        success: true,
        isAuthorized,
        role,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}