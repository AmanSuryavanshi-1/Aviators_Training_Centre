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
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  MousePointer, 
  Eye,
  Target,
  Award,
  Download,
  Calendar
} from 'lucide-react';
import { ConversionFunnel, LeadAttribution } from '@/lib/analytics/conversion-tracking';

interface ConversionAttributionDashboardProps {
  className?: string;
}

interface ROIData {
  blogPostId?: string;
  blogPostTitle?: string;
  totalRevenue: number;
  totalCost: number;
  roi: number;
  roiPercentage: number;
  conversions: number;
  costPerConversion: number;
  revenuePerConversion: number;
}

interface AttributionModelData {
  model: string;
  revenue: number;
  conversions: number;
  weight: number;
}

export default function ConversionAttributionDashboard({ className }: ConversionAttributionDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [attributionModel, setAttributionModel] = useState<'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based'>('last_touch');
  
  // Data states
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [leadAttributions, setLeadAttributions] = useState<LeadAttribution[]>([]);
  const [roiData, setROIData] = useState<ROIData[]>([]);
  const [attributionModelComparison, setAttributionModelComparison] = useState<AttributionModelData[]>([]);
  const [topPerformingPosts, setTopPerformingPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, attributionModel, selectedBlogPost, selectedCourse]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch conversion funnel data
      const funnelResponse = await fetch(`/api/admin/analytics/conversion/funnel?dateRange=${dateRange}&blogPost=${selectedBlogPost}&course=${selectedCourse}`);
      const funnelData = await funnelResponse.json();
      setConversionFunnel(funnelData);

      // Fetch lead attribution data
      const attributionResponse = await fetch(`/api/admin/analytics/conversion/attribution?model=${attributionModel}&dateRange=${dateRange}`);
      const attributionData = await attributionResponse.json();
      setLeadAttributions(attributionData.attributions || []);

      // Fetch ROI data
      const roiResponse = await fetch(`/api/admin/analytics/conversion/roi?dateRange=${dateRange}&blogPost=${selectedBlogPost}`);
      const roiData = await roiResponse.json();
      setROIData(roiData.roi || []);

      // Fetch attribution model comparison
      const modelComparisonResponse = await fetch(`/api/admin/analytics/conversion/model-comparison?dateRange=${dateRange}`);
      const modelComparisonData = await modelComparisonResponse.json();
      setAttributionModelComparison(modelComparisonData.models || []);

      // Fetch top performing posts
      const topPostsResponse = await fetch(`/api/admin/analytics/conversion/top-posts?dateRange=${dateRange}`);
      const topPostsData = await topPostsResponse.json();
      setTopPerformingPosts(topPostsData.posts || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/conversion/export?dateRange=${dateRange}&model=${attributionModel}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversion-attribution-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversion Attribution Dashboard</h1>
          <p className="text-gray-600">Track blog post performance and ROI from content to conversions</p>
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

          <Select value={attributionModel} onValueChange={(value: any) => setAttributionModel(value)}>
            <SelectTrigger className="w-40">
              <Target className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first_touch">First Touch</SelectItem>
              <SelectItem value="last_touch">Last Touch</SelectItem>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="time_decay">Time Decay</SelectItem>
              <SelectItem value="position_based">Position Based</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {conversionFunnel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(conversionFunnel.revenue.total)}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                {formatCurrency(conversionFunnel.revenue.revenuePerVisitor)} per visitor
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {conversionFunnel.payments}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <Target className="w-3 h-3 mr-1 text-blue-500" />
                {formatPercentage(conversionFunnel.conversionRates.overallConversion)} conversion rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(conversionFunnel.revenue.averageOrderValue)}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <DollarSign className="w-3 h-3 mr-1 text-green-500" />
                {formatCurrency(conversionFunnel.revenue.revenuePerLead)} per lead
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Blog Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {conversionFunnel.blogViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <MousePointer className="w-3 h-3 mr-1 text-blue-500" />
                {formatPercentage(conversionFunnel.conversionRates.blogToCTA)} CTA rate
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="models">Model Comparison</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
        </TabsList>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          {conversionFunnel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { stage: 'Blog Views', count: conversionFunnel.blogViews, rate: 100 },
                      { stage: 'CTA Clicks', count: conversionFunnel.ctaClicks, rate: conversionFunnel.conversionRates.blogToCTA },
                      { stage: 'Course Views', count: conversionFunnel.coursePageViews, rate: conversionFunnel.conversionRates.ctaToCourse },
                      { stage: 'Inquiries', count: conversionFunnel.inquiries, rate: conversionFunnel.conversionRates.courseToInquiry },
                      { stage: 'Enrollments', count: conversionFunnel.enrollments, rate: conversionFunnel.conversionRates.inquiryToEnrollment },
                      { stage: 'Payments', count: conversionFunnel.payments, rate: conversionFunnel.conversionRates.enrollmentToPayment }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'count' ? (value as number).toLocaleString() : `${(value as number).toFixed(1)}%`,
                          name === 'count' ? 'Count' : 'Conversion Rate'
                        ]}
                      />
                      <Bar dataKey="count" fill="#075E68" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Blog to CTA', rate: conversionFunnel.conversionRates.blogToCTA },
                      { label: 'CTA to Course', rate: conversionFunnel.conversionRates.ctaToCourse },
                      { label: 'Course to Inquiry', rate: conversionFunnel.conversionRates.courseToInquiry },
                      { label: 'Inquiry to Enrollment', rate: conversionFunnel.conversionRates.inquiryToEnrollment },
                      { label: 'Enrollment to Payment', rate: conversionFunnel.conversionRates.enrollmentToPayment },
                      { label: 'Overall Conversion', rate: conversionFunnel.conversionRates.overallConversion }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(item.rate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {formatPercentage(item.rate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Attribution ({attributionModel.replace('_', ' ').toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Blog Post</th>
                      <th className="text-left p-2">Course</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Attribution Weight</th>
                      <th className="text-right p-2">Touch Points</th>
                      <th className="text-right p-2">Time to Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadAttributions.slice(0, 10).map((attribution, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{attribution.blogPostTitle}</div>
                        </td>
                        <td className="p-2">{attribution.courseName}</td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(attribution.conversionValue)}
                        </td>
                        <td className="p-2 text-right">
                          {(attribution.attributionWeight * 100).toFixed(0)}%
                        </td>
                        <td className="p-2 text-right">{attribution.touchPoints.length}</td>
                        <td className="p-2 text-right">
                          {Math.round(attribution.conversionTime / 3600)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Analysis Tab */}
        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI by Blog Post</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="blogPostTitle" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, 'ROI']}
                    />
                    <Bar dataKey="roiPercentage" fill="#075E68" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost vs Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roiData.slice(0, 5).map((roi, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{roi.blogPostTitle || 'Overall'}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Revenue</div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(roi.totalRevenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Cost</div>
                          <div className="font-medium text-red-600">
                            {formatCurrency(roi.totalCost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">ROI</div>
                          <div className={`font-medium ${roi.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(roi.roiPercentage)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Conversions</div>
                          <div className="font-medium">{roi.conversions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Model Comparison Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attribution Model Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attributionModelComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Conversions'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#075E68" />
                  <Bar dataKey="conversions" fill="#0891B2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Post Title</th>
                      <th className="text-right p-2">Views</th>
                      <th className="text-right p-2">CTA Clicks</th>
                      <th className="text-right p-2">Conversions</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformingPosts.map((post, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{post.title}</div>
                          <div className="text-gray-500 text-xs">{post.category}</div>
                        </td>
                        <td className="p-2 text-right">{post.views?.toLocaleString()}</td>
                        <td className="p-2 text-right">{post.ctaClicks}</td>
                        <td className="p-2 text-right">{post.conversions}</td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(post.revenue)}
                        </td>
                        <td className="p-2 text-right">
                          <Badge variant={post.roi >= 0 ? "default" : "destructive"}>
                            {formatPercentage(post.roi)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
