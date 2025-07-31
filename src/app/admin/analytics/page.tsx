'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  FileText,
  RefreshCw,
  Activity,
  AlertTriangle,
  Globe,
  Smartphone,
  Monitor,
  ArrowLeft,
  ExternalLink,
  Clock,
  MapPin,
  Share2,
  Search,
  Bot,
  Instagram,
  Facebook,
  Chrome,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DetailedAnalyticsData {
  // Basic metrics
  totalPosts: number;
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;
  uniqueUsers: number;
  
  // Traffic sources
  trafficSources: {
    direct: number;
    google: number;
    chatgpt: number;
    claude: number;
    instagram: number;
    facebook: number;
    linkedin: number;
    twitter: number;
    other: number;
  };
  
  // Device breakdown
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // Browser breakdown
  browsers: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
  
  // Geographic data
  topCountries: Array<{
    country: string;
    visits: number;
    percentage: number;
  }>;
  
  // Popular pages
  topPages: Array<{
    path: string;
    views: number;
    avgTime: string;
  }>;
  
  // Recent activity
  recentActivity: Array<{
    timestamp: string;
    action: string;
    page: string;
    source: string;
  }>;
  
  // Conversion funnel
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
  
  isFirebaseConfigured: boolean;
  error?: string;
}

const DetailedAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DetailedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/detailed?timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google': return <Search className="w-4 h-4" />;
      case 'chatgpt': return <Bot className="w-4 h-4" />;
      case 'claude': return <Bot className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'direct': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin" className="text-aviation-primary hover:underline">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Detailed Analytics</h1>
          </div>
          
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-aviation-primary mr-2" />
              <span>Loading detailed analytics...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-aviation-primary hover:underline">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Detailed Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights into your website performance</p>
            </div>
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
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-2">Analytics Error</div>
              <p className="text-sm">{error}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                  <p className="text-2xl font-bold">{analyticsData?.uniqueUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{analyticsData?.pageviews || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analyticsData?.conversionFunnel?.conversionRate || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +2.3% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Form Submissions</p>
                  <p className="text-2xl font-bold">{analyticsData?.formSubmissions || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +15% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Traffic Sources
              </CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.trafficSources ? Object.entries(analyticsData.trafficSources).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(source)}
                      <span className="capitalize font-medium">{source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-aviation-primary rounded-full" 
                          style={{ width: `${Math.min((count / Math.max(...Object.values(analyticsData.trafficSources))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No traffic source data available</p>
                    <p className="text-xs mt-1">Configure Firebase Analytics for detailed tracking</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Device Types
              </CardTitle>
              <CardDescription>How visitors access your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.deviceTypes ? Object.entries(analyticsData.deviceTypes).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device)}
                      <span className="capitalize font-medium">{device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${Math.min((count / Math.max(...Object.values(analyticsData.deviceTypes))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No device data available</p>
                    <p className="text-xs mt-1">Configure Firebase Analytics for detailed tracking</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Popular Pages
              </CardTitle>
              <CardDescription>Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.topPages?.length ? analyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{page.path}</p>
                      <p className="text-xs text-muted-foreground">Avg. time: {page.avgTime}</p>
                    </div>
                    <Badge variant="secondary">{page.views}</Badge>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No page data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Countries
              </CardTitle>
              <CardDescription>Visitor locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.topCountries?.length ? analyticsData.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{country.percentage}%</span>
                      <Badge variant="outline">{country.visits}</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No geographic data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>User journey analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.conversionFunnel ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Visitors</span>
                      <span className="font-bold">{analyticsData.conversionFunnel.visitors}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Blog Readers</span>
                      <span className="font-bold">{analyticsData.conversionFunnel.blogReaders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Contact Views</span>
                      <span className="font-bold">{analyticsData.conversionFunnel.contactViews}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Form Submissions</span>
                      <span className="font-bold">{analyticsData.conversionFunnel.formSubmissions}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No funnel data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest visitor interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData?.recentActivity?.length ? analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.page}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    <Badge variant="outline" className="text-xs">{activity.source}</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity data available</p>
                  <p className="text-xs mt-1">Configure Firebase Analytics for real-time tracking</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailedAnalyticsPage;