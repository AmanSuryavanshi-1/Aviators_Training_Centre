// CTA Template Types
export interface CTAButton {
  text: string;
  action: 'course-page' | 'contact-form' | 'demo-booking' | 'phone-call' | 'whatsapp' | 'external-link' | 'download';
  style: 'primary' | 'secondary' | 'urgent' | 'success' | 'warning' | 'outline' | 'ghost' | 'link';
  targetUrl?: string;
}

export interface CTAUrgencyElements {
  enableCountdown?: boolean;
  countdownDuration?: number;
  countdownEndTime?: string; // ISO date string
  limitedOffer?: string;
  socialProof?: string;
  urgencyMessage?: string;
  enableSeatCounter?: boolean;
  totalSeats?: number;
  availableSeats?: number;
  enableBatchDeadline?: boolean;
  batchStartDate?: string; // ISO date string
  enrollmentDeadline?: string; // ISO date string
  batchName?: string;
  enableEarlyBird?: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountEndDate?: string; // ISO date string
  urgencyLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface CTAPositioning {
  allowedPositions: ('top' | 'middle' | 'bottom' | 'sidebar' | 'floating')[];
  preferredPosition?: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  excludePositions?: ('top' | 'middle' | 'bottom' | 'sidebar' | 'floating')[];
}

export interface CTADisplayRules {
  deviceTypes: ('desktop' | 'tablet' | 'mobile')[];
  timeOfDay?: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
  userBehavior?: {
    scrollPercentage?: number;
    timeOnPage?: number;
    exitIntent?: boolean;
  };
}

export interface CTAVariant {
  name: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  weight: number;
}

export interface CTATemplate {
  _id: string;
  _type: 'ctaTemplate';
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: {
    current: string;
  };
  category: 'course-enrollment' | 'consultation' | 'demo-booking' | 'contact-form' | 'resource-download' | 'newsletter' | 'callback' | 'emergency';
  ctaType: 'course-promo' | 'lead-gen' | 'info-request' | 'direct-contact' | 'resource-access';
  style: 'card' | 'banner' | 'inline' | 'minimal' | 'gradient' | 'testimonial' | 'floating' | 'sidebar';
  title: string;
  description: string;
  primaryButton: CTAButton;
  secondaryButton?: CTAButton;
  urgencyElements?: CTAUrgencyElements;
  targetCourse?: {
    _id: string;
    name: string;
    slug: { current: string };
    category: string;
    description?: string;
    shortDescription?: string;
    targetUrl?: string;
    keywords?: string[];
    ctaSettings?: any;
    active?: boolean;
  };
  targetAudience?: ('aspiring-pilots' | 'student-pilots' | 'licensed-pilots' | 'career-changers' | 'fresh-graduates' | 'working-professionals' | 'international-students')[];
  keywords?: string[];
  conversionGoal: 'enrollment' | 'lead-gen' | 'demo' | 'consultation' | 'info' | 'contact' | 'call' | 'download';
  priority: number;
  abTestVariants?: CTAVariant[];
  positioning: CTAPositioning;
  displayRules: CTADisplayRules;
  customCSS?: string;
  active: boolean;
  version: string;
  notes?: string;
}

export interface CTATemplateCreateInput {
  name: string;
  slug?: {
    current: string;
  };
  category: CTATemplate['category'];
  ctaType: CTATemplate['ctaType'];
  style: CTATemplate['style'];
  title: string;
  description: string;
  primaryButton: CTAButton;
  secondaryButton?: CTAButton;
  urgencyElements?: CTAUrgencyElements;
  targetCourse?: string; // Reference ID
  targetAudience?: CTATemplate['targetAudience'];
  keywords?: string[];
  conversionGoal: CTATemplate['conversionGoal'];
  priority?: number;
  abTestVariants?: CTAVariant[];
  positioning?: CTAPositioning;
  displayRules?: CTADisplayRules;
  customCSS?: string;
  active?: boolean;
  version?: string;
  notes?: string;
}

export interface CTATemplateUpdateInput extends Partial<CTATemplateCreateInput> {
  _id?: string;
  _type?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

// CTA Performance Types
export interface CTAMetrics {
  ctr?: number; // Click-through rate
  conversionRate?: number;
  revenuePerClick?: number;
  costPerConversion?: number;
  roi?: number;
}

export interface CTADevicePerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr?: number;
}

export interface CTADeviceBreakdown {
  desktop: CTADevicePerformance;
  tablet: CTADevicePerformance;
  mobile: CTADevicePerformance;
}

export interface CTAHourlyPerformance {
  hour: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface CTADailyPerformance {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface CTATimeBasedMetrics {
  hourlyPerformance?: CTAHourlyPerformance[];
  dailyPerformance?: CTADailyPerformance[];
}

export interface CTAUserBehaviorMetrics {
  averageTimeToClick?: number;
  scrollDepthAtClick?: number;
  bounceRateAfterClick?: number;
  returnVisitorRate?: number;
}

export interface CTALeadQualityMetrics {
  leadScore?: number;
  qualifiedLeads?: number;
  salesConversions?: number;
  averageDealValue?: number;
  salesCycleLength?: number;
}

export interface CTACompetitorAnalysis {
  competitor: string;
  ctaType: string;
  estimatedCTR: number;
  notes?: string;
}

export interface CTACompetitorComparison {
  industryBenchmarkCTR?: number;
  performanceVsBenchmark?: number;
  competitorCTAs?: CTACompetitorAnalysis[];
}

export interface CTAOptimizationSuggestion {
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact?: number;
  implementationEffort?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
}

export interface CTAPerformance {
  _id: string;
  _type: 'ctaPerformance';
  _createdAt: string;
  _updatedAt: string;
  ctaTemplate: {
    _ref: string;
    name?: string;
  };
  blogPost: {
    _ref: string;
    title?: string;
    slug?: { current: string };
  };
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  variant?: string;
  testId?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  metrics?: CTAMetrics;
  deviceBreakdown?: CTADeviceBreakdown;
  timeBasedMetrics?: CTATimeBasedMetrics;
  userBehaviorMetrics?: CTAUserBehaviorMetrics;
  leadQualityMetrics?: CTALeadQualityMetrics;
  competitorComparison?: CTACompetitorComparison;
  optimizationSuggestions?: CTAOptimizationSuggestion[];
  notes?: string;
  lastUpdated: string;
}

// CTA Interaction Types
export interface CTAInteractionEvent {
  ctaId: string;
  blogPostId: string;
  blogPostSlug: string;
  ctaType: string;
  ctaPosition: string;
  targetCourse?: string;
  action: 'impression' | 'click' | 'conversion';
  variant?: string;
  testId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  userAgent?: string;
  referrer?: string;
}

// CTA Routing Types
export interface CTARoutingContext {
  blogPost: {
    _id: string;
    title: string;
    category: { title: string };
    tags?: string[];
    excerpt?: string;
    seoEnhancement?: {
      focusKeyword?: string;
      additionalKeywords?: string[];
    };
  };
  userBehavior?: {
    timeOnPage?: number;
    scrollDepth?: number;
    previousPages?: string[];
    deviceType?: 'desktop' | 'tablet' | 'mobile';
  };
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  conversionHistory?: any[];
}

export interface CTARecommendation {
  template: CTATemplate;
  score: number;
  reason: string;
  confidence: number;
}

// A/B Testing Types
export interface ABTestConfig {
  testId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  trafficSplit: number; // Percentage of traffic for test variant
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    control: CTATemplate;
    test: CTATemplate;
  };
  successMetric: 'ctr' | 'conversions' | 'revenue';
  minimumSampleSize: number;
  confidenceLevel: number;
}

export interface ABTestResult {
  testId: string;
  variant: 'control' | 'test';
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  statisticalSignificance: number;
  winner?: 'control' | 'test' | 'inconclusive';
}

// CTA Analytics Types
export interface CTAAnalyticsQuery {
  templateIds?: string[];
  blogPostIds?: string[];
  positions?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  groupBy?: 'template' | 'position' | 'blogPost' | 'date' | 'device';
  metrics?: ('impressions' | 'clicks' | 'conversions' | 'revenue' | 'ctr' | 'conversionRate')[];
}

export interface CTAAnalyticsResult {
  groupKey: string;
  groupValue: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// CTA Management API Response Types
export interface CTATemplateResponse {
  success: boolean;
  data?: CTATemplate | CTATemplate[];
  error?: string;
  details?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CTAPerformanceResponse {
  success: boolean;
  data?: CTAPerformance | CTAPerformance[];
  error?: string;
  details?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// CTA Component Props Types
export interface CTAComponentProps {
  template: CTATemplate;
  blogPost: any;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  variant?: string;
  testId?: string;
  className?: string;
  onInteraction?: (event: CTAInteractionEvent) => void;
}

// CTA Manager Types
export interface CTAManagerConfig {
  enableABTesting: boolean;
  enableAnalytics: boolean;
  defaultFallback: CTATemplate;
  cacheTTL: number;
  debugMode: boolean;
}

export interface CTASelectionOptions {
  fallbackToDefault?: boolean;
  useCache?: boolean;
  debugMode?: boolean;
  maxRecommendations?: number;
}

// Export all types for easy importing
export type {
  CTATemplate as default,
};