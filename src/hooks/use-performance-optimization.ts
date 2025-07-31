import { useState, useCallback } from 'react';
import {
  OptimizationSuggestion,
  TrendingTopic,
  ContentGap,
  PerformancePrediction,
  PerformanceAnalysis
} from '@/lib/analytics/performance-optimizer';
import { AdvancedOptimizationReport } from '@/lib/analytics/advanced-content-optimizer';
import { ContentOptimizationReport } from '@/lib/analytics/content-optimization-service';

interface UsePerformanceOptimizationReturn {
  // State
  loading: boolean;
  error: string | null;
  suggestions: OptimizationSuggestion[];
  trendingTopics: TrendingTopic[];
  contentGaps: ContentGap[];
  performanceAnalysis: PerformanceAnalysis | null;
  prediction: PerformancePrediction | null;
  advancedReport: AdvancedOptimizationReport | null;
  contentOptimizationReport: ContentOptimizationReport | null;
  contentIdeas: any[];
  roadmapItems: any[];

  // Actions
  loadSuggestions: (postId: string) => Promise<void>;
  loadTrendingTopics: () => Promise<void>;
  loadContentGaps: () => Promise<void>;
  loadPerformanceAnalysis: (timeRange?: string) => Promise<void>;
  loadPrediction: (postId: string) => Promise<void>;
  loadAdvancedReport: (postId: string) => Promise<void>;
  loadContentOptimizationReport: (postId: string) => Promise<void>;
  generateContentIdeas: () => Promise<void>;
  generateOptimizationRoadmap: () => Promise<void>;
  bulkAnalyzePosts: (postIds: string[]) => Promise<{ postId: string; suggestions: OptimizationSuggestion[] }[]>;
  advancedBulkAnalysis: (postIds: string[]) => Promise<any[]>;
  customPrediction: (blogPost: any) => Promise<PerformancePrediction>;
  clearError: () => void;
}

export function usePerformanceOptimization(): UsePerformanceOptimizationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [advancedReport, setAdvancedReport] = useState<AdvancedOptimizationReport | null>(null);
  const [contentOptimizationReport, setContentOptimizationReport] = useState<ContentOptimizationReport | null>(null);
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`Performance optimization error in ${context}:`, error);
    setError(`Failed to ${context}. Please try again.`);
  }, []);

  const loadSuggestions = useCallback(async (postId: string) => {
    if (!postId) {
      setError('Post ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=suggestions&postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      handleError(error, 'load optimization suggestions');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadTrendingTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization?action=trending');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTrendingTopics(data.trendingTopics || []);
    } catch (error) {
      handleError(error, 'load trending topics');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadContentGaps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization?action=content-gaps');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContentGaps(data.contentGaps || []);
    } catch (error) {
      handleError(error, 'load content gaps');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadPerformanceAnalysis = useCallback(async (timeRange: string = '30d') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=performance-analysis&timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPerformanceAnalysis(data.analysis || null);
    } catch (error) {
      handleError(error, 'load performance analysis');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadPrediction = useCallback(async (postId: string) => {
    if (!postId) {
      setError('Post ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=predict&postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data.prediction || null);
    } catch (error) {
      handleError(error, 'load performance prediction');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const bulkAnalyzePosts = useCallback(async (postIds: string[]) => {
    if (!postIds.length) {
      setError('Post IDs are required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk-analysis',
          data: { postIds }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.bulkSuggestions || [];
    } catch (error) {
      handleError(error, 'perform bulk analysis');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const customPrediction = useCallback(async (blogPost: any): Promise<PerformancePrediction> => {
    if (!blogPost) {
      setError('Blog post data is required');
      throw new Error('Blog post data is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'custom-prediction',
          data: { blogPost }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.prediction;
    } catch (error) {
      handleError(error, 'generate custom prediction');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadAdvancedReport = useCallback(async (postId: string) => {
    if (!postId) {
      setError('Post ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=advanced-report&postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAdvancedReport(data.report || null);
    } catch (error) {
      handleError(error, 'load advanced report');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadContentOptimizationReport = useCallback(async (postId: string) => {
    if (!postId) {
      setError('Post ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics/optimization?action=content-optimization&postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContentOptimizationReport(data.report || null);
    } catch (error) {
      handleError(error, 'load content optimization report');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const generateContentIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-content-ideas',
          data: { category: 'aviation', keywords: ['pilot', 'training', 'aviation'] }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContentIdeas(data.contentIdeas || []);
    } catch (error) {
      handleError(error, 'generate content ideas');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const generateOptimizationRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimization-roadmap',
          data: { timeframe: '3months', priority: 'high' }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRoadmapItems(data.roadmap || []);
    } catch (error) {
      handleError(error, 'generate optimization roadmap');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const advancedBulkAnalysis = useCallback(async (postIds: string[]) => {
    if (!postIds.length) {
      setError('Post IDs are required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics/optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'advanced-bulk-analysis',
          data: { postIds }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.advancedBulkResults || [];
    } catch (error) {
      handleError(error, 'perform advanced bulk analysis');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    suggestions,
    trendingTopics,
    contentGaps,
    performanceAnalysis,
    prediction,
    advancedReport,
    contentOptimizationReport,
    contentIdeas,
    roadmapItems,

    // Actions
    loadSuggestions,
    loadTrendingTopics,
    loadContentGaps,
    loadPerformanceAnalysis,
    loadPrediction,
    loadAdvancedReport,
    loadContentOptimizationReport,
    generateContentIdeas,
    generateOptimizationRoadmap,
    bulkAnalyzePosts,
    advancedBulkAnalysis,
    customPrediction,
    clearError,
  };
}

// Utility hook for optimization insights
export function useOptimizationInsights() {
  const [insights, setInsights] = useState<{
    topOpportunities: TrendingTopic[];
    criticalIssues: OptimizationSuggestion[];
    contentRecommendations: ContentGap[];
  }>({
    topOpportunities: [],
    criticalIssues: [],
    contentRecommendations: []
  });

  const generateInsights = useCallback(async () => {
    try {
      // Load all optimization data
      const [trendingResponse, gapsResponse] = await Promise.all([
        fetch('/api/admin/analytics/optimization?action=trending'),
        fetch('/api/admin/analytics/optimization?action=content-gaps')
      ]);

      const [trendingData, gapsData] = await Promise.all([
        trendingResponse.json(),
        gapsResponse.json()
      ]);

      // Process insights
      const topOpportunities = (trendingData.trendingTopics || [])
        .filter((topic: TrendingTopic) => topic.opportunityScore > 0.7)
        .slice(0, 3);

      const contentRecommendations = (gapsData.contentGaps || [])
        .filter((gap: ContentGap) => gap.competitorCoverage < 0.5)
        .slice(0, 3);

      setInsights({
        topOpportunities,
        criticalIssues: [], // Would be populated from suggestions analysis
        contentRecommendations
      });
    } catch (error) {
      console.error('Failed to generate optimization insights:', error);
    }
  }, []);

  return {
    insights,
    generateInsights
  };
}
