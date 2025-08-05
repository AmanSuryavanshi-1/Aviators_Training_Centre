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
    
    await UserSessionsService.updateSession(body.sessionId, {
      lastActivity: body.lastActivity ? new Date(body.lastActivity) : new Date(),
      pageViews: body.pageViews,
      currentPage: body.currentPage,
      duration: body.duration,
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}