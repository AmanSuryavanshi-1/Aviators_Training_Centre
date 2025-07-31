'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Edit,
  Eye,
  BarChart3,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface QuickActionsProps {
  recentActivity?: Array<{
    id: string;
    type: 'created' | 'updated' | 'published' | 'deleted';
    title: string;
    timestamp: string;
    author?: string;
  }>;
}

export function QuickActions({ recentActivity = [] }: QuickActionsProps) {
  const quickActionItems = [
    {
      title: 'Create New Post',
      description: 'Start writing a new blog post',
      href: '/admin/new',
      icon: PlusCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
      primary: true,
    },
    {
      title: 'View Analytics',
      description: 'Check blog performance',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'SEO Tools',
      description: 'Optimize content for search',
      href: '/admin/seo',
      icon: TrendingUp,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'CTA Performance',
      description: 'Track conversion rates',
      href: '/admin/analytics/cta',
      icon: Target,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <PlusCircle className="h-3 w-3 text-green-600" />;
      case 'updated':
        return <Edit className="h-3 w-3 text-blue-600" />;
      case 'published':
        return <Eye className="h-3 w-3 text-purple-600" />;
      case 'deleted':
        return <RefreshCw className="h-3 w-3 text-red-600" />;
      default:
        return <Zap className="h-3 w-3 text-slate-600" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      created: { text: 'Created', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      updated: { text: 'Updated', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      published: { text: 'Published', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      deleted: { text: 'Deleted', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };
    return badges[type as keyof typeof badges] || badges.created;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActionItems.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant={action.primary ? "default" : "outline"}
                  className={`w-full h-auto p-4 flex flex-col items-start gap-2 ${
                    action.primary 
                      ? action.color + ' text-white' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <span className={`text-xs text-left ${
                    action.primary 
                      ? 'text-white/80' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {action.description}
                  </span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Additional Actions */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Latest changes and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent activity
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Activity will appear here as you work
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => {
                const badge = getActivityBadge(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={badge.color + ' text-xs'}>
                          {badge.text}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {activity.title}
                      </p>
                      {activity.author && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          by {activity.author}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {recentActivity.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/admin/activity">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all activity
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
