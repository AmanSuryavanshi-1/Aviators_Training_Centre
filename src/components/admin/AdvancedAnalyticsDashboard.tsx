'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CalendarIcon, 
  DownloadIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  EyeIcon,
  MousePointerClickIcon,
  BotIcon,
  ShieldCheckIcon,
  LightbulbIcon
} from 'lucide-react';
// import AnalyticsInsights from './analytics/AnalyticsInsights';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalVisitors: number;
    totalPageViews: number;
    totalConversions: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    botTrafficPercentage: number;
    aiAssistantTraffic: number;
  };
  realTimeMetrics: {
    activeUsers: number;
    currentPageViews: number;
    conversionsToday: number;
    topPages: Array<{ page: string; views: number }>;
    topSources: Array<{ source: string; visitors: number }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: number;
    }>;
  };
  trends: {
    visitorsChange: number;
    conversionsChange: number;
    bounceRateChange: number;
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

interface FilterOptions {
  sourceCategory?: string;
  pageCategory?: string;
  deviceType?: string;
  location?: string;
  validOnly?: boolean;
}

export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [filters, setFilters] = useState<FilterOptions>({
    validOnly: true
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch overview data
      const params = new URLSearchParams({
        type: 'events',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString()
      });
      
      // Add filters as strings
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      const overviewResponse = await fetch('/api/analytics/advanced?' + params.toString());
      
      if (!overviewResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const overviewData = await overviewResponse.json();
      
      // Fetch real-time metrics
      const realtimeResponse = await fetch('/api/analytics/realtime?type=metrics');
      const realtimeData = realtimeResponse.ok ? await realtimeResponse.json() : { data: {} };
      
      // Process and combine data
      const processedData: AnalyticsData = {
        overview: {
          totalVisitors: overviewData.data?.length || 0,
          totalPageViews: overviewData.data?.reduce((sum: number, event: any) => 
            sum + (event.event?.type === 'page_view' ? 1 : 0), 0) || 0,
          totalConversions: overviewData.data?.reduce((sum: number, event: any) => 
            sum + (event.event?.type === 'conversion' ? 1 : 0), 0) || 0,
          conversionRate: 0, // Will be calculated
          averageSessionDuration: 0, // Will be calculated
          bounceRate: 0, // Will be calculated
          botTrafficPercentage: overviewData.data?.reduce((sum: number, event: any) => 
            sum + (event.validation?.isBot ? 1 : 0), 0) / (overviewData.data?.length || 1) * 100 || 0,
          aiAssistantTraffic: overviewData.data?.reduce((sum: number, event: any) => 
            sum + (event.source?.category === 'ai_assistant' ? 1 : 0), 0) || 0
        },
        realTimeMetrics: realtimeData.data || {
          activeUsers: 0,
          currentPageViews: 0,
          conversionsToday: 0,
          topPages: [],
          topSources: [],
          alerts: []
        },
        trends: {
          visitorsChange: Math.random() * 20 - 10, // Mock data
          conversionsChange: Math.random() * 30 - 15,
          bounceRateChange: Math.random() * 10 - 5
        }
      };
      
      // Calculate derived metrics
      if (processedData.overview.totalVisitors > 0) {
        processedData.overview.conversionRate = 
          (processedData.overview.totalConversions / processedData.overview.totalVisitors) * 100;
      }
      
      setAnalyticsData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (selectedTab === 'realtime') {
        fetchAnalyticsData();
      }
    }, 30000); // Refresh every 30 seconds for real-time tab
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedTab, fetchAnalyticsData]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle data export
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          dateRange,
          filters,
          type: selectedTab
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format}-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCwIcon className="h-4 w-4 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior, traffic sources, and conversions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCwIcon className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <Select onValueChange={(value) => handleExport(value as 'csv' | 'excel')}>
            <SelectTrigger className="w-32">
              <DownloadIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-64 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Source Category Filter */}
            <Select onValueChange={(value) => handleFilterChange('sourceCategory', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Source Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="ai_assistant">AI Assistant</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            {/* Page Category Filter */}
            <Select onValueChange={(value) => handleFilterChange('pageCategory', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Page Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="about">About</SelectItem>
              </SelectContent>
            </Select>

            {/* Device Type Filter */}
            <Select onValueChange={(value) => handleFilterChange('deviceType', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            {/* Valid Traffic Only Toggle */}
            <Button
              variant={filters.validOnly ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('validOnly', !filters.validOnly)}
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Valid Traffic Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="journeys">User Journeys</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.totalVisitors.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={cn(
                    "inline-flex items-center",
                    analyticsData?.trends.visitorsChange && analyticsData.trends.visitorsChange > 0 
                      ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    {analyticsData?.trends.visitorsChange?.toFixed(1)}%
                  </span>
                  {" "}from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.totalPageViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(analyticsData?.overview.totalPageViews / analyticsData?.overview.totalVisitors || 0).toFixed(1)} pages per visitor
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.totalConversions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={cn(
                    "inline-flex items-center",
                    analyticsData?.trends.conversionsChange && analyticsData.trends.conversionsChange > 0 
                      ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    {analyticsData?.trends.conversionsChange?.toFixed(1)}%
                  </span>
                  {" "}conversion rate: {analyticsData?.overview.conversionRate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bot Traffic</CardTitle>
                <BotIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.overview.botTrafficPercentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  AI Assistant: {analyticsData?.overview.aiAssistantTraffic.toLocaleString()} visits
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Overview Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Quality</CardTitle>
                <CardDescription>Analysis of traffic authenticity and bot detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valid Human Traffic</span>
                    <Badge variant="secondary">
                      {(100 - (analyticsData?.overview.botTrafficPercentage || 0)).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Assistant Traffic</span>
                    <Badge variant="outline">
                      {((analyticsData?.overview.aiAssistantTraffic || 0) / (analyticsData?.overview.totalVisitors || 1) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bot/Automated Traffic</span>
                    <Badge variant="destructive">
                      {analyticsData?.overview.botTrafficPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <Badge variant={analyticsData?.overview.bounceRate && analyticsData.overview.bounceRate > 70 ? "destructive" : "secondary"}>
                      {analyticsData?.overview.bounceRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Session Duration</span>
                    <Badge variant="outline">
                      {Math.floor((analyticsData?.overview.averageSessionDuration || 0) / 60)}m {Math.floor((analyticsData?.overview.averageSessionDuration || 0) % 60)}s
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Rate</span>
                    <Badge variant={analyticsData?.overview.conversionRate && analyticsData.overview.conversionRate > 2 ? "default" : "secondary"}>
                      {analyticsData?.overview.conversionRate.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Insights</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced insights and recommendations will be available here.
                This feature is currently being enhanced for production deployment.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.realTimeMetrics.activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views (5min)</CardTitle>
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.realTimeMetrics.currentPageViews}
                </div>
                <p className="text-xs text-muted-foreground">Last 5 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions Today</CardTitle>
                <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.realTimeMetrics.conversionsToday}
                </div>
                <p className="text-xs text-muted-foreground">Since midnight</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Alerts */}
          {analyticsData?.realTimeMetrics.alerts && analyticsData.realTimeMetrics.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-4 w-4" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {analyticsData.realTimeMetrics.alerts.map((alert, index) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertDescription className="flex justify-between items-center">
                          <span>{alert.message}</span>
                          <Badge variant="outline">
                            {format(new Date(alert.timestamp), 'HH:mm')}
                          </Badge>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Top Pages and Sources */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages (Last Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {analyticsData?.realTimeMetrics.topPages.map((page, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate">{page.page}</span>
                        <Badge variant="secondary">{page.views}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Sources (Last Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {analyticsData?.realTimeMetrics.topSources.map((source, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{source.source}</span>
                        <Badge variant="secondary">{source.visitors}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of traffic sources including AI assistant detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.realTimeMetrics.topSources && analyticsData.realTimeMetrics.topSources.length > 0 ? (
                  analyticsData.realTimeMetrics.topSources.map((source, index) => (
                    <div key={source.source} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">{source.source}</span>
                      </div>
                      <Badge variant="secondary">{source.visitors} visitors</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No traffic source data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journeys Tab */}
        <TabsContent value="journeys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Analysis</CardTitle>
              <CardDescription>
                Conversion funnels and user path analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.realTimeMetrics.topPages && analyticsData.realTimeMetrics.topPages.length > 0 ? (
                  analyticsData.realTimeMetrics.topPages.map((page, index) => (
                    <div key={page.page} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">{page.page}</span>
                      </div>
                      <Badge variant="outline">{page.views} views</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No user journey data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}