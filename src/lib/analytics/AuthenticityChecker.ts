/**
 * AuthenticityChecker Service
 * 
 * Real-time validation system for analytics data authenticity.
 * Detects suspicious patterns, bot activity, and provides confidence scores
 * for all incoming analytics data.
 */

export interface AuthenticityResult {
  authentic: boolean;
  confidence: number;
  reason: string;
  source: string;
  timestamp: Date;
  flags: AuthenticityFlag[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuthenticityFlag {
  type: AuthenticityFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: Record<string, any>;
  confidence: number;
}

export enum AuthenticityFlagType {
  // Traffic Pattern Flags
  SUSPICIOUS_TRAFFIC_SPIKE = 'SUSPICIOUS_TRAFFIC_SPIKE',
  UNUSUAL_TRAFFIC_PATTERN = 'UNUSUAL_TRAFFIC_PATTERN',
  RAPID_SEQUENTIAL_REQUESTS = 'RAPID_SEQUENTIAL_REQUESTS',
  
  // Bot Detection Flags
  BOT_USER_AGENT = 'BOT_USER_AGENT',
  SUSPICIOUS_IP_PATTERN = 'SUSPICIOUS_IP_PATTERN',
  AUTOMATED_BEHAVIOR = 'AUTOMATED_BEHAVIOR',
  
  // Data Quality Flags
  INCONSISTENT_METRICS = 'INCONSISTENT_METRICS',
  IMPOSSIBLE_VALUES = 'IMPOSSIBLE_VALUES',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  
  // Source Validation Flags
  UNVERIFIED_SOURCE = 'UNVERIFIED_SOURCE',
  TAMPERED_DATA = 'TAMPERED_DATA',
  OUTDATED_DATA = 'OUTDATED_DATA'
}

export interface TrafficData {
  timestamp: Date;
  visitors: number;
  pageViews: number;
  conversions: number;
  sources: TrafficSource[];
  userAgents: string[];
  ipAddresses: string[];
  sessionDurations: number[];
}

export interface TrafficSource {
  source: string;
  medium: string;
  visitors: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface SpikeAnalysis {
  isSpike: boolean;
  magnitude: number;
  confidence: number;
  expectedRange: { min: number; max: number };
  actualValue: number;
  timeWindow: string;
  flags: AuthenticityFlag[];
}

export interface IPValidation {
  isValid: boolean;
  riskScore: number;
  flags: string[];
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
  isp?: string;
  isVPN: boolean;
  isProxy: boolean;
  isDataCenter: boolean;
}

export interface UAValidation {
  isValid: boolean;
  isBot: boolean;
  browserFamily: string;
  osFamily: string;
  deviceType: string;
  riskScore: number;
  flags: string[];
}

export interface BehaviorValidation {
  isHuman: boolean;
  riskScore: number;
  patterns: BehaviorPattern[];
  anomalies: BehaviorAnomaly[];
}

export interface BehaviorPattern {
  type: 'mouse_movement' | 'scroll_pattern' | 'click_timing' | 'page_sequence';
  score: number;
  confidence: number;
}

export interface BehaviorAnomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: any;
}

export class AuthenticityChecker {
  private static instance: AuthenticityChecker;
  private historicalData: Map<string, number[]> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private knownBotPatterns: RegExp[] = [
    /bot|crawler|spider|scraper/i,
    /googlebot|bingbot|slurp|duckduckbot/i,
    /facebookexternalhit|twitterbot|linkedinbot/i,
    /headless|phantom|selenium|puppeteer/i
  ];

  private constructor() {
    this.initializeHistoricalData();
  }

  static getInstance(): AuthenticityChecker {
    if (!AuthenticityChecker.instance) {
      AuthenticityChecker.instance = new AuthenticityChecker();
    }
    return AuthenticityChecker.instance;
  }

  /**
   * Validate a single analytics metric for authenticity
   */
  validateMetric(metric: any, context: { source: string; timestamp: Date }): AuthenticityResult {
    const flags: AuthenticityFlag[] = [];
    let confidence = 1.0;
    let authentic = true;

    // Validate metric value
    if (this.isImpossibleValue(metric)) {
      flags.push({
        type: AuthenticityFlagType.IMPOSSIBLE_VALUES,
        severity: 'critical',
        description: 'Metric contains impossible or invalid values',
        evidence: { metric, value: metric.value },
        confidence: 0.95
      });
      confidence -= 0.5;
      authentic = false;
    }

    // Check for data consistency
    if (this.hasInconsistentMetrics(metric)) {
      flags.push({
        type: AuthenticityFlagType.INCONSISTENT_METRICS,
        severity: 'medium',
        description: 'Metric values are inconsistent with expected patterns',
        evidence: { metric },
        confidence: 0.7
      });
      confidence -= 0.2;
    }

    // Validate data freshness
    if (this.isOutdatedData(metric, context.timestamp)) {
      flags.push({
        type: AuthenticityFlagType.OUTDATED_DATA,
        severity: 'low',
        description: 'Data appears to be outdated',
        evidence: { timestamp: context.timestamp, dataTimestamp: metric.timestamp },
        confidence: 0.8
      });
      confidence -= 0.1;
    }

    // Source validation
    if (!this.isVerifiedSource(context.source)) {
      flags.push({
        type: AuthenticityFlagType.UNVERIFIED_SOURCE,
        severity: 'high',
        description: 'Data source is not verified or trusted',
        evidence: { source: context.source },
        confidence: 0.9
      });
      confidence -= 0.3;
      authentic = false;
    }

    return {
      authentic,
      confidence: Math.max(0, confidence),
      reason: authentic ? 'Data appears authentic' : this.generateReasonFromFlags(flags),
      source: context.source,
      timestamp: context.timestamp,
      flags,
      riskLevel: this.calculateRiskLevel(flags, confidence)
    };
  }

  /**
   * Analyze traffic data for suspicious spikes
   */
  checkTrafficSpike(data: TrafficData): SpikeAnalysis {
    const key = `traffic_${data.timestamp.toDateString()}`;
    const historical = this.historicalData.get(key) || [];
    
    // Calculate expected range based on historical data
    const mean = historical.length > 0 ? historical.reduce((a, b) => a + b, 0) / historical.length : data.visitors;
    const stdDev = this.calculateStandardDeviation(historical, mean);
    const expectedRange = {
      min: Math.max(0, mean - (2 * stdDev)),
      max: mean + (2 * stdDev)
    };

    const isSpike = data.visitors > expectedRange.max;
    const magnitude = isSpike ? (data.visitors - expectedRange.max) / expectedRange.max : 0;
    
    const flags: AuthenticityFlag[] = [];
    let confidence = 0.8;

    if (isSpike) {
      if (magnitude > 3) {
        flags.push({
          type: AuthenticityFlagType.SUSPICIOUS_TRAFFIC_SPIKE,
          severity: 'critical',
          description: `Extreme traffic spike detected: ${(magnitude * 100).toFixed(1)}% above normal`,
          evidence: { 
            actual: data.visitors, 
            expected: expectedRange.max, 
            magnitude: magnitude 
          },
          confidence: 0.95
        });
        confidence = 0.3;
      } else if (magnitude > 1.5) {
        flags.push({
          type: AuthenticityFlagType.UNUSUAL_TRAFFIC_PATTERN,
          severity: 'medium',
          description: `Unusual traffic pattern detected: ${(magnitude * 100).toFixed(1)}% above normal`,
          evidence: { 
            actual: data.visitors, 
            expected: expectedRange.max, 
            magnitude: magnitude 
          },
          confidence: 0.8
        });
        confidence = 0.6;
      }
    }

    // Update historical data
    historical.push(data.visitors);
    if (historical.length > 30) { // Keep last 30 data points
      historical.shift();
    }
    this.historicalData.set(key, historical);

    return {
      isSpike,
      magnitude,
      confidence,
      expectedRange,
      actualValue: data.visitors,
      timeWindow: '24h',
      flags
    };
  }

  /**
   * Validate IP addresses for suspicious patterns
   */
  validateIPPatterns(visitors: Array<{ ip: string; requests: number; userAgent: string }>): IPValidation {
    const flags: string[] = [];
    let riskScore = 0;
    let isValid = true;

    for (const visitor of visitors) {
      // Check for suspicious request patterns
      if (visitor.requests > 100) { // More than 100 requests from single IP
        flags.push(`High request volume from IP: ${visitor.ip}`);
        riskScore += 0.3;
      }

      // Check for known suspicious IPs
      if (this.suspiciousIPs.has(visitor.ip)) {
        flags.push(`Known suspicious IP: ${visitor.ip}`);
        riskScore += 0.5;
        isValid = false;
      }

      // Check for data center IPs (simplified check)
      if (this.isDataCenterIP(visitor.ip)) {
        flags.push(`Data center IP detected: ${visitor.ip}`);
        riskScore += 0.2;
      }

      // Check for bot user agents
      if (this.isBotUserAgent(visitor.userAgent)) {
        flags.push(`Bot user agent from IP: ${visitor.ip}`);
        riskScore += 0.4;
      }
    }

    return {
      isValid: isValid && riskScore < 0.7,
      riskScore: Math.min(1, riskScore),
      flags,
      isVPN: false, // Would require external service
      isProxy: false, // Would require external service
      isDataCenter: visitors.some(v => this.isDataCenterIP(v.ip))
    };
  }

  /**
   * Generate confidence score for data authenticity
   */
  generateConfidenceScore(data: any): number {
    let confidence = 1.0;
    const factors = [];

    // Data completeness
    const completeness = this.calculateDataCompleteness(data);
    confidence *= completeness;
    factors.push({ factor: 'completeness', score: completeness });

    // Data consistency
    const consistency = this.calculateDataConsistency(data);
    confidence *= consistency;
    factors.push({ factor: 'consistency', score: consistency });

    // Source reliability
    const sourceReliability = this.calculateSourceReliability(data.source || 'unknown');
    confidence *= sourceReliability;
    factors.push({ factor: 'source', score: sourceReliability });

    // Temporal validity
    const temporalValidity = this.calculateTemporalValidity(data.timestamp);
    confidence *= temporalValidity;
    factors.push({ factor: 'temporal', score: temporalValidity });

    // Log confidence calculation for debugging
    console.debug('Confidence calculation:', {
      finalScore: confidence,
      factors
    });

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Initialize historical data for baseline calculations
   */
  private initializeHistoricalData(): void {
    // In a real implementation, this would load from a database
    // For now, we'll use some baseline values
    const baselineTraffic = [100, 120, 95, 110, 105, 130, 115, 90, 125, 108];
    this.historicalData.set('traffic_baseline', baselineTraffic);
  }

  /**
   * Check if a metric value is impossible or invalid
   */
  private isImpossibleValue(metric: any): boolean {
    if (typeof metric.value === 'number') {
      // Check for impossible numeric values
      if (isNaN(metric.value) || !isFinite(metric.value)) {
        return true;
      }
      
      // Check for negative values where they shouldn't exist
      if (metric.type === 'visitors' || metric.type === 'pageviews') {
        return metric.value < 0;
      }
      
      // Check for percentage values outside 0-100 range
      if (metric.type === 'bounce_rate' || metric.type === 'conversion_rate') {
        return metric.value < 0 || metric.value > 100;
      }
    }
    
    return false;
  }

  /**
   * Check for inconsistent metrics
   */
  private hasInconsistentMetrics(metric: any): boolean {
    // Example: bounce rate of 0% with high traffic is suspicious
    if (metric.bounceRate === 0 && metric.visitors > 1000) {
      return true;
    }
    
    // Example: conversion rate over 50% is highly suspicious
    if (metric.conversionRate > 50) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if data is outdated
   */
  private isOutdatedData(metric: any, currentTime: Date): boolean {
    if (!metric.timestamp) return false;
    
    const dataTime = new Date(metric.timestamp);
    const ageInHours = (currentTime.getTime() - dataTime.getTime()) / (1000 * 60 * 60);
    
    // Data older than 24 hours is considered outdated for real-time metrics
    return ageInHours > 24;
  }

  /**
   * Check if source is verified and trusted
   */
  private isVerifiedSource(source: string): boolean {
    const trustedSources = [
      'GA4-Production',
      'Search-Console',
      'Firebase-Analytics',
      'Server-Logs'
    ];
    
    return trustedSources.includes(source);
  }

  /**
   * Check if IP belongs to a data center
   */
  private isDataCenterIP(ip: string): boolean {
    // Simplified check - in reality, you'd use a service like MaxMind
    const dataCenterRanges = [
      /^54\./, // AWS
      /^52\./, // AWS
      /^34\./, // Google Cloud
      /^35\./, // Google Cloud
      /^40\./, // Azure
      /^52\./, // Azure
    ];
    
    return dataCenterRanges.some(range => range.test(ip));
  }

  /**
   * Check if user agent indicates a bot
   */
  private isBotUserAgent(userAgent: string): boolean {
    return this.knownBotPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Calculate standard deviation for spike detection
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Calculate data completeness score
   */
  private calculateDataCompleteness(data: any): number {
    if (!data) return 0;
    
    const requiredFields = ['timestamp', 'source'];
    const presentFields = requiredFields.filter(field => data[field] != null);
    
    return presentFields.length / requiredFields.length;
  }

  /**
   * Calculate data consistency score
   */
  private calculateDataConsistency(data: any): number {
    let consistency = 1.0;
    
    // Check for logical inconsistencies
    if (data.bounceRate > 100 || data.bounceRate < 0) {
      consistency -= 0.3;
    }
    
    if (data.conversionRate > 100 || data.conversionRate < 0) {
      consistency -= 0.3;
    }
    
    return Math.max(0, consistency);
  }

  /**
   * Calculate source reliability score
   */
  private calculateSourceReliability(source: string): number {
    const reliabilityScores: Record<string, number> = {
      'GA4-Production': 1.0,
      'Search-Console': 0.95,
      'Firebase-Analytics': 0.9,
      'Server-Logs': 0.85,
      'unknown': 0.3
    };
    
    return reliabilityScores[source] || 0.5;
  }

  /**
   * Calculate temporal validity score
   */
  private calculateTemporalValidity(timestamp: any): number {
    if (!timestamp) return 0.5;
    
    const dataTime = new Date(timestamp);
    const now = new Date();
    const ageInHours = (now.getTime() - dataTime.getTime()) / (1000 * 60 * 60);
    
    // Fresh data (< 1 hour) gets full score
    if (ageInHours < 1) return 1.0;
    
    // Data up to 24 hours old gets decreasing score
    if (ageInHours < 24) return 1.0 - (ageInHours / 24) * 0.3;
    
    // Older data gets lower score
    return 0.4;
  }

  /**
   * Generate human-readable reason from flags
   */
  private generateReasonFromFlags(flags: AuthenticityFlag[]): string {
    if (flags.length === 0) return 'No issues detected';
    
    const criticalFlags = flags.filter(f => f.severity === 'critical');
    if (criticalFlags.length > 0) {
      return criticalFlags[0].description;
    }
    
    const highFlags = flags.filter(f => f.severity === 'high');
    if (highFlags.length > 0) {
      return highFlags[0].description;
    }
    
    return flags[0].description;
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(flags: AuthenticityFlag[], confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFlags = flags.filter(f => f.severity === 'critical').length;
    const highFlags = flags.filter(f => f.severity === 'high').length;
    
    if (criticalFlags > 0 || confidence < 0.3) return 'critical';
    if (highFlags > 0 || confidence < 0.6) return 'high';
    if (flags.length > 2 || confidence < 0.8) return 'medium';
    
    return 'low';
  }
}

// Export singleton instance
export const authenticityChecker = AuthenticityChecker.getInstance();