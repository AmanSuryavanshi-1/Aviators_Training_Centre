// Firebase Firestore Types for Advanced Analytics Dashboard

import { Timestamp } from 'firebase/firestore';

// Core Analytics Event Document
export interface AnalyticsEventDocument {
  id: string;
  timestamp: Timestamp;
  userId: string;
  sessionId: string;
  
  event: {
    type: 'page_view' | 'interaction' | 'conversion' | 'journey_start' | 'journey_end';
    category: string;
    action: string;
    label?: string;
    value?: number;
  };
  
  page: {
    url: string;
    title: string;
    path: string;
    category: 'blog' | 'home' | 'contact' | 'courses' | 'about';
  };
  
  source: {
    category: 'organic' | 'direct' | 'social' | 'ai_assistant' | 'referral' | 'email' | 'paid';
    source: string;
    medium: string;
    campaign?: string;
    isAuthentic: boolean;
    confidence: number;
  };
  
  user: {
    isReturning: boolean;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    os: string;
    country?: string;
    region?: string;
  };
  
  journey: {
    journeyId: string;
    stepNumber: number;
    isEntryPoint: boolean;
    isExitPoint: boolean;
    timeSpent: number;
    scrollDepth: number;
  };
  
  validation: {
    isValid: boolean;
    isBot: boolean;
    botScore: number;
    flags: string[];
  };
}

// User Journey Document
export interface UserJourneyDocument {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  
  entry: {
    page: string;
    source: TrafficSource;
    referrer: string;
    utm: UTMParameters;
  };
  
  path: JourneyStep[];
  
  outcome: {
    type: 'conversion' | 'bounce' | 'exit' | 'ongoing';
    conversionType?: string;
    conversionValue?: number;
    exitPage?: string;
  };
  
  metrics: {
    duration: number;
    pageCount: number;
    interactionCount: number;
    averageScrollDepth: number;
    engagementScore: number;
  };
  
  attribution: {
    firstTouch: TrafficSource;
    lastTouch: TrafficSource;
    assistingChannels: TrafficSource[];
  };
}

// Traffic Source Document
export interface TrafficSourceDocument {
  id: string;
  date: string; // YYYY-MM-DD
  source: string;
  medium: string;
  category: string;
  
  metrics: {
    visitors: number;
    sessions: number;
    pageViews: number;
    conversions: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  
  authenticity: {
    validTraffic: number;
    suspiciousTraffic: number;
    botTraffic: number;
    confidenceScore: number;
  };
}

// Supporting Types
export interface TrafficSource {
  id: string;
  category: 'organic' | 'direct' | 'social' | 'ai_assistant' | 'referral' | 'email' | 'paid';
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  isAuthentic: boolean;
  confidence: number;
  detectedAt: Date;
}

export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface JourneyStep {
  stepNumber: number;
  page: string;
  title: string;
  timestamp: Timestamp;
  timeSpent: number;
  scrollDepth: number;
  interactions: string[];
  exitPoint?: boolean;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

// Firestore Collection Names
export const COLLECTIONS = {
  ANALYTICS_EVENTS: 'analytics_events',
  USER_JOURNEYS: 'user_journeys',
  TRAFFIC_SOURCES: 'traffic_sources'
} as const;

// Firestore Index Definitions
export interface FirestoreIndex {
  collection: string;
  fields: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

export const REQUIRED_INDEXES: FirestoreIndex[] = [
  // Analytics events by time and source
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'timestamp', order: 'desc' },
      { field: 'source.category', order: 'asc' },
      { field: 'validation.isValid', order: 'asc' }
    ]
  },
  
  // Analytics events by user and session
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'sessionId', order: 'asc' },
      { field: 'timestamp', order: 'desc' }
    ]
  },
  
  // Analytics events by page category and time
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'page.category', order: 'asc' },
      { field: 'timestamp', order: 'desc' },
      { field: 'validation.isValid', order: 'asc' }
    ]
  },
  
  // User journeys by outcome and source
  {
    collection: COLLECTIONS.USER_JOURNEYS,
    fields: [
      { field: 'startTime', order: 'desc' },
      { field: 'outcome.type', order: 'asc' },
      { field: 'entry.source.category', order: 'asc' }
    ]
  },
  
  // User journeys by user and time
  {
    collection: COLLECTIONS.USER_JOURNEYS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'startTime', order: 'desc' }
    ]
  },
  
  // Traffic sources by date and performance
  {
    collection: COLLECTIONS.TRAFFIC_SOURCES,
    fields: [
      { field: 'date', order: 'desc' },
      { field: 'metrics.conversionRate', order: 'desc' },
      { field: 'authenticity.confidenceScore', order: 'desc' }
    ]
  },
  
  // Traffic sources by category and date
  {
    collection: COLLECTIONS.TRAFFIC_SOURCES,
    fields: [
      { field: 'category', order: 'asc' },
      { field: 'date', order: 'desc' }
    ]
  }
];