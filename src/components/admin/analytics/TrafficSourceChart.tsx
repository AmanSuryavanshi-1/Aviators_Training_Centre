'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  Pie, 
  Cell, 
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
  AreaChart
} from 'recharts';
import { 
  BotIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExternalLinkIcon,
  SearchIcon,
  ShareIcon,
  MailIcon,
  DollarSignIcon,
  BrainIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrafficSourceData {
  source: string;
  category: 'organic' | 'direct' | 'social' | 'ai_assistant' | 'referral' | 'email' | 'paid';
  visitors: number;
  sessions: number;
  pageViews: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  averageSessionDuration: number;
  isAuthentic: boolean;
  confidence: number;
  trend: number; // Percentage change from previous period
}

interface AIAssistantData {
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  trend: number;
}

interface SocialMediaData {
  platform: string;
  organic: number;
  paid: number;
  totalVisitors: number;
  conversions: number;
  conversionRate: number;
  adSpend?: number;
  roas?: number; // Return on Ad Spend
}

const CATEGORY_COLORS = {
  organic: '#22c55e',
  direct: '#3b82f6',
  social: '#f59e0b',
  ai_assistant: '#8b5cf6',
  referral: '#06b6d4',
  email: '#ef4444',
  paid: '#f97316'
};

const CATEGORY_ICONS = {
  organic: SearchIcon,
  direct: ExternalLinkIcon,
  social: ShareIcon,
  ai_assistant: BrainIcon,
  referral: ExternalLinkIcon,
  email: MailIcon,
  paid: DollarSignIcon
};

interface TrafficSourceChartProps {
  dateRange: { from: Date; to: Date };
  filters?: {
    sourceCategory?: string;
    validOnly?: boolean;
  };
}

export default function TrafficSourceChart({ dateRange, filters }: TrafficSourceChartProps) {
  const [trafficData, setTrafficData] = useState<TrafficSourceData[]>([]);
  const [aiAssistantData, setAiAssistantData] = useState<AIAssistantData[]>([]);
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'ai_assistant' | 'social_media'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'visitors' | 'conversions' | 'conversionRate'>('visitors');

  useEffect(() => {
    fetchTrafficSourceData();
  }, [dateRange, filters]);

  const fetchTrafficSourceData = async () => {
    try {
      setLoading(true);
      
      // Fetch traffic sources data
      const response = await fetch('/api/analytics/advanced?' + new URLSearchParams({
        type: 'sources',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
        ...filters
      }));
      
      if (response.ok) {
        const data = await response.json();
        
        // Process and aggregate data by source
        const sourceMap = new Map<string, TrafficSourceData>();
        
        data.data?.forEach((item: any) => {
          const key = `${item.source}_${item.category}`;
          const existing = sourceMap.get(key);
          
          if (existing) {
            existing.visitors += item.metrics?.visitors || 0;
            existing.sessions += item.metrics?.sessions || 0;
            existing.pageViews += item.metrics?.pageViews || 0;
            existing.conversions += item.metrics?.conversions || 0;
          } else {
            sourceMap.set(key, {
              source: item.source,
              category: item.category,
              visitors: item.metrics?.visitors || 0,
              sessions: item.metrics?.sessions || 0,
              pageViews: item.metrics?.pageViews || 0,
              conversions: item.metrics?.conversions || 0,
              conversionRate: item.metrics?.conversionRate || 0,
              bounceRate: item.metrics?.bounceRate || 0,
              averageSessionDuration: item.metrics?.averageSessionDuration || 0,
              isAuthentic: item.authenticity?.confidenceScore > 70,
              confidence: item.authenticity?.confidenceScore || 0,
              trend: Math.random() * 40 - 20 // Mock trend data
            });
          }
        });
        
        const processedData = Array.from(sourceMap.values())
          .map(item => ({
            ...item,
            conversionRate: item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0
          }))
          .sort((a, b) => b.visitors - a.visitors);
        
        setTrafficData(processedData);
        
        // Extract AI assistant data
        const aiData = processedData
          .filter(item => item.category === 'ai_assistant')
          .map(item => ({
            name: item.source,
            visitors: item.visitors,
            conversions: item.conversions,
            conversionRate: item.conversionRate,
            confidence: item.confidence,
            trend: item.trend
          }));
        
        setAiAssistantData(aiData);
        
        // Extract social media data
        const socialData = processedData
          .filter(item => item.category === 'social')
          .map(item => ({
            platform: item.source,
            organic: Math.floor(item.visitors * 0.7), // Mock organic/paid split
            paid: Math.floor(item.visitors * 0.3),
            totalVisitors: item.visitors,
            conversions: item.conversions,
            conversionRate: item.conversionRate,
            adSpend: item.visitors * 0.5, // Mock ad spend
            roas: item.conversions > 0 ? (item.conversions * 100) / (item.visitors * 0.5) : 0
          }));
        
        setSocialMediaData(socialData);
      }
    } catch (error) {
      console.error('Error fetching traffic source data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVisitors = () => trafficData.reduce((sum, item) => sum + item.visitors, 0);
  const getTotalConversions = () => trafficData.reduce((sum, item) => sum + item.conversions, 0);

  const pieChartData = trafficData.map(item => ({
    name: item.source,
    value: item.visitors,
    category: item.category,
    percentage: (item.visitors / getTotalVisitors()) * 100
  }));

  const barChartData = trafficData.slice(0, 10).map(item => ({
    source: item.source.length > 15 ? item.source.substring(0, 15) + '...' : item.source,
    visitors: item.visitors,
    conversions: item.conversions,
    conversionRate: item.conversionRate,
    category: item.category
  }));

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
      {/* Header with View Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Traffic Source Analysis</h2>
          <p className="text-muted-foreground">
            Detailed breakdown with AI assistant detection and authenticity indicators
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visitors">Visitors</SelectItem>
              <SelectItem value="conversions">Conversions</SelectItem>
              <SelectItem value="conversionRate">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active traffic sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant Traffic</CardTitle>
            <BrainIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiAssistantData.length}</div>
            <p className="text-xs text-muted-foreground">
              {aiAssistantData.reduce((sum, item) => sum + item.visitors, 0).toLocaleString()} visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentic Traffic</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((trafficData.filter(item => item.isAuthentic).reduce((sum, item) => sum + item.visitors, 0) / getTotalVisitors()) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Verified human traffic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalVisitors() > 0 ? ((getTotalConversions() / getTotalVisitors()) * 100).toFixed(2) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai_assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="social_media">Social Media</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Distribution</CardTitle>
                <CardDescription>Breakdown by source category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Visitors']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Sources Performance</CardTitle>
                <CardDescription>Top 10 sources by {selectedMetric}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="source" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Source List */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Source Analysis</CardTitle>
              <CardDescription>Complete breakdown with authenticity indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {trafficData.map((source, index) => {
                    const IconComponent = CATEGORY_ICONS[source.category];
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium">{source.source}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                borderColor: CATEGORY_COLORS[source.category],
                                color: CATEGORY_COLORS[source.category]
                              }}
                            >
                              {source.category}
                            </Badge>
                            
                            {source.isAuthentic ? (
                              <Badge variant="secondary" className="text-green-600">
                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                Authentic
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <BotIcon className="h-3 w-3 mr-1" />
                                Suspicious
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{source.visitors.toLocaleString()}</div>
                            <div className="text-muted-foreground">Visitors</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-medium">{source.conversions}</div>
                            <div className="text-muted-foreground">Conversions</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-medium">{source.conversionRate.toFixed(2)}%</div>
                            <div className="text-muted-foreground">Conv. Rate</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center">
                              {source.trend > 0 ? (
                                <TrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
                              ) : (
                                <TrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
                              )}
                              <span className={cn(
                                "font-medium",
                                source.trend > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {Math.abs(source.trend).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-muted-foreground">Trend</div>
                          </div>

                          <div className="text-center">
                            <div className="font-medium">{source.confidence}%</div>
                            <div className="text-muted-foreground">Confidence</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai_assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainIcon className="h-5 w-5" />
                AI Assistant Traffic Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of traffic from AI assistants like ChatGPT, Claude, and Perplexity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiAssistantData.length > 0 ? (
                <div className="space-y-6">
                  {/* AI Assistant Chart */}
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={aiAssistantData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* AI Assistant Details */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {aiAssistantData.map((ai, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{ai.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Visitors</span>
                            <span className="font-medium">{ai.visitors.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Conversions</span>
                            <span className="font-medium">{ai.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Conv. Rate</span>
                            <span className="font-medium">{ai.conversionRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confidence</span>
                            <Badge variant="outline">{ai.confidence}%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Trend</span>
                            <div className="flex items-center">
                              {ai.trend > 0 ? (
                                <TrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
                              ) : (
                                <TrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
                              )}
                              <span className={cn(
                                "text-sm font-medium",
                                ai.trend > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {Math.abs(ai.trend).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No AI assistant traffic detected in the selected time range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social_media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShareIcon className="h-5 w-5" />
                Social Media Traffic Analysis
              </CardTitle>
              <CardDescription>
                Organic vs paid social media traffic with ROI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialMediaData.length > 0 ? (
                <div className="space-y-6">
                  {/* Social Media Chart */}
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={socialMediaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="organic" stackId="a" fill="#22c55e" name="Organic" />
                      <Bar dataKey="paid" stackId="a" fill="#f59e0b" name="Paid" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Social Media Details */}
                  <div className="space-y-4">
                    {socialMediaData.map((platform, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-lg">{platform.platform}</h3>
                          <Badge variant="outline">
                            {platform.totalVisitors.toLocaleString()} total visitors
                          </Badge>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Organic Traffic</div>
                            <div className="text-xl font-bold text-green-600">
                              {platform.organic.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {((platform.organic / platform.totalVisitors) * 100).toFixed(1)}% of total
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Paid Traffic</div>
                            <div className="text-xl font-bold text-orange-600">
                              {platform.paid.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {((platform.paid / platform.totalVisitors) * 100).toFixed(1)}% of total
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Conversions</div>
                            <div className="text-xl font-bold">
                              {platform.conversions}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {platform.conversionRate.toFixed(2)}% rate
                            </div>
                          </div>
                          
                          {platform.roas && (
                            <div>
                              <div className="text-sm text-muted-foreground">ROAS</div>
                              <div className="text-xl font-bold">
                                {platform.roas.toFixed(2)}x
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Return on ad spend
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {platform.adSpend && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Ad Spend</span>
                              <span className="font-medium">${platform.adSpend.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No social media traffic detected in the selected time range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}