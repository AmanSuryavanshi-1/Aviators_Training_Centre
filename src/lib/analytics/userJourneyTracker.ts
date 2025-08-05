// Comprehensive User Journey Tracking System

import { UserJourneyDocument, JourneyStep, TrafficSource, UTMParameters } from '../firebase/types';
import { UserJourneysService } from '../firebase/collections';
import { TrafficSourceTracker } from './trafficSourceTracker';

export interface JourneyInteractionEvent {
  type: 'click' | 'scroll' | 'form_interaction' | 'content_engagement' | 'video_play' | 'download' | 'external_link';
  element: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
  timestamp: Date;
  coordinates?: { x: number; y: number };
  value?: string | number;
}

export interface PageVisitData {
  url: string;
  title: string;
  path: string;
  category: 'blog' | 'home' | 'contact' | 'courses' | 'about';
  entryTime: Date;
  exitTime?: Date;
  timeSpent: number;
  scrollDepth: number;
  maxScrollDepth: number;
  interactions: JourneyInteractionEvent[];
  referrer: string;
  isEntryPoint: boolean;
  isExitPoint: boolean;
}

export interface JourneyOutcome {
  type: 'conversion' | 'bounce' | 'exit' | 'ongoing';
  conversionType?: 'contact_form' | 'newsletter_signup' | 'course_inquiry' | 'phone_call' | 'email_click';
  conversionValue?: number;
  exitPage?: string;
  exitReason?: 'timeout' | 'navigation_away' | 'tab_close' | 'form_completion';
}

export interface JourneyMetrics {
  duration: number; // Total journey time in milliseconds
  pageCount: number;
  interactionCount: number;
  averageScrollDepth: number;
  engagementScore: number; // 0-100 based on interactions and time spent
  bounceRate: number;
  conversionRate: number;
}

export interface ActiveJourney {
  journeyId: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  currentPage: PageVisitData;
  visitedPages: PageVisitData[];
  totalInteractions: number;
  isActive: boolean;
}

export class UserJourneyTracker {
  private activeJourneys: Map<string, ActiveJourney> = new Map();
  private trafficSourceTracker: TrafficSourceTracker;
  private scrollDepthThresholds = [25, 50, 75, 90, 100];
  private engagementTimeThreshold = 30000; // 30 seconds
  private bounceTimeThreshold = 10000; // 10 seconds

  constructor() {
    this.trafficSourceTracker = new TrafficSourceTracker();
    this.setupEventListeners();
  }

  /**
   * Start a new user journey
   */
  async startJourney(
    userId: string,
    sessionId: string,
    entryPageData: {
      url: string;
      title: string;
      path: string;
      category: PageVisitData['category'];
      referrer: string;
      userAgent: string;
    },
    utmParams: UTMParameters = {}
  ): Promise<string> {
    const journeyId = `journey_${userId}_${sessionId}_${Date.now()}`;
    
    // Detect traffic source
    const trafficSourceResult = this.trafficSourceTracker.detectTrafficSource(
      entryPageData.referrer,
      entryPageData.userAgent,
      entryPageData.url,
      utmParams
    );

    // Create initial page visit data
    const initialPageVisit: PageVisitData = {
      url: entryPageData.url,
      title: entryPageData.title,
      path: entryPageData.path,
      category: entryPageData.category,
      entryTime: new Date(),
      timeSpent: 0,
      scrollDepth: 0,
      maxScrollDepth: 0,
      interactions: [],
      referrer: entryPageData.referrer,
      isEntryPoint: true,
      isExitPoint: false
    };

    // Create active journey
    const activeJourney: ActiveJourney = {
      journeyId,
      userId,
      sessionId,
      startTime: new Date(),
      currentPage: initialPageVisit,
      visitedPages: [initialPageVisit],
      totalInteractions: 0,
      isActive: true
    };

    this.activeJourneys.set(journeyId, activeJourney);

    // Create journey document in Firestore
    const journeyDocument: Omit<UserJourneyDocument, 'id'> = {
      userId,
      sessionId,
      startTime: new Date(),
      entry: {
        page: entryPageData.path,
        source: trafficSourceResult.source,
        referrer: entryPageData.referrer,
        utm: utmParams
      },
      path: [this.convertToJourneyStep(initialPageVisit, 1)],
      outcome: {
        type: 'ongoing'
      },
      metrics: {
        duration: 0,
        pageCount: 1,
        interactionCount: 0,
        averageScrollDepth: 0,
        engagementScore: 0
      },
      attribution: {
        firstTouch: trafficSourceResult.source,
        lastTouch: trafficSourceResult.source,
        assistingChannels: []
      }
    };

    await UserJourneysService.createJourney(journeyDocument);

    return journeyId;
  }

  /**
   * Track page visit within existing journey
   */
  async trackPageVisit(
    journeyId: string,
    pageData: {
      url: string;
      title: string;
      path: string;
      category: PageVisitData['category'];
      referrer: string;
    }
  ): Promise<void> {
    const activeJourney = this.activeJourneys.get(journeyId);
    if (!activeJourney || !activeJourney.isActive) {
      console.warn(`Journey ${journeyId} not found or inactive`);
      return;
    }

    // End current page visit
    if (activeJourney.currentPage) {
      activeJourney.currentPage.exitTime = new Date();
      activeJourney.currentPage.timeSpent = 
        activeJourney.currentPage.exitTime.getTime() - activeJourney.currentPage.entryTime.getTime();
    }

    // Create new page visit
    const newPageVisit: PageVisitData = {
      url: pageData.url,
      title: pageData.title,
      path: pageData.path,
      category: pageData.category,
      entryTime: new Date(),
      timeSpent: 0,
      scrollDepth: 0,
      maxScrollDepth: 0,
      interactions: [],
      referrer: pageData.referrer,
      isEntryPoint: false,
      isExitPoint: false
    };

    activeJourney.currentPage = newPageVisit;
    activeJourney.visitedPages.push(newPageVisit);

    // Update journey in Firestore
    await this.updateJourneyInFirestore(journeyId, activeJourney);
  }

  /**
   * Track scroll depth for current page
   */
  trackScrollDepth(journeyId: string, scrollPercentage: number): void {
    const activeJourney = this.activeJourneys.get(journeyId);
    if (!activeJourney || !activeJourney.currentPage) return;

    activeJourney.currentPage.scrollDepth = scrollPercentage;
    activeJourney.currentPage.maxScrollDepth = Math.max(
      activeJourney.currentPage.maxScrollDepth,
      scrollPercentage
    );

    // Track scroll milestones
    this.scrollDepthThresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && 
          !activeJourney.currentPage.interactions.some(
            i => i.type === 'scroll' && i.value === threshold
          )) {
        this.trackInteraction(journeyId, {
          type: 'scroll',
          element: 'page',
          timestamp: new Date(),
          value: threshold
        });
      }
    });
  }

  /**
   * Track user interaction event
   */
  trackInteraction(journeyId: string, interaction: JourneyInteractionEvent): void {
    const activeJourney = this.activeJourneys.get(journeyId);
    if (!activeJourney || !activeJourney.currentPage) return;

    activeJourney.currentPage.interactions.push(interaction);
    activeJourney.totalInteractions++;

    // Update engagement score based on interaction
    this.updateEngagementScore(activeJourney);
  }

  /**
   * Track time spent on current page
   */
  updateTimeSpent(journeyId: string): void {
    const activeJourney = this.activeJourneys.get(journeyId);
    if (!activeJourney || !activeJourney.currentPage) return;

    const currentTime = new Date();
    activeJourney.currentPage.timeSpent = 
      currentTime.getTime() - activeJourney.currentPage.entryTime.getTime();
  }

  /**
   * Complete journey with outcome
   */
  async completeJourney(
    journeyId: string,
    outcome: JourneyOutcome
  ): Promise<void> {
    const activeJourney = this.activeJourneys.get(journeyId);
    if (!activeJourney) return;

    // Mark current page as exit point
    if (activeJourney.currentPage) {
      activeJourney.currentPage.isExitPoint = true;
      activeJourney.currentPage.exitTime = new Date();
      activeJourney.currentPage.timeSpent = 
        activeJourney.currentPage.exitTime.getTime() - activeJourney.currentPage.entryTime.getTime();
    }

    // Calculate final metrics
    const metrics = this.calculateJourneyMetrics(activeJourney);

    // Update journey in Firestore with completion data
    const journeyUpdate: Partial<UserJourneyDocument> = {
      endTime: new Date(),
      path: activeJourney.visitedPages.map((page, index) => 
        this.convertToJourneyStep(page, index + 1)
      ),
      outcome,
      metrics
    };

    await UserJourneysService.updateJourney(journeyId, journeyUpdate);

    // Mark journey as inactive and remove from active journeys
    activeJourney.isActive = false;
    this.activeJourneys.delete(journeyId);
  }

  /**
   * Get active journey data
   */
  getActiveJourney(journeyId: string): ActiveJourney | null {
    return this.activeJourneys.get(journeyId) || null;
  }

  /**
   * Get all active journeys for a user
   */
  getUserActiveJourneys(userId: string): ActiveJourney[] {
    return Array.from(this.activeJourneys.values())
      .filter(journey => journey.userId === userId && journey.isActive);
  }

  /**
   * Auto-complete stale journeys
   */
  async cleanupStaleJourneys(maxAge: number = 1800000): Promise<void> { // 30 minutes
    const now = new Date();
    const staleJourneys: string[] = [];

    this.activeJourneys.forEach((journey, journeyId) => {
      const age = now.getTime() - journey.startTime.getTime();
      if (age > maxAge) {
        staleJourneys.push(journeyId);
      }
    });

    // Complete stale journeys
    for (const journeyId of staleJourneys) {
      await this.completeJourney(journeyId, {
        type: 'exit',
        exitReason: 'timeout'
      });
    }
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return; // Server-side check

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched tabs or minimized window
        this.activeJourneys.forEach((journey, journeyId) => {
          this.updateTimeSpent(journeyId);
        });
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.activeJourneys.forEach((journey, journeyId) => {
        this.completeJourney(journeyId, {
          type: 'exit',
          exitReason: 'navigation_away'
        });
      });
    });

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = this.calculateScrollPercentage();
        this.activeJourneys.forEach((journey, journeyId) => {
          this.trackScrollDepth(journeyId, scrollPercentage);
        });
      }, 100);
    });

    // Track click events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const interaction: JourneyInteractionEvent = {
        type: 'click',
        element: target.tagName.toLowerCase(),
        elementId: target.id,
        elementClass: target.className,
        elementText: target.textContent?.substring(0, 100),
        timestamp: new Date(),
        coordinates: { x: event.clientX, y: event.clientY }
      };

      this.activeJourneys.forEach((journey, journeyId) => {
        this.trackInteraction(journeyId, interaction);
      });
    });

    // Track form interactions
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const interaction: JourneyInteractionEvent = {
          type: 'form_interaction',
          element: target.tagName.toLowerCase(),
          elementId: target.id,
          elementClass: target.className,
          timestamp: new Date(),
          value: target.type === 'password' ? '[password]' : target.value.substring(0, 50)
        };

        this.activeJourneys.forEach((journey, journeyId) => {
          this.trackInteraction(journeyId, interaction);
        });
      }
    });
  }

  /**
   * Calculate scroll percentage
   */
  private calculateScrollPercentage(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
  }

  /**
   * Convert page visit data to journey step
   */
  private convertToJourneyStep(pageVisit: PageVisitData, stepNumber: number): JourneyStep {
    return {
      stepNumber,
      page: pageVisit.path,
      title: pageVisit.title,
      timestamp: pageVisit.entryTime,
      timeSpent: pageVisit.timeSpent,
      scrollDepth: pageVisit.maxScrollDepth,
      interactions: pageVisit.interactions.map(i => i.type),
      exitPoint: pageVisit.isExitPoint
    };
  }

  /**
   * Calculate journey metrics
   */
  private calculateJourneyMetrics(journey: ActiveJourney): JourneyMetrics {
    const totalDuration = new Date().getTime() - journey.startTime.getTime();
    const pageCount = journey.visitedPages.length;
    const interactionCount = journey.totalInteractions;
    
    // Calculate average scroll depth
    const totalScrollDepth = journey.visitedPages.reduce(
      (sum, page) => sum + page.maxScrollDepth, 0
    );
    const averageScrollDepth = pageCount > 0 ? totalScrollDepth / pageCount : 0;

    // Calculate engagement score (0-100)
    const engagementScore = this.calculateEngagementScore(journey);

    // Calculate bounce rate (1 if bounced, 0 if not)
    const bounceRate = this.isBounce(journey) ? 1 : 0;

    // Calculate conversion rate (1 if converted, 0 if not)
    const conversionRate = this.hasConverted(journey) ? 1 : 0;

    return {
      duration: totalDuration,
      pageCount,
      interactionCount,
      averageScrollDepth,
      engagementScore,
      bounceRate,
      conversionRate
    };
  }

  /**
   * Calculate engagement score based on user behavior
   */
  private calculateEngagementScore(journey: ActiveJourney): number {
    let score = 0;

    // Time-based scoring (max 30 points)
    const totalTime = new Date().getTime() - journey.startTime.getTime();
    score += Math.min(totalTime / this.engagementTimeThreshold * 30, 30);

    // Page count scoring (max 25 points)
    score += Math.min(journey.visitedPages.length * 5, 25);

    // Interaction scoring (max 25 points)
    score += Math.min(journey.totalInteractions * 2, 25);

    // Scroll depth scoring (max 20 points)
    const avgScrollDepth = journey.visitedPages.reduce(
      (sum, page) => sum + page.maxScrollDepth, 0
    ) / journey.visitedPages.length;
    score += (avgScrollDepth / 100) * 20;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Update engagement score for active journey
   */
  private updateEngagementScore(journey: ActiveJourney): void {
    // This could trigger real-time updates if needed
    const currentScore = this.calculateEngagementScore(journey);
    // Store or emit the updated score as needed
  }

  /**
   * Determine if journey is a bounce
   */
  private isBounce(journey: ActiveJourney): boolean {
    // Bounce if only one page visited and time spent is less than threshold
    if (journey.visitedPages.length === 1) {
      const timeSpent = new Date().getTime() - journey.startTime.getTime();
      return timeSpent < this.bounceTimeThreshold && journey.totalInteractions < 2;
    }
    return false;
  }

  /**
   * Determine if journey has converted
   */
  private hasConverted(journey: ActiveJourney): boolean {
    // Check if any page has conversion-related interactions
    return journey.visitedPages.some(page => 
      page.interactions.some(interaction => 
        interaction.type === 'form_interaction' && 
        (interaction.elementId?.includes('contact') || 
         interaction.elementId?.includes('signup') ||
         interaction.elementClass?.includes('contact') ||
         interaction.elementClass?.includes('signup'))
      )
    );
  }

  /**
   * Update journey in Firestore
   */
  private async updateJourneyInFirestore(journeyId: string, journey: ActiveJourney): Promise<void> {
    try {
      const metrics = this.calculateJourneyMetrics(journey);
      const journeyUpdate: Partial<UserJourneyDocument> = {
        path: journey.visitedPages.map((page, index) => 
          this.convertToJourneyStep(page, index + 1)
        ),
        metrics
      };

      await UserJourneysService.updateJourney(journeyId, journeyUpdate);
    } catch (error) {
      console.error('Error updating journey in Firestore:', error);
    }
  }

  /**
   * Get journey analytics for a specific journey
   */
  async getJourneyAnalytics(journeyId: string): Promise<{
    journey: ActiveJourney | null;
    metrics: JourneyMetrics;
    insights: {
      isHighEngagement: boolean;
      isBounce: boolean;
      hasConverted: boolean;
      topInteractions: string[];
      timeSpentPerPage: Array<{ page: string; time: number }>;
    };
  }> {
    const journey = this.activeJourneys.get(journeyId);
    
    if (!journey) {
      return {
        journey: null,
        metrics: {
          duration: 0,
          pageCount: 0,
          interactionCount: 0,
          averageScrollDepth: 0,
          engagementScore: 0,
          bounceRate: 0,
          conversionRate: 0
        },
        insights: {
          isHighEngagement: false,
          isBounce: false,
          hasConverted: false,
          topInteractions: [],
          timeSpentPerPage: []
        }
      };
    }

    const metrics = this.calculateJourneyMetrics(journey);
    
    // Calculate insights
    const allInteractions = journey.visitedPages.flatMap(page => page.interactions);
    const interactionCounts = allInteractions.reduce((acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topInteractions = Object.entries(interactionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    const timeSpentPerPage = journey.visitedPages.map(page => ({
      page: page.path,
      time: page.timeSpent
    }));

    return {
      journey,
      metrics,
      insights: {
        isHighEngagement: metrics.engagementScore > 70,
        isBounce: this.isBounce(journey),
        hasConverted: this.hasConverted(journey),
        topInteractions,
        timeSpentPerPage
      }
    };
  }
}