'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Star,
  Award,
  Eye,
  MousePointer,
  ThumbsUp,
  Share2,
  Target,
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SocialProofMetrics {
  totalViews: number;
  totalInteractions: number;
  conversionRate: number;
  trustScoreImprovement: number;
  testimonialViews: number;
  testimonialClicks: number;
  successStoryViews: number;
  successStoryInfluencedConversions: number;
  certificationViews: number;
  achievementCounterViews: number;
  alumniNetworkViews: number;
  overallSocialProofConversionLift: number;
}

interface SocialProofPerformanceData {
  date: string;
  testimonialViews: number;
  successStoryViews: number;
  certificationViews: number;
  achievementViews: number;
  conversions: number;
  conversionRate: number;
}

interface ElementPerformance {
  element: string;
  views: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  trustScore: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function SocialProofAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SocialProofMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<SocialProofPerformanceData[]>([]);
  const [elementPerformance, setElementPerformance] = useState<ElementPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedCourse]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockMetrics: SocialProofMetrics = {
        totalViews: 15420,
        totalInteractions: 2340,
        conversionRate: 15.2,
        trustScoreImprovement: 34.5,
        testimonialViews: 5420,
        testimonialClicks: 234,
        successStoryViews: 3210,
        successStoryInfluencedConversions: 89,
        certificationViews: 2100,
        achievementCounterViews: 4500,
        alumniNetworkViews: 1800,
        overallSocialProofConversionLift: 28.3,
      };

      const mockPerformanceData: SocialProofPerformanceData[] = [
        { date: '2024-01-01', testimonialViews: 450, successStoryViews: 320, certificationViews: 180, achievementViews: 380, conversions: 23, conversionRate: 12.5 },
        { date: '2024-01-02', testimonialViews: 520, successStoryViews: 380, certificationViews: 220, achievementViews: 420, conversions: 28, conversionRate: 14.2 },
        { date: '2024-01-03', testimonialViews: 480, successStoryViews: 350, certificationViews: 200, achievementViews: 400, conversions: 25, conversionRate: 13.8 },
        { date: '2024-01-04', testimonialViews: 580, successStoryViews: 420, certificationViews: 250, achievementViews: 480, conversions: 32, conversionRate: 16.1 },
        { date: '2024-01-05', testimonialViews: 620, successStoryViews: 450, certificationViews: 280, achievementViews: 520, conversions: 35, conversionRate: 17.2 },
        { date: '2024-01-06', testimonialViews: 550, successStoryViews: 400, certificationViews: 230, achievementViews: 460, conversions: 30, conversionRate: 15.8 },
        { date: '2024-01-07', testimonialViews: 590, successStoryViews: 430, certificationViews: 260, achievementViews: 500, conversions: 33, conversionRate: 16.5 },
      ];

      const mockElementPerformance: ElementPerformance[] = [
        { element: 'Student Testimonials', views: 5420, clicks: 234, conversions: 89, conversionRate: 38.0, trustScore: 92 },
        { element: 'Success Stories', views: 3210, clicks: 156, conversions: 67, conversionRate: 42.9, trustScore: 88 },
        { element: 'Achievement Counters', views: 4500, clicks: 89, conversions: 23, conversionRate: 25.8, trustScore: 85 },
        { element: 'Industry Certifications', views: 2100, clicks: 45, conversions: 12, conversionRate: 26.7, trustScore: 90 },
        { element: 'Alumni Network', views: 1800, clicks: 67, conversions: 28, conversionRate: 41.8, trustScore: 87 },
      ];

      setMetrics(mockMetrics);
      setPerformanceData(mockPerformanceData);
      setElementPerformance(mockElementPerformance);
    } catch (error) {
      console.error('Error loading social proof analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Export analytics data as CSV
    const csvData = performanceData.map(row => 
      `${row.date},${row.testimonialViews},${row.successStoryViews},${row.certificationViews},${row.achievementViews},${row.conversions},${row.conversionRate}`
    ).join('\n');
    
    const blob = new Blob([`Date,Testimonial Views,Success Story Views,Certification Views,Achievement Views,Conversions,Conversion Rate\n${csvData}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-proof-analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Proof Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track the performance and impact of social proof elements
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Courses</option>
            <option value="dgca-cpl">DGCA CPL</option>
            <option value="atpl">ATPL</option>
            <option value="type-rating">Type Rating</option>
            <option value="rtr">RTR</option>
          </select>
          
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trust Score Lift</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{metrics?.trustScoreImprovement}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.3%</span> from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Social Proof Element Views</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="testimonialViews" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="successStoryViews" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="certificationViews" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="achievementViews" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Rate Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversionRate" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Element Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Element Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2">Element</th>
                      <th className="text-right py-3 px-2">Views</th>
                      <th className="text-right py-3 px-2">Clicks</th>
                      <th className="text-right py-3 px-2">Conversions</th>
                      <th className="text-right py-3 px-2">Conv. Rate</th>
                      <th className="text-right py-3 px-2">Trust Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementPerformance.map((element, index) => (
                      <tr key={element.element} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-2 font-medium">{element.element}</td>
                        <td className="text-right py-3 px-2">{element.views.toLocaleString()}</td>
                        <td className="text-right py-3 px-2">{element.clicks}</td>
                        <td className="text-right py-3 px-2">{element.conversions}</td>
                        <td className="text-right py-3 px-2">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            element.conversionRate > 35 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            element.conversionRate > 25 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          )}>
                            {element.conversionRate}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${element.trustScore}%` }}
                              />
                            </div>
                            <span className="text-xs">{element.trustScore}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Trust Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={elementPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ element, trustScore }) => `${element.split(' ')[0]}: ${trustScore}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="trustScore"
                  >
                    {elementPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">High Performer</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Success Stories have the highest conversion rate at 42.9%. Consider featuring more success stories prominently.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">Growth Opportunity</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Achievement Counters have high views but low conversion. Try adding more interactive elements or CTAs.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-700 dark:text-purple-300">Trust Builder</span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Student Testimonials have the highest trust score (92). Leverage these for credibility-focused campaigns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}