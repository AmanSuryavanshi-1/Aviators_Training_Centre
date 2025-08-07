import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Track page visits for conversion funnel analysis
    console.log('Page Visit tracked:', {
      page: data.page,
      title: data.title,
      source: data.source,
      timestamp: data.timestamp,
      referrer: data.referrer,
      sessionId: data.sessionId
    });

    // In a real implementation, you'd save to database:
    // await db.pageVisits.create({ data });

    return NextResponse.json({
      success: true,
      message: 'Page visit tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page visit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page visit' },
      { status: 500 }
    );
  }
}