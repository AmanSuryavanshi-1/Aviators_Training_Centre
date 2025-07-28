import { NextRequest, NextResponse } from 'next/server';
import { emailMarketingManager } from '@/lib/marketing/email-marketing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    // Mock campaigns data (in real implementation, this would come from database)
    const campaigns = [
      {
        id: 'email_campaign_1',
        name: 'Weekly Aviation Insights Newsletter',
        templateId: 'newsletter-template',
        subject: '🛩️ This Week in Aviation Training',
        blogPostSlugs: ['dgca-cpl-complete-guide-2024', 'aviation-technology-trends-future-flying-2024'],
        targetAudience: {
          segments: ['newsletter-subscribers', 'course-inquiries'],
          interests: ['aviation-training', 'pilot-career'],
          courseEnrollments: ['cpl-ground-school'],
        },
        scheduledTime: new Date('2024-01-20T09:00:00Z'),
        status: 'sent',
        metrics: {
          sent: 1250,
          delivered: 1235,
          opened: 354,
          clicked: 52,
          unsubscribed: 3,
          bounced: 15,
        },
        goals: {
          targetOpenRate: 25,
          targetClickRate: 5,
          targetTraffic: 500,
        },
      },
      {
        id: 'email_campaign_2',
        name: 'DGCA CPL Guide Promotion',
        templateId: 'blog-promotion-template',
        subject: '🛩️ Your Complete DGCA CPL Guide is Here!',
        blogPostSlugs: ['dgca-cpl-complete-guide-2024'],
        targetAudience: {
          segments: ['blog-readers', 'cpl-interested'],
          interests: ['dgca-training', 'cpl-preparation'],
          courseEnrollments: [],
        },
        scheduledTime: new Date('2024-01-25T10:00:00Z'),
        status: 'scheduled',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          unsubscribed: 0,
          bounced: 0,
        },
        goals: {
          targetOpenRate: 30,
          targetClickRate: 6,
          targetTraffic: 300,
        },
      },
    ];

    // Filter campaigns
    let filteredCampaigns = campaigns;
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }

    // Calculate summary metrics
    const totalSubscribers = 1250; // Mock data
    const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0);
    const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0);
    const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0);
    
    const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const averageClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    // Get subscriber segments
    const subscriberSegments = [
      { name: 'newsletter-subscribers', count: 850, growth: '+12.5%' },
      { name: 'course-inquiries', count: 320, growth: '+8.2%' },
      { name: 'blog-readers', count: 180, growth: '+15.3%' },
      { name: 'cpl-interested', count: 95, growth: '+22.1%' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        campaigns: filteredCampaigns,
        subscriberSegments,
        summary: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          totalSubscribers,
          averageOpenRate: Math.round(averageOpenRate * 10) / 10,
          averageClickRate: Math.round(averageClickRate * 10) / 10,
          totalSent,
          totalOpened,
          totalClicked,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, blogPostSlugs, targetAudience, scheduledTime, campaignType = 'blog-promotion' } = body;

    // Validate required fields
    if (!name || !blogPostSlugs || !targetAudience || !scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let campaign;

    if (campaignType === 'newsletter') {
      // Create newsletter campaign
      campaign = emailMarketingManager.createNewsletterCampaign({
        name,
        featuredPosts: blogPostSlugs,
        scheduledTime: new Date(scheduledTime),
      });
    } else {
      // Create blog promotion campaign
      campaign = emailMarketingManager.createBlogPromotionCampaign({
        name,
        blogPostSlugs,
        targetAudience,
        scheduledTime: new Date(scheduledTime),
      });
    }

    // Generate subject line suggestions
    const subjectSuggestions = [
      emailMarketingManager.generateSubjectLine(blogPostSlugs[0]),
      emailMarketingManager.generateSubjectLine(blogPostSlugs[0]),
      emailMarketingManager.generateSubjectLine(blogPostSlugs[0]),
    ];

    // Segment subscribers based on target audience
    const segmentedSubscribers = emailMarketingManager.segmentSubscribers({
      interests: targetAudience.interests,
      courseEnrollments: targetAudience.courseEnrollments,
    });

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        subjectSuggestions,
        estimatedReach: segmentedSubscribers.length,
        segmentedSubscribers: segmentedSubscribers.slice(0, 10), // Return first 10 for preview
      },
    });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create email campaign' },
      { status: 500 }
    );
  }
}