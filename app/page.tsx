"use client"
import React from 'react';
import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CoursesSection from "@/components/home/CoursesSection";
import FeaturedBlogSection from "@/components/home/FeaturedBlogSection";
import PilotPathway from "@/components/home/PilotPathway";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/home/CTASection";
import { motion } from 'framer-motion'; // Import motion
import { cn } from "@/components/ui/utils"; // Import cn
// Removed Sanity imports - using static data instead
import { Plane, Target, Radio, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react'; // Import Lucide React icons
import Link from 'next/link';
// import MetaPixelTest from '@/components/shared/MetaPixelTest'; // Removed for production

// Define consistent animation variants (can be moved to a shared file later)
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

// Import comprehensive blog data
import { getFeaturedPosts } from '@/lib/blog/comprehensive-blog-data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Enhanced Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Aviators Training Centre - India's Premier ATC Training Institute",
            "description": "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training. Learn from airline pilots like Ankit Kumar.",
            "url": "https://www.aviatorstrainingcentre.in",
            "mainEntity": {
              "@type": "EducationalOrganization",
              "name": "Aviators Training Centre",
              "alternateName": "ATC",
              "description": "India's premier aviation training institute offering DGCA CPL/ATPL ground school, Type Rating preparation, and comprehensive pilot training programs.",
              "url": "https://www.aviatorstrainingcentre.in",
              "hasCredential": [
                "DGCA CPL Ground Training",
                "DGCA ATPL Ground Training", 
                "Type Rating Preparation",
                "RTR(A) Training"
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.aviatorstrainingcentre.in"
              }]
            }
          })
        }}
      />

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
              className={cn("text-3xl md:text-4xl lg:text-5xl font-bold leading-tight", aviationPrimary)}
              variants={itemVariants}
            >
              Aviators Training Centre - India's Premier ATC Training Institute
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-medium"
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
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors duration-200 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30"
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

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* FAQ Section - Use the updated component */}
          {/* We let the FAQ component handle its own header and styling */}
          {/* Pass showAll={false} to limit FAQs and show the "View All" button */}
          <FAQ showAll={false} />

          {/* Featured Blog Section */}
          <FeaturedBlogSection featuredPosts={getFeaturedPosts()} />

          {/* CTA Section */}
          <CTASection />
          </div>

      </main>
      
      {/* Meta Pixel Test Component - Removed for production */}
    </div>
  );
}
