import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/auth/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const session = getSessionFromHeaders(request.headers);
    if (!session || !session.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock content performance data (in production, this would come from Firebase/GA4)
    const contentData = {
      topPages: [
        {
          path: '/',
          title: 'Home - Aviators Training Centre',
          views: 2847,
          uniqueUsers: 1923,
          avgTimeOnPage: '02:34',
          bounceRate: 32.5,
          conversions: 23,
          conversionRate: 1.2,
          trend: 15.3
        },
        {
          path: '/blog',
          title: 'Aviation Training Blog',
          views: 1654,
          uniqueUsers: 1234,
          avgTimeOnPage: '03:45',
          bounceRate: 28.7,
          conversions: 18,
          conversionRate: 1.5,
          trend: 8.7
        },
        {
          path: '/contact',
          title: 'Contact Us - Book Your Training',
          views: 987,
          uniqueUsers: 876,
          avgTimeOnPage: '01:23',
          bounceRate: 45.2,
          conversions: 45,
          conversionRate: 5.1,
          trend: 22.1
        }
      ].slice(0, limit),
      topBlogPosts: [
        {
          slug: 'pilot-training-guide-2024',
          title: 'Complete Pilot Training Guide 2024',
          author: 'Captain Smith',
          publishedAt: '2024-01-15',
          views: 3421,
          uniqueUsers: 2876,
          avgTimeOnPage: '05:23',
          bounceRate: 22.3,
          shares: 87,
          comments: 23,
          trend: 18.5
        },
        {
          slug: 'aviation-weather-basics',
          title: 'Understanding Aviation Weather Patterns',
          author: 'Sarah Johnson',
          publishedAt: '2024-01-10',
          views: 2134,
          uniqueUsers: 1876,
          avgTimeOnPage: '04:12',
          bounceRate: 25.7,
          shares: 54,
          comments: 16,
          trend: 12.3
        }
      ].slice(0, limit),
      seoPerformance: [
        {
          page: '/',
          title: 'Aviators Training Centre - Professional Pilot Training',
          clicks: 1234,
          impressions: 15678,
          ctr: 0.078,
          position: 3.2,
          keywords: ['pilot training', 'aviation school', 'flight training', 'commercial pilot', 'ppl training']
        },
        {
          page: '/blog/pilot-training-guide-2024',
          title: 'Complete Pilot Training Guide 2024',
          clicks: 876,
          impressions: 12345,
          ctr: 0.071,
          position: 4.1,
          keywords: ['pilot training guide', 'how to become pilot', 'flight training steps', 'aviation career']
        }
      ].slice(0, limit),
      conversionPages: [
        {
          path: '/contact',
          title: 'Contact Us - Book Your Training',
          conversions: 45,
          conversionRate: 5.1,
          revenue: 12500,
          trend: 22.1
        },
        {
          path: '/courses',
          title: 'Aviation Training Courses',
          conversions: 32,
          conversionRate: 3.8,
          revenue: 8900,
          trend: 15.7
        }
      ].slice(0, limit),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: contentData
    });

  } catch (error) {
    console.error('Top content analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}