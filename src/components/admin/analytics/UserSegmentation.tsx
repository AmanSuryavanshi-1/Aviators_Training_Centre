'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon,
  TargetIcon,
  ClockIcon,
  DollarSignIcon,
  LayersIcon,
  AnalyticsIcon
} from 'lucide-react';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  percentage: number;
  conversionRate: number;
  averageValue: number;
  retentionRate: number;
  characteristics: string[];
  trends: {
    growth: number;
    engagement: number;
  };
}

interface CohortData {
  cohort: string;
  period: number;
  users: number;
  retentionRate: number;
  revenue: number;
}

interface UserSegmentationProps {
  dateRange: { from: Date; to: Date };
}

export default function UserSegmentation({ dateRange }: UserSegmentationProps) {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'segments' | 'cohorts' | 'behavior'>('segments');

  useEffect(() => {
    fetchSegmentationData();
  }, [dateRange]);

  const fetchSegmentationData = async () => {
    try {
      setLoading(true);
      
      // Mock segmentation data
      const mockSegments: UserSegment[] = [
        {
          id: 'new_visitors',
          name: 'New Visitors',
          description: 'First-time visitors to the site',
          userCount: 2450,
          percentage: 65,
          conversionRate: 2.3,
          averageValue: 85,
          retentionRate: 15,
          characteristics: ['First visit', 'High bounce rate', 'Exploration behavior'],
          trends: { growth: 12, engagement: -5 }
        },
        {
          id: 'returning_visitors',
          name: 'Returning Visitors',
          description: 'Users who have visited before',
          userCount: 980,
          percentage: 26,
          conversionRate: 8.7,
          averageValue: 145,
          retentionRate: 45,
          characteristics: ['Multiple visits', 'Higher engagement', 'Familiar with content'],
          trends: { growth: 8, engagement: 15 }
        },
        {
          id: 'ai_assistant_users',
          name: 'AI Assistant Users',
          description: 'Users coming from AI assistants',
          userCount: 340,
          percentage: 9,
          conversionRate: 12.1,
          averageValue: 220,
          retentionRate: 35,
          characteristics: ['High intent', 'Specific queries', 'Quick decision makers'],
          trends: { growth: 45, engagement: 25 }
        }
      ];

      const mockCohortData: CohortData[] = [
        { cohort: 'Jan 2024', period: 0, users: 1000, retentionRate: 100, revenue: 15000 },
        { cohort: 'Jan 2024', period: 1, users: 450, retentionRate: 45, revenue: 8500 },
        { cohort: 'Jan 2024', period: 2, users: 280, retentionRate: 28, revenue: 6200 },
        { cohort: 'Feb 2024', period: 0, users: 1200, retentionRate: 100, revenue: 18000 },
        { cohort: 'Feb 2024', period: 1, users: 600, retentionRate: 50, revenue: 12000 },
        { cohort: 'Mar 2024', period: 0, users: 1100, retentionRate: 100, revenue: 16500 }
      ];

      setSegments(mockSegments);
      setCohortData(mockCohortData);
    } catch (error) {
      console.error('Error fetching segmentation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSegments = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <LayersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">Active segments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {segments.reduce((sum, s) => sum + s.userCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all segments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(segments.reduce((sum, s) => sum + s.conversionRate, 0) / segments.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Value</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(segments.reduce((sum, s) => sum + s.averageValue, 0) / segments.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Segment Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segment Distribution</CardTitle>
            <CardDescription>User distribution across segments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="userCount"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 120}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate by Segment</CardTitle>
            <CardDescription>Performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={segments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversionRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Segment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
          <CardDescription>Comprehensive analysis of each user segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {segments.map((segment) => (
              <div key={segment.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{segment.name}</h3>
                    <p className="text-sm text-muted-foreground">{segment.description}</p>
                  </div>
                  <Badge variant="outline">{segment.percentage}% of users</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{segment.userCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{segment.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${segment.averageValue}</div>
                    <div className="text-sm text-muted-foreground">Avg Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{segment.retentionRate}%</div>
                    <div className="text-sm text-muted-foreground">Retention</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Key Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {segment.characteristics.map((char, index) => (
                      <Badge key={index} variant="secondary">{char}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Growth Trend</span>
                    <div className="flex items-center gap-1">
                      <TrendingUpIcon className={`h-3 w-3 ${segment.trends.growth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${segment.trends.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {segment.trends.growth > 0 ? '+' : ''}{segment.trends.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Engagement Trend</span>
                    <div className="flex items-center gap-1">
                      <TrendingUpIcon className={`h-3 w-3 ${segment.trends.engagement > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${segment.trends.engagement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {segment.trends.engagement > 0 ? '+' : ''}{segment.trends.engagement}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCohorts = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>User retention rates over time by cohort</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="retentionRate" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cohort Revenue Analysis</CardTitle>
          <CardDescription>Revenue generation by cohort over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Segmentation & Cohort Analysis</h2>
          <p className="text-muted-foreground">
            Behavioral and demographic segmentation with retention analysis
          </p>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          {renderSegments()}
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          {renderCohorts()}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Pattern Analysis</CardTitle>
              <CardDescription>Automated behavior pattern identification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Behavior pattern analysis will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}