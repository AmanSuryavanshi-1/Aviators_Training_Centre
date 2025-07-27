import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const blogPost = searchParams.get('blogPost');
    const course = searchParams.get('course');

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get conversion funnel data
    const funnelData = await conversionTracker.getConversionFunnel(
      dateFilter,
      blogPost !== 'all' ? blogPost : undefined,
      course !== 'all' ? course : undefined
    );

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion funnel data' },
      { status: 500 }
    );
  }
}