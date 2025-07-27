'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Settings, 
  PlusCircle,
  Edit,
  Shield
} from 'lucide-react';
import RealAnalyticsDashboard from '@/components/admin/RealAnalyticsDashboard';
import SystemStatusDashboard from '@/components/admin/SystemStatusDashboard';

// Note: metadata export removed since this is now a client component

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

        {/* Real Analytics Dashboard */}
        <div className="mb-8">
          <RealAnalyticsDashboard />
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

        {/* System Status Dashboard */}
        <div className="mb-8">
          <SystemStatusDashboard />
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