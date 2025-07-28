'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointer,
  Share2
} from 'lucide-react';
import {
  OptimizationSuggestion,
  TrendingTopic,
  ContentGap,
  PerformancePrediction,
  PerformanceAnalysis
} from '@/lib/analytics/performance-optimizer';

interface PerformanceOptimizationDashboardProps {
  className?: string;
}

export default function PerformanceOptimizationDashboard({ 
  className = '' 
}: PerformanceOptimizationDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  
  // State for different data types
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  
  // Advanced features state
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);

  // Available blog posts for selection
  const [blogPosts] = useState([
    { id: '1', title: 'Complete Guide to DGCA Exam Preparation' },
    { id: '2', title: 'Commercial Pilot License Requirements in India' },
    { id: '3', title: 'Understanding Aircraft Navigation Systems' },
    { id: '4', title: 'Aviation Safety Best Practices for Student Pilots' },
    { id: '5', title: 'Weather Interpretation for Pilots' }
  ]);

  useEffect(() => {
    loadTrendingTopics();
    loadContentGaps();
    loadPerformanceAnalysis();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (selectedPostId) {
      loadSuggestions();
      loadPrediction();
    }
  }, [selectedPostId]);

  const loadSuggestions = async () => {
    if (!selectedPostId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=suggestions&postId=${selectedPostId}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/optimization?action=trending');
      const data = await response.json();
      setTrendingTopics(data.trendingTopics || []);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    }
  };

  const loadContentGaps = async () => {
    try {
      const response = await fetch('/api/admin/analytics/optimization?action=content-gaps');
      const data = await response.json();
      setContentGaps(data.contentGaps || []);
    } catch (error) {
      console.error('Failed to load content gaps:', error);
    }
  };

  const loadPerformanceAnalysis = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=performance-analysis&timeRange=${selectedTimeRange}`);
      const data = await response.json();
      setPerformanceAnalysis(data.analysis || null);
    } catch (error) {
      console.error('Failed to load performance analysis:', error);
    }
  };

  const loadPrediction = async () => {
    if (!selectedPostId) return;
    
    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=predict&postId=${selectedPostId}`);
      const data = await response.json();
      setPrediction(data.prediction || null);
    } catch (error) {
      console.error('Failed to load prediction:', error);
    }
  };

  const loadAdvancedReport = async () => {
    if (!selectedPostId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=advanced-report&postId=${selectedPostId}`);
      const data = await response.json();
      
      if (data.report) {
        // Convert advanced report to suggestions format for display
        const advancedSuggestions = [
          ...data.report.criticalIssues,
          ...data.report.quickWins,
          ...data.report.longTermOpportunities
        ];
        setSuggestions(advancedSuggestions);
      }
    } catch (error) {
      console.error('Failed to load advanced report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBulkOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics/optimization?action=bulk-optimization');
      const data = await response.json();
      
      if (data.bulkOptimization) {
        console.log('Bulk optimization results:', data.bulkOptimization);
        // You could set this to a new state variable for bulk results display
      }
    } catch (error) {
      console.error('Failed to load bulk optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContentIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-content-ideas',
          data: { category: 'aviation', keywords: ['pilot', 'training', 'aviation'] }
        }),
      });
      const data = await response.json();
      setContentIdeas(data.contentIdeas || []);
    } catch (error) {
      console.error('Failed to generate content ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimization-roadmap',
          data: { timeframe: '3months', priority: 'high' }
        }),
      });
      const data = await response.json();
      setRoadmapItems(data.roadmap || []);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important': return <Target className="h-4 w-4 text-orange-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSuggestionBadgeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'important': return 'default';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Optimization</h2>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations to improve blog performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Optimization</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {performanceAnalysis && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceAnalysis.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    In selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceAnalysis.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all posts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceAnalysis.totalConversions}</div>
                  <p className="text-xs text-muted-foreground">
                    Course enrollments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(performanceAnalysis.averageConversionRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Views to conversions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {performanceAnalysis && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Posts</CardTitle>
                  <CardDescription>Highest conversion rates in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalysis.topPerforming.slice(0, 5).map((post, index) => (
                      <div key={post.postId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-48">{post.title}</p>
                            <p className="text-xs text-muted-foreground">{post.conversions} conversions</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {(post.conversionRate * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Underperforming Posts</CardTitle>
                  <CardDescription>Posts that need optimization attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalysis.underPerforming.slice(0, 5).map((post, index) => (
                      <div key={post.postId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-48">{post.title}</p>
                            <p className="text-xs text-muted-foreground">{post.views} views</p>
                          </div>
                        </div>
                        <Badge variant="destructive">
                          {(post.conversionRate * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Content Optimization</CardTitle>
              <CardDescription>Select a blog post to get comprehensive optimization analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a blog post to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogPosts.map(post => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={loadAdvancedReport} 
                  disabled={!selectedPostId || loading}
                  variant="outline"
                >
                  Advanced Analysis
                </Button>
                <Button 
                  onClick={loadBulkOptimization} 
                  disabled={loading}
                  variant="secondary"
                >
                  Bulk Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {suggestions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Critical Issues</span>
                  </CardTitle>
                  <CardDescription>Issues that need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.filter(s => s.type === 'critical').slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.action}</p>
                        <Badge variant="destructive" className="mt-2 text-xs">
                          {suggestion.estimatedImprovement}
                        </Badge>
                      </div>
                    ))}
                    {suggestions.filter(s => s.type === 'critical').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No critical issues found!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Quick Wins</span>
                  </CardTitle>
                  <CardDescription>High-impact, low-effort improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.filter(s => s.type === 'suggestion' && s.impact === 'high').slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.action}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {suggestion.estimatedImprovement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Optimization Suggestions</CardTitle>
                <CardDescription>Complete list of recommendations sorted by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: suggestion.type === 'critical' ? '#ef4444' : 
                                      suggestion.type === 'important' ? '#f97316' : '#3b82f6'
                    }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getSuggestionIcon(suggestion.type)}
                            <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSuggestionBadgeColor(suggestion.type) as any} className="text-xs">
                              {suggestion.type}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact} impact
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-sm">{suggestion.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Action Required:</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.action}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <div className="text-sm font-medium text-green-600">
                              {suggestion.estimatedImprovement}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Aviation Topics</CardTitle>
              <CardDescription>High-opportunity topics based on search volume and competition analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{topic.topic}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          Score: {(topic.opportunityScore * 100).toFixed(0)}
                        </Badge>
                        {topic.contentGap && (
                          <Badge variant="destructive">Content Gap</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Search Volume</p>
                        <p className="text-sm font-medium">{topic.searchVolume.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Competition</p>
                        <p className={`text-sm font-medium ${getCompetitionColor(topic.competitionLevel)}`}>
                          {topic.competitionLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Relevance</p>
                        <p className="text-sm font-medium">{(topic.relevanceScore * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Opportunity</p>
                        <p className="text-sm font-medium text-green-600">
                          {(topic.opportunityScore * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Suggested Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.suggestedKeywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Gap Analysis</CardTitle>
              <CardDescription>Identify missing content opportunities in aviation training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{gap.topic}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {gap.recommendedContentType}
                        </Badge>
                        <Badge variant="secondary">
                          Difficulty: {(gap.difficultyScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Search Demand</p>
                        <p className="text-sm font-medium">{gap.searchDemand.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Competitor Coverage</p>
                        <p className="text-sm font-medium">{(gap.competitorCoverage * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Opportunity Score</p>
                        <p className="text-sm font-medium text-green-600">
                          {((1 - gap.competitorCoverage) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Missing Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {gap.missingKeywords.map((keyword, kidx) => (
                          <Badge key={kidx} variant="destructive" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Predictions</CardTitle>
              <CardDescription>AI-powered forecasting for blog post performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select a blog post to predict performance" />
                </SelectTrigger>
                <SelectContent>
                  {blogPosts.map(post => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {prediction && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Predicted Performance</CardTitle>
                  <CardDescription>
                    Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predicted Views:</span>
                      <span className="text-lg font-bold">{prediction.predictedViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predicted Conversions:</span>
                      <span className="text-lg font-bold text-green-600">{prediction.predictedConversions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predicted Conversion Rate:</span>
                      <span className="text-lg font-bold">
                        {((prediction.predictedConversions / prediction.predictedViews) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Factors</CardTitle>
                  <CardDescription>Key factors influencing the prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{factor.factor}</p>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </div>
                        <Badge variant="secondary">
                          +{(factor.impact * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actions to improve predicted performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Ideas Generator</CardTitle>
                <CardDescription>AI-powered content suggestions based on trends and gaps</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateContentIdeas} 
                  disabled={loading}
                  className="w-full"
                >
                  Generate Content Ideas
                </Button>
                {contentIdeas.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {contentIdeas.slice(0, 5).map((idea, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">{idea.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={idea.type === 'trending' ? 'default' : 'secondary'} className="text-xs">
                            {idea.type}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Est. {idea.estimatedViews.toLocaleString()} views
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {idea.keywords.slice(0, 3).map((keyword: string, kidx: number) => (
                            <Badge key={kidx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Roadmap</CardTitle>
                <CardDescription>Strategic plan for improving all content</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateRoadmap} 
                  disabled={loading}
                  className="w-full"
                >
                  Generate Roadmap
                </Button>
                {roadmapItems.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {roadmapItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          <Badge 
                            variant={item.priority === 'high' ? 'destructive' : 
                                   item.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>Score: {item.overallScore}/100</span>
                          <span>{item.estimatedTime}h to complete</span>
                        </div>
                        {item.nextActions && item.nextActions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Next: {item.nextActions[0].task}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Forecasting</CardTitle>
              <CardDescription>Advanced predictive analytics for content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {trendingTopics.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Trending Opportunities</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {contentGaps.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Content Gaps Identified</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceAnalysis ? Math.round(performanceAnalysis.averageConversionRate * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}