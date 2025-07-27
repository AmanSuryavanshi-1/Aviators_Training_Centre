import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get attribution data to identify blog posts
    const attributions = await conversionTracker.getLeadAttribution('last_touch', dateFilter);
    const conversionFunnel = await conversionTracker.getConversionFunnel(dateFilter);

    // Group by blog post and calculate metrics
    const blogPostMetrics = new Map();

    // Process attributions for revenue and conversions
    attributions.forEach(attribution => {
      const postId = attribution.blogPostId;
      if (!blogPostMetrics.has(postId)) {
        blogPostMetrics.set(postId, {
          blogPostId: postId,
          title: attribution.blogPostTitle,
          category: 'Aviation Training', // Default category
          views: 0,
          ctaClicks: 0,
          conversions: 0,
          revenue: 0,
          cost: 5000, // Estimated content creation cost
          roi: 0,
          conversionRate: 0,
          revenuePerVisitor: 0,
          averageOrderValue: 0
        });
      }

      const metrics = blogPostMetrics.get(postId);
      metrics.conversions += 1;
      metrics.revenue += attribution.conversionValue;
    });

    // Calculate additional metrics and ROI
    blogPostMetrics.forEach((metrics, postId) => {
      // Calculate ROI
      const profit = metrics.revenue - metrics.cost;
      metrics.roi = metrics.cost > 0 ? (profit / metrics.cost) * 100 : 0;
      
      // Estimate views and CTA clicks based on conversion funnel ratios
      if (conversionFunnel.conversionRates.overallConversion > 0) {
        metrics.views = Math.round(metrics.conversions / (conversionFunnel.conversionRates.overallConversion / 100));
        metrics.ctaClicks = Math.round(metrics.views * (conversionFunnel.conversionRates.blogToCTA / 100));
      }

      // Calculate additional metrics
      metrics.conversionRate = metrics.views > 0 ? (metrics.conversions / metrics.views) * 100 : 0;
      metrics.revenuePerVisitor = metrics.views > 0 ? metrics.revenue / metrics.views : 0;
      metrics.averageOrderValue = metrics.conversions > 0 ? metrics.revenue / metrics.conversions : 0;
    });

    // Convert to array and sort by revenue
    const topPosts = Array.from(blogPostMetrics.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Calculate summary statistics
    const totalRevenue = topPosts.reduce((sum, post) => sum + post.revenue, 0);
    const totalConversions = topPosts.reduce((sum, post) => sum + post.conversions, 0);
    const totalViews = topPosts.reduce((sum, post) => sum + post.views, 0);
    const averageROI = topPosts.length > 0 
      ? topPosts.reduce((sum, post) => sum + post.roi, 0) / topPosts.length 
      : 0;

    return NextResponse.json({
      posts: topPosts,
      summary: {
        totalPosts: topPosts.length,
        totalRevenue,
        totalConversions,
        totalViews,
        averageROI,
        bestPerformingPost: topPosts[0] || null,
        conversionRateRange: {
          min: Math.min(...topPosts.map(p => p.conversionRate)),
          max: Math.max(...topPosts.map(p => p.conversionRate))
        },
        revenueRange: {
          min: Math.min(...topPosts.map(p => p.revenue)),
          max: Math.max(...topPosts.map(p => p.revenue))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching top performing posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top performing posts' },
      { status: 500 }
    );
  }
}