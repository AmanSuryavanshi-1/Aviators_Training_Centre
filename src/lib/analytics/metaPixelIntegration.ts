// Meta Pixel Data Correlation and Social Media Attribution System

import { TrafficSource } from '../firebase/types';
import { TrafficSourceTracker } from './trafficSourceTracker';

export interface MetaPixelEvent {
  event_name: string;
  event_time: number;
  user_data: {
    em?: string; // email hash
    ph?: string; // phone hash
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
    num_items?: number;
  };
  action_source: 'website' | 'app' | 'phone_call' | 'chat' | 'email' | 'other';
  event_source_url?: string;
  opt_out?: boolean;
}

export interface FacebookAdAttribution {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  placement?: string;
  attribution_window?: string;
  click_time?: number;
  view_time?: number;
}

export interface SocialMediaTrafficData {
  source: TrafficSource;
  isOrganic: boolean;
  isPaid: boolean;
  adAttribution?: FacebookAdAttribution;
  metaPixelData?: MetaPixelEvent;
  engagementMetrics: {
    socialClicks: number;
    socialShares: number;
    socialComments: number;
    socialLikes: number;
  };
}

export interface ConversionAttributionData {
  conversionId: string;
  conversionType: string;
  conversionValue: number;
  currency: string;
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  touchpoints: Array<{
    source: TrafficSource;
    timestamp: Date;
    attribution_weight: number;
    conversion_contribution: number;
  }>;
  socialMediaContribution: {
    facebook: number;
    instagram: number;
    total_social: number;
  };
}

export class MetaPixelIntegration {
  private trafficSourceTracker: TrafficSourceTracker;
  private pixelId: string;
  private accessToken: string;

  constructor(pixelId: string, accessToken: string) {
    this.trafficSourceTracker = new TrafficSourceTracker();
    this.pixelId = pixelId;
    this.accessToken = accessToken;
  }

  /**
   * Correlate Meta Pixel events with internal analytics tracking
   */
  async correlatePixelEvents(
    internalAnalyticsData: {
      userId: string;
      sessionId: string;
      timestamp: Date;
      source: TrafficSource;
    },
    timeWindow: number = 300000 // 5 minutes in milliseconds
  ): Promise<{
    correlation: 'matched' | 'partial' | 'no_match';
    pixelEvents: MetaPixelEvent[];
    confidence: number;
  }> {
    try {
      // Get Meta Pixel events within time window
      const pixelEvents = await this.getPixelEventsInTimeWindow(
        internalAnalyticsData.timestamp,
        timeWindow
      );

      if (pixelEvents.length === 0) {
        return {
          correlation: 'no_match',
          pixelEvents: [],
          confidence: 0
        };
      }

      // Find matching events based on user data and timing
      const matchingEvents = this.findMatchingPixelEvents(
        pixelEvents,
        internalAnalyticsData
      );

      if (matchingEvents.length === 0) {
        return {
          correlation: 'no_match',
          pixelEvents,
          confidence: 20
        };
      }

      // Calculate correlation confidence
      const confidence = this.calculateCorrelationConfidence(
        matchingEvents,
        internalAnalyticsData
      );

      return {
        correlation: confidence > 70 ? 'matched' : 'partial',
        pixelEvents: matchingEvents,
        confidence
      };
    } catch (error) {
      console.error('Error correlating pixel events:', error);
      return {
        correlation: 'no_match',
        pixelEvents: [],
        confidence: 0
      };
    }
  }

  /**
   * Implement Facebook/Instagram ad attribution
   */
  async attributeFacebookAds(
    userId: string,
    conversionEvent: {
      type: string;
      value: number;
      currency: string;
      timestamp: Date;
    }
  ): Promise<FacebookAdAttribution | null> {
    try {
      // Get Facebook click ID from user session
      const fbc = this.getFacebookClickId(userId);
      if (!fbc) {
        return null;
      }

      // Query Facebook Marketing API for attribution data
      const attributionData = await this.queryFacebookAttribution(fbc, conversionEvent);
      
      if (!attributionData) {
        return null;
      }

      return {
        campaign_id: attributionData.campaign_id,
        campaign_name: attributionData.campaign_name,
        adset_id: attributionData.adset_id,
        adset_name: attributionData.adset_name,
        ad_id: attributionData.ad_id,
        ad_name: attributionData.ad_name,
        placement: attributionData.placement,
        attribution_window: attributionData.attribution_window,
        click_time: attributionData.click_time,
        view_time: attributionData.view_time
      };
    } catch (error) {
      console.error('Error attributing Facebook ads:', error);
      return null;
    }
  }

  /**
   * Differentiate between organic and paid social media traffic
   */
  async differentiateSocialTraffic(
    trafficSource: TrafficSource,
    additionalData: {
      referrer: string;
      userAgent: string;
      url: string;
      userId: string;
    }
  ): Promise<SocialMediaTrafficData> {
    const socialMediaTrafficData: SocialMediaTrafficData = {
      source: trafficSource,
      isOrganic: true,
      isPaid: false,
      engagementMetrics: {
        socialClicks: 0,
        socialShares: 0,
        socialComments: 0,
        socialLikes: 0
      }
    };

    // Check if traffic is from Facebook or Instagram
    if (['Facebook', 'Instagram'].includes(trafficSource.source)) {
      // Check for Facebook click ID (indicates paid traffic)
      const fbc = this.extractFacebookClickId(additionalData.url, additionalData.userId);
      
      if (fbc) {
        socialMediaTrafficData.isPaid = true;
        socialMediaTrafficData.isOrganic = false;
        
        // Get ad attribution data
        socialMediaTrafficData.adAttribution = await this.getFacebookAdData(fbc);
      }

      // Check for UTM parameters indicating paid campaigns
      const utmParams = this.trafficSourceTracker.parseUTMParameters(additionalData.url);
      if (utmParams.medium && ['cpc', 'paid', 'ppc'].includes(utmParams.medium.toLowerCase())) {
        socialMediaTrafficData.isPaid = true;
        socialMediaTrafficData.isOrganic = false;
      }

      // Get Meta Pixel data if available
      socialMediaTrafficData.metaPixelData = await this.getAssociatedPixelEvent(
        additionalData.userId,
        new Date()
      );

      // Get engagement metrics
      socialMediaTrafficData.engagementMetrics = await this.getSocialEngagementMetrics(
        trafficSource.source,
        additionalData.userId
      );
    }

    return socialMediaTrafficData;
  }

  /**
   * Create conversion attribution pipeline for social media campaigns
   */
  async createConversionAttribution(
    conversionData: {
      conversionId: string;
      type: string;
      value: number;
      currency: string;
      userId: string;
      timestamp: Date;
    },
    userJourneyTouchpoints: Array<{
      source: TrafficSource;
      timestamp: Date;
    }>,
    attributionModel: ConversionAttributionData['attributionModel'] = 'last_touch'
  ): Promise<ConversionAttributionData> {
    // Filter social media touchpoints
    const socialTouchpoints = userJourneyTouchpoints.filter(
      touchpoint => touchpoint.source.category === 'social'
    );

    // Calculate attribution weights based on model
    const touchpointsWithWeights = this.calculateAttributionWeights(
      userJourneyTouchpoints,
      attributionModel
    );

    // Calculate social media contribution
    const socialMediaContribution = this.calculateSocialMediaContribution(
      touchpointsWithWeights,
      conversionData.value
    );

    // Get Facebook ad attribution if applicable
    const facebookAttribution = await this.attributeFacebookAds(
      conversionData.userId,
      {
        type: conversionData.type,
        value: conversionData.value,
        currency: conversionData.currency,
        timestamp: conversionData.timestamp
      }
    );

    return {
      conversionId: conversionData.conversionId,
      conversionType: conversionData.type,
      conversionValue: conversionData.value,
      currency: conversionData.currency,
      attributionModel,
      touchpoints: touchpointsWithWeights,
      socialMediaContribution
    };
  }

  /**
   * Get Meta Pixel events within a time window
   */
  private async getPixelEventsInTimeWindow(
    timestamp: Date,
    timeWindow: number
  ): Promise<MetaPixelEvent[]> {
    // This would typically query the Facebook Marketing API
    // For now, return mock data structure
    return [];
  }

  /**
   * Find matching pixel events based on user data and timing
   */
  private findMatchingPixelEvents(
    pixelEvents: MetaPixelEvent[],
    internalData: any
  ): MetaPixelEvent[] {
    return pixelEvents.filter(event => {
      // Match based on IP address, user agent, and timing
      const ipMatch = event.user_data.client_ip_address === internalData.ipAddress;
      const uaMatch = event.user_data.client_user_agent === internalData.userAgent;
      const timeMatch = Math.abs(event.event_time * 1000 - internalData.timestamp.getTime()) < 60000;
      
      return (ipMatch || uaMatch) && timeMatch;
    });
  }

  /**
   * Calculate correlation confidence between pixel and internal events
   */
  private calculateCorrelationConfidence(
    matchingEvents: MetaPixelEvent[],
    internalData: any
  ): number {
    if (matchingEvents.length === 0) return 0;
    
    let confidence = 50; // Base confidence
    
    // Increase confidence based on matching factors
    matchingEvents.forEach(event => {
      if (event.user_data.client_ip_address) confidence += 20;
      if (event.user_data.client_user_agent) confidence += 15;
      if (event.user_data.fbc || event.user_data.fbp) confidence += 25;
      if (event.event_source_url) confidence += 10;
    });
    
    return Math.min(confidence, 100);
  }

  /**
   * Extract Facebook click ID from URL or user session
   */
  private extractFacebookClickId(url: string, userId: string): string | null {
    try {
      const urlObj = new URL(url);
      const fbclid = urlObj.searchParams.get('fbclid');
      
      if (fbclid) {
        return `fb.1.${Date.now()}.${fbclid}`;
      }
      
      // Check for stored Facebook click ID in user session
      return this.getFacebookClickId(userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Facebook click ID from user session storage
   */
  private getFacebookClickId(userId: string): string | null {
    // This would typically query your user session storage
    // For now, return null
    return null;
  }

  /**
   * Query Facebook Marketing API for attribution data
   */
  private async queryFacebookAttribution(
    fbc: string,
    conversionEvent: any
  ): Promise<any> {
    // This would make actual API calls to Facebook Marketing API
    // For now, return null
    return null;
  }

  /**
   * Get Facebook ad data from click ID
   */
  private async getFacebookAdData(fbc: string): Promise<FacebookAdAttribution | undefined> {
    // This would query Facebook Marketing API
    // For now, return undefined
    return undefined;
  }

  /**
   * Get associated Meta Pixel event for user
   */
  private async getAssociatedPixelEvent(
    userId: string,
    timestamp: Date
  ): Promise<MetaPixelEvent | undefined> {
    // This would query your pixel event storage
    // For now, return undefined
    return undefined;
  }

  /**
   * Get social engagement metrics
   */
  private async getSocialEngagementMetrics(
    source: string,
    userId: string
  ): Promise<SocialMediaTrafficData['engagementMetrics']> {
    // This would query your social engagement tracking
    return {
      socialClicks: 0,
      socialShares: 0,
      socialComments: 0,
      socialLikes: 0
    };
  }

  /**
   * Calculate attribution weights based on model
   */
  private calculateAttributionWeights(
    touchpoints: Array<{ source: TrafficSource; timestamp: Date }>,
    model: ConversionAttributionData['attributionModel']
  ): ConversionAttributionData['touchpoints'] {
    const totalTouchpoints = touchpoints.length;
    
    return touchpoints.map((touchpoint, index) => {
      let weight = 0;
      
      switch (model) {
        case 'first_touch':
          weight = index === 0 ? 1 : 0;
          break;
        case 'last_touch':
          weight = index === totalTouchpoints - 1 ? 1 : 0;
          break;
        case 'linear':
          weight = 1 / totalTouchpoints;
          break;
        case 'time_decay':
          // More recent touchpoints get higher weight
          weight = Math.pow(2, index) / (Math.pow(2, totalTouchpoints) - 1);
          break;
        case 'position_based':
          // 40% first, 40% last, 20% distributed among middle
          if (index === 0) weight = 0.4;
          else if (index === totalTouchpoints - 1) weight = 0.4;
          else weight = 0.2 / (totalTouchpoints - 2);
          break;
      }
      
      return {
        source: touchpoint.source,
        timestamp: touchpoint.timestamp,
        attribution_weight: weight,
        conversion_contribution: 0 // Will be calculated based on conversion value
      };
    });
  }

  /**
   * Calculate social media contribution to conversion
   */
  private calculateSocialMediaContribution(
    touchpoints: ConversionAttributionData['touchpoints'],
    conversionValue: number
  ): ConversionAttributionData['socialMediaContribution'] {
    let facebook = 0;
    let instagram = 0;
    
    touchpoints.forEach(touchpoint => {
      if (touchpoint.source.category === 'social') {
        const contribution = conversionValue * touchpoint.attribution_weight;
        touchpoint.conversion_contribution = contribution;
        
        if (touchpoint.source.source === 'Facebook') {
          facebook += contribution;
        } else if (touchpoint.source.source === 'Instagram') {
          instagram += contribution;
        }
      }
    });
    
    return {
      facebook,
      instagram,
      total_social: facebook + instagram
    };
  }

  /**
   * Send conversion event to Meta Pixel
   */
  async sendConversionToPixel(
    conversionData: ConversionAttributionData,
    userPixelData: {
      fbp?: string;
      fbc?: string;
      email?: string;
      phone?: string;
      clientIpAddress?: string;
      clientUserAgent?: string;
    }
  ): Promise<boolean> {
    try {
      const pixelEvent: MetaPixelEvent = {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: userPixelData.email ? this.hashEmail(userPixelData.email) : undefined,
          ph: userPixelData.phone ? this.hashPhone(userPixelData.phone) : undefined,
          client_ip_address: userPixelData.clientIpAddress,
          client_user_agent: userPixelData.clientUserAgent,
          fbc: userPixelData.fbc,
          fbp: userPixelData.fbp
        },
        custom_data: {
          value: conversionData.conversionValue,
          currency: conversionData.currency,
          content_type: 'product'
        },
        action_source: 'website'
      };

      // Send to Meta Pixel API
      const response = await this.sendPixelEvent(pixelEvent);
      return response.success;
    } catch (error) {
      console.error('Error sending conversion to pixel:', error);
      return false;
    }
  }

  /**
   * Hash email for Meta Pixel
   */
  private hashEmail(email: string): string {
    // This would use a proper hashing library like crypto
    // For now, return the email (in production, this should be hashed)
    return email.toLowerCase().trim();
  }

  /**
   * Hash phone for Meta Pixel
   */
  private hashPhone(phone: string): string {
    // This would use a proper hashing library like crypto
    // For now, return the phone (in production, this should be hashed)
    return phone.replace(/\D/g, '');
  }

  /**
   * Send pixel event to Meta
   */
  private async sendPixelEvent(event: MetaPixelEvent): Promise<{ success: boolean }> {
    // This would make actual API call to Meta Pixel API
    // For now, return success
    return { success: true };
  }
}