'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowLeft,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Target,
  DollarSign
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';

interface DetailedAnalyticsData {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;
  uniqueUsers: number;
  trafficSources: {
    direct: number;
    google: number;
    chatgpt: number;
    claude: number;
    instagram: number;
    facebook: number;
    linkedin: number;
    twitter: number;
    meta_ads: number;
    other: number;
  };
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
  topCountries: Array<{ country: string; users: number }>;
  topPages: Array<{ path: string; title: string; views: number; avgTime: string }>;
  recentActivity: Array<{ timestamp: string; event: string; details: string }>;
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
  metaAdsData: {
    clicks: number;
    impressions: number;
    conversions: number;
    cost: number;
    ctr: number;
  };
  aiReferrals: {
    chatgpt: number;
    claude: number;
    other_ai: number;
  };
  isGoogleAnalyticsConfigured: boolean;
  measurementId: string | null;
}

const DetailedAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DetailedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const fetchDetailedAnalytics = async () => {
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
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      setError('Network error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard" description="Loading analytics data...">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-lg">Loading detailed analytics...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics Dashboard" description="Error loading analytics">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDetailedAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </AdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AdminLayout title="Analytics Dashboard" description="No data available">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No analytics data available</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Analytics Dashboard" 
      description="Comprehensive analytics overview for Aviators Training Centre"
    >
      {/* Header Controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/studio/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchDetailedAnalytics} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

        {/* Analytics Configuration Status */}
        <div className="mb-8">
          <Card className={`border-l-4 ${analyticsData.isGoogleAnalyticsConfigured ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Google Analytics 4 Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData.isGoogleAnalyticsConfigured 
                      ? `Configured with ID: ${analyticsData.measurementId}`
                      : 'Not configured - Add NEXT_PUBLIC_GA_MEASUREMENT_ID to environment variables'
                    }
                  </p>
                </div>
                <Badge variant={analyticsData.isGoogleAnalyticsConfigured ? 'default' : 'secondary'}>
                  {analyticsData.isGoogleAnalyticsConfigured ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pageviews</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.pageviews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Unique users: {analyticsData.uniqueUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analyticsData.ctaClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Contact visits: {analyticsData.contactVisits.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analyticsData.formSubmissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Conversion rate: {analyticsData.conversionFunnel.conversionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analyticsData.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All tracked interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Posts</span>
                  <Badge variant="outline">{analyticsData.totalPosts}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Authors</span>
                  <Badge variant="outline">{analyticsData.totalAuthors}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Categories</span>
                  <Badge variant="outline">{analyticsData.totalCategories}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analyticsData.trafficSources).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.deviceTypes).map(([device, count]) => (
                  <div key={device} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{device}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Referrals & Meta Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Platform Referrals
              </CardTitle>
              <CardDescription>
                Traffic from AI platforms like ChatGPT and Claude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">ChatGPT</span>
                  <Badge variant="outline">{analyticsData.aiReferrals.chatgpt}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Claude</span>
                  <Badge variant="outline">{analyticsData.aiReferrals.claude}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other AI</span>
                  <Badge variant="outline">{analyticsData.aiReferrals.other_ai}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Meta Ads Performance
              </CardTitle>
              <CardDescription>
                Facebook and Instagram advertising metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Clicks</span>
                  <Badge variant="outline">{analyticsData.metaAdsData.clicks}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Impressions</span>
                  <Badge variant="outline">{analyticsData.metaAdsData.impressions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CTR</span>
                  <Badge variant="outline">{analyticsData.metaAdsData.ctr.toFixed(2)}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversions</span>
                  <Badge variant="outline">{analyticsData.metaAdsData.conversions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.topPages.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{page.title}</h4>
                      <p className="text-xs text-muted-foreground">{page.path}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{page.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium">{page.avgTime}</div>
                      <div className="text-xs text-muted-foreground">avg time</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No page data available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Data will appear as users visit your blog posts
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              User journey from visitor to form submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.conversionFunnel.visitors}</div>
                <div className="text-sm text-muted-foreground">Visitors</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analyticsData.conversionFunnel.blogReaders}</div>
                <div className="text-sm text-muted-foreground">Blog Readers</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analyticsData.conversionFunnel.contactViews}</div>
                <div className="text-sm text-muted-foreground">Contact Views</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analyticsData.conversionFunnel.formSubmissions}</div>
                <div className="text-sm text-muted-foreground">Submissions</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Conversion Rate: {analyticsData.conversionFunnel.conversionRate.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/studio/admin">Back to Admin Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/studio">Back to Studio</Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DetailedAnalyticsPage;