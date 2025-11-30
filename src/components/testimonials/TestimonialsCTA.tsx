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
            <div className="flex flex-wrap justify-center gap-4 w-full max-w-md mx-auto">
              <div onClick={() => testimonialsAnalytics.trackCTAClick('demo', 'secondary-cta')} className="flex-1 min-w-[140px]">
                <BookDemoButton
                  size="lg"
                  mobileLabel="Demo"
                  state={{
                    subject: "Demo Request from Testimonials Page",
                    courseName: "DGCA Ground School"
                  }}
                  className="w-full"
                />
              </div>
              <div onClick={() => testimonialsAnalytics.trackCTAClick('courses', 'secondary-cta')} className="flex-1 min-w-[140px]">
                <TransparentButton
                  href="/courses"
                  icon={GraduationCap}
                  label="Explore Courses"
                  mobileLabel="Courses"
                  className="w-full"
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
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-md mx-auto mb-12">
            <div onClick={() => testimonialsAnalytics.trackCTAClick('demo', 'primary-cta')} className="flex-1 min-w-[140px]">
              <BookDemoButton
                size="lg"
                mobileLabel="Demo"
                state={{
                  subject: "Demo Request from Testimonials Page",
                  courseName: "DGCA Ground School"
                }}
                className="w-full"
              />
            </div>
            <div onClick={() => testimonialsAnalytics.trackCTAClick('courses', 'primary-cta')} className="flex-1 min-w-[140px]">
              <TransparentButton
                href="/courses"
                icon={ArrowRight}
                label="View All Courses"
                mobileLabel="Courses"
                className="w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Urgency CTA */}
        <UrgencyCTA />
      </div>
    </motion.section>
  );
}