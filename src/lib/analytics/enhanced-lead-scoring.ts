// Enhanced Lead Scoring & Qualification Engine
// This module provides advanced lead scoring with demographic, behavioral, and intent-based analysis

export interface LeadProfile {
  id: string;
  userId: string;
  sessionId: string;
  email?: string;
  phone?: string;
  name?: string;
  
  // Demographic data
  demographics: {
    age?: number;
    location?: string;
    education?: 'high_school' | 'bachelor' | 'master' | 'phd' | 'other';
    experience?: 'none' | 'student' | '0-2_years' | '3-5_years' | '5+_years';
    currentRole?: string;
    industry?: string;
    income?: 'below_5L' | '5L-10L' | '10L-20L' | '20L-50L' | 'above_50L';
  };
  
  // Behavioral data
  behavior: {
    pageViews: number;
    blogPostsRead: string[];
    timeOnSite: number; // in seconds
    sessionCount: number;
    ctaClicks: number;
    formInteractions: number;
    downloadCount: number;
    videoWatches: number;
    socialShares: number;
    returnVisitor: boolean;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    trafficSource: 'organic' | 'direct' | 'social' | 'email' | 'paid' | 'referral';
    averageScrollDepth: number;
    bounceRate: number;
  };
  
  // Intent signals
  intent: {
    courseInterest: string[];
    urgency: 'immediate' | 'within_3_months' | 'within_6_months' | 'exploring';
    budget: 'budget_conscious' | 'moderate' | 'premium' | 'no_constraint';
    timeline: 'asap' | 'planned' | 'flexible';
    specificQuestions: string[];
    comparisonShopping: boolean;
    priceInquiries: number;
    brochureDownloads: number;
    consultationRequests: number;
    demoRequests: number;
  };
  
  // Engagement quality
  engagement: {
    qualityScore: number; // 0-100
    engagementDepth: 'surface' | 'moderate' | 'deep';
    contentPreferences: string[];
    interactionPattern: 'researcher' | 'browser' | 'decision_maker' | 'influencer';
    communicationPreference: 'email' | 'phone' | 'whatsapp' | 'in_person';
  };
  
  // Lead generation tool interactions
  toolInteractions: {
    quizCompleted: boolean;
    assessmentCompleted: boolean;
    calculatorUsed: boolean;
    eligibilityChecked: boolean;
    toolResults: Record<string, any>;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadScore {
  totalScore: number; // 0-1000
  quality: 'hot' | 'warm' | 'cold' | 'unqualified';
  confidence: number; // 0-100
  
  // Component scores
  scores: {
    demographic: number; // 0-200
    behavioral: number; // 0-300
    intent: number; // 0-400
    engagement: number; // 0-100
  };
  
  // Detailed analysis
  analysis: {
    strengths: string[];
    weaknesses: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  
  // Qualification status
  qualification: {
    isQualified: boolean;
    qualificationReasons: string[];
    disqualificationReasons: string[];
    missingInformation: string[];
  };
  
  // Recommendations
  recommendations: {
    nextActions: string[];
    followUpStrategy: 'immediate' | 'short_term' | 'long_term' | 'nurture';
    priority: 'high' | 'medium' | 'low';
    assignedTo?: string;
    estimatedConversionProbability: number; // 0-100
    estimatedTimeToConversion: number; // in days
    recommendedCourses: string[];
  };
  
  scoredAt: Date;
}

export interface LeadScoringRules {
  demographic: {
    ageOptimal: { min: number; max: number; score: number };
    educationWeights: Record<string, number>;
    experienceWeights: Record<string, number>;
    locationWeights: Record<string, number>;
    incomeWeights: Record<string, number>;
  };
  
  behavioral: {
    pageViewThresholds: { min: number; score: number }[];
    timeOnSiteThresholds: { min: number; score: number }[];
    engagementMultipliers: Record<string, number>;
    trafficSourceWeights: Record<string, number>;
    deviceTypeWeights: Record<string, number>;
  };
  
  intent: {
    urgencyWeights: Record<string, number>;
    budgetWeights: Record<string, number>;
    courseInterestWeights: Record<string, number>;
    actionWeights: Record<string, number>;
  };
  
  engagement: {
    qualityThresholds: { min: number; score: number }[];
    depthWeights: Record<string, number>;
    patternWeights: Record<string, number>;
  };
}

class EnhancedLeadScoringEngine {
  private scoringRules: LeadScoringRules;
  private leadProfiles: Map<string, LeadProfile> = new Map();
  private scoringHistory: Map<string, LeadScore[]> = new Map();

  constructor() {
    this.scoringRules = this.initializeDefaultScoringRules();
  }

  // Initialize default scoring rules
  private initializeDefaultScoringRules(): LeadScoringRules {
    return {
      demographic: {
        ageOptimal: { min: 18, max: 35, score: 50 }, // Optimal age for aviation training
        educationWeights: {
          'high_school': 20,
          'bachelor': 40,
          'master': 35,
          'phd': 25,
          'other': 15
        },
        experienceWeights: {
          'none': 45, // High potential for training
          'student': 40,
          '0-2_years': 35,
          '3-5_years': 25,
          '5+_years': 15
        },
        locationWeights: {
          'Delhi': 40,
          'Mumbai': 40,
          'Bangalore': 35,
          'Pune': 30,
          'Chennai': 30,
          'Hyderabad': 30,
          'Other': 20
        },
        incomeWeights: {
          'below_5L': 10,
          '5L-10L': 25,
          '10L-20L': 40,
          '20L-50L': 45,
          'above_50L': 35
        }
      },
      
      behavioral: {
        pageViewThresholds: [
          { min: 1, score: 20 },
          { min: 3, score: 40 },
          { min: 5, score: 60 },
          { min: 10, score: 80 },
          { min: 15, score: 100 }
        ],
        timeOnSiteThresholds: [
          { min: 60, score: 20 },    // 1 minute
          { min: 300, score: 40 },   // 5 minutes
          { min: 600, score: 60 },   // 10 minutes
          { min: 1200, score: 80 },  // 20 minutes
          { min: 1800, score: 100 }  // 30 minutes
        ],
        engagementMultipliers: {
          'ctaClick': 2.0,
          'formInteraction': 2.5,
          'download': 1.8,
          'videoWatch': 1.5,
          'socialShare': 1.3
        },
        trafficSourceWeights: {
          'organic': 40,
          'direct': 35,
          'referral': 30,
          'social': 25,
          'email': 45,
          'paid': 20
        },
        deviceTypeWeights: {
          'desktop': 40,
          'mobile': 35,
          'tablet': 30
        }
      },
      
      intent: {
        urgencyWeights: {
          'immediate': 100,
          'within_3_months': 80,
          'within_6_months': 60,
          'exploring': 30
        },
        budgetWeights: {
          'no_constraint': 100,
          'premium': 80,
          'moderate': 60,
          'budget_conscious': 40
        },
        courseInterestWeights: {
          'CPL': 90,
          'ATPL': 85,
          'Type Rating': 80,
          'RTR': 70,
          'Interview Prep': 60
        },
        actionWeights: {
          'consultationRequest': 50,
          'demoRequest': 45,
          'brochureDownload': 30,
          'priceInquiry': 40,
          'comparisonShopping': 25
        }
      },
      
      engagement: {
        qualityThresholds: [
          { min: 20, score: 20 },
          { min: 40, score: 40 },
          { min: 60, score: 60 },
          { min: 80, score: 80 },
          { min: 90, score: 100 }
        ],
        depthWeights: {
          'surface': 20,
          'moderate': 60,
          'deep': 100
        },
        patternWeights: {
          'researcher': 80,
          'decision_maker': 100,
          'influencer': 70,
          'browser': 40
        }
      }
    };
  }

  // Create or update lead profile
  async updateLeadProfile(
    userId: string,
    sessionId: string,
    updates: Partial<Omit<LeadProfile, 'id' | 'userId' | 'sessionId' | 'createdAt' | 'updatedAt'>>
  ): Promise<LeadProfile> {
    const existingProfile = this.leadProfiles.get(userId);
    const now = new Date();

    const profile: LeadProfile = {
      id: existingProfile?.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId,
      email: updates.email || existingProfile?.email,
      phone: updates.phone || existingProfile?.phone,
      name: updates.name || existingProfile?.name,
      
      demographics: {
        ...existingProfile?.demographics,
        ...updates.demographics
      },
      
      behavior: {
        pageViews: 0,
        blogPostsRead: [],
        timeOnSite: 0,
        sessionCount: 1,
        ctaClicks: 0,
        formInteractions: 0,
        downloadCount: 0,
        videoWatches: 0,
        socialShares: 0,
        returnVisitor: false,
        deviceType: 'desktop',
        trafficSource: 'direct',
        averageScrollDepth: 0,
        bounceRate: 0,
        ...existingProfile?.behavior,
        ...updates.behavior
      },
      
      intent: {
        courseInterest: [],
        urgency: 'exploring',
        budget: 'moderate',
        timeline: 'flexible',
        specificQuestions: [],
        comparisonShopping: false,
        priceInquiries: 0,
        brochureDownloads: 0,
        consultationRequests: 0,
        demoRequests: 0,
        ...existingProfile?.intent,
        ...updates.intent
      },
      
      engagement: {
        qualityScore: 0,
        engagementDepth: 'surface',
        contentPreferences: [],
        interactionPattern: 'browser',
        communicationPreference: 'email',
        ...existingProfile?.engagement,
        ...updates.engagement
      },
      
      toolInteractions: {
        quizCompleted: false,
        assessmentCompleted: false,
        calculatorUsed: false,
        eligibilityChecked: false,
        toolResults: {},
        ...existingProfile?.toolInteractions,
        ...updates.toolInteractions
      },
      
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now
    };

    // Calculate engagement quality score
    profile.engagement.qualityScore = this.calculateEngagementQuality(profile);
    
    // Determine engagement depth
    profile.engagement.engagementDepth = this.determineEngagementDepth(profile);
    
    // Identify interaction pattern
    profile.engagement.interactionPattern = this.identifyInteractionPattern(profile);

    this.leadProfiles.set(userId, profile);
    
    // Store in database
    await this.storeLeadProfile(profile);
    
    return profile;
  }

  // Calculate comprehensive lead score
  async calculateLeadScore(userId: string): Promise<LeadScore> {
    const profile = this.leadProfiles.get(userId);
    if (!profile) {
      throw new Error(`Lead profile not found for user: ${userId}`);
    }

    const demographicScore = this.calculateDemographicScore(profile);
    const behavioralScore = this.calculateBehavioralScore(profile);
    const intentScore = this.calculateIntentScore(profile);
    const engagementScore = this.calculateEngagementScore(profile);

    const totalScore = demographicScore + behavioralScore + intentScore + engagementScore;
    
    // Determine quality based on total score
    const quality = this.determineLeadQuality(totalScore);
    
    // Calculate confidence based on data completeness
    const confidence = this.calculateScoreConfidence(profile);
    
    // Generate analysis
    const analysis = this.generateLeadAnalysis(profile, {
      demographic: demographicScore,
      behavioral: behavioralScore,
      intent: intentScore,
      engagement: engagementScore
    });
    
    // Determine qualification
    const qualification = this.determineQualification(profile, totalScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(profile, totalScore, quality);

    const leadScore: LeadScore = {
      totalScore,
      quality,
      confidence,
      scores: {
        demographic: demographicScore,
        behavioral: behavioralScore,
        intent: intentScore,
        engagement: engagementScore
      },
      analysis,
      qualification,
      recommendations,
      scoredAt: new Date()
    };

    // Store scoring history
    const history = this.scoringHistory.get(userId) || [];
    history.push(leadScore);
    this.scoringHistory.set(userId, history);
    
    // Store in database
    await this.storeLeadScore(userId, leadScore);
    
    return leadScore;
  }  
// Calculate demographic score (0-200)
  private calculateDemographicScore(profile: LeadProfile): number {
    let score = 0;
    const { demographics } = profile;

    // Age scoring
    if (demographics.age) {
      const { ageOptimal } = this.scoringRules.demographic;
      if (demographics.age >= ageOptimal.min && demographics.age <= ageOptimal.max) {
        score += ageOptimal.score;
      } else {
        // Gradual decrease for ages outside optimal range
        const distance = Math.min(
          Math.abs(demographics.age - ageOptimal.min),
          Math.abs(demographics.age - ageOptimal.max)
        );
        score += Math.max(0, ageOptimal.score - (distance * 2));
      }
    }

    // Education scoring
    if (demographics.education) {
      score += this.scoringRules.demographic.educationWeights[demographics.education] || 0;
    }

    // Experience scoring
    if (demographics.experience) {
      score += this.scoringRules.demographic.experienceWeights[demographics.experience] || 0;
    }

    // Location scoring
    if (demographics.location) {
      score += this.scoringRules.demographic.locationWeights[demographics.location] || 
               this.scoringRules.demographic.locationWeights['Other'];
    }

    // Income scoring
    if (demographics.income) {
      score += this.scoringRules.demographic.incomeWeights[demographics.income] || 0;
    }

    return Math.min(score, 200);
  }

  // Calculate behavioral score (0-300)
  private calculateBehavioralScore(profile: LeadProfile): number {
    let score = 0;
    const { behavior } = profile;

    // Page views scoring
    const pageViewScore = this.getThresholdScore(
      behavior.pageViews,
      this.scoringRules.behavioral.pageViewThresholds
    );
    score += pageViewScore;

    // Time on site scoring
    const timeScore = this.getThresholdScore(
      behavior.timeOnSite,
      this.scoringRules.behavioral.timeOnSiteThresholds
    );
    score += timeScore;

    // Engagement actions scoring
    const engagementMultipliers = this.scoringRules.behavioral.engagementMultipliers;
    score += behavior.ctaClicks * engagementMultipliers.ctaClick;
    score += behavior.formInteractions * engagementMultipliers.formInteraction;
    score += behavior.downloadCount * engagementMultipliers.download;
    score += behavior.videoWatches * engagementMultipliers.videoWatch;
    score += behavior.socialShares * engagementMultipliers.socialShare;

    // Traffic source scoring
    score += this.scoringRules.behavioral.trafficSourceWeights[behavior.trafficSource] || 0;

    // Device type scoring
    score += this.scoringRules.behavioral.deviceTypeWeights[behavior.deviceType] || 0;

    // Return visitor bonus
    if (behavior.returnVisitor) {
      score += 20;
    }

    // Session count bonus
    if (behavior.sessionCount > 1) {
      score += Math.min(behavior.sessionCount * 5, 25);
    }

    // Scroll depth bonus
    if (behavior.averageScrollDepth > 75) {
      score += 15;
    } else if (behavior.averageScrollDepth > 50) {
      score += 10;
    }

    // Low bounce rate bonus
    if (behavior.bounceRate < 0.3) {
      score += 20;
    } else if (behavior.bounceRate < 0.5) {
      score += 10;
    }

    return Math.min(score, 300);
  }

  // Calculate intent score (0-400)
  private calculateIntentScore(profile: LeadProfile): number {
    let score = 0;
    const { intent } = profile;

    // Urgency scoring
    score += this.scoringRules.intent.urgencyWeights[intent.urgency] || 0;

    // Budget scoring
    score += this.scoringRules.intent.budgetWeights[intent.budget] || 0;

    // Course interest scoring
    intent.courseInterest.forEach(course => {
      score += this.scoringRules.intent.courseInterestWeights[course] || 30;
    });

    // Action-based scoring
    const actionWeights = this.scoringRules.intent.actionWeights;
    score += intent.consultationRequests * actionWeights.consultationRequest;
    score += intent.demoRequests * actionWeights.demoRequest;
    score += intent.brochureDownloads * actionWeights.brochureDownload;
    score += intent.priceInquiries * actionWeights.priceInquiry;

    // Comparison shopping penalty (indicates price sensitivity)
    if (intent.comparisonShopping) {
      score += actionWeights.comparisonShopping;
    }

    // Specific questions bonus (indicates serious interest)
    score += Math.min(intent.specificQuestions.length * 10, 30);

    return Math.min(score, 400);
  }

  // Calculate engagement score (0-100)
  private calculateEngagementScore(profile: LeadProfile): number {
    let score = 0;
    const { engagement } = profile;

    // Quality score
    score += this.getThresholdScore(
      engagement.qualityScore,
      this.scoringRules.engagement.qualityThresholds
    );

    // Engagement depth
    score += this.scoringRules.engagement.depthWeights[engagement.engagementDepth] || 0;

    // Interaction pattern
    score += this.scoringRules.engagement.patternWeights[engagement.interactionPattern] || 0;

    // Content preferences bonus
    if (engagement.contentPreferences.length > 2) {
      score += 10;
    }

    return Math.min(score / 3, 100); // Normalize to 0-100
  }

  // Helper function to get threshold-based score
  private getThresholdScore(value: number, thresholds: { min: number; score: number }[]): number {
    let score = 0;
    for (const threshold of thresholds.sort((a, b) => b.min - a.min)) {
      if (value >= threshold.min) {
        score = threshold.score;
        break;
      }
    }
    return score;
  }

  // Determine lead quality based on total score
  private determineLeadQuality(totalScore: number): 'hot' | 'warm' | 'cold' | 'unqualified' {
    if (totalScore >= 700) return 'hot';
    if (totalScore >= 500) return 'warm';
    if (totalScore >= 300) return 'cold';
    return 'unqualified';
  }

  // Calculate score confidence based on data completeness
  private calculateScoreConfidence(profile: LeadProfile): number {
    let dataPoints = 0;
    let completedPoints = 0;

    // Demographic data points
    const demographicFields = ['age', 'location', 'education', 'experience', 'income'];
    demographicFields.forEach(field => {
      dataPoints++;
      if (profile.demographics[field as keyof typeof profile.demographics]) {
        completedPoints++;
      }
    });

    // Contact information
    dataPoints += 2;
    if (profile.email) completedPoints++;
    if (profile.phone) completedPoints++;

    // Intent data points
    const intentFields = ['urgency', 'budget', 'timeline'];
    intentFields.forEach(field => {
      dataPoints++;
      if (profile.intent[field as keyof typeof profile.intent] && 
          profile.intent[field as keyof typeof profile.intent] !== 'exploring' && 
          profile.intent[field as keyof typeof profile.intent] !== 'flexible') {
        completedPoints++;
      }
    });

    // Behavioral data (always present)
    dataPoints += 3;
    completedPoints += 3;

    // Tool interactions
    dataPoints += 4;
    if (profile.toolInteractions.quizCompleted) completedPoints++;
    if (profile.toolInteractions.assessmentCompleted) completedPoints++;
    if (profile.toolInteractions.calculatorUsed) completedPoints++;
    if (profile.toolInteractions.eligibilityChecked) completedPoints++;

    return Math.round((completedPoints / dataPoints) * 100);
  }

  // Calculate engagement quality score
  private calculateEngagementQuality(profile: LeadProfile): number {
    let score = 0;
    const { behavior } = profile;

    // Time-based quality
    if (behavior.timeOnSite > 600) score += 25; // 10+ minutes
    else if (behavior.timeOnSite > 300) score += 15; // 5+ minutes
    else if (behavior.timeOnSite > 120) score += 10; // 2+ minutes

    // Interaction quality
    if (behavior.ctaClicks > 0) score += 20;
    if (behavior.formInteractions > 0) score += 25;
    if (behavior.downloadCount > 0) score += 15;
    if (behavior.videoWatches > 0) score += 10;

    // Depth indicators
    if (behavior.pageViews > 5) score += 15;
    else if (behavior.pageViews > 2) score += 10;

    if (behavior.averageScrollDepth > 75) score += 10;
    else if (behavior.averageScrollDepth > 50) score += 5;

    // Return visitor bonus
    if (behavior.returnVisitor) score += 15;

    return Math.min(score, 100);
  }

  // Determine engagement depth
  private determineEngagementDepth(profile: LeadProfile): 'surface' | 'moderate' | 'deep' {
    const { behavior, toolInteractions } = profile;
    
    let depthScore = 0;
    
    // Behavioral depth indicators
    if (behavior.pageViews > 10) depthScore += 3;
    else if (behavior.pageViews > 5) depthScore += 2;
    else if (behavior.pageViews > 2) depthScore += 1;
    
    if (behavior.timeOnSite > 1800) depthScore += 3; // 30+ minutes
    else if (behavior.timeOnSite > 600) depthScore += 2; // 10+ minutes
    else if (behavior.timeOnSite > 300) depthScore += 1; // 5+ minutes
    
    if (behavior.ctaClicks > 2) depthScore += 2;
    else if (behavior.ctaClicks > 0) depthScore += 1;
    
    // Tool interaction depth
    let toolsUsed = 0;
    if (toolInteractions.quizCompleted) toolsUsed++;
    if (toolInteractions.assessmentCompleted) toolsUsed++;
    if (toolInteractions.calculatorUsed) toolsUsed++;
    if (toolInteractions.eligibilityChecked) toolsUsed++;
    
    if (toolsUsed >= 3) depthScore += 3;
    else if (toolsUsed >= 2) depthScore += 2;
    else if (toolsUsed >= 1) depthScore += 1;
    
    if (depthScore >= 7) return 'deep';
    if (depthScore >= 4) return 'moderate';
    return 'surface';
  }

  // Identify interaction pattern
  private identifyInteractionPattern(profile: LeadProfile): 'researcher' | 'browser' | 'decision_maker' | 'influencer' {
    const { behavior, intent, toolInteractions } = profile;
    
    // Decision maker indicators
    if (intent.urgency === 'immediate' && intent.consultationRequests > 0) {
      return 'decision_maker';
    }
    
    // Researcher indicators
    if (behavior.pageViews > 8 && behavior.downloadCount > 1 && 
        (toolInteractions.quizCompleted || toolInteractions.assessmentCompleted)) {
      return 'researcher';
    }
    
    // Influencer indicators
    if (behavior.socialShares > 0 && intent.specificQuestions.length > 2) {
      return 'influencer';
    }
    
    // Default to browser
    return 'browser';
  }

  /**
   * Generate lead analysis
   */
  private generateLeadAnalysis(profile: LeadProfile, scores: LeadScore['scores']): LeadScore['analysis'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const riskFactors: string[] = [];
    const opportunities: string[] = [];

    // Analyze demographic strengths/weaknesses
    if (scores.demographic > 120) {
      strengths.push('Strong demographic profile for aviation training');
    } else if (scores.demographic < 60) {
      weaknesses.push('Demographic profile may not align with typical aviation students');
    }

    // Analyze behavioral patterns
    if (scores.behavioral > 200) {
      strengths.push('High engagement and interaction levels');
    } else if (scores.behavioral < 100) {
      weaknesses.push('Limited engagement with content and platform');
    }

    // Analyze intent signals
    if (scores.intent > 300) {
      strengths.push('Strong purchase intent and course interest');
    } else if (scores.intent < 150) {
      weaknesses.push('Unclear or low purchase intent');
    }

    // Analyze engagement quality
    if (scores.engagement > 70) {
      strengths.push('High-quality engagement patterns');
    } else if (scores.engagement < 40) {
      weaknesses.push('Low engagement quality');
    }

    // Identify risk factors
    if (profile.intent.comparisonShopping) {
      riskFactors.push('Price-sensitive, comparing multiple options');
    }
    
    if (profile.behavior.bounceRate > 0.7) {
      riskFactors.push('High bounce rate indicates potential disinterest');
    }
    
    if (profile.intent.budget === 'budget_conscious') {
      riskFactors.push('Budget constraints may affect conversion');
    }

    // Identify opportunities
    if (profile.toolInteractions.quizCompleted && !profile.toolInteractions.assessmentCompleted) {
      opportunities.push('Complete career assessment for better course matching');
    }
    
    if (profile.intent.urgency === 'immediate' && !profile.intent.consultationRequests) {
      opportunities.push('Schedule immediate consultation to capitalize on urgency');
    }
    
    if (profile.behavior.returnVisitor && profile.behavior.ctaClicks === 0) {
      opportunities.push('Optimize CTA placement for returning visitors');
    }

    return { strengths, weaknesses, riskFactors, opportunities };
  }

  // Determine qualification status
  private determineQualification(profile: LeadProfile, totalScore: number): LeadScore['qualification'] {
    const qualificationReasons: string[] = [];
    const disqualificationReasons: string[] = [];
    const missingInformation: string[] = [];

    // Qualification criteria
    let qualificationScore = 0;

    // Contact information
    if (profile.email) {
      qualificationScore += 20;
      qualificationReasons.push('Email address provided');
    } else {
      missingInformation.push('Email address');
    }

    if (profile.phone) {
      qualificationScore += 15;
      qualificationReasons.push('Phone number provided');
    } else {
      missingInformation.push('Phone number');
    }

    // Intent signals
    if (profile.intent.courseInterest.length > 0) {
      qualificationScore += 25;
      qualificationReasons.push('Specific course interest indicated');
    } else {
      missingInformation.push('Course interest');
    }

    if (profile.intent.urgency !== 'exploring') {
      qualificationScore += 20;
      qualificationReasons.push('Clear timeline for training');
    }

    // Engagement level
    if (profile.behavior.ctaClicks > 0 || profile.behavior.formInteractions > 0) {
      qualificationScore += 20;
      qualificationReasons.push('Active engagement with CTAs or forms');
    }

    // Disqualification factors
    if (profile.demographics.age && (profile.demographics.age < 17 || profile.demographics.age > 50)) {
      disqualificationReasons.push('Age outside typical range for aviation training');
    }

    if (profile.intent.budget === 'budget_conscious' && profile.behavior.timeOnSite < 120) {
      disqualificationReasons.push('Budget constraints with minimal engagement');
    }

    if (profile.behavior.bounceRate > 0.8 && profile.behavior.sessionCount === 1) {
      disqualificationReasons.push('High bounce rate with single session');
    }

    const isQualified = qualificationScore >= 60 && disqualificationReasons.length === 0 && totalScore >= 300;

    return {
      isQualified,
      qualificationReasons,
      disqualificationReasons,
      missingInformation
    };
  }

  // Generate recommendations
  private generateRecommendations(
    profile: LeadProfile, 
    totalScore: number, 
    quality: LeadScore['quality']
  ): LeadScore['recommendations'] {
    const nextActions: string[] = [];
    let followUpStrategy: 'immediate' | 'short_term' | 'long_term' | 'nurture' = 'nurture';
    let priority: 'high' | 'medium' | 'low' = 'low';
    const recommendedCourses: string[] = [];

    // Determine follow-up strategy and priority
    switch (quality) {
      case 'hot':
        followUpStrategy = 'immediate';
        priority = 'high';
        nextActions.push('Call within 2 hours');
        nextActions.push('Send personalized course proposal');
        nextActions.push('Schedule in-person meeting if possible');
        break;
        
      case 'warm':
        followUpStrategy = 'short_term';
        priority = 'medium';
        nextActions.push('Call within 24 hours');
        nextActions.push('Send detailed course information');
        nextActions.push('Invite to demo class or webinar');
        break;
        
      case 'cold':
        followUpStrategy = 'long_term';
        priority = 'low';
        nextActions.push('Add to email nurture sequence');
        nextActions.push('Send educational content weekly');
        nextActions.push('Follow up in 2 weeks');
        break;
        
      case 'unqualified':
        followUpStrategy = 'nurture';
        priority = 'low';
        nextActions.push('Add to general newsletter');
        nextActions.push('Monitor for increased engagement');
        break;
    }

    // Course recommendations based on profile
    if (profile.intent.courseInterest.length > 0) {
      recommendedCourses.push(...profile.intent.courseInterest);
    } else {
      // Default recommendations based on demographics and behavior
      if (profile.demographics.experience === 'none' || profile.demographics.experience === 'student') {
        recommendedCourses.push('CPL', 'RTR');
      } else {
        recommendedCourses.push('ATPL', 'Type Rating');
      }
    }

    // Additional actions based on profile analysis
    if (!profile.toolInteractions.quizCompleted) {
      nextActions.push('Encourage course recommendation quiz completion');
    }

    if (profile.intent.urgency === 'immediate' && !profile.intent.consultationRequests) {
      nextActions.push('Offer immediate consultation booking');
    }

    if (profile.behavior.returnVisitor && profile.behavior.ctaClicks === 0) {
      nextActions.push('Send targeted email with clear CTA');
    }

    // Estimate conversion probability and time
    let estimatedConversionProbability = 0;
    let estimatedTimeToConversion = 90; // days

    switch (quality) {
      case 'hot':
        estimatedConversionProbability = 70;
        estimatedTimeToConversion = 14;
        break;
      case 'warm':
        estimatedConversionProbability = 40;
        estimatedTimeToConversion = 30;
        break;
      case 'cold':
        estimatedConversionProbability = 15;
        estimatedTimeToConversion = 60;
        break;
      case 'unqualified':
        estimatedConversionProbability = 5;
        estimatedTimeToConversion = 180;
        break;
    }

    // Adjust based on intent urgency
    if (profile.intent.urgency === 'immediate') {
      estimatedConversionProbability += 20;
      estimatedTimeToConversion = Math.max(7, estimatedTimeToConversion / 2);
    } else if (profile.intent.urgency === 'within_3_months') {
      estimatedConversionProbability += 10;
      estimatedTimeToConversion = Math.min(90, estimatedTimeToConversion);
    }

    return {
      nextActions,
      followUpStrategy,
      priority,
      estimatedConversionProbability: Math.min(estimatedConversionProbability, 95),
      estimatedTimeToConversion,
      recommendedCourses
    };
  }

  // Store lead profile in database
  private async storeLeadProfile(profile: LeadProfile): Promise<void> {
    try {
      await fetch('/api/admin/analytics/lead-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (error) {
      console.error('Error storing lead profile:', error);
    }
  }

  // Store lead score in database
  private async storeLeadScore(userId: string, score: LeadScore): Promise<void> {
    try {
      await fetch('/api/admin/analytics/lead-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score })
      });
    } catch (error) {
      console.error('Error storing lead score:', error);
    }
  }

  // Get lead profile by user ID
  getLeadProfile(userId: string): LeadProfile | undefined {
    return this.leadProfiles.get(userId);
  }

  // Get scoring history for a user
  getScoringHistory(userId: string): LeadScore[] {
    return this.scoringHistory.get(userId) || [];
  }

  // Update scoring rules
  updateScoringRules(newRules: Partial<LeadScoringRules>): void {
    this.scoringRules = { ...this.scoringRules, ...newRules };
  }
}

// Export singleton instance
export const enhancedLeadScoringEngine = new EnhancedLeadScoringEngine();

// Convenience functions
export const updateLeadProfile = (
  userId: string,
  sessionId: string,
  updates: Partial<Omit<LeadProfile, 'id' | 'userId' | 'sessionId' | 'createdAt' | 'updatedAt'>>
) => {
  return enhancedLeadScoringEngine.updateLeadProfile(userId, sessionId, updates);
};

export const calculateLeadScore = (userId: string) => {
  return enhancedLeadScoringEngine.calculateLeadScore(userId);
};

export default enhancedLeadScoringEngine;
