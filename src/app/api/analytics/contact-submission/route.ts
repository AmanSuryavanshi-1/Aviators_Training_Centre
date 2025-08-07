import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Here you would typically store this in your database
    console.log('Contact Form Submission tracked:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message?.substring(0, 100) + '...', // Log first 100 chars
      source: data.source,
      timestamp: data.timestamp,
      referrer: data.referrer,
      sessionId: data.sessionId
    });

    // In a real implementation, you'd save to database:
    // await db.contactSubmissions.create({ data });
    
    // Also trigger any follow-up actions like email notifications
    // await sendNotificationEmail(data);

    return NextResponse.json({
      success: true,
      message: 'Contact form submission tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking contact form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track contact form submission' },
      { status: 500 }
    );
  }
}