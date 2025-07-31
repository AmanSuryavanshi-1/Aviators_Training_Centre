import { NextRequest, NextResponse } from 'next/server';
import { getGlobalMonitoringService } from '@/lib/monitoring/automated-monitoring';

// GET - Get automated monitoring status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';
    
    const monitoringService = getGlobalMonitoringService();
    const status = monitoringService.getStatus();
    
    const responseData: any = {
      isRunning: status.isRunning,
      config: status.config,
      timestamp: status.timestamp
    };

    if (includeDetails) {
      responseData.maintenance = status.maintenance;
      responseData.health = status.health;
    } else {
      // Include summary only
      responseData.summary = {
        maintenanceRunning: status.maintenance.isRunning,
        healthStatus: status.health.current?.overall || 'unknown',
        uptime: status.health.uptime,
        needsAttention: status.health.needsAttention
      };
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Automated monitoring status API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get automated monitoring status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Control automated monitoring system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;
    
    const monitoringService = getGlobalMonitoringService();
    
    switch (action) {
      case 'start':
        monitoringService.start();
        return NextResponse.json({
          message: 'Automated monitoring system started',
          status: 'running',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        monitoringService.stop();
        return NextResponse.json({
          message: 'Automated monitoring system stopped',
          status: 'stopped',
          timestamp: new Date().toISOString()
        });
        
      case 'restart':
        monitoringService.stop();
        setTimeout(() => monitoringService.start(), 1000);
        return NextResponse.json({
          message: 'Automated monitoring system restarted',
          status: 'restarting',
          timestamp: new Date().toISOString()
        });
        
      case 'force-health-check':
        await monitoringService.forceHealthCheck();
        return NextResponse.json({
          message: 'Forced health check completed',
          timestamp: new Date().toISOString()
        });
        
      case 'update-config':
        if (!config) {
          return NextResponse.json(
            { error: 'Configuration is required for update-config action' },
            { status: 400 }
          );
        }
        
        monitoringService.updateConfig(config);
        return NextResponse.json({
          message: 'Automated monitoring configuration updated',
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
    console.error('Automated monitoring control API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to control automated monitoring system',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
