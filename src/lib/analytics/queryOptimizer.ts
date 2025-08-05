import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  endBefore,
  getDocs, 
  getDoc,
  doc,
  QueryConstraint,
  DocumentSnapshot,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';

interface QueryOptions {
  startDate?: Date;
  endDate?: Date;
  source?: string;
  eventType?: string;
  validOnly?: boolean;
  limit?: number;
  offset?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
  direction?: 'next' | 'prev';
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * Optimized query for analytics events with proper indexing
   */
  async getAnalyticsEvents(options: QueryOptions = {}): Promise<any[]> {
    const cacheKey = this.generateCacheKey('analytics_events', options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const constraints: QueryConstraint[] = [];
      
      // Add time range constraints (uses composite index)
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(options.endDate)));
      }

      // Add validation filter (uses composite index)
      if (options.validOnly) {
        constraints.push(where('validation.isValid', '==', true));
        constraints.push(where('validation.isBot', '==', false));
      }

      // Add source filter (uses composite index)
      if (options.source) {
        constraints.push(where('source.source', '==', options.source));
      }

      // Add event type filter (uses composite index)
      if (options.eventType) {
        constraints.push(where('event.type', '==', options.eventType));
      }

      // Add ordering (must be last constraint for composite index)
      const orderField = options.orderByField || 'timestamp';
      const orderDir = options.orderDirection || 'desc';
      constraints.push(orderBy(orderField, orderDir));

      // Add limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, 'analytics_events'), ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in optimized analytics query:', error);
      throw error;
    }
  }

  /**
   * Paginated query for large datasets
   */
  async getPaginatedAnalyticsEvents(
    options: QueryOptions = {},
    pagination: PaginationOptions
  ): Promise<{ data: any[]; hasMore: boolean; lastDoc?: DocumentSnapshot }> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Build base constraints
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(options.endDate)));
      }
      if (options.validOnly) {
        constraints.push(where('validation.isValid', '==', true));
      }
      if (options.source) {
        constraints.push(where('source.source', '==', options.source));
      }

      // Add ordering
      constraints.push(orderBy('timestamp', 'desc'));

      // Add pagination
      if (pagination.lastDoc) {
        if (pagination.direction === 'prev') {
          constraints.push(endBefore(pagination.lastDoc));
        } else {
          constraints.push(startAfter(pagination.lastDoc));
        }
      }

      // Add limit (fetch one extra to check if there are more)
      constraints.push(limit(pagination.pageSize + 1));

      const q = query(collection(db, 'analytics_events'), ...constraints);
      const snapshot = await getDocs(q);
      
      const docs = snapshot.docs;
      const hasMore = docs.length > pagination.pageSize;
      
      // Remove the extra document if it exists
      if (hasMore) {
        docs.pop();
      }

      const data = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        data,
        hasMore,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined
      };
    } catch (error) {
      console.error('Error in paginated query:', error);
      throw error;
    }
  }

  /**
   * Optimized aggregation queries using pre-computed data
   */
  async getAggregatedMetrics(options: QueryOptions = {}): Promise<any> {
    const cacheKey = this.generateCacheKey('aggregated_metrics', options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use pre-aggregated data when possible
      const timeRange = this.getTimeRangeKey(options.startDate, options.endDate);
      const aggregationDoc = await getDoc(
        doc(db, 'analytics_aggregations', timeRange)
      );

      if (aggregationDoc.exists()) {
        const data = aggregationDoc.data();
        this.setCache(cacheKey, data);
        return data;
      }

      // Fallback to real-time aggregation for custom queries
      return await this.computeRealTimeAggregation(options);
    } catch (error) {
      console.error('Error in aggregated metrics query:', error);
      throw error;
    }
  }

  /**
   * Optimized traffic source analysis
   */
  async getTrafficSourceMetrics(options: QueryOptions = {}): Promise<any[]> {
    const cacheKey = this.generateCacheKey('traffic_sources', options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const constraints: QueryConstraint[] = [];
      
      if (options.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(options.endDate)));
      }
      if (options.validOnly) {
        constraints.push(where('validation.isValid', '==', true));
      }

      // Order by timestamp for efficient scanning
      constraints.push(orderBy('timestamp', 'desc'));
      
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, 'traffic_sources'), ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in traffic source query:', error);
      throw error;
    }
  }

  /**
   * Optimized user journey queries
   */
  async getUserJourneyMetrics(options: QueryOptions = {}): Promise<any[]> {
    const cacheKey = this.generateCacheKey('user_journeys', options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const constraints: QueryConstraint[] = [];
      
      if (options.startDate) {
        constraints.push(where('startTime', '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        constraints.push(where('startTime', '<=', Timestamp.fromDate(options.endDate)));
      }
      if (options.validOnly) {
        constraints.push(where('validation.isValid', '==', true));
      }

      // Order by start time
      constraints.push(orderBy('startTime', 'desc'));
      
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, 'user_journeys'), ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error in user journey query:', error);
      throw error;
    }
  }

  /**
   * Get document count efficiently
   */
  async getDocumentCount(collectionName: string, options: QueryOptions = {}): Promise<number> {
    const cacheKey = this.generateCacheKey(`${collectionName}_count`, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const constraints: QueryConstraint[] = [];
      
      if (options.startDate) {
        const timestampField = collectionName === 'user_journeys' ? 'startTime' : 'timestamp';
        constraints.push(where(timestampField, '>=', Timestamp.fromDate(options.startDate)));
      }
      if (options.endDate) {
        const timestampField = collectionName === 'user_journeys' ? 'startTime' : 'timestamp';
        constraints.push(where(timestampField, '<=', Timestamp.fromDate(options.endDate)));
      }
      if (options.validOnly) {
        constraints.push(where('validation.isValid', '==', true));
      }

      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      this.setCache(cacheKey, count, 10 * 60 * 1000); // Cache for 10 minutes
      return count;
    } catch (error) {
      console.error('Error getting document count:', error);
      return 0;
    }
  }

  /**
   * Batch query optimization for multiple collections
   */
  async getBatchAnalyticsData(options: QueryOptions = {}): Promise<{
    events: any[];
    sources: any[];
    journeys: any[];
    counts: { events: number; sources: number; journeys: number };
  }> {
    try {
      // Execute queries in parallel for better performance
      const [events, sources, journeys, eventCount, sourceCount, journeyCount] = await Promise.all([
        this.getAnalyticsEvents({ ...options, limit: 1000 }),
        this.getTrafficSourceMetrics({ ...options, limit: 500 }),
        this.getUserJourneyMetrics({ ...options, limit: 500 }),
        this.getDocumentCount('analytics_events', options),
        this.getDocumentCount('traffic_sources', options),
        this.getDocumentCount('user_journeys', options)
      ]);

      return {
        events,
        sources,
        journeys,
        counts: {
          events: eventCount,
          sources: sourceCount,
          journeys: journeyCount
        }
      };
    } catch (error) {
      console.error('Error in batch analytics query:', error);
      throw error;
    }
  }

  /**
   * Real-time aggregation fallback
   */
  private async computeRealTimeAggregation(options: QueryOptions): Promise<any> {
    const events = await this.getAnalyticsEvents(options);
    
    // Compute aggregations in memory
    const aggregation = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      pageViews: events.filter(e => e.event?.type === 'page_view').length,
      conversions: events.filter(e => e.event?.type === 'conversion').length,
      bounces: events.filter(e => e.event?.type === 'bounce').length,
      avgSessionDuration: this.calculateAverageSessionDuration(events),
      topSources: this.getTopSources(events),
      topPages: this.getTopPages(events),
      deviceBreakdown: this.getDeviceBreakdown(events),
      timestamp: Date.now()
    };

    return aggregation;
  }

  private calculateAverageSessionDuration(events: any[]): number {
    const sessions = new Map<string, { start: number; end: number }>();
    
    events.forEach(event => {
      const sessionId = event.sessionId;
      const timestamp = event.timestamp?.toMillis() || 0;
      
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { start: timestamp, end: timestamp });
      } else {
        const session = sessions.get(sessionId)!;
        session.start = Math.min(session.start, timestamp);
        session.end = Math.max(session.end, timestamp);
      }
    });

    const durations = Array.from(sessions.values()).map(s => s.end - s.start);
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 : 0;
  }

  private getTopSources(events: any[]): Array<{ source: string; count: number }> {
    const sources = new Map<string, number>();
    
    events.forEach(event => {
      const source = event.source?.source || 'unknown';
      sources.set(source, (sources.get(source) || 0) + 1);
    });

    return Array.from(sources.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopPages(events: any[]): Array<{ page: string; count: number }> {
    const pages = new Map<string, number>();
    
    events
      .filter(event => event.event?.type === 'page_view')
      .forEach(event => {
        const page = event.event?.page || 'unknown';
        pages.set(page, (pages.get(page) || 0) + 1);
      });

    return Array.from(pages.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getDeviceBreakdown(events: any[]): { desktop: number; mobile: number; tablet: number } {
    const breakdown = { desktop: 0, mobile: 0, tablet: 0 };
    
    events.forEach(event => {
      const device = event.device?.type || 'desktop';
      if (device in breakdown) {
        breakdown[device as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  }

  /**
   * Cache management
   */
  private generateCacheKey(prefix: string, options: any): string {
    return `${prefix}_${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    // Implement LRU cache eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getTimeRangeKey(startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all';
    const end = endDate ? endDate.toISOString().split('T')[0] : 'all';
    return `${start}_${end}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for accurate calculation
    };
  }
}

export const queryOptimizer = QueryOptimizer.getInstance();