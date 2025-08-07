'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Eye, 
  Clock, 
  MousePointer, 
  Users, 
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  Target,
  Search,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentPerformanceData {
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueUsers: number;
    avgTimeOnPage: string;
    bounceRate: number;
    conversions: number;
    conversionRate: number;
    trend: number; // percentage change
  }>;
  topBlogPosts: Array<{
    slug: string;
    title: string;
    author: string;
    publishedAt: string;
    views: number;
    uniqueUsers: number;
    avgTimeOnPage: string;
    bounceRate: number;
    shares: number;
    comments: number;
    trend: number;
  }>;
  seoPerformance: Array<{
    page: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    keywords: string[];
  }>;
  conversionPages: Array<{
    path: string;
    title: string;
    conversions: number;
    conversionRate: number;
    revenue: number;
    trend: number;
  }>;
  lastUpdated: string;
}

interface TopPerformingContentProps {
  timeframe?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  className?: string;
}

export default function TopPerformingContent({ 
  timeframe = 'week',
  limit = 10,
  className 
}: TopPerformingContentProps) {
  const [contentData, setContentData] = useState<ContentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pages');
  const [refreshing, setRefreshing] = useState(false);

  const fetchContentData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/analytics/top-content?timeframe=${timeframe}&limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setContentData(result.data);
      } else {
        setError(result.error || 'Failed to fetch content performance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, limit]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContentData();
  };

  useEffect(() => {
    fetchContentData();
  }, [fetchContentData]);

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingUp className="h-3 w-3 rotate-180" />;
    return null;
  };

  const formatTime = (timeString: string) => {
    const parts = timeString.split(':');
    const minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (minutes < 60) return `${minutes}s`;
    return `${Math.floor(minutes / 60)}m ${minutes % 60}s`;
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-72 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-4">
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
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
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!contentData) {
    return (
      <div className={cn("text-center py-12", className)}>
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No content performance data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-aviation-primary tracking-tight">
            Top Performing Content
          </h2>
          <p className="text-muted-foreground mt-1">
            Best performing pages and content based on engagement and conversions
          </p>
        </div>
        
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

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-aviation-primary/5">
          <TabsTrigger value="pages" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Top Pages
          </TabsTrigger>
          <TabsTrigger value="blog" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            SEO Performance
          </TabsTrigger>
          <TabsTrigger value="conversions" className="data-[state=active]:bg-aviation-primary data-[state=active]:text-white">
            Conversions
          </TabsTrigger>
        </TabsList>

        {/* Top Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          {contentData.topPages.map((page, index) => (
            <Card key={page.path} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-aviation-primary truncate">
                        {page.title}
                      </h3>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      {page.path}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Views</span>
                        </div>
                        <div className="font-semibold text-blue-600">
                          {page.views.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Users</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {page.uniqueUsers.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600">Time</span>
                        </div>
                        <div className="font-semibold text-orange-600">
                          {formatTime(page.avgTimeOnPage)}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600">CVR</span>
                        </div>
                        <div className="font-semibold text-purple-600">
                          {page.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor(page.trend))}>
                      {getTrendIcon(page.trend)}
                      {page.trend > 0 ? '+' : ''}{page.trend.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs last period
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="space-y-4">
          {contentData.topBlogPosts.map((post, index) => (
            <Card key={post.slug} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-aviation-primary truncate">
                        {post.title}
                      </h3>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Views</span>
                        </div>
                        <div className="font-semibold text-blue-600">
                          {post.views.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Time</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {formatTime(post.avgTimeOnPage)}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MousePointer className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600">Bounce</span>
                        </div>
                        <div className="font-semibold text-orange-600">
                          {post.bounceRate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Share2 className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600">Shares</span>
                        </div>
                        <div className="font-semibold text-purple-600">
                          {post.shares}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-teal-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-3 w-3 text-teal-600" />
                          <span className="text-xs text-teal-600">Users</span>
                        </div>
                        <div className="font-semibold text-teal-600">
                          {post.uniqueUsers.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor(post.trend))}>
                      {getTrendIcon(post.trend)}
                      {post.trend > 0 ? '+' : ''}{post.trend.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs last period
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* SEO Performance Tab */}
        <TabsContent value="seo" className="space-y-4">
          {contentData.seoPerformance.map((page, index) => (
            <Card key={page.page} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-aviation-primary truncate">
                        {page.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      {page.page}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MousePointer className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Clicks</span>
                        </div>
                        <div className="font-semibold text-blue-600">
                          {page.clicks.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Impressions</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {page.impressions.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600">CTR</span>
                        </div>
                        <div className="font-semibold text-orange-600">
                          {(page.ctr * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Search className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600">Position</span>
                        </div>
                        <div className="font-semibold text-purple-600">
                          {page.position.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {page.keywords.slice(0, 5).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {page.keywords.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{page.keywords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          {contentData.conversionPages.map((page, index) => (
            <Card key={page.path} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h3 className="font-semibold text-aviation-primary truncate">
                        {page.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 truncate">
                      {page.path}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Conversions</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {page.conversions}
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Rate</span>
                        </div>
                        <div className="font-semibold text-blue-600">
                          {page.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600">Value</span>
                        </div>
                        <div className="font-semibold text-purple-600">
                          ${page.revenue.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor(page.trend))}>
                      {getTrendIcon(page.trend)}
                      {page.trend > 0 ? '+' : ''}{page.trend.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs last period
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}