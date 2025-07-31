// React hook for enhanced lead scoring integration
// This hook provides easy integration with the enhanced lead scoring system

import { useState, useEffect, useCallback } from 'react';
import { 
  LeadProfile, 
  LeadScore, 
  enhancedLeadScoringEngine,
  updateLeadProfile,
  calculateLeadScore
} from '@/lib/analytics/enhanced-lead-scoring';
import { leadQualificationRoutingEngine } from '@/lib/workflows/lead-qualification-routing';
import { conversionTracker } from '@/lib/analytics/conversion-tracking';

export interface UseEnhancedLeadScoringOptions {
  userId?: string;
  sessionId?: string;
  autoScore?: boolean;
  autoRoute?: boolean;
}

export interface LeadScoringState {
  profile: LeadProfile | null;
  score: LeadScore | null;
  loading: boolean;
  error: string | null;
  confidence: number;
  lastUpdated: Date | null;
}

export function useEnhancedLeadScoring(options: UseEnhancedLeadScoringOptions = {}) {
  const [state, setState] = useState<LeadScoringState>({
    profile: null,
    score: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  });

  const userId = options.userId || conversionTracker.getUserId();
  const sessionId = options.sessionId || conversionTracker.getSessionId();

  // Load existing profile and score
  useEffect(() => {
    if (userId) {
      loadLeadData();
    }
  }, [userId]);

  const loadLeadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Load existing profile
      const existingProfile = enhancedLeadScoringEngine.getLeadProfile(userId);
      
      let currentScore: LeadScore | null = null;
      if (existingProfile) {
        // Get latest score
        const scoringHistory = enhancedLeadScoringEngine.getScoringHistory(userId);
        currentScore = scoringHistory.length > 0 ? scoringHistory[scoringHistory.length - 1] : null;
      }

      setState(prev => ({
        ...prev,
        profile: existingProfile || null,
        score: currentScore,
        confidence: currentScore?.confidence || 0,
        lastUpdated: currentScore?.scoredAt || null,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load lead data',
        loading: false
      }));
    }
  }, [userId]);

  // Update lead profile with new data
  const updateProfile = useCallback(async (
    updates: Partial<Omit<LeadProfile, 'id' | 'userId' | 'sessionId' | 'createdAt' | 'updatedAt'>>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedProfile = await updateLeadProfile(userId, sessionId, updates);
      
      let newScore: LeadScore | null = null;
      
      // Auto-calculate score if enabled
      if (options.autoScore !== false) {
        newScore = await calculateLeadScore(userId);
        
        // Auto-route if enabled
        if (options.autoRoute && newScore) {
          await leadQualificationRoutingEngine.processLead(userId);
        }
      }

      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        score: newScore || prev.score,
        confidence: newScore?.confidence || prev.confidence,
        lastUpdated: newScore?.scoredAt || prev.lastUpdated,
        loading: false
      }));

      return updatedProfile;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false
      }));
      throw error;
    }
  }, [userId, sessionId, options.autoScore, options.autoRoute]);

  // Manually trigger scoring
  const triggerScoring = useCallback(async () => {
    if (!userId) return null;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newScore = await calculateLeadScore(userId);
      
      setState(prev => ({
        ...prev,
        score: newScore,
        confidence: newScore.confidence,
        lastUpdated: newScore.scoredAt,
        loading: false
      }));

      return newScore;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to calculate score',
        loading: false
      }));
      throw error;
    }
  }, [userId]);

  // Manually trigger routing
  const triggerRouting = useCallback(async () => {
    if (!userId) return [];
    
    try {
      const executions = await leadQualificationRoutingEngine.processLead(userId);
      return executions;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process routing'
      }));
      throw error;
    }
  }, [userId]);

  // Track behavioral events
  const trackBehavior = useCallback(async (behaviorUpdates: Partial<LeadProfile['behavior']>) => {
    return updateProfile({ behavior: behaviorUpdates });
  }, [updateProfile]);

  // Track demographic information
  const trackDemographics = useCallback(async (demographicUpdates: Partial<LeadProfile['demographics']>) => {
    return updateProfile({ demographics: demographicUpdates });
  }, [updateProfile]);

  // Track intent signals
  const trackIntent = useCallback(async (intentUpdates: Partial<LeadProfile['intent']>) => {
    return updateProfile({ intent: intentUpdates });
  }, [updateProfile]);

  // Track tool interactions
  const trackToolInteraction = useCallback(async (
    toolType: keyof LeadProfile['toolInteractions'],
    completed: boolean,
    results?: any
  ) => {
    const toolUpdates: Partial<LeadProfile['toolInteractions']> = {
      [toolType]: completed
    };
    
    if (results) {
      toolUpdates.toolResults = {
        ...state.profile?.toolInteractions.toolResults,
        [toolType]: results
      };
    }
    
    return updateProfile({ toolInteractions: toolUpdates });
  }, [updateProfile, state.profile]);

  // Track contact information
  const trackContact = useCallback(async (contactInfo: {
    email?: string;
    phone?: string;
    name?: string;
  }) => {
    return updateProfile(contactInfo);
  }, [updateProfile]);

  // Get scoring insights
  const getInsights = useCallback(() => {
    if (!state.score) return null;
    
    return {
      quality: state.score.quality,
      strengths: state.score.analysis.strengths,
      weaknesses: state.score.analysis.weaknesses,
      opportunities: state.score.analysis.opportunities,
      riskFactors: state.score.analysis.riskFactors,
      recommendations: state.score.recommendations.nextActions,
      conversionProbability: state.score.recommendations.estimatedConversionProbability,
      timeToConversion: state.score.recommendations.estimatedTimeToConversion
    };
  }, [state.score]);

  // Check if lead is qualified
  const isQualified = useCallback(() => {
    return state.score?.qualification.isQualified || false;
  }, [state.score]);

  // Get lead quality level
  const getQualityLevel = useCallback(() => {
    return state.score?.quality || 'unqualified';
  }, [state.score]);

  // Get component scores breakdown
  const getScoreBreakdown = useCallback(() => {
    if (!state.score) return null;
    
    return {
      total: state.score.totalScore,
      demographic: state.score.scores.demographic,
      behavioral: state.score.scores.behavioral,
      intent: state.score.scores.intent,
      engagement: state.score.scores.engagement,
      maxScores: {
        demographic: 200,
        behavioral: 300,
        intent: 400,
        engagement: 100,
        total: 1000
      }
    };
  }, [state.score]);

  return {
    // State
    ...state,
    userId,
    sessionId,
    
    // Actions
    updateProfile,
    triggerScoring,
    triggerRouting,
    loadLeadData,
    
    // Convenience methods
    trackBehavior,
    trackDemographics,
    trackIntent,
    trackToolInteraction,
    trackContact,
    
    // Insights
    getInsights,
    isQualified,
    getQualityLevel,
    getScoreBreakdown
  };
}

// Hook for lead scoring analytics
export function useLeadScoringAnalytics(dateRange?: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/admin/analytics/lead-scores?dateRange=${dateRange || '30d'}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics
  };
}

// Hook for workflow analytics
export function useWorkflowAnalytics(filters?: {
  ruleId?: string;
  status?: string;
  dateRange?: string;
}) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.ruleId) params.append('ruleId', filters.ruleId);
      if (filters?.status) params.append('status', filters.status);
      
      const response = await fetch(`/api/admin/workflows/executions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      
      const data = await response.json();
      setWorkflows(data.executions);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    analytics,
    loading,
    error,
    refresh: fetchWorkflows
  };
}

export default useEnhancedLeadScoring;
