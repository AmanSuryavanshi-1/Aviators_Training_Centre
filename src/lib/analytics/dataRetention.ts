// Analytics Data Retention System
// Ensures all analytics data is stored permanently for historical analysis

import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = getAdminFirestore();

export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD format
  metrics: {
    totalVisitors: number;
    totalPageViews: number;
    totalConversions: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    botTrafficPercentage: number;
    aiAssistantTraffic: number;
  };
  topSources: Array<{ source: string; visitors: number; percentage: number }>;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  hourlyDistribution: Record<string, number>; // 0-23 hours
  createdAt: Date;
  updatedAt: Date;
}

export class DataRetentionService {
  private readonly collectionName = 'analytics_historical';

  /**
   * Store daily analytics snapshot for permanent retention
   */
  async storeDailySnapshot(date: string, data: Omit<HistoricalDataPoint, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const docRef = db.collection(this.collectionName).doc(date);
      
      await docRef.set({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ Daily snapshot stored for ${date}`);
    } catch (error) {
      console.error(`❌ Failed to store daily snapshot for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve historical data for a date range
   */
  async getHistoricalData(startDate: string, endDate: string): Promise<HistoricalDataPoint[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('__name__', '>=', startDate)
        .where('__name__', '<=', endDate)
        .orderBy('__name__', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        date: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HistoricalDataPoint[];
    } catch (error) {
      console.error(`❌ Failed to retrieve historical data:`, error);
      throw error;
    }
  }

  /**
   * Get analytics summary for a specific period
   */
  async getPeriodSummary(startDate: string, endDate: string): Promise<{
    totalVisitors: number;
    totalPageViews: number;
    totalConversions: number;
    averageConversionRate: number;
    topSources: Array<{ source: string; visitors: number }>;
    topPages: Array<{ page: string; views: number }>;
  }> {
    const historicalData = await this.getHistoricalData(startDate, endDate);
    
    if (historicalData.length === 0) {
      return {
        totalVisitors: 0,
        totalPageViews: 0,
        totalConversions: 0,
        averageConversionRate: 0,
        topSources: [],
        topPages: []
      };
    }

    // Aggregate data across the period
    const summary = historicalData.reduce((acc, day) => {
      acc.totalVisitors += day.metrics.totalVisitors;
      acc.totalPageViews += day.metrics.totalPageViews;
      acc.totalConversions += day.metrics.totalConversions;
      
      // Aggregate sources
      day.topSources.forEach(source => {
        const existing = acc.sources.find(s => s.source === source.source);
        if (existing) {
          existing.visitors += source.visitors;
        } else {
          acc.sources.push({ source: source.source, visitors: source.visitors });
        }
      });
      
      // Aggregate pages
      day.topPages.forEach(page => {
        const existing = acc.pages.find(p => p.page === page.page);
        if (existing) {
          existing.views += page.views;
        } else {
          acc.pages.push({ page: page.page, views: page.views });
        }
      });
      
      return acc;
    }, {
      totalVisitors: 0,
      totalPageViews: 0,
      totalConversions: 0,
      sources: [] as Array<{ source: string; visitors: number }>,
      pages: [] as Array<{ page: string; views: number }>
    });

    return {
      totalVisitors: summary.totalVisitors,
      totalPageViews: summary.totalPageViews,
      totalConversions: summary.totalConversions,
      averageConversionRate: summary.totalVisitors > 0 ? (summary.totalConversions / summary.totalVisitors) * 100 : 0,
      topSources: summary.sources.sort((a, b) => b.visitors - a.visitors).slice(0, 10),
      topPages: summary.pages.sort((a, b) => b.views - a.views).slice(0, 10)
    };
  }
}