"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Share2, 
  Mail, 
  Link, 
  BarChart3, 
  Target, 
  Users, 
  MousePointer, 
  Eye,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Settings,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import marketing managers
import { seoManager, type SEOCampaign, type KeywordStrategy } from '@/lib/marketing/seo-campaign';
import { socialMediaManager, type SocialMediaCampaign, type SocialMediaPost } from '@/lib/marketing/social-media-promotion';
import { emailMarketingManager, type EmailCampaign } from '@/lib/marketing/email-marketing';
import { internalLinkingManager, type LinkingStrategy, type InternalLink } from '@/lib/marketing/internal-linking';

interface MarketingMetrics {
  seo: {
    activeCampaigns: number;
    avgPosition: number;
    organicTraffic: number;
    keywordRankings: number;
  };
  social: {
    activeCampaigns: number;
    totalReach: number;
    engagement: number;
    clicks: number;
  };
  email: {
    activeCampaigns: number;
    subscribers: number;
    openRate: number;
    clickRate: number;
  };
  linking: {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    avgCTR: number;
  };
}

export default function MarketingPromotionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<MarketingMetrics>({
    seo: { activeCampaigns: 3, avgPosition: 8.2, organicTraffic: 2450, keywordRankings: 15 },
    social: { activeCampaigns: 2, totalReach: 12500, engagement: 850, clicks: 320 },
    email: { activeCampaigns: 1, subscribers: 1250, openRate: 28.5, clickRate: 4.2 },
    linking: { totalLinks: 24, activeLinks: 22, totalClicks: 180, avgCTR: 3.8 },
  });

  const [seoCampaigns, setSeoCampaigns] = useState<SEOCampaign[]>([]);
  const [socialCampaigns, setSocialCampaigns] = useState<SocialMediaCampaign[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [linkingStrategies, setLinkingStrategies] = useState<LinkingStrategy[]>([]);

  useEffect(() => {
    // Initialize marketing data
    initializeMarketingData();
  }, []);

  const initializeMarketingData = () => {
    // Generate sample SEO campaigns
    const sampleSEOCampaign = seoManager.createCampaign({
      name: 'Aviation Training Keywords Q1 2024',
      targetKeywords: ['DGCA CPL training', 'commercial pilot license India', 'ATPL ground school'],
      blogPosts: ['dgca-cpl-complete-guide-2024', 'atpl-vs-cpl-pilot-license-comparison-guide'],
      status: 'active',
      startDate: new Date('2024-01-01'),
      goals: {
        targetPosition: 5,
        targetTraffic: 5000,
        targetConversions: 100,
      },
    });

    // Generate sample social media campaign
    const sampleSocialCampaign = socialMediaManager.createPromotionCampaign({
      name: 'Blog Content Promotion - January 2024',
      blogPostSlugs: ['dgca-cpl-complete-guide-2024', 'pilot-salary-india-2024-career-earnings-guide'],
      platforms: ['linkedin', 'twitter', 'facebook'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      status: 'active',
      goals: {
        targetReach: 10000,
        targetEngagement: 500,
        targetClicks: 200,
      },
    });

    // Generate sample email campaign
    const sampleEmailCampaign = emailMarketingManager.createBlogPromotionCampaign({
      name: 'Weekly Aviation Insights Newsletter',
      blogPostSlugs: ['dgca-cpl-complete-guide-2024', 'aviation-technology-trends-future-flying-2024'],
      targetAudience: {
        segments: ['newsletter-subscribers', 'course-inquiries'],
        interests: ['aviation-training', 'pilot-career'],
        courseEnrollments: ['cpl-ground-school'],
      },
      scheduledTime: new Date('2024-01-20'),
    });

    // Generate linking strategies
    const linkingStrategies = internalLinkingManager.generateLinkingStrategy();

    setSeoCampaigns([sampleSEOCampaign]);
    setSocialCampaigns([sampleSocialCampaign]);
    setEmailCampaigns([sampleEmailCampaign]);
    setLinkingStrategies(linkingStrategies);
  };

  const createNewSEOCampaign = () => {
    const newCampaign = seoManager.createCampaign({
      name: `SEO Campaign ${Date.now()}`,
      targetKeywords: ['aviation training', 'pilot career'],
      blogPosts: ['dgca-cpl-complete-guide-2024'],
      status: 'draft',
      startDate: new Date(),
      goals: {
        targetPosition: 10,
        targetTraffic: 1000,
        targetConversions: 20,
      },
    });
    setSeoCampaigns(prev => [...prev, newCampaign]);
  };

  const createNewSocialCampaign = () => {
    const newCampaign = socialMediaManager.createPromotionCampaign({
      name: `Social Campaign ${Date.now()}`,
      blogPostSlugs: ['dgca-cpl-complete-guide-2024'],
      platforms: ['linkedin', 'twitter'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      goals: {
        targetReach: 5000,
        targetEngagement: 250,
        targetClicks: 100,
      },
    });
    setSocialCampaigns(prev => [...prev, newCampaign]);
  };

  const createNewEmailCampaign = () => {
    const newCampaign = emailMarketingManager.createBlogPromotionCampaign({
      name: `Email Campaign ${Date.now()}`,
      blogPostSlugs: ['dgca-cpl-complete-guide-2024'],
      targetAudience: {
        segments: ['newsletter-subscribers'],
        interests: ['aviation-training'],
        courseEnrollments: [],
      },
      scheduledTime: new Date(),
    });
    setEmailCampaigns(prev => [...prev, newCampaign]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing & Promotion</h1>
          <p className="text-gray-600 mt-1">Manage SEO campaigns, social media promotion, email marketing, and internal linking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Performance</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.seo.avgPosition}</div>
            <p className="text-xs text-muted-foreground">Average keyword position</p>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+2.3 positions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.social.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total social media reach</p>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+15.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Performance</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.email.openRate}%</div>
            <p className="text-xs text-muted-foreground">Average open rate</p>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+3.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.linking.avgCTR}%</div>
            <p className="text-xs text-muted-foreground">Average click-through rate</p>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+0.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo">SEO Campaigns</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  SEO Campaign Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Campaigns</span>
                    <Badge variant="secondary">{seoCampaigns.filter(c => c.status === 'active').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Target Keywords</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Organic Traffic</span>
                    <span className="font-medium text-green-600">+24.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Media Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Campaigns</span>
                    <Badge variant="secondary">{socialCampaigns.filter(c => c.status === 'active').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Engagement</span>
                    <span className="font-medium">{metrics.social.engagement}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click-through Rate</span>
                    <span className="font-medium text-green-600">2.56%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Marketing Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Marketing Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subscribers</span>
                    <span className="font-medium">{metrics.email.subscribers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Open Rate</span>
                    <span className="font-medium text-green-600">{metrics.email.openRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="font-medium">{metrics.email.clickRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Linking Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Internal Linking Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Links</span>
                    <span className="font-medium">{metrics.linking.totalLinks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Links</span>
                    <span className="font-medium text-green-600">{metrics.linking.activeLinks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Clicks</span>
                    <span className="font-medium">{metrics.linking.totalClicks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">SEO Campaigns</h2>
            <Button onClick={createNewSEOCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-6">
            {seoCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      {campaign.name}
                    </CardTitle>
                    <Badge className={getStatusBadge(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Target Keywords</h4>
                      <div className="space-y-1">
                        {campaign.targetKeywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Position:</span>
                          <span className="font-medium">{campaign.metrics.averagePosition || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CTR:</span>
                          <span className="font-medium">{campaign.metrics.ctr}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Goals</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Target Position:</span>
                          <span className="font-medium">{campaign.goals.targetPosition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Traffic:</span>
                          <span className="font-medium">{campaign.goals.targetTraffic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Social Media Campaigns</h2>
            <Button onClick={createNewSocialCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-6">
            {socialCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      {campaign.name}
                    </CardTitle>
                    <Badge className={getStatusBadge(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Platforms</h4>
                      <div className="flex gap-2">
                        {campaign.platforms.map((platform, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Posts:</span>
                          <span className="font-medium">{campaign.posts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {Math.ceil((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Goals</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Target Reach:</span>
                          <span className="font-medium">{campaign.goals.targetReach.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Clicks:</span>
                          <span className="font-medium">{campaign.goals.targetClicks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Email Marketing Campaigns</h2>
            <Button onClick={createNewEmailCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-6">
            {emailCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      {campaign.name}
                    </CardTitle>
                    <Badge className={getStatusBadge(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Target Audience</h4>
                      <div className="space-y-1">
                        {campaign.targetAudience.segments.map((segment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span className="font-medium">{campaign.metrics.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opened:</span>
                          <span className="font-medium">{campaign.metrics.opened}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Goals</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Target Open Rate:</span>
                          <span className="font-medium">{campaign.goals.targetOpenRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Click Rate:</span>
                          <span className="font-medium">{campaign.goals.targetClickRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}