# Analytics System

> **Multi-source tracking, conversion analytics, and dashboard**

Last Updated: December 20, 2025

---

## Overview

The analytics system tracks user behavior across multiple sources:
- Google Analytics 4
- Firebase Firestore (custom analytics)
- Meta Pixel (Facebook)
- Vercel Analytics

---

## Current Implementation

### Architecture

```
Analytics System
├── Client-Side Tracking
│   ├── Page Views
│   ├── CTA Clicks
│   ├── Form Submissions
│   └── User Journey
│
├── Server-Side Storage
│   ├── Firestore Collections
│   │   ├── analytics_events
│   │   ├── user_sessions
│   │   └── traffic_sources
│   └── API Endpoints
│
├── Bot Detection
│   ├── User Agent Analysis
│   ├── Behavior Patterns
│   └── Confidence Scoring
│
└── Dashboard
    ├── Real-time Metrics
    ├── Traffic Sources
    └── Conversion Tracking
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/analytics/client.ts` | Client-side tracking singleton |
| `src/lib/analytics/conversion-tracking.ts` | Conversion events |
| `src/lib/analytics/botDetection.ts` | Bot filtering |
| `src/lib/firebase/collections.ts` | Firestore storage |
| `src/components/admin/AdvancedAnalyticsDashboard.tsx` | Dashboard UI |

---

## Core Logic

### Client-Side Analytics Singleton

```typescript
// src/lib/analytics/client.ts
export type EventType = 'pageview' | 'cta_click' | 'contact_visit' | 'form_submission';

interface AnalyticsEvent {
  type: EventType;
  page: string;
  timestamp: string;
  data?: Record<string, any>;
}

class AnalyticsClient {
  private static instance: AnalyticsClient;
  private queue: AnalyticsEvent[] = [];
  private config: AnalyticsConfig = {
    enabled: true,
    debug: false,
    batchSize: 3,
    flushInterval: 30000, // 30 seconds
  };

  private userId: string;
  private sessionId: string;

  private constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = generateId();
    this.setupAutoFlush();
  }

  static getInstance(): AnalyticsClient {
    if (!this.instance && typeof window !== 'undefined') {
      this.instance = new AnalyticsClient();
    }
    return this.instance;
  }

  // Track an event
  track(event: AnalyticsEvent): void {
    if (!this.config.enabled) return;

    this.queue.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Flush when batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Send events to server
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          userId: this.userId,
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...events);
    }
  }

  // Auto-flush setup
  private setupAutoFlush(): void {
    setInterval(() => this.flush(), this.config.flushInterval);

    // Flush on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Flush before unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = generateId();
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }
}

export const analytics = AnalyticsClient.getInstance();
```

### Event Tracking Usage

```typescript
// Track page view
analytics.track({
  type: 'pageview',
  page: window.location.pathname,
});

// Track CTA click
analytics.track({
  type: 'cta_click',
  page: '/courses',
  data: {
    ctaId: 'hero-book-demo',
    ctaText: 'Book Free Demo',
  },
});

// Track form submission
analytics.track({
  type: 'form_submission',
  page: '/contact',
  data: {
    formType: 'contact',
    success: true,
  },
});
```

### Bot Detection

```typescript
// src/lib/analytics/botDetection.ts
export function detectBot(userAgent: string): BotDetectionResult {
  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /slurp/i,
    /googlebot/i,
    /bingbot/i,
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Calculate confidence score
  let confidence = isBot ? 0.9 : 0.1;
  
  // Check for suspicious behavior patterns
  const flags: string[] = [];
  
  if (!userAgent) {
    flags.push('missing_user_agent');
    confidence = 0.95;
  }
  
  if (userAgent.length < 20) {
    flags.push('short_user_agent');
    confidence += 0.1;
  }

  return {
    isBot,
    confidence: Math.min(confidence, 1),
    flags,
  };
}
```

### Firestore Collections

```typescript
// src/lib/firebase/collections.ts
export class AnalyticsEventsService {
  private static collection = db.collection('analytics_events');

  static async createEvent(eventData: {
    userId?: string;
    sessionId: string;
    timestamp: Date;
    event: {
      type: 'page_view' | 'conversion' | 'interaction';
      page: string;
      data?: any;
    };
    source: {
      utm_source?: string;
      utm_medium?: string;
      category: string;
    };
    validation: {
      isValid: boolean;
      isBot: boolean;
      confidence: number;
    };
  }) {
    return await this.collection.add({
      ...eventData,
      timestamp: Timestamp.now(),
    });
  }

  static async getEvents(filters: {
    startDate: Date;
    endDate: Date;
    eventType?: string;
    validOnly?: boolean;
    limit?: number;
  }) {
    let query = this.collection
      .where('timestamp', '>=', Timestamp.fromDate(filters.startDate))
      .where('timestamp', '<=', Timestamp.fromDate(filters.endDate));

    if (filters.eventType) {
      query = query.where('event.type', '==', filters.eventType);
    }

    if (filters.validOnly) {
      query = query.where('validation.isBot', '==', false);
    }

    return await query.limit(filters.limit || 1000).get();
  }
}
```

---

## Dashboard

### AdvancedAnalyticsDashboard

```typescript
// src/components/admin/AdvancedAnalyticsDashboard.tsx
interface DetailedAnalyticsData {
  // Content metrics
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  
  // Event metrics
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;
  
  // User metrics
  uniqueUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  
  // Conversion metrics
  conversionRate: number;
  leadValue: number;
  
  // Traffic sources
  trafficSources: Array<{
    source: string;
    medium: string;
    visitors: number;
    conversions: number;
  }>;
  
  // Bot detection
  botTraffic: {
    total: number;
    percentage: number;
    bySource: Record<string, number>;
  };
}

function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<DetailedAnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch analytics data
  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        body: JSON.stringify({ dateRange }),
      });
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, [dateRange]);

  // Render dashboard with charts and metrics
}
```

---

## UTM Tracking

### UTMTracker Component

```typescript
// src/components/analytics/UTMTracker.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function UTMTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmParams = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term'),
    };

    // Store in session storage
    if (Object.values(utmParams).some(v => v)) {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    }

    // Track source
    const referrer = document.referrer;
    const source = categorizeSource(utmParams, referrer);
    
    analytics.track({
      type: 'pageview',
      page: window.location.pathname,
      data: { source, ...utmParams },
    });
  }, [searchParams]);

  return null; // No UI
}

function categorizeSource(utm: object, referrer: string): string {
  if (utm.utm_source) return 'paid';
  if (referrer.includes('google')) return 'organic';
  if (referrer.includes('facebook')) return 'social';
  if (!referrer) return 'direct';
  return 'referral';
}
```

---

## How to Use

### Track Custom Events

```typescript
import { analytics } from '@/lib/analytics/client';

// In any component
function BookDemoButton() {
  const handleClick = () => {
    analytics.track({
      type: 'cta_click',
      page: '/courses',
      data: {
        ctaId: 'book-demo',
        variant: 'primary',
      },
    });
    // ... rest of logic
  };

  return <Button onClick={handleClick}>Book Demo</Button>;
}
```

### Access Dashboard

1. Go to `/admin/analytics`
2. Login with admin credentials
3. Select date range and filters
4. Export data as CSV/Excel

---

## Extension Guide

### Adding New Event Type

```typescript
// 1. Add to EventType
export type EventType = 
  | 'pageview' 
  | 'cta_click' 
  | 'form_submission'
  | 'video_play'; // New

// 2. Track the event
analytics.track({
  type: 'video_play',
  page: '/courses/cpl',
  data: {
    videoId: 'intro-video',
    duration: 120,
  },
});
```

### Adding New Dashboard Widget

```typescript
// src/components/admin/widgets/VideoMetrics.tsx
export function VideoMetrics({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Total Plays: {data.videoPlays}</div>
        <div>Avg Duration: {data.avgDuration}s</div>
      </CardContent>
    </Card>
  );
}
```

---

## Performance Considerations

- **Batch events**: Queue up to 3 events before sending
- **Flush on hide**: Send events when user leaves page
- **Bot filtering**: Exclude bots from conversion metrics
- **Indexes**: Firestore indexes for date range queries

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Events not tracking | Check if `analytics` is enabled |
| High bot traffic | Review bot detection patterns |
| Dashboard slow | Add date range limit, use indexes |
| Missing UTM data | Verify UTMTracker is in layout |

---

## Related Documentation

- [Admin Dashboard](admin-dashboard.md)
- [API Integration](../API_INTEGRATION.md)
- [Database Schema](../DATABASE_SCHEMA.md)
