"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { UrgencyCTA } from '@/components/shared/UrgencyCTA';
import { GraduationCap, Users, Award, ArrowRight } from 'lucide-react';
import { testimonialsAnalytics } from '@/lib/testimonials/analytics';

interface TestimonialsCTAProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

export default function TestimonialsCTA({ className, variant = 'primary' }: TestimonialsCTAProps) {
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 14);
  const formattedEndDate = offerEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (variant === 'secondary') {
    return (
      <motion.section
        className={cn(
          "py-12 sm:py-16 bg-gradient-to-br from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-2xl border border-border/50",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className={cn("text-xl md:text-2xl font-bold mb-4", aviationPrimary)}>
              Ready to Start Your Aviation Journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of successful pilots who started their career with our comprehensive training programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div onClick={() => testimonialsAnalytics.trackCTAClick('demo', 'secondary-cta')}>
                <BookDemoButton 
                  size="lg"
                  state={{ 
                    subject: "Demo Request from Testimonials Page", 
                    courseName: "DGCA Ground School" 
                  }}
                />
              </div>
              <div onClick={() => testimonialsAnalytics.trackCTAClick('courses', 'secondary-cta')}>
                <TransparentButton
                  href="/courses"
                  icon={GraduationCap}
                  label="Explore Courses"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={cn("py-12 sm:py-16 md:py-20", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main CTA Section */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className={cn("text-3xl md:text-4xl lg:text-5xl font-bold mb-5", aviationPrimary)}>
            Your Success Story Starts Here
          </h2>
          <p className="text-md md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the ranks of successful pilots who achieved their dreams through our comprehensive DGCA ground school training. 
            Your testimonial could be next!
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div onClick={() => testimonialsAnalytics.trackCTAClick('demo', 'primary-cta')}>
              <BookDemoButton 
                size="lg"
                state={{ 
                  subject: "Demo Request from Testimonials Page", 
                  courseName: "DGCA Ground School" 
                }}
              />
            </div>
            <div onClick={() => testimonialsAnalytics.trackCTAClick('courses', 'primary-cta')}>
              <TransparentButton
                href="/courses"
                icon={ArrowRight}
                label="View All Courses"
              />
            </div>
          </div>
        </motion.div>

        {/* Urgency CTA */}
          <UrgencyCTA 
            offerEndDate={offerEndDate} 
            formattedEndDate={formattedEndDate}
          />
      </div>
    </motion.section>
  );
}