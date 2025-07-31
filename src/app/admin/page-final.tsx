import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  PlusCircle,
  Eye,
  Edit,
  TrendingUp,
  Calendar,
  MessageSquare,
  Shield
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Aviators Training Centre',
  description: 'Manage your aviation training content, blog posts, and system settings.',
  robots: {
    index: false,
    follow: false,
  },
};

// Mock data for demonstration
const DASHBOARD_STATS = {
  totalPosts: 6,
  publishedPosts: 6,
  draftPosts: 0,
  totalViews: 12500,
  monthlyViews: 3200,
  totalUsers: 450,
  activeUsers: 89,
  conversionRate: 12.5,
};

const RECENT_POSTS = [
  {
    id: '1',
    title: 'Complete Guide to DGCA CPL License 2024',
    status: 'published',
    views: 2800,
    publishedAt: '2024-01-15',
    category: 'Pilot Training',
  },
  {
    id: '2',
    title: 'Pilot Salary in India 2024: Complete Earnings Guide',
    status: 'published',
    views: 3200,
    publishedAt: '2024-01-10',
    category: 'Career Guidance',
  },
  {
    id: '3',
    title: 'DGCA Medical Examination: Tips for Aspiring Pilots',
    status: 'published',
    views: 1900,
    publishedAt: '2024-01-05',
    category: 'Aviation Medical',
  },
];

const QUICK_ACTIONS = [
  {
    title: 'Create New Post',
    description: 'Write a new blog post',
    icon: PlusCircle,
    href: '/admin/new',
    color: 'bg-blue-500',
  },
  {
    title: 'Manage Posts',
    description: 'Edit existing blog posts',
    icon: Edit,
    href: '/admin/blogs',
    color: 'bg-green-500',
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'bg-purple-500',
  },
  {
    title: 'System Settings',
    description: 'Configure system preferences',
    icon: Settings,
    href: '/admin/settings',
    color: 'bg-orange-500',
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your aviation training content and monitor system performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {DASHBOARD_STATS.publishedPosts} published, {DASHBOARD_STATS.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{DASHBOARD_STATS.monthlyViews.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                of {DASHBOARD_STATS.totalUsers} total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_POSTS.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{post.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/blogs">View All Posts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blog System</span>
                  <Badge variant="default" className="bg-green-500">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Delivery</span>
                  <Badge variant="default" className="bg-green-500">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Image Processing</span>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Search Engine</span>
                  <Badge variant="default" className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Badge variant="default" className="bg-green-500">Tracking</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/maintenance">System Maintenance</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Admin Dashboard - Aviators Training Centre
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">View Website</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/blog">View Blog</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
