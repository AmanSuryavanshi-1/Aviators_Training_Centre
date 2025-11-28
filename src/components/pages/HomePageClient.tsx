"use client"
import React from 'react';
import HeroSection from "@/components/features/courses/HeroSection";
import WhyChooseUs from "@/components/features/courses/WhyChooseUs";
import CoursesSection from "@/components/features/courses/CoursesSection";
import FeaturedBlogSection from "@/components/features/courses/FeaturedBlogSection";
import PilotPathway from "@/components/features/courses/PilotPathway";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/features/courses/CTASection";
import InfiniteVideoCarousel from "@/components/testimonials/InfiniteVideoCarousel";
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Plane, Target, Radio, GraduationCap, TrendingUp, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { commonVariants } from '@/lib/animations/easing';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';

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
      <HeroSection />

      <main>
        <div className="container px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28 max-w-full overflow-hidden">
          {/* SEO-Optimized Content Section */}
          <motion.section
            className="text-center space-y-8"
            variants={sectionVariants}
            initial="visible"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h1
              className={cn("text-2xl md:text-3xl lg:text-4xl font-bold leading-tight", aviationPrimary)}
              variants={itemVariants}
            >
              Aviators Training Centre - India's Premier ATC Training Institute
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              <span className="font-semibold text-teal-700 dark:text-teal-300">Master DGCA exams with expert-led online ground school.</span> Learn from experienced airline pilots like <strong className="font-semibold text-teal-700 dark:text-teal-300">Ankit Kumar</strong>, <strong className="font-semibold text-teal-700 dark:text-teal-300">Dhruv Shirkoli</strong>, and <strong className="font-semibold text-teal-700 dark:text-teal-300">Saksham Khandelwal</strong>. Our <span className="font-semibold text-teal-700 dark:text-teal-300">ATC courses</span> include comprehensive <span className="font-semibold text-teal-700 dark:text-teal-300">CPL/ATPL</span> training, <span className="font-semibold text-teal-700 dark:text-teal-300">Type Rating</span> preparation, and <span className="font-semibold text-teal-700 dark:text-teal-300">RTR(A)</span> certification with 24/7 support and proven success rates.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-base md:text-lg px-2"
              variants={itemVariants}
            >
              <span className="bg-teal-50 dark:bg-teal-900/20 px-4 py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Plane className="w-5 h-5" />
                DGCA Ground School
              </span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-4 py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Target className="w-5 h-5" />
                Type Rating Prep
              </span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-4 py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <Radio className="w-5 h-5" />
                RTR(A) Training
              </span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-4 py-3 rounded-full flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium">
                <GraduationCap className="w-5 h-5" />
                Airline Instructors
              </span>
            </motion.div>

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
              <h2 className={cn("text-3xl md:text-4xl lg:text-5xl font-bold", aviationPrimary)}>
                Success Stories from Our Graduates
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Watch authentic testimonials from our successful DGCA CPL graduates who transformed their aviation dreams into reality through our comprehensive training programs.
              </p>
            </motion.div>

            <InfiniteVideoCarousel />

            {/* Action Buttons */}
            <motion.div
              className="text-center mt-12 space-y-6"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div onClick={() => handleCTAClick('Browse All Testimonials', '/testimonials')}>
                  <SolidButton
                    href="/testimonials"
                    icon={Users}
                    label="Browse All Testimonials"
                    className="data-[conversion=true]:conversion-button"
                  />
                </div>

                <div onClick={() => handleCTAClick('Contact Us', '/contact')}>
                  <TransparentButton
                    href="/contact"
                    icon={GraduationCap}
                    label="Contact Us"
                    className="data-[conversion=true]:conversion-button"
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
