/**
 * Email Marketing System
 * Handles email campaigns to drive blog traffic and engagement
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'newsletter' | 'blog-promotion' | 'course-announcement' | 'welcome-series';
  variables: string[]; // Template variables like {{firstName}}, {{blogTitle}}
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  subject: string;
  blogPostSlugs: string[];
  targetAudience: {
    segments: string[];
    interests: string[];
    courseEnrollments: string[];
  };
  scheduledTime: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
  goals: {
    targetOpenRate: number;
    targetClickRate: number;
    targetTraffic: number;
  };
}

export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  interests: string[];
  courseEnrollments: string[];
  subscriptionDate: Date;
  lastEngagement: Date;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: 'blog' | 'course-inquiry' | 'newsletter' | 'social-media';
}

export class EmailMarketingManager {
  private campaigns: Map<string, EmailCampaign> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private subscribers: Map<string, EmailSubscriber> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Create email campaign to promote blog content
   */
  createBlogPromotionCampaign(campaignData: {
    name: string;
    blogPostSlugs: string[];
    targetAudience: EmailCampaign['targetAudience'];
    scheduledTime: Date;
  }): EmailCampaign {
    const campaign: EmailCampaign = {
      id: this.generateCampaignId(),
      templateId: 'blog-promotion-template',
      subject: this.generateSubjectLine(campaignData.blogPostSlugs[0]),
      status: 'draft',
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
      },
      goals: {
        targetOpenRate: 25,
        targetClickRate: 5,
        targetTraffic: 500,
      },
      ...campaignData,
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Generate subject lines for blog promotion emails
   */
  generateSubjectLine(blogSlug: string): string {
    const subjectTemplates = {
      'dgca-cpl': [
        '🛩️ Your Complete DGCA CPL Guide is Here!',
        'Master DGCA CPL: Everything You Need to Know',
        'DGCA CPL Success: Expert Tips Inside',
      ],
      'atpl': [
        '✈️ ATPL vs CPL: Which Path is Right for You?',
        'Airline Transport Pilot License: Complete Guide',
        'ATPL Training: Your Gateway to Major Airlines',
      ],
      'type-rating': [
        '🎯 A320 vs B737: Which Type Rating to Choose?',
        'Type Rating Success: Industry Insider Tips',
        'Land Your Dream Airline Job: Type Rating Guide',
      ],
      'pilot-salary': [
        '💰 Pilot Salary in India 2024: Complete Breakdown',
        'How Much Do Pilots Really Earn in India?',
        'Aviation Career Earnings: What to Expect',
      ],
      'interview': [
        '🎤 Ace Your Pilot Interview: 50+ Expert Questions',
        'Pilot Interview Success: Insider Strategies',
        'From Application to Cockpit: Interview Guide',
      ],
    };

    // Find matching template based on blog slug
    for (const [key, templates] of Object.entries(subjectTemplates)) {
      if (blogSlug.includes(key)) {
        return templates[Math.floor(Math.random() * templates.length)];
      }
    }

    // Default subject line
    return '✈️ New Aviation Training Insights Just for You!';
  }

  /**
   * Create newsletter campaign featuring multiple blog posts
   */
  createNewsletterCampaign(campaignData: {
    name: string;
    featuredPosts: string[];
    scheduledTime: Date;
  }): EmailCampaign {
    const campaign: EmailCampaign = {
      id: this.generateCampaignId(),
      templateId: 'newsletter-template',
      subject: this.generateNewsletterSubject(),
      blogPostSlugs: campaignData.featuredPosts,
      targetAudience: {
        segments: ['newsletter-subscribers', 'blog-readers'],
        interests: ['aviation-training', 'pilot-career'],
        courseEnrollments: [],
      },
      scheduledTime: campaignData.scheduledTime,
      status: 'draft',
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
        targetClickRate: 8,
        targetTraffic: 1000,
      },
      name: campaignData.name,
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Generate newsletter subject lines
   */
  private generateNewsletterSubject(): string {
    const subjects = [
      '🛩️ This Week in Aviation Training',
      '✈️ Your Weekly Pilot Career Update',
      '📚 Latest Aviation Training Insights',
      '🎯 Weekly Aviation Training Roundup',
      '🚁 This Week\'s Top Aviation Content',
    ];

    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  /**
   * Segment subscribers for targeted campaigns
   */
  segmentSubscribers(criteria: {
    interests?: string[];
    courseEnrollments?: string[];
    engagementLevel?: 'high' | 'medium' | 'low';
    subscriptionAge?: 'new' | 'established' | 'long-term';
  }): EmailSubscriber[] {
    const allSubscribers = Array.from(this.subscribers.values());
    
    return allSubscribers.filter(subscriber => {
      // Filter by interests
      if (criteria.interests && criteria.interests.length > 0) {
        const hasMatchingInterest = criteria.interests.some(interest => 
          subscriber.interests.includes(interest)
        );
        if (!hasMatchingInterest) return false;
      }

      // Filter by course enrollments
      if (criteria.courseEnrollments && criteria.courseEnrollments.length > 0) {
        const hasMatchingCourse = criteria.courseEnrollments.some(course => 
          subscriber.courseEnrollments.includes(course)
        );
        if (!hasMatchingCourse) return false;
      }

      // Filter by engagement level (mock implementation)
      if (criteria.engagementLevel) {
        const daysSinceLastEngagement = Math.floor(
          (Date.now() - subscriber.lastEngagement.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        switch (criteria.engagementLevel) {
          case 'high':
            if (daysSinceLastEngagement > 7) return false;
            break;
          case 'medium':
            if (daysSinceLastEngagement <= 7 || daysSinceLastEngagement > 30) return false;
            break;
          case 'low':
            if (daysSinceLastEngagement <= 30) return false;
            break;
        }
      }

      // Filter by subscription age
      if (criteria.subscriptionAge) {
        const daysSinceSubscription = Math.floor(
          (Date.now() - subscriber.subscriptionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        switch (criteria.subscriptionAge) {
          case 'new':
            if (daysSinceSubscription > 30) return false;
            break;
          case 'established':
            if (daysSinceSubscription <= 30 || daysSinceSubscription > 180) return false;
            break;
          case 'long-term':
            if (daysSinceSubscription <= 180) return false;
            break;
        }
      }

      return subscriber.status === 'active';
    });
  }

  /**
   * Get email campaign analytics
   */
  getCampaignAnalytics(campaignId: string): {
    campaign: EmailCampaign;
    performance: {
      openRate: number;
      clickRate: number;
      unsubscribeRate: number;
      bounceRate: number;
      trafficGenerated: number;
      conversionRate: number;
    };
    recommendations: string[];
  } | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;

    const { metrics } = campaign;
    const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
    const clickRate = metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0;
    const unsubscribeRate = metrics.sent > 0 ? (metrics.unsubscribed / metrics.sent) * 100 : 0;
    const bounceRate = metrics.sent > 0 ? (metrics.bounced / metrics.sent) * 100 : 0;

    const recommendations: string[] = [];
    
    if (openRate < campaign.goals.targetOpenRate) {
      recommendations.push('Improve subject line with more compelling copy');
      recommendations.push('Test different send times for better engagement');
    }
    
    if (clickRate < campaign.goals.targetClickRate) {
      recommendations.push('Add more compelling call-to-action buttons');
      recommendations.push('Include more personalized content');
    }
    
    if (unsubscribeRate > 2) {
      recommendations.push('Review content relevance to audience');
      recommendations.push('Reduce email frequency');
    }

    return {
      campaign,
      performance: {
        openRate,
        clickRate,
        unsubscribeRate,
        bounceRate,
        trafficGenerated: metrics.clicked * 0.8, // Assume 80% click-through to site
        conversionRate: metrics.clicked * 0.05, // Assume 5% conversion rate
      },
      recommendations,
    };
  }

  /**
   * Initialize default email templates
   */
  private initializeDefaultTemplates(): void {
    const blogPromotionTemplate: EmailTemplate = {
      id: 'blog-promotion-template',
      name: 'Blog Post Promotion',
      subject: '{{subject}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{subject}}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Aviators Training Centre</h1>
            <p style="color: #e6fffa; margin: 10px 0 0 0;">Your Aviation Career Partner</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0f766e; margin-top: 0;">{{blogTitle}}</h2>
            
            <p>Hi {{firstName}},</p>
            
            <p>We've just published a comprehensive guide that we think you'll find valuable for your aviation career:</p>
            
            <div style="background: #f0fdfa; padding: 20px; border-left: 4px solid #0f766e; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f766e;">{{blogTitle}}</h3>
              <p style="margin-bottom: 0;">{{blogExcerpt}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{blogUrl}}" style="background: #0f766e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Read Full Article</a>
            </div>
            
            <p>This guide covers:</p>
            <ul>
              <li>{{keyPoint1}}</li>
              <li>{{keyPoint2}}</li>
              <li>{{keyPoint3}}</li>
            </ul>
            
            <p>Have questions about your aviation career? <a href="https://aviatorstrainingcentre.com/contact" style="color: #0f766e;">Book a free consultation</a> with our experts.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Aviators Training Centre Team<br>
              <a href="https://aviatorstrainingcentre.com" style="color: #0f766e;">aviatorstrainingcentre.com</a>
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
              You're receiving this email because you subscribed to our aviation training updates.<br>
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a> | <a href="{{preferencesUrl}}" style="color: #9ca3af;">Update Preferences</a>
            </p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        {{blogTitle}}
        
        Hi {{firstName}},
        
        We've just published a comprehensive guide that we think you'll find valuable for your aviation career:
        
        {{blogTitle}}
        {{blogExcerpt}}
        
        Read the full article: {{blogUrl}}
        
        This guide covers:
        - {{keyPoint1}}
        - {{keyPoint2}}
        - {{keyPoint3}}
        
        Have questions about your aviation career? Book a free consultation with our experts: https://aviatorstrainingcentre.com/contact
        
        Best regards,
        The Aviators Training Centre Team
        https://aviatorstrainingcentre.com
        
        You're receiving this email because you subscribed to our aviation training updates.
        Unsubscribe: {{unsubscribeUrl}}
      `,
      type: 'blog-promotion',
      variables: ['firstName', 'blogTitle', 'blogExcerpt', 'blogUrl', 'keyPoint1', 'keyPoint2', 'keyPoint3', 'unsubscribeUrl', 'preferencesUrl'],
    };

    const newsletterTemplate: EmailTemplate = {
      id: 'newsletter-template',
      name: 'Weekly Newsletter',
      subject: '{{subject}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{subject}}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Aviation Training Weekly</h1>
            <p style="color: #e6fffa; margin: 10px 0 0 0;">Your Weekly Dose of Aviation Insights</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi {{firstName}},</p>
            
            <p>Here are this week's top aviation training insights and career guidance:</p>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">📚 Featured Articles</h3>
              
              {{#featuredPosts}}
              <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #0f766e;">
                <h4 style="margin-top: 0; color: #0f766e;">{{title}}</h4>
                <p>{{excerpt}}</p>
                <a href="{{url}}" style="color: #0f766e; font-weight: bold;">Read More →</a>
              </div>
              {{/featuredPosts}}
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #92400e;">🎯 This Week's Tip</h3>
              <p style="margin-bottom: 0;">{{weeklyTip}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://aviatorstrainingcentre.com/blog" style="background: #0f766e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Visit Our Blog</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Aviators Training Centre Team<br>
              <a href="https://aviatorstrainingcentre.com" style="color: #0f766e;">aviatorstrainingcentre.com</a>
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
              You're receiving this weekly newsletter because you subscribed to our aviation training updates.<br>
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a> | <a href="{{preferencesUrl}}" style="color: #9ca3af;">Update Preferences</a>
            </p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Aviation Training Weekly
        
        Hi {{firstName}},
        
        Here are this week's top aviation training insights and career guidance:
        
        FEATURED ARTICLES:
        {{#featuredPosts}}
        {{title}}
        {{excerpt}}
        Read more: {{url}}
        
        {{/featuredPosts}}
        
        THIS WEEK'S TIP:
        {{weeklyTip}}
        
        Visit our blog for more content: https://aviatorstrainingcentre.com/blog
        
        Best regards,
        The Aviators Training Centre Team
        https://aviatorstrainingcentre.com
        
        Unsubscribe: {{unsubscribeUrl}}
      `,
      type: 'newsletter',
      variables: ['firstName', 'featuredPosts', 'weeklyTip', 'unsubscribeUrl', 'preferencesUrl'],
    };

    this.templates.set(blogPromotionTemplate.id, blogPromotionTemplate);
    this.templates.set(newsletterTemplate.id, newsletterTemplate);
  }

  private generateCampaignId(): string {
    return `email_campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const emailMarketingManager = new EmailMarketingManager();
