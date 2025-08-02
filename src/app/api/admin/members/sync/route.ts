/**
 * Members Sync API Endpoint
 * Synchronizes member data with Sanity project
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanityMemberService } from '@/lib/auth/sanityMemberService';
import { securityLogger } from '@/lib/logging/securityLogger';
import { jwtService } from '@/lib/auth/jwtService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let currentUser;
    try {
      currentUser = jwtService.verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has admin permissions
    if (currentUser.role !== 'Administrator') {
      await securityLogger.logUnauthorizedAccess(
        '/api/admin/members/sync',
        'POST',
        {
          userId: currentUser.userId,
          email: currentUser.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      );
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Log admin action
    await securityLogger.logAdminAccess(
      currentUser.userId,
      currentUser.email,
      '/api/admin/members/sync',
      {
        action: 'member_sync',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // Perform sync
    const syncStartTime = Date.now();
    
    try {
      // Invalidate cache to force fresh fetch
      sanityMemberService.invalidateCache();
      
      // Fetch fresh member data
      const members = await sanityMemberService.fetchMembers();
      
      const syncDuration = Date.now() - syncStartTime;
      
      // Log successful sync
      console.log(`✅ Member sync completed in ${syncDuration}ms`);
      console.log(`   - Found ${members.length} members`);
      console.log(`   - Active: ${members.filter(m => m.isActive).length}`);
      console.log(`   - Administrators: ${members.filter(m => m.role === 'Administrator').length}`);
      console.log(`   - Editors: ${members.filter(m => m.role === 'Editor').length}`);

      return NextResponse.json({
        success: true,
        message: 'Member data synchronized successfully',
        data: {
          memberCount: members.length,
          activeMembers: members.filter(m => m.isActive).length,
          administrators: members.filter(m => m.role === 'Administrator').length,
          editors: members.filter(m => m.role === 'Editor').length,
          syncDuration,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (syncError) {
      console.error('Member sync failed:', syncError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to sync member data',
        details: syncError instanceof Error ? syncError.message : 'Unknown error',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Members sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}