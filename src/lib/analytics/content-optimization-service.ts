import { BlogPost } from '@/lib/types/blog';
import { 
  OptimizationSuggestion, 
  TrendingTopic, 
  ContentGap,
  PerformanceMetrics 
} from './performance-optimizer';

export interface ContentOptimizationReport {
  postId: string;
  overallScore: number;
  suggestions: OptimizationSuggestion[];
  keywordOpportunities: string[];
  competitorAnalysis: CompetitorAnalysis;
  seoRecommendations: SEORecommendation[];
  contentStructureAnalysis: ContentStructureAnalysis;
}

export interface CompetitorAnalysis {
  topCompetitors: string[];
  contentGaps: string[];
  keywordGaps: string[];
  opportunityScore: number;
}

export interface SEORecommendation {
  element: 'title' | 'meta-description' | 'headings' | 'internal-links' | 'images';
  current: string;
  recommended: string;
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ContentStructureAnalysis {
  readabilityScore: number;
  wordCount: number;
  headingStructure: HeadingAnalysis[];
  paragraphAnalysis: ParagraphAnalysis;
  keywordDensity: KeywordDensityAnalysis[];
}

export interface HeadingAnalysis {
  level: number;
  text: string;
  hasKeyword: boolean;
  recommendation?: string;
}

export interface ParagraphAnalysis {
  averageLength: number;
  totalParagraphs: number;
  longParagraphs: number;
  recommendation?: string;
}

export interface KeywordDensityAnalysis {
  keyword: string;
  density: number;
  occurrences: number;
  optimal: boolean;
  recommendation?: string;
}

export class ContentOptimizationService {
  private aviationKeywords = [
    'pilot training', 'aviation career', 'commercial pilot license', 'cpl',
    'atpl', 'dgca exam', 'flight training', 'aviation safety', 'aircraft systems',
    'navigation', 'meteorology', 'type rating', 'ground school', 'flight instructor',
    'aviation medical', 'instrument rating', 'multi engine', 'airline pilot'
  ];

  private competitorDomains = [
    'pilotinstitute.com',
    'boldmethod.com',
    'aviationexam.com',
    'flightliteracy.com'
  ];

  generateOptimizationReport(blogPost: BlogPost, performanceData?: PerformanceMetrics): ContentOptimizationReport {
    const suggestions = this.generateDetailedSuggestions(blogPost, performanceData);
    const keywordOpportunities = this.identifyKeywordOpportunities(blogPost);
    const competitorAnalysis = this.analyzeCompetitors(blogPost);
    const seoRecommendations = this.generateSEORecommendations(blogPost);
    const contentStructureAnalysis = this.analyzeContentStructure(blogPost);

    const overallScore = this.calculateOverallScore(
      suggestions,
      keywordOpportunities,
      competitorAnalysis,
      seoRecommendations,
      contentStructureAnalysis
    );

    return {
      postId: blogPost._id,
      overallScore,
      suggestions,
      keywordOpportunities,
      competitorAnalysis,
      seoRecommendations,
      contentStructureAnalysis
    };
  }

  private generateDetailedSuggestions(blogPost: BlogPost, performanceData?: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Title optimization
    if (!blogPost.title.toLowerCase().includes('pilot') && !blogPost.title.toLowerCase().includes('aviation')) {
      suggestions.push({
        type: 'important',
        category: 'seo',
        title: 'Include Aviation Keywords in Title',
        description: 'Title lacks primary aviation keywords that users search for',
        action: 'Add relevant aviation terms like "pilot", "aviation", or "flight training" to the title',
        impact: 'high',
        estimatedImprovement: '+30% organic traffic',
        priority: 9
      });
    }

    // Meta description optimization
    if (!blogPost.seoDescription || blogPost.seoDescription.length < 120) {
      suggestions.push({
        type: 'critical',
        category: 'seo',
        title: 'Optimize Meta Description',
        description: 'Meta description is missing or too short for optimal SEO',
        action: 'Write a compelling 150-160 character meta description with target keywords',
        impact: 'high',
        estimatedImprovement: '+25% click-through rate',
        priority: 8
      });
    }

    // Content length analysis
    const estimatedWordCount = blogPost.excerpt ? blogPost.excerpt.length * 8 : 500; // Rough estimate
    if (estimatedWordCount < 1000) {
      suggestions.push({
        type: 'important',
        category: 'content',
        title: 'Increase Content Depth',
        description: 'Content appears to be shorter than optimal for aviation training topics',
        action: 'Expand content to 1500+ words with detailed explanations and examples',
        impact: 'high',
        estimatedImprovement: '+40% time on page',
        priority: 7
      });
    }

    // Featured image optimization
    if (!blogPost.image) {
      suggestions.push({
        type: 'important',
        category: 'engagement',
        title: 'Add Featured Image',
        description: 'Missing featured image reduces social sharing and engagement',
        action: 'Add a high-quality aviation-related featured image with proper alt text',
        impact: 'medium',
        estimatedImprovement: '+20% social shares',
        priority: 6
      });
    }

    // Category optimization
    if (!blogPost.category) {
      suggestions.push({
        type: 'important',
        category: 'seo',
        title: 'Assign Relevant Category',
        description: 'Post lacks category assignment for better organization',
        action: 'Assign to appropriate aviation training category',
        impact: 'medium',
        estimatedImprovement: '+15% internal traffic',
        priority: 5
      });
    }

    // Performance-based suggestions
    if (performanceData) {
      if (performanceData.bounceRate > 0.6) {
        suggestions.push({
          type: 'critical',
          category: 'engagement',
          title: 'Reduce High Bounce Rate',
          description: `Bounce rate of ${(performanceData.bounceRate * 100).toFixed(1)}% indicates content relevance issues`,
          action: 'Improve content introduction, add table of contents, and enhance readability',
          impact: 'high',
          estimatedImprovement: '-25% bounce rate',
          priority: 9
        });
      }

      if (performanceData.averageTimeOnPage < 120) {
        suggestions.push({
          type: 'important',
          category: 'engagement',
          title: 'Increase Engagement Time',
          description: 'Low average time on page suggests content needs more engagement elements',
          action: 'Add interactive elements, videos, and break up text with subheadings',
          impact: 'high',
          estimatedImprovement: '+50% time on page',
          priority: 8
        });
      }

      if (performanceData.conversionRate < 0.05) {
        suggestions.push({
          type: 'critical',
          category: 'conversion',
          title: 'Improve Conversion Elements',
          description: 'Low conversion rate indicates weak call-to-action placement or messaging',
          action: 'Optimize CTA placement, improve messaging, and add urgency elements',
          impact: 'high',
          estimatedImprovement: '+100% conversion rate',
          priority: 10
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  private identifyKeywordOpportunities(blogPost: BlogPost): string[] {
    const currentContent = `${blogPost.title} ${blogPost.excerpt || ''}`.toLowerCase();
    const opportunities: string[] = [];

    // Check for missing high-value aviation keywords
    this.aviationKeywords.forEach(keyword => {
      if (!currentContent.includes(keyword.toLowerCase())) {
        opportunities.push(keyword);
      }
    });

    // Add long-tail keyword opportunities
    const longTailOpportunities = [
      'how to become a commercial pilot in india',
      'dgca exam preparation tips',
      'aviation career opportunities',
      'pilot training cost in india',
      'flight instructor certification',
      'airline pilot requirements',
      'aviation safety procedures',
      'aircraft systems training'
    ];

    longTailOpportunities.forEach(keyword => {
      if (!currentContent.includes(keyword.toLowerCase())) {
        opportunities.push(keyword);
      }
    });

    return opportunities.slice(0, 10); // Return top 10 opportunities
  }

  private analyzeCompetitors(blogPost: BlogPost): CompetitorAnalysis {
    // Simulated competitor analysis - in production, this would use real competitor data
    const topCompetitors = this.competitorDomains.slice(0, 3);
    
    const contentGaps = [
      'Detailed cost breakdown for pilot training',
      'Step-by-step DGCA exam registration process',
      'Career progression timeline for pilots',
      'Medical certificate requirements and process'
    ];

    const keywordGaps = [
      'pilot salary in india',
      'aviation job opportunities',
      'flight training scholarships',
      'pilot career path'
    ];

    // Calculate opportunity score based on content gaps and keyword opportunities
    const opportunityScore = Math.min(0.95, (contentGaps.length + keywordGaps.length) / 10);

    return {
      topCompetitors,
      contentGaps,
      keywordGaps,
      opportunityScore
    };
  }

  private generateSEORecommendations(blogPost: BlogPost): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Title recommendations
    if (blogPost.title.length > 60) {
      recommendations.push({
        element: 'title',
        current: blogPost.title,
        recommended: `${blogPost.title.substring(0, 57)}...`,
        impact: 'high',
        reason: 'Title is too long and may be truncated in search results'
      });
    }

    // Meta description recommendations
    if (!blogPost.seoDescription) {
      recommendations.push({
        element: 'meta-description',
        current: 'Missing',
        recommended: 'Create compelling 150-160 character description with target keywords',
        impact: 'high',
        reason: 'Meta description is crucial for click-through rates from search results'
      });
    }

    // Internal linking recommendations
    recommendations.push({
      element: 'internal-links',
      current: 'Unknown',
      recommended: 'Add 3-5 internal links to related aviation training content',
      impact: 'medium',
      reason: 'Internal links improve SEO and keep users engaged on your site'
    });

    // Image optimization recommendations
    if (blogPost.image) {
      recommendations.push({
        element: 'images',
        current: 'Featured image present',
        recommended: 'Ensure alt text includes relevant aviation keywords',
        impact: 'medium',
        reason: 'Alt text helps with image SEO and accessibility'
      });
    }

    return recommendations;
  }

  private analyzeContentStructure(blogPost: BlogPost): ContentStructureAnalysis {
    // Simulated content analysis - in production, this would analyze actual content
    const estimatedWordCount = blogPost.excerpt ? blogPost.excerpt.length * 8 : 500;
    
    const headingStructure: HeadingAnalysis[] = [
      {
        level: 1,
        text: blogPost.title,
        hasKeyword: this.aviationKeywords.some(keyword => 
          blogPost.title.toLowerCase().includes(keyword.toLowerCase())
        ),
        recommendation: !this.aviationKeywords.some(keyword => 
          blogPost.title.toLowerCase().includes(keyword.toLowerCase())
        ) ? 'Include aviation keywords in main heading' : undefined
      }
    ];

    const paragraphAnalysis: ParagraphAnalysis = {
      averageLength: 120,
      totalParagraphs: Math.ceil(estimatedWordCount / 120),
      longParagraphs: Math.ceil(estimatedWordCount / 200),
      recommendation: estimatedWordCount / 120 > 200 ? 'Break up long paragraphs for better readability' : undefined
    };

    const keywordDensity: KeywordDensityAnalysis[] = this.aviationKeywords.slice(0, 5).map(keyword => {
      const content = `${blogPost.title} ${blogPost.excerpt || ''}`.toLowerCase();
      const occurrences = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (occurrences / estimatedWordCount) * 100;
      
      return {
        keyword,
        density,
        occurrences,
        optimal: density >= 0.5 && density <= 2.5,
        recommendation: density < 0.5 ? `Increase usage of "${keyword}"` : 
                      density > 2.5 ? `Reduce usage of "${keyword}" to avoid keyword stuffing` : undefined
      };
    });

    const readabilityScore = this.calculateReadabilityScore(estimatedWordCount, paragraphAnalysis);

    return {
      readabilityScore,
      wordCount: estimatedWordCount,
      headingStructure,
      paragraphAnalysis,
      keywordDensity
    };
  }

  private calculateReadabilityScore(wordCount: number, paragraphAnalysis: ParagraphAnalysis): number {
    let score = 70; // Base score

    // Adjust for word count
    if (wordCount >= 1000 && wordCount <= 2000) score += 10;
    else if (wordCount < 500) score -= 20;
    else if (wordCount > 3000) score -= 10;

    // Adjust for paragraph structure
    if (paragraphAnalysis.averageLength <= 150) score += 10;
    else if (paragraphAnalysis.averageLength > 200) score -= 15;

    if (paragraphAnalysis.longParagraphs > paragraphAnalysis.totalParagraphs * 0.3) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallScore(
    suggestions: OptimizationSuggestion[],
    keywordOpportunities: string[],
    competitorAnalysis: CompetitorAnalysis,
    seoRecommendations: SEORecommendation[],
    contentStructureAnalysis: ContentStructureAnalysis
  ): number {
    let score = 100;

    // Deduct points for critical issues
    const criticalIssues = suggestions.filter(s => s.type === 'critical').length;
    score -= criticalIssues * 15;

    // Deduct points for important issues
    const importantIssues = suggestions.filter(s => s.type === 'important').length;
    score -= importantIssues * 10;

    // Deduct points for suggestions
    const suggestionIssues = suggestions.filter(s => s.type === 'suggestion').length;
    score -= suggestionIssues * 5;

    // Factor in readability
    score = (score + contentStructureAnalysis.readabilityScore) / 2;

    // Factor in SEO completeness
    const seoIssues = seoRecommendations.filter(r => r.impact === 'high').length;
    score -= seoIssues * 8;

    // Factor in competitive opportunity
    score += competitorAnalysis.opportunityScore * 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Utility method to generate actionable insights
  generateActionableInsights(report: ContentOptimizationReport): string[] {
    const insights: string[] = [];

    if (report.overallScore < 60) {
      insights.push('🚨 Content needs significant optimization to compete effectively');
    } else if (report.overallScore < 80) {
      insights.push('⚠️ Content has good potential but needs refinement');
    } else {
      insights.push('✅ Content is well-optimized and competitive');
    }

    // Top priority actions
    const criticalSuggestions = report.suggestions.filter(s => s.type === 'critical');
    if (criticalSuggestions.length > 0) {
      insights.push(`🔥 Address ${criticalSuggestions.length} critical issue(s) first`);
    }

    // Keyword opportunities
    if (report.keywordOpportunities.length > 5) {
      insights.push(`🎯 ${report.keywordOpportunities.length} keyword opportunities identified`);
    }

    // Competitive advantage
    if (report.competitorAnalysis.opportunityScore > 0.7) {
      insights.push('🚀 High opportunity to outrank competitors with optimization');
    }

    // Content structure insights
    if (report.contentStructureAnalysis.readabilityScore < 60) {
      insights.push('📖 Improve content readability for better user experience');
    }

    return insights;
  }
}
