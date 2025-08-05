import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';
import { queryOptimizer } from './queryOptimizer';

interface AggregationPeriod {
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  start: Date;
  end: Date;
  key: string;
}

interface AggregatedMetrics {
  timeRange: string;
  period: string;
  totalEvents: number;
  uniqueUsers: number;
  pageViews: number;
  conversions: number;
  bounces: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number; conversions: number }>;
  topPages: Array<{ page: string; views: number; conversions: number }>;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  sourceCategories: Record<string, number>;
  botTrafficPercentage: number;
  aiAssistantTraffic: number;
  lastUpdated: Timestamp;
  dataQuality: {
    validEvents: number;
    invalidEvents: number;
    botEvents: number;
    qualityScore: number;
  };
}

export class AggregationService {
  private static instance: AggregationService;

  static getInstance(): AggregationService {
    if (!AggregationService.instance) {
      AggregationService.instance = new AggregationService();
    }
    return AggregationService.instance;
  }

  /**
   * Generate aggregations for a specific time period
   */
  async generateAggregation(period: AggregationPeriod): Promise<AggregatedMetrics> {
    try {
      console.log(`Generating aggregation for ${period.type}: ${period.key}`);

      // Fetch raw data for the period
      const events = await queryOptimizer.getAnalyticsEvents({
        startDate: period.start,
        endDate: period.end,
        limit: 50000 // Large limit for aggregation
      });

      const sources = await queryOptimizer.getTrafficSourceMetrics({
        startDate: period.start,
        endDate: period.end
      });

      const journeys = await queryOptimizer.getUserJourneyMetrics({
        startDate: period.start,
        endDate: period.end
      });

      // Compute aggregated metrics
      const aggregation = this.computeAggregation(events, sources, journeys, period);

      // Store the aggregation
      await setDoc(
        doc(db, 'analytics_aggregations', period.key),
        aggregation
      );

      console.log(`Aggregation completed for ${period.key}`);
      return aggregation;
    } catch (error) {
      console.error(`Error generating aggregation for ${period.key}:`, error);
      throw error;
    }
  }

  /**
   * Get or generate aggregation for a time period
   */
  async getAggregation(period: AggregationPeriod): Promise<AggregatedMetrics | null> {
    try {
      // Try to get existing aggregation
      const aggregationDoc = await getDoc(
        doc(db, 'analytics_aggregations', period.key)
      );

      if (aggregationDoc.exists()) {
        const data = aggregationDoc.data() as AggregatedMetrics;
        
        // Check if aggregation is recent enough (within last hour for daily, last day for weekly, etc.)
        const maxAge = this.getMaxAggregationAge(period.type);
        const age = Date.now() - data.lastUpdated.toMillis();
        
        if (age < maxAge) {
          return data;
        }
      }

      // Generate new aggregation if not found or too old
      return await this.generateAggregation(period);
    } catch (error) {
      console.error(`Error getting aggregation for ${period.key}:`, error);
      return null;
    }
  }

  /**
   * Batch generate aggregations for multiple periods
   */
  async batchGenerateAggregations(periods: AggregationPeriod[]): Promise<void> {
    const batch = writeBatch(db);
    const batchSize = 10; // Firestore batch limit is 500, but we'll use smaller batches

    for (let i = 0; i < periods.length; i += batchSize) {
      const batchPeriods = periods.slice(i, i + batchSize);
      
      await Promise.all(
        batchPeriods.map(async (period) => {
          try {
            const aggregation = await this.generateAggregation(period);
            console.log(`Batch aggregation completed for ${period.key}`);
          } catch (error) {
            console.error(`Batch aggregation failed for ${period.key}:`, error);
          }
        })
      );
    }
  }

  /**
   * Generate daily aggregations for the last 30 days
   */
  async generateDailyAggregations(): Promise<void> {
    const periods: AggregationPeriod[] = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      periods.push({
        type: 'daily',
        start,
        end,
        key: `daily_${date.toISOString().split('T')[0]}`
      });
    }

    await this.batchGenerateAggregations(periods);
  }

  /**
   * Generate hourly aggregations for the last 24 hours
   */
  async generateHourlyAggregations(): Promise<void> {
    const periods: AggregationPeriod[] = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const date = new Date(now);
      date.setHours(date.getHours() - i, 0, 0, 0);
      
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(end.getHours() + 1, 0, 0, -1);

      periods.push({
        type: 'hourly',
        start,
        end,
        key: `hourly_${date.toISOString().slice(0, 13)}`
      });
    }

    await this.batchGenerateAggregations(periods);
  }

  /**
   * Compute aggregation from raw data
   */
  private computeAggregation(
    events: any[], 
    sources: any[], 
    journeys: any[], 
    period: AggregationPeriod
  ): AggregatedMetrics {
    // Basic metrics
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const pageViews = events.filter(e => e.event?.type === 'page_view').length;
    const conversions = events.filter(e => e.event?.type === 'conversion').length;
    const bounces = events.filter(e => e.event?.type === 'bounce').length;
    const sessions = new Set(events.map(e => e.sessionId)).size;

    // Data quality metrics
    const validEvents = events.filter(e => e.validation?.isValid).length;
    const invalidEvents = totalEvents - validEvents;
    const botEvents = events.filter(e => e.validation?.isBot).length;
    const qualityScore = totalEvents > 0 ? (validEvents / totalEvents) * 100 : 100;

    // Session duration calculation
    const sessionDurations = this.calculateSessionDurations(events);
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    // Rates
    const bounceRate = sessions > 0 ? (bounces / sessions) * 100 : 0;
    const conversionRate = uniqueUsers > 0 ? (conversions / uniqueUsers) * 100 : 0;

    // Top sources with conversion data
    const topSources = this.calculateTopSources(events);
    
    // Top pages with conversion data
    const topPages = this.calculateTopPages(events);

    // Device breakdown
    const deviceBreakdown = this.calculateDeviceBreakdown(events);

    // Source categories
    const sourceCategories = this.calculateSourceCategories(events);

    // Bot and AI assistant traffic
    const botTrafficPercentage = totalEvents > 0 ? (botEvents / totalEvents) * 100 : 0;
    const aiAssistantTraffic = events.filter(e => 
      e.source?.category === 'ai_assistant'
    ).length;

    return {
      timeRange: period.key,
      period: period.type,
      totalEvents,
      uniqueUsers,
      pageViews,
      conversions,
      bounces,
      sessions,
      avgSessionDuration,
      bounceRate,
      conversionRate,
      topSources,
      topPages,
      deviceBreakdown,
      sourceCategories,
      botTrafficPercentage,
      aiAssistantTraffic,
      lastUpdated: Timestamp.now(),
      dataQuality: {
        validEvents,
        invalidEvents,
        botEvents,
        qualityScore
      }
    };
  }

  private calculateSessionDurations(events: any[]): number[] {
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

    return Array.from(sessions.values())
      .map(s => (s.end - s.start) / 1000)
      .filter(duration => duration > 0);
  }

  private calculateTopSources(events: any[]): Array<{ source: string; count: number; conversions: number }> {
    const sources = new Map<string, { count: number; conversions: number }>();
    
    events.forEach(event => {
      const source = event.source?.source || 'unknown';
      const isConversion = event.event?.type === 'conversion';
      
      if (!sources.has(source)) {
        sources.set(source, { count: 0, conversions: 0 });
      }
      
      const sourceData = sources.get(source)!;
      sourceData.count++;
      if (isConversion) {
        sourceData.conversions++;
      }
    });

    return Array.from(sources.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateTopPages(events: any[]): Array<{ page: string; views: number; conversions: number }> {
    const pages = new Map<string, { views: number; conversions: number }>();
    
    events.forEach(event => {
      if (event.event?.type === 'page_view') {
        const page = event.event?.page || 'unknown';
        
        if (!pages.has(page)) {
          pages.set(page, { views: 0, conversions: 0 });
        }
        
        pages.get(page)!.views++;
      }
      
      if (event.event?.type === 'conversion') {
        const page = event.event?.page || event.page?.path || 'unknown';
        
        if (!pages.has(page)) {
          pages.set(page, { views: 0, conversions: 0 });
        }
        
        pages.get(page)!.conversions++;
      }
    });

    return Array.from(pages.entries())
      .map(([page, data]) => ({ page, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private calculateDeviceBreakdown(events: any[]): { desktop: number; mobile: number; tablet: number } {
    const breakdown = { desktop: 0, mobile: 0, tablet: 0 };
    
    events.forEach(event => {
      const device = event.device?.type || 'desktop';
      if (device in breakdown) {
        breakdown[device as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  }

  private calculateSourceCategories(events: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    events.forEach(event => {
      const category = event.source?.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });

    return categories;
  }

  private getMaxAggregationAge(periodType: string): number {
    switch (periodType) {
      case 'hourly': return 15 * 60 * 1000; // 15 minutes
      case 'daily': return 60 * 60 * 1000; // 1 hour
      case 'weekly': return 6 * 60 * 60 * 1000; // 6 hours
      case 'monthly': return 24 * 60 * 60 * 1000; // 24 hours
      default: return 60 * 60 * 1000; // 1 hour
    }
  }

  /**
   * Clean up old aggregations
   */
  async cleanupOldAggregations(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      const q = query(
        collection(db, 'analytics_aggregations'),
        where('lastUpdated', '<', Timestamp.fromDate(cutoffDate))
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Cleaned up ${snapshot.docs.length} old aggregations`);
      }
    } catch (error) {
      console.error('Error cleaning up old aggregations:', error);
    }
  }
}

export const aggregationService = AggregationService.getInstance();