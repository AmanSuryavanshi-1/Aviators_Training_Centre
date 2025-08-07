import { BetaAnalyticsDataClient } from '@google-analytics/data';

interface GA4Config {
  propertyId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

interface GA4Metrics {
  totalUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
}

interface GA4TrafficSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
}

interface GA4PageData {
  pagePath: string;
  pageTitle: string;
  views: number;
  users: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

interface GA4DeviceData {
  deviceCategory: string;
  users: number;
  sessions: number;
}

class GoogleAnalytics4Service {
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string;

  constructor() {
    this.propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '';
    
    if (this.isConfigured()) {
      try {
        this.client = new BetaAnalyticsDataClient({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
        });
      } catch (error) {
        console.error('Failed to initialize GA4 client:', error);
      }
    }
  }

  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_ANALYTICS_PROPERTY_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    );
  }

  async getOverviewMetrics(startDate: string, endDate: string): Promise<GA4Metrics> {
    if (!this.client || !this.propertyId) {
      throw new Error('GA4 client not configured');
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
        ],
      });

      const row = response.rows?.[0];
      if (!row?.metricValues) {
        return this.getEmptyMetrics();
      }

      return {
        totalUsers: parseInt(row.metricValues[0]?.value || '0'),
        sessions: parseInt(row.metricValues[1]?.value || '0'),
        pageviews: parseInt(row.metricValues[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues[3]?.value || '0'),
        averageSessionDuration: parseFloat(row.metricValues[4]?.value || '0'),
        conversions: parseInt(row.metricValues[5]?.value || '0'),
      };
    } catch (error) {
      console.error('Error fetching GA4 overview metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  async getTrafficSources(startDate: string, endDate: string): Promise<GA4TrafficSource[]> {
    if (!this.client || !this.propertyId) {
      throw new Error('GA4 client not configured');
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
        limit: 20,
      });

      return response.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'unknown',
        medium: row.dimensionValues?.[1]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching GA4 traffic sources:', error);
      return [];
    }
  }

  async getTopPages(startDate: string, endDate: string): Promise<GA4PageData[]> {
    if (!this.client || !this.propertyId) {
      throw new Error('GA4 client not configured');
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'averageTimeOnPage' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      });

      return response.rows?.map(row => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        pageTitle: row.dimensionValues?.[1]?.value || 'Unknown Page',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        averageTimeOnPage: parseFloat(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching GA4 top pages:', error);
      return [];
    }
  }

  async getDeviceData(startDate: string, endDate: string): Promise<GA4DeviceData[]> {
    if (!this.client || !this.propertyId) {
      throw new Error('GA4 client not configured');
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      });

      return response.rows?.map(row => ({
        deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      })) || [];
    } catch (error) {
      console.error('Error fetching GA4 device data:', error);
      return [];
    }
  }

  async getRealTimeUsers(): Promise<number> {
    if (!this.client || !this.propertyId) {
      return 0;
    }

    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        metrics: [{ name: 'activeUsers' }],
      });

      return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
    } catch (error) {
      console.error('Error fetching GA4 real-time users:', error);
      return 0;
    }
  }

  private getEmptyMetrics(): GA4Metrics {
    return {
      totalUsers: 0,
      sessions: 0,
      pageviews: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
      conversions: 0,
    };
  }

  // Helper method to format dates for GA4 API
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to get date ranges
  static getDateRange(timeframe: string): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'all':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }
}

export const ga4Service = new GoogleAnalytics4Service();
export type { GA4Metrics, GA4TrafficSource, GA4PageData, GA4DeviceData };