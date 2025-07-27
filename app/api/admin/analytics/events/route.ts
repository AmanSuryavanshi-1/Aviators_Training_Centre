import { NextRequest, NextResponse } from 'next/server';
import { ConversionEvent } from '@/lib/analytics/conversion-tracking';

// Store conversion events in database
export async function POST(request: NextRequest) {
  try {
    const event: ConversionEvent = await request.json();

    // In a real implementation, you would store this in your database
    // For now, we'll just log it and return success
    
    console.log('Storing conversion event:', {
      id: event.id,
      type: event.type,
      blogPostSlug: event.blogPostSlug,
      courseSlug: event.courseSlug,
      userId: event.userId,
      sessionId: event.sessionId,
      value: event.value,
      timestamp: event.timestamp
    });

    // Simulate database storage
    // await db.conversionEvents.create({
    //   data: {
    //     id: event.id,
    //     type: event.type,
    //     blogPostId: event.blogPostId,
    //     blogPostSlug: event.blogPostSlug,
    //     courseId: event.courseId,
    //     courseSlug: event.courseSlug,
    //     ctaId: event.ctaId,
    //     ctaPosition: event.ctaPosition,
    //     ctaVariant: event.ctaVariant,
    //     userId: event.userId,
    //     sessionId: event.sessionId,
    //     timestamp: new Date(event.timestamp),
    //     value: event.value,
    //     metadata: event.metadata,
    //     attribution: event.attribution
    //   }
    // });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      message: 'Event stored successfully'
    });
  } catch (error) {
    console.error('Error storing conversion event:', error);
    return NextResponse.json(
      { error: 'Failed to store conversion event' },
      { status: 500 }
    );
  }
}

// Get conversion events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const blogPostId = searchParams.get('blogPostId');
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In a real implementation, you would query your database
    // with the provided filters and pagination
    
    // Mock data for development
    const mockEvents: ConversionEvent[] = generateMockEvents();
    
    let filteredEvents = mockEvents;

    // Apply filters
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }
    
    if (blogPostId) {
      filteredEvents = filteredEvents.filter(event => event.blogPostId === blogPostId);
    }
    
    if (courseId) {
      filteredEvents = filteredEvents.filter(event => event.courseId === courseId);
    }
    
    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId);
    }
    
    if (start && end) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= start && event.timestamp <= end
      );
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return NextResponse.json({
      events: paginatedEvents,
      total: filteredEvents.length,
      limit,
      offset,
      hasMore: offset + limit < filteredEvents.length
    });
  } catch (error) {
    console.error('Error fetching conversion events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion events' },
      { status: 500 }
    );
  }
}

function generateMockEvents(): ConversionEvent[] {
  const events: ConversionEvent[] = [];
  const eventTypes: ConversionEvent['type'][] = ['blog_view', 'cta_click', 'course_page_view', 'inquiry_form', 'enrollment', 'payment'];
  const blogPosts = [
    { id: 'post_1', slug: 'dgca-exam-preparation' },
    { id: 'post_2', slug: 'aviation-career-guide' },
    { id: 'post_3', slug: 'aircraft-systems-fundamentals' }
  ];
  const courses = [
    { id: 'course_1', slug: 'technical-general' },
    { id: 'course_2', slug: 'cpl-ground-school' },
    { id: 'course_3', slug: 'atpl-ground-school' }
  ];

  // Generate 100 mock events
  for (let i = 0; i < 100; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const blogPost = blogPosts[Math.floor(Math.random() * blogPosts.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const userId = `user_${Math.floor(Math.random() * 50) + 1}`;
    const sessionId = `session_${Math.floor(Math.random() * 100) + 1}`;
    
    // Generate timestamp within last 30 days
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));

    const event: ConversionEvent = {
      id: `conv_${i + 1}`,
      type: eventType,
      blogPostId: blogPost.id,
      blogPostSlug: blogPost.slug,
      courseId: course.id,
      courseSlug: course.slug,
      userId,
      sessionId,
      timestamp: timestamp.toISOString(),
      value: eventType === 'payment' ? Math.floor(Math.random() * 50000) + 10000 : 
             eventType === 'enrollment' ? Math.floor(Math.random() * 25000) + 5000 :
             eventType === 'inquiry_form' ? 50 : 1,
      metadata: {
        referrer: Math.random() > 0.5 ? 'google.com' : 'direct',
        userAgent: 'Mozilla/5.0 (compatible; test)',
        source: 'blog_funnel'
      }
    };

    if (eventType === 'cta_click') {
      event.ctaId = `cta_${Math.floor(Math.random() * 5) + 1}`;
      event.ctaPosition = ['top', 'middle', 'bottom'][Math.floor(Math.random() * 3)];
      event.ctaVariant = ['card', 'banner', 'inline'][Math.floor(Math.random() * 3)];
    }

    events.push(event);
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}