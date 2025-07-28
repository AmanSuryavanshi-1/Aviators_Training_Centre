import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const blogPost = searchParams.get('blogPost');
    const course = searchParams.get('course');
    const leadQuality = searchParams.get('leadQuality');

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get comprehensive lead generation data
    const [conversionFunnel, attributions, roiData, conversionPaths] = await Promise.all([
      conversionTracker.getConversionFunnel(
        dateFilter,
        blogPost !== 'all' ? blogPost : undefined,
        course !== 'all' ? course : undefined
      ),
      conversionTracker.getLeadAttribution('last_touch', dateFilter),
      conversionTracker.calculateBlogROI(
        blogPost !== 'all' ? blogPost : undefined,
        dateFilter
      ),
      conversionTracker.analyzeConversionPaths(dateFilter)
    ]);

    // Filter attributions by blog post if specified
    let filteredAttributions = attributions;
    if (blogPost && blogPost !== 'all') {
      filteredAttributions = attributions.filter(attr => attr.blogPostId === blogPost);
    }

    // Calculate lead generation metrics
    const totalLeads = conversionFunnel.inquiries;
    const qualifiedLeads = Math.round(totalLeads * 0.7); // Estimate 70% qualified
    const hotLeads = Math.round(totalLeads * 0.2); // Estimate 20% hot
    const warmLeads = Math.round(totalLeads * 0.3); // Estimate 30% warm
    const coldLeads = totalLeads - hotLeads - warmLeads;

    // Calculate lead source breakdown
    const leadSources = new Map();
    filteredAttributions.forEach(attribution => {
      const source = attribution.touchPoints[0]?.source || 'direct';
      const existing = leadSources.get(source) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += attribution.conversionValue;
      leadSources.set(source, existing);
    });

    const leadSourceBreakdown = Array.from(leadSources.entries()).map(([source, data]) => ({
      source,
      leads: data.count,
      revenue: data.revenue,
      averageValue: data.count > 0 ? data.revenue / data.count : 0,
      percentage: totalLeads > 0 ? (data.count / totalLeads) * 100 : 0
    })).sort((a, b) => b.leads - a.leads);

    // Calculate lead velocity metrics
    const averageTimeToLead = filteredAttributions.length > 0
      ? filteredAttributions.reduce((sum, attr) => sum + attr.conversionTime, 0) / filteredAttributions.length / 3600
      : 0;

    const leadVelocityBySource = leadSourceBreakdown.map(source => {
      const sourceAttributions = filteredAttributions.filter(attr => 
        attr.touchPoints[0]?.source === source.source
      );
      const averageTime = sourceAttributions.length > 0
        ? sourceAttributions.reduce((sum, attr) => sum + attr.conversionTime, 0) / sourceAttributions.length / 3600
        : 0;
      
      return {
        ...source,
        averageTimeToLead: averageTime
      };
    });

    // Calculate lead nurturing metrics
    const leadNurturingMetrics = {
      averageTouchPoints: filteredAttributions.length > 0
        ? filteredAttributions.reduce((sum, attr) => sum + attr.touchPoints.length, 0) / filteredAttributions.length
        : 0,
      multiTouchLeads: filteredAttributions.filter(attr => attr.touchPoints.length > 1).length,
      singleTouchLeads: filteredAttributions.filter(attr => attr.touchPoints.length === 1).length,
      nurturingEffectiveness: filteredAttributions.length > 0
        ? (filteredAttributions.filter(attr => attr.touchPoints.length > 1).length / filteredAttributions.length) * 100
        : 0
    };

    // Calculate lead quality distribution
    const leadQualityDistribution = {
      hot: {
        count: hotLeads,
        percentage: totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0,
        averageValue: hotLeads > 0 ? (roiData.totalRevenue * 0.6) / hotLeads : 0, // Hot leads contribute 60% of revenue
        conversionRate: 85 // Estimated conversion rate for hot leads
      },
      warm: {
        count: warmLeads,
        percentage: totalLeads > 0 ? (warmLeads / totalLeads) * 100 : 0,
        averageValue: warmLeads > 0 ? (roiData.totalRevenue * 0.3) / warmLeads : 0, // Warm leads contribute 30% of revenue
        conversionRate: 45 // Estimated conversion rate for warm leads
      },
      cold: {
        count: coldLeads,
        percentage: totalLeads > 0 ? (coldLeads / totalLeads) * 100 : 0,
        averageValue: coldLeads > 0 ? (roiData.totalRevenue * 0.1) / coldLeads : 0, // Cold leads contribute 10% of revenue
        conversionRate: 15 // Estimated conversion rate for cold leads
      }
    };

    // Generate lead generation insights
    const insights = [];
    
    if (conversionFunnel.conversionRates.blogToCTA < 5) {
      insights.push({
        type: 'opportunity',
        message: 'Blog-to-CTA conversion rate is below 5%. Consider improving CTA placement and messaging.',
        impact: 'high',
        recommendation: 'A/B test different CTA designs and positions'
      });
    }

    if (roiData.leadGenerationMetrics.costPerLead > 500) {
      insights.push({
        type: 'warning',
        message: `Cost per lead (₹${roiData.leadGenerationMetrics.costPerLead.toFixed(0)}) is above optimal range.`,
        impact: 'medium',
        recommendation: 'Focus on higher-converting content topics and optimize promotion spend'
      });
    }

    if (leadNurturingMetrics.nurturingEffectiveness > 70) {
      insights.push({
        type: 'success',
        message: 'Strong lead nurturing effectiveness with multi-touch conversions.',
        impact: 'positive',
        recommendation: 'Continue current content strategy and expand successful topics'
      });
    }

    return NextResponse.json({
      summary: {
        totalLeads,
        qualifiedLeads,
        leadToCustomerRate: roiData.leadGenerationMetrics.leadToCustomerRate,
        costPerLead: roiData.leadGenerationMetrics.costPerLead,
        leadValue: roiData.leadGenerationMetrics.leadValue,
        averageTimeToLead
      },
      leadQualityDistribution,
      leadSourceBreakdown: leadVelocityBySource,
      leadNurturingMetrics,
      conversionPaths: {
        commonPaths: conversionPaths.commonPaths.slice(0, 5),
        pathEfficiency: conversionPaths.pathEfficiency,
        dropOffPoints: conversionPaths.dropOffPoints
      },
      insights,
      performance: {
        conversionFunnel,
        roiMetrics: roiData,
        attributionData: {
          totalAttributions: filteredAttributions.length,
          directConversions: roiData.attributionBreakdown.directConversions,
          assistedConversions: roiData.attributionBreakdown.assistedConversions,
          influencedRevenue: roiData.attributionBreakdown.influencedRevenue
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lead generation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead generation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, leadData } = body;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId' },
        { status: 400 }
      );
    }

    // Score lead quality
    const leadScore = await conversionTracker.scoreLeadQuality(userId, sessionId, leadData);

    // Track lead generation event
    await conversionTracker.trackEvent({
      type: 'inquiry_form',
      userId,
      sessionId,
      value: leadScore.score,
      metadata: {
        leadQuality: leadScore.quality,
        leadScore: leadScore.score,
        leadFactors: leadScore.factors,
        leadData: {
          email: leadData?.email ? 'provided' : 'not_provided',
          phone: leadData?.phone ? 'provided' : 'not_provided',
          courseInterest: leadData?.courseInterest,
          experience: leadData?.experience,
          timeline: leadData?.timeline
        },
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      leadScore,
      message: 'Lead generation tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking lead generation:', error);
    return NextResponse.json(
      { error: 'Failed to track lead generation' },
      { status: 500 }
    );
  }
}