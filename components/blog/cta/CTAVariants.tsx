'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Star,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { BlogPost, Course } from '@/lib/types/blog';
import { trackCTAInteraction } from '@/lib/blog/analytics';

export interface CTAVariantProps {
  blogPost: BlogPost;
  course: Course;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  variant: 'card' | 'banner' | 'inline' | 'minimal' | 'gradient' | 'testimonial';
  testId?: string;
  className?: string;
  onInteraction?: (interaction: any) => void;
}

// Card variant - Professional card layout with course highlights
export function CTACardVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `card-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'card',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                {course.category.replace('-', ' ').toUpperCase()}
              </Badge>
              <h3 className="text-2xl font-bold mb-2">
                {course.ctaSettings.ctaTitle}
              </h3>
              <p className="text-primary-foreground/90 leading-relaxed">
                {course.ctaSettings.ctaMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-background">
          {/* Course highlights */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">Expert Instructors</div>
              <div className="text-xs text-muted-foreground">DGCA Certified</div>
            </div>
            <div className="text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">High Success Rate</div>
              <div className="text-xs text-muted-foreground">95% Pass Rate</div>
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">Flexible Schedule</div>
              <div className="text-xs text-muted-foreground">Online & Offline</div>
            </div>
          </div>

          {/* Key benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Comprehensive study materials included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Mock tests and practice sessions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Placement assistance available</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleClick('primary')}
              className="w-full font-semibold"
              size="lg"
            >
              {course.ctaSettings.primaryButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                onClick={() => handleClick('secondary')}
                className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Have questions? Contact us
              </button>
            </div>
          </div>

          {/* Trust indicator */}
          <div className="text-center pt-4 border-t mt-4">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Trusted by 1000+ successful pilots</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Banner variant - Full-width banner with strong visual impact
export function CTABannerVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `banner-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'banner',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-foreground">
        <div className="px-6 py-8 md:px-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white">
                  🚀 ADVANCE YOUR CAREER
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {course.ctaSettings.ctaTitle}
                </h3>
                <p className="text-lg text-primary-foreground/90 mb-6">
                  {course.ctaSettings.ctaMessage}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleClick('primary')}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold"
                  >
                    {course.ctaSettings.primaryButtonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => handleClick('secondary')}
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Get Free Consultation
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm opacity-90">Students pass on first attempt</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">1000+</div>
                    <div className="text-xs opacity-90">Students</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <Award className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">DGCA</div>
                    <div className="text-xs opacity-90">Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline variant - Subtle integration within content
export function CTAInlineVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `inline-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'inline',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <div className={`border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-2">
            Ready to take the next step?
          </h4>
          <p className="text-muted-foreground mb-4">
            Our <strong>{course.name}</strong> program covers everything discussed above and more. 
            Join hundreds of successful pilots who started their journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleClick('primary')}
              className="font-medium"
            >
              {course.ctaSettings.primaryButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleClick('secondary')}
              variant="outline"
              className="font-medium"
            >
              <Mail className="mr-2 h-4 w-4" />
              Get More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal variant - Clean and unobtrusive
export function CTAMinimalVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `minimal-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'minimal',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <div className={`text-center py-6 ${className}`}>
      <div className="max-w-md mx-auto">
        <h4 className="text-xl font-semibold mb-3">
          Interested in {course.name}?
        </h4>
        <p className="text-muted-foreground mb-4">
          Take your aviation career to the next level with our comprehensive training program.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={() => handleClick('primary')}
            className="font-medium"
          >
            {course.ctaSettings.primaryButtonText}
          </Button>
          <Button
            onClick={() => handleClick('secondary')}
            variant="ghost"
            className="font-medium"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}

// Gradient variant - Eye-catching with modern design
export function CTAGradientVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `gradient-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'gradient',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              LIMITED TIME
            </Badge>
          </div>
          
          <h3 className="text-2xl font-bold mb-3">
            {course.ctaSettings.ctaTitle}
          </h3>
          
          <p className="text-white/90 mb-6">
            {course.ctaSettings.ctaMessage}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">₹{course.price?.toLocaleString() || 'Contact'}</div>
              <div className="text-sm opacity-90">Course Fee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{course.duration || '6 Months'}</div>
              <div className="text-sm opacity-90">Duration</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleClick('primary')}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              {course.ctaSettings.primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <button
              onClick={() => handleClick('secondary')}
              className="text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              Schedule a free consultation call
            </button>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      </div>
    </div>
  );
}

// Testimonial variant - Social proof focused
export function CTATestimonialVariant({ 
  blogPost, 
  course, 
  position, 
  testId,
  className = '',
  onInteraction 
}: CTAVariantProps) {
  const handleClick = useCallback(async (action: 'primary' | 'secondary') => {
    const interaction = await trackCTAInteraction({
      ctaId: `testimonial-${course._id}`,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug.current,
      ctaType: 'course-promo',
      ctaPosition: position,
      targetCourse: course._id,
      action: 'click',
      variant: 'testimonial',
      testId,
      metadata: { buttonType: action },
    });

    onInteraction?.(interaction);

    if (action === 'primary') {
      window.location.href = course.targetUrl;
    } else {
      window.location.href = '/contact';
    }
  }, [blogPost, course, position, testId, onInteraction]);

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Testimonial */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="text-lg italic mb-4">
            "The {course.name} program at Aviators Training Centre was exactly what I needed. 
            The instructors are knowledgeable and the study materials are comprehensive. 
            I passed my exam on the first attempt!"
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Rajesh Kumar</div>
              <div className="text-sm text-muted-foreground">Commercial Pilot, IndiGo</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t pt-6">
          <h4 className="text-xl font-semibold mb-3">
            Join Our Success Stories
          </h4>
          <p className="text-muted-foreground mb-4">
            Start your journey with {course.name} and become part of our growing community of successful pilots.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleClick('primary')}
              className="font-semibold"
            >
              {course.ctaSettings.primaryButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleClick('secondary')}
              variant="outline"
              className="font-medium"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Free Demo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}