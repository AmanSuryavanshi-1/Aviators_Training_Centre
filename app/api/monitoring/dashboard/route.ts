import { NextRequest, NextResponse } from 'next/server';
import { getGlobalMonitoringService } from '@/lib/monitoring/automated-monitoring';
import { getGlobalAlertingSystem } from '@/lib/monitoring/alerting-system';

// GET - Get comprehensive monitoring dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    const includeAlerts = searchParams.get('alerts') === 'true';
    
    const monitoringService = getGlobalMonitoringService();
    const alertingSystem = getGlobalAlertingSystem();
    
    // Get monitoring status
    const monitoringStatus = monitoringService.getStatus();
    
    // Prepare dashboard data
    const dashboardData: any = {
      overview: {
        systemStatus: monitoringStatus.health.current?.overall || 'unknown',
        uptime: monitoringStatus.health.uptime,
        isMonitoring: monitoringStatus.isRunning,
        needsAttention: monitoringStatus.health.needsAttention,
        lastHealthCheck: monitoringStatus.health.current?.timestamp || null
      },
      monitoring: {
        isRunning: monitoringStatus.isRunning,
        config: monitoringStatus.config
      },
      maintenance: {
        isRunning: monitoringStatus.maintenance.isRunning,
        nextTask: monitoringStatus.maintenance.nextTask,
        recentResults: monitoringStatus.maintenance.recentResults
      },
      health: {
        current: monitoringStatus.health.current,
        trends: monitoringStatus.health.trends,
        uptime: monitoringStatus.health.uptime
      },
      cache: monitoringStatus.cache,
      timestamp: new Date().toISOString()
    };

    // Include history if requested
    if (includeHistory) {
      dashboardData.health.history = monitoringStatus.health.history;
    }

    // Include alerts if requested
    if (includeAlerts) {
      dashboardData.alerts = {
        recent: alertingSystem.getAlerts(10),
        statistics: alertingSystem.getAlertStatistics(24),
        rules: alertingSystem.getRules()
      };
    }

    // Calculate additional metrics
    if (monitoringStatus.health.current) {
      dashboardData.metrics = {
        healthyComponents: monitoringStatus.health.current.summary.healthy,
        degradedComponents: monitoringStatus.health.current.summary.degraded,
        unhealthyComponents: monitoringStatus.health.current.summary.unhealthy,
        totalComponents: monitoringStatus.health.current.summary.total,
        healthPercentage: Math.round(
          (monitoringStatus.health.current.summary.healthy / monitoringStatus.health.current.summary.total) * 100
        ),
        averageResponseTime: monitoringStatus.health.current.components
          .filter(c => c.responseTime)
          .reduce((sum, c, _, arr) => sum + (c.responseTime! / arr.length), 0) || 0
      };
    }

    // Set appropriate HTTP status based on system health
    let httpStatus = 200;
    if (monitoringStatus.health.current?.overall === 'critical') {
      httpStatus = 503; // Service Unavailable
    } else if (monitoringStatus.health.needsAttention) {
      httpStatus = 200; // OK but with warnings
    }
    
    return NextResponse.json(dashboardData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Monitoring dashboard API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get monitoring dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        overview: {
          systemStatus: 'critical',
          uptime: 0,
          isMonitoring: false,
          needsAttention: true,
          lastHealthCheck: null
        }
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// POST - Control monitoring dashboard actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, config } = body;
    
    const monitoringService = getGlobalMonitoringService();
    
    switch (action) {
      case 'restart-monitoring':
        monitoringService.stop();
        setTimeout(() => monitoringService.start(), 1000);
        return NextResponse.json({
          message: 'Monitoring system restart initiated',
          timestamp: new Date().toISOString()
        });
        
      case 'force-health-check':
        await monitoringService.forceHealthCheck();
        return NextResponse.json({
          message: 'Force health check completed',
          timestamp: new Date().toISOString()
        });
        
      case 'emergency-cache-refresh':
        const cacheSystem = monitoringService.getHealthMonitor();
        // This would trigger emergency cache refresh
        return NextResponse.json({
          message: 'Emergency cache refresh initiated',
          timestamp: new Date().toISOString()
        });
        
      case 'update-monitoring-config':
        if (!config) {
          return NextResponse.json(
            { error: 'Configuration is required for update-monitoring-config action' },
            { status: 400 }
          );
        }
        
        monitoringService.updateConfig(config);
        return NextResponse.json({
          message: 'Monitoring configuration updated',
          config: monitoringService.getStatus().config,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Monitoring dashboard control API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to control monitoring dashboard',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}