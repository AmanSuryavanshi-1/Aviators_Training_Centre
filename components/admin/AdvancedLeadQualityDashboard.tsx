'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  Filter,
  UserCheck,
  UserX,
  Zap,
  Eye,
  Brain,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  RefreshCw
} from 'lucide-react';

interface AdvancedLeadQualityData {
  summary: {
    totalLeads: number;
    qualifiedLeads: number;
    averageScore: number;
    conversionRate: number;
    averageTimeToConversion: number;
    qualityTrend: number; // percentage change
  };
  
  scoreDistribution: {
    ranges: Array<{
      range: string;
      count: number;
      percentage: number;
      conversionRate: number;
      averageValue: number;
    }>;
  };
  
  qualityBreakdown: {
    hot: { count: number; percentage: number; conversionRate: number; averageScore: number };
    warm: { count: number; percentage: number; conversionRate: number; averageScore: number };
    cold: { count: number; percentage: number; conversionRate: number; averageScore: number };
    unqualified: { count: number; percentage: number; conversionRate: number; averageScore: number };
  };
  
  componentAnalysis: {
    demographic: { average: number; impact: number; topFactors: string[] };
    behavioral: { average: number; impact: number; topFactors: string[] };
    intent: { average: number; impact: number; topFactors: string[] };
    engagement: { average: number; impact: number; topFactors: string[] };
  };
  
  leadSources: Array<{
    source: string;
    count: number;
    averageScore: number;
    qualityDistribution: Record<string, number>;
    conversionRate: number;
    roi: number;
  }>;
  
  timeAnalysis: {
    hourlyDistribution: Array<{ hour: number; count: number; averageScore: number }>;
    dailyTrend: Array<{ date: string; leads: number; averageScore: number; qualityIndex: number }>;
    seasonalPatterns: Array<{ period: string; leads: number; quality: number }>;
  };
  
  predictiveInsights: {
    conversionProbability: Array<{
      leadId: string;
      score: number;
      probability: number;
      estimatedValue: number;
      timeToConversion: number;
    }>;
    qualityPredictors: Array<{
      factor: string;
      importance: number;
      positiveImpact: boolean;
      description: string;
    }>;
    recommendations: Array<{
      type: 'optimization' | 'process' | 'targeting';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImpact: string;
    }>;
  };
  
  workflowAnalysis: {
    totalWorkflows: number;
    successRate: number;
    averageExecutionTime: number;
    topPerformingRules: Array<{
      ruleId: string;
      ruleName: string;
      executions: number;
      successRate: number;
      averageImpact: number;
    }>;
    bottlenecks: Array<{
      stage: string;
      dropOffRate: number;
      averageTime: number;
      suggestions: string[];
    }>;
  };
}

const COLORS = ['#DC2626', '#F59E0B', '#3B82F6', '#6B7280'];
const QUALITY_COLORS = {
  hot: '#DC2626',
  warm: '#F59E0B', 
  cold: '#3B82F6',
  unqualified: '#6B7280'
};

export default function AdvancedLeadQualityDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [data, setData] = useState<AdvancedLeadQualityData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeadQualityData();
  }, [dateRange, selectedSource]);

  const fetchLeadQualityData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics/lead-quality?dateRange=${dateRange}&source=${selectedSource}`
      );
      const qualityData = await response.json();
      setData(qualityData);
    } catch (error) {
      console.error('Error fetching lead quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchLeadQualityData();
    setRefreshing(false);
  };

  const exportQualityReport = async () => {
    try {
      const response = await fetch(
        `/api/admin/analytics/lead-quality/export?dateRange=${dateRange}&format=xlsx`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-quality-report-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting quality report:', error);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No lead quality data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Lead Quality Analytics</h1>
          <p className="text-gray-600">Deep insights into lead scoring, qualification, and conversion patterns</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button onClick={exportQualityReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.summary.totalLeads.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <UserCheck className="w-3 h-3 mr-1 text-green-500" />
              {data.summary.qualifiedLeads} qualified
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.summary.averageScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <TrendingUp className={`w-3 h-3 mr-1 ${data.summary.qualityTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              {data.summary.qualityTrend >= 0 ? '+' : ''}{data.summary.qualityTrend.toFixed(1)}% trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(data.summary.conversionRate)}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Activity className="w-3 h-3 mr-1 text-blue-500" />
              Lead to customer
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Avg Time to Convert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(data.summary.averageTimeToConversion)}d
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              Days to conversion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Workflow Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(data.workflowAnalysis.successRate)}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              {data.workflowAnalysis.totalWorkflows} workflows
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Analysis</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Lead Quality Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hot', value: data.qualityBreakdown.hot.count, color: QUALITY_COLORS.hot },
                        { name: 'Warm', value: data.qualityBreakdown.warm.count, color: QUALITY_COLORS.warm },
                        { name: 'Cold', value: data.qualityBreakdown.cold.count, color: QUALITY_COLORS.cold },
                        { name: 'Unqualified', value: data.qualityBreakdown.unqualified.count, color: QUALITY_COLORS.unqualified }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(QUALITY_COLORS).map(([key, color], index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.scoreDistribution.ranges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'count' ? value : formatPercentage(value as number),
                        name === 'count' ? 'Leads' : 'Conversion Rate'
                      ]}
                    />
                    <Bar dataKey="count" fill="#3B82F6" />
                    <Bar dataKey="conversionRate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Object.entries(data.qualityBreakdown).map(([quality, stats]) => (
              <Card key={quality}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS] }}
                    />
                    {quality} Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {stats.count}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Percentage:</span>
                      <span className="font-medium">{formatPercentage(stats.percentage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conv Rate:</span>
                      <span className="font-medium">{formatPercentage(stats.conversionRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Score:</span>
                      <span className="font-medium">{stats.averageScore.toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scoring Analysis Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Score Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    {
                      component: 'Demographic',
                      score: data.componentAnalysis.demographic.average,
                      impact: data.componentAnalysis.demographic.impact
                    },
                    {
                      component: 'Behavioral',
                      score: data.componentAnalysis.behavioral.average,
                      impact: data.componentAnalysis.behavioral.impact
                    },
                    {
                      component: 'Intent',
                      score: data.componentAnalysis.intent.average,
                      impact: data.componentAnalysis.intent.impact
                    },
                    {
                      component: 'Engagement',
                      score: data.componentAnalysis.engagement.average,
                      impact: data.componentAnalysis.engagement.impact
                    }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="component" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Average Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Radar name="Impact" dataKey="impact" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Scoring Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.componentAnalysis).map(([component, analysis]) => (
                    <div key={component} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{component}</h4>
                        <Badge variant="outline">
                          Avg: {analysis.average.toFixed(0)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {analysis.topFactors.map((factor, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Source</th>
                      <th className="text-right p-2">Count</th>
                      <th className="text-right p-2">Avg Score</th>
                      <th className="text-right p-2">Conv Rate</th>
                      <th className="text-right p-2">ROI</th>
                      <th className="text-center p-2">Quality Mix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leadSources.map((source, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{source.source}</td>
                        <td className="p-2 text-right">{source.count}</td>
                        <td className="p-2 text-right">{source.averageScore.toFixed(0)}</td>
                        <td className="p-2 text-right">{formatPercentage(source.conversionRate)}</td>
                        <td className="p-2 text-right">{formatCurrency(source.roi)}</td>
                        <td className="p-2">
                          <div className="flex space-x-1">
                            {Object.entries(source.qualityDistribution).map(([quality, count]) => (
                              <div
                                key={quality}
                                className="w-3 h-3 rounded-full"
                                style={{ 
                                  backgroundColor: QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS],
                                  opacity: count > 0 ? 1 : 0.2
                                }}
                                title={`${quality}: ${count}`}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Predictors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.predictiveInsights.qualityPredictors.map((predictor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{predictor.factor}</div>
                        <div className="text-sm text-gray-600">{predictor.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${predictor.positiveImpact ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{predictor.importance.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.predictiveInsights.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="text-xs text-green-600 font-medium">
                        Expected Impact: {rec.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>High-Probability Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Lead ID</th>
                      <th className="text-right p-2">Score</th>
                      <th className="text-right p-2">Conv Probability</th>
                      <th className="text-right p-2">Est. Value</th>
                      <th className="text-right p-2">Time to Conv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.predictiveInsights.conversionProbability.slice(0, 10).map((lead, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{lead.leadId}</td>
                        <td className="p-2 text-right">{lead.score}</td>
                        <td className="p-2 text-right">
                          <Badge variant={lead.probability > 70 ? 'default' : lead.probability > 40 ? 'secondary' : 'outline'}>
                            {formatPercentage(lead.probability)}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">{formatCurrency(lead.estimatedValue)}</td>
                        <td className="p-2 text-right">{lead.timeToConversion}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.workflowAnalysis.topPerformingRules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rule.ruleName}</h4>
                        <Badge variant="outline">{rule.executions} runs</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="ml-2 font-medium">{formatPercentage(rule.successRate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Impact:</span>
                          <span className="ml-2 font-medium">{rule.averageImpact.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.workflowAnalysis.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{bottleneck.stage}</h4>
                        <Badge variant="destructive">
                          {formatPercentage(bottleneck.dropOffRate)} drop-off
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Average time: {Math.round(bottleneck.averageTime)} minutes
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Suggestions:</div>
                        {bottleneck.suggestions.map((suggestion, suggestionIndex) => (
                          <div key={suggestionIndex} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Quality Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeAnalysis.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#3B82F6" name="Leads" />
                  <Line yAxisId="right" type="monotone" dataKey="averageScore" stroke="#10B981" name="Avg Score" />
                  <Line yAxisId="right" type="monotone" dataKey="qualityIndex" stroke="#F59E0B" name="Quality Index" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.timeAnalysis.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.timeAnalysis.seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{pattern.period}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{pattern.leads} leads</span>
                        <Badge variant="outline">
                          Quality: {pattern.quality.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}