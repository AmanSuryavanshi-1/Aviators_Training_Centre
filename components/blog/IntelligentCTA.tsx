'use client';

import { useEffect, useState, useCallback } from 'react';
import { BlogPost, Course } from '@/lib/types/blog';
import { intelligentCTARouter } from '@/lib/blog/cta-routing';
import { abTestingManager, generateUserId } from '@/lib/blog/ab-testing';
import analyticsManager from '@/lib/blog/analytics';
import {
  CTACardVariant,
  CTABannerVariant,
  CTAInlineVariant,
  CTAMinimalVariant,
  CTAGradientVariant,
  CTATestimonialVariant,
} from './cta/CTAVariants';

interface IntelligentCTAProps {
  blogPost: BlogPost;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  className?: string;
  enableABTesting?: boolean;
  enableAnalytics?: boolean;
  fallbackCourse?: Course;
}

export default function IntelligentCTA({
  blogPost,
  position,
  className = '',
  enableABTesting = true,
  enableAnalytics = true,
  fallbackCourse,
}: IntelligentCTAProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [ctaVariant, setCTAVariant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => generateUserId());
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Initialize CTA system
  useEffect(() => {
    initializeCTA();
  }, [blogPost._id, position]);

  // Track impression when component becomes visible
  useEffect(() => {
    if (course && ctaVariant && !hasTrackedImpression && enableAnalytics) {
      trackImpression();
      setHasTrackedImpression(true);
    }
  }, [course, ctaVariant, hasTrackedImpression, enableAnalytics]);

  const initializeCTA = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize analytics if enabled
      if (enableAnalytics) {
        await analyticsManager.initialize();
      }

      // Initialize A/B testing if enabled
      if (enableABTesting) {
        await abTestingManager.initialize();
      }

      // Get recommended course
      const recommendedCourse = await intelligentCTARouter.getRecommendedCourse(
        blogPost,
        { fallbackToDefault: true, debugMode: process.env.NODE_ENV === 'development' }
      );

      if (!recommendedCourse) {
        if (fallbackCourse) {
          setCourse(fallbackCourse);
        } else {
          throw new Error('No course recommendation available');
        }
      } else {
        setCourse(recommendedCourse);
      }

      // Get CTA variant (with A/B testing if enabled)
      let variant;
      if (enableABTesting) {
        const abResult = abTestingManager.getCTAVariant(
          userId,
          blogPost,
          recommendedCourse || fallbackCourse!,
          position
        );
        variant = abResult;
      } else {
        variant = {
          variant: {
            id: 'default',
            name: 'Default CTA',
            type: getDefaultVariantType(position),
            config: {},
          },
          isTestVariant: false,
        };
      }

      setCTAVariant(variant);
    } catch (err) {
      console.error('Error initializing intelligent CTA:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize CTA');
      
      // Set fallback course if available
      if (fallbackCourse) {
        setCourse(fallbackCourse);
        setCTAVariant({
          variant: {
            id: 'fallback',
            name: 'Fallback CTA',
            type: 'card',
            config: {},
          },
          isTestVariant: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const trackImpression = async () => {
    if (!course || !ctaVariant || !enableAnalytics) return;

    try {
      await analyticsManager.trackCTAInteraction({
        ctaId: `${ctaVariant.variant.type}-${course._id}`,
        blogPostId: blogPost._id,
        blogPostSlug: blogPost.slug.current,
        ctaType: 'course-promo',
        ctaPosition: position,
        targetCourse: course._id,
        action: 'impression',
        variant: ctaVariant.variant.name,
        testId: ctaVariant.testId,
        metadata: {
          courseCategory: course.category,
          blogCategory: blogPost.category.title,
          isTestVariant: ctaVariant.isTestVariant,
        },
      });
    } catch (error) {
      console.error('Error tracking CTA impression:', error);
    }
  };

  const handleCTAInteraction = useCallback(async (interaction: any) => {
    if (!course || !ctaVariant) return;

    try {
      // Record A/B test interaction if applicable
      if (enableABTesting && ctaVariant.testId) {
        await abTestingManager.recordInteraction(
          ctaVariant.testId,
          userId,
          ctaVariant.isTestVariant ? 'test' : 'control',
          interaction
        );
      }

      // Track analytics
      if (enableAnalytics) {
        await analyticsManager.trackCTAInteraction({
          ctaId: `${ctaVariant.variant.type}-${course._id}`,
          blogPostId: blogPost._id,
          blogPostSlug: blogPost.slug.current,
          ctaType: 'course-promo',
          ctaPosition: position,
          targetCourse: course._id,
          action: 'click',
          variant: ctaVariant.variant.name,
          testId: ctaVariant.testId,
          metadata: {
            courseCategory: course.category,
            blogCategory: blogPost.category.title,
            isTestVariant: ctaVariant.isTestVariant,
            interactionDetails: interaction,
          },
        });
      }
    } catch (error) {
      console.error('Error handling CTA interaction:', error);
    }
  }, [course, ctaVariant, blogPost, position, userId, enableABTesting, enableAnalytics]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-muted rounded-lg p-6">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-muted-foreground/20 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !course || !ctaVariant) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`}>
          <p className="text-sm text-destructive">
            CTA Error: {error || 'Missing course or variant data'}
          </p>
        </div>
      );
    }
    return null; // Hide CTA in production if there's an error
  }

  // Render appropriate CTA variant
  const renderCTAVariant = () => {
    const commonProps = {
      blogPost,
      course,
      position,
      testId: ctaVariant.testId,
      className,
      onInteraction: handleCTAInteraction,
    };

    switch (ctaVariant.variant.type) {
      case 'banner':
        return <CTABannerVariant {...commonProps} variant="banner" />;
      case 'inline':
        return <CTAInlineVariant {...commonProps} variant="inline" />;
      case 'minimal':
        return <CTAMinimalVariant {...commonProps} variant="minimal" />;
      case 'gradient':
        return <CTAGradientVariant {...commonProps} variant="gradient" />;
      case 'testimonial':
        return <CTATestimonialVariant {...commonProps} variant="testimonial" />;
      case 'card':
      default:
        return <CTACardVariant {...commonProps} variant="card" />;
    }
  };

  return (
    <div className={`intelligent-cta ${className}`} data-testid="intelligent-cta">
      {renderCTAVariant()}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify({
              courseId: course._id,
              courseName: course.name,
              variantType: ctaVariant.variant.type,
              isTestVariant: ctaVariant.isTestVariant,
              testId: ctaVariant.testId,
              position,
              blogCategory: blogPost.category.title,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// Helper function to determine default variant type based on position
function getDefaultVariantType(position: string): 'card' | 'banner' | 'inline' | 'minimal' | 'gradient' | 'testimonial' {
  switch (position) {
    case 'top':
      return 'banner';
    case 'middle':
      return 'inline';
    case 'bottom':
      return 'card';
    case 'sidebar':
      return 'minimal';
    case 'floating':
      return 'gradient';
    default:
      return 'card';
  }
}

// Position-specific wrapper components for easy usage
export function TopCTA({ blogPost, className, ...props }: Omit<IntelligentCTAProps, 'position'>) {
  return <IntelligentCTA {...props} blogPost={blogPost} position="top" className={className} />;
}

export function MiddleCTA({ blogPost, className, ...props }: Omit<IntelligentCTAProps, 'position'>) {
  return <IntelligentCTA {...props} blogPost={blogPost} position="middle" className={className} />;
}

export function BottomCTA({ blogPost, className, ...props }: Omit<IntelligentCTAProps, 'position'>) {
  return <IntelligentCTA {...props} blogPost={blogPost} position="bottom" className={className} />;
}

export function SidebarCTA({ blogPost, className, ...props }: Omit<IntelligentCTAProps, 'position'>) {
  return <IntelligentCTA {...props} blogPost={blogPost} position="sidebar" className={className} />;
}

export function FloatingCTA({ blogPost, className, ...props }: Omit<IntelligentCTAProps, 'position'>) {
  return <IntelligentCTA {...props} blogPost={blogPost} position="floating" className={className} />;
}