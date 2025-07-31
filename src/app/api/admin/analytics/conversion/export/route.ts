import { NextRequest, NextResponse } from 'next/server';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const model = searchParams.get('model') || 'last_touch';
    const format = searchParams.get('format') || 'csv';

    // Convert date range to actual dates
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const dateFilter = {
      start: startDate.toISOString(),
      end: now.toISOString()
    };

    // Fetch all data
    const [attributions, conversionFunnel, roiData, topPosts] = await Promise.all([
      conversionTracker.getLeadAttribution(model as any, dateFilter),
      conversionTracker.getConversionFunnel(dateFilter),
      conversionTracker.calculateBlogROI(undefined, dateFilter),
      fetch(`${request.nextUrl.origin}/api/admin/analytics/conversion/top-posts?dateRange=${dateRange}`).then(r => r.json())
    ]);

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSVReport({
        attributions,
        conversionFunnel,
        roiData,
        topPosts: topPosts.posts || [],
        dateRange,
        model
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="conversion-attribution-${dateRange}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON format
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        dateRange,
        attributionModel: model,
        data: {
          attributions,
          conversionFunnel,
          roiData,
          topPosts: topPosts.posts || []
        },
        summary: {
          totalAttributions: attributions.length,
          totalRevenue: attributions.reduce((sum: number, attr: any) => sum + attr.conversionValue, 0),
          averageConversionValue: attributions.length > 0 
            ? attributions.reduce((sum: number, attr: any) => sum + attr.conversionValue, 0) / attributions.length 
            : 0,
          conversionRate: conversionFunnel.conversionRates.overallConversion,
          roi: roiData.roiPercentage
        }
      });
    }
  } catch (error) {
    console.error('Error exporting conversion data:', error);
    return NextResponse.json(
      { error: 'Failed to export conversion data' },
      { status: 500 }
    );
  }
}

function generateCSVReport(data: {
  attributions: any[];
  conversionFunnel: any;
  roiData: any;
  topPosts: any[];
  dateRange: string;
  model: string;
}): string {
  const { attributions, conversionFunnel, roiData, topPosts, dateRange, model } = data;
  
  let csv = '';
  
  // Header information
  csv += `Conversion Attribution Report\n`;
  csv += `Generated: ${new Date().toISOString()}\n`;
  csv += `Date Range: ${dateRange}\n`;
  csv += `Attribution Model: ${model}\n\n`;
  
  // Summary metrics
  csv += `SUMMARY METRICS\n`;
  csv += `Total Revenue,${roiData.totalRevenue}\n`;
  csv += `Total Conversions,${roiData.conversions}\n`;
  csv += `ROI Percentage,${roiData.roiPercentage.toFixed(2)}%\n`;
  csv += `Overall Conversion Rate,${conversionFunnel.conversionRates.overallConversion.toFixed(2)}%\n\n`;
  
  // Conversion funnel
  csv += `CONVERSION FUNNEL\n`;
  csv += `Stage,Count,Conversion Rate\n`;
  csv += `Blog Views,${conversionFunnel.blogViews},100.0%\n`;
  csv += `CTA Clicks,${conversionFunnel.ctaClicks},${conversionFunnel.conversionRates.blogToCTA.toFixed(2)}%\n`;
  csv += `Course Page Views,${conversionFunnel.coursePageViews},${conversionFunnel.conversionRates.ctaToCourse.toFixed(2)}%\n`;
  csv += `Inquiries,${conversionFunnel.inquiries},${conversionFunnel.conversionRates.courseToInquiry.toFixed(2)}%\n`;
  csv += `Enrollments,${conversionFunnel.enrollments},${conversionFunnel.conversionRates.inquiryToEnrollment.toFixed(2)}%\n`;
  csv += `Payments,${conversionFunnel.payments},${conversionFunnel.conversionRates.enrollmentToPayment.toFixed(2)}%\n\n`;
  
  // Lead attributions
  csv += `LEAD ATTRIBUTIONS\n`;
  csv += `Blog Post,Course,Revenue,Attribution Weight,Touch Points,Time to Conversion (hours)\n`;
  attributions.forEach(attr => {
    csv += `"${attr.blogPostTitle}","${attr.courseName}",${attr.conversionValue},${(attr.attributionWeight * 100).toFixed(0)}%,${attr.touchPoints.length},${Math.round(attr.conversionTime / 3600)}\n`;
  });
  csv += `\n`;
  
  // Top performing posts
  csv += `TOP PERFORMING POSTS\n`;
  csv += `Post Title,Views,CTA Clicks,Conversions,Revenue,ROI,Conversion Rate\n`;
  topPosts.forEach(post => {
    csv += `"${post.title}",${post.views},${post.ctaClicks},${post.conversions},${post.revenue},${post.roi.toFixed(2)}%,${post.conversionRate.toFixed(2)}%\n`;
  });
  
  return csv;
}
