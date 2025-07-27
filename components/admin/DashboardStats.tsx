'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    categories: number;
    totalViews: string;
    monthlyViews: string;
    conversionRate: string;
    avgReadingTime: string;
    featuredPosts: number;
    recentPosts: number;
  };
  trends?: {
    blogs: 'up' | 'down' | 'neutral';
    views: 'up' | 'down' | 'neutral';
    conversions: 'up' | 'down' | 'neutral';
    engagement: 'up' | 'down' | 'neutral';
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  badge?: string;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  badge 
}: StatCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400';

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </CardTitle>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <Icon className={cn('h-4 w-4', colorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            {description && (
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {trend && trendValue && (
            <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardStats({ stats, trends }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Simplified Stats - removed complex analytics */}
      <StatCard
        title="Total Blog Posts"
        value={stats.totalBlogs}
        description="All blog posts"
        icon={FileText}
        color="blue"
      />
      
      <StatCard
        title="Published Posts"
        value={stats.publishedBlogs}
        description="Live on website"
        icon={Eye}
        color="green"
        badge="Live"
      />
      
      <StatCard
        title="Draft Posts"
        value={stats.draftBlogs}
        description="Pending publication"
        icon={Clock}
        color="orange"
        badge={stats.draftBlogs > 0 ? 'Action Needed' : undefined}
      />
      
      <StatCard
        title="Categories"
        value={stats.categories}
        description="Content categories"
        icon={Users}
        color="purple"
      />

      {/* Basic Content Stats */}
      <StatCard
        title="Featured Posts"
        value={stats.featuredPosts}
        description="Highlighted content"
        icon={Star}
        color="yellow"
      />
      
      <StatCard
        title="Recent Posts"
        value={stats.recentPosts}
        description="Last 30 days"
        icon={Zap}
        color="orange"
        badge="New"
      />
      
      <StatCard
        title="Avg Reading Time"
        value={stats.avgReadingTime}
        description="Average engagement"
        icon={Clock}
        color="blue"
      />
      
      <StatCard
        title="SEO Score"
        value="Basic"
        description="SEO optimization"
        icon={TrendingUp}
        color="green"
      />
    </div>
  );
}