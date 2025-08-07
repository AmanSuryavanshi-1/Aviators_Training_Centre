'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Eye, 
  TrendingUp, 
  Globe, 
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeData {
  activeUsers: number;
  currentPageViews: number;
  conversionsToday: number;
  topPagesNow: Array<{
    page: string;
    title: string;
    views: number;
    activeUsers: number;
  }>;
  topSourcesNow: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'traffic_spike' | 'conversion_drop' | 'error_rate' | 'performance';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
  }>;
  lastUpdated: string;
}

interface RealTimeAnalyticsProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export default function RealTimeAnalytics({ 
  autoRefresh = true, 
  refreshInterval = 30000, // 30 seconds
  className 
}: RealTimeAnalyticsProps) {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealTimeData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/analytics/realtime');
      const result = await response.json();

      if (result.success) {
        setRealTimeData(result.data);
        setLastRefresh(new Date());
      } else {
        setError(result.error || 'Failed to fetch real-time data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchRealTimeData();
  };

  useEffect(() => {
    fetchRealTimeData();
  }, [fetchRealTimeData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRealTimeData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRealTimeData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'traffic_spike': return TrendingUp;
      case 'conversion_drop': return Target;
      case 'error_rate': return AlertTriangle;
      case 'performance': return Zap;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
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
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={handleManualRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!realTimeData) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No real-time data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-aviation-primary tracking-tight">
            Real-Time Analytics
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live data • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <Button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-aviation-primary/20 hover:bg-aviation-primary hover:text-white"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aviation-primary">Active Users</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-aviation-primary mb-1">
              {realTimeData.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Right now
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aviation-primary">Page Views Today</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-aviation-primary">
              <Eye className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-aviation-primary mb-1">
              {realTimeData.currentPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Since midnight
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aviation-primary">Conversions Today</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-aviation-primary mb-1">
              {realTimeData.conversionsToday.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Form submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aviation-primary">System Status</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-1">
              Healthy
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages and Sources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages Right Now */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <Eye className="h-5 w-5" />
              Top Pages Right Now
            </CardTitle>
            <CardDescription>
              Most viewed pages in the last 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData.topPagesNow.map((page, index) => (
                <div key={page.page} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-sm truncate">
                        {page.title || page.page}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {page.page}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-aviation-primary">
                      {page.views}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {page.activeUsers} active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <Globe className="h-5 w-5" />
              Top Traffic Sources
            </CardTitle>
            <CardDescription>
              Current traffic sources in the last hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData.topSourcesNow.map((source, index) => (
                <div key={source.source} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm capitalize">
                      {source.source.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-aviation-primary">
                      {source.visitors}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {source.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {realTimeData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData.alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg",
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <AlertIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {alert.message}
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}