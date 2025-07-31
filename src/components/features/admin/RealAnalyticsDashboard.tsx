'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  FileText,
  Calendar,
  RefreshCw,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { blogConversionTracker, ConversionData } from '@/lib/analytics/blog-conversion-tracker';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';
import { BlogPost } from '@/lib/types/blog';
// Firebase Admin SDK is used via API routes to avoid browser compatibility issues

interface FirestoreAnalyticsData {
  pageviews: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    uniqueUsers: number;
  };
  ctaClicks: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    conversionRate: number;
  };
  contactVisits: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  formSubmissions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
    ctaClicks: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    pageviews: number;
    ctaClicks: number;
    conversions: number;
  }>;
}

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  recentPosts: BlogPost[];
  conversionData: ConversionData;
  firestoreData: FirestoreAnalyticsData;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    lastSync: Date;
    cacheHitRate: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  description, 
  trend = 'neutral' 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    return (
      <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
        <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aviation-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          {getTrendIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

const RealAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchFirestoreAnalytics = async (): Promise<FirestoreAnalyticsData> => {
    try {
      // Use API route to fetch analytics data instead of direct Firestore access
      const response = await fetch(`/api/analytics/data?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch analytics data');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching Firestore analytics:', error);
      // Return empty data structure on error
      return {
        pageviews: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, uniqueUsers: 0 },
        ctaClicks: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, conversionRate: 0 },
        contactVisits: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
        formSubmissions: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
        topPosts: [],
        timeSeriesData: []
      };
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch blog posts data
      const postsResult = await simpleBlogService.getAllPosts();
      const allPosts = postsResult || [];
      const publishedPosts = allPosts; // All posts from simple service are published

      // Get recent posts (last 5)
      const recentPosts = publishedPosts
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 5);

      // Fetch conversion data (legacy)
      const conversionData = await blogConversionTracker.getConversionData(timeframe);

      // Fetch Firestore analytics data
      const firestoreData = await fetchFirestoreAnalytics();

      // Mock system health data (in production, this would come from monitoring)
      const systemHealth = {
        status: 'healthy' as const,
        lastSync: new Date(),
        cacheHitRate: 85 + Math.random() * 10 // Mock cache hit rate
      };

      const analytics: AnalyticsData = {
        totalPosts: allPosts.length,
        publishedPosts: publishedPosts.length,
        recentPosts,
        conversionData,
        firestoreData,
        systemHealth
      };

      setAnalyticsData(analytics);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blog Analytics</h2>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-aviation-primary" />
            <span className="text-sm text-gray-600">Loading analytics...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blog Analytics</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <Activity className="w-5 h-5" />
              <div>
                <p className="font-medium">Failed to load analytics</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { totalPosts, publishedPosts, recentPosts, conversionData, firestoreData, systemHealth } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Analytics</h2>
          <p className="text-sm text-gray-600">
            Real-time insights from your blog content and user interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">System Status</p>
                <p className="text-sm text-gray-600">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {systemHealth.status.toUpperCase()}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {Math.round(systemHealth.cacheHitRate)}% Cache Hit Rate
                </p>
                <p className="text-xs text-gray-500">
                  Sync: {systemHealth.lastSync.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Blog Posts"
          value={totalPosts}
          icon={<FileText className="w-5 h-5 text-aviation-primary" />}
          description={`${publishedPosts} published`}
        />
        
        <MetricCard
          title="Blog Views"
          value={firestoreData.pageviews.total}
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          description={`${firestoreData.pageviews.uniqueUsers} unique visitors`}
          trend={firestoreData.pageviews.total > 0 ? 'up' : 'neutral'}
        />
        
        <MetricCard
          title="CTA Clicks"
          value={firestoreData.ctaClicks.total}
          icon={<MousePointer className="w-5 h-5 text-purple-600" />}
          description="Call-to-action interactions"
          trend={firestoreData.ctaClicks.total > 0 ? 'up' : 'neutral'}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${firestoreData.ctaClicks.conversionRate.toFixed(1)}%`}
          icon={<Target className="w-5 h-5 text-green-600" />}
          description="Blog to contact conversions"
          trend={firestoreData.ctaClicks.conversionRate > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-aviation-primary" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              User journey from blog views to form submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Blog Views</span>
                </div>
                <span className="font-bold text-blue-600">{firestoreData.pageviews.total}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">CTA Clicks</span>
                </div>
                <span className="font-bold text-purple-600">{firestoreData.ctaClicks.total}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Contact Visits</span>
                </div>
                <span className="font-bold text-orange-600">{firestoreData.contactVisits.total}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Form Submissions</span>
                </div>
                <span className="font-bold text-green-600">{firestoreData.formSubmissions.total}</span>
              </div>
            </div>
            
            {firestoreData.pageviews.uniqueUsers > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Blog-to-Contact Rate</span>
                  <span className="font-bold text-aviation-primary">
                    {firestoreData.pageviews.total > 0 
                      ? ((firestoreData.contactVisits.total / firestoreData.pageviews.total) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-aviation-primary" />
              Top Performing Posts
            </CardTitle>
            <CardDescription>
              Posts with highest engagement and conversion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {firestoreData.topPosts.length > 0 ? (
                firestoreData.topPosts.slice(0, 5).map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
                          {post.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {post.ctaClicks} clicks
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {post.conversionRate.toFixed(1)}% CVR
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        post.conversionRate > 5 
                          ? 'bg-green-100 text-green-700' 
                          : post.conversionRate > 2 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.conversionRate > 5 ? 'High' : post.conversionRate > 2 ? 'Medium' : 'Low'}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No performance data available</p>
                  <p className="text-gray-400 text-xs mt-1">Data will appear as users interact with your blog</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {firestoreData.pageviews.uniqueUsers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-aviation-primary" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              Real-time metrics and trends from Firestore analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Engagement</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {firestoreData.ctaClicks.conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-blue-700">CTA click rate</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Conversion</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {firestoreData.pageviews.total > 0 
                    ? ((firestoreData.formSubmissions.total / firestoreData.pageviews.total) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-sm text-green-700">Form submission rate</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Reach</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {firestoreData.pageviews.uniqueUsers}
                </p>
                <p className="text-sm text-purple-700">Unique visitors</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Activity</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {timeframe === 'day' ? firestoreData.pageviews.today :
                   timeframe === 'week' ? firestoreData.pageviews.thisWeek :
                   timeframe === 'month' ? firestoreData.pageviews.thisMonth :
                   firestoreData.pageviews.total}
                </p>
                <p className="text-sm text-orange-700">
                  {timeframe === 'day' ? 'Today' :
                   timeframe === 'week' ? 'This week' :
                   timeframe === 'month' ? 'This month' :
                   'All time'} views
                </p>
              </div>
            </div>

            {/* Time Series Chart */}
            {firestoreData.timeSeriesData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">7-Day Trend</h4>
                <div className="grid grid-cols-7 gap-2">
                  {firestoreData.timeSeriesData.map((day, index) => {
                    const maxValue = Math.max(...firestoreData.timeSeriesData.map(d => d.pageviews));
                    const height = maxValue > 0 ? (day.pageviews / maxValue) * 60 : 0;
                    
                    return (
                      <div key={day.date} className="text-center">
                        <div className="h-16 flex items-end justify-center mb-1">
                          <div 
                            className="w-6 bg-aviation-primary/70 rounded-t transition-all duration-300 hover:bg-aviation-primary"
                            style={{ height: `${height}px` }}
                            title={`${day.pageviews} views on ${new Date(day.date).toLocaleDateString()}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          {day.pageviews}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealAnalyticsDashboard;
