/**
 * Sanity Member Management Dashboard
 * Admin interface to view and manage Sanity project members
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Shield,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  UserPlus,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectMember {
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

export default function MemberManagementDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberActivity, setMemberActivity] = useState<MemberActivity[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load members
      const membersResponse = await fetch('/api/admin/members');
      if (!membersResponse.ok) {
        throw new Error('Failed to load members');
      }
      const membersData = await membersResponse.json();
      setMembers(membersData.members || []);
      setStats(membersData.stats || null);

      // Load member activity
      const activityResponse = await fetch('/api/admin/members/activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setMemberActivity(activityData.activities || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const syncWithSanity = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/members/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with Sanity');
      }
      
      await loadMemberData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const exportMemberData = async () => {
    try {
      const response = await fetch('/api/admin/members/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && member.isActive) ||
                         (filterStatus === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'destructive';
      case 'Editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Loading member data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Management</h1>
          <p className="text-gray-600">Manage Sanity project members and monitor activity</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={syncWithSanity} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync with Sanity
          </Button>
          <Button onClick={exportMemberData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.administrators}</p>
                  <p className="text-sm text-gray-600">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.recentLogins}</p>
                  <p className="text-sm text-gray-600">Recent Logins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Editor">Editor</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Project Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(member.isActive)}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatLastActive(member.lastActive)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {member.sessionCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(member)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No members found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Member Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberActivity.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${activity.success ? 'bg-green-100' : 'bg-red-100'}`}>
                      {activity.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activity.email}</span>
                        <span className="text-sm text-gray-600">{activity.action}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.ipAddress && ` • ${activity.ipAddress}`}
                      </div>
                    </div>
                  </div>
                ))}

                {memberActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Sync Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure how member data is synchronized with Sanity
                  </p>
                  <Button onClick={syncWithSanity} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Manual Sync
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Export Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Export member data for backup or analysis
                  </p>
                  <Button onClick={exportMemberData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Activity Monitoring</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor member activity and authentication events
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Track login attempts</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monitor session activity</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log security events</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={loadMemberData}
        />
      )}
    </div>
  );
}

// Member Details Modal Component
interface MemberDetailsModalProps {
  member: ProjectMember;
  onClose: () => void;
  onUpdate: () => void;
}

function MemberDetailsModal({ member, onClose, onUpdate }: MemberDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Member Details</h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">{member.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{member.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <Badge variant={getRoleColor(member.role)} className="mt-1">
                {member.role}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <Badge variant={getStatusColor(member.isActive)} className="mt-1">
                {member.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Last Active</label>
              <p>{formatLastActive(member.lastActive)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Session Count</label>
              <p>{member.sessionCount || 0}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Permissions</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.permissions.map((permission, index) => (
                <Badge key={index} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {member.lastLoginIp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Last Login IP</label>
                <p className="font-mono text-sm">{member.lastLoginIp}</p>
              </div>
              {member.lastLoginLocation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-sm">{member.lastLoginLocation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  function getRoleColor(role: string) {
    switch (role) {
      case 'Administrator':
        return 'destructive';
      case 'Editor':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  function getStatusColor(isActive: boolean) {
    return isActive ? 'default' : 'secondary';
  }

  function formatLastActive(lastActive?: string) {
    if (!lastActive) return 'Never';
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}