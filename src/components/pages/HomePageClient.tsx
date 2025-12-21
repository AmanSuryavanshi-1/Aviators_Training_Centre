"use client"
import React from 'react';
// import HeroSection from "@/components/features/courses/HeroSection"; // Moved to page.tsx
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Plane, Target, Radio, GraduationCap, TrendingUp, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { commonVariants } from '@/lib/animations/easing';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';
import {
  WhyChooseUs,
  CoursesSection,
  FeaturedBlogSection,
  PilotPathway,
  FAQSection as FAQ,
  CTASection,
} from '@/lib/dynamic-components';
// Lazy load TestimonialsVideoCarousel to reduce initial block time
import dynamic from 'next/dynamic';
const TestimonialsVideoCarousel = dynamic(
  () => import('@/components/testimonials/TestimonialsVideoCarousel'),
  { ssr: false, loading: () => <div className="h-[60vh] flex items-center justify-center">Loading...</div> }
);

// Use consistent animation variants with proper easing
const { sectionVariants, itemVariants } = commonVariants;

// Define primary color for consistent heading usage
const aviationPrimary = 'text-teal-700 dark:text-teal-300';

export default function HomePageClient() {
  const analytics = useAnalytics();

  const handleCTAClick = (ctaText: string, destination: string) => {
    analytics.trackCTAClick(ctaText, 'homepage', destination);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* HeroSection moved to page.tsx for LCP optimization */}

      <main>
        <div className="container px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28 max-w-full overflow-hidden">
          {/* SEO-Optimized Content Section */}
          <motion.section
            className="text-center space-y-8"
            variants={sectionVariants}
            initial="visible"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            aria-labelledby="main-heading"
          >
            {/* Screen reader only H1 for SEO */}
            <h1 id="main-heading" className="sr-only">
              Aviators Training Centre - India's Premier DGCA Ground School for CPL/ATPL Training
            </h1>

            <motion.h2
              className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight", aviationPrimary)}
              variants={itemVariants}
              aria-label="Main page heading"
            >
              Aviators Training Centre - India's Premier ATC Training Institute
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/90 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              <span className="font-semibold text-teal-700 dark:text-teal-300">Master DGCA exams with expert-led online ground school.</span> Learn from experienced airline pilots like <strong className="font-semibold text-teal-700 dark:text-teal-300">Ankit Kumar</strong>, <strong className="font-semibold text-teal-700 dark:text-teal-300">Dhruv Shirkoli</strong>, and <strong className="font-semibold text-teal-700 dark:text-teal-300">Saksham Khandelwal</strong>. Our <span className="font-semibold text-teal-700 dark:text-teal-300">ATC courses</span> include comprehensive <span className="font-semibold text-teal-700 dark:text-teal-300">CPL/ATPL</span> training, <span className="font-semibold text-teal-700 dark:text-teal-300">Type Rating</span> preparation, and <span className="font-semibold text-teal-700 dark:text-teal-300">RTR(A)</span> certification with 24/7 support and proven success rates.
            </motion.p>
            <motion.ul
              className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-xs sm:text-sm md:text-base px-2 list-none"
              variants={itemVariants}
            >
              <li className="bg-teal-50 dark:bg-teal-900/20 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Plane className="w-5 h-5" />
                DGCA Ground School
              </li>
              <li className="bg-teal-50 dark:bg-teal-900/20 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Target className="w-5 h-5" />
                Type Rating Prep
              </li>
              <li className="bg-teal-50 dark:bg-teal-900/20 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Radio className="w-5 h-5" />
                RTR(A) Training
              </li>
              <li className="bg-teal-50 dark:bg-teal-900/20 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <GraduationCap className="w-5 h-5" />
                Airline Instructors
              </li>
            </motion.ul>

            {/* Internal Link to Blog Content */}
            <motion.div
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <Link
                href="/blog/pilot-salary-india-2024-career-earnings-guide"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors duration-200 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30 conversion-button"
                onClick={() => handleCTAClick('Discover Pilot Salary Potential', '/blog/pilot-salary-india-2024-career-earnings-guide')}
                data-conversion="true"
                data-analytics-event="blog_link_click"
                data-analytics-source="homepage"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Discover Pilot Salary Potential in India
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </motion.section>

          {/* Why Choose Us Section */}
          <WhyChooseUs />

          {/* Pilot Pathway Section */}
          <PilotPathway />

          {/* Courses Section */}
          <CoursesSection />

          {/* Testimonials Section - Infinite Scroll */}
          <motion.section
            className="py-16 md:py-20"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              className="text-center space-y-6 mb-12"
              variants={itemVariants}
            >
              <h2 className={cn("text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold", aviationPrimary)}>
                Success Stories from Our Graduates
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Watch authentic testimonials from our successful DGCA CPL graduates who transformed their aviation dreams into reality through our comprehensive training programs.
              </p>
            </motion.div>

            <TestimonialsVideoCarousel />

            {/* Action Buttons */}
            <motion.div
              className="text-center mt-12 space-y-6"
              variants={itemVariants}
            >
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
                <div onClick={() => handleCTAClick('Browse All Testimonials', '/testimonials')} className="flex-1 min-w-[140px]">
                  <SolidButton
                    href="/testimonials"
                    icon={Users}
                    label="Browse All Testimonials"
                    mobileLabel="Testimonials"
                    className="w-full data-[conversion=true]:conversion-button"
                  />
                </div>

                <div onClick={() => handleCTAClick('Contact Us', '/contact')} className="flex-1 min-w-[140px]">
                  <TransparentButton
                    href="/contact"
                    icon={GraduationCap}
                    label="Contact Us"
                    mobileLabel="Contact"
                    className="w-full data-[conversion=true]:conversion-button"
                  />
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* FAQ Section */}
          <FAQ showAll={false} />

          {/* Featured Blog Section */}
          <FeaturedBlogSection />

          {/* CTA Section */}
          <CTASection />
        </div>
      </main>
    </div>
  );
}
