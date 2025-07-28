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
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for social proof data
export interface StudentTestimonial {
  id: string;
  name: string;
  course: string;
  batch: string;
  rating: number;
  testimonial: string;
  achievement: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  image?: string;
  date: Date;
  verified: boolean;
}

export interface SuccessStory {
  id: string;
  studentName: string;
  course: string;
  beforeStatus: string;
  afterStatus: string;
  timeframe: string;
  keyAchievements: string[];
  testimonial: string;
  image?: string;
  salaryIncrease?: string;
  featured: boolean;
}

export interface IndustryCertification {
  id: string;
  name: string;
  issuer: string;
  description: string;
  icon: string;
  credibilityScore: number;
  validUntil?: Date;
}

export interface AchievementCounter {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  animationDuration?: number;
}

// Student Success Stories Component
interface StudentSuccessStoriesProps {
  stories: SuccessStory[];
  maxStories?: number;
  variant?: 'carousel' | 'grid' | 'featured';
  className?: string;
}

export function StudentSuccessStories({ 
  stories, 
  maxStories = 3, 
  variant = 'carousel',
  className 
}: StudentSuccessStoriesProps) {
  const [currentStory, setCurrentStory] = useState(0);
  const displayStories = stories.slice(0, maxStories);

  useEffect(() => {
    if (variant === 'carousel' && displayStories.length > 1) {
      const timer = setInterval(() => {
        setCurrentStory((prev) => (prev + 1) % displayStories.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [displayStories.length, variant]);

  if (variant === 'featured' && displayStories.length > 0) {
    const featuredStory = displayStories.find(story => story.featured) || displayStories[0];
    
    return (
      <motion.div
        className={cn(
          'bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {featuredStory.studentName.charAt(0)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-green-700 dark:text-green-300">Success Story</span>
            </div>
            
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              {featuredStory.studentName}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Before:</div>
                <div className="font-medium text-gray-900 dark:text-white">{featuredStory.beforeStatus}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">After:</div>
                <div className="font-medium text-green-600 dark:text-green-400">{featuredStory.afterStatus}</div>
              </div>
            </div>
            
            <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
              "{featuredStory.testimonial}"
            </blockquote>
            
            <div className="flex flex-wrap gap-2">
              {featuredStory.keyAchievements.map((achievement, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                >
                  ✓ {achievement}
                </span>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Timeframe: {featuredStory.timeframe} • Course: {featuredStory.course}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {displayStories.map((story, index) => (
          <motion.div
            key={story.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {story.studentName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{story.studentName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{story.course}</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              "{story.testimonial.substring(0, 100)}..."
            </div>
            
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              {story.beforeStatus} → {story.afterStatus}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Carousel variant (default)
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {displayStories[currentStory].studentName.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {displayStories[currentStory].studentName}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  • {displayStories[currentStory].course}
                </span>
              </div>
              
              <blockquote className="text-gray-700 dark:text-gray-300 italic mb-3">
                "{displayStories[currentStory].testimonial}"
              </blockquote>
              
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {displayStories[currentStory].beforeStatus} → {displayStories[currentStory].afterStatus}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Carousel indicators */}
      {displayStories.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {displayStories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStory(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentStory ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Testimonials Component
interface TestimonialsProps {
  testimonials: StudentTestimonial[];
  maxTestimonials?: number;
  showRatings?: boolean;
  variant?: 'compact' | 'detailed' | 'minimal';
  className?: string;
}

export function Testimonials({ 
  testimonials, 
  maxTestimonials = 3, 
  showRatings = true,
  variant = 'compact',
  className 
}: TestimonialsProps) {
  const displayTestimonials = testimonials.slice(0, maxTestimonials);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'
        )}
      />
    ));
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-3', className)}>
        {displayTestimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Quote className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                "{testimonial.testimonial.substring(0, 80)}..."
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                - {testimonial.name}, {testimonial.course}
              </div>
            </div>
            {showRatings && (
              <div className="flex gap-1">
                {renderStars(testimonial.rating)}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {displayTestimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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
                
                {showRatings && (
                  <div className="flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                )}
              </div>
              
              <blockquote className="text-gray-700 dark:text-gray-300 italic mb-3">
                "{testimonial.testimonial}"
              </blockquote>
              
              {variant === 'detailed' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>{testimonial.achievement}</span>
                  </div>
                  
                  {testimonial.currentPosition && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4" />
                      <span>{testimonial.currentPosition}</span>
                      {testimonial.company && <span>at {testimonial.company}</span>}
                    </div>
                  )}
                  
                  {testimonial.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{testimonial.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Industry Certifications Component
interface IndustryCertificationsProps {
  certifications: IndustryCertification[];
  variant?: 'badges' | 'detailed' | 'compact';
  className?: string;
}

export function IndustryCertifications({ 
  certifications, 
  variant = 'badges',
  className 
}: IndustryCertificationsProps) {
  if (variant === 'badges') {
    return (
      <div className={cn('flex flex-wrap gap-3', className)}>
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {cert.name}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {cert.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {cert.issuer}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn('space-y-4', className)}>
      {certifications.map((cert, index) => (
        <motion.div
          key={cert.id}
          className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {cert.name}
              </h4>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < cert.credibilityScore / 20 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Issued by: {cert.issuer}
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {cert.description}
            </p>
            
            {cert.validUntil && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Valid until: {cert.validUntil.toLocaleDateString()}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Achievement Counters Component
interface AchievementCountersProps {
  counters: AchievementCounter[];
  variant?: 'horizontal' | 'grid' | 'vertical';
  animateOnView?: boolean;
  className?: string;
}

export function AchievementCounters({ 
  counters, 
  variant = 'horizontal',
  animateOnView = true,
  className 
}: AchievementCountersProps) {
  const [animated, setAnimated] = useState(!animateOnView);

  useEffect(() => {
    if (animateOnView) {
      const timer = setTimeout(() => setAnimated(true), 500);
      return () => clearTimeout(timer);
    }
  }, [animateOnView]);

  const AnimatedCounter = ({ counter }: { counter: AchievementCounter }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!animated) return;

      const duration = counter.animationDuration || 2000;
      const steps = 60;
      const increment = counter.value / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setCount(Math.min(Math.floor(increment * currentStep), counter.value));
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }, [animated, counter]);

    return (
      <motion.div
        className={cn(
          'text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
          variant === 'horizontal' && 'flex-1'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={cn('mb-2 flex justify-center', `text-${counter.color}-500`)}>
          {counter.icon}
        </div>
        
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {counter.prefix}{count.toLocaleString()}{counter.suffix}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {counter.label}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn(
      variant === 'horizontal' && 'flex gap-4',
      variant === 'grid' && 'grid grid-cols-2 md:grid-cols-4 gap-4',
      variant === 'vertical' && 'space-y-4',
      className
    )}>
      {counters.map((counter) => (
        <AnimatedCounter key={counter.id} counter={counter} />
      ))}
    </div>
  );
}

// Alumni Network Showcase Component
interface AlumniNetworkProps {
  totalAlumni: number;
  featuredCompanies: string[];
  successRate: number;
  averageSalaryIncrease: string;
  className?: string;
}

export function AlumniNetworkShowcase({ 
  totalAlumni, 
  featuredCompanies, 
  successRate,
  averageSalaryIncrease,
  className 
}: AlumniNetworkProps) {
  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
            {totalAlumni.toLocaleString()}+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Alumni</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {successRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {averageSalaryIncrease}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Salary Increase</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {featuredCompanies.length}+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Top Airlines</div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3 text-center">
          Our Alumni Work At:
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {featuredCompanies.map((company, index) => (
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
  );
}