import { NextRequest, NextResponse } from 'next/server';
import { UserSessionsService } from '@/lib/firebase/collections';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }
    
    await UserSessionsService.endSession(body.sessionId, {
      endTime: body.endTime ? new Date(body.endTime) : new Date(),
      totalDuration: body.totalDuration || 0,
      totalPageViews: body.totalPageViews || 0,
      outcome: body.outcome || 'exit',
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end session' },
      { status: 500 }
    );
  }
}