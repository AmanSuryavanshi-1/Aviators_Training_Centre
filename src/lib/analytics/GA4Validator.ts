/**
 * GA4Validator Service
 * 
 * Comprehensive validation service for Google Analytics 4 API responses.
 * Ensures data integrity, handles errors gracefully, and provides fallback
 * logic with NA displays when GA4 is unavailable.
 */

import { naWrapperService, DisplayValue } from './NAWrapperService';

export interface GA4ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  metadata: {
    source: 'GA4-Production';
    timestamp: Date;
    validationVersion: string;
  };
}

export interface GA4ErrorContext {
  endpoint: string;
  propertyId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  timestamp: Date;
  quotaUsed: number;
}

export interface GA4HistoricalDataValidation extends GA4ValidationResult {
  dataQuality: {
    completeness: number;
    consistency: number;
    freshness: number;
  };
}

export interface GA4RealtimeDataValidation extends GA4ValidationResult {
  latency: number;
  dataPoints: number;
}

export class GA4Validator {
  private static instance: GA4Validator;
  private readonly validationVersion = '1.0.0';

  private constructor() {}

  static getInstance(): GA4Validator {
    if (!GA4Validator.instance) {
      GA4Validator.instance = new GA4Validator();
    }
    return GA4Validator.instance;
  }

  /**
   * Validate historical data from GA4 API
   */
  validateHistoricalData(data: any): GA4HistoricalDataValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    // Check if data exists
    if (!data) {
      errors.push('No data received from GA4 API');
      confidence = 0;
    } else {
      // Validate required fields
      const requiredFields = ['totalUsers', 'totalSessions', 'totalPageViews'];
      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          errors.push(`Missing required field: ${field}`);
          confidence -= 0.2;
        } else if (typeof data[field] !== 'number' || data[field] < 0) {
          errors.push(`Invalid value for ${field}: ${data[field]}`);
          confidence -= 0.15;
        }
      }

      // Validate data consistency
      if (data.totalUsers && data.totalSessions && data.totalUsers > data.totalSessions) {
        warnings.push('Total users exceeds total sessions - unusual pattern detected');
        confidence -= 0.1;
      }

      if (data.bounceRate && (data.bounceRate < 0 || data.bounceRate > 100)) {
        errors.push(`Invalid bounce rate: ${data.bounceRate}%`);
        confidence -= 0.2;
      }

      if (data.conversionRate && (data.conversionRate < 0 || data.conversionRate > 100)) {
        errors.push(`Invalid conversion rate: ${data.conversionRate}%`);
        confidence -= 0.2;
      }
    }

    // Calculate data quality metrics
    const dataQuality = {
      completeness: this.calculateCompleteness(data),
      consistency: this.calculateConsistency(data),
      freshness: this.calculateFreshness(data)
    };

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, confidence),
      errors,
      warnings,
      metadata: {
        source: 'GA4-Production',
        timestamp: new Date(),
        validationVersion: this.validationVersion
      },
      dataQuality
    };
  }

  /**
   * Validate realtime data from GA4 API
   */
  validateRealtimeData(data: any): GA4RealtimeDataValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    if (!data) {
      errors.push('No realtime data received from GA4 API');
      confidence = 0;
    } else {
      // Validate realtime specific fields
      if (data.activeUsers !== undefined) {
        if (typeof data.activeUsers !== 'number' || data.activeUsers < 0) {
          errors.push(`Invalid active users count: ${data.activeUsers}`);
          confidence -= 0.3;
        }
      }

      if (data.pageViews !== undefined) {
        if (typeof data.pageViews !== 'number' || data.pageViews < 0) {
          errors.push(`Invalid page views count: ${data.pageViews}`);
          confidence -= 0.3;
        }
      }

      // Validate top pages array
      if (data.topPages && !Array.isArray(data.topPages)) {
        errors.push('Top pages should be an array');
        confidence -= 0.2;
      }

      // Validate traffic sources array
      if (data.trafficSources && !Array.isArray(data.trafficSources)) {
        errors.push('Traffic sources should be an array');
        confidence -= 0.2;
      }
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, confidence),
      errors,
      warnings,
      metadata: {
        source: 'GA4-Production',
        timestamp: new Date(),
        validationVersion: this.validationVersion
      },
      latency: this.calculateLatency(data),
      dataPoints: this.countDataPoints(data)
    };
  }

  /**
   * Handle GA4 API errors and return appropriate NA wrapped response
   */
  handleGA4Error(error: any, context: GA4ErrorContext): DisplayValue<any> {
    let reason: string;
    let naReason: 'api_unavailable' | 'authentication_failed' | 'rate_limit_exceeded' | 'network_error' | 'data_processing_error';

    if (error.code === 401 || error.message?.includes('authentication')) {
      reason = 'GA4 authentication failed - check service account credentials';
      naReason = 'authentication_failed';
    } else if (error.code === 429 || error.message?.includes('quota')) {
      reason = 'GA4 API quota exceeded - please try again later';
      naReason = 'rate_limit_exceeded';
    } else if (error.code === 403 || error.message?.includes('permission')) {
      reason = 'Insufficient permissions to access GA4 data';
      naReason = 'authentication_failed';
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      reason = 'Network error connecting to GA4 API';
      naReason = 'network_error';
    } else if (error.message?.includes('property') || error.message?.includes('not found')) {
      reason = 'GA4 property not found or not configured';
      naReason = 'api_unavailable';
    } else {
      reason = `GA4 API error: ${error.message || 'Unknown error'}`;
      naReason = 'data_processing_error';
    }

    // Log error details for debugging
    console.error('GA4 API Error:', {
      error: error.message || error,
      context,
      timestamp: new Date().toISOString()
    });

    return naWrapperService.wrapValue(null, {
      reason: naReason,
      customReason: reason,
      source: 'GA4-Production'
    });
  }

  /**
   * Validate GA4 configuration
   */
  validateConfiguration(config: {
    propertyId?: string;
    serviceAccountKey?: string;
    serviceAccountPath?: string;
  }): GA4ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    if (!config.propertyId) {
      errors.push('GA4_PROPERTY_ID is not configured');
      confidence -= 0.5;
    } else if (!/^\d+$/.test(config.propertyId)) {
      errors.push('GA4_PROPERTY_ID should be a numeric string');
      confidence -= 0.3;
    }

    if (!config.serviceAccountKey && !config.serviceAccountPath) {
      errors.push('Neither GA4_SERVICE_ACCOUNT_KEY nor GA4_SERVICE_ACCOUNT_PATH is configured');
      confidence -= 0.5;
    }

    if (config.serviceAccountKey) {
      try {
        JSON.parse(config.serviceAccountKey);
      } catch (e) {
        errors.push('GA4_SERVICE_ACCOUNT_KEY is not valid JSON');
        confidence -= 0.4;
      }
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, confidence),
      errors,
      warnings,
      metadata: {
        source: 'GA4-Production',
        timestamp: new Date(),
        validationVersion: this.validationVersion
      }
    };
  }

  /**
   * Validate API response structure
   */
  validateResponseStructure(response: any, expectedFields: string[]): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    return expectedFields.every(field => {
      const fieldPath = field.split('.');
      let current = response;
      
      for (const path of fieldPath) {
        if (current === null || current === undefined || !(path in current)) {
          return false;
        }
        current = current[path];
      }
      
      return true;
    });
  }

  /**
   * Calculate data completeness score
   */
  private calculateCompleteness(data: any): number {
    if (!data) return 0;

    const expectedFields = [
      'totalUsers',
      'totalSessions', 
      'totalPageViews',
      'totalConversions',
      'bounceRate',
      'averageSessionDuration'
    ];

    const presentFields = expectedFields.filter(field => 
      data[field] !== undefined && data[field] !== null
    );

    return presentFields.length / expectedFields.length;
  }

  /**
   * Calculate data consistency score
   */
  private calculateConsistency(data: any): number {
    if (!data) return 0;

    let consistencyScore = 1.0;

    // Check logical relationships
    if (data.totalUsers && data.totalSessions) {
      if (data.totalUsers > data.totalSessions * 2) {
        consistencyScore -= 0.2; // Unusual user to session ratio
      }
    }

    if (data.totalPageViews && data.totalSessions) {
      const pagesPerSession = data.totalPageViews / data.totalSessions;
      if (pagesPerSession < 0.5 || pagesPerSession > 20) {
        consistencyScore -= 0.2; // Unusual pages per session
      }
    }

    if (data.bounceRate && (data.bounceRate < 10 || data.bounceRate > 95)) {
      consistencyScore -= 0.1; // Unusual bounce rate
    }

    return Math.max(0, consistencyScore);
  }

  /**
   * Calculate data freshness score
   */
  private calculateFreshness(data: any): number {
    if (!data || !data.timestamp) return 0.5;

    const dataTime = new Date(data.timestamp);
    const now = new Date();
    const ageInHours = (now.getTime() - dataTime.getTime()) / (1000 * 60 * 60);

    // Fresh data (< 1 hour) gets full score
    if (ageInHours < 1) return 1.0;
    
    // Data up to 24 hours old gets decreasing score
    if (ageInHours < 24) return 1.0 - (ageInHours / 24) * 0.5;
    
    // Older data gets lower score
    return 0.3;
  }

  /**
   * Calculate realtime data latency
   */
  private calculateLatency(data: any): number {
    if (!data || !data.timestamp) return -1;

    const dataTime = new Date(data.timestamp);
    const now = new Date();
    return now.getTime() - dataTime.getTime(); // milliseconds
  }

  /**
   * Count data points in response
   */
  private countDataPoints(data: any): number {
    if (!data) return 0;

    let count = 0;
    
    // Count scalar metrics
    const scalarFields = ['activeUsers', 'pageViews', 'conversions'];
    count += scalarFields.filter(field => data[field] !== undefined).length;

    // Count array data points
    if (Array.isArray(data.topPages)) count += data.topPages.length;
    if (Array.isArray(data.trafficSources)) count += data.trafficSources.length;

    return count;
  }

  /**
   * Create validation summary for debugging
   */
  createValidationSummary(validations: GA4ValidationResult[]): {
    overallValid: boolean;
    averageConfidence: number;
    totalErrors: number;
    totalWarnings: number;
    summary: string;
  } {
    const totalValidations = validations.length;
    const validCount = validations.filter(v => v.isValid).length;
    const totalErrors = validations.reduce((sum, v) => sum + v.errors.length, 0);
    const totalWarnings = validations.reduce((sum, v) => sum + v.warnings.length, 0);
    const averageConfidence = validations.reduce((sum, v) => sum + v.confidence, 0) / totalValidations;

    return {
      overallValid: validCount === totalValidations,
      averageConfidence,
      totalErrors,
      totalWarnings,
      summary: `${validCount}/${totalValidations} validations passed, ${totalErrors} errors, ${totalWarnings} warnings`
    };
  }
}

// Export singleton instance
export const ga4Validator = GA4Validator.getInstance();