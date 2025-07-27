import { NextRequest, NextResponse } from 'next/server';
import { getGlobalCacheRefreshSystem } from '@/lib/monitoring/cache-refresh-system';

// GET - Get cache refresh status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    
    const cacheSystem = getGlobalCacheRefreshSystem();
    const status = cacheSystem.getStatus();
    
    const responseData: any = {
      isRunning: status.isRunning,
      config: status.config,
      statistics: status.statistics,
      timestamp: new Date().toISOString()
    };

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
    console.error('Cache status API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get cache status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Control cache refresh system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;
    
    const cacheSystem = getGlobalCacheRefreshSystem();
    
    switch (action) {
      case 'start':
        cacheSystem.start();
        return NextResponse.json({
          message: 'Cache refresh system started',
          status: 'running',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        cacheSystem.stop();
        return NextResponse.json({
          message: 'Cache refresh system stopped',
          status: 'stopped',
          timestamp: new Date().toISOString()
        });
        
      case 'force-refresh-all':
        const results = await cacheSystem.forceRefreshAll();
        return NextResponse.json({
          message: 'Force refresh completed',
          results,
          timestamp: new Date().toISOString()
        });
        
      case 'update-config':
        if (!config) {
          return NextResponse.json(
            { error: 'Configuration is required for update-config action' },
            { status: 400 }
          );
        }
        
        cacheSystem.updateConfig(config);
        return NextResponse.json({
          message: 'Cache refresh configuration updated',
          config: cacheSystem.getStatus().config,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Cache control API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to control cache system',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}