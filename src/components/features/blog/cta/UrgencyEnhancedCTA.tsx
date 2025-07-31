'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CTATemplate, CTAComponentProps } from '@/lib/types/cta';
import { urgencyScarcityService, CourseAvailability, DiscountOffer } from '@/lib/cta/urgency-scarcity-service';
import { 
  CountdownTimer, 
  SeatAvailabilityCounter, 
  BatchEnrollmentDeadline, 
  EarlyBirdDiscountSystem,
  UrgencyElements 
} from './UrgencyScarcityElements';
import { EnhancedCTACardVariant, EnhancedCTABannerVariant } from './EnhancedCTAVariants';
import { cn } from '@/lib/utils';

interface UrgencyEnhancedCTAProps extends CTAComponentProps {
  courseId?: string;
  enableRealTimeUpdates?: boolean;
}

export function UrgencyEnhancedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  enableRealTimeUpdates = true,
  className, 
  onInteraction 
}: UrgencyEnhancedCTAProps) {
  const [courseAvailability, setCourseAvailability] = useState<CourseAvailability | null>(null);
  const [activeDiscount, setActiveDiscount] = useState<DiscountOffer | null>(null);
  const [urgencyConfig, setUrgencyConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Extract course ID from template or use provided courseId
  const targetCourseId = courseId || template.targetCourse?._id || 'default-course';

  useEffect(() => {
    const loadUrgencyData = async () => {
      try {
        setLoading(true);
        
        // Load course availability
        const availability = await urgencyScarcityService.getCourseAvailability(targetCourseId);
        setCourseAvailability(availability);

        // Load active discount
        const discount = await urgencyScarcityService.getCourseDiscount(
          template.targetCourse?.name || 'aviation training'
        );
        setActiveDiscount(discount);

        // Load urgency configuration
        const config = await urgencyScarcityService.getUrgencyConfig(targetCourseId);
        setUrgencyConfig(config);

      } catch (error) {
        console.error('Error loading urgency data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUrgencyData();

    // Set up real-time updates if enabled
    if (enableRealTimeUpdates) {
      const interval = setInterval(loadUrgencyData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [targetCourseId, template.targetCourse?.name, enableRealTimeUpdates]);

  // Enhanced interaction handler with urgency tracking
  const handleInteraction = (event: any) => {
    // Track urgency influence on interactions
    if (courseAvailability || activeDiscount) {
      urgencyScarcityService.trackUrgencyInteraction(
        targetCourseId,
        'cta_interaction',
        event.action
      );
    }

    onInteraction?.(event);
  };

  // Determine which urgency elements to show
  const getUrgencyElements = () => {
    const elements: any = {};

    // Countdown timer
    if (template.urgencyElements?.enableCountdown || activeDiscount) {
      const endTime = activeDiscount?.endDate || 
        (template.urgencyElements?.countdownEndTime ? new Date(template.urgencyElements.countdownEndTime) : null) ||
        new Date(Date.now() + (template.urgencyElements?.countdownDuration || 24) * 60 * 60 * 1000);
      
      elements.countdown = {
        endTime,
        variant: template.urgencyElements?.urgencyLevel === 'critical' ? 'urgent' : 'default'
      };
    }

    // Seat availability counter
    if ((template.urgencyElements?.enableSeatCounter || urgencyConfig?.enableSeatCounter) && courseAvailability) {
      elements.seatAvailability = {
        totalSeats: courseAvailability.totalSeats,
        availableSeats: courseAvailability.availableSeats,
        courseName: courseAvailability.courseName
      };
    }

    // Batch deadline
    if ((template.urgencyElements?.enableBatchDeadline || urgencyConfig?.enableBatchDeadline) && courseAvailability) {
      elements.batchDeadline = {
        batchStartDate: courseAvailability.batchStartDate,
        enrollmentDeadline: courseAvailability.enrollmentDeadline,
        batchName: courseAvailability.batchName
      };
    }

    // Early bird discount
    if ((template.urgencyElements?.enableEarlyBird || urgencyConfig?.enableEarlyBird) && activeDiscount) {
      elements.earlyBird = {
        originalPrice: activeDiscount.originalPrice,
        discountedPrice: activeDiscount.discountedPrice,
        discountEndDate: activeDiscount.endDate,
        discountPercentage: activeDiscount.discountPercentage
      };
    }

    return elements;
  };

  // Enhanced template with urgency data
  const enhancedTemplate: CTATemplate = {
    ...template,
    urgencyElements: {
      ...template.urgencyElements,
      // Override with real-time data
      socialProof: courseAvailability 
        ? `${courseAvailability.totalSeats - courseAvailability.availableSeats}+ students enrolled`
        : template.urgencyElements?.socialProof,
      urgencyMessage: courseAvailability
        ? urgencyScarcityService.generateUrgencyMessage(
            courseAvailability, 
            template.urgencyElements?.urgencyLevel || 'medium'
          )
        : template.urgencyElements?.urgencyMessage,
      availableSeats: courseAvailability?.availableSeats,
      totalSeats: courseAvailability?.totalSeats,
    }
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48', className)} />
    );
  }

  const urgencyElements = getUrgencyElements();
  const hasUrgencyElements = Object.keys(urgencyElements).length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Urgency Elements */}
      {hasUrgencyElements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UrgencyElements 
            elements={urgencyElements}
            layout={Object.keys(urgencyElements).length > 2 ? 'grid' : 'stacked'}
          />
        </motion.div>
      )}

      {/* Enhanced CTA with urgency context */}
      {template.style === 'banner' ? (
        <EnhancedCTABannerVariant
          template={enhancedTemplate}
          blogPost={blogPost}
          position={position}
          onInteraction={handleInteraction}
        />
      ) : (
        <EnhancedCTACardVariant
          template={enhancedTemplate}
          blogPost={blogPost}
          position={position}
          onInteraction={handleInteraction}
        />
      )}

      {/* Additional urgency messaging */}
      {courseAvailability && (
        <motion.div
          className="text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Last updated: {courseAvailability.lastUpdated.toLocaleTimeString()}
        </motion.div>
      )}
    </div>
  );
}

// Specialized urgency CTA variants
export function UrgentEnrollmentCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: UrgencyEnhancedCTAProps) {
  return (
    <UrgencyEnhancedCTA
      template={{
        ...template,
        style: 'card',
        urgencyElements: {
          ...template.urgencyElements,
          enableCountdown: true,
          enableSeatCounter: true,
          enableBatchDeadline: true,
          urgencyLevel: 'high'
        }
      }}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function FlashSaleCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: UrgencyEnhancedCTAProps) {
  return (
    <UrgencyEnhancedCTA
      template={{
        ...template,
        style: 'banner',
        urgencyElements: {
          ...template.urgencyElements,
          enableCountdown: true,
          enableEarlyBird: true,
          urgencyLevel: 'critical'
        }
      }}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function SeatLimitedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: UrgencyEnhancedCTAProps) {
  return (
    <UrgencyEnhancedCTA
      template={{
        ...template,
        style: 'card',
        urgencyElements: {
          ...template.urgencyElements,
          enableSeatCounter: true,
          enableBatchDeadline: true,
          urgencyLevel: 'medium'
        }
      }}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      className={className}
      onInteraction={onInteraction}
    />
  );
}
