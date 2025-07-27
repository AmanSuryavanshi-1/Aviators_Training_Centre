import { NextRequest, NextResponse } from 'next/server';
import { getGlobalAlertingSystem } from '@/lib/monitoring/alerting-system';

// GET - Get alerts and alert rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRules = searchParams.get('rules') === 'true';
    const includeStats = searchParams.get('stats') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    const alertingSystem = getGlobalAlertingSystem();
    
    const responseData: any = {
      alerts: alertingSystem.getAlerts(limit),
      timestamp: new Date().toISOString()
    };

    if (includeRules) {
      responseData.rules = alertingSystem.getRules();
    }

    if (includeStats) {
      responseData.statistics = alertingSystem.getAlertStatistics(24);
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Alerts API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Manage alert rules or resolve alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ruleId, alertId, rule } = body;
    
    const alertingSystem = getGlobalAlertingSystem();
    
    switch (action) {
      case 'add-rule':
        if (!rule) {
          return NextResponse.json(
            { error: 'Rule configuration is required for add-rule action' },
            { status: 400 }
          );
        }
        
        const newRuleId = alertingSystem.addRule(rule);
        return NextResponse.json({
          message: 'Alert rule added successfully',
          ruleId: newRuleId,
          timestamp: new Date().toISOString()
        });
        
      case 'update-rule':
        if (!ruleId || !rule) {
          return NextResponse.json(
            { error: 'Rule ID and configuration are required for update-rule action' },
            { status: 400 }
          );
        }
        
        const updated = alertingSystem.updateRule(ruleId, rule);
        if (!updated) {
          return NextResponse.json(
            { error: 'Alert rule not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: 'Alert rule updated successfully',
          ruleId,
          timestamp: new Date().toISOString()
        });
        
      case 'remove-rule':
        if (!ruleId) {
          return NextResponse.json(
            { error: 'Rule ID is required for remove-rule action' },
            { status: 400 }
          );
        }
        
        const removed = alertingSystem.removeRule(ruleId);
        if (!removed) {
          return NextResponse.json(
            { error: 'Alert rule not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: 'Alert rule removed successfully',
          ruleId,
          timestamp: new Date().toISOString()
        });
        
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required for resolve-alert action' },
            { status: 400 }
          );
        }
        
        const resolved = alertingSystem.resolveAlert(alertId);
        if (!resolved) {
          return NextResponse.json(
            { error: 'Alert not found or already resolved' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          message: 'Alert resolved successfully',
          alertId,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Alert management API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to manage alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}