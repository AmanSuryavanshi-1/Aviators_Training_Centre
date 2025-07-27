'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  frequency: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoFix: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface MaintenanceResult {
  taskId: string;
  success: boolean;
  message: string;
  duration: number;
  timestamp: string;
  actionsPerformed: string[];
}

interface HealthComponent {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  timestamp: string;
}

interface SystemStatus {
  isRunning: boolean;
  config: {
    healthCheckInterval: number;
    maintenanceEnabled: boolean;
    alertingEnabled: boolean;
  };
  maintenance: {
    isRunning: boolean;
    nextTask?: {
      task: MaintenanceTask;
      timeUntil: number;
    };
    recentResults: MaintenanceResult[];
  };
  health: {
    current?: {
      overall: 'healthy' | 'degraded' | 'critical';
      components: HealthComponent[];
      summary: {
        healthy: number;
        degraded: number;
        unhealthy: number;
        total: number;
      };
      recommendations: string[];
    };
    uptime: number;
    needsAttention: boolean;
    trends: {
      overallTrend: string;
      componentTrends: { [key: string]: string };
      averageResponseTimes: { [key: string]: number };
    };
  };
}

export default function MaintenanceDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/monitoring/automated?details=true');
      if (!response.ok) throw new Error('Failed to fetch system status');
      
      const data = await response.json();
      setSystemStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch maintenance tasks
  const fetchMaintenanceTasks = async () => {
    try {
      const response = await fetch('/api/maintenance?stats=true');
      if (!response.ok) throw new Error('Failed to fetch maintenance tasks');
      
      const data = await response.json();
      setMaintenanceTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch maintenance tasks:', err);
    }
  };

  // Control system
  const controlSystem = async (action: string, config?: any) => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/monitoring/automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config })
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} system`);
      
      // Refresh status after action
      setTimeout(fetchSystemStatus, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  // Run maintenance task
  const runMaintenanceTask = async (taskId: string) => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-task', taskId })
      });
      
      if (!response.ok) throw new Error('Failed to run maintenance task');
      
      // Refresh data
      setTimeout(() => {
        fetchSystemStatus();
        fetchMaintenanceTasks();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSystemStatus(), fetchMaintenanceTasks()]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchMaintenanceTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical':
      case 'unhealthy': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      unhealthy: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeUntil = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Maintenance Dashboard</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Maintenance Dashboard</h2>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error loading dashboard</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Maintenance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchSystemStatus}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {systemStatus && (
            <Button
              onClick={() => controlSystem(systemStatus.isRunning ? 'stop' : 'start')}
              variant={systemStatus.isRunning ? 'destructive' : 'default'}
              size="sm"
              disabled={refreshing}
            >
              {systemStatus.isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* System Overview */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(systemStatus.health.current?.overall || 'unknown')}`}>
                    {systemStatus.health.current?.overall || 'Unknown'}
                  </p>
                </div>
                <Activity className={`h-8 w-8 ${getStatusColor(systemStatus.health.current?.overall || 'unknown')}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime (24h)</p>
                  <p className="text-2xl font-bold">{systemStatus.health.uptime}%</p>
                </div>
                <div className="w-full max-w-[60px]">
                  <Progress value={systemStatus.health.uptime} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monitoring</p>
                  <p className={`text-lg font-semibold ${systemStatus.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStatus.isRunning ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${systemStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className={`text-lg font-semibold ${systemStatus.maintenance.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStatus.maintenance.isRunning ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <Settings className={`h-6 w-6 ${systemStatus.maintenance.isRunning ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Components */}
      {systemStatus?.health.current && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health Components</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.health.current.components.map((component) => (
                <div key={component.component} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{component.component}</h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(systemStatus.health.trends.componentTrends[component.component] || 'stable')}
                      <Badge className={getStatusBadge(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{component.message}</p>
                  {component.responseTime && (
                    <p className="text-xs text-gray-500">
                      Response: {component.responseTime}ms
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Maintenance Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusBadge(task.status)}>
                      {task.status}
                    </Badge>
                    <Button
                      onClick={() => runMaintenanceTask(task.id)}
                      size="sm"
                      variant="outline"
                      disabled={task.status === 'running' || refreshing}
                    >
                      Run Now
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Frequency: {task.frequency}</span>
                  <span>Auto-fix: {task.autoFix ? 'Yes' : 'No'}</span>
                  {task.nextRun && (
                    <span>Next: {new Date(task.nextRun).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Maintenance Results */}
      {systemStatus?.maintenance.recentResults && systemStatus.maintenance.recentResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Maintenance Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.maintenance.recentResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.taskId}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(result.success ? 'completed' : 'failed')}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDuration(result.duration)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.actionsPerformed.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium mb-1">Actions performed:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.actionsPerformed.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {systemStatus?.health.current?.recommendations && systemStatus.health.current.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>System Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemStatus.health.current.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Scheduled Task */}
      {systemStatus?.maintenance.nextTask && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Next Scheduled Task</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{systemStatus.maintenance.nextTask.task.name}</h4>
                <p className="text-sm text-gray-600">{systemStatus.maintenance.nextTask.task.description}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatTimeUntil(systemStatus.maintenance.nextTask.timeUntil)}</p>
                <p className="text-sm text-gray-500">until next run</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
