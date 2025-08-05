'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  BookOpenIcon,
  EyeIcon,
  ClockIcon,
  MousePointerClickIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  StarIcon,
  ThumbsUpIcon,
  ShareIcon,
  MessageCircleIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  LightbulbIcon,
  TargetIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  author: string;
  readingTime: number; // in minutes
  wordCount: number;
}

interface BlogPerformanceData {
  post: BlogPost;
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
    scrollDepth: number;
    socialShares: number;
    comments: number;
    conversions: number;
    conversionRate: number;
  };
  engagement: {
    readingCompletion: number; // percentage who read to end
    averageScrollDepth: number;
    timeSpentReading: number;
    returnVisitors: number;
    socialEngagement: number;
  };
  seo: {
    organicTraffic: number;
    averagePosition: number;
    clickThroughRate: number;
    impressions: number;
    topKeywords: string[];
  };
  conversionAttribution: {
    directConversions: number;
    assistedConversions: number;
    conversionValue: number;
    averageTimeToConversion: number; // in days
  };
  performanceScore: number; // 0-100
  recommendations: string[];
}

interface ContentOptimization {
  type: 'title' | 'content' | 'cta' | 'seo' | 'engagement';
  priority: 'low' | 'medium' | 'high';
  suggestion: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

interface BlogPerformanceAnalyticsProps {
  dateRange: { from: Date; to: Date };
  filters?: {
    category?: string;
    author?: string;
    minViews?: number;
  };
}

export default function BlogPerformanceAnalytics({ dateRange, filters }: BlogPerformanceAnalyticsProps) {
  const [blogData, setBlogData] = useState<BlogPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'posts' | 'optimization' | 'trends'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'pageViews' | 'conversions' | 'engagement'>('pageViews');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'performance' | 'views' | 'conversions' | 'date'>('performance');

  useEffect(() => {
    fetchBlogPerformanceData();
  }, [dateRange, filters]);

  const fetchBlogPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Mock blog performance data for demonstration
      const mockBlogData: BlogPerformanceData[] = [
        {
          post: {
            id: '1',
            title: 'Complete Guide to Private Pilot License Training',
            slug: 'private-pilot-license-guide',
            publishedAt: new Date('2024-01-15'),
            category: 'Training',
            tags: ['PPL', 'Training', 'Beginner'],
            author: 'Captain Smith',
            readingTime: 12,
            wordCount: 2400
          },
          metrics: {
            pageViews: 5420,
            uniqueVisitors: 4230,
            averageTimeOnPage: 480000, // 8 minutes
            bounceRate: 35,
            scrollDepth: 78,
            socialShares: 145,
            comments: 23,
            conversions: 42,
            conversionRate: 0.99
          },
          engagement: {
            readingCompletion: 65,
            averageScrollDepth: 78,
            timeSpentReading: 420000, // 7 minutes
            returnVisitors: 15,
            socialEngagement: 8.2
          },
          seo: {
            organicTraffic: 3200,
            averagePosition: 3.2,
            clickThroughRate: 12.5,
            impressions: 25600,
            topKeywords: ['private pilot license', 'PPL training', 'pilot school']
          },
          conversionAttribution: {
            directConversions: 28,
            assistedConversions: 14,
            conversionValue: 4200,
            averageTimeToConversion: 3.5
          },
          performanceScore: 92,
          recommendations: [
            'Add more internal links to related courses',
            'Optimize for "flight training cost" keyword',
            'Include video content to increase engagement'
          ]
        },
        {
          post: {
            id: '2',
            title: 'Understanding Aviation Weather Patterns',
            slug: 'aviation-weather-patterns',
            publishedAt: new Date('2024-01-20'),
            category: 'Weather',
            tags: ['Weather', 'Safety', 'Advanced'],
            author: 'Dr. Johnson',
            readingTime: 8,
            wordCount: 1600
          },
          metrics: {
            pageViews: 3210,
            uniqueVisitors: 2890,
            averageTimeOnPage: 360000, // 6 minutes
            bounceRate: 42,
            scrollDepth: 68,
            socialShares: 89,
            comments: 15,
            conversions: 18,
            conversionRate: 0.62
          },
          engagement: {
            readingCompletion: 58,
            averageScrollDepth: 68,
            timeSpentReading: 320000, // 5.3 minutes
            returnVisitors: 8,
            socialEngagement: 6.1
          },
          seo: {
            organicTraffic: 2100,
            averagePosition: 5.8,
            clickThroughRate: 8.9,
            impressions: 18400,
            topKeywords: ['aviation weather', 'weather patterns', 'flight safety']
          },
          conversionAttribution: {
            directConversions: 12,
            assistedConversions: 6,
            conversionValue: 1800,
            averageTimeToConversion: 5.2
          },
          performanceScore: 78,
          recommendations: [
            'Improve title for better CTR',
            'Add weather charts and visuals',
            'Create follow-up content series'
          ]
        },
        {
          post: {
            id: '3',
            title: 'Commercial Pilot Career Opportunities in 2024',
            slug: 'commercial-pilot-career-2024',
            publishedAt: new Date('2024-02-01'),
            category: 'Career',
            tags: ['Commercial', 'Career', 'Industry'],
            author: 'Captain Williams',
            readingTime: 15,
            wordCount: 3000
          },
          metrics: {
            pageViews: 7850,
            uniqueVisitors: 6420,
            averageTimeOnPage: 720000, // 12 minutes
            bounceRate: 28,
            scrollDepth: 85,
            socialShares: 234,
            comments: 45,
            conversions: 78,
            conversionRate: 1.21
          },
          engagement: {
            readingCompletion: 72,
            averageScrollDepth: 85,
            timeSpentReading: 680000, // 11.3 minutes
            returnVisitors: 28,
            socialEngagement: 12.4
          },
          seo: {
            organicTraffic: 4800,
            averagePosition: 2.1,
            clickThroughRate: 15.8,
            impressions: 30400,
            topKeywords: ['commercial pilot jobs', 'pilot career', 'airline pilot']
          },
          conversionAttribution: {
            directConversions: 52,
            assistedConversions: 26,
            conversionValue: 7800,
            averageTimeToConversion: 2.8
          },
          performanceScore: 96,
          recommendations: [
            'Update with latest industry data',
            'Add salary information section',
            'Create downloadable career guide'
          ]
        }
      ];
      
      setBlogData(mockBlogData);
    } catch (error) {
      console.error('Error fetching blog performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = blogData
    .filter(item => 
      searchTerm === '' || 
      item.post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.post.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performanceScore - a.performanceScore;
        case 'views':
          return b.metrics.pageViews - a.metrics.pageViews;
        case 'conversions':
          return b.metrics.conversions - a.metrics.conversions;
        case 'date':
          return b.post.publishedAt.getTime() - a.post.publishedAt.getTime();
        default:
          return 0;
      }
    });

  const getTotalViews = () => blogData.reduce((sum, item) => sum + item.metrics.pageViews, 0);
  const getTotalConversions = () => blogData.reduce((sum, item) => sum + item.metrics.conversions, 0);
  const getAveragePerformanceScore = () => 
    blogData.length > 0 ? blogData.reduce((sum, item) => sum + item.performanceScore, 0) / blogData.length : 0;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogData.length}</div>
            <p className="text-xs text-muted-foreground">Published posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalViews().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalConversions()}</div>
            <p className="text-xs text-muted-foreground">From blog content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAveragePerformanceScore().toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Performance score</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Performance Trends</CardTitle>
          <CardDescription>Views and conversions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={blogData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="post.title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="metrics.pageViews" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Page Views"
              />
              <Area 
                type="monotone" 
                dataKey="metrics.conversions" 
                stackId="2" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Conversions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Ranked by performance score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blogData.slice(0, 5).map((item, index) => (
              <div key={item.post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.post.category} • {item.post.readingTime} min read
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{item.metrics.pageViews.toLocaleString()}</div>
                    <div className="text-muted-foreground">Views</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">{item.metrics.conversions}</div>
                    <div className="text-muted-foreground">Conversions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">{item.performanceScore}</div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                  
                  <Badge variant={item.performanceScore > 90 ? "default" : item.performanceScore > 70 ? "secondary" : "outline"}>
                    {item.performanceScore > 90 ? "Excellent" : item.performanceScore > 70 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPostAnalysis = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <FilterIcon className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance">Performance Score</SelectItem>
            <SelectItem value="views">Page Views</SelectItem>
            <SelectItem value="conversions">Conversions</SelectItem>
            <SelectItem value="date">Publish Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Detailed Post Analysis */}
      <div className="space-y-6">
        {filteredAndSortedData.map((item) => (
          <Card key={item.post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.post.title}</CardTitle>
                  <CardDescription>
                    {item.post.category} • Published {item.post.publishedAt.toLocaleDateString()} • {item.post.readingTime} min read
                  </CardDescription>
                </div>
                <Badge variant={item.performanceScore > 90 ? "default" : item.performanceScore > 70 ? "secondary" : "outline"}>
                  Score: {item.performanceScore}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Traffic Metrics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Traffic & Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Page Views</span>
                      <span className="font-medium">{item.metrics.pageViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unique Visitors</span>
                      <span className="font-medium">{item.metrics.uniqueVisitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Time on Page</span>
                      <span className="font-medium">{Math.floor(item.metrics.averageTimeOnPage / 60000)}m {Math.floor((item.metrics.averageTimeOnPage % 60000) / 1000)}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bounce Rate</span>
                      <span className="font-medium">{item.metrics.bounceRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Content Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reading Completion</span>
                      <span className="font-medium">{item.engagement.readingCompletion}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scroll Depth</span>
                      <span className="font-medium">{item.engagement.averageScrollDepth}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Social Shares</span>
                      <span className="font-medium">{item.metrics.socialShares}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Comments</span>
                      <span className="font-medium">{item.metrics.comments}</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Metrics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Conversion Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="font-medium">{item.metrics.conversions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <span className="font-medium">{item.metrics.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversion Value</span>
                      <span className="font-medium">${item.conversionAttribution.conversionValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Time to Convert</span>
                      <span className="font-medium">{item.conversionAttribution.averageTimeToConversion.toFixed(1)} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Performance */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-sm mb-3">SEO Performance</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Organic Traffic</span>
                      <span className="font-medium">{item.seo.organicTraffic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Position</span>
                      <span className="font-medium">{item.seo.averagePosition.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Click-through Rate</span>
                      <span className="font-medium">{item.seo.clickThroughRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Top Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {item.seo.topKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {item.recommendations.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <LightbulbIcon className="h-4 w-4" />
                    Optimization Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {item.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Performance Analytics</h2>
          <p className="text-muted-foreground">
            Content-specific conversion tracking and optimization insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          {renderPostAnalysis()}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Optimization Opportunities</CardTitle>
              <CardDescription>AI-powered recommendations for improving blog performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Content optimization recommendations will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Historical analysis and trend identification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Trend analysis charts will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}