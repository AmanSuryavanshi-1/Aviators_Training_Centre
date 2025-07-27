'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Award, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Quote,
  MapPin,
  Calendar,
  Briefcase,
  Trophy,
  Target,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Play,
  Building,
  GraduationCap,
  Plane
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  socialProofService, 
  StudentTestimonial, 
  SuccessStory, 
  IndustryCertification,
  AchievementCounter,
  AlumniData 
} from '@/lib/cta/social-proof-service';

interface SocialProofIntegrationProps {
  courseId?: string;
  blogPostSlug?: string;
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
  variant?: 'compact' | 'detailed' | 'featured';
  showElements?: {
    testimonials?: boolean;
    successStories?: boolean;
    certifications?: boolean;
    achievements?: boolean;
    alumni?: boolean;
  };
  maxItems?: {
    testimonials?: number;
    successStories?: number;
    certifications?: number;
    achievements?: number;
  };
  className?: string;
}

export function SocialProofIntegration({
  courseId,
  blogPostSlug,
  position = 'middle',
  variant = 'detailed',
  showElements = {
    testimonials: true,
    successStories: true,
    certifications: true,
    achievements: true,
    alumni: true,
  },
  maxItems = {
    testimonials: 3,
    successStories: 2,
    certifications: 5,
    achievements: 4,
  },
  className
}: SocialProofIntegrationProps) {
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [certifications, setCertifications] = useState<IndustryCertification[]>([]);
  const [achievements, setAchievements] = useState<AchievementCounter[]>([]);
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'testimonials' | 'stories' | 'achievements'>('testimonials');

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
          showElements.testimonials ? socialProofService.getTestimonials(courseId, maxItems.testimonials) : [],
          showElements.successStories ? socialProofService.getSuccessStories(courseId, maxItems.successStories) : [],
          showElements.certifications ? socialProofService.getIndustryCertifications() : [],
          showElements.achievements ? socialProofService.getAchievementCounters() : [],
          showElements.alumni ? socialProofService.getAlumniData() : null,
        ]);

        setTestimonials(testimonialsData);
        setSuccessStories(successStoriesData);
        setCertifications(certificationsData.slice(0, maxItems.certifications));
        setAchievements(achievementsData.slice(0, maxItems.achievements));
        setAlumniData(alumniNetworkData);

        // Track social proof display
        socialProofService.trackSocialProofInteraction(
          'social_proof_display',
          'view',
          courseId || blogPostSlug
        );

      } catch (error) {
        console.error('Error loading social proof data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSocialProofData();
  }, [courseId, blogPostSlug, showElements, maxItems]);

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Quick Stats */}
        {showElements.achievements && achievements.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {achievement.prefix}{achievement.value.toLocaleString()}{achievement.suffix}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Testimonial */}
        {showElements.testimonials && testimonials.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{testimonials[0].testimonial.substring(0, 120)}..."
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  - {testimonials[0].name}, {testimonials[0].course}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={cn('space-y-8', className)}>
        {/* Featured Success Story */}
        {showElements.successStories && successStories.length > 0 && (
          <motion.div
            className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {successStories[0].studentName.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-green-700 dark:text-green-300">Success Story</span>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {successStories[0].studentName}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Before:</div>
                    <div className="font-medium text-gray-900 dark:text-white">{successStories[0].beforeStatus}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">After:</div>
                    <div className="font-medium text-green-600 dark:text-green-400">{successStories[0].afterStatus}</div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
                  "{successStories[0].testimonial}"
                </blockquote>
                
                <div className="flex flex-wrap gap-2">
                  {successStories[0].keyAchievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                    >
                      ✓ {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievement Highlights */}
        {showElements.achievements && achievements.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`mb-2 flex justify-center text-${achievement.color}-500`}>
                  {typeof achievement.icon === 'string' ? (
                    <span className="text-2xl">{achievement.icon}</span>
                  ) : (
                    achievement.icon
                  )}
                </div>
                
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {achievement.prefix}{achievement.value.toLocaleString()}{achievement.suffix}
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={cn('space-y-8', className)}>
      {/* Section Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Trusted by Aviation Professionals
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Join thousands of successful pilots who chose Aviators Training Centre
        </p>
      </div>

      {/* Achievement Counters */}
      {showElements.achievements && achievements.length > 0 && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-2 flex justify-center text-${achievement.color}-500`}>
                {typeof achievement.icon === 'string' ? (
                  <span className="text-2xl">{achievement.icon}</span>
                ) : (
                  achievement.icon
                )}
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {achievement.prefix}{achievement.value.toLocaleString()}{achievement.suffix}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.label}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Industry Certifications */}
      {showElements.certifications && certifications.length > 0 && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
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
          <div className="flex flex-wrap gap-3 justify-center">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-full"
              >
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {cert.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabbed Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {showElements.testimonials && testimonials.length > 0 && (
            <button
              onClick={() => setActiveTab('testimonials')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'testimonials'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Quote className="w-4 h-4" />
                Testimonials
              </div>
            </button>
          )}
          
          {showElements.successStories && successStories.length > 0 && (
            <button
              onClick={() => setActiveTab('stories')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'stories'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-b-2 border-green-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                Success Stories
              </div>
            </button>
          )}
          
          {showElements.achievements && achievements.length > 0 && (
            <button
              onClick={() => setActiveTab('achievements')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'achievements'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4" />
                Achievements
              </div>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'testimonials' && showElements.testimonials && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {testimonial.name}
                            {testimonial.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {testimonial.course} • {testimonial.batch}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <blockquote className="text-gray-700 dark:text-gray-300 italic mb-3">
                        "{testimonial.testimonial}"
                      </blockquote>
                      
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Trophy className="w-4 h-4" />
                        <span>{testimonial.achievement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'stories' && showElements.successStories && (
              <motion.div
                key="stories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {successStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {story.studentName.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {story.studentName}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Before:</div>
                            <div className="font-medium text-gray-900 dark:text-white">{story.beforeStatus}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">After:</div>
                            <div className="font-medium text-green-600 dark:text-green-400">{story.afterStatus}</div>
                          </div>
                        </div>
                        
                        <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
                          "{story.testimonial}"
                        </blockquote>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {story.keyAchievements.map((achievement, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                            >
                              ✓ {achievement}
                            </span>
                          ))}
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Timeframe: {story.timeframe} • Course: {story.course}
                          {story.salaryIncrease && (
                            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                              • {story.salaryIncrease} salary increase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'achievements' && showElements.achievements && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className={`p-3 bg-${achievement.color}-100 dark:bg-${achievement.color}-900/30 rounded-full`}>
                        {typeof achievement.icon === 'string' ? (
                          <span className="text-xl">{achievement.icon}</span>
                        ) : (
                          <div className={`text-${achievement.color}-600 dark:text-${achievement.color}-400`}>
                            {achievement.icon}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {achievement.prefix}{achievement.value.toLocaleString()}{achievement.suffix}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Alumni Network */}
      {showElements.alumni && alumniData && (
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Our Alumni Network
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of successful aviation professionals worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {alumniData.totalAlumni.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alumni</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {alumniData.successRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {alumniData.averageSalaryIncrease}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Salary Increase</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {alumniData.featuredCompanies.length}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Airlines</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3 text-center">
              Our Alumni Work At:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {alumniData.featuredCompanies.slice(0, 8).map((company, index) => (
                <motion.span
                  key={company}
                  className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Specialized variants for different use cases
export function BlogSocialProofSidebar({ courseId, blogPostSlug, className }: {
  courseId?: string;
  blogPostSlug?: string;
  className?: string;
}) {
  return (
    <SocialProofIntegration
      courseId={courseId}
      blogPostSlug={blogPostSlug}
      position="sidebar"
      variant="compact"
      showElements={{
        testimonials: true,
        successStories: false,
        certifications: true,
        achievements: true,
        alumni: false,
      }}
      maxItems={{
        testimonials: 2,
        achievements: 3,
        certifications: 3,
      }}
      className={className}
    />
  );
}

export function BlogSocialProofHeader({ courseId, blogPostSlug, className }: {
  courseId?: string;
  blogPostSlug?: string;
  className?: string;
}) {
  return (
    <SocialProofIntegration
      courseId={courseId}
      blogPostSlug={blogPostSlug}
      position="top"
      variant="featured"
      showElements={{
        testimonials: false,
        successStories: true,
        certifications: false,
        achievements: true,
        alumni: false,
      }}
      maxItems={{
        successStories: 1,
        achievements: 4,
      }}
      className={className}
    />
  );
}

export function BlogSocialProofFooter({ courseId, blogPostSlug, className }: {
  courseId?: string;
  blogPostSlug?: string;
  className?: string;
}) {
  return (
    <SocialProofIntegration
      courseId={courseId}
      blogPostSlug={blogPostSlug}
      position="bottom"
      variant="detailed"
      showElements={{
        testimonials: true,
        successStories: true,
        certifications: true,
        achievements: true,
        alumni: true,
      }}
      maxItems={{
        testimonials: 3,
        successStories: 2,
        certifications: 5,
        achievements: 6,
      }}
      className={className}
    />
  );
}