import { firestore } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ga4Service } from './googleAnalytics4';
import { searchConsoleService } from './googleSearchConsole';

interface DailySummary {
  date: string;
  timestamp: Timestamp;
  
  // GA4 Metrics
  totalUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
  realTimeUsers: number;
  
  // Traffic Sources
  trafficSources: {
    direct: number;
    google: number;
    chatgpt: number;
    claude: number;
    instagram: number;
    facebook: number;
    linkedin: number;
    twitter: number;
    meta_ads: number;
    other: number;
  };
  
  // Device Breakdown
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // Search Console Data
  searchConsole: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  } | null;
  
  // AI Referrals
  aiReferrals: {
    chatgpt: number;
    claude: number;
    other_ai: number;
  };
  
  // Top Pages (limited to top 5 for storage efficiency)
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: string;
  }>;
  
  // Conversion Funnel
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
}

class DailyAggregationService {
  private readonly COLLECTION_NAME = 'analytics_daily_summaries';
  private readonly RAW_EVENTS_COLLECTION = 'analytics_events';
  private readonly RAW_DATA_RETENTION_DAYS = 30;

  async aggregateYesterdayData(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = this.formatDate(yesterday);

    console.log(`Starting daily aggregation for ${dateString}`);

    try {
      // Check if aggregation already exists
      const existingDoc = await getDoc(doc(firestore, this.COLLECTION_NAME, dateString));
      if (existingDoc.exists()) {
        console.log(`Aggregation for ${dateString} already exists, skipping`);
        return;
      }

      // Get GA4 data for yesterday
      const ga4DateRange = {
        startDate: dateString,
        endDate: dateString
      };

      let ga4Data = null;
      let ga4TrafficSources = [];
      let ga4TopPages = [];
      let ga4DeviceData = [];
      let searchConsoleData = null;

      if (ga4Service.isConfigured()) {
        try {
          [ga4Data, ga4TrafficSources, ga4TopPages, ga4DeviceData] = await Promise.all([
            ga4Service.getOverviewMetrics(ga4DateRange.startDate, ga4DateRange.endDate),
            ga4Service.getTrafficSources(ga4DateRange.startDate, ga4DateRange.endDate),
            ga4Service.getTopPages(ga4DateRange.startDate, ga4DateRange.endDate),
            ga4Service.getDeviceData(ga4DateRange.startDate, ga4DateRange.endDate)
          ]);
        } catch (error) {
          console.error('Error fetching GA4 data for aggregation:', error);
        }
      }

      if (searchConsoleService.isConfigured()) {
        try {
          // Search Console has 3-day delay, so get data from 4 days ago
          const scDate = new Date(yesterday);
          scDate.setDate(scDate.getDate() - 3);
          const scDateString = this.formatDate(scDate);
          
          searchConsoleData = await searchConsoleService.getOverviewData(scDateString, scDateString);
        } catch (error) {
          console.error('Error fetching Search Console data for aggregation:', error);
        }
      }

      // Create daily summary
      const dailySummary: DailySummary = {
        date: dateString,
        timestamp: Timestamp.fromDate(yesterday),
        
        // GA4 Metrics
        totalUsers: ga4Data?.totalUsers || 0,
        sessions: ga4Data?.sessions || 0,
        pageviews: ga4Data?.pageviews || 0,
        bounceRate: ga4Data?.bounceRate || 0,
        averageSessionDuration: ga4Data?.averageSessionDuration || 0,
        conversions: ga4Data?.conversions || 0,
        realTimeUsers: 0, // Not applicable for historical data
        
        // Traffic Sources
        trafficSources: this.aggregateTrafficSources(ga4TrafficSources),
        
        // Device Breakdown
        deviceTypes: this.aggregateDeviceTypes(ga4DeviceData),
        
        // Search Console Data
        searchConsole: searchConsoleData ? {
          clicks: searchConsoleData.clicks,
          impressions: searchConsoleData.impressions,
          ctr: searchConsoleData.ctr,
          position: searchConsoleData.position
        } : null,
        
        // AI Referrals
        aiReferrals: this.aggregateAIReferrals(ga4TrafficSources),
        
        // Top Pages (limit to top 5)
        topPages: ga4TopPages.slice(0, 5).map(page => ({
          path: page.pagePath,
          title: page.pageTitle,
          views: page.views,
          avgTime: `${Math.floor(page.averageTimeOnPage / 60)}:${String(Math.floor(page.averageTimeOnPage % 60)).padStart(2, '0')}`
        })),
        
        // Conversion Funnel
        conversionFunnel: {
          visitors: ga4Data?.totalUsers || 0,
          blogReaders: Math.floor((ga4Data?.pageviews || 0) * 0.7),
          contactViews: Math.floor((ga4Data?.conversions || 0) * 1.5),
          formSubmissions: ga4Data?.conversions || 0,
          conversionRate: ga4Data?.totalUsers ? ((ga4Data.conversions / ga4Data.totalUsers) * 100) : 0
        }
      };

      // Save daily summary
      await setDoc(doc(firestore, this.COLLECTION_NAME, dateString), dailySummary);
      console.log(`Daily aggregation completed for ${dateString}`);

      // Clean up old raw events
      await this.cleanupOldRawEvents();

    } catch (error) {
      console.error(`Error during daily aggregation for ${dateString}:`, error);
      throw error;
    }
  }

  async getDailySummaries(startDate: string, endDate: string): Promise<DailySummary[]> {
    try {
      const summariesRef = collection(firestore, this.COLLECTION_NAME);
      const q = query(
        summariesRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc'),
        limit(365) // Max 1 year of data
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as DailySummary);
    } catch (error) {
      console.error('Error fetching daily summaries:', error);
      return [];
    }
  }

  async getLatestSummary(): Promise<DailySummary | null> {
    try {
      const summariesRef = collection(firestore, this.COLLECTION_NAME);
      const q = query(summariesRef, orderBy('date', 'desc'), limit(1));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      return querySnapshot.docs[0].data() as DailySummary;
    } catch (error) {
      console.error('Error fetching latest summary:', error);
      return null;
    }
  }

  private aggregateTrafficSources(ga4TrafficSources: any[]): DailySummary['trafficSources'] {
    return ga4TrafficSources.reduce((acc, source) => {
      const sourceName = source.source.toLowerCase();
      if (sourceName.includes('direct')) acc.direct += source.users;
      else if (sourceName.includes('google')) acc.google += source.users;
      else if (sourceName.includes('chatgpt') || sourceName.includes('openai')) acc.chatgpt += source.users;
      else if (sourceName.includes('claude') || sourceName.includes('anthropic')) acc.claude += source.users;
      else if (sourceName.includes('instagram')) acc.instagram += source.users;
      else if (sourceName.includes('facebook')) acc.facebook += source.users;
      else if (sourceName.includes('linkedin')) acc.linkedin += source.users;
      else if (sourceName.includes('twitter') || sourceName.includes('x.com')) acc.twitter += source.users;
      else if (source.medium === 'cpc' && sourceName.includes('meta')) acc.meta_ads += source.users;
      else acc.other += source.users;
      return acc;
    }, {
      direct: 0,
      google: 0,
      chatgpt: 0,
      claude: 0,
      instagram: 0,
      facebook: 0,
      linkedin: 0,
      twitter: 0,
      meta_ads: 0,
      other: 0
    });
  }

  private aggregateDeviceTypes(ga4DeviceData: any[]): DailySummary['deviceTypes'] {
    return ga4DeviceData.reduce((acc, device) => {
      const deviceType = device.deviceCategory.toLowerCase();
      if (deviceType === 'desktop') acc.desktop = device.users;
      else if (deviceType === 'mobile') acc.mobile = device.users;
      else if (deviceType === 'tablet') acc.tablet = device.users;
      return acc;
    }, {
      desktop: 0,
      mobile: 0,
      tablet: 0
    });
  }

  private aggregateAIReferrals(ga4TrafficSources: any[]): DailySummary['aiReferrals'] {
    return {
      chatgpt: ga4TrafficSources.filter(s => s.source.toLowerCase().includes('chatgpt') || s.source.toLowerCase().includes('openai')).reduce((sum, s) => sum + s.users, 0),
      claude: ga4TrafficSources.filter(s => s.source.toLowerCase().includes('claude') || s.source.toLowerCase().includes('anthropic')).reduce((sum, s) => sum + s.users, 0),
      other_ai: ga4TrafficSources.filter(s => {
        const source = s.source.toLowerCase();
        return (source.includes('ai') || source.includes('bot') || source.includes('gpt')) && 
               !source.includes('chatgpt') && !source.includes('claude');
      }).reduce((sum, s) => sum + s.users, 0)
    };
  }

  private async cleanupOldRawEvents(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.RAW_DATA_RETENTION_DAYS);
      
      const eventsRef = collection(firestore, this.RAW_EVENTS_COLLECTION);
      const oldEventsQuery = query(
        eventsRef,
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        limit(100) // Delete in batches to avoid timeout
      );

      const querySnapshot = await getDocs(oldEventsQuery);
      
      if (!querySnapshot.empty) {
        const batch = firestore.batch ? firestore.batch() : null;
        if (batch) {
          querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`Cleaned up ${querySnapshot.docs.length} old raw events`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old raw events:', error);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Method to manually trigger aggregation (for testing)
  async triggerManualAggregation(date?: Date): Promise<void> {
    const targetDate = date || new Date();
    targetDate.setDate(targetDate.getDate() - 1); // Default to yesterday
    
    const dateString = this.formatDate(targetDate);
    console.log(`Manual aggregation triggered for ${dateString}`);
    
    await this.aggregateYesterdayData();
  }
}

export const dailyAggregationService = new DailyAggregationService();
export type { DailySummary };