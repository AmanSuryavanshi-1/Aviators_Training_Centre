/**
 * Members API Endpoint
 * Provides member data and statistics for the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanityMemberService } from '@/lib/auth/sanityMemberService';
import { securityLogger } from '@/lib/logging/securityLogger';
import { jwtService } from '@/lib/auth/jwtService';

interface MemberWithStats {
  _id: string;
  email: string;
  name: string;
  role: 'Administrator' | 'Editor';
  isActive: boolean;
  lastActive?: string;
  joinedAt?: string;
  permissions: string[];
  sessionCount?: number;
  lastLoginIp?: string;
  lastLoginLocation?: string;
}

interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  administrators: number;
  editors: number;
  recentLogins: number;
  suspiciousActivity: number;
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
        '/api/admin/members',
        'GET',
        {
          userId: currentUser.userId,
          email: currentUser.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      );
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Log admin access
    await securityLogger.logAdminAccess(
      currentUser.userId,
      currentUser.email,
      '/api/admin/members',
      {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // Fetch members from Sanity
    const sanityMembers = await sanityMemberService.fetchMembers();
    
    // Enhance members with additional data
    const membersWithStats: MemberWithStats[] = await Promise.all(
      sanityMembers.map(async (member) => {
        // Get session data (this would come from your session storage)
        const sessionData = await getSessionDataForMember(member._id);
        
        return {
          ...member,
          sessionCount: sessionData.sessionCount,
          lastLoginIp: sessionData.lastLoginIp,
          lastLoginLocation: sessionData.lastLoginLocation,
          permissions: getPermissionsForRole(member.role),
        };
      })
    );

    // Calculate statistics
    const stats: MemberStats = {
      total: membersWithStats.length,
      active: membersWithStats.filter(m => m.isActive).length,
      inactive: membersWithStats.filter(m => !m.isActive).length,
      administrators: membersWithStats.filter(m => m.role === 'Administrator').length,
      editors: membersWithStats.filter(m => m.role === 'Editor').length,
      recentLogins: await getRecentLoginsCount(),
      suspiciousActivity: await getSuspiciousActivityCount(),
    };

    return NextResponse.json({
      success: true,
      members: membersWithStats,
      stats,
    });

  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * Get session data for a member
 */
async function getSessionDataForMember(memberId: string): Promise<{
  sessionCount: number;
  lastLoginIp?: string;
  lastLoginLocation?: string;
}> {
  try {
    // This would typically query your session storage/database
    // For now, we'll return mock data
    return {
      sessionCount: Math.floor(Math.random() * 10),
      lastLoginIp: '192.168.1.' + Math.floor(Math.random() * 255),
      lastLoginLocation: 'Unknown',
    };
  } catch (error) {
    return {
      sessionCount: 0,
    };
  }
}

/**
 * Get permissions for a role
 */
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'Administrator':
      return [
        'read',
        'write',
        'admin',
        'manage_members',
        'manage_settings',
        'view_analytics',
        'export_data',
      ];
    case 'Editor':
      return [
        'read',
        'write',
        'view_analytics',
      ];
    default:
      return ['read'];
  }
}

/**
 * Get recent logins count
 */
async function getRecentLoginsCount(): Promise<number> {
  try {
    // This would query your security logs for recent successful logins
    // For now, return a mock count
    return Math.floor(Math.random() * 20);
  } catch (error) {
    return 0;
  }
}

/**
 * Get suspicious activity count
 */
async function getSuspiciousActivityCount(): Promise<number> {
  try {
    // This would query your security logs for suspicious activities
    // For now, return a mock count
    return Math.floor(Math.random() * 5);
  } catch (error) {
    return 0;
  }
}