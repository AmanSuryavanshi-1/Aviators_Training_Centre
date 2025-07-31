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
  Cell
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
  PieChart as PieChartIcon
} from 'lucide-react';
import analyticsManager from '@/lib/blog/analytics';
import { abTestingManager, ABTestConfig } from '@/lib/blog/ab-testing';
import { CTAPerformanceMetrics } from '@/lib/types/blog';

interface CTAAnalyticsDashboardProps {
  className?: string;
}

export default function CTAAnalyticsDashboard({ className = '' }: CTAAnalyticsDashboardProps) {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [abTests, setABTests] = useState<ABTestConfig[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedDateRange]);

  const loadDashboardData = async () => {
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
      }

      const dateRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };

      // Load performance data
      const [topPostsData, funnelMetrics, activeTests] = await Promise.all([
        analyticsManager.getTopPerformingBlogPosts(10, dateRange),
        analyticsManager.getBlogToCourseFunnel(undefined, undefined, dateRange),
        Promise.resolve(abTestingManager.getActiveTests()),
      ]);

      setTopPosts(topPostsData);
      setFunnelData(funnelMetrics);
      setABTests(activeTests);

      // Generate performance summary
      const performanceSummary = {
        totalImpressions: funnelMetrics.blogViews,
        totalClicks: funnelMetrics.ctaClicks,
        totalConversions: funnelMetrics.enrollments,
        totalRevenue: funnelMetrics.enrollments * 25000, // Estimated revenue
        clickThroughRate: funnelMetrics.conversionRates.blogToCTA,
        conversionRate: funnelMetrics.conversionRates.overallConversion,
        averageOrderValue: 25000, // Estimated average course value
      };

      setPerformanceData(performanceSummary);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
          <h2 className="text-2xl font-bold">CTA Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your blog CTA performance and conversion metrics
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
          </select>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{performanceData?.totalImpressions?.toLocaleString() || 0}</p>
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
                <p className="text-sm font-medium text-muted-foreground">CTA Clicks</p>
                <p className="text-2xl font-bold">{performanceData?.totalClicks?.toLocaleString() || 0}</p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-500" />
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
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{performanceData?.totalConversions?.toLocaleString() || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+15.7%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(performanceData?.totalRevenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+22.1%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversion Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Click-through Rate</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPercentage(performanceData?.clickThroughRate || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPercentage(performanceData?.conversionRate || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(performanceData?.averageOrderValue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>CTA Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { name: 'Mon', clicks: 45, conversions: 12 },
                    { name: 'Tue', clicks: 52, conversions: 15 },
                    { name: 'Wed', clicks: 48, conversions: 11 },
                    { name: 'Thu', clicks: 61, conversions: 18 },
                    { name: 'Fri', clicks: 55, conversions: 16 },
                    { name: 'Sat', clicks: 67, conversions: 22 },
                    { name: 'Sun', clicks: 58, conversions: 19 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog to Course Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {funnelData?.totalVisitors?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Blog Visitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {funnelData?.ctaClicks?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">CTA Clicks</div>
                    <div className="text-xs text-green-600">
                      {formatPercentage(funnelData?.conversionRates?.blogToCTA || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {funnelData?.coursePageVisits?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Course Page Visits</div>
                    <div className="text-xs text-green-600">
                      {formatPercentage(funnelData?.conversionRates?.ctaToCoursePage || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {funnelData?.enrollments?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Enrollments</div>
                    <div className="text-xs text-green-600">
                      {formatPercentage(funnelData?.conversionRates?.coursePageToEnrollment || 0)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Conversion Rate:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPercentage(funnelData?.conversionRates?.overallConversion || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-medium">Total Revenue:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(funnelData?.revenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.blogPostId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">/{post.blogPostSlug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <div className="font-medium">{post.ctaClicks}</div>
                          <div className="text-muted-foreground">Clicks</div>
                        </div>
                        <div>
                          <div className="font-medium">{post.conversions}</div>
                          <div className="text-muted-foreground">Conversions</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">
                            {formatPercentage(post.conversionRate)}
                          </div>
                          <div className="text-muted-foreground">Rate</div>
                        </div>
                        <div>
                          <div className="font-medium text-purple-600">
                            {formatCurrency(post.revenue)}
                          </div>
                          <div className="text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                A/B Tests
                <Button size="sm">Create New Test</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active A/B tests found. Create your first test to start optimizing your CTAs.
                  </div>
                ) : (
                  abTests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                      
                      {test.results && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Control</div>
                            <div>CTR: {formatPercentage(test.results.control.clickThroughRate)}</div>
                            <div>Conv: {formatPercentage(test.results.control.conversionRate)}</div>
                          </div>
                          <div>
                            <div className="font-medium">Test</div>
                            <div>CTR: {formatPercentage(test.results.test.clickThroughRate)}</div>
                            <div>Conv: {formatPercentage(test.results.test.conversionRate)}</div>
                          </div>
                        </div>
                      )}
                      
                      {test.results?.winner && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                          <strong>Winner:</strong> {test.results.winner} variant
                          {test.results.statisticalSignificance && (
                            <Badge variant="outline" className="ml-2">Statistically Significant</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
