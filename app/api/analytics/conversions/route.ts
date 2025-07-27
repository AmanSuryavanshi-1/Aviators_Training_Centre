/**
 * API endpoint for conversion analytics
 */

import { NextRequest, NextResponse } from 'next/server';

interface ConversionEvent {
  id: string;
  userId: string;
  sessionId: string;
  blogPostId?: string;
  eventType: 'blog_view' | 'cta_click' | 'contact_visit' | 'form_submit';
  timestamp: Date;
  metadata: Record<string, any>;
  conversionValue: number;
  source: string;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
let conversionEvents: ConversionEvent[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const eventType = searchParams.get('eventType');

    // Filter events by timeframe
    const now = new Date();
    let startDate = new Date(0); // Beginning of time
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    let filteredEvents = conversionEvents.filter(event => 
      new Date(event.timestamp) >= startDate
    );

    // Filter by event type if specified
    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }

    // Calculate metrics
    const blogViews = filteredEvents.filter(e => e.eventType === 'blog_view').length;
    const uniqueVisitors = new Set(filteredEvents.filter(e => e.eventType === 'blog_view').map(e => e.userId)).size;
    const ctaClicks = filteredEvents.filter(e => e.eventType === 'cta_click').length;
    const contactPageVisits = filteredEvents.filter(e => e.eventType === 'contact_visit').length;
    const formSubmissions = filteredEvents.filter(e => e.eventType === 'form_submit').length;

    // Calculate blog-to-contact conversions
    const blogToContactConversions = filteredEvents.filter(e => 
      e.eventType === 'contact_visit' && e.metadata.fromBlog
    ).length;

    const conversionRate = uniqueVisitors > 0 ? (formSubmissions / uniqueVisitors) * 100 : 0;
    const blogToContactRate = uniqueVisitors > 0 ? (blogToContactConversions / uniqueVisitors) * 100 : 0;

    const analytics = {
      totalBlogViews: blogViews,
      uniqueVisitors,
      ctaClicks,
      contactPageVisits,
      formSubmissions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      blogToContactRate: Math.round(blogToContactRate * 100) / 100,
      events: filteredEvents.slice(-50) // Return last 50 events for analysis
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching conversion analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch conversion analytics' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid events data' 
        },
        { status: 400 }
      );
    }

    // Validate and store events
    const validEvents = events.filter((event: any) => {
      return event.id && 
             event.userId && 
             event.sessionId && 
             event.eventType && 
             event.timestamp;
    });

    // Add events to storage (avoiding duplicates)
    const existingIds = new Set(conversionEvents.map(e => e.id));
    const newEvents = validEvents.filter((event: ConversionEvent) => !existingIds.has(event.id));
    
    conversionEvents.push(...newEvents);

    // Keep only last 1000 events to prevent memory issues
    if (conversionEvents.length > 1000) {
      conversionEvents = conversionEvents.slice(-1000);
    }

    return NextResponse.json({
      success: true,
      message: `Stored ${newEvents.length} new conversion events`,
      totalEvents: conversionEvents.length
    });

  } catch (error) {
    console.error('Error storing conversion events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to store conversion events' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '30');

    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const originalCount = conversionEvents.length;
    
    conversionEvents = conversionEvents.filter(event => 
      new Date(event.timestamp) >= cutoffDate
    );

    const deletedCount = originalCount - conversionEvents.length;

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} old conversion events`,
      remainingEvents: conversionEvents.length
    });

  } catch (error) {
    console.error('Error cleaning up conversion events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clean up conversion events' 
      },
      { status: 500 }
    );
  }
}