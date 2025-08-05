"use client"
import React from 'react';
import HeroSection from "@/components/features/courses/HeroSection";
import WhyChooseUs from "@/components/features/courses/WhyChooseUs";
import CoursesSection from "@/components/features/courses/CoursesSection";
import FeaturedBlogSection from "@/components/features/courses/FeaturedBlogSection";
import PilotPathway from "@/components/features/courses/PilotPathway";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/features/courses/CTASection";
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Plane, Target, Radio, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';

// Define consistent animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
        <div className="container px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">
          {/* SEO-Optimized Content Section */}
          <motion.section 
            className="text-center space-y-8"
            variants={sectionVariants}
            initial="hidden"
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
              className="text-lg md:text-xl lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Master DGCA exams with expert-led online ground school. Learn from experienced airline pilots like <strong>Ankit Kumar</strong>, <strong>Dhruv Shirkoli</strong>, and <strong>Saksham Khandelwal</strong>. Our ATC courses include comprehensive CPL/ATPL training, Type Rating preparation, and RTR(A) certification with 24/7 support and proven success rates.
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-6 text-base md:text-lg"
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
