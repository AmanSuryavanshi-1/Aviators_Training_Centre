'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Award, Clock } from 'lucide-react';
import { BlogPost, Course } from '@/lib/types/blog';
import IntelligentCTA from './IntelligentCTA';
import { useConversionTracking } from '@/hooks/use-conversion-tracking';
import { CTAConversionConfig } from '@/lib/analytics/blog-conversion-integration';

interface CoursePromotionCTAProps {
  blogPost: BlogPost;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  className?: string;
  useIntelligentCTA?: boolean;
}

// Intelligent course recommendation based on blog content
function getRecommendedCourse(blogPost: BlogPost): Course {
  const { category, title, excerpt, seoEnhancement } = blogPost;
  const content = `${title} ${excerpt} ${seoEnhancement?.focusKeyword || ''}`.toLowerCase();

  // Technical General keywords
  if (content.includes('dgca') || content.includes('ground school') ||
      content.includes('aviation theory') || category.title.toLowerCase().includes('technical general')) {
    return {
      _id: 'technical-general',
      _type: 'course',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'Technical General Ground School',
      slug: { current: 'technical-general' },
      category: 'technical-general',
      description: 'Comprehensive DGCA Technical General ground school preparation covering all essential aviation subjects.',
      shortDescription: 'Master DGCA Technical General subjects with expert guidance',
      targetUrl: '/courses/technical-general',
      keywords: ['dgca', 'technical general', 'ground school', 'aviation theory'],
      ctaSettings: {
        primaryButtonText: 'Start Technical General Course',
        secondaryButtonText: 'Learn More',
        ctaTitle: 'Master DGCA Technical General',
        ctaMessage: 'Join thousands of successful pilots who started with our comprehensive Technical General course.',
      },
      active: true,
    };
  }

  // Technical Specific keywords
  if (content.includes('aircraft systems') || content.includes('navigation') ||
      content.includes('meteorology') || category.title.toLowerCase().includes('technical specific')) {
    return {
      _id: 'technical-specific',
      _type: 'course',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'Technical Specific Training',
      slug: { current: 'technical-specific' },
      category: 'technical-specific',
      description: 'Advanced technical training covering aircraft systems, navigation, and specialized aviation topics.',
      shortDescription: 'Advanced technical training for aviation professionals',
      targetUrl: '/courses/technical-specific',
      keywords: ['aircraft systems', 'navigation', 'meteorology', 'technical specific'],
      ctaSettings: {
        primaryButtonText: 'Explore Technical Specific',
        secondaryButtonText: 'View Curriculum',
        ctaTitle: 'Advance Your Technical Knowledge',
        ctaMessage: 'Deepen your understanding with our specialized technical courses.',
      },
      active: true,
    };
  }

  // CPL Ground School keywords
  if (content.includes('commercial pilot') || content.includes('cpl') ||
      content.includes('career') || content.includes('pilot training')) {
    return {
      _id: 'cpl-ground-school',
      _type: 'course',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'CPL Ground School',
      slug: { current: 'cpl-ground-school' },
      category: 'cpl-ground-school',
      description: 'Complete Commercial Pilot License ground school preparation with comprehensive study materials.',
      shortDescription: 'Your pathway to becoming a commercial pilot',
      targetUrl: '/courses/cpl-ground-school',
      keywords: ['cpl', 'commercial pilot', 'pilot training', 'career'],
      ctaSettings: {
        primaryButtonText: 'Start CPL Journey',
        secondaryButtonText: 'Download Syllabus',
        ctaTitle: 'Launch Your Pilot Career',
        ctaMessage: 'Take the first step towards your commercial pilot license with our proven CPL ground school.',
      },
      active: true,
    };
  }

  // ATPL Ground School keywords
  if (content.includes('airline') || content.includes('atpl') ||
      content.includes('advanced') || content.includes('captain')) {
    return {
      _id: 'atpl-ground-school',
      _type: 'course',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'ATPL Ground School',
      slug: { current: 'atpl-ground-school' },
      category: 'atpl-ground-school',
      description: 'Advanced Airline Transport Pilot License preparation for aspiring airline pilots.',
      shortDescription: 'Elite training for future airline pilots',
      targetUrl: '/courses/atpl-ground-school',
      keywords: ['atpl', 'airline', 'advanced', 'captain'],
      ctaSettings: {
        primaryButtonText: 'Begin ATPL Training',
        secondaryButtonText: 'Explore Program',
        ctaTitle: 'Reach New Heights',
        ctaMessage: 'Prepare for airline pilot positions with our comprehensive ATPL ground school.',
      },
      active: true,
    };
  }

  // Type Rating keywords
  if (content.includes('type rating') || content.includes('aircraft type') ||
      content.includes('specific aircraft')) {
    return {
      _id: 'type-rating',
      _type: 'course',
      _createdAt: '',
      _updatedAt: '',
      _rev: '',
      name: 'Type Rating Courses',
      slug: { current: 'type-rating' },
      category: 'type-rating',
      description: 'Specialized type rating courses for various aircraft models.',
      shortDescription: 'Master specific aircraft operations',
      targetUrl: '/courses/type-rating',
      keywords: ['type rating', 'aircraft type', 'specific aircraft'],
      ctaSettings: {
        primaryButtonText: 'View Type Ratings',
        secondaryButtonText: 'Contact Us',
        ctaTitle: 'Specialize Your Skills',
        ctaMessage: 'Get certified on specific aircraft types with our expert instructors.',
      },
      active: true,
    };
  }

  // Default fallback to courses overview
  return {
    _id: 'courses-overview',
    _type: 'course',
    _createdAt: '',
    _updatedAt: '',
    _rev: '',
    name: 'Explore All Courses',
    slug: { current: 'courses' },
    category: 'general',
    description: 'Discover our complete range of aviation training courses.',
    shortDescription: 'Find the perfect course for your aviation goals',
    targetUrl: '/courses',
    keywords: ['aviation training', 'pilot courses', 'dgca preparation'],
    ctaSettings: {
      primaryButtonText: 'Explore All Courses',
      secondaryButtonText: 'Contact Us',
      ctaTitle: 'Start Your Aviation Journey',
      ctaMessage: 'Discover the perfect course to advance your aviation career.',
    },
    active: true,
  };
}

export default function CoursePromotionCTA({ 
  blogPost, 
  position, 
  variant = 'primary',
  className = '',
  useIntelligentCTA = true
}: CoursePromotionCTAProps) {
  // Use the new intelligent CTA system by default
  if (useIntelligentCTA) {
    return (
      <IntelligentCTA
        blogPost={blogPost}
        position={position}
        className={className}
        enableABTesting={true}
        enableAnalytics={true}
        fallbackCourse={getRecommendedCourse(blogPost)}
      />
    );
  }

  // Legacy implementation for backward compatibility
  const recommendedCourse = getRecommendedCourse(blogPost);

  const trackCTAClick = useCallback((ctaId: string, context: string, targetCourse: string) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'blog_conversion',
        event_label: `${ctaId}_${context}_${targetCourse}`,
        value: 1,
      });
    }

    // Custom conversion tracking
    console.log('CTA Click:', {
      type: 'blog_cta_click',
      ctaId,
      context,
      targetCourse,
      blogCategory: blogPost.category.title,
      timestamp: new Date().toISOString(),
    });
  }, [blogPost]);

  const handleCTAClick = () => {
    trackCTAClick(recommendedCourse._id, position, recommendedCourse.category);
    window.location.href = recommendedCourse.targetUrl;
  };

  const handleSecondaryClick = () => {
    trackCTAClick('contact-secondary', position, 'contact');
    window.location.href = '/contact';
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border-2 border-primary bg-background text-foreground',
    gradient: 'bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground',
  };

  // Position-specific styling
  const positionStyles = {
    top: 'mb-8',
    middle: 'my-12',
    bottom: 'mt-12',
    sidebar: 'sticky top-24',
  };

  return (
    <Card className={`${positionStyles[position]} ${className}`}>
      <CardContent className={`p-4 sm:p-6 ${variantStyles[variant]} rounded-lg`}>
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg flex-shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 leading-tight">
                {recommendedCourse.ctaSettings.ctaTitle}
              </h3>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                {recommendedCourse.ctaSettings.ctaMessage}
              </p>
            </div>
          </div>

          {/* Course highlights */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4 border-t border-white/20">
            <div className="text-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 opacity-80" />
              <div className="text-xs opacity-90">Expert Instructors</div>
            </div>
            <div className="text-center">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 opacity-80" />
              <div className="text-xs opacity-90">DGCA Approved</div>
            </div>
            <div className="text-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 opacity-80" />
              <div className="text-xs opacity-90">Flexible Schedule</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleCTAClick}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-sm sm:text-base h-10 sm:h-11"
              size="lg"
            >
              <span className="truncate">{recommendedCourse.ctaSettings.primaryButtonText}</span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm">
              <button
                onClick={handleSecondaryClick}
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                Have questions? Contact us
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="text-center pt-2 border-t border-white/20">
            <p className="text-xs opacity-75">
              Join 1000+ successful pilots who started their journey with us
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}