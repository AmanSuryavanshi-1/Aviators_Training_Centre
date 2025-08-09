"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Hero from './hero/Hero';
import dynamic from 'next/dynamic';
import TestimonialsCTA from '@/components/testimonials/TestimonialsCTA';

import TextTestimonialsCarousel from '@/components/testimonials/TextTestimonialsCarousel';
import InfiniteVideoCarousel from '@/components/testimonials/InfiniteVideoCarousel';



import { youtubeShorts, studentsData, generateTestimonialsFAQSchema, generateCourseSchema, generateOrganizationSchema } from '@/lib/testimonials/data';
import { generateTestimonialsPageSchema } from './jsonLd';
import { testimonialsAnalytics } from '@/lib/testimonials/analytics';

// Define consistent animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// Define aviation colors using theme-aware classes
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

export default function TestimonialsPage() {
  
  // Track page view safely
  React.useEffect(() => {
    try {
      testimonialsAnalytics.trackPageView();
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  // Generate comprehensive JSON-LD structured data safely
  let jsonLdSchemas: any[] = [];
  try {
    jsonLdSchemas = [
      ...generateTestimonialsPageSchema(youtubeShorts, [], studentsData),
      generateTestimonialsFAQSchema(),
      generateOrganizationSchema(),
      ...generateCourseSchema()
    ];
  } catch (error) {
    console.warn('JSON-LD generation failed:', error);
    jsonLdSchemas = [];
  }

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth"
           style={{ minHeight: '100vh' }}>


        {/* Hero Section */}
        <header>
          <Hero variant="standard" />
        </header>



        {/* Main Content with semantic HTML and professional spacing */}
        <main className="flex-grow" role="main">
        
          {/* Infinite Video Carousel */}
          <section className="relative py-10 md:py-12 bg-gradient-to-br from-background via-muted/5 to-background">
            <InfiniteVideoCarousel />
          </section>

          {/* Text Testimonials Carousel */}
          <section className="relative py-10 md:py-12 bg-gradient-to-br from-muted/20 via-background to-muted/10">
            <TextTestimonialsCarousel />
            {/* Section divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </section>

          {/* Single Consolidated CTA Section */}
          <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,theme(colors.teal.600)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,theme(colors.cyan.600)_0%,transparent_50%)]" />
            </div>
            <div className="container px-4 sm:px-6 relative z-10">
              <aside aria-label="Main call to action">
                <TestimonialsCTA variant="primary" />
              </aside>
            </div>
          </section>

          {/* SEO Content Section with professional layout */}
          <section 
            aria-labelledby="seo-content-heading"
            className="py-20 md:py-24 bg-gradient-to-br from-muted/10 via-background to-card/10"
          >
            <div className="container px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                  <h2 
                    id="seo-content-heading"
                    className={cn("text-2xl md:text-3xl lg:text-4xl font-bold mb-6", aviationPrimary)}
                  >
                    Why Choose Aviators Training Centre for Your Aviation Career?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-teal-400 mx-auto rounded-full" />
                </div>
                
                <div className="grid gap-6 md:gap-8 text-left">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
                      <strong className="text-foreground">Aviators Training Centre</strong> is India's premier aviation training institute, specializing in DGCA CPL and ATPL ground school preparation. Our comprehensive training programs have helped over 500 aspiring pilots achieve their dreams of becoming commercial airline pilots.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
                      Our <strong className="text-foreground">DGCA-approved curriculum</strong> covers all essential subjects including Air Navigation, Meteorology, Air Regulations, Technical General, and Technical Specific. With a 95% success rate in DGCA examinations, we are the trusted choice for serious aviation students across India.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
                      What sets us apart is our team of <strong className="text-foreground">experienced airline pilots</strong> who serve as instructors, bringing real-world aviation experience to the classroom. Our students don't just pass exams – they gain the practical knowledge needed to excel in their aviation careers.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                      From <strong className="text-foreground">Type Rating preparation</strong> for A320 and B737 aircraft to <strong className="text-foreground">RTR(A) training</strong> and interview preparation, we provide end-to-end support for your aviation journey. Join the ranks of successful pilots who chose Aviators Training Centre as their launchpad to the skies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Footer with additional SEO content */}
        <footer className="bg-card border-t border-border py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Aviators Training Centre - India's Leading DGCA CPL/ATPL Ground School Training Institute | 
              Located in Dwarka, Delhi | Serving aspiring pilots across India since 2020
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}