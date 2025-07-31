'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CTATemplate, CTAComponentProps } from '@/lib/types/cta';
import { 
  socialProofService, 
  StudentTestimonial, 
  SuccessStory, 
  IndustryCertification,
  AchievementCounter,
  AlumniData 
} from '@/lib/cta/social-proof-service';
import { 
  StudentSuccessStories,
  Testimonials,
  IndustryCertifications,
  AchievementCounters,
  AlumniNetworkShowcase
} from './SocialProofElements';
import { EnhancedCTACardVariant, EnhancedCTABannerVariant } from './EnhancedCTAVariants';
import { cn } from '@/lib/utils';

interface SocialProofEnhancedCTAProps extends CTAComponentProps {
  courseId?: string;
  showTestimonials?: boolean;
  showSuccessStories?: boolean;
  showCertifications?: boolean;
  showAchievements?: boolean;
  showAlumniNetwork?: boolean;
  socialProofLayout?: 'above' | 'below' | 'integrated';
}

export function SocialProofEnhancedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  showTestimonials = true,
  showSuccessStories = true,
  showCertifications = true,
  showAchievements = true,
  showAlumniNetwork = false,
  socialProofLayout = 'above',
  className, 
  onInteraction 
}: SocialProofEnhancedCTAProps) {
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [certifications, setCertifications] = useState<IndustryCertification[]>([]);
  const [achievements, setAchievements] = useState<AchievementCounter[]>([]);
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract course ID from template or use provided courseId
  const targetCourseId = courseId || template.targetCourse?._id || 'default-course';

  useEffect(() => {
    const loadSocialProofData = async () => {
      try {
        setLoading(true);
        
        const [
          testimonialsData,
          successStoriesData,
          certificationsData,
          achievementsData,
          alumniNetworkData
        ] = await Promise.all([
          showTestimonials ? socialProofService.getTestimonials(targetCourseId, 3) : [],
          showSuccessStories ? socialProofService.getSuccessStories(targetCourseId, 2) : [],
          showCertifications ? socialProofService.getIndustryCertifications() : [],
          showAchievements ? socialProofService.getAchievementCounters() : [],
          showAlumniNetwork ? socialProofService.getAlumniData() : null,
        ]);

        setTestimonials(testimonialsData);
        setSuccessStories(successStoriesData);
        setCertifications(certificationsData);
        setAchievements(achievementsData);
        setAlumniData(alumniNetworkData);

      } catch (error) {
        console.error('Error loading social proof data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSocialProofData();
  }, [targetCourseId, showTestimonials, showSuccessStories, showCertifications, showAchievements, showAlumniNetwork]);

  // Enhanced interaction handler with social proof tracking
  const handleInteraction = (event: any) => {
    // Track social proof influence on interactions
    socialProofService.trackSocialProofInteraction(
      'cta_interaction',
      event.action,
      targetCourseId
    );

    onInteraction?.(event);
  };

  // Enhanced template with social proof data
  const enhancedTemplate: CTATemplate = {
    ...template,
    urgencyElements: {
      ...template.urgencyElements,
      // Add social proof to urgency elements
      socialProof: testimonials.length > 0 
        ? `${testimonials.length}+ verified reviews • ${Math.round(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length * 10) / 10}/5 rating`
        : template.urgencyElements?.socialProof,
    }
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
      </div>
    );
  }

  const SocialProofElements = () => (
    <div className="space-y-6">
      {/* Achievement Counters */}
      {showAchievements && achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AchievementCounters 
            counters={achievements.slice(0, 4)} 
            variant="horizontal"
            animateOnView={true}
          />
        </motion.div>
      )}

      {/* Industry Certifications */}
      {showCertifications && certifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Industry Recognized & Certified
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our training programs meet the highest industry standards
            </p>
          </div>
          <IndustryCertifications 
            certifications={certifications.slice(0, 5)} 
            variant="badges"
          />
        </motion.div>
      )}

      {/* Success Stories */}
      {showSuccessStories && successStories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Student Success Stories
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real transformations from our training programs
            </p>
          </div>
          <StudentSuccessStories 
            stories={successStories} 
            variant="featured"
            maxStories={1}
          />
        </motion.div>
      )}

      {/* Testimonials */}
      {showTestimonials && testimonials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What Our Students Say
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verified reviews from successful graduates
            </p>
          </div>
          <Testimonials 
            testimonials={testimonials} 
            variant="minimal"
            maxTestimonials={3}
            showRatings={true}
          />
        </motion.div>
      )}

      {/* Alumni Network */}
      {showAlumniNetwork && alumniData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AlumniNetworkShowcase 
            totalAlumni={alumniData.totalAlumni}
            featuredCompanies={alumniData.featuredCompanies.slice(0, 8)}
            successRate={alumniData.successRate}
            averageSalaryIncrease={alumniData.averageSalaryIncrease}
          />
        </motion.div>
      )}
    </div>
  );

  const CTAComponent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: socialProofLayout === 'above' ? 0.5 : 0 }}
    >
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
    </motion.div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {socialProofLayout === 'above' && <SocialProofElements />}
      
      <CTAComponent />
      
      {socialProofLayout === 'below' && <SocialProofElements />}
      
      {socialProofLayout === 'integrated' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CTAComponent />
          <SocialProofElements />
        </div>
      )}
    </div>
  );
}

// Specialized social proof CTA variants
export function TestimonialFocusedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: SocialProofEnhancedCTAProps) {
  return (
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
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function SuccessStoryFocusedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: SocialProofEnhancedCTAProps) {
  return (
    <SocialProofEnhancedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      showTestimonials={false}
      showSuccessStories={true}
      showCertifications={true}
      showAchievements={true}
      showAlumniNetwork={true}
      socialProofLayout="above"
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function CredibilityFocusedCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: SocialProofEnhancedCTAProps) {
  return (
    <SocialProofEnhancedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      showTestimonials={true}
      showSuccessStories={false}
      showCertifications={true}
      showAchievements={true}
      showAlumniNetwork={true}
      socialProofLayout="integrated"
      className={className}
      onInteraction={onInteraction}
    />
  );
}

export function ComprehensiveSocialProofCTA({ 
  template, 
  blogPost, 
  position, 
  courseId,
  className, 
  onInteraction 
}: SocialProofEnhancedCTAProps) {
  return (
    <SocialProofEnhancedCTA
      template={template}
      blogPost={blogPost}
      position={position}
      courseId={courseId}
      showTestimonials={true}
      showSuccessStories={true}
      showCertifications={true}
      showAchievements={true}
      showAlumniNetwork={true}
      socialProofLayout="above"
      className={className}
      onInteraction={onInteraction}
    />
  );
}
