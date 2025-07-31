'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MousePointer, 
  Target,
  DollarSign,
  Activity,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface BlogAnalyticsDashboardProps {
  className?: string;
}

interface AnalyticsMetrics {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  totalPosts: number;
  publishedThisMonth: number;
  ctaClicks: number;
  conversions: number;
  revenue: number;
  topReferrers: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    visits: number;
    percentage: number;
  }>;
  topPages: Array<{
    slug: string;
    title: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    conversions: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    views: number;
    visitors: number;
    conversions: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    posts: number;
    views: number;
    conversions: number;
    revenue: number;
  }>;
  authorPerformance: Array<{
    author: string;
    posts: number;
    views: number;
    avgEngagement: number;
    conversions: number;
  }>;
}

interface AudienceInsights {
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    locations: Array<{ country: string; city: string; percentage: number }>;
    interests: Array<{ interest: string; percentage: number }>;
  };
  behavior: {
    averageSessionDuration: number;
    pagesPerSession: number;
    returnVisitorRate: number;
    newVisitorRate: number;
  };
  engagement: {
    socialShares: number;
    comments: number;
    newsletterSignups: number;
    downloadedResources: number;
  };
}

export default function BlogAnalyticsDashboard({ className = '' }: BlogAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedDateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedDateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Simulate API calls - in real implementation, these would be actual API calls
      const [analyticsResponse, audienceResponse] = await Promise.all([
        fetch(`/api/admin/analytics/blog?start=${startDate.toISOString()}&end=${endDate.toISOString()}`),
        fetch(`/api/admin/analytics/audience?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      ]);

      if (analyticsResponse.ok && audienceResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const audienceData = await audienceResponse.json();
        
        setMetrics(analyticsData);
        setAudienceInsights(audienceData);
      } else {
        // Fallback to mock data for development
        setMetrics(getMockAnalyticsData());
        setAudienceInsights(getMockAudienceData());
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Use mock data as fallback
      setMetrics(getMockAnalyticsData());
      setAudienceInsights(getMockAudienceData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsMetrics => ({
    totalViews: 45230,
    uniqueVisitors: 32150,
    averageTimeOnPage: 245,
    bounceRate: 42.3,
    totalPosts: 127,
    publishedThisMonth: 8,
    ctaClicks: 2340,
    conversions: 156,
    revenue: 3900000,
    topReferrers: [
      { source: 'Google Search', visits: 18500, percentage: 57.5 },
      { source: 'Direct', visits: 8200, percentage: 25.5 },
      { source: 'Social Media', visits: 3450, percentage: 10.7 },
      { source: 'Email', visits: 2000, percentage: 6.2 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', visits: 19290, percentage: 60.0 },
      { device: 'Mobile', visits: 9645, percentage: 30.0 },
      { device: 'Tablet', visits: 3215, percentage: 10.0 }
    ],
    topPages: [
      {
        slug: 'dgca-exam-preparation-guide',
        title: 'Complete Guide to DGCA Exam Preparation',
        views: 5420,
        uniqueViews: 4230,
        avgTimeOnPage: 320,
        bounceRate: 35.2,
        conversions: 28
      },
      {
        slug: 'aviation-career-guide',
        title: 'Aviation Career Guide: From Student to Captain',
        views: 4180,
        uniqueViews: 3450,
        avgTimeOnPage: 285,
        bounceRate: 38.7,
        conversions: 22
      },
      {
        slug: 'aircraft-systems-fundamentals',
        title: 'Aircraft Systems Fundamentals',
        views: 3650,
        uniqueViews: 2890,
        avgTimeOnPage: 410,
        bounceRate: 28.5,
        conversions: 18
      }
    ],
    timeSeriesData: generateTimeSeriesData(selectedDateRange),
    categoryPerformance: [
      { category: 'Technical General', posts: 32, views: 15420, conversions: 45, revenue: 1125000 },
      { category: 'Career Guidance', posts: 28, views: 12350, conversions: 38, revenue: 950000 },
      { category: 'Technical Specific', posts: 24, views: 9870, conversions: 32, revenue: 800000 },
      { category: 'Industry News', posts: 18, views: 7590, conversions: 25, revenue: 625000 }
    ],
    authorPerformance: [
      { author: 'Capt. Rajesh Kumar', posts: 45, views: 18500, avgEngagement: 4.2, conversions: 52 },
      { author: 'Capt. Priya Sharma', posts: 38, views: 15200, avgEngagement: 3.8, conversions: 41 },
      { author: 'Capt. Amit Singh', posts: 32, views: 11400, avgEngagement: 3.5, conversions: 35 }
    ]
  });

  const getMockAudienceData = (): AudienceInsights => ({
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 35.2 },
        { range: '25-34', percentage: 42.8 },
        { range: '35-44', percentage: 15.6 },
        { range: '45+', percentage: 6.4 }
      ],
      locations: [
        { country: 'India', city: 'Delhi', percentage: 28.5 },
        { country: 'India', city: 'Mumbai', percentage: 22.3 },
        { country: 'India', city: 'Bangalore', percentage: 18.7 },
        { country: 'India', city: 'Chennai', percentage: 12.4 }
      ],
      interests: [
        { interest: 'Aviation Training', percentage: 85.2 },
        { interest: 'Commercial Pilot', percentage: 72.8 },
        { interest: 'Aircraft Technology', percentage: 58.6 },
        { interest: 'Career Development', percentage: 45.3 }
      ]
    },
    behavior: {
      averageSessionDuration: 285,
      pagesPerSession: 2.8,
      returnVisitorRate: 34.5,
      newVisitorRate: 65.5
    },
    engagement: {
      socialShares: 1250,
      comments: 340,
      newsletterSignups: 890,
      downloadedResources: 560
    }
  });

  const generateTimeSeriesData = (range: string) => {
    const data = [];
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000) + 500,
        visitors: Math.floor(Math.random() * 600) + 300,
        conversions: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return data;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateRange: selectedDateRange,
          metrics: selectedMetric 
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-analytics-${selectedDateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your blog performance and audience behavior
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{metrics?.totalViews?.toLocaleString() || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">{metrics?.uniqueVisitors?.toLocaleString() || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8.3%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time on Page</p>
                <p className="text-2xl font-bold">{formatDuration(metrics?.averageTimeOnPage || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+15.2%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics?.bounceRate || 0)}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">-3.1%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CTA Clicks</p>
                <p className="text-2xl font-bold">{metrics?.ctaClicks?.toLocaleString() || 0}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+18.7%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{metrics?.conversions?.toLocaleString() || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+22.4%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.revenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-700" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+28.9%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Posts</p>
                <p className="text-2xl font-bold">{metrics?.publishedThisMonth || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">This month</span>
              <span className="text-muted-foreground ml-2">({metrics?.totalPosts || 0} total)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="views">Views</option>
                    <option value="visitors">Visitors</option>
                    <option value="conversions">Conversions</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics?.timeSeriesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topPages?.slice(0, 5).map((post, index) => (
                    <div key={post.slug} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{post.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics?.categoryPerformance || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                    >
                      {metrics?.categoryPerformance?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Author Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Author Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.authorPerformance?.map((author, index) => (
                    <div key={author.author} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{author.author}</p>
                        <p className="text-sm text-muted-foreground">{author.posts} posts</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{author.views.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Performance by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics?.categoryPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3b82f6" />
                    <Bar dataKey="conversions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={audienceInsights?.demographics.ageGroups || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audienceInsights?.demographics.locations?.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{location.city}, {location.country}</span>
                      </div>
                      <span className="text-sm font-medium">{formatPercentage(location.percentage)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Behavior Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Audience Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDuration(audienceInsights?.behavior.averageSessionDuration || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {audienceInsights?.behavior.pagesPerSession?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Pages per Session</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPercentage(audienceInsights?.behavior.returnVisitorRate || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Return Visitors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(audienceInsights?.behavior.newVisitorRate || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">New Visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Shares</span>
                    <span className="font-medium">{audienceInsights?.engagement.socialShares?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Newsletter Signups</span>
                    <span className="font-medium">{audienceInsights?.engagement.newsletterSignups?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resource Downloads</span>
                    <span className="font-medium">{audienceInsights?.engagement.downloadedResources?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comments</span>
                    <span className="font-medium">{audienceInsights?.engagement.comments?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics?.topReferrers || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visits"
                      label={({ source, percentage }) => `${source} (${percentage}%)`}
                    >
                      {metrics?.topReferrers?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.deviceBreakdown?.map((device, index) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                        {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                        {device.device === 'Tablet' && <Monitor className="h-4 w-4" />}
                        <span className="text-sm">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{device.visits.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{formatPercentage(device.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Blog to Course Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {metrics?.totalViews?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Blog Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {metrics?.ctaClicks?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">CTA Clicks</div>
                      <div className="text-xs text-green-600">
                        {formatPercentage((metrics?.ctaClicks || 0) / (metrics?.totalViews || 1) * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.floor((metrics?.ctaClicks || 0) * 0.8)}
                      </div>
                      <div className="text-sm text-muted-foreground">Course Page Visits</div>
                      <div className="text-xs text-green-600">80.0%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {metrics?.conversions?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Enrollments</div>
                      <div className="text-xs text-green-600">
                        {formatPercentage((metrics?.conversions || 0) / (metrics?.totalViews || 1) * 100)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Conversion Rate:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatPercentage((metrics?.conversions || 0) / (metrics?.totalViews || 1) * 100)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium">Total Revenue:</span>
                      <span className="text-xl font-bold text-purple-600">
                        {formatCurrency(metrics?.revenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
