import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const blogPost = searchParams.get('blogPost');

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Get ROI data
    const roiData = await conversionTracker.calculateBlogROI(
      blogPost !== 'all' ? blogPost : undefined,
      dateFilter
    );

    // If no specific blog post is selected, get ROI for all blog posts
    let roiArray = [roiData];
    
    if (!blogPost || blogPost === 'all') {
      // Get attribution data to find all blog posts
      const attributions = await conversionTracker.getLeadAttribution('last_touch', dateFilter);
      const uniqueBlogPosts = [...new Set(attributions.map(attr => attr.blogPostId))];
      
      roiArray = await Promise.all(
        uniqueBlogPosts.map(async (postId) => {
          const postROI = await conversionTracker.calculateBlogROI(postId, dateFilter);
          const postAttribution = attributions.find(attr => attr.blogPostId === postId);
          return {
            ...postROI,
            blogPostTitle: postAttribution?.blogPostTitle || `Blog Post ${postId}`
          };
        })
      );

      // Sort by ROI percentage descending
      roiArray.sort((a, b) => b.roiPercentage - a.roiPercentage);
    }

    return NextResponse.json({
      roi: roiArray,
      summary: {
        totalRevenue: roiArray.reduce((sum, roi) => sum + roi.totalRevenue, 0),
        totalCost: roiArray.reduce((sum, roi) => sum + roi.totalCost, 0),
        totalConversions: roiArray.reduce((sum, roi) => sum + roi.conversions, 0),
        averageROI: roiArray.length > 0 
          ? roiArray.reduce((sum, roi) => sum + roi.roiPercentage, 0) / roiArray.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching ROI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ROI data' },
      { status: 500 }
    );
  }
}