'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Clock, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Users,
  MousePointer,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PagePerformanceProps {
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: string;
  }>;
  totalPageviews: number;
  searchConsoleData?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  } | null;
}

interface PageMetricProps {
  title: string;
  path: string;
  views: number;
  avgTime: string;
  percentage: number;
  rank: number;
}

const PageMetricCard: React.FC<PageMetricProps> = ({ 
  title, 
  path, 
  views, 
  avgTime, 
  percentage, 
  rank 
}) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 20) return 'text-green-600';
    if (percentage >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs font-bold", getRankColor(rank))}>
                #{rank}
              </Badge>
              <h3 className="font-medium text-sm text-aviation-primary truncate">
                {title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {path}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-aviation-primary">
              {views.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" />
              views
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-aviation-secondary">
              {avgTime}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              avg time
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Share of traffic</span>
            <span className={cn("text-xs font-medium", getPerformanceColor(percentage))}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function PagePerformanceAnalysis({ 
  topPages, 
  totalPageviews, 
  searchConsoleData 
}: PagePerformanceProps) {
  const sortedPages = [...topPages].sort((a, b) => b.views - a.views);
  
  // Calculate engagement metrics
  const avgTimeInSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  };

  const totalEngagementTime = sortedPages.reduce((sum, page) => 
    sum + (avgTimeInSeconds(page.avgTime) * page.views), 0
  );
  
  const avgEngagementTime = totalPageviews > 0 ? totalEngagementTime / totalPageviews : 0;
  const avgEngagementMinutes = Math.floor(avgEngagementTime / 60);
  const avgEngagementSeconds = Math.floor(avgEngagementTime % 60);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-aviation-primary mb-1">
              {totalPageviews.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="h-4 w-4" />
              Total Page Views
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-aviation-secondary mb-1">
              {sortedPages.length}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Active Pages
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {avgEngagementMinutes}:{String(avgEngagementSeconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              Avg. Time on Page
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {sortedPages.length > 0 ? (totalPageviews / sortedPages.length).toFixed(0) : 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Avg. Views per Page
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Console Integration */}
      {searchConsoleData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <BarChart3 className="h-5 w-5" />
              Search Performance Overview
            </CardTitle>
            <CardDescription>
              How your pages perform in Google Search results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {searchConsoleData.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <MousePointer className="h-4 w-4" />
                  Search Clicks
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {searchConsoleData.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" />
                  Impressions
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(searchConsoleData.ctr * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Click-Through Rate
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {searchConsoleData.position.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg. Position
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <TrendingUp className="h-5 w-5" />
            Top Performing Pages
          </CardTitle>
          <CardDescription>
            Your most popular content ranked by page views and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedPages.slice(0, 9).map((page, index) => (
                <PageMetricCard
                  key={page.path}
                  title={page.title}
                  path={page.path}
                  views={page.views}
                  avgTime={page.avgTime}
                  percentage={totalPageviews > 0 ? (page.views / totalPageviews) * 100 : 0}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aviation-primary mb-2">
                No Page Data Available
              </h3>
              <p className="text-muted-foreground">
                Page performance data will appear once Google Analytics starts collecting data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <Users className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-aviation-primary mb-2">
                Top Page Performance
              </div>
              {sortedPages.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {((sortedPages[0].views / totalPageviews) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of total traffic goes to your top page
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-aviation-primary mb-2">
                Content Distribution
              </div>
              {sortedPages.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {sortedPages.length >= 3 ? 
                      (((sortedPages[0].views + sortedPages[1].views + sortedPages[2].views) / totalPageviews) * 100).toFixed(1) : 
                      ((sortedPages[0].views / totalPageviews) * 100).toFixed(1)
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of traffic comes from top 3 pages
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-aviation-primary mb-2">
                Engagement Quality
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {avgEngagementTime > 60 ? 'High' : avgEngagementTime > 30 ? 'Medium' : 'Low'}
              </div>
              <div className="text-sm text-muted-foreground">
                based on average time on page
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}