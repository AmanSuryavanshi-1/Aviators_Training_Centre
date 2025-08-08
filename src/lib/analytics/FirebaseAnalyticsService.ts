/**
 * Firebase Analytics Service
 * 
 * Enhanced Firebase analytics service using the new FirebaseAuthHandler.
 * Handles daily summaries, session updates, and analytics data with proper error handling.
 */

import { FirebaseAuthHandler } from './FirebaseAuthHandler';
import { errorHandler } from './ErrorHandler';
import admin from 'firebase-admin';

export interface DailySummary {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topSources: Array<{ source: string; visitors: number }>;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  events: Array<{
    type: string;
    timestamp: Date;
    data?: any;
  }>;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  page?: string;
  data?: any;
}

export class FirebaseAnalyticsService {
  private authHandler: FirebaseAuthHandler;
  private db: admin.firestore.Firestore | null = null;

  constructor(authHandler: FirebaseAuthHandler) {
    this.authHandler = authHandler;
  }

  /**
   * Initialize Firestore connection
   */
  private async initializeFirestore(): Promise<admin.firestore.Firestore> {
    if (this.db) {
      return this.db;
    }

    try {
      this.db = await this.authHandler.getFirestore();
      return this.db;
    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'initialize_firestore',
        timestamp: new Date()
      });

      throw new Error(authError.userMessage);
    }
  }

  /**
   * Fetch daily summaries with enhanced error handling
   */
  async getDailySummaries(startDate: Date, endDate: Date): Promise<DailySummary[]> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for daily summaries');
      }

      const summariesRef = db.collection('daily_summaries');
      const query = summariesRef
        .where('date', '>=', startDate.toISOString().split('T')[0])
        .where('date', '<=', endDate.toISOString().split('T')[0])
        .orderBy('date', 'desc');

      const snapshot = await query.get();
      
      const summaries: DailySummary[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        summaries.push({
          date: data.date,
          pageViews: data.pageViews || 0,
          uniqueVisitors: data.uniqueVisitors || 0,
          sessions: data.sessions || 0,
          bounceRate: data.bounceRate || 0,
          avgSessionDuration: data.avgSessionDuration || 0,
          topPages: data.topPages || [],
          topSources: data.topSources || []
        });
      });

      return summaries;

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_daily_summaries',
        timestamp: new Date()
      });

      console.error('Failed to fetch daily summaries:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Update session data with enhanced error handling
   */
  async updateSession(sessionData: SessionData): Promise<void> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for session updates');
      }

      const sessionRef = db.collection('user_sessions').doc(sessionData.sessionId);
      
      await sessionRef.set({
        ...sessionData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Session ${sessionData.sessionId} updated successfully`);

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'update_session',
        timestamp: new Date()
      });

      console.error('Failed to update session:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Track analytics event with enhanced error handling
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for event tracking');
      }

      const eventsRef = db.collection('analytics_events');
      
      await eventsRef.add({
        ...event,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Event ${event.type} tracked successfully`);

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'track_event',
        timestamp: new Date()
      });

      console.error('Failed to track event:', authError.userMessage);
      // Don't throw for event tracking failures to avoid breaking user experience
    }
  }

  /**
   * Get session data with enhanced error handling
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for session retrieval');
      }

      const sessionRef = db.collection('user_sessions').doc(sessionId);
      const doc = await sessionRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        sessionId: data.sessionId,
        userId: data.userId,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate(),
        pageViews: data.pageViews || 0,
        events: data.events || [],
        source: data.source,
        medium: data.medium,
        campaign: data.campaign
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_session',
        timestamp: new Date()
      });

      console.error('Failed to get session:', authError.userMessage);
      return null;
    }
  }

  /**
   * Get analytics events with enhanced error handling
   */
  async getEvents(
    startDate: Date, 
    endDate: Date, 
    eventType?: string
  ): Promise<AnalyticsEvent[]> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for event retrieval');
      }

      let query = db.collection('analytics_events')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .orderBy('timestamp', 'desc');

      if (eventType) {
        query = query.where('type', '==', eventType);
      }

      const snapshot = await query.limit(1000).get(); // Limit to prevent large queries
      
      const events: AnalyticsEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          type: data.type,
          timestamp: data.timestamp?.toDate() || new Date(),
          sessionId: data.sessionId,
          userId: data.userId,
          page: data.page,
          data: data.data
        });
      });

      return events;

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_events',
        timestamp: new Date()
      });

      console.error('Failed to get events:', authError.userMessage);
      return [];
    }
  }

  /**
   * Create daily summary with enhanced error handling
   */
  async createDailySummary(date: string, summary: Omit<DailySummary, 'date'>): Promise<void> {
    try {
      const db = await this.initializeFirestore();
      
      // Test permissions first
      const permissions = await this.authHandler.validatePermissions();
      if (!permissions.firestore) {
        throw new Error('Insufficient Firestore permissions for creating daily summary');
      }

      const summaryRef = db.collection('daily_summaries').doc(date);
      
      await summaryRef.set({
        date,
        ...summary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Daily summary for ${date} created successfully`);

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'create_daily_summary',
        timestamp: new Date()
      });

      console.error('Failed to create daily summary:', authError.userMessage);
      throw new Error(authError.userMessage);
    }
  }

  /**
   * Test Firebase analytics access
   */
  async testAccess(): Promise<{
    success: boolean;
    permissions: any;
    error?: string;
  }> {
    try {
      const permissions = await this.authHandler.validatePermissions();
      const db = await this.initializeFirestore();

      // Test basic operations
      const testResults = {
        readAccess: false,
        writeAccess: false,
        collections: {
          dailySummaries: false,
          userSessions: false,
          analyticsEvents: false
        }
      };

      // Test read access to each collection
      try {
        await db.collection('daily_summaries').limit(1).get();
        testResults.collections.dailySummaries = true;
        testResults.readAccess = true;
      } catch (error) {
        console.warn('Daily summaries collection access failed:', error);
      }

      try {
        await db.collection('user_sessions').limit(1).get();
        testResults.collections.userSessions = true;
        testResults.readAccess = true;
      } catch (error) {
        console.warn('User sessions collection access failed:', error);
      }

      try {
        await db.collection('analytics_events').limit(1).get();
        testResults.collections.analyticsEvents = true;
        testResults.readAccess = true;
      } catch (error) {
        console.warn('Analytics events collection access failed:', error);
      }

      // Test write access
      try {
        const testDoc = db.collection('_test_').doc('access_test');
        await testDoc.set({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          test: true
        });
        await testDoc.delete();
        testResults.writeAccess = true;
      } catch (error) {
        console.warn('Write access test failed:', error);
      }

      return {
        success: testResults.readAccess || testResults.writeAccess,
        permissions: {
          ...permissions,
          testResults
        }
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'test_access',
        timestamp: new Date()
      });

      return {
        success: false,
        permissions: {},
        error: authError.userMessage
      };
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    connected: boolean;
    permissions: any;
    lastChecked: Date;
    error?: string;
  }> {
    try {
      const authStatus = await this.authHandler.getAuthStatus();
      
      return {
        connected: authStatus.initialized && authStatus.permissions.firestore,
        permissions: authStatus.permissions,
        lastChecked: authStatus.lastChecked || new Date(),
        error: authStatus.error
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'firebase',
        operation: 'get_status',
        timestamp: new Date()
      });

      return {
        connected: false,
        permissions: {},
        lastChecked: new Date(),
        error: authError.userMessage
      };
    }
  }
}

/**
 * Create Firebase analytics service from auth handler
 */
export function createFirebaseAnalyticsService(authHandler: FirebaseAuthHandler): FirebaseAnalyticsService {
  return new FirebaseAnalyticsService(authHandler);
}

// Export singleton instance (will be created when auth handler is available)
let firebaseAnalyticsService: FirebaseAnalyticsService | null = null;

export function getFirebaseAnalyticsService(): FirebaseAnalyticsService | null {
  // This will be initialized by the AuthenticationManager
  return firebaseAnalyticsService;
}

export function setFirebaseAnalyticsService(service: FirebaseAnalyticsService): void {
  firebaseAnalyticsService = service;
}