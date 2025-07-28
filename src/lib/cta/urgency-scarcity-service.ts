import { client } from '@/lib/sanity/client';

// Types for urgency and scarcity data
export interface CourseAvailability {
  courseId: string;
  courseName: string;
  totalSeats: number;
  availableSeats: number;
  batchStartDate: Date;
  enrollmentDeadline: Date;
  batchName: string;
  lastUpdated: Date;
}

export interface DiscountOffer {
  id: string;
  courseName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  offerType: 'early-bird' | 'limited-time' | 'flash-sale' | 'seasonal';
  isActive: boolean;
  maxRedemptions?: number;
  currentRedemptions?: number;
}

export interface UrgencyConfig {
  courseId: string;
  enableCountdown: boolean;
  countdownEndTime?: Date;
  enableSeatCounter: boolean;
  enableBatchDeadline: boolean;
  enableEarlyBird: boolean;
  urgencyThreshold: number; // Percentage of seats remaining to trigger urgency
  criticalThreshold: number; // Percentage for critical urgency
}

class UrgencyScarcityService {
  // Get course availability data
  async getCourseAvailability(courseId: string): Promise<CourseAvailability | null> {
    try {
      // In a real implementation, this would fetch from Sanity or a database
      // For now, we'll return mock data based on course type
      const mockData = this.getMockCourseData(courseId);
      return mockData;
    } catch (error) {
      console.error('Error fetching course availability:', error);
      return null;
    }
  }

  // Get all active discount offers
  async getActiveDiscounts(): Promise<DiscountOffer[]> {
    try {
      const now = new Date();
      const mockDiscounts = this.getMockDiscountData();
      
      return mockDiscounts.filter(discount => 
        discount.isActive && 
        discount.startDate <= now && 
        discount.endDate > now
      );
    } catch (error) {
      console.error('Error fetching discount offers:', error);
      return [];
    }
  }

  // Get discount for specific course
  async getCourseDiscount(courseName: string): Promise<DiscountOffer | null> {
    const discounts = await this.getActiveDiscounts();
    return discounts.find(discount => 
      discount.courseName.toLowerCase().includes(courseName.toLowerCase())
    ) || null;
  }

  // Update seat availability (would be called when someone enrolls)
  async updateSeatAvailability(courseId: string, seatsToReduce: number = 1): Promise<boolean> {
    try {
      // In a real implementation, this would update the database
      console.log(`Reducing ${seatsToReduce} seats for course ${courseId}`);
      return true;
    } catch (error) {
      console.error('Error updating seat availability:', error);
      return false;
    }
  }

  // Check if urgency should be displayed
  async shouldShowUrgency(courseId: string): Promise<{
    showCountdown: boolean;
    showSeatCounter: boolean;
    showBatchDeadline: boolean;
    showEarlyBird: boolean;
    urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  }> {
    const availability = await this.getCourseAvailability(courseId);
    const discount = await this.getCourseDiscount(courseId);
    
    if (!availability) {
      return {
        showCountdown: false,
        showSeatCounter: false,
        showBatchDeadline: false,
        showEarlyBird: false,
        urgencyLevel: 'none'
      };
    }

    const seatPercentage = (availability.availableSeats / availability.totalSeats) * 100;
    const timeUntilDeadline = availability.enrollmentDeadline.getTime() - Date.now();
    const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);

    let urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';

    if (availability.availableSeats <= 5 || daysUntilDeadline <= 2) {
      urgencyLevel = 'critical';
    } else if (seatPercentage <= 20 || daysUntilDeadline <= 7) {
      urgencyLevel = 'high';
    } else if (seatPercentage <= 40 || daysUntilDeadline <= 14) {
      urgencyLevel = 'medium';
    } else if (seatPercentage <= 60 || daysUntilDeadline <= 30) {
      urgencyLevel = 'low';
    }

    return {
      showCountdown: !!discount && discount.endDate > new Date(),
      showSeatCounter: availability.availableSeats < availability.totalSeats,
      showBatchDeadline: timeUntilDeadline > 0,
      showEarlyBird: !!discount && discount.offerType === 'early-bird',
      urgencyLevel
    };
  }

  // Generate urgency message based on availability
  generateUrgencyMessage(availability: CourseAvailability, urgencyLevel: string): string {
    const { availableSeats, totalSeats, courseName } = availability;
    const seatPercentage = (availableSeats / totalSeats) * 100;

    switch (urgencyLevel) {
      case 'critical':
        if (availableSeats <= 3) {
          return `🚨 ONLY ${availableSeats} SEATS LEFT! Don't miss out on ${courseName}`;
        }
        return `⚡ Almost full! Only ${availableSeats} seats remaining for ${courseName}`;
      
      case 'high':
        return `🔥 ${Math.round(seatPercentage)}% filled! Secure your seat for ${courseName} now`;
      
      case 'medium':
        return `📈 Filling up fast! ${availableSeats} seats available for ${courseName}`;
      
      case 'low':
        return `👥 ${totalSeats - availableSeats} students already enrolled in ${courseName}`;
      
      default:
        return `🎯 Join ${totalSeats - availableSeats}+ students in ${courseName}`;
    }
  }

  // Mock data generators (replace with real data sources)
  private getMockCourseData(courseId: string): CourseAvailability {
    const courseData: Record<string, Partial<CourseAvailability>> = {
      'cpl-ground-school': {
        courseName: 'DGCA CPL Ground School',
        totalSeats: 30,
        availableSeats: 8,
        batchName: 'February 2024 Batch',
      },
      'atpl-ground-school': {
        courseName: 'ATPL Ground School',
        totalSeats: 25,
        availableSeats: 12,
        batchName: 'March 2024 Batch',
      },
      'type-rating-a320': {
        courseName: 'A320 Type Rating Preparation',
        totalSeats: 15,
        availableSeats: 3,
        batchName: 'February 2024 Batch',
      },
      'type-rating-b737': {
        courseName: 'B737 Type Rating Preparation',
        totalSeats: 15,
        availableSeats: 6,
        batchName: 'March 2024 Batch',
      },
      'rtr-license': {
        courseName: 'RTR(A) License Training',
        totalSeats: 20,
        availableSeats: 14,
        batchName: 'February 2024 Batch',
      },
      'interview-prep': {
        courseName: 'Airline Interview Preparation',
        totalSeats: 12,
        availableSeats: 2,
        batchName: 'February 2024 Batch',
      },
    };

    const baseData = courseData[courseId] || {
      courseName: 'Aviation Training Course',
      totalSeats: 20,
      availableSeats: 10,
      batchName: 'Next Batch',
    };

    const now = new Date();
    const batchStartDate = new Date(now.getTime() + (21 * 24 * 60 * 60 * 1000)); // 21 days from now
    const enrollmentDeadline = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now

    return {
      courseId,
      courseName: baseData.courseName!,
      totalSeats: baseData.totalSeats!,
      availableSeats: baseData.availableSeats!,
      batchStartDate,
      enrollmentDeadline,
      batchName: baseData.batchName!,
      lastUpdated: now,
    };
  }

  private getMockDiscountData(): DiscountOffer[] {
    const now = new Date();
    const earlyBirdEnd = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000)); // 10 days from now
    const flashSaleEnd = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now

    return [
      {
        id: 'early-bird-cpl-2024',
        courseName: 'DGCA CPL Ground School',
        originalPrice: 350000,
        discountedPrice: 300000,
        discountPercentage: 14,
        startDate: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // Started 5 days ago
        endDate: earlyBirdEnd,
        offerType: 'early-bird',
        isActive: true,
        maxRedemptions: 20,
        currentRedemptions: 12,
      },
      {
        id: 'flash-sale-atpl-2024',
        courseName: 'ATPL Ground School',
        originalPrice: 450000,
        discountedPrice: 380000,
        discountPercentage: 16,
        startDate: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)), // Started 1 day ago
        endDate: flashSaleEnd,
        offerType: 'flash-sale',
        isActive: true,
        maxRedemptions: 10,
        currentRedemptions: 6,
      },
      {
        id: 'limited-time-type-rating',
        courseName: 'Type Rating Preparation',
        originalPrice: 250000,
        discountedPrice: 200000,
        discountPercentage: 20,
        startDate: now,
        endDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
        offerType: 'limited-time',
        isActive: true,
      },
      {
        id: 'early-bird-interview-prep',
        courseName: 'Interview Preparation',
        originalPrice: 75000,
        discountedPrice: 60000,
        discountPercentage: 20,
        startDate: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // Started 3 days ago
        endDate: new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
        offerType: 'early-bird',
        isActive: true,
        maxRedemptions: 15,
        currentRedemptions: 8,
      },
    ];
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }

  calculateSavings(originalPrice: number, discountedPrice: number): {
    savings: number;
    percentage: number;
    formattedSavings: string;
  } {
    const savings = originalPrice - discountedPrice;
    const percentage = Math.round((savings / originalPrice) * 100);
    
    return {
      savings,
      percentage,
      formattedSavings: this.formatPrice(savings),
    };
  }

  // Get urgency configuration for a course
  async getUrgencyConfig(courseId: string): Promise<UrgencyConfig> {
    // In a real implementation, this would be stored in Sanity
    return {
      courseId,
      enableCountdown: true,
      enableSeatCounter: true,
      enableBatchDeadline: true,
      enableEarlyBird: true,
      urgencyThreshold: 40, // Show urgency when 40% or fewer seats remain
      criticalThreshold: 20, // Show critical urgency when 20% or fewer seats remain
    };
  }

  // Analytics methods
  async trackUrgencyInteraction(courseId: string, urgencyType: string, action: string): Promise<void> {
    try {
      // Track urgency element interactions for optimization
      console.log(`Urgency interaction: ${courseId} - ${urgencyType} - ${action}`);
      
      // In a real implementation, this would send data to analytics service
      // await analyticsService.track('urgency_interaction', {
      //   courseId,
      //   urgencyType,
      //   action,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      console.error('Error tracking urgency interaction:', error);
    }
  }

  // Get urgency performance metrics
  async getUrgencyMetrics(courseId: string, dateRange: { start: Date; end: Date }) {
    // Mock metrics - in real implementation, fetch from analytics
    return {
      countdownViews: 1250,
      countdownClicks: 89,
      seatCounterViews: 980,
      seatCounterInfluencedConversions: 34,
      batchDeadlineViews: 756,
      batchDeadlineConversions: 23,
      earlyBirdViews: 1100,
      earlyBirdConversions: 67,
      overallUrgencyConversionLift: 23.5, // Percentage improvement
    };
  }
}

// Export singleton instance
export const urgencyScarcityService = new UrgencyScarcityService();

// Export types
export type {
  CourseAvailability,
  DiscountOffer,
  UrgencyConfig,
};