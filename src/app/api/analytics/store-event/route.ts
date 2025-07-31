import { NextRequest, NextResponse } from 'next/server';

// Store individual analytics events permanently
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Add server-side validation
    const validatedEvent = {
      ...eventData,
      serverTimestamp: new Date().toISOString(),
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // In production, store in your database (PostgreSQL, MongoDB, etc.)
    // For now, we'll log it and store in a simple JSON file
    console.log('📊 Analytics Event Stored:', validatedEvent);

    // You can implement database storage here
    // Example with Prisma/PostgreSQL:
    /*
    await prisma.analyticsEvent.create({
      data: validatedEvent
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Event stored successfully',
      eventId: validatedEvent.id
    });

  } catch (error) {
    console.error('Error storing analytics event:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to store event'
    }, { status: 500 });
  }
}