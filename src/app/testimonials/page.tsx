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
import { TransparentButton } from '@/components/shared/TransparentButton';
import { 
  Award, 
  GraduationCap, 
  Users, 
  Plane, 
  Shield, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  CheckCircle, 
  Star 
} from 'lucide-react';

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

  // Generate testimonial structured data
  const generateTestimonialStructuredData = () => {
    const testimonials = [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Deepthi"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Amazing RTR training! Mock tests exactly like real DGCA exams. Notes are perfect for interviews. Cleared in first attempt! Highly recommend to everyone.",
        "itemReviewed": {
          "@type": "EducationalOrganization",
          "name": "Aviators Training Centre"
        }
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Aishwarya"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4.5",
          "bestRating": "5"
        },
        "reviewBody": "Great Technical General classes! Complex aircraft systems made simple.",
        "itemReviewed": {
          "@type": "EducationalOrganization",
          "name": "Aviators Training Centre"
        }
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Megha"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Excellent Meteorology course! Weather made easy to understand. Real-world examples everywhere.",
        "itemReviewed": {
          "@type": "EducationalOrganization",
          "name": "Aviators Training Centre"
        }
      }
    ];

    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Aviators Training Centre",
      "url": "https://aviatorstrainingcentre.com",
      "description": "India's premier DGCA CPL and ATPL ground school training institute",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dwarka",
        "addressRegion": "Delhi",
        "addressCountry": "IN"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "12",
        "bestRating": "5"
      },
      "review": testimonials
    };
  };

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
      
      {/* Testimonial structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateTestimonialStructuredData()) }}
      />

      <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth"
           style={{ minHeight: '100vh' }}>


        {/* Hero Section */}
        <header>
          <Hero variant="standard" />
        </header>



        {/* Main Content with consistent spacing patterns */}
        <main className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28 max-w-full overflow-hidden" role="main">
        
          {/* Infinite Video Carousel */}
          <section className="relative bg-gradient-to-br from-background via-muted/5 to-background">
            {/* Header with SEO Enhancement */}
            <motion.div
              className="text-center mb-4 md:mb-6 lg:mb-8 px-4 pt-16 md:pt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                DGCA CPL ATPL Success Stories
                <span className="block text-transparent mb-2 bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500">
                  Video Testimonials
                </span>
              </h2>
              <p className="text-md md:text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Watch verified graduates share their journey from aviation dreams to commercial pilot reality. 
                Real success stories from DGCA CPL, ATPL, and RTR(A) training programs at India's premier aviation institute.
              </p>
            </motion.div>
            
            <InfiniteVideoCarousel />
          </section>

          {/* Text Testimonials Carousel */}
          <section className="relative bg-gradient-to-br from-muted/20 via-background to-muted/10">
            <TextTestimonialsCarousel />
            {/* Section divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </section>

          {/* Single Consolidated CTA Section */}
          <section className="bg-gradient-to-br rounded-3xl from-primary/5 via-background to-secondary/5 relative overflow-hidden">
            <div className="relative z-10">
              <aside aria-label="Main call to action">
                <TestimonialsCTA variant="primary" />
              </aside>
            </div>
          </section>


          {/* Enhanced SEO Content Section - Premium Aviation Training */}
          <section 
            aria-labelledby="seo-content-heading"
            className="relative py-12 md:py-16 bg-gradient-to-br from-muted/10 via-background to-card/10 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--aviation-primary))_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--aviation-secondary))_0%,transparent_50%)]" />
            </div>

            <div className="container relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">

              {/* Student Success Highlights - SEO Optimized */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-center mb-12 md:mb-20">
                  <h2 
                    id="seo-content-heading"
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aviation-primary via-aviation-secondary to-aviation-tertiary mb-4 leading-tight"
                  >
                  Why <span className=" text-foreground ">Aviators Training Centre</span> is Your Best Choice for Aviation Success
                </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Discover authentic experiences from aviation students who achieved their pilot dreams through dedicated training and expert guidance
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[
                    {
                      icon: BookOpen,
                      title: "Comprehensive Study Materials",
                      description: "Access detailed notes, practice tests, and interactive learning resources designed for aviation exam success",
                      highlight: "Study Smart"
                    },
                    {
                      icon: Users,
                      title: "Expert Instructor Support",
                      description: "Learn from experienced aviation professionals with real-world industry knowledge and teaching expertise",
                      highlight: "Expert Guidance"
                    },
                    {
                      icon: Target,
                      title: "Focused Exam Preparation",
                      description: "Structured curriculum covering all essential topics for DGCA CPL, ATPL, and aviation certification exams",
                      highlight: "Exam Ready"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-lg transition-all duration-300 relative">
                      {/* Top-right highlight tag */}
                      <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-md z-10">
                        {feature.highlight}
                      </span>
                      
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <h5 className="font-semibold text-primary mb-3 pr-4">{feature.title}</h5>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Comprehensive Training Programs */}
              <motion.div
                className="py-16 md:py-24"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
                    Complete DGCA CPL Training Solutions
                  </h3>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    From ground school to cockpit - we provide end-to-end aviation training that transforms dreams into airline careers
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[
                    {
                      icon: BookOpen,
                      title: "DGCA CPL Ground School",
                      features: ["Air Navigation", "Meteorology", "Air Regulations", "Technical General", "Technical Specific", "RTR(A) Training"],
                      highlight: "95% Success Rate",
                      color: "from-blue-500 to-blue-600"
                    },
                    {
                      icon: Plane,
                      title: "Type Rating Preparation",
                      features: ["A320 Type Rating", "B737 Type Rating", "Simulator Training", "Line Training Support", "ATPL Conversion", "Recurrent Training"],
                      highlight: "Airline Ready",
                      color: "from-primary to-secondary"
                    },
                    {
                      icon: Briefcase,
                      title: "Career Placement Program",
                      features: ["Resume Building", "Interview Preparation", "Airline Connections", "Salary Negotiation", "Career Counseling", "Lifetime Support"],
                      highlight: "100% Placement",
                      color: "from-purple-500 to-purple-600"
                    }
                  ].map((program, index) => (
                    <div key={index} className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-lg transition-all duration-300 group relative">
                      {/* Top-right highlight tag */}
                      <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-md z-10">
                        {program.highlight}
                      </span>
                      
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <program.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      
                      <h4 className="font-bold text-primary mb-3 pr-4">{program.title}</h4>
                      
                      <ul className="space-y-2">
                        {program.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="break-words">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Student Success Stories & Insights */}
              <motion.div
                className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-3xl my-12 p-6 sm:p-8 md:p-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="my-16">
                <div className="text-center mb-8 md:mb-12">
                  <h3 className="text-2xl text-aviation-primary sm:text-4xl md:text-5xl font-bold mb-2">
                    Why Student <span className="text-foreground">Testimonials</span> Matter in Aviation Training
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Real experiences from aviation students provide valuable insights into effective study methods, exam preparation strategies and career development in the aviation industry
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[
                    {
                      icon: BookOpen,
                      title: "Study Method Insights",
                      description: "Learn effective techniques and approaches that helped students succeed in aviation exams",
                      metric: "Proven Strategies"
                    },
                    {
                      icon: Target,
                      title: "Exam Preparation Tips",
                      description: "Discover preparation methods and time management strategies from successful candidates",
                      metric: "Success Tips"
                    },
                    {
                      icon: Plane,
                      title: "Career Path Guidance",
                      description: "Understand different aviation career opportunities and pathways through student experiences",
                      metric: "Career Insights"
                    }
                  ].map((insight, index) => (
                    <div key={index} className="text-center p-4 sm:p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 group">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <insight.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-primary mb-2 text-sm sm:text-base">{insight.title}</h4>
                      <div className="text-primary font-medium mb-3 text-xs sm:text-sm px-2 py-1 bg-primary/10 rounded-full inline-block">
                        {insight.metric}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-12">
                  <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 text-primary rounded-full font-medium text-sm sm:text-base">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Authentic Student Experiences & Reviews</span>
                  </div>
                </div>
              </div>
              </motion.div>

                    {/* <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-center">
                      Discover more about our training approach in our <a href="/blog" className="text-aviation-primary hover:text-aviation-primary/80 underline">aviation blog</a> or explore our <a href="/faq" className="text-aviation-primary hover:text-aviation-primary/80 underline">frequently asked questions</a> to learn more about the pilot training process.
                    </p> */}
{/* Secondary CTAs */}
      <motion.div
        className="text-center mt-12 md:mt-36 "
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-6">
          Explore More Ways to Succeed
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div onClick={() => testimonialsAnalytics.trackCTAClick('contact', 'secondary-cta')}>
            <TransparentButton
              href="/contact"
              icon={Users}
              label="Contact Our Team"
            />
          </div>
          <TransparentButton
            href="/blog"
            icon={GraduationCap}
            label="Read Success Tips"
          />
          <TransparentButton
            href="/faq"
            icon={Award}
            label="Common Questions"
          />
        </div>
      </motion.div>
            </div>
          </section>

        </main>

        {/* Footer with additional SEO content */}
        <footer className="bg-card border-t border-border py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Aviators Training Centre - India's Leading DGCA CPL/ATPL Ground School Training Institute | 
              Located in Dwarka, Delhi | Serving aspiring pilots across India
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}