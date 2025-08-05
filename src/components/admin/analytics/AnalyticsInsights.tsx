'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle,
  Clock,
  Users,
  Target,
  FileText,
  Smartphone
} from 'lucide-react';
import { 
  AnalyticsInsight, 
  PerformanceAlert, 
  OptimizationRecommendation,
  insightsService 
} from '@/lib/analytics/insightsService';

interface AnalyticsInsightsProps {
  timeRange: { start: Date; end: Date };
  onRefresh?: () => void;
}

export default function AnalyticsInsights({ timeRange, onRefresh }: AnalyticsInsightsProps) {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadInsightsData();
  }, [timeRange]);

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      const [insightsData, alertsData, recommendationsData] = await Promise.all([
        insightsService.generateInsights(timeRange),
        insightsService.getAlerts(),
        insightsService.getRecommendations()
      ]);

      setInsights(insightsData);
      setAlerts(alertsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'traffic': return <Users className="h-4 w-4" />;
      case 'conversion': return <Target className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'user_behavior': return <Smartphone className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const markInsightAsRead = (insightId: string) => {
    insightsService.markInsightAsRead(insightId);
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ));
  };

  const unreadCount = insights.filter(i => !i.isRead).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
          <CardDescription>Loading insights and recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Analytics Insights
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations for your analytics data
            </CardDescription>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-4">
            <ScrollArea className="h-96">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available for the selected time range.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <Alert 
                      key={insight.id} 
                      className={`cursor-pointer transition-all ${
                        !insight.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                      onClick={() => markInsightAsRead(insight.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTitle className="text-sm font-medium">
                              {insight.title}
                            </AlertTitle>
                            <Badge variant={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            {!insight.isRead && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <AlertDescription className="text-sm mb-3">
                            {insight.description}
                          </AlertDescription>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-sm font-medium text-primary mb-1">
                              Recommendation:
                            </p>
                            <p className="text-sm">{insight.recommendation}</p>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Impact:</span> {insight.impact}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <ScrollArea className="h-96">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No performance alerts at this time.</p>
                  <p className="text-sm">Your analytics are performing normally.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <div className="flex items-start gap-3">
                        {alert.alertType === 'spike' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTitle className="text-sm font-medium">
                              {alert.metric} {alert.alertType === 'spike' ? 'Spike' : 'Drop'} Detected
                            </AlertTitle>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm mb-2">
                            {alert.message}
                          </AlertDescription>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Current:</span> {alert.currentValue}
                            </div>
                            <div>
                              <span className="font-medium">Previous:</span> {alert.previousValue}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toDate().toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <ScrollArea className="h-96">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No optimization recommendations available.</p>
                  <p className="text-sm">Your analytics performance looks good!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline">
                              {rec.implementationEffort} effort
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-primary mb-1">
                            Expected Impact:
                          </p>
                          <p className="text-sm">{rec.expectedImpact}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Implementation Steps:</p>
                          <ul className="text-sm space-y-1">
                            {rec.steps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-muted-foreground">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Key Metrics to Track:</p>
                          <div className="flex flex-wrap gap-1">
                            {rec.metrics.map((metric, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}