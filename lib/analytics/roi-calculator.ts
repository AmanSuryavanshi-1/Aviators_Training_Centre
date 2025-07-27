// Advanced ROI calculation and reporting for blog content
// This module provides comprehensive ROI analysis with attribution modeling

export interface ROICalculationConfig {
  blogPostId?: string;
  dateRange?: { start: string; end: string };
  attributionModel?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  includeIndirectRevenue?: boolean;
  costBreakdown?: {
    contentCreation?: number;
    promotion?: number;
    maintenance?: number;
    distribution?: number;
  };
}

export interface ComprehensiveROIReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    roiPercentage: number;
    paybackPeriod: number; // in days
    breakEvenPoint: number; // revenue needed to break even
  };
  revenueBreakdown: {
    directRevenue: number;
    influencedRevenue: number;
    assistedRevenue: number;
    attributedRevenue: number;
  };
  costBreakdown: {
    contentCreation: number;
    promotion: number;
    maintenance: number;
    distribution: number;
    total: number;
  };
  performanceMetrics: {
    revenuePerVisitor: number;
    revenuePerLead: number;
    costPerLead: number;
    costPerConversion: number;
    lifetimeValue: number;
  };
  conversionMetrics: {
    totalConversions: number;
    conversionRate: number;
    averageOrderValue: number;
    repeatCustomerRate: number;
  };
  timeBasedAnalysis: {
    monthlyROI: Array<{
      month: string;
      revenue: number;
      cost: number;
      roi: number;
      cumulativeROI: number;
    }>;
    seasonalTrends: Array<{
      period: string;
      averageROI: number;
      peakPerformance: boolean;
    }>;
  };
  competitiveAnalysis: {
    industryBenchmark: number;
    performanceVsBenchmark: number;
    ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  };
  optimizationRecommendations: Array<{
    category: 'content' | 'promotion' | 'conversion' | 'cost_reduction';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    estimatedImpact: number; // percentage improvement
    implementationEffort: 'low' | 'medium' | 'high';
  }>;
  forecastProjections: {
    next30Days: { revenue: number; roi: number };
    next90Days: { revenue: number; roi: number };
    nextYear: { revenue: number; roi: number };
  };
}

export interface BlogContentROIComparison {
  blogPosts: Array<{
    blogPostId: string;
    title: string;
    category: string;
    publishDate: string;
    roi: ComprehensiveROIReport;
    ranking: number;
    performanceScore: number;
  }>;
  topPerformers: Array<{
    blogPostId: string;
    title: string;
    roiPercentage: number;
    revenue: number;
  }>;
  underPerformers: Array<{
    blogPostId: string;
    title: string;
    roiPercentage: number;
    improvementPotential: number;
  }>;
  categoryAnalysis: Array<{
    category: string;
    averageROI: number;
    totalRevenue: number;
    postCount: number;
    bestPerformer: string;
  }>;
}

class ROICalculator {
  // Calculate comprehensive ROI for blog content
  async calculateComprehensiveROI(
    config: ROICalculationConfig,
    conversionData: any,
    attributionData: any[]
  ): Promise<ComprehensiveROIReport> {
    const {
      blogPostId,
      dateRange,
      attributionModel = 'last_touch',
      includeIndirectRevenue = true,
      costBreakdown
    } = config;

    // Calculate revenue breakdown
    const revenueBreakdown = this.calculateRevenueBreakdown(
      attributionData,
      attributionModel,
      includeIndirectRevenue
    );

    // Calculate cost breakdown
    const costBreakdownResult = this.calculateCostBreakdown(
      costBreakdown,
      blogPostId ? 1 : attributionData.length
    );

    // Calculate summary metrics
    const totalRevenue = revenueBreakdown.directRevenue + 
                        (includeIndirectRevenue ? revenueBreakdown.influencedRevenue : 0);
    const totalCost = costBreakdownResult.total;
    const netProfit = totalRevenue - totalCost;
    const roiPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    // Calculate payback period
    const monthlyRevenue = totalRevenue / (dateRange ? this.getDateRangeMonths(dateRange) : 1);
    const paybackPeriod = monthlyRevenue > 0 ? (totalCost / monthlyRevenue) * 30 : 0;

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      conversionData,
      totalRevenue,
      totalCost,
      attributionData.length
    );

    // Calculate conversion metrics
    const conversionMetrics = this.calculateConversionMetrics(
      conversionData,
      attributionData
    );

    // Generate time-based analysis
    const timeBasedAnalysis = await this.generateTimeBasedAnalysis(
      attributionData,
      costBreakdownResult,
      dateRange
    );

    // Competitive analysis
    const competitiveAnalysis = this.performCompetitiveAnalysis(roiPercentage);

    // Generate optimization recommendations
    const optimizationRecommendations = this.generateOptimizationRecommendations(
      roiPercentage,
      conversionData,
      performanceMetrics,
      costBreakdownResult
    );

    // Generate forecast projections
    const forecastProjections = this.generateForecastProjections(
      totalRevenue,
      roiPercentage,
      dateRange
    );

    return {
      summary: {
        totalRevenue,
        totalCost,
        netProfit,
        roiPercentage,
        paybackPeriod,
        breakEvenPoint: totalCost
      },
      revenueBreakdown,
      costBreakdown: costBreakdownResult,
      performanceMetrics,
      conversionMetrics,
      timeBasedAnalysis,
      competitiveAnalysis,
      optimizationRecommendations,
      forecastProjections
    };
  }

  // Calculate revenue breakdown with attribution modeling
  private calculateRevenueBreakdown(
    attributionData: any[],
    attributionModel: string,
    includeIndirectRevenue: boolean
  ) {
    let directRevenue = 0;
    let influencedRevenue = 0;
    let assistedRevenue = 0;

    attributionData.forEach(attribution => {
      const revenue = attribution.conversionValue;
      const weight = attribution.attributionWeight;

      if (attribution.touchPoints.length === 1) {
        directRevenue += revenue;
      } else {
        assistedRevenue += revenue * weight;
        if (includeIndirectRevenue) {
          influencedRevenue += revenue * (1 - weight);
        }
      }
    });

    const attributedRevenue = directRevenue + assistedRevenue;

    return {
      directRevenue,
      influencedRevenue,
      assistedRevenue,
      attributedRevenue
    };
  }

  // Calculate detailed cost breakdown
  private calculateCostBreakdown(
    costBreakdown: ROICalculationConfig['costBreakdown'],
    postCount: number
  ) {
    const baseContentCost = 5000; // Base cost per blog post
    const contentCreation = costBreakdown?.contentCreation || (baseContentCost * postCount);
    const promotion = costBreakdown?.promotion || (contentCreation * 0.3);
    const maintenance = costBreakdown?.maintenance || (contentCreation * 0.1);
    const distribution = costBreakdown?.distribution || (contentCreation * 0.05);

    return {
      contentCreation,
      promotion,
      maintenance,
      distribution,
      total: contentCreation + promotion + maintenance + distribution
    };
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(
    conversionData: any,
    totalRevenue: number,
    totalCost: number,
    leadCount: number
  ) {
    const visitors = conversionData.blogViews || 0;
    const conversions = conversionData.payments || 0;

    return {
      revenuePerVisitor: visitors > 0 ? totalRevenue / visitors : 0,
      revenuePerLead: leadCount > 0 ? totalRevenue / leadCount : 0,
      costPerLead: leadCount > 0 ? totalCost / leadCount : 0,
      costPerConversion: conversions > 0 ? totalCost / conversions : 0,
      lifetimeValue: conversions > 0 ? (totalRevenue / conversions) * 1.5 : 0 // Estimated LTV multiplier
    };
  }

  // Calculate conversion metrics
  private calculateConversionMetrics(conversionData: any, attributionData: any[]) {
    const totalConversions = attributionData.length;
    const totalRevenue = attributionData.reduce((sum, attr) => sum + attr.conversionValue, 0);
    const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

    return {
      totalConversions,
      conversionRate: conversionData.conversionRates?.overallConversion || 0,
      averageOrderValue,
      repeatCustomerRate: 25 // Estimated repeat customer rate
    };
  }

  // Generate time-based analysis
  private async generateTimeBasedAnalysis(
    attributionData: any[],
    costBreakdown: any,
    dateRange?: { start: string; end: string }
  ) {
    // Group attributions by month
    const monthlyData = new Map();
    
    attributionData.forEach(attribution => {
      const date = new Date(attribution.touchPoints[0]?.timestamp || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, conversions: 0 });
      }
      
      const monthData = monthlyData.get(monthKey);
      monthData.revenue += attribution.conversionValue;
      monthData.conversions += 1;
    });

    // Calculate monthly ROI
    const monthlyROI = Array.from(monthlyData.entries()).map(([month, data]) => {
      const monthlyCost = costBreakdown.total / monthlyData.size;
      const roi = monthlyCost > 0 ? ((data.revenue - monthlyCost) / monthlyCost) * 100 : 0;
      
      return {
        month,
        revenue: data.revenue,
        cost: monthlyCost,
        roi,
        cumulativeROI: roi // Simplified cumulative calculation
      };
    }).sort((a, b) => a.month.localeCompare(b.month));

    // Identify seasonal trends
    const seasonalTrends = [
      { period: 'Q1', averageROI: 0, peakPerformance: false },
      { period: 'Q2', averageROI: 0, peakPerformance: false },
      { period: 'Q3', averageROI: 0, peakPerformance: false },
      { period: 'Q4', averageROI: 0, peakPerformance: false }
    ];

    // Calculate quarterly averages
    monthlyROI.forEach(month => {
      const monthNum = parseInt(month.month.split('-')[1]);
      const quarter = Math.ceil(monthNum / 3) - 1;
      seasonalTrends[quarter].averageROI += month.roi / 3;
    });

    // Identify peak performance quarter
    const maxROI = Math.max(...seasonalTrends.map(s => s.averageROI));
    seasonalTrends.forEach(trend => {
      trend.peakPerformance = trend.averageROI === maxROI;
    });

    return {
      monthlyROI,
      seasonalTrends
    };
  }

  // Perform competitive analysis
  private performCompetitiveAnalysis(roiPercentage: number) {
    // Industry benchmarks for content marketing ROI
    const industryBenchmark = 300; // 300% ROI is considered good for content marketing
    const performanceVsBenchmark = ((roiPercentage - industryBenchmark) / industryBenchmark) * 100;

    let ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
    
    if (roiPercentage >= 500) ranking = 'excellent';
    else if (roiPercentage >= 300) ranking = 'good';
    else if (roiPercentage >= 150) ranking = 'average';
    else if (roiPercentage >= 50) ranking = 'below_average';
    else ranking = 'poor';

    return {
      industryBenchmark,
      performanceVsBenchmark,
      ranking
    };
  }

  // Generate optimization recommendations
  private generateOptimizationRecommendations(
    roiPercentage: number,
    conversionData: any,
    performanceMetrics: any,
    costBreakdown: any
  ) {
    const recommendations = [];

    // Content optimization recommendations
    if (roiPercentage < 200) {
      recommendations.push({
        category: 'content' as const,
        priority: 'high' as const,
        recommendation: 'Focus on high-converting content topics and improve content quality',
        estimatedImpact: 25,
        implementationEffort: 'medium' as const
      });
    }

    // Conversion optimization
    if (conversionData.conversionRates?.overallConversion < 2) {
      recommendations.push({
        category: 'conversion' as const,
        priority: 'high' as const,
        recommendation: 'Optimize conversion funnel and improve CTA placement',
        estimatedImpact: 40,
        implementationEffort: 'medium' as const
      });
    }

    // Cost reduction recommendations
    if (costBreakdown.promotion > costBreakdown.contentCreation * 0.5) {
      recommendations.push({
        category: 'cost_reduction' as const,
        priority: 'medium' as const,
        recommendation: 'Optimize promotion spend and focus on organic reach',
        estimatedImpact: 15,
        implementationEffort: 'low' as const
      });
    }

    // Promotion optimization
    if (performanceMetrics.costPerLead > 500) {
      recommendations.push({
        category: 'promotion' as const,
        priority: 'medium' as const,
        recommendation: 'Improve targeting and reduce cost per lead through better audience segmentation',
        estimatedImpact: 20,
        implementationEffort: 'medium' as const
      });
    }

    return recommendations;
  }

  // Generate forecast projections
  private generateForecastProjections(
    totalRevenue: number,
    roiPercentage: number,
    dateRange?: { start: string; end: string }
  ) {
    const periodMonths = dateRange ? this.getDateRangeMonths(dateRange) : 1;
    const monthlyRevenue = totalRevenue / periodMonths;
    const growthRate = Math.min(roiPercentage / 100 * 0.1, 0.2); // Cap growth at 20%

    return {
      next30Days: {
        revenue: monthlyRevenue * (1 + growthRate),
        roi: roiPercentage * (1 + growthRate * 0.5)
      },
      next90Days: {
        revenue: monthlyRevenue * 3 * (1 + growthRate * 2),
        roi: roiPercentage * (1 + growthRate)
      },
      nextYear: {
        revenue: monthlyRevenue * 12 * (1 + growthRate * 3),
        roi: roiPercentage * (1 + growthRate * 1.5)
      }
    };
  }

  // Compare ROI across multiple blog posts
  async compareBlogContentROI(
    blogPosts: string[],
    dateRange?: { start: string; end: string }
  ): Promise<BlogContentROIComparison> {
    // This would integrate with the conversion tracker to get data for each blog post
    // For now, returning a mock structure
    
    const blogPostsData = [];
    const topPerformers = [];
    const underPerformers = [];
    const categoryMap = new Map();

    // Process each blog post (mock implementation)
    for (let i = 0; i < blogPosts.length; i++) {
      const blogPostId = blogPosts[i];
      
      // Mock ROI calculation for each post
      const mockROI = {
        summary: {
          totalRevenue: Math.random() * 100000,
          totalCost: 5000,
          netProfit: 0,
          roiPercentage: 0,
          paybackPeriod: 0,
          breakEvenPoint: 5000
        }
      } as ComprehensiveROIReport;

      mockROI.summary.netProfit = mockROI.summary.totalRevenue - mockROI.summary.totalCost;
      mockROI.summary.roiPercentage = (mockROI.summary.netProfit / mockROI.summary.totalCost) * 100;

      const blogPostData = {
        blogPostId,
        title: `Blog Post ${i + 1}`,
        category: ['Technical', 'Career', 'Training'][i % 3],
        publishDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        roi: mockROI,
        ranking: i + 1,
        performanceScore: mockROI.summary.roiPercentage
      };

      blogPostsData.push(blogPostData);

      // Categorize performers
      if (mockROI.summary.roiPercentage > 300) {
        topPerformers.push({
          blogPostId,
          title: blogPostData.title,
          roiPercentage: mockROI.summary.roiPercentage,
          revenue: mockROI.summary.totalRevenue
        });
      } else if (mockROI.summary.roiPercentage < 100) {
        underPerformers.push({
          blogPostId,
          title: blogPostData.title,
          roiPercentage: mockROI.summary.roiPercentage,
          improvementPotential: 200 - mockROI.summary.roiPercentage
        });
      }

      // Category analysis
      const category = blogPostData.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          totalROI: 0,
          totalRevenue: 0,
          postCount: 0,
          bestPerformer: '',
          bestROI: 0
        });
      }

      const categoryData = categoryMap.get(category);
      categoryData.totalROI += mockROI.summary.roiPercentage;
      categoryData.totalRevenue += mockROI.summary.totalRevenue;
      categoryData.postCount += 1;

      if (mockROI.summary.roiPercentage > categoryData.bestROI) {
        categoryData.bestROI = mockROI.summary.roiPercentage;
        categoryData.bestPerformer = blogPostData.title;
      }
    }

    // Convert category map to array
    const categoryAnalysis = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      averageROI: data.totalROI / data.postCount,
      totalRevenue: data.totalRevenue,
      postCount: data.postCount,
      bestPerformer: data.bestPerformer
    }));

    return {
      blogPosts: blogPostsData.sort((a, b) => b.performanceScore - a.performanceScore),
      topPerformers: topPerformers.sort((a, b) => b.roiPercentage - a.roiPercentage),
      underPerformers: underPerformers.sort((a, b) => a.roiPercentage - b.roiPercentage),
      categoryAnalysis: categoryAnalysis.sort((a, b) => b.averageROI - a.averageROI)
    };
  }

  // Helper method to calculate date range in months
  private getDateRangeMonths(dateRange: { start: string; end: string }): number {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays / 30, 1);
  }
}

// Export singleton instance
export const roiCalculator = new ROICalculator();

// Convenience functions
export const calculateComprehensiveROI = (
  config: ROICalculationConfig,
  conversionData: any,
  attributionData: any[]
) => {
  return roiCalculator.calculateComprehensiveROI(config, conversionData, attributionData);
};

export const compareBlogContentROI = (
  blogPosts: string[],
  dateRange?: { start: string; end: string }
) => {
  return roiCalculator.compareBlogContentROI(blogPosts, dateRange);
};

export default roiCalculator;