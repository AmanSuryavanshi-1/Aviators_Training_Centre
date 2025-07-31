import { NextRequest, NextResponse } from 'next/server';
import { 
  cleanupService, 
  performManualCleanup, 
  getCleanupStatistics 
} from '@/lib/n8n/cleanup-service';

// GET - Get cleanup service status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const status = cleanupService.getStatus();
        return NextResponse.json(status, { status: 200 });

      case 'statistics':
        const statistics = await getCleanupStatistics();
        return NextResponse.json(statistics, { status: 200 });

      case 'estimate':
        const estimate = await cleanupService.estimateCleanup();
        return NextResponse.json(estimate, { status: 200 });

      default:
        // Return comprehensive status by default
        const comprehensiveStatus = await getCleanupStatistics();
        return NextResponse.json(comprehensiveStatus, { status: 200 });
    }

  } catch (error) {
    console.error('Error fetching cleanup information:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch cleanup information',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Perform cleanup operations or update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...options } = body;

    switch (action) {
      case 'cleanup':
        // Perform manual cleanup
        const cleanupOptions = {
          auditLogRetentionDays: options.auditLogRetentionDays,
          errorRetentionDays: options.errorRetentionDays,
          notificationRetentionDays: options.notificationRetentionDays
        };

        const cleanupResult = await performManualCleanup(cleanupOptions);
        
        return NextResponse.json({
          success: cleanupResult.success,
          message: cleanupResult.success 
            ? 'Cleanup completed successfully' 
            : 'Cleanup completed with some errors',
          result: cleanupResult
        }, { 
          status: cleanupResult.success ? 200 : 207 // 207 Multi-Status for partial success
        });

      case 'start':
        // Start the cleanup service
        cleanupService.start();
        return NextResponse.json({
          success: true,
          message: 'Cleanup service started',
          status: cleanupService.getStatus()
        }, { status: 200 });

      case 'stop':
        // Stop the cleanup service
        cleanupService.stop();
        return NextResponse.json({
          success: true,
          message: 'Cleanup service stopped',
          status: cleanupService.getStatus()
        }, { status: 200 });

      case 'configure':
        // Update cleanup service configuration
        const config = {
          auditLogRetentionDays: options.auditLogRetentionDays,
          errorRetentionDays: options.errorRetentionDays,
          notificationRetentionDays: options.notificationRetentionDays,
          cleanupIntervalHours: options.cleanupIntervalHours,
          enableAutoCleanup: options.enableAutoCleanup
        };

        // Filter out undefined values
        const filteredConfig = Object.fromEntries(
          Object.entries(config).filter(([_, value]) => value !== undefined)
        );

        cleanupService.updateConfig(filteredConfig);
        
        return NextResponse.json({
          success: true,
          message: 'Cleanup service configuration updated',
          config: cleanupService.getStatus().config
        }, { status: 200 });

      case 'force':
        // Force immediate cleanup
        const forceResult = await cleanupService.forceCleanup();
        
        return NextResponse.json({
          success: forceResult.success,
          message: forceResult.success 
            ? 'Force cleanup completed successfully' 
            : 'Force cleanup completed with some errors',
          result: forceResult
        }, { 
          status: forceResult.success ? 200 : 207
        });

      default:
        return NextResponse.json({
          error: 'Unknown action',
          availableActions: ['cleanup', 'start', 'stop', 'configure', 'force']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error performing cleanup operation:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform cleanup operation',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Emergency cleanup (delete all data older than specified days)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const retentionDays = parseInt(searchParams.get('retentionDays') || '7');
    const confirmToken = searchParams.get('confirm');

    // Require confirmation token for emergency cleanup
    if (confirmToken !== 'EMERGENCY_CLEANUP_CONFIRMED') {
      return NextResponse.json({
        error: 'Emergency cleanup requires confirmation',
        message: 'Add ?confirm=EMERGENCY_CLEANUP_CONFIRMED to the URL to proceed',
        warning: 'This will permanently delete all automation data older than the specified retention period'
      }, { status: 400 });
    }

    if (retentionDays < 1 || retentionDays > 365) {
      return NextResponse.json({
        error: 'Invalid retention period',
        message: 'Retention days must be between 1 and 365'
      }, { status: 400 });
    }

    console.warn(`EMERGENCY CLEANUP INITIATED: Deleting all data older than ${retentionDays} days`);

    const emergencyCleanup = await performManualCleanup({
      auditLogRetentionDays: retentionDays,
      errorRetentionDays: retentionDays,
      notificationRetentionDays: retentionDays
    });

    return NextResponse.json({
      success: emergencyCleanup.success,
      message: `Emergency cleanup completed. Deleted data older than ${retentionDays} days.`,
      result: emergencyCleanup,
      warning: 'This was an emergency cleanup operation. Data has been permanently deleted.'
    }, { 
      status: emergencyCleanup.success ? 200 : 207
    });

  } catch (error) {
    console.error('Emergency cleanup failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Emergency cleanup failed',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
