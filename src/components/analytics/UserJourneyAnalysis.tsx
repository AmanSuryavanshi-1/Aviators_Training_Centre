'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Users, 
  Eye, 
  MousePointer, 
  MessageSquare,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

interface UserJourneyProps {
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    avgTime: string;
  }>;
  trafficSources: Record<string, number>;
}

interface JourneyStepProps {
  icon: React.ElementType;
  title: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

const JourneyStep: React.FC<JourneyStepProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  percentage, 
  color, 
  description 
}) => (
  <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-white shadow-sm">
    <div className={`p-3 rounded-full ${color} mb-3`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="font-semibold text-aviation-primary mb-1">{title}</h3>
    <div className="text-2xl font-bold text-aviation-primary mb-1">
      {value.toLocaleString()}
    </div>
    <div className="text-sm text-muted-foreground mb-2">{description}</div>
    <Progress value={percentage} className="w-full h-2" />
    <span className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</span>
  </div>
);

export default function UserJourneyAnalysis({ 
  conversionFunnel, 
  topPages, 
  trafficSources 
}: UserJourneyProps) {
  const maxValue = Math.max(
    conversionFunnel.visitors,
    conversionFunnel.blogReaders,
    conversionFunnel.contactViews,
    conversionFunnel.formSubmissions
  );

  const journeySteps = [
    {
      icon: Users,
      title: 'Visitors',
      value: conversionFunnel.visitors,
      percentage: (conversionFunnel.visitors / maxValue) * 100,
      color: 'bg-blue-500',
      description: 'Land on website'
    },
    {
      icon: Eye,
      title: 'Blog Readers',
      value: conversionFunnel.blogReaders,
      percentage: (conversionFunnel.blogReaders / maxValue) * 100,
      color: 'bg-green-500',
      description: 'Read blog content'
    },
    {
      icon: MousePointer,
      title: 'Contact Views',
      value: conversionFunnel.contactViews,
      percentage: (conversionFunnel.contactViews / maxValue) * 100,
      color: 'bg-orange-500',
      description: 'Visit contact page'
    },
    {
      icon: MessageSquare,
      title: 'Form Submissions',
      value: conversionFunnel.formSubmissions,
      percentage: (conversionFunnel.formSubmissions / maxValue) * 100,
      color: 'bg-purple-500',
      description: 'Submit contact form'
    }
  ];

  const totalTraffic = Object.values(trafficSources).reduce((sum, val) => sum + val, 0);
  const topTrafficSources = Object.entries(trafficSources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* User Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <Target className="h-5 w-5" />
            User Journey Analysis
          </CardTitle>
          <CardDescription>
            Complete user flow from first visit to conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {journeySteps.map((step, index) => (
              <div key={step.title} className="relative">
                <JourneyStep {...step} />
                {index < journeySteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-aviation-primary bg-white rounded-full p-0.5 border" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Conversion Rate Summary */}
          <div className="bg-aviation-primary/5 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Overall Conversion Rate</div>
            <div className="text-3xl font-bold text-aviation-primary mb-2">
              {conversionFunnel.conversionRate.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {conversionFunnel.formSubmissions} conversions from {conversionFunnel.visitors} visitors
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Entry Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <TrendingUp className="h-5 w-5" />
              Top Entry Points
            </CardTitle>
            <CardDescription>
              Most popular pages where users start their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.slice(0, 5).map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-medium text-sm truncate">{page.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-medium text-aviation-primary">
                        {page.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {page.avgTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No page data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Source Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <Users className="h-5 w-5" />
              Traffic Source Performance
            </CardTitle>
            <CardDescription>
              How different sources contribute to conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTrafficSources.map(([source, count]) => {
                const percentage = totalTraffic > 0 ? (count / totalTraffic) * 100 : 0;
                const estimatedConversions = Math.floor(count * (conversionFunnel.conversionRate / 100));
                
                return (
                  <div key={source} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {source.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <Progress value={percentage} className="flex-1 mr-2 h-2" />
                      <span className="text-muted-foreground">
                        ~{estimatedConversions} conversions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-aviation-primary">
            <Target className="h-5 w-5" />
            Journey Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {conversionFunnel.visitors > 0 ? 
                  ((conversionFunnel.blogReaders / conversionFunnel.visitors) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Visitors who read blog content
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {conversionFunnel.blogReaders > 0 ? 
                  ((conversionFunnel.contactViews / conversionFunnel.blogReaders) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Blog readers who visit contact page
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {conversionFunnel.contactViews > 0 ? 
                  ((conversionFunnel.formSubmissions / conversionFunnel.contactViews) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Contact page visitors who submit form
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}