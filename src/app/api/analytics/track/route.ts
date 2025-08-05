import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEventsService, UserSessionsService, TrafficSourcesService } from '@/lib/firebase/collections';

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegram/i, /discord/i
];

function detectBot(userAgent: string): boolean {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = getClientIP(request);
    
    // Validate required fields
    if (!body.sessionId || !body.event || !body.source) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Bot detection
    const isBot = detectBot(userAgent);
    const isValid = !isBot && body.event.type && body.event.page;
    
    // Prepare event data (filter out undefined values)
    const eventData: any = {
      sessionId: body.sessionId,
      timestamp: new Date(),
      event: body.event,
      source: body.source,
      user: {
        userAgent,
        ipAddress,
        device: body.user?.device || {
          type: 'unknown',
          browser: 'unknown',
          os: 'unknown'
        }
      },
      validation: {
        isValid,
        isBot,
        confidence: isValid ? 95 : 20,
        flags: isBot ? ['bot_detected'] : []
      }
    };

    // Only add userId if it's defined
    if (body.userId) {
      eventData.userId = body.userId;
    }
    
    // Store the event
    const eventId = await AnalyticsEventsService.createEvent(eventData);
    
    // Update traffic source stats
    if (isValid) {
      await TrafficSourcesService.updateSourceStats(
        body.source.source,
        body.source.medium
      );
      
      // If this is a new source, record it
      if (body.source.source && body.source.category) {
        const sourceData = {
          source: body.source.source,
          category: body.source.category,
          firstSeen: new Date(),
          lastSeen: new Date(),
          totalVisits: 1,
          totalConversions: body.event.type === 'conversion' ? 1 : 0,
        };

        // Only add optional fields if they're defined
        if (body.source.medium) {
          sourceData.medium = body.source.medium;
        }
        if (body.source.campaign) {
          sourceData.campaign = body.source.campaign;
        }
        if (body.source.referrer) {
          sourceData.referrer = body.source.referrer;
        }

        await TrafficSourcesService.recordSource(sourceData);
      }
      
      // Update conversion count if applicable
      if (body.event.type === 'conversion') {
        await TrafficSourcesService.incrementConversions(
          body.source.source,
          body.source.medium
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      eventId,
      processed: isValid,
      botDetected: isBot
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Analytics tracking endpoint is operational' 
  });
}