import { Timestamp } from 'firebase/firestore';
import { getAnalyticsData } from './dataProcessor';
import { TrafficSource } from './trafficSourceTracker';

export interface AnalyticsInsight {
  id: string;
  type: 'performance' | 'traffic' | 'conversion' | 'content' | 'user_behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number; // 0-100
  data: Record<string, any>;
  createdAt: Timestamp;
  isRead: boolean;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  threshold: number;
  alertType: 'spike' | 'drop' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Timestamp;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'traffic' | 'conversion' | 'content' | 'user_experience';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  steps: string[];
  metrics: string[];
}

export class AnalyticsInsightsService {
  private static instance: AnalyticsInsightsService;
  private insights: AnalyticsInsight[] = [];
  private alerts: PerformanceAlert[] = [];
  private recommendations: OptimizationRecommendation[] = [];

  static getInstance(): AnalyticsInsightsService {
    if (!AnalyticsInsightsService.instance) {
      AnalyticsInsightsService.instance = new AnalyticsInsightsService();
    }
    return AnalyticsInsightsService.instance;
  }

  async generateInsights(timeRange: { start: Date; end: Date }): Promise<AnalyticsInsight[]> {
    try {
      const data = await getAnalyticsData(timeRange);
      const insights: AnalyticsInsight[] = [];

      // Traffic insights
      insights.push(...await this.generateTrafficInsights(data));
      
      // Conversion insights
      insights.push(...await this.generateConversionInsights(data));
      
      // Content performance insights
      insights.push(...await this.generateContentInsights(data));
      
      // User behavior insights
      insights.push(...await this.generateUserBehaviorInsights(data));

      this.insights = insights;
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  private async generateTrafficInsights(data: any): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // AI assistant traffic analysis
    const aiTraffic = data.trafficSources?.filter((source: TrafficSource) => 
      ['chatgpt', 'claude', 'perplexity', 'bard', 'copilot'].includes(source.source.toLowerCase())
    ) || [];

    if (aiTraffic.length > 0) {
      const totalAiTraffic = aiTraffic.reduce((sum: number, source: TrafficSource) => sum + source.sessions, 0);
      const totalTraffic = data.totalSessions || 1;
      const aiPercentage = (totalAiTraffic / totalTraffic) * 100;

      if (aiPercentage > 20) {
        insights.push({
          id: `ai-traffic-${Date.now()}`,
          type: 'traffic',
          severity: 'medium',
          title: 'High AI Assistant Traffic Detected',
          description: `${aiPercentage.toFixed(1)}% of your traffic is coming from AI assistants like ChatGPT, Claude, and Perplexity.`,
          recommendation: 'Consider optimizing content for AI assistant queries and implementing AI-specific tracking.',
          impact: 'This represents a new traffic channel that may have different conversion patterns.',
          confidence: 85,
          data: { aiTraffic, aiPercentage, totalAiTraffic },
          createdAt: Timestamp.now(),
          isRead: false
        });
      }
    }

    // Traffic source diversity
    const uniqueSources = new Set(data.trafficSources?.map((s: TrafficSource) => s.source) || []);
    if (uniqueSources.size < 3) {
      insights.push({
        id: `traffic-diversity-${Date.now()}`,
        type: 'traffic',
        severity: 'high',
        title: 'Limited Traffic Source Diversity',
        description: `You're only receiving traffic from ${uniqueSources.size} different sources.`,
        recommendation: 'Diversify your traffic sources through SEO, social media, and content marketing.',
        impact: 'Over-reliance on few traffic sources increases risk and limits growth potential.',
        confidence: 90,
        data: { sourceCount: uniqueSources.size, sources: Array.from(uniqueSources) },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async generateConversionInsights(data: any): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Conversion rate analysis
    const conversionRate = data.conversionRate || 0;
    const industryAverage = 2.5; // Aviation training industry average

    if (conversionRate < industryAverage * 0.7) {
      insights.push({
        id: `low-conversion-${Date.now()}`,
        type: 'conversion',
        severity: 'high',
        title: 'Below Average Conversion Rate',
        description: `Your conversion rate of ${conversionRate.toFixed(2)}% is below the industry average of ${industryAverage}%.`,
        recommendation: 'Review your landing pages, contact forms, and call-to-action placement.',
        impact: 'Improving conversion rate could significantly increase leads and revenue.',
        confidence: 80,
        data: { conversionRate, industryAverage, gap: industryAverage - conversionRate },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    // High-performing traffic sources
    const topConvertingSources = data.trafficSources
      ?.filter((source: TrafficSource) => source.conversions > 0)
      ?.sort((a: TrafficSource, b: TrafficSource) => 
        (b.conversions / b.sessions) - (a.conversions / a.sessions)
      )
      ?.slice(0, 3) || [];

    if (topConvertingSources.length > 0) {
      const topSource = topConvertingSources[0];
      const topConversionRate = (topSource.conversions / topSource.sessions) * 100;

      insights.push({
        id: `top-converting-source-${Date.now()}`,
        type: 'conversion',
        severity: 'low',
        title: 'High-Performing Traffic Source Identified',
        description: `${topSource.source} has a conversion rate of ${topConversionRate.toFixed(2)}%.`,
        recommendation: `Increase investment in ${topSource.source} traffic acquisition.`,
        impact: 'Focusing on high-converting sources can improve overall ROI.',
        confidence: 95,
        data: { topSource, conversionRate: topConversionRate, topConvertingSources },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async generateContentInsights(data: any): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Top performing content
    const topContent = data.contentPerformance
      ?.sort((a: any, b: any) => b.conversions - a.conversions)
      ?.slice(0, 5) || [];

    if (topContent.length > 0) {
      const bestPerformer = topContent[0];
      insights.push({
        id: `top-content-${Date.now()}`,
        type: 'content',
        severity: 'low',
        title: 'Top Converting Content Identified',
        description: `"${bestPerformer.title}" is your highest converting content with ${bestPerformer.conversions} conversions.`,
        recommendation: 'Create similar content or update this post to maintain its performance.',
        impact: 'Leveraging successful content patterns can improve overall content ROI.',
        confidence: 90,
        data: { topContent: bestPerformer, allTopContent: topContent },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    // Content with high bounce rate
    const highBounceContent = data.contentPerformance
      ?.filter((content: any) => content.bounceRate > 70)
      ?.sort((a: any, b: any) => b.bounceRate - a.bounceRate)
      ?.slice(0, 3) || [];

    if (highBounceContent.length > 0) {
      insights.push({
        id: `high-bounce-content-${Date.now()}`,
        type: 'content',
        severity: 'medium',
        title: 'Content with High Bounce Rate',
        description: `${highBounceContent.length} pieces of content have bounce rates above 70%.`,
        recommendation: 'Review and improve content quality, add internal links, and enhance user engagement.',
        impact: 'Reducing bounce rate can improve SEO rankings and user engagement.',
        confidence: 85,
        data: { highBounceContent },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    return insights;
  }

  private async generateUserBehaviorInsights(data: any): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Session duration analysis
    const avgSessionDuration = data.avgSessionDuration || 0;
    const targetDuration = 180; // 3 minutes for aviation training content

    if (avgSessionDuration < targetDuration) {
      insights.push({
        id: `short-sessions-${Date.now()}`,
        type: 'user_behavior',
        severity: 'medium',
        title: 'Short Average Session Duration',
        description: `Average session duration is ${Math.round(avgSessionDuration)}s, below the target of ${targetDuration}s.`,
        recommendation: 'Improve content engagement with videos, interactive elements, and better content structure.',
        impact: 'Longer sessions typically correlate with higher conversion rates.',
        confidence: 75,
        data: { avgSessionDuration, targetDuration, gap: targetDuration - avgSessionDuration },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    // Mobile vs desktop behavior
    const mobileTraffic = data.deviceBreakdown?.mobile || 0;
    const totalTraffic = data.totalSessions || 1;
    const mobilePercentage = (mobileTraffic / totalTraffic) * 100;

    if (mobilePercentage > 60) {
      insights.push({
        id: `mobile-dominant-${Date.now()}`,
        type: 'user_behavior',
        severity: 'low',
        title: 'Mobile-Dominant Traffic Pattern',
        description: `${mobilePercentage.toFixed(1)}% of your traffic comes from mobile devices.`,
        recommendation: 'Ensure mobile optimization and consider mobile-first content strategy.',
        impact: 'Mobile optimization is crucial for user experience and conversions.',
        confidence: 95,
        data: { mobilePercentage, mobileTraffic, totalTraffic },
        createdAt: Timestamp.now(),
        isRead: false
      });
    }

    return insights;
  }

  async generatePerformanceAlerts(currentData: any, previousData: any): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = [];

    // Traffic spike/drop detection
    const trafficChange = this.calculatePercentageChange(
      currentData.totalSessions,
      previousData.totalSessions
    );

    if (Math.abs(trafficChange) > 50) {
      alerts.push({
        id: `traffic-${trafficChange > 0 ? 'spike' : 'drop'}-${Date.now()}`,
        metric: 'Total Sessions',
        currentValue: currentData.totalSessions,
        previousValue: previousData.totalSessions,
        changePercent: trafficChange,
        threshold: 50,
        alertType: trafficChange > 0 ? 'spike' : 'drop',
        severity: Math.abs(trafficChange) > 100 ? 'critical' : 'high',
        message: `Traffic ${trafficChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(trafficChange).toFixed(1)}%`,
        timestamp: Timestamp.now()
      });
    }

    // Conversion rate changes
    const conversionChange = this.calculatePercentageChange(
      currentData.conversionRate,
      previousData.conversionRate
    );

    if (Math.abs(conversionChange) > 25) {
      alerts.push({
        id: `conversion-${conversionChange > 0 ? 'spike' : 'drop'}-${Date.now()}`,
        metric: 'Conversion Rate',
        currentValue: currentData.conversionRate,
        previousValue: previousData.conversionRate,
        changePercent: conversionChange,
        threshold: 25,
        alertType: conversionChange > 0 ? 'spike' : 'drop',
        severity: Math.abs(conversionChange) > 50 ? 'high' : 'medium',
        message: `Conversion rate ${conversionChange > 0 ? 'improved' : 'declined'} by ${Math.abs(conversionChange).toFixed(1)}%`,
        timestamp: Timestamp.now()
      });
    }

    this.alerts = alerts;
    return alerts;
  }

  async generateOptimizationRecommendations(data: any): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Traffic optimization
    const organicTraffic = data.trafficSources?.find((s: TrafficSource) => s.source === 'organic') || { sessions: 0 };
    const totalTraffic = data.totalSessions || 1;
    const organicPercentage = (organicTraffic.sessions / totalTraffic) * 100;

    if (organicPercentage < 40) {
      recommendations.push({
        id: `seo-optimization-${Date.now()}`,
        category: 'traffic',
        priority: 'high',
        title: 'Improve SEO for Organic Traffic',
        description: `Only ${organicPercentage.toFixed(1)}% of traffic is organic. Industry best practice is 40-60%.`,
        expectedImpact: 'Could increase organic traffic by 50-100% within 6 months',
        implementationEffort: 'medium',
        steps: [
          'Conduct keyword research for aviation training terms',
          'Optimize existing content for target keywords',
          'Create new content targeting long-tail keywords',
          'Improve technical SEO (site speed, mobile optimization)',
          'Build quality backlinks from aviation industry sites'
        ],
        metrics: ['Organic traffic growth', 'Keyword rankings', 'Click-through rates']
      });
    }

    // Conversion optimization
    if (data.conversionRate < 2.0) {
      recommendations.push({
        id: `conversion-optimization-${Date.now()}`,
        category: 'conversion',
        priority: 'high',
        title: 'Optimize Conversion Funnel',
        description: 'Current conversion rate is below industry standards.',
        expectedImpact: 'Could improve conversion rate by 30-50%',
        implementationEffort: 'medium',
        steps: [
          'A/B test contact form placement and design',
          'Add social proof and testimonials',
          'Improve call-to-action copy and visibility',
          'Simplify contact form fields',
          'Add live chat or callback options'
        ],
        metrics: ['Conversion rate', 'Form completion rate', 'Lead quality']
      });
    }

    // Content optimization
    const avgTimeOnPage = data.avgTimeOnPage || 0;
    if (avgTimeOnPage < 120) {
      recommendations.push({
        id: `content-engagement-${Date.now()}`,
        category: 'content',
        priority: 'medium',
        title: 'Improve Content Engagement',
        description: 'Users are spending less than 2 minutes on average per page.',
        expectedImpact: 'Could increase time on page by 40-60%',
        implementationEffort: 'low',
        steps: [
          'Add engaging visuals and infographics',
          'Break up long text with subheadings',
          'Include interactive elements or quizzes',
          'Add related content suggestions',
          'Improve content readability and structure'
        ],
        metrics: ['Time on page', 'Bounce rate', 'Pages per session']
      });
    }

    // User experience optimization
    const mobileConversionRate = data.mobileConversionRate || 0;
    const desktopConversionRate = data.desktopConversionRate || 0;
    
    if (mobileConversionRate < desktopConversionRate * 0.7) {
      recommendations.push({
        id: `mobile-optimization-${Date.now()}`,
        category: 'user_experience',
        priority: 'high',
        title: 'Optimize Mobile Experience',
        description: 'Mobile conversion rate is significantly lower than desktop.',
        expectedImpact: 'Could improve mobile conversions by 25-40%',
        implementationEffort: 'medium',
        steps: [
          'Audit mobile user experience',
          'Optimize forms for mobile input',
          'Improve mobile page load speed',
          'Simplify mobile navigation',
          'Test mobile-specific call-to-actions'
        ],
        metrics: ['Mobile conversion rate', 'Mobile bounce rate', 'Mobile page speed']
      });
    }

    this.recommendations = recommendations;
    return recommendations;
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Getters for cached data
  getInsights(): AnalyticsInsight[] {
    return this.insights;
  }

  getAlerts(): PerformanceAlert[] {
    return this.alerts;
  }

  getRecommendations(): OptimizationRecommendation[] {
    return this.recommendations;
  }

  // Mark insights as read
  markInsightAsRead(insightId: string): void {
    const insight = this.insights.find(i => i.id === insightId);
    if (insight) {
      insight.isRead = true;
    }
  }

  // Get unread insights count
  getUnreadInsightsCount(): number {
    return this.insights.filter(i => !i.isRead).length;
  }
}

export const insightsService = AnalyticsInsightsService.getInstance();