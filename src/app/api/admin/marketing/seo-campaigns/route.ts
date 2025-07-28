import { NextRequest, NextResponse } from 'next/server';
import { seoManager } from '@/lib/marketing/seo-campaign';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Get keyword strategies for aviation training
    const keywordStrategies = seoManager.getAviationKeywordStrategies();
    
    // Mock campaigns data (in real implementation, this would come from database)
    const campaigns = [
      {
        id: 'seo_campaign_1',
        name: 'Aviation Training Keywords Q1 2024',
        targetKeywords: ['DGCA CPL training', 'commercial pilot license India', 'ATPL ground school'],
        blogPosts: ['dgca-cpl-complete-guide-2024', 'atpl-vs-cpl-pilot-license-comparison-guide'],
        status: 'active',
        startDate: new Date('2024-01-01'),
        metrics: {
          impressions: 15420,
          clicks: 892,
          averagePosition: 8.2,
          ctr: 5.8,
        },
        goals: {
          targetPosition: 5,
          targetTraffic: 5000,
          targetConversions: 100,
        },
      },
      {
        id: 'seo_campaign_2',
        name: 'Pilot Career Content Strategy',
        targetKeywords: ['pilot career guidance', 'aviation training institute India', 'pilot salary India'],
        blogPosts: ['pilot-salary-india-2024-career-earnings-guide', 'airline-industry-career-opportunities-beyond-pilot-jobs'],
        status: 'active',
        startDate: new Date('2024-01-15'),
        metrics: {
          impressions: 8750,
          clicks: 445,
          averagePosition: 12.1,
          ctr: 5.1,
        },
        goals: {
          targetPosition: 8,
          targetTraffic: 3000,
          targetConversions: 60,
        },
      },
    ];

    // Filter by status if provided
    const filteredCampaigns = status 
      ? campaigns.filter(campaign => campaign.status === status)
      : campaigns;

    return NextResponse.json({
      success: true,
      data: {
        campaigns: filteredCampaigns,
        keywordStrategies,
        summary: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          totalKeywords: campaigns.reduce((sum, c) => sum + c.targetKeywords.length, 0),
          averagePosition: campaigns.reduce((sum, c) => sum + c.metrics.averagePosition, 0) / campaigns.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching SEO campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, targetKeywords, blogPosts, goals } = body;

    // Validate required fields
    if (!name || !targetKeywords || !blogPosts) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new SEO campaign
    const campaign = seoManager.createCampaign({
      name,
      targetKeywords,
      blogPosts,
      status: 'draft',
      startDate: new Date(),
      goals: goals || {
        targetPosition: 10,
        targetTraffic: 1000,
        targetConversions: 20,
      },
    });

    // Generate SEO recommendations for the campaign
    const recommendations = seoManager.generateSEORecommendations(
      blogPosts[0], 
      targetKeywords
    );

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Error creating SEO campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SEO campaign' },
      { status: 500 }
    );
  }
}