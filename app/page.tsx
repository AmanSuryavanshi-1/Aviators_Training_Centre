"use client"
import React from 'react';
import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CoursesSection from "@/components/home/CoursesSection";
import PilotPathway from "@/components/home/PilotPathway";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/home/CTASection";
import { motion } from 'framer-motion'; // Import motion
import { cn } from "@/components/ui/utils"; // Import cn

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
            className="text-center space-y-6"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h1 
              className={cn("text-4xl md:text-5xl lg:text-6xl font-bold", aviationPrimary)}
              variants={itemVariants}
            >
              Aviators Training Centre - India's Premier ATC Training Institute
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Master DGCA exams with expert-led online ground school. Learn from experienced airline pilots like <strong>Ankit Kumar</strong>, <strong>Dhruv Shirkoli</strong>, and <strong>Saksham Khandelwal</strong>. Our ATC courses include comprehensive CPL/ATPL training, Type Rating preparation, and RTR(A) certification with 24/7 support and proven success rates.
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-muted-foreground"
              variants={itemVariants}
            >
              <span className="bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">✈️ DGCA Ground School</span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">🎯 Type Rating Prep</span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">📡 RTR(A) Training</span>
              <span className="bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">👨‍✈️ Airline Instructors</span>
            </motion.div>
          </motion.section>

          {/* Why Choose Us Section */}
          <WhyChooseUs />

          {/* Pilot Pathway Section */}
          <PilotPathway />

          {/* Courses Section */}
          <CoursesSection />

          {/* FAQ Section - Use the updated component */}
          {/* We let the FAQ component handle its own header and styling */}
          {/* Pass showAll={false} to limit FAQs and show the "View All" button */}
          <FAQ showAll={false} />

          {/* CTA Section */}
          <CTASection />
          </div>

      </main>
    </div>
  );
}