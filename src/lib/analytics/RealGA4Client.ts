/**
 * Real GA4 Client
 * 
 * Uses the same working approach as our diagnostic tool to fetch REAL data from GA4.
 * No mock data, no fallbacks - only real analytics data.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface RealGA4Data {
  // Basic metrics
  activeUsers: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  engagementRate: number;
  
  // Traffic sources
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  
  // Top pages
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  
  // Device breakdown
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // Browser data
  browsers: Array<{
    browser: string;
    users: number;
    percentage: number;
  }>;
  
  // Geographic data
  countries: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
  
  // User journey data
  userJourney: {
    landingPages: Array<{
      page: string;
      sessions: number;
      bounceRate: number;
    }>;
    exitPages: Array<{
      page: string;
      exits: number;
      exitRate: number;
    }>;
  };
}

export interface RealRealtimeData {
  activeUsers: number;
  currentPageViews: number;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  topSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  recentEvents: Array<{
    eventName: string;
    count: number;
    timestamp: string;
  }>;
}

export class RealGA4Client {
  private analyticsClient: BetaAnalyticsDataClient | null = null;
  private propertyId: string;

  constructor() {
    if (!process.env.GA4_SERVICE_ACCOUNT_KEY || !process.env.GA4_PROPERTY_ID) {
      throw new Error('GA4 configuration missing');
    }

    this.propertyId = process.env.GA4_PROPERTY_ID;
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const serviceAccount = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY!);
      
      this.analyticsClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        },
        projectId: serviceAccount.project_id,
      });
    } catch (error) {
      console.error('Failed to initialize GA4 client:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive historical data
   */
  async getHistoricalData(startDate: string, endDate: string): Promise<RealGA4Data> {
    if (!this.analyticsClient) {
      throw new Error('GA4 client not initialized');
    }

    try {
      // Fetch basic metrics
      const [basicResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'engagementRate' }
        ],
      });

      // Fetch traffic sources
      const [trafficResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 20
      });

      // Fetch top pages
      const [pagesResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      });

      // Fetch device types
      const [deviceResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
      });

      // Fetch browsers
      const [browserResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'browser' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10
      });

      // Fetch countries
      const [countryResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10
      });

      // Fetch landing pages
      const [landingResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      });

      // Fetch exit pages
      const [exitResponse] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'exits' }, { name: 'exitRate' }],
        orderBys: [{ metric: { metricName: 'exits' }, desc: true }],
        limit: 10
      });

      // Process basic metrics
      const basicMetrics = basicResponse.rows?.[0]?.metricValues || [];
      const activeUsers = parseInt(basicMetrics[0]?.value || '0');
      const pageviews = parseInt(basicMetrics[1]?.value || '0');
      const sessions = parseInt(basicMetrics[2]?.value || '0');
      const bounceRate = parseFloat(basicMetrics[3]?.value || '0');
      const engagementRate = parseFloat(basicMetrics[4]?.value || '0');

      // Process traffic sources
      const totalTrafficUsers = trafficResponse.rows?.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;
      
      const trafficSources = trafficResponse.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalTrafficUsers) * 100)
      })) || [];

      // Process top pages
      const topPages = pagesResponse.rows?.map(row => ({
        path: row.dimensionValues?.[0]?.value || '',
        title: row.dimensionValues?.[1]?.value || 'Untitled',
        views: parseInt(row.metricValues?.[0]?.value || '0')
      })) || [];

      // Process device types
      const deviceTypes = { desktop: 0, mobile: 0, tablet: 0 };
      deviceResponse.rows?.forEach(row => {
        const device = row.dimensionValues?.[0]?.value?.toLowerCase() || 'unknown';
        const users = parseInt(row.metricValues?.[0]?.value || '0');
        if (device in deviceTypes) {
          deviceTypes[device as keyof typeof deviceTypes] = users;
        }
      });

      // Process browsers
      const totalBrowserUsers = browserResponse.rows?.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;
      
      const browsers = browserResponse.rows?.map(row => ({
        browser: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalBrowserUsers) * 100)
      })) || [];

      // Process countries
      const totalCountryUsers = countryResponse.rows?.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;
      
      const countries = countryResponse.rows?.map(row => ({
        country: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalCountryUsers) * 100)
      })) || [];

      // Process user journey
      const landingPages = landingResponse.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[1]?.value || '0')
      })) || [];

      const exitPages = exitResponse.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value || '',
        exits: parseInt(row.metricValues?.[0]?.value || '0'),
        exitRate: parseFloat(row.metricValues?.[1]?.value || '0')
      })) || [];

      return {
        activeUsers,
        pageviews,
        sessions,
        bounceRate,
        engagementRate,
        trafficSources,
        topPages,
        deviceTypes,
        browsers,
        countries,
        userJourney: {
          landingPages,
          exitPages
        }
      };

    } catch (error) {
      console.error('Failed to fetch real GA4 data:', error);
      throw error;
    }
  }

  /**
   * Get real-time data
   */
  async getRealtimeData(): Promise<RealRealtimeData> {
    if (!this.analyticsClient) {
      throw new Error('GA4 client not initialized');
    }

    try {
      // Fetch realtime active users
      const [realtimeResponse] = await this.analyticsClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ],
      });

      // Fetch realtime top pages
      const [realtimePagesResponse] = await this.analyticsClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5
      });

      // Fetch realtime traffic sources
      const [realtimeSourcesResponse] = await this.analyticsClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'source' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 5
      });

      // Process realtime metrics
      const realtimeMetrics = realtimeResponse.rows?.[0]?.metricValues || [];
      const activeUsers = parseInt(realtimeMetrics[0]?.value || '0');
      const currentPageViews = parseInt(realtimeMetrics[1]?.value || '0');

      // Process realtime top pages
      const topPages = realtimePagesResponse.rows?.map(row => ({
        path: row.dimensionValues?.[0]?.value || '',
        title: row.dimensionValues?.[1]?.value || 'Untitled',
        views: parseInt(row.metricValues?.[0]?.value || '0')
      })) || [];

      // Process realtime traffic sources
      const totalRealtimeUsers = realtimeSourcesResponse.rows?.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;
      
      const topSources = realtimeSourcesResponse.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'unknown',
        visitors: parseInt(row.metricValues?.[0]?.value || '0'),
        percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalRealtimeUsers) * 100)
      })) || [];

      return {
        activeUsers,
        currentPageViews,
        topPages,
        topSources,
        recentEvents: [] // GA4 doesn't provide recent events in realtime API
      };

    } catch (error) {
      console.error('Failed to fetch real GA4 realtime data:', error);
      throw error;
    }
  }
}

// Export factory function instead of singleton to avoid initialization issues
export function createRealGA4Client(): RealGA4Client {
  return new RealGA4Client();
}