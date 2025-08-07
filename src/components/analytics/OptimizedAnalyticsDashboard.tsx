'use client';

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDebounce,
  useThrottle,
  useMemoizedData,
  useLazyLoad,
  usePerformanceMonitor,
  useOptimizedFetch,
  analyticsCache,
  performanceUtils
} from '@/lib/analytics/performanceOptimizations';

interface AnalyticsData {
  totalUsers: number;
  pageviews: number;
  conversions: number;
  bounceRate: number;
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    users: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    users: number;
    pageviews: number;
  }>;
}

interface OptimizedMetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
}

// Memoized metric card component
const OptimizedMetricCard = memo<OptimizedMetricCardProps>(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  loading = false 
}) => {
  usePerformanceMonitor(`MetricCard-${title}`);

  const formattedValue = useMemo(() => {
    return value.toLocaleString();
  }, [value]);

  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [trend]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-2 bg-aviation-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-aviation-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-aviation-primary">
            {formattedValue}
          </div>
          <p className={cn("text-xs flex items-center gap-1", trendColor)}>
            {trend && (
              <TrendingUp className={cn(
                "h-3 w-3",
                trend === 'down' && "rotate-180"
              )} />
            )}
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedMetricCard.displayName = 'OptimizedMetricCard';

// Lazy-loaded chart component
const LazyChartComponent = memo<{ data: any[]; title: string }>(({ data, title }) => {
  const { elementRef, isVisible, hasLoaded } = useLazyLoad(200);
  usePerformanceMonitor(`LazyChart-${title}`);

  const processedData = useMemoizedData(
    data,
    (rawData) => {
      // Expensive data processing
      return rawData.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
    },
    [data.length] // Only reprocess if data length changes
  );

  return (
    <div ref={elementRef} className="min-h-[200px]">
      {hasLoaded ? (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Showing {processedData.length} data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center space-y-2">
                <Activity className="h-8 w-8 text-aviation-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Chart visualization ({processedData.length} points)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 h-48 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-gray-200 animate-pulse rounded mx-auto" />
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

LazyChartComponent.displayName = 'LazyChartComponent';

// Main optimized dashboard component
interface OptimizedAnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number;
}

export default function OptimizedAnalyticsDashboard({ 
  className,
  refreshInterval = 30000 // 30 seconds
}: OptimizedAnalyticsDashboardProps) {
  usePerformanceMonitor('OptimizedAnalyticsDashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Debounced search to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Throttled timeframe changes
  const throttledTimeframe = useThrottle(selectedTimeframe, 1000);

  // Optimized data fetching with caching
  const {
    data: analyticsData,
    loading,
    error,
    refetch
  } = useOptimizedFetch<AnalyticsData>(
    `/api/analytics/dashboard?timeframe=${throttledTimeframe}&search=${debouncedSearchTerm}`,
    {},
    5 // 5 minute cache TTL
  );

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Memoized metric calculations
  const metrics = useMemoizedData(
    analyticsData,
    (data) => {
      if (!data) return [];

      return [
        {
          title: 'Total Users',
          value: data.totalUsers,
          subtitle: '+12% from last period',
          icon: Users,
          trend: 'up' as const
        },
        {
          title: 'Page Views',
          value: data.pageviews,
          subtitle: '+8% from last period',
          icon: Eye,
          trend: 'up' as const
        },
        {
          title: 'Conversions',
          value: data.conversions,
          subtitle: '+23% from last period',
          icon: MousePointer,
          trend: 'up' as const
        },
        {
          title: 'Bounce Rate',
          value: Math.round(data.bounceRate * 100),
          subtitle: '-5% from last period',
          icon: TrendingUp,
          trend: 'down' as const
        }
      ];
    },
    [analyticsData?.totalUsers, analyticsData?.pageviews, analyticsData?.conversions, analyticsData?.bounceRate]
  );

  // Optimized event handlers
  const handleRefresh = useCallback(
    performanceUtils.measureTime(() => {
      analyticsCache.clear();
      refetch();
    }, 'Dashboard Refresh'),
    [refetch]
  );

  const handleTimeframeChange = useCallback((timeframe: string) => {
    setSelectedTimeframe(timeframe);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Error boundary fallback
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to load analytics</h3>
              <p className="text-sm">{error.message}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("optimized-analytics-dashboard space-y-6", className)}>
      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Zap className="h-3 w-3 mr-1" />
            Optimized
          </Badge>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-aviation-primary tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Performance-optimized analytics with intelligent caching
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border rounded-md text-sm w-48"
          />

          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Auto-refresh Toggle */}
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              autoRefresh && "animate-spin"
            )} />
            Auto-refresh
          </Button>

          {/* Manual Refresh */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              loading && "animate-spin"
            )} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <OptimizedMetricCard
            key={`${metric.title}-${index}`}
            {...metric}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <LazyChartComponent
          data={analyticsData?.trafficSources || []}
          title="Traffic Sources"
        />
        <LazyChartComponent
          data={analyticsData?.topPages || []}
          title="Top Pages"
        />
      </div>

      {/* Time Series Chart */}
      <LazyChartComponent
        data={analyticsData?.timeSeriesData || []}
        title="Traffic Trends"
      />

      {/* Cache Status (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Cache size: {analyticsCache.size()} items</p>
              <p>Search term: {debouncedSearchTerm || 'None'}</p>
              <p>Timeframe: {throttledTimeframe}</p>
              <p>Auto-refresh: {autoRefresh ? 'Enabled' : 'Disabled'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}