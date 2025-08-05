// Journey Analytics and Funnel Analysis System

import { UserJourneyDocument, TrafficSource } from '../firebase/types';
import { UserJourneysService } from '../firebase/collections';

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface FunnelStep {
  stepNumber: number;
  name: string;
  pagePattern: string | RegExp;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeSpent: number;
  commonExitPages: string[];
}

export interface DropOffPoint {
  fromStep: string;
  toStep: string;
  dropOffCount: number;
  dropOffRate: number;
  commonReasons: string[];
  optimizationSuggestions: string[];
}

export interface UserPathAnalysis {
  commonPaths: Array<{
    path: string[];
    frequency: number;
    conversionRate: number;
    averageDuration: number;
  }>;
  entryPages: Array<{
    page: string;
    visitors: number;
    conversionRate: number;
    bounceRate: number;
  }>;
  exitPages: Array<{
    page: string;
    exits: number;
    exitRate: number;
    averageTimeBeforeExit: number;
  }>;
}

export interface JourneySegmentation {
  segments: Array<{
    name: string;
    criteria: SegmentCriteria;
    journeyCount: number;
    conversionRate: number;
    averageDuration: number;
    topPages: string[];
    behaviorPatterns: string[];
  }>;
}

export interface SegmentCriteria {
  trafficSource?: string[];
  deviceType?: string[];
  location?: string[];
  timeRange?: { start: Date; end: Date };
  pageCount?: { min?: number; max?: number };
  duration?: { min?: number; max?: number };
  engagementScore?: { min?: number; max?: number };
}

export interface AttributionModel {
  name: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
  description: string;
  weightingFunction: (touchpoints: TouchPoint[]) => TouchPoint[];
}

export interface TouchPoint {
  source: TrafficSource;
  timestamp: Date;
  page: string;
  weight: number;
  conversionContribution: number;
}

export interface JourneyOutcomeAttribution {
  journeyId: string;
  outcome: 'conversion' | 'bounce' | 'exit';
  attributionModel: AttributionModel['name'];
  touchpoints: TouchPoint[];
  primaryAttribution: TrafficSource;
  assistingChannels: TrafficSource[];
  conversionValue?: number;
}

export class JourneyAnalytics {
  private attributionModels: Map<string, AttributionModel>;

  constructor() {
    this.attributionModels = new Map();
    this.initializeAttributionModels();
  }

  /**
   * Analyze conversion funnel with drop-off identification
   */
  async analyzeConversionFunnel(
    funnelDefinition: {
      name: string;
      steps: Array<{
        name: string;
        pagePattern: string | RegExp;
      }>;
    },
    timeRange: { start: Date; end: Date },
    filters?: {
      trafficSource?: string;
      deviceType?: string;
      location?: string;
    }
  ): Promise<ConversionFunnel> {
    // Get journeys within time range
    const journeys = await UserJourneysService.getJourneysByTimeRange(
      timeRange.start,
      timeRange.end,
      filters
    );

    // Initialize funnel steps
    const funnelSteps: FunnelStep[] = funnelDefinition.steps.map((step, index) => ({
      stepNumber: index + 1,
      name: step.name,
      pagePattern: step.pagePattern,
      visitors: 0,
      conversions: 0,
      conversionRate: 0,
      dropOffRate: 0,
      averageTimeSpent: 0,
      commonExitPages: []
    }));

    let totalEntries = 0;
    let totalConversions = 0;

    // Analyze each journey
    for (const journey of journeys) {
      const journeySteps = this.mapJourneyToFunnelSteps(journey, funnelSteps);
      
      if (journeySteps.length > 0) {
        totalEntries++;
        
        // Track progression through funnel
        let reachedSteps = 0;
        for (let i = 0; i < funnelSteps.length; i++) {
          if (journeySteps.some(step => this.matchesPattern(step.page, funnelSteps[i].pagePattern))) {
            funnelSteps[i].visitors++;
            reachedSteps = i + 1;
            
            // Calculate time spent on this step
            const stepPages = journeySteps.filter(step => 
              this.matchesPattern(step.page, funnelSteps[i].pagePattern)
            );
            const timeSpent = stepPages.reduce((sum, step) => sum + step.timeSpent, 0);
            funnelSteps[i].averageTimeSpent += timeSpent;
          } else {
            break; // User didn't reach this step
          }
        }

        // Check for conversion
        if (journey.outcome.type === 'conversion') {
          totalConversions++;
          // Mark all reached steps as conversions
          for (let i = 0; i < reachedSteps; i++) {
            funnelSteps[i].conversions++;
          }
        }
      }
    }

    // Calculate rates and averages
    funnelSteps.forEach((step, index) => {
      if (step.visitors > 0) {
        step.conversionRate = (step.conversions / step.visitors) * 100;
        step.averageTimeSpent = step.averageTimeSpent / step.visitors;
        
        // Calculate drop-off rate (compared to previous step)
        if (index > 0) {
          const previousStepVisitors = funnelSteps[index - 1].visitors;
          step.dropOffRate = previousStepVisitors > 0 
            ? ((previousStepVisitors - step.visitors) / previousStepVisitors) * 100 
            : 0;
        }
      }
    });

    // Identify drop-off points
    const dropOffPoints = this.identifyDropOffPoints(funnelSteps, journeys);

    return {
      name: funnelDefinition.name,
      steps: funnelSteps,
      totalEntries,
      totalConversions,
      overallConversionRate: totalEntries > 0 ? (totalConversions / totalEntries) * 100 : 0,
      dropOffPoints
    };
  }

  /**
   * Analyze user path patterns
   */
  async analyzeUserPaths(
    timeRange: { start: Date; end: Date },
    filters?: SegmentCriteria
  ): Promise<UserPathAnalysis> {
    const journeys = await UserJourneysService.getJourneysByTimeRange(
      timeRange.start,
      timeRange.end,
      filters
    );

    // Analyze common paths
    const pathFrequency = new Map<string, {
      count: number;
      conversions: number;
      totalDuration: number;
    }>();

    // Analyze entry and exit pages
    const entryPageStats = new Map<string, {
      visitors: number;
      conversions: number;
      bounces: number;
    }>();

    const exitPageStats = new Map<string, {
      exits: number;
      totalTimeBeforeExit: number;
    }>();

    journeys.forEach(journey => {
      // Extract path
      const path = journey.path.map(step => step.page);
      const pathKey = path.join(' -> ');
      
      const pathData = pathFrequency.get(pathKey) || { count: 0, conversions: 0, totalDuration: 0 };
      pathData.count++;
      pathData.totalDuration += journey.metrics.duration;
      
      if (journey.outcome.type === 'conversion') {
        pathData.conversions++;
      }
      
      pathFrequency.set(pathKey, pathData);

      // Entry page analysis
      if (journey.path.length > 0) {
        const entryPage = journey.path[0].page;
        const entryData = entryPageStats.get(entryPage) || { visitors: 0, conversions: 0, bounces: 0 };
        entryData.visitors++;
        
        if (journey.outcome.type === 'conversion') {
          entryData.conversions++;
        }
        
        if (journey.outcome.type === 'bounce') {
          entryData.bounces++;
        }
        
        entryPageStats.set(entryPage, entryData);
      }

      // Exit page analysis
      if (journey.path.length > 0 && journey.outcome.type !== 'ongoing') {
        const exitPage = journey.path[journey.path.length - 1].page;
        const exitData = exitPageStats.get(exitPage) || { exits: 0, totalTimeBeforeExit: 0 };
        exitData.exits++;
        exitData.totalTimeBeforeExit += journey.metrics.duration;
        
        exitPageStats.set(exitPage, exitData);
      }
    });

    // Convert to arrays and sort
    const commonPaths = Array.from(pathFrequency.entries())
      .map(([path, data]) => ({
        path: path.split(' -> '),
        frequency: data.count,
        conversionRate: data.count > 0 ? (data.conversions / data.count) * 100 : 0,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    const entryPages = Array.from(entryPageStats.entries())
      .map(([page, data]) => ({
        page,
        visitors: data.visitors,
        conversionRate: data.visitors > 0 ? (data.conversions / data.visitors) * 100 : 0,
        bounceRate: data.visitors > 0 ? (data.bounces / data.visitors) * 100 : 0
      }))
      .sort((a, b) => b.visitors - a.visitors);

    const exitPages = Array.from(exitPageStats.entries())
      .map(([page, data]) => ({
        page,
        exits: data.exits,
        exitRate: 0, // Would need total page views to calculate
        averageTimeBeforeExit: data.exits > 0 ? data.totalTimeBeforeExit / data.exits : 0
      }))
      .sort((a, b) => b.exits - a.exits);

    return {
      commonPaths,
      entryPages,
      exitPages
    };
  }

  /**
   * Segment journeys by traffic source and behavior
   */
  async segmentJourneys(
    timeRange: { start: Date; end: Date },
    segmentDefinitions: Array<{
      name: string;
      criteria: SegmentCriteria;
    }>
  ): Promise<JourneySegmentation> {
    const allJourneys = await UserJourneysService.getJourneysByTimeRange(
      timeRange.start,
      timeRange.end
    );

    const segments = segmentDefinitions.map(segmentDef => {
      const matchingJourneys = allJourneys.filter(journey => 
        this.matchesSegmentCriteria(journey, segmentDef.criteria)
      );

      const conversions = matchingJourneys.filter(j => j.outcome.type === 'conversion').length;
      const totalDuration = matchingJourneys.reduce((sum, j) => sum + j.metrics.duration, 0);
      
      // Analyze page frequency
      const pageFrequency = new Map<string, number>();
      matchingJourneys.forEach(journey => {
        journey.path.forEach(step => {
          pageFrequency.set(step.page, (pageFrequency.get(step.page) || 0) + 1);
        });
      });

      const topPages = Array.from(pageFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([page]) => page);

      // Identify behavior patterns
      const behaviorPatterns = this.identifyBehaviorPatterns(matchingJourneys);

      return {
        name: segmentDef.name,
        criteria: segmentDef.criteria,
        journeyCount: matchingJourneys.length,
        conversionRate: matchingJourneys.length > 0 ? (conversions / matchingJourneys.length) * 100 : 0,
        averageDuration: matchingJourneys.length > 0 ? totalDuration / matchingJourneys.length : 0,
        topPages,
        behaviorPatterns
      };
    });

    return { segments };
  }

  /**
   * Perform journey outcome attribution
   */
  async performJourneyAttribution(
    journeyId: string,
    attributionModel: AttributionModel['name'] = 'last_touch'
  ): Promise<JourneyOutcomeAttribution | null> {
    // This would typically fetch the journey from Firestore
    // For now, we'll create a mock implementation
    
    const model = this.attributionModels.get(attributionModel);
    if (!model) {
      throw new Error(`Attribution model ${attributionModel} not found`);
    }

    // Mock touchpoints - in real implementation, this would come from the journey data
    const touchpoints: TouchPoint[] = [
      {
        source: {
          id: 'google_organic',
          category: 'organic',
          source: 'Google',
          medium: 'organic',
          isAuthentic: true,
          confidence: 95,
          detectedAt: new Date()
        },
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        page: '/',
        weight: 0,
        conversionContribution: 0
      }
    ];

    // Apply attribution model weighting
    const weightedTouchpoints = model.weightingFunction(touchpoints);

    // Identify primary attribution and assisting channels
    const primaryAttribution = weightedTouchpoints.reduce((prev, current) => 
      current.weight > prev.weight ? current : prev
    ).source;

    const assistingChannels = weightedTouchpoints
      .filter(tp => tp.source.id !== primaryAttribution.id)
      .map(tp => tp.source);

    return {
      journeyId,
      outcome: 'conversion', // This would come from actual journey data
      attributionModel,
      touchpoints: weightedTouchpoints,
      primaryAttribution,
      assistingChannels,
      conversionValue: 100 // This would come from actual conversion data
    };
  }

  /**
   * Initialize attribution models
   */
  private initializeAttributionModels(): void {
    // First Touch Attribution
    this.attributionModels.set('first_touch', {
      name: 'first_touch',
      description: 'Gives 100% credit to the first touchpoint',
      weightingFunction: (touchpoints: TouchPoint[]) => {
        return touchpoints.map((tp, index) => ({
          ...tp,
          weight: index === 0 ? 1 : 0
        }));
      }
    });

    // Last Touch Attribution
    this.attributionModels.set('last_touch', {
      name: 'last_touch',
      description: 'Gives 100% credit to the last touchpoint',
      weightingFunction: (touchpoints: TouchPoint[]) => {
        return touchpoints.map((tp, index) => ({
          ...tp,
          weight: index === touchpoints.length - 1 ? 1 : 0
        }));
      }
    });

    // Linear Attribution
    this.attributionModels.set('linear', {
      name: 'linear',
      description: 'Distributes credit equally across all touchpoints',
      weightingFunction: (touchpoints: TouchPoint[]) => {
        const weight = 1 / touchpoints.length;
        return touchpoints.map(tp => ({
          ...tp,
          weight
        }));
      }
    });

    // Time Decay Attribution
    this.attributionModels.set('time_decay', {
      name: 'time_decay',
      description: 'Gives more credit to touchpoints closer to conversion',
      weightingFunction: (touchpoints: TouchPoint[]) => {
        const totalWeight = touchpoints.reduce((sum, _, index) => sum + Math.pow(2, index), 0);
        return touchpoints.map((tp, index) => ({
          ...tp,
          weight: Math.pow(2, index) / totalWeight
        }));
      }
    });

    // Position Based Attribution
    this.attributionModels.set('position_based', {
      name: 'position_based',
      description: '40% first, 40% last, 20% distributed among middle touchpoints',
      weightingFunction: (touchpoints: TouchPoint[]) => {
        if (touchpoints.length === 1) {
          return touchpoints.map(tp => ({ ...tp, weight: 1 }));
        }
        
        return touchpoints.map((tp, index) => {
          let weight = 0;
          if (index === 0) weight = 0.4;
          else if (index === touchpoints.length - 1) weight = 0.4;
          else weight = 0.2 / (touchpoints.length - 2);
          
          return { ...tp, weight };
        });
      }
    });
  }

  /**
   * Map journey steps to funnel steps
   */
  private mapJourneyToFunnelSteps(
    journey: UserJourneyDocument,
    funnelSteps: FunnelStep[]
  ): typeof journey.path {
    return journey.path.filter(step => 
      funnelSteps.some(funnelStep => 
        this.matchesPattern(step.page, funnelStep.pagePattern)
      )
    );
  }

  /**
   * Check if page matches pattern
   */
  private matchesPattern(page: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return page.includes(pattern);
    }
    return pattern.test(page);
  }

  /**
   * Identify drop-off points in funnel
   */
  private identifyDropOffPoints(
    funnelSteps: FunnelStep[],
    journeys: UserJourneyDocument[]
  ): DropOffPoint[] {
    const dropOffPoints: DropOffPoint[] = [];

    for (let i = 0; i < funnelSteps.length - 1; i++) {
      const currentStep = funnelSteps[i];
      const nextStep = funnelSteps[i + 1];
      
      const dropOffCount = currentStep.visitors - nextStep.visitors;
      const dropOffRate = currentStep.visitors > 0 ? (dropOffCount / currentStep.visitors) * 100 : 0;

      if (dropOffRate > 10) { // Only include significant drop-offs
        dropOffPoints.push({
          fromStep: currentStep.name,
          toStep: nextStep.name,
          dropOffCount,
          dropOffRate,
          commonReasons: this.analyzeDropOffReasons(journeys, currentStep, nextStep),
          optimizationSuggestions: this.generateOptimizationSuggestions(dropOffRate, currentStep)
        });
      }
    }

    return dropOffPoints;
  }

  /**
   * Analyze reasons for drop-off
   */
  private analyzeDropOffReasons(
    journeys: UserJourneyDocument[],
    currentStep: FunnelStep,
    nextStep: FunnelStep
  ): string[] {
    const reasons: string[] = [];

    // Analyze journeys that reached current step but not next step
    const dropOffJourneys = journeys.filter(journey => {
      const reachedCurrent = journey.path.some(step => 
        this.matchesPattern(step.page, currentStep.pagePattern)
      );
      const reachedNext = journey.path.some(step => 
        this.matchesPattern(step.page, nextStep.pagePattern)
      );
      return reachedCurrent && !reachedNext;
    });

    // Common patterns in drop-off journeys
    const avgTimeSpent = dropOffJourneys.reduce((sum, j) => sum + j.metrics.duration, 0) / dropOffJourneys.length;
    const avgInteractions = dropOffJourneys.reduce((sum, j) => sum + j.metrics.interactionCount, 0) / dropOffJourneys.length;

    if (avgTimeSpent < 30000) reasons.push('Short time spent on page');
    if (avgInteractions < 2) reasons.push('Low interaction rate');
    
    const highBounceRate = dropOffJourneys.filter(j => j.outcome.type === 'bounce').length / dropOffJourneys.length;
    if (highBounceRate > 0.5) reasons.push('High bounce rate');

    return reasons;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(dropOffRate: number, step: FunnelStep): string[] {
    const suggestions: string[] = [];

    if (dropOffRate > 50) {
      suggestions.push('Critical drop-off point - review page content and user experience');
      suggestions.push('Consider A/B testing different page layouts');
    }

    if (step.averageTimeSpent < 30000) {
      suggestions.push('Users spend little time on this page - improve content engagement');
    }

    if (step.name.toLowerCase().includes('form')) {
      suggestions.push('Simplify form fields and reduce friction');
      suggestions.push('Add progress indicators and clear value propositions');
    }

    return suggestions;
  }

  /**
   * Check if journey matches segment criteria
   */
  private matchesSegmentCriteria(journey: UserJourneyDocument, criteria: SegmentCriteria): boolean {
    // Traffic source filter
    if (criteria.trafficSource && !criteria.trafficSource.includes(journey.entry.source.source)) {
      return false;
    }

    // Time range filter
    if (criteria.timeRange) {
      const journeyTime = journey.startTime.getTime();
      if (journeyTime < criteria.timeRange.start.getTime() || journeyTime > criteria.timeRange.end.getTime()) {
        return false;
      }
    }

    // Page count filter
    if (criteria.pageCount) {
      if (criteria.pageCount.min && journey.metrics.pageCount < criteria.pageCount.min) return false;
      if (criteria.pageCount.max && journey.metrics.pageCount > criteria.pageCount.max) return false;
    }

    // Duration filter
    if (criteria.duration) {
      if (criteria.duration.min && journey.metrics.duration < criteria.duration.min) return false;
      if (criteria.duration.max && journey.metrics.duration > criteria.duration.max) return false;
    }

    // Engagement score filter
    if (criteria.engagementScore) {
      if (criteria.engagementScore.min && journey.metrics.engagementScore < criteria.engagementScore.min) return false;
      if (criteria.engagementScore.max && journey.metrics.engagementScore > criteria.engagementScore.max) return false;
    }

    return true;
  }

  /**
   * Identify behavior patterns in journeys
   */
  private identifyBehaviorPatterns(journeys: UserJourneyDocument[]): string[] {
    const patterns: string[] = [];

    const avgPageCount = journeys.reduce((sum, j) => sum + j.metrics.pageCount, 0) / journeys.length;
    const avgDuration = journeys.reduce((sum, j) => sum + j.metrics.duration, 0) / journeys.length;
    const avgEngagement = journeys.reduce((sum, j) => sum + j.metrics.engagementScore, 0) / journeys.length;

    if (avgPageCount > 5) patterns.push('High page exploration');
    if (avgDuration > 300000) patterns.push('Long session duration'); // 5 minutes
    if (avgEngagement > 70) patterns.push('High engagement');

    const conversionRate = journeys.filter(j => j.outcome.type === 'conversion').length / journeys.length;
    if (conversionRate > 0.1) patterns.push('High conversion tendency');

    const bounceRate = journeys.filter(j => j.outcome.type === 'bounce').length / journeys.length;
    if (bounceRate > 0.7) patterns.push('High bounce tendency');

    return patterns;
  }
}