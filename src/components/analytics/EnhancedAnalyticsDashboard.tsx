'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Search,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RealTimeAnalytics from './RealTimeAnalytics';
import TopPerformingContent from './TopPerformingContent';
import AdvancedFilters, { FilterOptions } from './AdvancedFilters';
import { analyticsExportService, FilterOptions as ExportFilterOptions } from '@/lib/analytics/exportService';

interface AnalyticsData {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;
  uniqueUsers: number;
  realTimeUsers: number;
  
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
  
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: string;
  }>;
  
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
  
  aiReferrals: {
    chatgpt: number;
    claude: number;
    other_ai: number;
  };
  
  searchConsoleData: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  } | null;
  
  isGoogleAnalyticsConfigured: boolean;
  isSearchConsoleConfigured: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue',
  loading = false 
}) => {
  const colorClasses = {
    blue: 'text-aviation-primary bg-aviation-primary/10',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    teal: 'text-aviation-secondary bg-aviation-secondary/10'
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-aviation-primary">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-aviation-primary mb-1">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
          ) : (
            typeof value === 'number' ? value.toLocaleString() : value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend !== undefined && (
              <>
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : null}
                <span className={cn(
                  "font-medium",
                  trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
              </>
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    timeframe: 'week',
    validOnly: true,
    includeAI: true,
    includeBots: false
  });

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        timeframe: filters.timeframe
      });

      if (filters.dateRange) {
        params.append('from', filters.dateRange.from.toISOString());
        params.append('to', filters.dateRange.to.toISOString());
      }

      const response = await fetch(`/api/analytics/detailed?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setTimeframe(newFilters.timeframe as 'day' | 'week' | 'month' | 'all');
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // Convert FilterOptions to ExportFilterOptions
      const exportFilters: ExportFilterOptions = {
        timeframe: filters.timeframe,
        dateRange: filters.dateRange,
        sourceCategory: filters.sourceCategory,
        pageCategory: filters.pageCategory,
        deviceType: filters.deviceType,
        location: filters.location,
        validOnly: filters.validOnly,
        includeAI: filters.includeAI,
        includeBots: filters.includeBots,
        searchQuery: filters.searchQuery
      };

      if (format === 'csv') {
        const exportData = await analyticsExportService.fetchExportData(exportFilters);
        await analyticsExportService.exportToCSV(exportData, exportFilters);
      } else {
        const exportData = await analyticsExportService.fetchExportData(exportFilters);
        await analyticsExportService.exportToExcel(exportData, exportFilters);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data. Please try again.');
    }
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      timeframe: 'week',
      validOnly: true,
      includeAI: true,
      includeBots: false
    };
    setFilters(defaultFilters);
    setTimeframe('week');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-96 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const totalTrafficSources = Object.values(analyticsData.trafficSources).reduce((sum, val) => sum + val, 0);
  const totalDevices = Object.values(analyticsData.deviceTypes).reduce((sum, val) => sum + val, 0);
  const totalAIReferrals = Object.values(analyticsData.aiReferrals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aviation-primary tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights powered by genuine data from Google Analytics and Search Console
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-aviation-primary/20 hover:bg-aviation-primary hover:text-white"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        onReset={handleResetFilters}
        loading={loading || refreshing}
      />

      {/* Configuration Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={cn(
          "border-l-4",
          analyticsData.isGoogleAnalyticsConfigured ? "border-l-green-500 bg-green-50/50" : "border-l-yellow-500 bg-yellow-50/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-aviation-primary">Google Analytics 4</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.isGoogleAnalyticsConfigured 
                    ? 'Connected and pulling genuine traffic data'
                    : 'Not configured - Add API credentials for enhanced data'
                  }
                </p>
              </div>
              {analyticsData.isGoogleAnalyticsConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          analyticsData.isSearchConsoleConfigured ? "border-l-green-500 bg-green-50/50" : "border-l-gray-300 bg-gray-50/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-aviation-primary">Google Search Console</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.isSearchConsoleConfigured 
                    ? 'Connected and tracking search performance'
                    : 'Not configured - Add API credentials for search insights'
                  }
                </p>
              </div>
              {analyticsData.isSearchConsoleConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Visitors"
          value={analyticsData.uniqueUsers}
          subtitle="unique users"
          icon={Users}
          color="blue"
          loading={loading}
        />
        
        <MetricCard
          title="Page Views"
          value={analyticsData.pageviews}
          subtitle={`${analyticsData.realTimeUsers} active now`}
          icon={Eye}
          color="green"
          loading={loading}
        />
        
        <MetricCard
          title="Conversions"
          value={analyticsData.formSubmissions}
          subtitle={`${analyticsData.conversionFunnel.conversionRate.toFixed(1)}% conversion rate`}
          icon={Target}
          color="purple"
          loading={loading}
        />
        
        <MetricCard
          title="Total Events"
          value={analyticsData.totalEvents}
          subtitle="all interactions"
          icon={Activity}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-aviation-primary/5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Real-Time
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Top Content
          </TabsTrigger>
          <TabsTrigger value="traffic" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Traffic Sources
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Search Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-aviation-primary">
                <Target className="h-5 w-5" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>
                User journey from visitor to form submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-aviation-primary">{analyticsData.conversionFunnel.visitors}</div>
                  <div className="text-sm text-muted-foreground">Visitors</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.conversionFunnel.blogReaders}</div>
                  <div className="text-sm text-muted-foreground">Blog Readers</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <div className="text-2xl font-bold text-orange-600">{analyticsData.conversionFunnel.contactViews}</div>
                  <div className="text-sm text-muted-foreground">Contact Views</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.conversionFunnel.formSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Submissions</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-lg px-4 py-2 border-aviation-primary text-aviation-primary">
                  Conversion Rate: {analyticsData.conversionFunnel.conversionRate.toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Device & AI Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-aviation-primary">
                  <Monitor className="h-5 w-5" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.deviceTypes).map(([device, count]) => (
                    <div key={device} className="flex justify-between items-center">
                      <span className="text-sm capitalize flex items-center gap-2">
                        {device === 'desktop' && <Monitor className="h-4 w-4" />}
                        {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device === 'tablet' && <Smartphone className="h-4 w-4" />}
                        {device}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {totalDevices > 0 ? `${((count / totalDevices) * 100).toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-aviation-primary">
                  <Zap className="h-5 w-5" />
                  AI Platform Referrals
                </CardTitle>
                <CardDescription>
                  Traffic from AI platforms like ChatGPT and Claude
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ChatGPT</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {analyticsData.aiReferrals.chatgpt}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Claude</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {analyticsData.aiReferrals.claude}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other AI</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {analyticsData.aiReferrals.other_ai}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-sm">Total AI Traffic</span>
                      <Badge className="bg-aviation-primary text-white">
                        {totalAIReferrals}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-Time Tab */}
        <TabsContent value="realtime">
          <RealTimeAnalytics />
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="content">
          <TopPerformingContent timeframe={filters.timeframe as 'day' | 'week' | 'month' | 'all'} />
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-aviation-primary">
                <Globe className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.trafficSources)
                  .sort(([,a], [,b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <span className="text-sm capitalize font-medium">
                        {source.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{count}</Badge>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {totalTrafficSources > 0 ? `${((count / totalTrafficSources) * 100).toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Performance Tab */}
        <TabsContent value="search" className="space-y-6">
          {analyticsData.searchConsoleData ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Search Clicks"
                value={analyticsData.searchConsoleData.clicks}
                subtitle="from Google Search"
                icon={MousePointer}
                color="green"
              />
              
              <MetricCard
                title="Impressions"
                value={analyticsData.searchConsoleData.impressions}
                subtitle="times shown in search"
                icon={Eye}
                color="blue"
              />
              
              <MetricCard
                title="Click-Through Rate"
                value={`${(analyticsData.searchConsoleData.ctr * 100).toFixed(1)}%`}
                subtitle="CTR"
                icon={Target}
                color="purple"
              />
              
              <MetricCard
                title="Average Position"
                value={analyticsData.searchConsoleData.position.toFixed(1)}
                subtitle="in search results"
                icon={Search}
                color="orange"
              />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-aviation-primary mb-2">
                  Search Console Not Connected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Connect Google Search Console to see search performance data
                </p>
                <Button variant="outline" className="border-aviation-primary text-aviation-primary hover:bg-aviation-primary hover:text-white">
                  View Setup Guide
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-aviation-primary/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            Last updated: {new Date().toLocaleString()} • Data refreshed every 24 hours
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live data from Google Analytics & Search Console</span>
          </div>
        </div>
      </div>
    </div>
  );
}