'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw, 
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
  Server
} from 'lucide-react';

interface MonitoringData {
  timestamp: string;
  system: {
    status: 'healthy' | 'warning' | 'unhealthy';
    message: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    version: string;
  };
  services: {
    total: number;
    healthy: number;
    warning: number;
    unhealthy: number;
    critical: number;
  };
  performance: {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    slowOperations: number;
  };
  errors: {
    total: number;
    critical: number;
    lastHour: number;
    errorRate: number;
  };
  cache: {
    entries: number;
    hitRate: number;
    memoryUsage: number;
  };
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  uptime: number;
  lastCheck: string;
  recentChecks: Array<{
    status: string;
    message: string;
    responseTime: number;
    timestamp: string;
  }>;
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [overviewResponse, healthResponse] = await Promise.all([
        fetch('/api/monitoring/dashboard?section=overview'),
        fetch('/api/monitoring/dashboard?section=health')
      ]);

      if (overviewResponse.ok && healthResponse.ok) {
        const overviewData = await overviewResponse.json();
        const healthData = await healthResponse.json();
        
        setData(overviewData);
        setServices(healthData.services);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitoringData();
  };

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache' })
      });

      if (response.ok) {
        await fetchMonitoringData();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleRunHealthChecks = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-health-checks' })
      });

      if (response.ok) {
        await fetchMonitoringData();
      }
    } catch (error) {
      console.error('Failed to run health checks:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load monitoring data</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time performance and health monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleClearCache} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={handleRunHealthChecks} variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Run Health Checks
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(data.system.status)}
              <Badge className={getStatusColor(data.system.status)}>
                {data.system.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {formatUptime(data.system.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.services.healthy}/{data.services.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.services.critical > 0 && (
                <span className="text-red-600">{data.services.critical} critical</span>
              )}
              {data.services.warning > 0 && (
                <span className="text-yellow-600">{data.services.warning} warnings</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.performance.successRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(data.performance.averageResponseTime)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.cache.hitRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.cache.entries} entries, {data.cache.memoryUsage}MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Node.js Version:</span>
                  <span className="font-mono">{data.system.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span>{formatMemory(data.system.memory.heapUsed)} / {formatMemory(data.system.memory.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>RSS Memory:</span>
                  <span>{formatMemory(data.system.memory.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span>External Memory:</span>
                  <span>{formatMemory(data.system.memory.external)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Operations:</span>
                  <span>{data.performance.totalOperations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors (Last Hour):</span>
                  <span className={data.errors.lastHour > 0 ? 'text-red-600' : 'text-green-600'}>
                    {data.errors.lastHour}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Errors:</span>
                  <span className={data.errors.critical > 0 ? 'text-red-600' : 'text-green-600'}>
                    {data.errors.critical}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Operations:</span>
                  <span className={data.performance.slowOperations > 0 ? 'text-yellow-600' : 'text-green-600'}>
                    {data.performance.slowOperations}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">
                      {service.name.replace(/-/g, ' ')}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Uptime: {service.uptime.toFixed(1)}% | Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>{service.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-2" />
                    
                    {service.recentChecks.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Checks</h4>
                        <div className="space-y-1">
                          {service.recentChecks.slice(0, 3).map((check, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(check.status)}
                                <span>{check.message}</span>
                              </div>
                              <span className="text-muted-foreground">
                                {check.responseTime}ms
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(data.performance.successRate * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(data.performance.averageResponseTime)}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {data.performance.totalOperations.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>System errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {data.errors.critical}
                  </div>
                  <p className="text-sm text-muted-foreground">Critical Errors</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.errors.lastHour}
                  </div>
                  <p className="text-sm text-muted-foreground">Errors (Last Hour)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {data.errors.total.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}