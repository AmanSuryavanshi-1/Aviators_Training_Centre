import { NextRequest, NextResponse } from 'next/server';
import { dailyAggregationService } from '@/lib/analytics/dailyAggregation';

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by a cron job or manually
    await dailyAggregationService.aggregateYesterdayData();
    
    return NextResponse.json({
      success: true,
      message: 'Daily aggregation completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Daily aggregation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Daily aggregation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'startDate and endDate parameters are required'
      }, { status: 400 });
    }
    
    const summaries = await dailyAggregationService.getDailySummaries(startDate, endDate);
    
    return NextResponse.json({
      success: true,
      data: summaries,
      count: summaries.length,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching daily summaries:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily summaries'
    }, { status: 500 });
  }
}