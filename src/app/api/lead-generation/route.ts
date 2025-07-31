import { NextRequest, NextResponse } from 'next/server';
import { LeadGenerationEvent } from '@/lib/types/lead-generation';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create lead generation event
    const event: LeadGenerationEvent = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId || 'anonymous',
      toolType: data.toolType,
      eventType: 'completed',
      data: data.result,
      timestamp: new Date(),
      source: 'lead-generation-tools',
      sessionId: data.sessionId || 'unknown'
    };

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send to CRM system
    // 3. Trigger email notifications
    // 4. Update analytics
    
    console.log('Lead generation event:', event);

    // Mock response for now
    return NextResponse.json({
      success: true,
      eventId: event.id,
      message: 'Lead data captured successfully'
    });

  } catch (error) {
    console.error('Error processing lead generation data:', error);
    return NextResponse.json(
      { error: 'Failed to process lead data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolType = searchParams.get('toolType');
    const userId = searchParams.get('userId');

    // Mock analytics data
    const mockMetrics = {
      toolType: toolType || 'all',
      totalStarts: 1250,
      totalCompletions: 987,
      completionRate: 78.96,
      conversionRate: 23.4,
      averageTimeToComplete: 6.5,
      topRecommendations: [
        'Commercial Pilot License (CPL)',
        'RTR License',
        'Type Rating (A320)',
        'Career Assessment'
      ],
      userSegments: {
        'Beginner': 45,
        'Intermediate': 35,
        'Advanced': 20
      }
    };

    return NextResponse.json({
      success: true,
      metrics: mockMetrics
    });

  } catch (error) {
    console.error('Error fetching lead generation metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
