'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  Globe, 
  RefreshCw, 
  Server, 
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: any;
  timestamp: string;
  responseTime?: number;
}

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  components: HealthCheckResult[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
  recommendations: string[];
  uptime: number;
  needsAttention: boolean;
  trends?: {
    overallTrend: string;
    componentTrends: { [component: string]: string };
    averageResponseTimes: { [component: string]: number };
  };
}

export function SystemHealthDashboard() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health/system?trends=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      console.error('Health check error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const triggerManualCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/system', {
        method: 'POST',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Manual health check failed: ${response.status}`);
      }

      // Refresh data after manual check
      await fetchHealthData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Manual health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchHealthData(false);
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component.toLowerCase()) {
      case 'sanity cms':
        return <Database className="w-4 h-4" />;
      case 'blog api':
        return <Globe className="w-4 h-4" />;
      case 'database':
        return <Server className="w-4 h-4" />;
      case 'admin interface':
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'degrading':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && !healthData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            System Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg">Checking system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !healthData) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            System Health Monitor - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchHealthData()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) return null;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card className={`border-2 ${
        healthData.status === 'healthy' ? 'border-green-200 bg-green-50/50' :
        healthData.status === 'degraded' ? 'border-yellow-200 bg-yellow-50/50' :
        'border-red-200 bg-red-50/50'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(healthData.status)}
              <span>System Health Status</span>
              <Badge variant={
                healthData.status === 'healthy' ? 'default' :
                healthData.status === 'degraded' ? 'secondary' : 'destructive'
              }>
                {healthData.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerManualCheck}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Check Now
              </Button>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthData.summary.healthy}</div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{healthData.summary.degraded}</div>
              <div className="text-sm text-gray-600">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{healthData.summary.unhealthy}</div>
              <div className="text-sm text-gray-600">Unhealthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{healthData.uptime}%</div>
              <div className="text-sm text-gray-600">24h Uptime</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-sm text-gray-600">
                {healthData.summary.healthy}/{healthData.summary.total} components healthy
              </span>
            </div>
            <Progress 
              value={(healthData.summary.healthy / healthData.summary.total) * 100} 
              className="h-2"
            />
          </div>

          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {healthData.components.map((component, index) => (
            <motion.div
              key={component.component}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${getStatusColor(component.status)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getComponentIcon(component.component)}
                      <span className="font-semibold">{component.component}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {healthData.trends?.componentTrends[component.component] && 
                        getTrendIcon(healthData.trends.componentTrends[component.component])
                      }
                      {getStatusIcon(component.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{component.message}</p>
                  
                  {component.responseTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      Response time: {component.responseTime}ms
                    </div>
                  )}

                  {component.details && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <details>
                        <summary className="cursor-pointer font-medium">Details</summary>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {JSON.stringify(component.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recommendations */}
      {healthData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Trends (if available) */}
      {healthData.trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Component Trends</h4>
                <div className="space-y-2">
                  {Object.entries(healthData.trends.componentTrends).map(([component, trend]) => (
                    <div key={component} className="flex items-center justify-between text-sm">
                      <span>{component}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend)}
                        <span className="capitalize">{trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Average Response Times</h4>
                <div className="space-y-2">
                  {Object.entries(healthData.trends.averageResponseTimes).map(([component, time]) => (
                    <div key={component} className="flex items-center justify-between text-sm">
                      <span>{component}</span>
                      <span className={`font-mono ${time > 2000 ? 'text-red-600' : time > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {time}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
