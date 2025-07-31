import { NextRequest, NextResponse } from 'next/server';
import { socialProofService } from '@/lib/cta/social-proof-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    const courseId = searchParams.get('courseId') || undefined;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get social proof metrics
    const metrics = await socialProofService.getSocialProofMetrics({ start: startDate, end: endDate });

    // Get social proof summary for course if specified
    let courseSummary = null;
    if (courseId && courseId !== 'all') {
      courseSummary = await socialProofService.getSocialProofSummary(courseId);
    }

    // Mock performance data - replace with actual database queries
    const performanceData = [
      { date: '2024-01-01', testimonialViews: 450, successStoryViews: 320, certificationViews: 180, achievementViews: 380, conversions: 23, conversionRate: 12.5 },
      { date: '2024-01-02', testimonialViews: 520, successStoryViews: 380, certificationViews: 220, achievementViews: 420, conversions: 28, conversionRate: 14.2 },
      { date: '2024-01-03', testimonialViews: 480, successStoryViews: 350, certificationViews: 200, achievementViews: 400, conversions: 25, conversionRate: 13.8 },
      { date: '2024-01-04', testimonialViews: 580, successStoryViews: 420, certificationViews: 250, achievementViews: 480, conversions: 32, conversionRate: 16.1 },
      { date: '2024-01-05', testimonialViews: 620, successStoryViews: 450, certificationViews: 280, achievementViews: 520, conversions: 35, conversionRate: 17.2 },
      { date: '2024-01-06', testimonialViews: 550, successStoryViews: 400, certificationViews: 230, achievementViews: 460, conversions: 30, conversionRate: 15.8 },
      { date: '2024-01-07', testimonialViews: 590, successStoryViews: 430, certificationViews: 260, achievementViews: 500, conversions: 33, conversionRate: 16.5 },
    ];

    const elementPerformance = [
      { element: 'Student Testimonials', views: 5420, clicks: 234, conversions: 89, conversionRate: 38.0, trustScore: 92 },
      { element: 'Success Stories', views: 3210, clicks: 156, conversions: 67, conversionRate: 42.9, trustScore: 88 },
      { element: 'Achievement Counters', views: 4500, clicks: 89, conversions: 23, conversionRate: 25.8, trustScore: 85 },
      { element: 'Industry Certifications', views: 2100, clicks: 45, conversions: 12, conversionRate: 26.7, trustScore: 90 },
      { element: 'Alumni Network', views: 1800, clicks: 67, conversions: 28, conversionRate: 41.8, trustScore: 87 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        courseSummary,
        performanceData,
        elementPerformance,
        insights: [
          {
            type: 'high_performer',
            title: 'High Performer',
            description: 'Success Stories have the highest conversion rate at 42.9%. Consider featuring more success stories prominently.',
            icon: 'thumbs-up',
            color: 'green'
          },
          {
            type: 'growth_opportunity',
            title: 'Growth Opportunity',
            description: 'Achievement Counters have high views but low conversion. Try adding more interactive elements or CTAs.',
            icon: 'trending-up',
            color: 'blue'
          },
          {
            type: 'trust_builder',
            title: 'Trust Builder',
            description: 'Student Testimonials have the highest trust score (92). Leverage these for credibility-focused campaigns.',
            icon: 'star',
            color: 'purple'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching social proof analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social proof analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { elementType, action, courseId, blogPostSlug } = body;

    // Track social proof interaction
    await socialProofService.trackSocialProofInteraction(
      elementType,
      action,
      courseId || blogPostSlug
    );

    return NextResponse.json({
      success: true,
      message: 'Social proof interaction tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking social proof interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track social proof interaction' },
      { status: 500 }
    );
  }
}
