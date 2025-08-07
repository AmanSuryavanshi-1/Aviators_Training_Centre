// Firebase Collections for Real Analytics Data
// Updated to use enhanced Firebase authentication

import { getAdminFirestoreSync } from './admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { errorHandler } from '../analytics/ErrorHandler';

// Use synchronous version for backward compatibility
const db = getAdminFirestoreSync();

// Analytics Events Collection
export class AnalyticsEventsService {
  private static collection = db.collection('analytics_events');

  static async createEvent(eventData: {
    userId?: string;
    sessionId: string;
    timestamp: Date;
    event: {
      type: 'page_view' | 'conversion' | 'interaction' | 'form_submission';
      page: string;
      data?: any;
    };
    source: {
      source: string;
      medium?: string;
      campaign?: string;
      category: string;
      referrer?: string;
    };
    user: {
      userAgent: string;
      ipAddress: string;
      location?: {
        country?: string;
        city?: string;
        region?: string;
      };
      device: {
        type: 'desktop' | 'mobile' | 'tablet';
        browser: string;
        os: string;
      };
    };
    validation: {
      isValid: boolean;
      isBot: boolean;
      confidence: number;
      flags: string[];
    };
  }) {
    try {
      const docRef = await this.collection.add({
        ...eventData,
        timestamp: Timestamp.fromDate(eventData.timestamp),
        createdAt: FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'create_event',
        timestamp: new Date()
      });

      console.error('Failed to create analytics event:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  static async getEvents(filters: {
    startDate: Date;
    endDate: Date;
    eventType?: string;
    sourceCategory?: string;
    validOnly?: boolean;
    limit?: number;
  }) {
    try {
      let query = this.collection
        .where('timestamp', '>=', Timestamp.fromDate(filters.startDate))
        .where('timestamp', '<=', Timestamp.fromDate(filters.endDate));

      if (filters.eventType) {
        query = query.where('event.type', '==', filters.eventType);
      }

      if (filters.sourceCategory) {
        query = query.where('source.category', '==', filters.sourceCategory);
      }

      if (filters.validOnly) {
        query = query.where('validation.isValid', '==', true);
      }

      query = query.orderBy('timestamp', 'desc');

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_events',
        timestamp: new Date()
      });

      console.error('Failed to get analytics events:', authError.userMessage);
      return []; // Return empty array as fallback
    }
  }

  static async getUniqueVisitors(startDate: Date, endDate: Date) {
    const events = await this.getEvents({
      startDate,
      endDate,
      eventType: 'page_view',
      validOnly: true,
    });

    const uniqueVisitors = new Set();
    events.forEach(event => {
      if (event.userId) {
        uniqueVisitors.add(event.userId);
      } else {
        // Use sessionId as fallback for unique identification
        uniqueVisitors.add(event.sessionId);
      }
    });

    return uniqueVisitors.size;
  }

  static async getTopSources(startDate: Date, endDate: Date, limit = 10) {
    const events = await this.getEvents({
      startDate,
      endDate,
      validOnly: true,
    });

    const sourceCounts = new Map();
    events.forEach(event => {
      const source = event.source.source;
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });

    return Array.from(sourceCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([source, count]) => ({ source, visitors: count }));
  }

  static async getTopPages(startDate: Date, endDate: Date, limit = 10) {
    const events = await this.getEvents({
      startDate,
      endDate,
      eventType: 'page_view',
      validOnly: true,
    });

    const pageCounts = new Map();
    events.forEach(event => {
      const page = event.event.page;
      pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
    });

    return Array.from(pageCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([page, views]) => ({ page, views }));
  }
}

// User Sessions Collection
export class UserSessionsService {
  private static collection = db.collection('user_sessions');

  static async createSession(sessionData: {
    sessionId: string;
    userId?: string;
    startTime: Date;
    source: any;
    user: any;
    landingPage: string;
  }) {
    await this.collection.doc(sessionData.sessionId).set({
      ...sessionData,
      startTime: Timestamp.fromDate(sessionData.startTime),
      lastActivity: Timestamp.fromDate(sessionData.startTime),
      pageViews: 1,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  static async updateSession(sessionId: string, updates: {
    lastActivity?: Date;
    pageViews?: number;
    currentPage?: string;
    duration?: number;
  }) {
    const updateData: any = {};
    
    if (updates.lastActivity) {
      updateData.lastActivity = Timestamp.fromDate(updates.lastActivity);
    }
    if (updates.pageViews) {
      updateData.pageViews = updates.pageViews;
    }
    if (updates.currentPage) {
      updateData.currentPage = updates.currentPage;
    }
    if (updates.duration) {
      updateData.duration = updates.duration;
    }

    // Check if document exists first
    const docRef = this.collection.doc(sessionId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // Create a new session if it doesn't exist
      await docRef.set({
        sessionId,
        startTime: Timestamp.fromDate(updates.lastActivity || new Date()),
        lastActivity: Timestamp.fromDate(updates.lastActivity || new Date()),
        pageViews: updates.pageViews || 1,
        currentPage: updates.currentPage || '/',
        duration: updates.duration || 0,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        source: { source: 'direct', category: 'direct' },
        user: { userAgent: 'unknown', ipAddress: 'unknown', device: { type: 'desktop', browser: 'unknown', os: 'unknown' } },
        landingPage: updates.currentPage || '/'
      });
    } else {
      await docRef.update(updateData);
    }
  }

  static async endSession(sessionId: string, endData: {
    endTime: Date;
    totalDuration: number;
    totalPageViews: number;
    outcome: 'conversion' | 'exit' | 'bounce';
  }) {
    await this.collection.doc(sessionId).update({
      endTime: Timestamp.fromDate(endData.endTime),
      totalDuration: endData.totalDuration,
      totalPageViews: endData.totalPageViews,
      outcome: endData.outcome,
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async getActiveSessions() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const snapshot = await this.collection
        .where('isActive', '==', true)
        .where('lastActivity', '>=', Timestamp.fromDate(fiveMinutesAgo))
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        lastActivity: doc.data().lastActivity?.toDate() || new Date(),
      }));
    } catch (error: any) {
      console.error('Error getting active sessions:', error);
      
      // If it's an index error, provide helpful information
      if (error.code === 9 && error.details?.includes('index')) {
        console.log('🔍 Firestore Index Required:');
        console.log('Please create this composite index in Firebase Console:');
        console.log('Collection: user_sessions');
        console.log('Fields: isActive (Ascending), lastActivity (Ascending), __name__ (Ascending)');
        console.log('Direct link:', error.details.match(/https:\/\/[^\s]+/)?.[0] || 'Check Firebase Console');
      }
      
      // Return empty array as fallback
      return [];
    }
  }

  static async getSessionMetrics(startDate: Date, endDate: Date) {
    const snapshot = await this.collection
      .where('startTime', '>=', Timestamp.fromDate(startDate))
      .where('startTime', '<=', Timestamp.fromDate(endDate))
      .get();

    const sessions = snapshot.docs.map(doc => doc.data());
    
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.totalDuration || 0), 0);
    const bounces = sessions.filter(session => session.outcome === 'bounce').length;
    const conversions = sessions.filter(session => session.outcome === 'conversion').length;

    return {
      totalSessions,
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      bounceRate: totalSessions > 0 ? (bounces / totalSessions) * 100 : 0,
      conversionRate: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
    };
  }
}

// Traffic Sources Collection (for dynamic source tracking)
export class TrafficSourcesService {
  private static collection = db.collection('traffic_sources');

  static async recordSource(sourceData: {
    source: string;
    medium?: string;
    campaign?: string;
    referrer?: string;
    category: string;
    firstSeen: Date;
    lastSeen: Date;
    totalVisits: number;
    totalConversions: number;
  }) {
    const docId = `${sourceData.source}_${sourceData.medium || 'none'}`;
    
    // Filter out undefined values
    const cleanData: any = {
      source: sourceData.source,
      category: sourceData.category,
      firstSeen: Timestamp.fromDate(sourceData.firstSeen),
      lastSeen: Timestamp.fromDate(sourceData.lastSeen),
      totalVisits: sourceData.totalVisits,
      totalConversions: sourceData.totalConversions,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Only add optional fields if they're defined
    if (sourceData.medium) {
      cleanData.medium = sourceData.medium;
    }
    if (sourceData.campaign) {
      cleanData.campaign = sourceData.campaign;
    }
    if (sourceData.referrer) {
      cleanData.referrer = sourceData.referrer;
    }
    
    await this.collection.doc(docId).set(cleanData, { merge: true });
  }

  static async updateSourceStats(source: string, medium?: string) {
    const docId = `${source}_${medium || 'none'}`;
    
    // Use set with merge to create document if it doesn't exist
    await this.collection.doc(docId).set({
      source,
      medium: medium || 'none',
      category: 'direct', // default category
      totalVisits: FieldValue.increment(1),
      lastSeen: FieldValue.serverTimestamp(),
      firstSeen: FieldValue.serverTimestamp(),
      totalConversions: 0,
    }, { merge: true });
  }

  static async incrementConversions(source: string, medium?: string) {
    const docId = `${source}_${medium || 'none'}`;
    
    await this.collection.doc(docId).update({
      totalConversions: FieldValue.increment(1),
    });
  }

  static async getAllSources() {
    const snapshot = await this.collection.orderBy('totalVisits', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      firstSeen: doc.data().firstSeen.toDate(),
      lastSeen: doc.data().lastSeen.toDate(),
    }));
  }
}

// Real-time Analytics Collection
export class RealTimeAnalyticsService {
  private static collection = db.collection('realtime_analytics');

  static async updateMetrics(metrics: {
    timestamp: Date;
    activeUsers: number;
    currentPageViews: number;
    topPages: Array<{ page: string; views: number }>;
    topSources: Array<{ source: string; visitors: number }>;
    alerts: Array<any>;
  }) {
    const docId = `metrics_${Date.now()}`;
    
    await this.collection.doc(docId).set({
      ...metrics,
      timestamp: Timestamp.fromDate(metrics.timestamp),
    });

    // Keep only last 24 hours of real-time data
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldDocs = await this.collection
      .where('timestamp', '<', Timestamp.fromDate(twentyFourHoursAgo))
      .get();

    const batch = db.batch();
    oldDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  static async getLatestMetrics() {
    const snapshot = await this.collection
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    };
  }
}