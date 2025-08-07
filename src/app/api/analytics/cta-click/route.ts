import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Here you would typically store this in your database
    // For now, we'll log it and return success
    console.log('CTA Click tracked:', {
      ctaText: data.ctaText,
      ctaLocation: data.ctaLocation,
      pageUrl: data.pageUrl,
      timestamp: data.timestamp,
      source: data.referrer,
      sessionId: data.sessionId
    });

    // In a real implementation, you'd save to database:
    // await db.ctaClicks.create({ data });

    return NextResponse.json({
      success: true,
      message: 'CTA click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking CTA click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track CTA click' },
      { status: 500 }
    );
  }
}