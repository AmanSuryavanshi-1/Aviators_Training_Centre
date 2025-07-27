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
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
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
  Eye
} from 'lucide-react';

interface LeadGenerationDashboardProps {
  className?: string;
}

interface LeadGenerationData {
  summary: {
    totalLeads: number;
    qualifiedLeads: number;
    leadToCustomerRate: number;
    costPerLead: number;
    leadValue: number;
    averageTimeToLead: number;
  };
  leadQualityDistribution: {
    hot: { count: number; percentage: number; averageValue: number; conversionRate: number };
    warm: { count: number; percentage: number; averageValue: number; conversionRate: number };
    cold: { count: number; percentage: number; averageValue: number; conversionRate: number };
  };
  leadSourceBreakdown: Array<{
    source: string;
    leads: number;
    revenue: number;
    averageValue: number;
    percentage: number;
    averageTimeToLead: number;
  }>;
  leadNurturingMetrics: {
    averageTouchPoints: number;
    multiTouchLeads: number;
    singleTouchLeads: number;
    nurturingEffectiveness: number;
  };
  conversionPaths: {
    commonPaths: Array<{
      path: string[];
      frequency: number;
      averageConversionTime: number;
      averageConversionValue: number;
      conversionRate: number;
    }>;
    pathEfficiency: {
      shortestPath: string[];
      longestPath: string[];
      mostEfficientPath: string[];
      averagePathLength: number;
    };
    dropOffPoints: Array<{
      step: string;
      dropOffRate: number;
      suggestions: string[];
    }>;
  };
  insights: Array<{
    type: 'opportunity' | 'warning' | 'success';
    message: string;
    impact: 'high' | 'medium' | 'low' | 'positive';
    recommendation: string;
  }>;
}

const COLORS = ['#075E68', '#0891B2', '#06B6D4', '#67E8F9', '#A7F3D0'];

export default function LeadGenerationDashboard({ className }: LeadGenerationDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedBlogPost, setSelectedBlogPost] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [data, setData] = useState<LeadGenerationData | null>(null);

  useEffect(() => {
    fetchLeadGenerationData();
  }, [dateRange, selectedBlogPost, selectedCourse]);

  const fetchLeadGenerationData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics/conversion/lead-generation?dateRange=${dateRange}&blogPost=${selectedBlogPost}&course=${selectedCourse}`
      );
      const leadData = await response.json();
      setData(leadData);
    } catch (error) {
      console.error('Error fetching lead generation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLeadData = async () => {
    try {
      const response = await fetch(
        `/api/admin/analytics/conversion/export?dateRange=${dateRange}&format=csv&type=leads`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-generation-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting lead data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
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
        <p className="text-gray-500">No lead generation data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Generation Dashboard</h1>
          <p className="text-gray-600">Track and analyze lead generation from blog content to course inquiries</p>
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

          <Button onClick={exportLeadData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {data.summary.qualifiedLeads} qualified ({formatPercentage((data.summary.qualifiedLeads / data.summary.totalLeads) * 100)})
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
              {formatPercentage(data.summary.leadToCustomerRate)}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-blue-500" />
              Lead to customer
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Cost Per Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.summary.costPerLead)}
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Award className="w-3 h-3 mr-1 text-green-500" />
              {formatCurrency(data.summary.leadValue)} avg value
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Time to Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(data.summary.averageTimeToLead)}h
            </div>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              Average conversion time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      {data.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.insights.map((insight, index) => (
            <Card key={index} className={`border-l-4 ${getInsightColor(insight.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{insight.message}</p>
                    <p className="text-xs text-gray-600">{insight.recommendation}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="quality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quality">Lead Quality</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing</TabsTrigger>
          <TabsTrigger value="paths">Conversion Paths</TabsTrigger>
          <TabsTrigger value="dropoffs">Drop-offs</TabsTrigger>
        </TabsList>

        {/* Lead Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hot Leads', value: data.leadQualityDistribution.hot.count, color: '#DC2626' },
                        { name: 'Warm Leads', value: data.leadQualityDistribution.warm.count, color: '#F59E0B' },
                        { name: 'Cold Leads', value: data.leadQualityDistribution.cold.count, color: '#3B82F6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { name: 'Hot Leads', value: data.leadQualityDistribution.hot.count, color: '#DC2626' },
                        { name: 'Warm Leads', value: data.leadQualityDistribution.warm.count, color: '#F59E0B' },
                        { name: 'Cold Leads', value: data.leadQualityDistribution.cold.count, color: '#3B82F6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="outside" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      label: 'Hot Leads', 
                      count: data.leadQualityDistribution.hot.count,
                      percentage: data.leadQualityDistribution.hot.percentage,
                      value: data.leadQualityDistribution.hot.averageValue,
                      conversionRate: data.leadQualityDistribution.hot.conversionRate,
                      color: 'bg-red-500'
                    },
                    { 
                      label: 'Warm Leads', 
                      count: data.leadQualityDistribution.warm.count,
                      percentage: data.leadQualityDistribution.warm.percentage,
                      value: data.leadQualityDistribution.warm.averageValue,
                      conversionRate: data.leadQualityDistribution.warm.conversionRate,
                      color: 'bg-yellow-500'
                    },
                    { 
                      label: 'Cold Leads', 
                      count: data.leadQualityDistribution.cold.count,
                      percentage: data.leadQualityDistribution.cold.percentage,
                      value: data.leadQualityDistribution.cold.averageValue,
                      conversionRate: data.leadQualityDistribution.cold.conversionRate,
                      color: 'bg-blue-500'
                    }
                  ].map((quality, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${quality.color}`}></div>
                          <span className="font-medium">{quality.label}</span>
                        </div>
                        <Badge variant="outline">{quality.count} leads</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Percentage</div>
                          <div className="font-medium">{formatPercentage(quality.percentage)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Avg Value</div>
                          <div className="font-medium">{formatCurrency(quality.value)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Conv Rate</div>
                          <div className="font-medium">{formatPercentage(quality.conversionRate)}</div>
                        </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.leadSourceBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'leads' ? value : formatCurrency(value as number),
                        name === 'leads' ? 'Leads' : 'Revenue'
                      ]}
                    />
                    <Bar dataKey="leads" fill="#075E68" />
                    <Bar dataKey="revenue" fill="#0891B2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Source</th>
                        <th className="text-right p-2">Leads</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leadSourceBreakdown.map((source, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="font-medium">{source.source}</div>
                            <div className="text-gray-500 text-xs">
                              {formatPercentage(source.percentage)} of total
                            </div>
                          </td>
                          <td className="p-2 text-right">{source.leads}</td>
                          <td className="p-2 text-right font-medium">
                            {formatCurrency(source.revenue)}
                          </td>
                          <td className="p-2 text-right">
                            {Math.round(source.averageTimeToLead)}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Nurturing Tab */}
        <TabsContent value="nurturing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nurturing Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPercentage(data.leadNurturingMetrics.nurturingEffectiveness)}
                    </div>
                    <div className="text-gray-600">Multi-touch conversion rate</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {data.leadNurturingMetrics.multiTouchLeads}
                      </div>
                      <div className="text-sm text-gray-600">Multi-touch leads</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {data.leadNurturingMetrics.singleTouchLeads}
                      </div>
                      <div className="text-sm text-gray-600">Single-touch leads</div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">
                      {data.leadNurturingMetrics.averageTouchPoints.toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-700">Average touch points per conversion</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Touch Point Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Single Touch', 
                          value: data.leadNurturingMetrics.singleTouchLeads, 
                          color: '#3B82F6' 
                        },
                        { 
                          name: 'Multi Touch', 
                          value: data.leadNurturingMetrics.multiTouchLeads, 
                          color: '#10B981' 
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { name: 'Single Touch', value: data.leadNurturingMetrics.singleTouchLeads, color: '#3B82F6' },
                        { name: 'Multi Touch', value: data.leadNurturingMetrics.multiTouchLeads, color: '#10B981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="outside" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Conversion Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.conversionPaths.commonPaths.map((path, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Path #{index + 1}</div>
                      <Badge variant="outline">{path.frequency} conversions</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {path.path.join(' → ')}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Avg Time</div>
                        <div className="font-medium">{Math.round(path.averageConversionTime / 3600)}h</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Avg Value</div>
                        <div className="font-medium">{formatCurrency(path.averageConversionValue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Conv Rate</div>
                        <div className="font-medium">{formatPercentage(path.conversionRate)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drop-offs Tab */}
        <TabsContent value="dropoffs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Drop-off Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.conversionPaths.dropOffPoints.map((dropOff, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{dropOff.step}</h4>
                      <Badge variant="destructive">
                        {formatPercentage(dropOff.dropOffRate)} drop-off
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Optimization Suggestions:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {dropOff.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}