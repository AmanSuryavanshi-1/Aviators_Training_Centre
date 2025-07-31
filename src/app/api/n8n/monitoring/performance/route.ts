import { NextRequest, NextResponse } from 'next/server';
import { getAutomationPerformanceMetrics } from '@/lib/n8n/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const metrics = await getAutomationPerformanceMetrics();

    return NextResponse.json(metrics, { status: 200 });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch performance metrics',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
