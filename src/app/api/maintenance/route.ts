import { NextRequest, NextResponse } from 'next/server';
import { PreventiveMaintenanceSystem } from '@/lib/monitoring/preventive-maintenance';

// Create a singleton instance
let maintenanceSystem: PreventiveMaintenanceSystem | null = null;

function getMaintenanceSystem(): PreventiveMaintenanceSystem {
  if (!maintenanceSystem) {
    maintenanceSystem = new PreventiveMaintenanceSystem();
  }
  return maintenanceSystem;
}

// GET - Get maintenance status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    const includeHistory = searchParams.get('history') === 'true';
    
    const maintenance = getMaintenanceSystem();
    const status = maintenance.getMaintenanceStatus();
    
    const responseData: any = {
      status: status.isRunning ? 'running' : 'stopped',
      isRunning: status.isRunning,
      nextScheduledTask: status.nextScheduledTask,
      tasks: status.tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        status: task.status,
        priority: task.priority,
        autoFix: task.autoFix,
        lastRun: task.lastRun,
        nextRun: task.nextRun
      })),
      timestamp: new Date().toISOString()
    };
    
    if (includeStats) {
      responseData.statistics = maintenance.getMaintenanceStatistics();
    }
    
    if (includeHistory) {
      responseData.recentResults = status.recentResults;
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Maintenance status API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get maintenance status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Control maintenance system or run specific tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, config } = body;
    
    const maintenance = getMaintenanceSystem();
    
    switch (action) {
      case 'start':
        maintenance.start();
        return NextResponse.json({
          message: 'Preventive maintenance system started',
          status: 'running',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        maintenance.stop();
        return NextResponse.json({
          message: 'Preventive maintenance system stopped',
          status: 'stopped',
          timestamp: new Date().toISOString()
        });
        
      case 'run-task':
        if (!taskId) {
          return NextResponse.json(
            { error: 'Task ID is required for run-task action' },
            { status: 400 }
          );
        }
        
        const result = await maintenance.runMaintenanceTask(taskId);
        return NextResponse.json({
          message: `Maintenance task ${taskId} completed`,
          result,
          timestamp: new Date().toISOString()
        });
        
      case 'update-alerts':
        if (!config) {
          return NextResponse.json(
            { error: 'Alert configuration is required for update-alerts action' },
            { status: 400 }
          );
        }
        
        maintenance.updateAlertConfig(config);
        return NextResponse.json({
          message: 'Alert configuration updated',
          config,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Maintenance control API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to control maintenance system',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
