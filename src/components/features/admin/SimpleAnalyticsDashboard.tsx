'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  FileText,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleAnalyticsData {
  totalPosts: number;
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;
  uniqueUsers: number;
  isFirebaseConfigured: boolean;
  error?: string;
}

const SimpleAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<SimpleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic analytics without complex Firebase queries
      const response = await fetch(`/api/analytics/simple?timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-aviation-primary mr-2" />
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-2">Analytics Error</div>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-2 text-red-600">
                This might be due to Firebase configuration or missing indexes.
              </p>
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Dashboard
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Basic analytics and content metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analyticsData?.isGoogleAnalyticsConfigured && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-medium mb-1">Google Analytics Not Configured</div>
                <p className="text-sm">
                  Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your environment variables to enable real analytics tracking.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {analyticsData?.isGoogleAnalyticsConfigured && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Activity className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-medium mb-1">Google Analytics 4 Active</div>
                <p className="text-sm">
                  Real analytics tracking is enabled. Data will populate as users interact with your site.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{analyticsData?.totalPosts || 0}</p>
              <p className="text-sm text-blue-700">Total Posts</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{analyticsData?.pageviews || 0}</p>
              <p className="text-sm text-green-700">Page Views</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MousePointer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{analyticsData?.ctaClicks || 0}</p>
              <p className="text-sm text-purple-700">CTA Clicks</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{analyticsData?.formSubmissions || 0}</p>
              <p className="text-sm text-orange-700">Form Submissions</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-600">{analyticsData?.uniqueUsers || 0}</p>
              <p className="text-sm text-gray-700">Unique Users</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-600">{analyticsData?.totalEvents || 0}</p>
              <p className="text-sm text-gray-700">Total Events</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-600">{analyticsData?.contactVisits || 0}</p>
              <p className="text-sm text-gray-700">Contact Visits</p>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sanity CMS:</span>
                <span className="text-green-600 font-medium">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Google Analytics:</span>
                <span className={analyticsData?.isGoogleAnalyticsConfigured ? "text-green-600" : "text-yellow-600"}>
                  {analyticsData?.isGoogleAnalyticsConfigured ? "✓ Configured" : "⚠ Not Configured"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Studio Access:</span>
                <a 
                  href="http://localhost:3333" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-aviation-primary hover:underline font-medium"
                >
                  localhost:3333 →
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAnalyticsDashboard;