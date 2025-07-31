'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CTATemplate, CTAComponentProps } from '@/lib/types/cta';
import { UrgencyEnhancedCTA } from './UrgencyEnhancedCTA';
import { SocialProofEnhancedCTA } from './SocialProofEnhancedCTA';
import { urgencyScarcityService } from '@/lib/cta/urgency-scarcity-service';
import { socialProofService } from '@/lib/cta/social-proof-service';
import { cn } from '@/lib/utils';

interface ConversionOptimizedCTAProps extends CTAComponentProps {
  courseId?: string;
  optimizationStrategy?: 'urgency-first' | 'social-proof-first' | 'balanced' | 'adaptive';
  enableABTesting?: boolean;
  testVariant?: 'control' | 'urgency' | 'social-proof' | 'combined';
}

export function ConversionOptimizedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  optimizationStrategy = 'balanced',
  enableABTesting = false,
  testVariant,
  className, 
  onInteraction 
}: ConversionOptimizedCTAProps) {
  const [urgencyData, setUrgencyData] = useState<any>(null);
  const [socialProofData, setSocialProofData] = useState<any>(null);
  const [selectedStrategy, setSelectedStrategy] = useState(optimizationStrategy);
  const [loading, setLoading] = useState(true);

  // Extract course ID from template or use provided courseId
  const targetCourseId = courseId || template.targetCourse?._id || 'default-course';

  useEffect(() => {
    const loadOptimizationData = async () => {
      try {
        setLoading(true);
        
        // Load urgency and social proof data in parallel
        const [urgencyInfo, socialProofInfo] = await Promise.all([
          urgencyScarcityService.shouldShowUrgency(targetCourseId),
          socialProofService.getSocialProofSummary(targetCourseId),
        ]);

        setUrgencyData(urgencyInfo);
        setSocialProofData(socialProofInfo);

        // Adaptive strategy selection based on data
        if (optimizationStrategy === 'adaptive') {
          const adaptiveStrategy = determineAdaptiveStrategy(urgencyInfo, socialProofInfo);
          setSelectedStrategy(adaptiveStrategy);
        }

      } catch (error) {
        console.error('Error loading optimization data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOptimizationData();
  }, [targetCourseId, optimizationStrategy]);

  // Determine the best strategy based on available data
  const determineAdaptiveStrategy = (urgencyInfo: any, socialProofInfo: any): string => {
    const urgencyScore = calculateUrgencyScore(urgencyInfo);
    const socialProofScore = calculateSocialProofScore(socialProofInfo);

    if (urgencyScore > socialProofScore + 20) {
      return 'urgency-first';
    } else if (socialProofScore > urgencyScore + 20) {
      return 'social-proof-first';
    } else {
      return 'balanced';
    }
  };

  const calculateUrgencyScore = (urgencyInfo: any): number => {
    let score = 0;
    
    if (urgencyInfo?.urgencyLevel === 'critical') score += 40;
    else if (urgencyInfo?.urgencyLevel === 'high') score += 30;
    else if (urgencyInfo?.urgencyLevel === 'medium') score += 20;
    else if (urgencyInfo?.urgencyLevel === 'low') score += 10;

    if (urgencyInfo?.showCountdown) score += 15;
    if (urgencyInfo?.showSeatCounter) score += 15;
    if (urgencyInfo?.showBatchDeadline) score += 10;
    if (urgencyInfo?.showEarlyBird) score += 20;

    return score;
  };

  const calculateSocialProofScore = (socialProofInfo: any): number => {
    let score = 0;
    
    if (socialProofInfo?.averageRating >= 4.5) score += 25;
    else if (socialProofInfo?.averageRating >= 4.0) score += 20;
    else if (socialProofInfo?.averageRating >= 3.5) score += 15;

    if (socialProofInfo?.testimonials?.length >= 5) score += 20;
    else if (socialProofInfo?.testimonials?.length >= 3) score += 15;
    else if (socialProofInfo?.testimonials?.length >= 1) score += 10;

    if (socialProofInfo?.successStories?.length >= 2) score += 15;
    else if (socialProofInfo?.successStories?.length >= 1) score += 10;

    if (socialProofInfo?.verifiedTestimonials >= 3) score += 10;

    return score;
  };

  // A/B Testing variant selection
  const getTestVariant = (): string => {
    if (!enableABTesting) return 'control';
    
    if (testVariant) return testVariant;
    
    // Random variant selection for A/B testing
    const variants = ['control', 'urgency', 'social-proof', 'combined'];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  };

  // Enhanced interaction handler with optimization tracking
  const handleInteraction = (event: any) => {
    // Track optimization strategy performance
    const optimizationContext = {
      strategy: selectedStrategy,
      urgencyLevel: urgencyData?.urgencyLevel,
      socialProofScore: socialProofData?.averageRating,
      testVariant: enableABTesting ? getTestVariant() : null,
    };

    const enhancedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        optimizationContext,
      },
    };

    onInteraction?.(enhancedEvent);
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64', className)} />
    );
  }

  const currentTestVariant = getTestVariant();

  // Render based on A/B test variant or optimization strategy
  if (enableABTesting) {
    switch (currentTestVariant) {
      case 'urgency':
        return (
          <UrgencyEnhancedCTA
            template={template}
            blogPost={blogPost}
            position={position}
            courseId={targetCourseId}
            className={className}
            onInteraction={handleInteraction}
          />
        );
      
      case 'social-proof':
        return (
          <SocialProofEnhancedCTA
            template={template}
            blogPost={blogPost}
            position={position}
            courseId={targetCourseId}
            className={className}
            onInteraction={handleInteraction}
          />
        );
      
      case 'combined':
        return (
          <CombinedOptimizationCTA
            template={template}
            blogPost={blogPost}
            position={position}
            courseId={targetCourseId}
            className={className}
            onInteraction={handleInteraction}
          />
        );
      
      default: // control
        return (
          <div className={className}>
            {template.style === 'banner' ? (
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">{template.title}</h3>
                <p className="mb-4">{template.description}</p>
                <button 
                  onClick={() => handleInteraction({ action: 'click', buttonType: 'primary' })}
                  className="bg-white text-teal-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {template.primaryButton.text}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>
                <button 
                  onClick={() => handleInteraction({ action: 'click', buttonType: 'primary' })}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {template.primaryButton.text}
                </button>
              </div>
            )}
          </div>
        );
    }
  }

  // Render based on optimization strategy
  switch (selectedStrategy) {
    case 'urgency-first':
      return (
        <div className={cn('space-y-4', className)}>
          <UrgencyEnhancedCTA
            template={template}
            blogPost={blogPost}
            position={position}
            courseId={targetCourseId}
            onInteraction={handleInteraction}
          />
          {socialProofData?.testimonials?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center text-sm text-gray-600 dark:text-gray-400"
            >
              ⭐ {socialProofData.averageRating.toFixed(1)}/5 from {socialProofData.testimonials.length}+ verified reviews
            </motion.div>
          )}
        </div>
      );

    case 'social-proof-first':
      return (
        <SocialProofEnhancedCTA
          template={template}
          blogPost={blogPost}
          position={position}
          courseId={targetCourseId}
          showTestimonials={true}
          showSuccessStories={true}
          showCertifications={true}
          showAchievements={true}
          socialProofLayout="above"
          className={className}
          onInteraction={handleInteraction}
        />
      );

    case 'balanced':
    default:
      return (
        <CombinedOptimizationCTA
          template={template}
          blogPost={blogPost}
          position={position}
          courseId={targetCourseId}
          className={className}
          onInteraction={handleInteraction}
        />
      );
  }
}

// Combined optimization component
function CombinedOptimizationCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: ConversionOptimizedCTAProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Social Proof Section */}
      <SocialProofEnhancedCTA
        template={template}
        blogPost={blogPost}
        position={position}
        courseId={courseId}
        showTestimonials={true}
        showSuccessStories={false}
        showCertifications={true}
        showAchievements={true}
        showAlumniNetwork={false}
        socialProofLayout="above"
        onInteraction={onInteraction}
      />

      {/* Urgency Section */}
      <UrgencyEnhancedCTA
        template={template}
        blogPost={blogPost}
        position={position}
        courseId={courseId}
        onInteraction={onInteraction}
      />
    </div>
  );
}

// Specialized conversion-optimized variants
export function HighConversionCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: ConversionOptimizedCTAProps) {
  return (
    <ConversionOptimizedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      optimizationStrategy="adaptive"
      enableABTesting={true}
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function UrgencyOptimizedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: ConversionOptimizedCTAProps) {
  return (
    <ConversionOptimizedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      optimizationStrategy="urgency-first"
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function TrustOptimizedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: ConversionOptimizedCTAProps) {
  return (
    <ConversionOptimizedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      optimizationStrategy="social-proof-first"
      className={className}
      onInteraction={onInteraction}
    />
  );
}
