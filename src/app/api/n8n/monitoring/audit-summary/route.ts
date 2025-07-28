import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogSummary } from '@/lib/n8n/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '24h' | '7d' | '30d' || '24h';

    const summary = await getAuditLogSummary(timeRange);

    return NextResponse.json(summary, { status: 200 });

  } catch (error) {
    console.error('Error fetching audit log summary:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch audit log summary',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}