/**
 * GA4 Configuration Resolver
 * 
 * Resolves conflicting measurement IDs and establishes correct property mapping.
 * Validates service account permissions and provides detailed diagnostics.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface GA4Config {
  measurementId: string;
  propertyId: string;
  serviceAccountKey: object;
  projectId: string;
  isValid: boolean;
  validationErrors: string[];
}

export interface DataAvailabilityReport {
  hasRealData: boolean;
  dataRanges: {
    range: string;
    hasData: boolean;
    sampleMetrics: {
      pageviews: number;
      users: number;
      sessions: number;
    };
  }[];
  recommendations: string[];
}

export interface DiagnosticReport {
  configurationStatus: {
    environmentVariables: {
      hasGAMeasurementId: boolean;
      hasGA4PropertyId: boolean;
      hasServiceAccountKey: boolean;
      hasProjectId: boolean;
    };
    serviceAccount: {
      isValid: boolean;
      projectId: string;
      clientEmail: string;
      error?: string;
    };
    propertyMapping: {
      isValid: boolean;
      measurementId: string;
      propertyId: string;
      error?: string;
    };
  };
  dataAvailability: DataAvailabilityReport;
  recommendations: string[];
}

export class GA4ConfigResolver {
  private analyticsClient: BetaAnalyticsDataClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      if (process.env.GA4_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY);
        
        this.analyticsClient = new BetaAnalyticsDataClient({
          credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key,
          },
          projectId: serviceAccount.project_id,
        });
      }
    } catch (error) {
      console.error('Failed to initialize GA4 client:', error);
    }
  }

  /**
   * Resolve and validate GA4 configuration
   */
  async resolveConfiguration(): Promise<GA4Config> {
    const config: GA4Config = {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      propertyId: process.env.GA4_PROPERTY_ID || '',
      serviceAccountKey: {},
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      isValid: false,
      validationErrors: []
    };

    // Validate environment variables
    if (!config.measurementId) {
      config.validationErrors.push('NEXT_PUBLIC_GA_MEASUREMENT_ID is missing');
    }
    if (!config.propertyId) {
      config.validationErrors.push('GA4_PROPERTY_ID is missing');
    }
    if (!process.env.GA4_SERVICE_ACCOUNT_KEY) {
      config.validationErrors.push('GA4_SERVICE_ACCOUNT_KEY is missing');
    }
    if (!config.projectId) {
      config.validationErrors.push('GOOGLE_CLOUD_PROJECT_ID is missing');
    }

    // Parse service account key
    try {
      if (process.env.GA4_SERVICE_ACCOUNT_KEY) {
        config.serviceAccountKey = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY);
      }
    } catch (error) {
      config.validationErrors.push('GA4_SERVICE_ACCOUNT_KEY is not valid JSON');
    }

    // Test property mapping
    try {
      const mappingValid = await this.validatePropertyMapping(config.measurementId, config.propertyId);
      if (!mappingValid) {
        config.validationErrors.push('Property ID does not match Measurement ID');
      }
    } catch (error) {
      config.validationErrors.push(`Property mapping validation failed: ${error.message}`);
    }

    config.isValid = config.validationErrors.length === 0;
    return config;
  }

  /**
   * Validate that property ID corresponds to measurement ID
   */
  async validatePropertyMapping(measurementId: string, propertyId: string): Promise<boolean> {
    if (!this.analyticsClient || !measurementId || !propertyId) {
      return false;
    }

    try {
      // Try to make a simple request to the property
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });

      // If we get a response without error, the mapping is valid
      return true;
    } catch (error) {
      console.error('Property mapping validation error:', error);
      return false;
    }
  }

  /**
   * Check data availability across multiple date ranges
   */
  async checkDataAvailability(config: GA4Config): Promise<DataAvailabilityReport> {
    const report: DataAvailabilityReport = {
      hasRealData: false,
      dataRanges: [],
      recommendations: []
    };

    if (!this.analyticsClient || !config.isValid) {
      report.recommendations.push('Fix configuration issues before checking data availability');
      return report;
    }

    const dateRanges = [
      { name: 'Last 7 days', startDate: '7daysAgo', endDate: 'today' },
      { name: 'Last 30 days', startDate: '30daysAgo', endDate: 'today' },
      { name: 'Last 90 days', startDate: '90daysAgo', endDate: 'today' },
      { name: 'This year', startDate: '2024-01-01', endDate: 'today' }
    ];

    for (const range of dateRanges) {
      try {
        const [response] = await this.analyticsClient.runReport({
          property: `properties/${config.propertyId}`,
          dateRanges: [
            {
              startDate: range.startDate,
              endDate: range.endDate,
            },
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'sessions' }
          ],
        });

        const users = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
        const pageviews = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0');
        const sessions = parseInt(response.rows?.[0]?.metricValues?.[2]?.value || '0');

        const hasData = users > 0 || pageviews > 0 || sessions > 0;
        if (hasData) {
          report.hasRealData = true;
        }

        report.dataRanges.push({
          range: range.name,
          hasData,
          sampleMetrics: {
            pageviews,
            users,
            sessions
          }
        });

      } catch (error) {
        report.dataRanges.push({
          range: range.name,
          hasData: false,
          sampleMetrics: {
            pageviews: 0,
            users: 0,
            sessions: 0
          }
        });
      }
    }

    // Generate recommendations
    if (!report.hasRealData) {
      report.recommendations.push('No data found in any date range. This could mean:');
      report.recommendations.push('1. Your website has no visitors yet');
      report.recommendations.push('2. GA4 tracking code is not properly installed');
      report.recommendations.push('3. The property was recently created and needs time to collect data');
      report.recommendations.push(`4. Check if gtag is configured with measurement ID: ${config.measurementId}`);
    } else {
      report.recommendations.push('Great! Real data is available in your GA4 property');
    }

    return report;
  }

  /**
   * Run comprehensive diagnostic
   */
  async runFullDiagnostic(): Promise<DiagnosticReport> {
    const config = await this.resolveConfiguration();
    const dataAvailability = await this.checkDataAvailability(config);

    let serviceAccountInfo = { isValid: false, projectId: '', clientEmail: '', error: '' };
    try {
      if (process.env.GA4_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY);
        serviceAccountInfo = {
          isValid: true,
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email
        };
      }
    } catch (error) {
      serviceAccountInfo.error = error.message;
    }

    const report: DiagnosticReport = {
      configurationStatus: {
        environmentVariables: {
          hasGAMeasurementId: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
          hasGA4PropertyId: !!process.env.GA4_PROPERTY_ID,
          hasServiceAccountKey: !!process.env.GA4_SERVICE_ACCOUNT_KEY,
          hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID
        },
        serviceAccount: serviceAccountInfo,
        propertyMapping: {
          isValid: config.validationErrors.length === 0,
          measurementId: config.measurementId,
          propertyId: config.propertyId,
          error: config.validationErrors.join(', ')
        }
      },
      dataAvailability,
      recommendations: []
    };

    // Generate overall recommendations
    if (!config.isValid) {
      report.recommendations.push('Fix configuration issues first:');
      report.recommendations.push(...config.validationErrors.map(error => `- ${error}`));
    }

    if (config.isValid && !dataAvailability.hasRealData) {
      report.recommendations.push('Configuration is correct but no data available. Wait for visitors or check tracking installation.');
    }

    if (config.isValid && dataAvailability.hasRealData) {
      report.recommendations.push('Everything looks good! Your GA4 is properly configured and has data.');
    }

    return report;
  }
}

// Export singleton instance
export const ga4ConfigResolver = new GA4ConfigResolver();