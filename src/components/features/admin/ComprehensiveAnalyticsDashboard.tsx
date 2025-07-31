'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  ArrowRight,
  ExternalLink,
  MapPin,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TrafficSource {
  source: string;
  medium: string;
  visits: number;
  uniqueUsers: number;
  pages: string[];
  countries: string[];
  conversionRate: string;
}

interface UserBehavior {
  totalEvents: number;
  uniqueUsers: number;
  scrollAnalytics: Array<{
    page: string;
    averageScrollDepth: number;
    maxScrollDepth: number;
    sessions: number;
  }>;
  clickHeatmap: Array<{
    page: string;
    element: string;
    clicks: number;
  }>;
  pageEngagement: Array<{
    page: string;
    averageTime: number;
    totalTime: number;
    sessions: number;
    bounceRate: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: string;
  }>;
  topUserPaths: Array<{
    path: string;
    count: number;
  }>;
}

interface AnalyticsData {
  trafficSources: {
    totalVisits: number;
    uniqueUsers: number;
    topSources: TrafficSource[];
    topPages: Array<{
      page: string;
      visits: number;
      sources: string[];
      bounceRate: number;
    }>;
    hourlyTraffic: Array<{
      hour: number;
      visits: number;
    }>;
  };
  userBehavior: UserBehavior;
  basicAnalytics: {
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
  };
}

const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [trafficResponse, behaviorResponse, basicResponse] = await Promise.all([
        fetch(`/api/analytics/traffic-sources?timeframe=${timeframe}`),
        fetch(`/api/analytics/user-behavior?timeframe=${timeframe}`),
        fetch(`/api/analytics/data?timeframe=${timeframe}`)
      ]);

      const [trafficData, behaviorData, basicData] = await Promise.all([
        trafficResponse.json(),
        behaviorResponse.json(),
        basicResponse.json()
      ]);

      if (!trafficData.success || !behaviorData.success || !basicData.success) {
        throw new Error('Failed to fetch analytics data');
      }

      setAnalyticsData({
        trafficSources: trafficData.data,
        userBehavior: behaviorData.data,
        basicAnalytics: basicData.data,
      });

    } catch (err) {
      console.error('Error fetching comprehensive analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'direct':
        return <ExternalLink className="w-4 h-4 text-green-600" />;
      case 'social':
        return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'referral':
        return <ArrowRight className="w-4 h-4 text-orange-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Comprehensive Analytics</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Comprehensive Analytics</h2>
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

  const { trafficSources, userBehavior, basicAnalytics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comprehensive Analytics</h2>
          <p className="text-sm text-gray-600">
            Complete insights into website traffic, user behavior, and conversions
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{trafficSources.uniqueUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {trafficSources.totalVisits} total visits
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{basicAnalytics.pageviews.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {basicAnalytics.pageviews.uniqueUsers} unique viewers
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CTA Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{basicAnalytics.ctaClicks.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {basicAnalytics.ctaClicks.conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Form Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{basicAnalytics.formSubmissions.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {basicAnalytics.contactVisits.total} contact visits
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Hourly Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aviation-primary" />
                Traffic by Hour
              </CardTitle>
              <CardDescription>
                Website visits throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {trafficSources.hourlyTraffic.map((hour) => {
                  const maxVisits = Math.max(...trafficSources.hourlyTraffic.map(h => h.visits));
                  const height = maxVisits > 0 ? (hour.visits / maxVisits) * 100 : 0;
                  
                  return (
                    <div key={hour.hour} className="text-center">
                      <div className="h-20 flex items-end justify-center mb-1">
                        <div 
                          className="w-6 bg-aviation-primary/70 rounded-t transition-all duration-300 hover:bg-aviation-primary"
                          style={{ height: `${height}%` }}
                          title={`${hour.visits} visits at ${hour.hour}:00`}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {hour.hour}h
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {hour.visits}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-aviation-primary" />
                Top Pages
              </CardTitle>
              <CardDescription>
                Most visited pages on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trafficSources.topPages.slice(0, 5).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{page.page}</p>
                        <p className="text-xs text-gray-500">
                          {page.sources.length} traffic sources • {page.bounceRate.toFixed(1)}% bounce rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-aviation-primary">{page.visits}</p>
                      <p className="text-xs text-gray-500">visits</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-aviation-primary" />
                Traffic Sources
              </CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.topSources.map((source, index) => (
                  <motion.div
                    key={`${source.source}_${source.medium}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {getSourceIcon(source.source)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {source.source}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {source.medium}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {source.uniqueUsers} unique users • {source.pages.length} pages visited
                        </p>
                        {source.countries.length > 0 && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {source.countries.slice(0, 3).join(', ')}
                            {source.countries.length > 3 && ` +${source.countries.length - 3} more`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-aviation-primary">{source.visits}</p>
                      <p className="text-sm text-gray-600">{source.conversionRate}% CVR</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-aviation-primary" />
                Device Breakdown
              </CardTitle>
              <CardDescription>
                How users access your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userBehavior.deviceBreakdown.map((device) => (
                  <div key={device.device} className="text-center p-4 rounded-lg border">
                    <div className="flex justify-center mb-2">
                      {getDeviceIcon(device.device)}
                    </div>
                    <h4 className="font-medium text-gray-900 capitalize mb-1">
                      {device.device}
                    </h4>
                    <p className="text-2xl font-bold text-aviation-primary mb-1">
                      {device.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {device.count} users
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Click Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-aviation-primary" />
                Click Heatmap
              </CardTitle>
              <CardDescription>
                Most clicked elements on your pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userBehavior.clickHeatmap.slice(0, 10).map((click, index) => (
                  <div key={`${click.page}_${click.element}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{click.element || 'Unknown Element'}</p>
                        <p className="text-xs text-gray-500">{click.page}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-aviation-primary">{click.clicks}</p>
                      <p className="text-xs text-gray-500">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-aviation-primary" />
                Common User Paths
              </CardTitle>
              <CardDescription>
                How users navigate through your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userBehavior.topUserPaths.map((path, index) => (
                  <div key={path.path} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{path.path}</p>
                        <p className="text-xs text-gray-500">User journey path</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-aviation-primary">{path.count}</p>
                      <p className="text-xs text-gray-500">users</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Page Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-aviation-primary" />
                Page Engagement
              </CardTitle>
              <CardDescription>
                Time spent and interaction depth on each page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBehavior.pageEngagement.map((page, index) => (
                  <div key={page.page} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{page.page}</h4>
                        <p className="text-sm text-gray-600">{page.sessions} sessions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-aviation-primary">
                          {Math.round(page.averageTime / 60)}m {Math.round(page.averageTime % 60)}s
                        </p>
                        <p className="text-xs text-gray-500">avg. time</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Bounce Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={page.bounceRate} className="flex-1 h-2" />
                          <span className="font-medium">{page.bounceRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Time</p>
                        <p className="font-medium">
                          {Math.round(page.totalTime / 3600)}h {Math.round((page.totalTime % 3600) / 60)}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scroll Depth Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-aviation-primary" />
                Scroll Depth Analysis
              </CardTitle>
              <CardDescription>
                How far users scroll on each page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBehavior.scrollAnalytics.map((scroll, index) => (
                  <div key={scroll.page} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{scroll.page}</h4>
                        <p className="text-sm text-gray-600">{scroll.sessions} sessions analyzed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-aviation-primary">
                          {scroll.averageScrollDepth.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">avg. scroll</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average Scroll Depth</span>
                        <span className="font-medium">{scroll.averageScrollDepth.toFixed(1)}%</span>
                      </div>
                      <Progress value={scroll.averageScrollDepth} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Max Scroll Depth</span>
                        <span className="font-medium">{scroll.maxScrollDepth.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;