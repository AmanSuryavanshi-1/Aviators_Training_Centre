'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sankey, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingDownIcon,
  AlertTriangleIcon,
  UsersIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  LightbulbIcon,
  FilterIcon,
  EyeIcon,
  MousePointerClickIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelStep {
  stepNumber: number;
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeSpent: number;
  commonExitPages: string[];
}

interface DropOffPoint {
  fromStep: string;
  toStep: string;
  dropOffCount: number;
  dropOffRate: number;
  commonReasons: string[];
  optimizationSuggestions: string[];
}

interface UserPath {
  path: string[];
  frequency: number;
  conversionRate: number;
  averageDuration: number;
}

interface JourneySegment {
  name: string;
  journeyCount: number;
  conversionRate: number;
  averageDuration: number;
  topPages: string[];
  behaviorPatterns: string[];
}

interface FunnelData {
  name: string;
  steps: FunnelStep[];
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  dropOffPoints: DropOffPoint[];
}

interface UserJourneyFunnelProps {
  dateRange: { from: Date; to: Date };
  filters?: {
    sourceCategory?: string;
    deviceType?: string;
  };
}

export default function UserJourneyFunnel({ dateRange, filters }: UserJourneyFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [userPaths, setUserPaths] = useState<UserPath[]>([]);
  const [journeySegments, setJourneySegments] = useState<JourneySegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'funnel' | 'paths' | 'segments'>('funnel');
  const [selectedFunnel, setSelectedFunnel] = useState('default');

  useEffect(() => {
    fetchJourneyData();
  }, [dateRange, filters, selectedFunnel]);

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      
      // Fetch funnel analysis
      const funnelResponse = await fetch('/api/analytics/advanced?' + new URLSearchParams({
        type: 'funnel',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
        ...filters
      }));
      
      if (funnelResponse.ok) {
        const funnelResult = await funnelResponse.json();
        setFunnelData(funnelResult.data);
      }
      
      // Fetch user paths
      const pathsResponse = await fetch('/api/analytics/advanced?' + new URLSearchParams({
        type: 'journeys',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
        ...filters
      }));
      
      if (pathsResponse.ok) {
        const pathsResult = await pathsResponse.json();
        
        // Process paths data
        const pathMap = new Map<string, { count: number; conversions: number; totalDuration: number }>();
        
        pathsResult.data?.forEach((journey: any) => {
          const pathKey = journey.path?.map((step: any) => step.page).join(' → ') || 'Unknown Path';
          const existing = pathMap.get(pathKey);
          
          if (existing) {
            existing.count++;
            existing.totalDuration += journey.metrics?.duration || 0;
            if (journey.outcome?.type === 'conversion') {
              existing.conversions++;
            }
          } else {
            pathMap.set(pathKey, {
              count: 1,
              conversions: journey.outcome?.type === 'conversion' ? 1 : 0,
              totalDuration: journey.metrics?.duration || 0
            });
          }
        });
        
        const processedPaths = Array.from(pathMap.entries())
          .map(([path, data]) => ({
            path: path.split(' → '),
            frequency: data.count,
            conversionRate: data.count > 0 ? (data.conversions / data.count) * 100 : 0,
            averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
          }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 20);
        
        setUserPaths(processedPaths);
      }
      
      // Fetch journey segments
      const segmentsResponse = await fetch('/api/analytics/advanced?' + new URLSearchParams({
        type: 'segments',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
        ...filters
      }));
      
      if (segmentsResponse.ok) {
        const segmentsResult = await segmentsResponse.json();
        setJourneySegments(segmentsResult.data?.segments || []);
      }
      
    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFunnelVisualization = () => {
    if (!funnelData) return null;

    return (
      <div className="space-y-6">
        {/* Funnel Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnelData.totalEntries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Started the journey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnelData.totalConversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed the journey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnelData.overallConversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drop-off Points</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnelData.dropOffPoints.length}</div>
              <p className="text-xs text-muted-foreground">Critical issues found</p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Steps Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Step-by-step user journey analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.steps.map((step, index) => {
                const isLast = index === funnelData.steps.length - 1;
                const nextStep = funnelData.steps[index + 1];
                const dropOff = nextStep ? step.visitors - nextStep.visitors : 0;
                const dropOffRate = nextStep ? ((dropOff / step.visitors) * 100) : 0;
                
                return (
                  <div key={step.stepNumber} className="space-y-2">
                    {/* Step Card */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {step.stepNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.visitors.toLocaleString()} visitors
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{step.conversionRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Conv. Rate</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium">
                            {Math.floor(step.averageTimeSpent / 60000)}m {Math.floor((step.averageTimeSpent % 60000) / 1000)}s
                          </div>
                          <div className="text-muted-foreground">Avg. Time</div>
                        </div>
                        
                        {step.dropOffRate > 0 && (
                          <div className="text-center">
                            <div className={cn(
                              "font-medium",
                              step.dropOffRate > 50 ? "text-red-600" : step.dropOffRate > 25 ? "text-yellow-600" : "text-green-600"
                            )}>
                              {step.dropOffRate.toFixed(1)}%
                            </div>
                            <div className="text-muted-foreground">Drop-off</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="px-4">
                      <Progress 
                        value={(step.visitors / funnelData.totalEntries) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{((step.visitors / funnelData.totalEntries) * 100).toFixed(1)}% of total</span>
                        <span>{step.visitors.toLocaleString()} users</span>
                      </div>
                    </div>
                    
                    {/* Drop-off Analysis */}
                    {!isLast && dropOffRate > 10 && (
                      <div className="mx-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-yellow-800">
                          <AlertTriangleIcon className="h-4 w-4" />
                          <span className="font-medium">
                            High drop-off: {dropOff.toLocaleString()} users ({dropOffRate.toFixed(1)}%)
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Consider optimizing the transition from "{step.name}" to "{nextStep?.name}"
                        </p>
                      </div>
                    )}
                    
                    {/* Arrow to next step */}
                    {!isLast && (
                      <div className="flex justify-center">
                        <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Drop-off Analysis */}
        {funnelData.dropOffPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
                Drop-off Analysis & Optimization
              </CardTitle>
              <CardDescription>Critical points where users leave the funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.dropOffPoints.map((dropOff, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {dropOff.fromStep} → {dropOff.toStep}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dropOff.dropOffCount.toLocaleString()} users dropped off ({dropOff.dropOffRate.toFixed(1)}%)
                        </p>
                      </div>
                      <Badge variant={dropOff.dropOffRate > 50 ? "destructive" : "secondary"}>
                        {dropOff.dropOffRate.toFixed(1)}% drop-off
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                          Common Reasons
                        </h4>
                        <ul className="text-sm space-y-1">
                          {dropOff.commonReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-red-500 rounded-full" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <LightbulbIcon className="h-4 w-4 text-blue-500" />
                          Optimization Suggestions
                        </h4>
                        <ul className="text-sm space-y-1">
                          {dropOff.optimizationSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderUserPaths = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Common User Paths</CardTitle>
          <CardDescription>Top navigation patterns and their conversion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {userPaths.map((path, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {path.frequency} users ({((path.frequency / userPaths.reduce((sum, p) => sum + p.frequency, 0)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        {path.path.map((page, pageIndex) => (
                          <React.Fragment key={pageIndex}>
                            <span className="px-2 py-1 bg-muted rounded font-mono">
                              {page.length > 20 ? page.substring(0, 20) + '...' : page}
                            </span>
                            {pageIndex < path.path.length - 1 && (
                              <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{path.conversionRate.toFixed(1)}%</span>
                        <span className="text-muted-foreground ml-1">conv. rate</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(path.averageDuration / 60000)}m avg. duration
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={path.conversionRate} className="h-1" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderJourneySegments = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Journey Segmentation</CardTitle>
          <CardDescription>User behavior patterns by traffic source and characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {journeySegments.map((segment, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <CardDescription>
                    {segment.journeyCount.toLocaleString()} journeys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <Badge variant={segment.conversionRate > 5 ? "default" : "secondary"}>
                        {segment.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Duration</span>
                      <span className="text-sm font-medium">
                        {Math.floor(segment.averageDuration / 60000)}m {Math.floor((segment.averageDuration % 60000) / 1000)}s
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Pages</h4>
                    <div className="space-y-1">
                      {segment.topPages.slice(0, 3).map((page, pageIndex) => (
                        <div key={pageIndex} className="text-xs text-muted-foreground">
                          {page.length > 30 ? page.substring(0, 30) + '...' : page}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Behavior Patterns</h4>
                    <div className="flex flex-wrap gap-1">
                      {segment.behaviorPatterns.map((pattern, patternIndex) => (
                        <Badge key={patternIndex} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Journey Analysis</h2>
          <p className="text-muted-foreground">
            Conversion funnels, user paths, and behavior segmentation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-48">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Funnel</SelectItem>
              <SelectItem value="course_signup">Course Signup</SelectItem>
              <SelectItem value="contact_form">Contact Form</SelectItem>
              <SelectItem value="newsletter">Newsletter Signup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="paths">User Paths</TabsTrigger>
          <TabsTrigger value="segments">Journey Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-6">
          {renderFunnelVisualization()}
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          {renderUserPaths()}
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          {renderJourneySegments()}
        </TabsContent>
      </Tabs>
    </div>
  );
}