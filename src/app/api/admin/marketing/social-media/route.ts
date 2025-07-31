import { NextRequest, NextResponse } from 'next/server';
import { socialMediaManager } from '@/lib/marketing/social-media-promotion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    
    // Mock campaigns data (in real implementation, this would come from database)
    const campaigns = [
      {
        id: 'social_campaign_1',
        name: 'Blog Content Promotion - January 2024',
        blogPostSlugs: ['dgca-cpl-complete-guide-2024', 'pilot-salary-india-2024-career-earnings-guide'],
        platforms: ['linkedin', 'twitter', 'facebook'],
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'active',
        posts: [
          {
            id: 'post_1',
            platform: 'linkedin',
            content: '🛩️ Complete DGCA CPL Guide 2024...',
            hashtags: ['#Aviation', '#PilotTraining', '#DGCA'],
            scheduledTime: new Date('2024-01-16T10:00:00Z'),
            blogPostSlug: 'dgca-cpl-complete-guide-2024',
            status: 'published',
            engagement: { likes: 45, shares: 12, comments: 8, clicks: 23 },
          },
          {
            id: 'post_2',
            platform: 'twitter',
            content: '✈️ Pilot Salary Guide India 2024...',
            hashtags: ['#Aviation', '#PilotSalary', '#Career'],
            scheduledTime: new Date('2024-01-17T14:00:00Z'),
            blogPostSlug: 'pilot-salary-india-2024-career-earnings-guide',
            status: 'published',
            engagement: { likes: 28, shares: 6, comments: 4, clicks: 15 },
          },
        ],
        goals: {
          targetReach: 10000,
          targetEngagement: 500,
          targetClicks: 200,
        },
      },
      {
        id: 'social_campaign_2',
        name: 'Aviation Career Awareness Campaign',
        blogPostSlugs: ['airline-industry-career-opportunities-beyond-pilot-jobs', 'aviation-technology-trends-future-flying-2024'],
        platforms: ['linkedin', 'instagram'],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28'),
        status: 'scheduled',
        posts: [],
        goals: {
          targetReach: 8000,
          targetEngagement: 400,
          targetClicks: 150,
        },
      },
    ];

    // Filter campaigns
    let filteredCampaigns = campaigns;
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }
    if (platform) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.platforms.includes(platform as any)
      );
    }

    // Get platform strategies
    const platformStrategies = socialMediaManager.getPlatformStrategies();

    // Calculate summary metrics
    const totalPosts = campaigns.reduce((sum, campaign) => sum + campaign.posts.length, 0);
    const totalEngagement = campaigns.reduce((sum, campaign) => 
      sum + campaign.posts.reduce((postSum, post) => 
        postSum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
      ), 0
    );
    const totalClicks = campaigns.reduce((sum, campaign) => 
      sum + campaign.posts.reduce((postSum, post) => postSum + post.engagement.clicks, 0), 0
    );

    return NextResponse.json({
      success: true,
      data: {
        campaigns: filteredCampaigns,
        platformStrategies,
        summary: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          totalPosts,
          totalEngagement,
          totalClicks,
          averageEngagementRate: totalPosts > 0 ? (totalEngagement / totalPosts) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching social media campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social media campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, blogPostSlugs, platforms, startDate, endDate, goals } = body;

    // Validate required fields
    if (!name || !blogPostSlugs || !platforms || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new social media campaign
    const campaign = socialMediaManager.createPromotionCampaign({
      name,
      blogPostSlugs,
      platforms,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'draft',
      goals: goals || {
        targetReach: 5000,
        targetEngagement: 250,
        targetClicks: 100,
      },
    });

    // Generate social content for the first blog post
    const sampleBlogPost = {
      title: 'Sample Blog Post Title',
      slug: blogPostSlugs[0],
      excerpt: 'This is a sample excerpt for the blog post...',
      category: 'aviation-training',
    };

    const socialContent = socialMediaManager.generateSocialContent(sampleBlogPost);

    // Schedule optimal posts
    const scheduledPosts = socialMediaManager.scheduleOptimalPosts(campaign.id, blogPostSlugs);

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        socialContent,
        scheduledPosts,
      },
    });
  } catch (error) {
    console.error('Error creating social media campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create social media campaign' },
      { status: 500 }
    );
  }
}
