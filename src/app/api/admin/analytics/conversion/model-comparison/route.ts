import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get attribution data for different models
    const models = ['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based'] as const;
    
    const modelComparisons = await Promise.all(
      models.map(async (model) => {
        const attributions = await conversionTracker.getLeadAttribution(model, dateFilter);
        const totalRevenue = attributions.reduce((sum, attr) => sum + attr.conversionValue, 0);
        const totalConversions = attributions.length;
        const averageWeight = attributions.length > 0 
          ? attributions.reduce((sum, attr) => sum + attr.attributionWeight, 0) / attributions.length 
          : 0;

        return {
          model: model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          revenue: totalRevenue,
          conversions: totalConversions,
          weight: averageWeight,
          averageConversionValue: totalConversions > 0 ? totalRevenue / totalConversions : 0
        };
      })
    );

    return NextResponse.json({
      models: modelComparisons,
      summary: {
        totalModels: models.length,
        bestPerformingModel: modelComparisons.reduce((best, current) => 
          current.revenue > best.revenue ? current : best
        ),
        modelVariance: {
          revenueRange: {
            min: Math.min(...modelComparisons.map(m => m.revenue)),
            max: Math.max(...modelComparisons.map(m => m.revenue))
          },
          conversionRange: {
            min: Math.min(...modelComparisons.map(m => m.conversions)),
            max: Math.max(...modelComparisons.map(m => m.conversions))
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attribution model comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribution model comparison' },
      { status: 500 }
    );
  }
}
