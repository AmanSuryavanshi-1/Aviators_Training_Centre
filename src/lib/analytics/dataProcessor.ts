// Data Validation and Quality Assurance System

import { AnalyticsEventDocument, UserJourneyDocument, TrafficSourceDocument } from '../firebase/types';
import { BotDetection, BotDetectionResult } from './botDetection';

export interface DataValidationResult {
  isValid: boolean;
  qualityScore: number; // 0-100
  confidence: number; // 0-100
  validationErrors: ValidationError[];
  warnings: ValidationWarning[];
  dataCompleteness: number; // 0-100
  authenticity: AuthenticityCheck;
  anomalies: AnomalyDetection[];
}

export interface ValidationError {
  field: string;
  type: 'missing' | 'invalid_format' | 'out_of_range' | 'inconsistent' | 'suspicious';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix?: string;
}

export interface ValidationWarning {
  field: string;
  type: 'unusual_value' | 'potential_issue' | 'data_quality';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AuthenticityCheck {
  isAuthentic: boolean;
  confidence: number;
  botDetection: BotDetectionResult;
  spoofingIndicators: string[];
  dataIntegrityScore: number;
}

export interface AnomalyDetection {
  type: 'statistical' | 'pattern' | 'temporal' | 'behavioral';
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  affectedFields: string[];
  suggestedAction: string;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  uniqueness: number;
  overall: number;
}

export interface AnomalyPattern {
  name: string;
  description: string;
  detector: (data: any, historical: any[]) => AnomalyDetection | null;
  threshold: number;
}

export class DataProcessor {
  private botDetection: BotDetection;
  private anomalyPatterns: AnomalyPattern[];
  private historicalData: Map<string, any[]>;
  private validationRules: Map<string, ValidationRule[]>;

  constructor() {
    this.botDetection = new BotDetection();
    this.historicalData = new Map();
    this.validationRules = new Map();
    this.initializeAnomalyPatterns();
    this.initializeValidationRules();
  }

  /**
   * Validate and process analytics event
   */
  async validateAnalyticsEvent(
    event: Partial<AnalyticsEventDocument>,
    requestContext: {
      userAgent: string;
      ipAddress: string;
      headers: Record<string, string>;
      timestamp: number;
    }
  ): Promise<DataValidationResult> {
    const validationErrors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const anomalies: AnomalyDetection[] = [];

    // 1. Required field validation
    const requiredFields = ['userId', 'sessionId', 'event', 'page', 'source', 'user', 'journey', 'validation'];
    for (const field of requiredFields) {
      if (!event[field as keyof typeof event]) {
        validationErrors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing`,
          severity: 'critical',
          suggestedFix: `Ensure ${field} is included in the event data`
        });
      }
    }

    // 2. Data format validation
    if (event.timestamp && !(event.timestamp instanceof Date)) {
      validationErrors.push({
        field: 'timestamp',
        type: 'invalid_format',
        message: 'Timestamp must be a Date object',
        severity: 'high',
        suggestedFix: 'Convert timestamp to Date object'
      });
    }

    // 3. Range validation
    if (event.source?.confidence !== undefined) {
      if (event.source.confidence < 0 || event.source.confidence > 100) {
        validationErrors.push({
          field: 'source.confidence',
          type: 'out_of_range',
          message: 'Confidence must be between 0 and 100',
          severity: 'medium',
          suggestedFix: 'Clamp confidence value to 0-100 range'
        });
      }
    }

    if (event.validation?.botScore !== undefined) {
      if (event.validation.botScore < 0 || event.validation.botScore > 100) {
        validationErrors.push({
          field: 'validation.botScore',
          type: 'out_of_range',
          message: 'Bot score must be between 0 and 100',
          severity: 'medium',
          suggestedFix: 'Clamp bot score to 0-100 range'
        });
      }
    }

    // 4. Consistency validation
    if (event.journey?.timeSpent !== undefined && event.journey.timeSpent < 0) {
      validationErrors.push({
        field: 'journey.timeSpent',
        type: 'inconsistent',
        message: 'Time spent cannot be negative',
        severity: 'high',
        suggestedFix: 'Ensure time calculations are correct'
      });
    }

    // 5. Bot detection and authenticity check
    const botDetectionResult = await this.botDetection.analyzeRequest({
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress,
      path: event.page?.path || '',
      timestamp: requestContext.timestamp,
      headers: requestContext.headers,
      sessionId: event.sessionId,
      userId: event.userId
    });

    // 6. Anomaly detection
    const eventAnomalies = await this.detectAnomalies('analytics_event', event);
    anomalies.push(...eventAnomalies);

    // 7. Data completeness check
    const completeness = this.calculateDataCompleteness(event, requiredFields);

    // 8. Quality score calculation
    const qualityScore = this.calculateQualityScore(validationErrors, warnings, completeness, botDetectionResult);

    return {
      isValid: validationErrors.filter(e => e.severity === 'critical').length === 0,
      qualityScore,
      confidence: this.calculateConfidence(validationErrors, warnings, botDetectionResult),
      validationErrors,
      warnings,
      dataCompleteness: completeness,
      authenticity: {
        isAuthentic: !botDetectionResult.isBot,
        confidence: botDetectionResult.confidence,
        botDetection: botDetectionResult,
        spoofingIndicators: this.detectSpoofingIndicators(event, requestContext),
        dataIntegrityScore: this.calculateDataIntegrityScore(event)
      },
      anomalies
    };
  }

  /**
   * Validate user journey data
   */
  async validateUserJourney(journey: Partial<UserJourneyDocument>): Promise<DataValidationResult> {
    const validationErrors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const anomalies: AnomalyDetection[] = [];

    // Required field validation
    const requiredFields = ['userId', 'sessionId', 'startTime', 'entry', 'path', 'outcome', 'metrics', 'attribution'];
    for (const field of requiredFields) {
      if (!journey[field as keyof typeof journey]) {
        validationErrors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing`,
          severity: 'critical'
        });
      }
    }

    // Journey path validation
    if (journey.path && Array.isArray(journey.path)) {
      if (journey.path.length === 0) {
        warnings.push({
          field: 'path',
          type: 'unusual_value',
          message: 'Journey path is empty',
          impact: 'medium'
        });
      }

      // Validate step sequence
      journey.path.forEach((step, index) => {
        if (step.stepNumber !== index + 1) {
          validationErrors.push({
            field: `path[${index}].stepNumber`,
            type: 'inconsistent',
            message: `Step number ${step.stepNumber} doesn't match position ${index + 1}`,
            severity: 'medium'
          });
        }
      });
    }

    // Metrics validation
    if (journey.metrics) {
      if (journey.metrics.duration < 0) {
        validationErrors.push({
          field: 'metrics.duration',
          type: 'invalid_format',
          message: 'Duration cannot be negative',
          severity: 'high'
        });
      }

      if (journey.metrics.engagementScore < 0 || journey.metrics.engagementScore > 100) {
        validationErrors.push({
          field: 'metrics.engagementScore',
          type: 'out_of_range',
          message: 'Engagement score must be between 0 and 100',
          severity: 'medium'
        });
      }
    }

    // Detect anomalies
    const journeyAnomalies = await this.detectAnomalies('user_journey', journey);
    anomalies.push(...journeyAnomalies);

    const completeness = this.calculateDataCompleteness(journey, requiredFields);
    const qualityScore = this.calculateQualityScore(validationErrors, warnings, completeness);

    return {
      isValid: validationErrors.filter(e => e.severity === 'critical').length === 0,
      qualityScore,
      confidence: this.calculateConfidence(validationErrors, warnings),
      validationErrors,
      warnings,
      dataCompleteness: completeness,
      authenticity: {
        isAuthentic: true, // Journey data is typically internal
        confidence: 95,
        botDetection: {} as BotDetectionResult,
        spoofingIndicators: [],
        dataIntegrityScore: this.calculateDataIntegrityScore(journey)
      },
      anomalies
    };
  }

  /**
   * Validate traffic source data
   */
  async validateTrafficSource(source: Partial<TrafficSourceDocument>): Promise<DataValidationResult> {
    const validationErrors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const anomalies: AnomalyDetection[] = [];

    // Required field validation
    const requiredFields = ['date', 'source', 'medium', 'category', 'metrics', 'authenticity'];
    for (const field of requiredFields) {
      if (!source[field as keyof typeof source]) {
        validationErrors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing`,
          severity: 'critical'
        });
      }
    }

    // Date format validation
    if (source.date && !/^\d{4}-\d{2}-\d{2}$/.test(source.date)) {
      validationErrors.push({
        field: 'date',
        type: 'invalid_format',
        message: 'Date must be in YYYY-MM-DD format',
        severity: 'high'
      });
    }

    // Metrics validation
    if (source.metrics) {
      const metrics = source.metrics;
      
      if (metrics.visitors < 0 || metrics.sessions < 0 || metrics.pageViews < 0) {
        validationErrors.push({
          field: 'metrics',
          type: 'invalid_format',
          message: 'Visitor, session, and page view counts cannot be negative',
          severity: 'high'
        });
      }

      if (metrics.conversionRate < 0 || metrics.conversionRate > 100) {
        validationErrors.push({
          field: 'metrics.conversionRate',
          type: 'out_of_range',
          message: 'Conversion rate must be between 0 and 100',
          severity: 'medium'
        });
      }

      if (metrics.bounceRate < 0 || metrics.bounceRate > 100) {
        validationErrors.push({
          field: 'metrics.bounceRate',
          type: 'out_of_range',
          message: 'Bounce rate must be between 0 and 100',
          severity: 'medium'
        });
      }

      // Logical consistency checks
      if (metrics.sessions > metrics.visitors) {
        warnings.push({
          field: 'metrics',
          type: 'potential_issue',
          message: 'Sessions exceed visitors - check for returning users',
          impact: 'low'
        });
      }

      if (metrics.pageViews < metrics.sessions) {
        warnings.push({
          field: 'metrics',
          type: 'potential_issue',
          message: 'Page views less than sessions - unusual pattern',
          impact: 'medium'
        });
      }
    }

    // Detect anomalies
    const sourceAnomalies = await this.detectAnomalies('traffic_source', source);
    anomalies.push(...sourceAnomalies);

    const completeness = this.calculateDataCompleteness(source, requiredFields);
    const qualityScore = this.calculateQualityScore(validationErrors, warnings, completeness);

    return {
      isValid: validationErrors.filter(e => e.severity === 'critical').length === 0,
      qualityScore,
      confidence: this.calculateConfidence(validationErrors, warnings),
      validationErrors,
      warnings,
      dataCompleteness: completeness,
      authenticity: {
        isAuthentic: true,
        confidence: 90,
        botDetection: {} as BotDetectionResult,
        spoofingIndicators: [],
        dataIntegrityScore: this.calculateDataIntegrityScore(source)
      },
      anomalies
    };
  }

  /**
   * Detect anomalies in data
   */
  private async detectAnomalies(dataType: string, data: any): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    const historicalData = this.historicalData.get(dataType) || [];

    for (const pattern of this.anomalyPatterns) {
      const anomaly = pattern.detector(data, historicalData);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    // Store data for future anomaly detection
    historicalData.push(data);
    if (historicalData.length > 1000) {
      historicalData.splice(0, historicalData.length - 1000); // Keep last 1000 records
    }
    this.historicalData.set(dataType, historicalData);

    return anomalies;
  }

  /**
   * Calculate data completeness score
   */
  private calculateDataCompleteness(data: any, requiredFields: string[]): number {
    let completedFields = 0;
    let totalFields = requiredFields.length;

    for (const field of requiredFields) {
      const fieldValue = this.getNestedValue(data, field);
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        completedFields++;
      }
    }

    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    completeness: number,
    botDetection?: BotDetectionResult
  ): number {
    let score = 100;

    // Deduct points for errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Deduct points for warnings
    warnings.forEach(warning => {
      switch (warning.impact) {
        case 'high':
          score -= 8;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    // Factor in completeness
    score = score * (completeness / 100);

    // Factor in bot detection
    if (botDetection && botDetection.isBot) {
      score = score * (1 - (botDetection.botScore / 100));
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence in validation
   */
  private calculateConfidence(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    botDetection?: BotDetectionResult
  ): number {
    let confidence = 95;

    // Reduce confidence based on errors
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    
    confidence -= criticalErrors * 20;
    confidence -= highErrors * 10;
    confidence -= warnings.length * 3;

    // Factor in bot detection confidence
    if (botDetection) {
      confidence = Math.min(confidence, botDetection.confidence);
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Detect spoofing indicators
   */
  private detectSpoofingIndicators(event: any, requestContext: any): string[] {
    const indicators: string[] = [];

    // Check for inconsistent user agent and claimed browser
    if (event.user?.browser && requestContext.userAgent) {
      const claimedBrowser = event.user.browser.toLowerCase();
      const userAgent = requestContext.userAgent.toLowerCase();
      
      if (!userAgent.includes(claimedBrowser)) {
        indicators.push('browser_user_agent_mismatch');
      }
    }

    // Check for impossible time values
    if (event.journey?.timeSpent > 86400000) { // More than 24 hours
      indicators.push('impossible_time_spent');
    }

    // Check for suspicious scroll depth patterns
    if (event.journey?.scrollDepth === 100 && event.journey?.timeSpent < 1000) {
      indicators.push('instant_full_scroll');
    }

    return indicators;
  }

  /**
   * Calculate data integrity score
   */
  private calculateDataIntegrityScore(data: any): number {
    let score = 100;
    let checks = 0;

    // Check for null/undefined values in critical fields
    const criticalFields = Object.keys(data).filter(key => 
      data[key] !== null && data[key] !== undefined
    );
    
    checks++;
    if (criticalFields.length < Object.keys(data).length * 0.8) {
      score -= 20; // Too many missing values
    }

    // Check for reasonable value ranges
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          checks++;
          if (value < 0 && !key.includes('offset') && !key.includes('delta')) {
            score -= 10; // Unexpected negative values
          }
          if (value > 1000000 && !key.includes('timestamp')) {
            score -= 5; // Suspiciously large values
          }
        }
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Initialize anomaly detection patterns
   */
  private initializeAnomalyPatterns(): void {
    this.anomalyPatterns = [
      {
        name: 'unusual_traffic_spike',
        description: 'Detects unusual spikes in traffic volume',
        threshold: 3.0, // 3 standard deviations
        detector: (data: any, historical: any[]) => {
          if (historical.length < 10) return null;
          
          const values = historical.map(h => h.metrics?.visitors || 0);
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const stdDev = Math.sqrt(variance);
          
          const currentValue = data.metrics?.visitors || 0;
          const zScore = Math.abs((currentValue - mean) / stdDev);
          
          if (zScore > 3.0) {
            return {
              type: 'statistical',
              description: `Traffic volume ${currentValue} is ${zScore.toFixed(1)} standard deviations from normal`,
              severity: zScore > 5 ? 'high' : 'medium',
              confidence: Math.min(95, zScore * 20),
              affectedFields: ['metrics.visitors'],
              suggestedAction: 'Investigate traffic source and validate authenticity'
            } as AnomalyDetection;
          }
          
          return null;
        }
      },
      {
        name: 'impossible_conversion_rate',
        description: 'Detects impossibly high conversion rates',
        threshold: 50, // 50% conversion rate threshold
        detector: (data: any, historical: any[]) => {
          const conversionRate = data.metrics?.conversionRate || 0;
          
          if (conversionRate > 50) {
            return {
              type: 'statistical',
              description: `Conversion rate of ${conversionRate}% is unusually high`,
              severity: conversionRate > 80 ? 'high' : 'medium',
              confidence: 90,
              affectedFields: ['metrics.conversionRate'],
              suggestedAction: 'Verify conversion tracking implementation'
            } as AnomalyDetection;
          }
          
          return null;
        }
      },
      {
        name: 'session_duration_anomaly',
        description: 'Detects unusual session durations',
        threshold: 7200000, // 2 hours in milliseconds
        detector: (data: any, historical: any[]) => {
          const duration = data.metrics?.duration || 0;
          
          if (duration > 7200000) { // More than 2 hours
            return {
              type: 'behavioral',
              description: `Session duration of ${Math.round(duration / 60000)} minutes is unusually long`,
              severity: duration > 14400000 ? 'high' : 'medium', // 4 hours
              confidence: 85,
              affectedFields: ['metrics.duration'],
              suggestedAction: 'Check for session timeout issues or bot activity'
            } as AnomalyDetection;
          }
          
          return null;
        }
      }
    ];
  }

  /**
   * Initialize validation rules
   */
  private initializeValidationRules(): void {
    // This would contain more sophisticated validation rules
    // For now, we'll keep the validation logic in the main methods
  }

  /**
   * Get data quality metrics for a dataset
   */
  async getDataQualityMetrics(
    dataType: 'analytics_events' | 'user_journeys' | 'traffic_sources',
    timeRange: { start: Date; end: Date }
  ): Promise<DataQualityMetrics> {
    // This would analyze actual data from the database
    // For now, return mock metrics
    return {
      completeness: 85,
      accuracy: 92,
      consistency: 88,
      timeliness: 95,
      validity: 90,
      uniqueness: 97,
      overall: 91
    };
  }

  /**
   * Generate data quality report
   */
  async generateQualityReport(
    timeRange: { start: Date; end: Date }
  ): Promise<{
    summary: DataQualityMetrics;
    issues: Array<{
      type: string;
      count: number;
      severity: string;
      examples: string[];
    }>;
    recommendations: string[];
  }> {
    // This would generate a comprehensive quality report
    // For now, return mock data
    return {
      summary: await this.getDataQualityMetrics('analytics_events', timeRange),
      issues: [
        {
          type: 'missing_required_fields',
          count: 12,
          severity: 'high',
          examples: ['userId missing in 8 events', 'sessionId missing in 4 events']
        }
      ],
      recommendations: [
        'Implement client-side validation before sending events',
        'Add data quality monitoring alerts',
        'Review bot detection thresholds'
      ]
    };
  }
}

interface ValidationRule {
  field: string;
  validator: (value: any) => ValidationError | null;
}