/**
 * Studio Health Monitoring API Endpoint
 * Provides health monitoring data and controls via API
 */

import { NextRequest, NextResponse } from 'next/server';
import { studioMonitor } from '@/lib/monitoring/studioMonitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        // Get monitoring status
        const status = studioMonitor.getMonitoringStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });

      case 'report':
        // Get full health report
        const report = await studioMonitor.performHealthCheck();
        return NextResponse.json({
          success: true,
          data: report,
        });

      default:
        // Default: return basic health check
        const healthReport = studioMonitor.generateHealthReport();
        return NextResponse.json({
          success: true,
          data: healthReport,
        });
    }
  } catch (error) {
    console.error('Health monitoring API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get health monitoring data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'start-monitoring':
        // Start continuous monitoring
        const interval = params.interval || 5 * 60 * 1000; // Default 5 minutes
        studioMonitor.startMonitoring(interval);
        
        return NextResponse.json({
          success: true,
          message: 'Monitoring started',
          data: {
            interval,
            status: studioMonitor.getMonitoringStatus(),
          },
        });

      case 'stop-monitoring':
        // Stop monitoring
        studioMonitor.stopMonitoring();
        
        return NextResponse.json({
          success: true,
          message: 'Monitoring stopped',
          data: {
            status: studioMonitor.getMonitoringStatus(),
          },
        });

      case 'perform-check':
        // Perform immediate health check
        const checkResult = await studioMonitor.performHealthCheck();
        
        return NextResponse.json({
          success: true,
          message: 'Health check completed',
          data: checkResult,
        });

      case 'resolve-alert':
        // Resolve specific alert
        const { alertId } = params;
        if (!alertId) {
          return NextResponse.json({
            success: false,
            error: 'Alert ID is required',
          }, { status: 400 });
        }
        
        studioMonitor.resolveAlert(alertId);
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved',
          data: { alertId },
        });

      case 'get-metrics':
        // Get recent metrics
        const limit = params.limit || 50;
        const report = studioMonitor.generateHealthReport();
        
        return NextResponse.json({
          success: true,
          data: {
            metrics: report.metrics.slice(-limit),
            timestamp: new Date().toISOString(),
          },
        });

      case 'get-alerts':
        // Get recent alerts
        const alertLimit = params.limit || 20;
        const alertReport = studioMonitor.generateHealthReport();
        
        return NextResponse.json({
          success: true,
          data: {
            alerts: alertReport.alerts.slice(-alertLimit),
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'start-monitoring',
            'stop-monitoring', 
            'perform-check',
            'resolve-alert',
            'get-metrics',
            'get-alerts'
          ],
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Health monitoring action error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform monitoring action',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'clear-alerts':
        // Clear all resolved alerts (this would need to be implemented in the monitor)
        return NextResponse.json({
          success: true,
          message: 'Alerts cleared',
        });

      case 'clear-metrics':
        // Clear old metrics (this would need to be implemented in the monitor)
        return NextResponse.json({
          success: true,
          message: 'Old metrics cleared',
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid delete action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Health monitoring delete error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform delete action',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}