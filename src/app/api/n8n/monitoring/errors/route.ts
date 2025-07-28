import { NextRequest, NextResponse } from 'next/server';
import { errorMonitor } from '@/lib/n8n/error-monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';

    const errorStats = await errorMonitor.getErrorStatistics(timeRange);

    return NextResponse.json(errorStats, { status: 200 });

  } catch (error) {
    console.error('Error fetching error statistics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch error statistics',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}