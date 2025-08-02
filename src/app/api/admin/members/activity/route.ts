/**
 * Member Activity API Endpoint
 * Provides member activity logs and security events
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityLogger } from '@/lib/logging/securityLogger';
import { jwtService } from '@/lib/auth/jwtService';

interface MemberActivity {
  id: string;
  memberId: string;
  email: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  success: boolean;
  riskScore?: number;
  location?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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
        '/api/admin/members/activity',
        'GET',
        {
          userId: currentUser.userId,
          email: currentUser.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      );
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const memberId = url.searchParams.get('memberId');
    const action = url.searchParams.get('action');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Log admin access
    await securityLogger.logAdminAccess(
      currentUser.userId,
      currentUser.email,
      '/api/admin/members/activity',
      {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        queryParams: { limit, offset, memberId, action, startDate, endDate },
      }
    );

    // Get security events (this would typically come from your security logging system)
    const activities = await getMemberActivities({
      limit,
      offset,
      memberId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Get activity statistics
    const stats = await getActivityStatistics();

    return NextResponse.json({
      success: true,
      activities,
      stats,
      pagination: {
        limit,
        offset,
        total: activities.length,
        hasMore: activities.length === limit,
      },
    });

  } catch (error) {
    console.error('Member activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member activity' },
      { status: 500 }
    );
  }
}

/**
 * Get member activities with filtering
 */
async function getMemberActivities(filters: {
  limit: number;
  offset: number;
  memberId?: string | null;
  action?: string | null;
  startDate?: Date;
  endDate?: Date;
}): Promise<MemberActivity[]> {
  try {
    // This would typically query your security logging system
    // For now, we'll generate mock data
    const mockActivities: MemberActivity[] = [
      {
        id: 'act_1',
        memberId: 'member_1',
        email: 'admin@example.com',
        action: 'Login successful',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        riskScore: 1,
        location: 'New York, US',
      },
      {
        id: 'act_2',
        memberId: 'member_2',
        email: 'editor@example.com',
        action: 'Studio access',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        ipAddress: '192.168.1.101',
        resource: '/studio/desk/post',
        success: true,
        riskScore: 2,
        location: 'London, UK',
      },
      {
        id: 'act_3',
        memberId: 'member_1',
        email: 'admin@example.com',
        action: 'Member sync initiated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        ipAddress: '192.168.1.100',
        resource: '/api/admin/members/sync',
        success: true,
        riskScore: 3,
      },
      {
        id: 'act_4',
        memberId: 'unknown',
        email: 'unknown@example.com',
        action: 'Login failed - member validation failed',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        ipAddress: '203.0.113.1',
        success: false,
        riskScore: 7,
        location: 'Unknown',
      },
      {
        id: 'act_5',
        memberId: 'member_2',
        email: 'editor@example.com',
        action: 'Session expired',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        ipAddress: '192.168.1.101',
        success: false,
        riskScore: 2,
      },
    ];

    // Apply filters
    let filteredActivities = mockActivities;

    if (filters.memberId) {
      filteredActivities = filteredActivities.filter(a => a.memberId === filters.memberId);
    }

    if (filters.action) {
      filteredActivities = filteredActivities.filter(a => 
        a.action.toLowerCase().includes(filters.action!.toLowerCase())
      );
    }

    if (filters.startDate) {
      filteredActivities = filteredActivities.filter(a => 
        new Date(a.timestamp) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredActivities = filteredActivities.filter(a => 
        new Date(a.timestamp) <= filters.endDate!
      );
    }

    // Apply pagination
    const startIndex = filters.offset;
    const endIndex = startIndex + filters.limit;
    
    return filteredActivities.slice(startIndex, endIndex);

  } catch (error) {
    console.error('Failed to fetch member activities:', error);
    return [];
  }
}

/**
 * Get activity statistics
 */
async function getActivityStatistics(): Promise<{
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  highRiskActivities: number;
  uniqueMembers: number;
  uniqueIPs: number;
  topActions: Array<{ action: string; count: number }>;
}> {
  try {
    // This would typically aggregate data from your security logging system
    // For now, we'll return mock statistics
    return {
      totalActivities: 156,
      successfulActivities: 142,
      failedActivities: 14,
      highRiskActivities: 3,
      uniqueMembers: 8,
      uniqueIPs: 12,
      topActions: [
        { action: 'Login successful', count: 45 },
        { action: 'Studio access', count: 38 },
        { action: 'Admin access', count: 12 },
        { action: 'Login failed', count: 8 },
        { action: 'Session expired', count: 6 },
      ],
    };
  } catch (error) {
    console.error('Failed to get activity statistics:', error);
    return {
      totalActivities: 0,
      successfulActivities: 0,
      failedActivities: 0,
      highRiskActivities: 0,
      uniqueMembers: 0,
      uniqueIPs: 0,
      topActions: [],
    };
  }
}