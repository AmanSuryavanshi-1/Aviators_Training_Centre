'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NADisplay, renderValueOrNA } from '@/components/admin/analytics/NADisplay';
import { naWrapperService, wrapNumeric, wrapValue } from '@/lib/analytics/NAWrapperService';
import { AuthenticityIndicator, ConfidenceScore, renderAuthenticityIndicator } from '@/components/admin/analytics/AuthenticityIndicator';
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
  DollarSign,
  CalendarIcon,
  DownloadIcon,
  BotIcon,
  ShieldCheckIcon
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

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
    bing: number;
    yahoo: number;
    duckduckgo: number;
    chatgpt: number;
    claude: number;
    gemini: number;
    copilot: number;
    perplexity: number;
    you_ai: number;
    facebook: number;
    instagram: number;
    twitter: number;
    linkedin: number;
    youtube: number;
    tiktok: number;
    reddit: number;
    quora: number;
    wikipedia: number;
    medium: number;
    stackoverflow: number;
    google_news: number;
    times_of_india: number;
    hindustan_times: number;
    aviation_jobs: number;
    pilot_career: number;
    aviation_week: number;
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
    gemini: number;
    copilot: number;
    perplexity: number;
    you_ai: number;
    other_ai: number;
  };
  isGoogleAnalyticsConfigured: boolean;
  measurementId: string | null;
}

interface AdvancedAnalyticsData {
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
  authenticity?: {
    authentic: boolean;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: number;
    spikeDetected: boolean;
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

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DetailedAnalyticsData | null>(null);
  const [advancedData, setAdvancedData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [filters, setFilters] = useState<FilterOptions>({
    validOnly: true
  });

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

  const fetchAdvancedAnalytics = useCallback(async () => {
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
      let realtimeData = { data: {} };
      
      if (realtimeResponse.ok) {
        realtimeData = await realtimeResponse.json();
      } else {
        // No fallback data - use null for genuine data only
        realtimeData = {
          data: {
            activeUsers: null, // Replaced mock data - use genuine API data only
            currentPageViews: null, // Replaced mock data - use genuine API data only
            conversionsToday: null, // Replaced mock data - use genuine API data only
            topPages: [], // Empty array when no genuine data available
            topSources: [], // Empty array when no genuine data available
            alerts: [] // Empty array when no genuine data available
          }
        };
      }
      
      // Process and combine data
      const processedData: AdvancedAnalyticsData = {
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
        realTimeMetrics: {
          activeUsers: realtimeData.data?.activeUsers || 0,
          currentPageViews: realtimeData.data?.currentPageViews || 0,
          conversionsToday: realtimeData.data?.conversionsToday || 0,
          topPages: realtimeData.data?.topPages || [],
          topSources: realtimeData.data?.topSources || [],
          alerts: realtimeData.data?.alerts || []
        },
        trends: {
          visitorsChange: null, // Replaced mock data - use genuine API data only
          conversionsChange: null, // Replaced mock data - use genuine API data only
          bounceRateChange: null // Replaced mock data - use genuine API data only
        }
      };
      
      // Calculate derived metrics
      if (processedData.overview.totalVisitors > 0) {
        processedData.overview.conversionRate = 
          (processedData.overview.totalConversions / processedData.overview.totalVisitors) * 100;
      }
      
      // Extract authenticity metadata from API response
      if (overviewData.metadata?.authenticity) {
        processedData.authenticity = overviewData.metadata.authenticity;
      }

      setAdvancedData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRefreshing(false);
    }
  }, [dateRange, filters]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDetailedAnalytics();
    fetchAdvancedAnalytics();
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

  useEffect(() => {
    fetchDetailedAnalytics();
    fetchAdvancedAnalytics();
  }, [timeframe, fetchAdvancedAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (selectedTab === 'realtime') {
        fetchAdvancedAnalytics();
      }
    }, 30000); // Refresh every 30 seconds for real-time tab
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedTab, fetchAdvancedAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg">Loading comprehensive analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData && !advancedData) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior, traffic sources, and conversions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/studio/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
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

            {/* Time Range Quick Select */}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="journeys">User Journeys</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {advancedData && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.overview.totalVisitors, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {renderValueOrNA(
                        wrapValue(advancedData.trends.visitorsChange, {
                          source: 'GA4-Production',
                          reason: 'data_not_found'
                        }),
                        { component: 'text' }
                      ) !== 'NA' ? (
                        <span className={cn(
                          "inline-flex items-center",
                          (advancedData.trends.visitorsChange || 0) > 0 
                            ? "text-green-600" : "text-red-600"
                        )}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {(advancedData.trends.visitorsChange || 0).toFixed(1)}%
                        </span>
                      ) : (
                        <NADisplay 
                          value={wrapValue(advancedData.trends.visitorsChange, {
                            source: 'GA4-Production',
                            reason: 'data_not_found'
                          })}
                          size="sm"
                          variant="muted"
                        />
                      )}
                      {" "}from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.overview.totalPageViews, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {advancedData.overview.totalPageViews && advancedData.overview.totalVisitors ? 
                        `${(advancedData.overview.totalPageViews / advancedData.overview.totalVisitors).toFixed(1)} pages per visitor` :
                        <NADisplay 
                          value={wrapValue(null, {
                            source: 'GA4-Production',
                            reason: 'data_not_found'
                          })}
                          size="sm"
                          variant="muted"
                        />
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.overview.totalConversions, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {renderValueOrNA(
                        wrapValue(advancedData.trends.conversionsChange, {
                          source: 'GA4-Production',
                          reason: 'data_not_found'
                        }),
                        { component: 'text' }
                      ) !== 'NA' ? (
                        <span className={cn(
                          "inline-flex items-center",
                          (advancedData.trends.conversionsChange || 0) > 0 
                            ? "text-green-600" : "text-red-600"
                        )}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {(advancedData.trends.conversionsChange || 0).toFixed(1)}%
                        </span>
                      ) : (
                        <NADisplay 
                          value={wrapValue(advancedData.trends.conversionsChange, {
                            source: 'GA4-Production',
                            reason: 'data_not_found'
                          })}
                          size="sm"
                          variant="muted"
                        />
                      )}
                      {" "}conversion rate: {renderValueOrNA(
                        wrapNumeric(advancedData.overview.conversionRate, {
                          format: 'percentage',
                          decimals: 2,
                          source: 'GA4-Production',
                          reason: 'data_not_found'
                        }),
                        { component: 'text' }
                      )}
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
                      {renderValueOrNA(
                        wrapNumeric(advancedData.overview.botTrafficPercentage, {
                          format: 'percentage',
                          decimals: 1,
                          source: 'AuthenticityChecker',
                          reason: 'data_processing_error'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AI Assistant: {renderValueOrNA(
                        wrapNumeric(advancedData.overview.aiAssistantTraffic, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )} visits
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Overview Content */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Traffic Quality
                      {advancedData.authenticity && (
                        <AuthenticityIndicator
                          result={{
                            authentic: advancedData.authenticity.authentic,
                            confidence: advancedData.authenticity.confidence,
                            reason: advancedData.authenticity.authentic ? 'Data verified' : 'Data flagged for review',
                            source: 'GA4-Production',
                            timestamp: new Date(),
                            flags: [],
                            riskLevel: advancedData.authenticity.riskLevel
                          }}
                          variant="icon"
                          size="sm"
                        />
                      )}
                    </CardTitle>
                    <CardDescription>Analysis of traffic authenticity and bot detection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Valid Human Traffic</span>
                        <Badge variant="secondary">
                          {(100 - advancedData.overview.botTrafficPercentage).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Assistant Traffic</span>
                        <Badge variant="outline">
                          {((advancedData.overview.aiAssistantTraffic / advancedData.overview.totalVisitors) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bot/Automated Traffic</span>
                        <Badge variant="destructive">
                          {advancedData.overview.botTrafficPercentage.toFixed(1)}%
                        </Badge>
                      </div>
                      {advancedData.authenticity && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Data Confidence</span>
                            <ConfidenceScore 
                              confidence={advancedData.authenticity.confidence}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                          {advancedData.authenticity.spikeDetected && (
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-orange-600">Traffic Spike Detected</span>
                              <Badge variant="secondary" className="text-orange-600">
                                Alert
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
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
                        <Badge variant={advancedData.overview.bounceRate > 70 ? "destructive" : "secondary"}>
                          {advancedData.overview.bounceRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg. Session Duration</span>
                        <Badge variant="outline">
                          {Math.floor(advancedData.overview.averageSessionDuration / 60)}m {Math.floor(advancedData.overview.averageSessionDuration % 60)}s
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Conversion Rate</span>
                        <Badge variant={advancedData.overview.conversionRate > 2 ? "default" : "secondary"}>
                          {advancedData.overview.conversionRate.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Detailed Analytics Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {analyticsData && (
            <>
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
                    <CardDescription>
                      Comprehensive source tracking with AI detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* AI Platforms Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">AI PLATFORMS</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity', 'you_ai'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Search Engines Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">SEARCH ENGINES</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['google', 'bing', 'yahoo', 'duckduckgo'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Social Media Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">SOCIAL MEDIA</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Professional & News */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">PROFESSIONAL & NEWS</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['reddit', 'quora', 'wikipedia', 'medium', 'stackoverflow', 'google_news', 'times_of_india', 'hindustan_times'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Aviation Specific */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">AVIATION INDUSTRY</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['aviation_jobs', 'pilot_career', 'aviation_week'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Other Sources */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">OTHER SOURCES</h4>
                        <div className="space-y-1">
                          {Object.entries(analyticsData.trafficSources)
                            .filter(([source]) => ['direct', 'meta_ads', 'other'].includes(source))
                            .map(([source, count]) => (
                              <div key={source} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
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
                      Comprehensive AI platform traffic analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">ChatGPT</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.chatgpt}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.chatgpt / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Claude</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.claude}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.claude / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">Gemini</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.gemini}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.gemini / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">Copilot</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.copilot}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.copilot / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="text-sm">Perplexity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.perplexity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.perplexity / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-sm">You.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.you_ai}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.you_ai / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span className="text-sm">Other AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{analyticsData.aiReferrals.other_ai}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {((analyticsData.aiReferrals.other_ai / analyticsData.uniqueUsers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-sm">Total AI Traffic</span>
                          <Badge variant="default">
                            {Object.values(analyticsData.aiReferrals).reduce((sum, val) => sum + val, 0)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {((Object.values(analyticsData.aiReferrals).reduce((sum, val) => sum + val, 0) / analyticsData.uniqueUsers) * 100).toFixed(1)}% of total traffic
                        </p>
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
            </>
          )}
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          {advancedData && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.realTimeMetrics.activeUsers, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently online</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Page Views (5min)</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.realTimeMetrics.currentPageViews, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Last 5 minutes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversions Today</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {renderValueOrNA(
                        wrapNumeric(advancedData.realTimeMetrics.conversionsToday, {
                          format: 'integer',
                          source: 'GA4-Production',
                          reason: 'api_unavailable'
                        }),
                        { component: 'text' }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Since midnight</p>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Alerts */}
              {advancedData.realTimeMetrics.alerts && advancedData.realTimeMetrics.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {advancedData.realTimeMetrics.alerts.map((alert, index) => (
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
                        {advancedData.realTimeMetrics.topPages && advancedData.realTimeMetrics.topPages.length > 0 ? (
                          advancedData.realTimeMetrics.topPages.map((page, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm truncate">{page.page}</span>
                              <Badge variant="secondary">{page.views}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <NADisplay 
                              reason="No real-time page data available - check GA4 configuration"
                              size="md"
                              variant="muted"
                            />
                          </div>
                        )}
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
                        {advancedData.realTimeMetrics.topSources && advancedData.realTimeMetrics.topSources.length > 0 ? (
                          advancedData.realTimeMetrics.topSources.map((source, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{source.source}</span>
                              <Badge variant="secondary">{source.visitors}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <NADisplay 
                              reason="No real-time source data available - check GA4 configuration"
                              size="md"
                              variant="muted"
                            />
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
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
              {analyticsData && analyticsData.trafficSources ? (
                <div className="space-y-4">
                  {Object.entries(analyticsData.trafficSources).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium capitalize">{source.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {renderValueOrNA(
                            wrapNumeric(count, {
                              format: 'integer',
                              source: 'GA4-Production',
                              reason: 'api_unavailable'
                            }),
                            { component: 'text' }
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {analyticsData.uniqueUsers > 0 ? ((count / analyticsData.uniqueUsers) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <NADisplay 
                    reason="No traffic sources data available - check GA4 and Search Console configuration"
                    size="lg"
                    variant="muted"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journeys Tab */}
        <TabsContent value="journeys" className="space-y-6">
          {analyticsData && analyticsData.conversionFunnel ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Journey Flow</CardTitle>
                  <CardDescription>
                    How users navigate through your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Entry Points</span>
                      <Badge variant="outline">
                        {renderValueOrNA(
                          wrapNumeric(analyticsData.conversionFunnel.visitors, {
                            format: 'integer',
                            source: 'GA4-Production',
                            reason: 'api_unavailable'
                          }),
                          { component: 'text' }
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Blog Engagement</span>
                      <Badge variant="outline">
                        {renderValueOrNA(
                          wrapNumeric(analyticsData.conversionFunnel.blogReaders, {
                            format: 'integer',
                            source: 'GA4-Production',
                            reason: 'api_unavailable'
                          }),
                          { component: 'text' }
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Contact Interest</span>
                      <Badge variant="outline">
                        {renderValueOrNA(
                          wrapNumeric(analyticsData.conversionFunnel.contactViews, {
                            format: 'integer',
                            source: 'GA4-Production',
                            reason: 'api_unavailable'
                          }),
                          { component: 'text' }
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Conversions</span>
                      <Badge variant="outline">
                        {renderValueOrNA(
                          wrapNumeric(analyticsData.conversionFunnel.formSubmissions, {
                            format: 'integer',
                            source: 'GA4-Production',
                            reason: 'api_unavailable'
                          }),
                          { component: 'text' }
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device & Browser Analytics</CardTitle>
                  <CardDescription>
                    User device and browser preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.deviceTypes && analyticsData.browsers ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Device Types</h4>
                        <div className="space-y-2">
                          {Object.entries(analyticsData.deviceTypes).map(([device, count]) => (
                            <div key={device} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{device}</span>
                              <Badge variant="outline">
                                {renderValueOrNA(
                                  wrapNumeric(count, {
                                    format: 'integer',
                                    source: 'GA4-Production',
                                    reason: 'api_unavailable'
                                  }),
                                  { component: 'text' }
                                )}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Browser Types</h4>
                        <div className="space-y-2">
                          {Object.entries(analyticsData.browsers).map(([browser, count]) => (
                            <div key={browser} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{browser}</span>
                              <Badge variant="outline">
                                {renderValueOrNA(
                                  wrapNumeric(count, {
                                    format: 'integer',
                                    source: 'GA4-Production',
                                    reason: 'api_unavailable'
                                  }),
                                  { component: 'text' }
                                )}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48">
                      <NADisplay 
                        reason="No device and browser data available - check GA4 configuration"
                        size="lg"
                        variant="muted"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <NADisplay 
                reason="No user journey data available - check GA4 and Firebase configuration"
                size="lg"
                variant="muted"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default AdvancedAnalyticsDashboard;