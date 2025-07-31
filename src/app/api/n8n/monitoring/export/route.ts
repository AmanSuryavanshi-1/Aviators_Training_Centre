import { NextRequest, NextResponse } from 'next/server';
import { exportAuditLogs } from '@/lib/n8n/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const exportData = await exportAuditLogs({
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      format
    });

    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `audit-logs-${timeRange}.${format}`;

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to export audit logs',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
