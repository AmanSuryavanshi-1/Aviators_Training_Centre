import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model') as 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' || 'last_touch';
    const dateRange = searchParams.get('dateRange') || '30d';

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get lead attribution data
    const attributions = await conversionTracker.getLeadAttribution(model, dateFilter);

    // Calculate summary statistics
    const totalRevenue = attributions.reduce((sum, attr) => sum + attr.conversionValue, 0);
    const totalConversions = attributions.length;
    const averageConversionValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    const averageTimeToConversion = totalConversions > 0 
      ? attributions.reduce((sum, attr) => sum + attr.conversionTime, 0) / totalConversions 
      : 0;

    return NextResponse.json({
      attributions,
      summary: {
        totalRevenue,
        totalConversions,
        averageConversionValue,
        averageTimeToConversion: Math.round(averageTimeToConversion / 3600), // Convert to hours
        model
      }
    });
  } catch (error) {
    console.error('Error fetching lead attribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead attribution data' },
      { status: 500 }
    );
  }
}