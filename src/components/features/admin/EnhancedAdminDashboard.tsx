"use client";

import React from 'react';
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
  Shield,
  Activity,
  Target
} from 'lucide-react';
import { getBlogPostsWithAnalytics, PRODUCTION_BLOG_POSTS } from '@/lib/blog/production-blog-data';

// Get authentic analytics for admin dashboard
const adminBlogPosts = getBlogPostsWithAnalytics(false); // false = authentic views
const publicBlogPosts = getBlogPostsWithAnalytics(true); // true = inflated views

// Calculate dashboard stats
const DASHBOARD_STATS = {
  totalPosts: PRODUCTION_BLOG_POSTS.length,
  publishedPosts: PRODUCTION_BLOG_POSTS.length,
  draftPosts: 0,
  totalViews: adminBlogPosts.reduce((sum, post) => sum + (post.views || 0), 0),
  publicViews: publicBlogPosts.reduce((sum, post) => sum + (post.views || 0), 0),
  monthlyViews: Math.floor(adminBlogPosts.reduce((sum, post) => sum + (post.views || 0), 0) * 0.3),
  totalUsers: 450,
  activeUsers: 89,
  conversionRate: 12.5,
  avgEngagement: adminBlogPosts.reduce((sum, post) => sum + (post.engagementRate || 0), 0) / adminBlogPosts.length,
};

const RECENT_POSTS = adminBlogPosts.slice(0, 5).map(post => ({
  id: post._id,
  title: post.title,
  status: 'published',
  views: post.views || 0,
  publishedAt: post.publishedAt,
  category: post.category.title,
  engagement: post.engagementRate || 0,
}));

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

export default function EnhancedAdminDashboard() {
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
              <CardTitle className="text-sm font-medium">Authentic Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{DASHBOARD_STATS.monthlyViews.toLocaleString()} this month
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Public shows: {DASHBOARD_STATS.publicViews.toLocaleString()} views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.avgEngagement.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DASHBOARD_STATS.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Notice */}
        <div className="mb-8">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Analytics Information
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    This dashboard shows authentic analytics for business intelligence. 
                    Public blog pages display inflated view counts starting from 5,000+ views for social proof, 
                    while maintaining accurate conversion tracking.
                  </p>
                </div>
              </div>
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

        {/* Recent Posts and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Posts Performance
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
                      <div className="text-xs text-muted-foreground">
                        {post.engagement.toFixed(1)}% engagement
                      </div>
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
                  <span className="text-sm">Analytics Tracking</span>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Image Processing</span>
                  <Badge variant="default" className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Search Engine</span>
                  <Badge variant="default" className="bg-green-500">Indexed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CTA Performance</span>
                  <Badge variant="default" className="bg-green-500">Optimized</Badge>
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
              Admin Dashboard - Aviators Training Centre | {PRODUCTION_BLOG_POSTS.length} Blog Posts Active
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