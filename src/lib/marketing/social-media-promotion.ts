/**
 * Social Media Promotion System
 * Handles social media campaigns for blog content promotion
 */

export interface SocialMediaPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube';
  content: string;
  hashtags: string[];
  scheduledTime: Date;
  blogPostSlug: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  mediaUrls?: string[];
}

export interface SocialMediaCampaign {
  id: string;
  name: string;
  blogPostSlugs: string[];
  platforms: SocialMediaPost['platform'][];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paused' | 'completed';
  posts: SocialMediaPost[];
  goals: {
    targetReach: number;
    targetEngagement: number;
    targetClicks: number;
  };
}

export class SocialMediaPromotionManager {
  private campaigns: Map<string, SocialMediaCampaign> = new Map();

  /**
   * Create social media promotion campaign for blog posts
   */
  createPromotionCampaign(campaignData: Omit<SocialMediaCampaign, 'id' | 'posts'>): SocialMediaCampaign {
    const campaign: SocialMediaCampaign = {
      ...campaignData,
      id: this.generateCampaignId(),
      posts: [],
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Generate social media content for aviation blog posts
   */
  generateSocialContent(blogPost: {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
  }): Record<SocialMediaPost['platform'], Omit<SocialMediaPost, 'id' | 'engagement'>> {
    const baseUrl = 'https://www.aviatorstrainingcentre.in/blog';
    const postUrl = `${baseUrl}/${blogPost.slug}`;

    return {
      linkedin: {
        platform: 'linkedin',
        content: `🛩️ ${blogPost.title}

${blogPost.excerpt}

Perfect for aspiring pilots and aviation professionals looking to advance their careers.

Read the full guide: ${postUrl}

#Aviation #PilotTraining #DGCA #AviationCareer #CommercialPilot`,
        hashtags: ['#Aviation', '#PilotTraining', '#DGCA', '#AviationCareer', '#CommercialPilot'],
        scheduledTime: new Date(),
        blogPostSlug: blogPost.slug,
        status: 'draft',
        mediaUrls: [`/images/blog/${blogPost.slug}-social.jpg`],
      },

      twitter: {
        platform: 'twitter',
        content: `🛩️ ${blogPost.title}

${blogPost.excerpt.substring(0, 120)}...

Full guide: ${postUrl}

#Aviation #PilotTraining #DGCA`,
        hashtags: ['#Aviation', '#PilotTraining', '#DGCA'],
        scheduledTime: new Date(),
        blogPostSlug: blogPost.slug,
        status: 'draft',
        mediaUrls: [`/images/blog/${blogPost.slug}-twitter.jpg`],
      },

      facebook: {
        platform: 'facebook',
        content: `✈️ ${blogPost.title}

${blogPost.excerpt}

Whether you're just starting your aviation journey or looking to advance your pilot career, this comprehensive guide has everything you need to know.

👨‍✈️ Written by experienced airline pilots
📚 Based on latest DGCA regulations
🎯 Practical tips and real-world insights

Read more: ${postUrl}

#AviationTraining #PilotLife #DGCA #AviationCareer`,
        hashtags: ['#AviationTraining', '#PilotLife', '#DGCA', '#AviationCareer'],
        scheduledTime: new Date(),
        blogPostSlug: blogPost.slug,
        status: 'draft',
        mediaUrls: [`/images/blog/${blogPost.slug}-facebook.jpg`],
      },

      instagram: {
        platform: 'instagram',
        content: `✈️ ${blogPost.title}

${blogPost.excerpt}

Swipe to learn more about aviation training! 👆

Link in bio for full article 🔗

#aviation #pilottraining #dgca #aviationcareer #commercialpilot #pilotlife #aviationacademy #flighttraining`,
        hashtags: ['#aviation', '#pilottraining', '#dgca', '#aviationcareer', '#commercialpilot', '#pilotlife', '#aviationacademy', '#flighttraining'],
        scheduledTime: new Date(),
        blogPostSlug: blogPost.slug,
        status: 'draft',
        mediaUrls: [
          `/images/blog/${blogPost.slug}-instagram-1.jpg`,
          `/images/blog/${blogPost.slug}-instagram-2.jpg`,
          `/images/blog/${blogPost.slug}-instagram-3.jpg`,
        ],
      },

      youtube: {
        platform: 'youtube',
        content: `🎥 New Video: ${blogPost.title}

In this comprehensive video, we cover:
${blogPost.excerpt}

Perfect for:
✅ Aspiring commercial pilots
✅ DGCA exam candidates
✅ Aviation career changers
✅ Flight training students

📖 Read the detailed blog post: ${postUrl}
📞 Book a free consultation: https://www.aviatorstrainingcentre.in/contact

Subscribe for more aviation training content!

#Aviation #PilotTraining #DGCA #AviationCareer #FlightTraining`,
        hashtags: ['#Aviation', '#PilotTraining', '#DGCA', '#AviationCareer', '#FlightTraining'],
        scheduledTime: new Date(),
        blogPostSlug: blogPost.slug,
        status: 'draft',
        mediaUrls: [`/images/blog/${blogPost.slug}-youtube-thumbnail.jpg`],
      },
    };
  }

  /**
   * Get platform-specific posting strategies
   */
  getPlatformStrategies(): Record<SocialMediaPost['platform'], {
    bestTimes: string[];
    contentTypes: string[];
    hashtagLimits: number;
    engagementTips: string[];
  }> {
    return {
      linkedin: {
        bestTimes: ['Tuesday 10-11 AM', 'Wednesday 8-9 AM', 'Thursday 9-10 AM'],
        contentTypes: ['Professional insights', 'Career advice', 'Industry news', 'Educational content'],
        hashtagLimits: 5,
        engagementTips: [
          'Ask questions to encourage comments',
          'Share personal experiences',
          'Tag relevant aviation professionals',
          'Use professional tone',
        ],
      },
      twitter: {
        bestTimes: ['Monday 8-9 AM', 'Tuesday 10-11 AM', 'Wednesday 9-10 AM'],
        contentTypes: ['Quick tips', 'Industry updates', 'Thread series', 'Polls'],
        hashtagLimits: 3,
        engagementTips: [
          'Create Twitter threads for complex topics',
          'Engage with aviation community',
          'Retweet relevant content',
          'Use trending aviation hashtags',
        ],
      },
      facebook: {
        bestTimes: ['Tuesday 9-10 AM', 'Wednesday 1-2 PM', 'Thursday 1-2 PM'],
        contentTypes: ['Detailed posts', 'Video content', 'Live sessions', 'Community discussions'],
        hashtagLimits: 10,
        engagementTips: [
          'Create Facebook groups for aviation enthusiasts',
          'Share behind-the-scenes content',
          'Host live Q&A sessions',
          'Encourage user-generated content',
        ],
      },
      instagram: {
        bestTimes: ['Monday 11 AM-1 PM', 'Tuesday 5-6 PM', 'Wednesday 5-6 PM'],
        contentTypes: ['Visual stories', 'Carousel posts', 'Reels', 'IGTV'],
        hashtagLimits: 30,
        engagementTips: [
          'Use high-quality aviation imagery',
          'Create Instagram Stories highlights',
          'Partner with aviation influencers',
          'Use location tags for aviation schools',
        ],
      },
      youtube: {
        bestTimes: ['Saturday 9-11 AM', 'Sunday 9-11 AM', 'Wednesday 2-4 PM'],
        contentTypes: ['Educational videos', 'Tutorials', 'Interviews', 'Webinars'],
        hashtagLimits: 15,
        engagementTips: [
          'Create playlists for different topics',
          'Optimize video thumbnails',
          'Add closed captions',
          'Encourage subscriptions and notifications',
        ],
      },
    };
  }

  /**
   * Schedule posts for optimal engagement
   */
  scheduleOptimalPosts(campaignId: string, blogPosts: string[]): SocialMediaPost[] {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return [];

    const scheduledPosts: SocialMediaPost[] = [];
    const strategies = this.getPlatformStrategies();

    blogPosts.forEach((slug, index) => {
      campaign.platforms.forEach(platform => {
        const strategy = strategies[platform];
        const scheduleDate = new Date();
        scheduleDate.setDate(scheduleDate.getDate() + index);
        
        // Set optimal posting time based on platform strategy
        const optimalTime = strategy.bestTimes[0]; // Use first optimal time
        const [time, period] = optimalTime.split(' ')[1].split('-')[0].split(' ');
        const [hour, minute] = time.split(':').map(Number);
        
        scheduleDate.setHours(period === 'PM' && hour !== 12 ? hour + 12 : hour);
        scheduleDate.setMinutes(minute || 0);

        const post: SocialMediaPost = {
          id: this.generatePostId(),
          platform,
          content: `Sample content for ${slug} on ${platform}`,
          hashtags: this.getRelevantHashtags(platform, slug),
          scheduledTime: scheduleDate,
          blogPostSlug: slug,
          status: 'scheduled',
          engagement: { likes: 0, shares: 0, comments: 0, clicks: 0 },
        };

        scheduledPosts.push(post);
        campaign.posts.push(post);
      });
    });

    this.campaigns.set(campaignId, campaign);
    return scheduledPosts;
  }

  /**
   * Get relevant hashtags for platform and content
   */
  private getRelevantHashtags(platform: SocialMediaPost['platform'], blogSlug: string): string[] {
    const baseHashtags = ['#Aviation', '#PilotTraining', '#DGCA', '#AviationCareer'];
    
    const topicHashtags: Record<string, string[]> = {
      'dgca-cpl': ['#CPL', '#CommercialPilot', '#DGCAExam'],
      'atpl': ['#ATPL', '#AirlineTransportPilot', '#ATPLTraining'],
      'type-rating': ['#TypeRating', '#A320', '#B737', '#AirlineTraining'],
      'rtr': ['#RTR', '#RadioTelephony', '#AviationCommunication'],
      'interview': ['#PilotInterview', '#AviationJobs', '#CareerTips'],
      'salary': ['#PilotSalary', '#AviationSalary', '#CareerGrowth'],
      'medical': ['#AviationMedical', '#PilotMedical', '#DGCAMedical'],
    };

    let relevantHashtags = [...baseHashtags];
    
    Object.entries(topicHashtags).forEach(([topic, hashtags]) => {
      if (blogSlug.includes(topic)) {
        relevantHashtags.push(...hashtags);
      }
    });

    const strategies = this.getPlatformStrategies();
    const limit = strategies[platform].hashtagLimits;
    
    return relevantHashtags.slice(0, limit);
  }

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics(campaignId: string): {
    totalReach: number;
    totalEngagement: number;
    totalClicks: number;
    platformBreakdown: Record<SocialMediaPost['platform'], {
      posts: number;
      engagement: number;
      clicks: number;
    }>;
    topPerformingPosts: SocialMediaPost[];
  } | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;

    const platformBreakdown = {} as any;
    let totalReach = 0;
    let totalEngagement = 0;
    let totalClicks = 0;

    campaign.platforms.forEach(platform => {
      const platformPosts = campaign.posts.filter(post => post.platform === platform);
      const platformEngagement = platformPosts.reduce((sum, post) => 
        sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0);
      const platformClicks = platformPosts.reduce((sum, post) => sum + post.engagement.clicks, 0);

      platformBreakdown[platform] = {
        posts: platformPosts.length,
        engagement: platformEngagement,
        clicks: platformClicks,
      };

      totalEngagement += platformEngagement;
      totalClicks += platformClicks;
    });

    // Mock reach calculation
    totalReach = campaign.posts.length * 1000; // Assume 1000 reach per post

    const topPerformingPosts = campaign.posts
      .sort((a, b) => {
        const aScore = a.engagement.likes + a.engagement.shares + a.engagement.comments;
        const bScore = b.engagement.likes + b.engagement.shares + b.engagement.comments;
        return bScore - aScore;
      })
      .slice(0, 5);

    return {
      totalReach,
      totalEngagement,
      totalClicks,
      platformBreakdown,
      topPerformingPosts,
    };
  }

  private generateCampaignId(): string {
    return `social_campaign_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  }

  private generatePostId(): string {
    return `social_post_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  }
}

// Export singleton instance
export const socialMediaManager = new SocialMediaPromotionManager();
