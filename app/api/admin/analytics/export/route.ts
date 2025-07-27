import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';

export async function POST(request: NextRequest) {
  try {
    const { dateRange, metrics } = await request.json();

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
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Fetch blog posts data
    const blogPosts = await sanityClient.fetch(`
      *[_type == "post" && publishedAt >= $start && publishedAt <= $end] {
        _id,
        title,
        slug,
        publishedAt,
        category->{title},
        author->{name},
        "views": coalesce(views, 0),
        "uniqueViews": coalesce(uniqueViews, 0),
        "ctaClicks": coalesce(ctaClicks, 0),
        "conversions": coalesce(conversions, 0),
        "revenue": coalesce(revenue, 0),
        "averageTimeOnPage": coalesce(averageTimeOnPage, 0),
        "bounceRate": coalesce(bounceRate, 0)
      }
    `, { 
      start: startDate.toISOString(), 
      end: endDate.toISOString() 
    });

    // Generate CSV content
    let csvContent = '';
    
    if (metrics === 'views' || !metrics) {
      csvContent = generateViewsCSV(blogPosts);
    } else if (metrics === 'conversions') {
      csvContent = generateConversionsCSV(blogPosts);
    } else if (metrics === 'visitors') {
      csvContent = generateVisitorsCSV(blogPosts);
    } else {
      csvContent = generateFullAnalyticsCSV(blogPosts);
    }

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="blog-analytics-${dateRange}-${Date.now()}.csv"`
      }
    });

    return response;
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}

function generateViewsCSV(posts: any[]): string {
  const headers = ['Title', 'Slug', 'Published Date', 'Category', 'Author', 'Views', 'Unique Views', 'Avg Time on Page', 'Bounce Rate'];
  
  const rows = posts.map(post => [
    `"${post.title}"`,
    post.slug.current,
    post.publishedAt,
    `"${post.category?.title || 'Uncategorized'}"`,
    `"${post.author?.name || 'Unknown'}"`,
    post.views || 0,
    post.uniqueViews || 0,
    post.averageTimeOnPage || 0,
    `${(post.bounceRate || 0).toFixed(1)}%`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateConversionsCSV(posts: any[]): string {
  const headers = ['Title', 'Slug', 'Published Date', 'Category', 'Views', 'CTA Clicks', 'Conversions', 'Conversion Rate', 'Revenue'];
  
  const rows = posts.map(post => {
    const conversionRate = post.views > 0 ? ((post.conversions || 0) / post.views * 100) : 0;
    return [
      `"${post.title}"`,
      post.slug.current,
      post.publishedAt,
      `"${post.category?.title || 'Uncategorized'}"`,
      post.views || 0,
      post.ctaClicks || 0,
      post.conversions || 0,
      `${conversionRate.toFixed(2)}%`,
      post.revenue || 0
    ];
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateVisitorsCSV(posts: any[]): string {
  const headers = ['Title', 'Slug', 'Published Date', 'Views', 'Unique Views', 'Return Visitor Rate', 'New Visitor Rate'];
  
  const rows = posts.map(post => {
    const uniqueViews = post.uniqueViews || 0;
    const totalViews = post.views || 0;
    const returnVisitorRate = totalViews > 0 ? ((totalViews - uniqueViews) / totalViews * 100) : 0;
    const newVisitorRate = 100 - returnVisitorRate;
    
    return [
      `"${post.title}"`,
      post.slug.current,
      post.publishedAt,
      totalViews,
      uniqueViews,
      `${returnVisitorRate.toFixed(1)}%`,
      `${newVisitorRate.toFixed(1)}%`
    ];
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateFullAnalyticsCSV(posts: any[]): string {
  const headers = [
    'Title', 'Slug', 'Published Date', 'Category', 'Author', 
    'Views', 'Unique Views', 'CTA Clicks', 'Conversions', 
    'Revenue', 'Avg Time on Page', 'Bounce Rate', 'Conversion Rate'
  ];
  
  const rows = posts.map(post => {
    const conversionRate = post.views > 0 ? ((post.conversions || 0) / post.views * 100) : 0;
    
    return [
      `"${post.title}"`,
      post.slug.current,
      post.publishedAt,
      `"${post.category?.title || 'Uncategorized'}"`,
      `"${post.author?.name || 'Unknown'}"`,
      post.views || 0,
      post.uniqueViews || 0,
      post.ctaClicks || 0,
      post.conversions || 0,
      post.revenue || 0,
      post.averageTimeOnPage || 0,
      `${(post.bounceRate || 0).toFixed(1)}%`,
      `${conversionRate.toFixed(2)}%`
    ];
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}