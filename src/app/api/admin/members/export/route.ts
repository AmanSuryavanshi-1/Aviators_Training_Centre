/**
 * Members Export API Endpoint
 * Exports member data as CSV for backup or analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanityMemberService } from '@/lib/auth/sanityMemberService';
import { securityLogger } from '@/lib/logging/securityLogger';
import { jwtService } from '@/lib/auth/jwtService';

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
        '/api/admin/members/export',
        'GET',
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
      '/api/admin/members/export',
      {
        action: 'member_data_export',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // Parse query parameters
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    const includeActivity = url.searchParams.get('includeActivity') === 'true';

    // Fetch member data
    const members = await sanityMemberService.fetchMembers();
    
    // Filter members if needed
    const filteredMembers = includeInactive 
      ? members 
      : members.filter(member => member.isActive);

    // Generate export data based on format
    if (format === 'csv') {
      const csvData = await generateCSVExport(filteredMembers, includeActivity);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="members-export-${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else if (format === 'json') {
      const jsonData = await generateJSONExport(filteredMembers, includeActivity);
      
      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="members-export-${new Date().toISOString().split('T')[0]}.json"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Members export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export member data' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV export
 */
async function generateCSVExport(members: any[], includeActivity: boolean): Promise<string> {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Status',
    'Last Active',
    'Joined At',
    'Permissions',
  ];

  if (includeActivity) {
    headers.push('Session Count', 'Last Login IP', 'Last Login Location');
  }

  const csvRows = [headers.join(',')];

  for (const member of members) {
    const row = [
      escapeCsvField(member._id),
      escapeCsvField(member.name),
      escapeCsvField(member.email),
      escapeCsvField(member.role),
      member.isActive ? 'Active' : 'Inactive',
      escapeCsvField(member.lastActive || ''),
      escapeCsvField(member.joinedAt || ''),
      escapeCsvField(getPermissionsForRole(member.role).join('; ')),
    ];

    if (includeActivity) {
      // Get activity data (mock for now)
      const activityData = await getActivityDataForMember(member._id);
      row.push(
        activityData.sessionCount.toString(),
        escapeCsvField(activityData.lastLoginIp || ''),
        escapeCsvField(activityData.lastLoginLocation || '')
      );
    }

    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Generate JSON export
 */
async function generateJSONExport(members: any[], includeActivity: boolean): Promise<any> {
  const exportData = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      totalMembers: members.length,
      includeActivity,
      exportedBy: 'Admin User', // This would come from the current user
    },
    members: [],
  };

  for (const member of members) {
    const memberData: any = {
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      isActive: member.isActive,
      lastActive: member.lastActive,
      joinedAt: member.joinedAt,
      permissions: getPermissionsForRole(member.role),
    };

    if (includeActivity) {
      const activityData = await getActivityDataForMember(member._id);
      memberData.activity = activityData;
    }

    (exportData.members as any[]).push(memberData);
  }

  return exportData;
}

/**
 * Escape CSV field
 */
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Get permissions for role
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
 * Get activity data for member
 */
async function getActivityDataForMember(memberId: string): Promise<{
  sessionCount: number;
  lastLoginIp?: string;
  lastLoginLocation?: string;
  totalLogins: number;
  failedLogins: number;
  lastFailedLogin?: string;
}> {
  try {
    // This would typically query your activity/session database
    // For now, return mock data
    return {
      sessionCount: Math.floor(Math.random() * 20),
      lastLoginIp: '192.168.1.' + Math.floor(Math.random() * 255),
      lastLoginLocation: ['New York, US', 'London, UK', 'Tokyo, JP'][Math.floor(Math.random() * 3)],
      totalLogins: Math.floor(Math.random() * 100),
      failedLogins: Math.floor(Math.random() * 5),
      lastFailedLogin: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
  } catch (error) {
    return {
      sessionCount: 0,
      totalLogins: 0,
      failedLogins: 0,
    };
  }
}