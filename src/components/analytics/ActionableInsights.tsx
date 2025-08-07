'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Users,
  Eye,
  MousePointer,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightData {
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
  trafficSources: Record<string, number>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: string;
  }>;
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  aiReferrals: {
    chatgpt: number;
    claude: number;
    other_ai: number;
  };
  pageviews: number;
  uniqueUsers: number;
}

interface InsightCardProps {
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  icon: React.ElementType;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  description,
  recommendation,
  impact,
  effort,
  icon: Icon
}) => {
  const typeStyles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    critical: 'border-red-200 bg-red-50 text-red-800'
  };

  const impactColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const effortColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <Card className={cn("border-l-4", typeStyles[type])}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge className={impactColors[impact]} variant="secondary">
              {impact} impact
            </Badge>
            <Badge className={effortColors[effort]} variant="secondary">
              {effort} effort
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-aviation-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aviation-primary mb-1">Recommendation:</p>
              <p className="text-sm">{recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ActionableInsights({ data }: { data: InsightData }) {
  const generateInsights = (): InsightCardProps[] => {
    const insights: InsightCardProps[] = [];
    
    // Conversion Rate Analysis
    if (data.conversionFunnel.conversionRate < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Conversion Rate Detected',
        description: `Your current conversion rate is ${data.conversionFunnel.conversionRate.toFixed(2)}%, which is below the industry average of 2-3% for educational websites.`,
        recommendation: 'Optimize your contact forms, add more compelling CTAs on blog posts, and consider implementing exit-intent popups to capture leaving visitors.',
        impact: 'high',
        effort: 'medium',
        icon: Target
      });
    } else if (data.conversionFunnel.conversionRate > 5) {
      insights.push({
        type: 'success',
        title: 'Excellent Conversion Performance',
        description: `Your conversion rate of ${data.conversionFunnel.conversionRate.toFixed(2)}% is well above industry average. Great job!`,
        recommendation: 'Scale your successful strategies by increasing traffic to your highest-converting pages and replicating successful elements across other pages.',
        impact: 'medium',
        effort: 'low',
        icon: CheckCircle
      });
    }

    // Traffic Source Diversification
    const totalTraffic = Object.values(data.trafficSources).reduce((sum, val) => sum + val, 0);
    const directTrafficPercent = totalTraffic > 0 ? (data.trafficSources.direct / totalTraffic) * 100 : 0;
    
    if (directTrafficPercent > 60) {
      insights.push({
        type: 'warning',
        title: 'Over-Reliance on Direct Traffic',
        description: `${directTrafficPercent.toFixed(1)}% of your traffic is direct, indicating heavy dependence on existing brand awareness.`,
        recommendation: 'Diversify traffic sources by investing in SEO, social media marketing, and content marketing to reduce dependency on direct traffic.',
        impact: 'high',
        effort: 'high',
        icon: TrendingDown
      });
    }

    // AI Platform Opportunity
    const totalAI = Object.values(data.aiReferrals).reduce((sum, val) => sum + val, 0);
    const aiTrafficPercent = totalTraffic > 0 ? (totalAI / totalTraffic) * 100 : 0;
    
    if (aiTrafficPercent > 5) {
      insights.push({
        type: 'info',
        title: 'Strong AI Platform Presence',
        description: `${aiTrafficPercent.toFixed(1)}% of your traffic comes from AI platforms like ChatGPT and Claude, showing good visibility in AI search results.`,
        recommendation: 'Optimize your content for AI platforms by using clear, structured information and FAQ formats that AI models can easily reference.',
        impact: 'medium',
        effort: 'low',
        icon: Zap
      });
    } else if (totalAI > 0) {
      insights.push({
        type: 'info',
        title: 'AI Platform Growth Opportunity',
        description: `You're getting some traffic from AI platforms (${totalAI} visitors), but there's room for growth in this emerging channel.`,
        recommendation: 'Create more structured, FAQ-style content and ensure your key information is easily discoverable by AI models.',
        impact: 'medium',
        effort: 'medium',
        icon: Zap
      });
    }

    // Mobile vs Desktop Analysis
    const totalDevices = Object.values(data.deviceTypes).reduce((sum, val) => sum + val, 0);
    const mobilePercent = totalDevices > 0 ? (data.deviceTypes.mobile / totalDevices) * 100 : 0;
    
    if (mobilePercent < 40) {
      insights.push({
        type: 'warning',
        title: 'Low Mobile Traffic',
        description: `Only ${mobilePercent.toFixed(1)}% of your traffic is from mobile devices, which is below the typical 50-60% for most websites.`,
        recommendation: 'Improve mobile SEO, ensure mobile-friendly content, and consider mobile-specific marketing campaigns to capture more mobile users.',
        impact: 'medium',
        effort: 'medium',
        icon: AlertTriangle
      });
    }

    // Content Performance Analysis
    if (data.topPages.length > 0) {
      const topPage = data.topPages[0];
      const topPagePercent = data.pageviews > 0 ? (topPage.views / data.pageviews) * 100 : 0;
      
      if (topPagePercent > 30) {
        insights.push({
          type: 'warning',
          title: 'Content Distribution Imbalance',
          description: `Your top page (${topPage.title}) accounts for ${topPagePercent.toFixed(1)}% of all page views, indicating content concentration.`,
          recommendation: 'Create more high-quality content similar to your top-performing page and improve internal linking to distribute traffic more evenly.',
          impact: 'medium',
          effort: 'medium',
          icon: Eye
        });
      }
    }

    // Funnel Drop-off Analysis
    const visitorToBlogReader = data.conversionFunnel.visitors > 0 ? 
      (data.conversionFunnel.blogReaders / data.conversionFunnel.visitors) * 100 : 0;
    
    if (visitorToBlogReader < 50) {
      insights.push({
        type: 'critical',
        title: 'High Visitor Drop-off Rate',
        description: `Only ${visitorToBlogReader.toFixed(1)}% of visitors engage with your blog content, indicating potential UX or content relevance issues.`,
        recommendation: 'Improve your homepage design, add compelling blog previews, and ensure your navigation clearly guides visitors to relevant content.',
        impact: 'high',
        effort: 'medium',
        icon: Users
      });
    }

    // Growth Opportunities
    if (data.uniqueUsers > 1000 && data.conversionFunnel.conversionRate > 3) {
      insights.push({
        type: 'success',
        title: 'Ready for Scale',
        description: `With ${data.uniqueUsers.toLocaleString()} unique users and a ${data.conversionFunnel.conversionRate.toFixed(2)}% conversion rate, you're ready to scale your marketing efforts.`,
        recommendation: 'Invest in paid advertising, content marketing, and SEO to drive more traffic to your already well-converting website.',
        impact: 'high',
        effort: 'high',
        icon: TrendingUp
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const priorityInsights = insights.filter(i => i.impact === 'high');
  const quickWins = insights.filter(i => i.effort === 'low' && i.impact !== 'low');
  const longTermProjects = insights.filter(i => i.effort === 'high');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <Lightbulb className="h-5 w-5" />
            Growth Analysis Summary
          </CardTitle>
          <CardDescription>
            AI-powered insights based on your analytics data to help grow your aviation training business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {priorityInsights.length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority Issues</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {quickWins.length}
              </div>
              <div className="text-sm text-muted-foreground">Quick Wins Available</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {longTermProjects.length}
              </div>
              <div className="text-sm text-muted-foreground">Long-term Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Insights */}
      {priorityInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-aviation-primary flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            High Priority Actions
          </h3>
          <div className="space-y-4">
            {priorityInsights.map((insight, index) => (
              <InsightCard key={`priority-${index}`} {...insight} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-aviation-primary flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quick Wins (Low Effort, High Impact)
          </h3>
          <div className="space-y-4">
            {quickWins.map((insight, index) => (
              <InsightCard key={`quickwin-${index}`} {...insight} />
            ))}
          </div>
        </div>
      )}

      {/* All Insights */}
      {insights.length > priorityInsights.length + quickWins.length && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-aviation-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Additional Opportunities
          </h3>
          <div className="space-y-4">
            {insights
              .filter(i => !priorityInsights.includes(i) && !quickWins.includes(i))
              .map((insight, index) => (
                <InsightCard key={`additional-${index}`} {...insight} />
              ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <Target className="h-5 w-5" />
            Recommended Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Address High Priority Issues</p>
                <p className="text-sm text-muted-foreground">
                  Focus on conversion rate and traffic diversification first
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Implement Quick Wins</p>
                <p className="text-sm text-muted-foreground">
                  Low effort improvements that can show immediate results
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Plan Long-term Projects</p>
                <p className="text-sm text-muted-foreground">
                  Strategic initiatives for sustained growth
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Insights Message */}
      {insights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-aviation-primary mb-2">
              Excellent Performance!
            </h3>
            <p className="text-muted-foreground">
              Your analytics show strong performance across all key metrics. Keep up the great work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}