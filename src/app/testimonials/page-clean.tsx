"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Hero from './hero/Hero';
import dynamic from 'next/dynamic';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import TestimonialControls, { FilterOptions } from '@/components/testimonials/TestimonialControls';
import TestimonialsCTA from '@/components/testimonials/TestimonialsCTA';
import TestimonialsBreadcrumb from '@/components/testimonials/TestimonialsBreadcrumb';

// Dynamic imports for better performance
const VideoGrid = dynamic(() => import('@/components/testimonials/VideoGrid'), { 
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 max-w-[1280px] mx-auto px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[9/16]" />
      ))}
    </div>
  )
});

import { youtubeShorts, studentsData } from '@/lib/testimonials/data';
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

// Define aviation colors
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

export default function TestimonialsPageClean() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    courses: [],
    years: [],
    verifiedOnly: false
  });
  const [sortBy, setSortBy] = useState('newest');
  
  // Track page view safely
  React.useEffect(() => {
    try {
      testimonialsAnalytics.trackPageView();
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  // Track search interactions with stable callback
  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    try {
      if (query.length > 2) {
        // Calculate results count after filtering
        const searchResults = youtubeShorts.filter(video => {
          const student = studentsData.find(s => s.id === video.studentId);
          const searchText = `${student?.name || ''} ${student?.course || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });
        testimonialsAnalytics.trackSearch(query, searchResults.length);
      }
    } catch (error) {
      console.warn('Search analytics tracking failed:', error);
    }
  }, []);

  // Track filter interactions with stable callback
  const handleFilter = React.useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    try {
      testimonialsAnalytics.trackFilter(newFilters);
    } catch (error) {
      console.warn('Filter analytics tracking failed:', error);
    }
  }, []);

  // Track sort interactions with stable callback
  const handleSort = React.useCallback((sortOption: string) => {
    setSortBy(sortOption);
    try {
      testimonialsAnalytics.trackSort(sortOption);
    } catch (error) {
      console.warn('Sort analytics tracking failed:', error);
    }
  }, []);

  // Get available filter options with proper memoization
  const availableCourses = React.useMemo(() => {
    const courses = studentsData
      .map(student => student.course)
      .filter((course): course is string => course !== null && course !== undefined);
    return Array.from(new Set(courses));
  }, []);

  const availableYears = React.useMemo(() => {
    const years = studentsData
      .map(student => student.gradYear)
      .filter((year): year is number => year !== null && year !== undefined);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, []);

  // Filter and sort videos with proper memoization
  const filteredVideos = React.useMemo(() => {
    let filtered = youtubeShorts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video => {
        const student = studentsData.find(s => s.id === video.studentId);
        const searchText = `${student?.name || ''} ${student?.course || ''}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
    }

    // Apply course filter
    if (filters.courses.length > 0) {
      filtered = filtered.filter(video => {
        const student = studentsData.find(s => s.id === video.studentId);
        return student?.course && filters.courses.includes(student.course);
      });
    }

    // Apply year filter
    if (filters.years.length > 0) {
      filtered = filtered.filter(video => {
        const student = studentsData.find(s => s.id === video.studentId);
        return student?.gradYear && filters.years.includes(student.gradYear);
      });
    }

    // Apply verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(video => {
        const student = studentsData.find(s => s.id === video.studentId);
        return student?.verified === true;
      });
    }

    // Apply sorting - create new array to avoid mutation
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime();
        case 'oldest':
          return new Date(a.uploadDate || 0).getTime() - new Date(b.uploadDate || 0).getTime();
        case 'most-viewed':
          // Placeholder sorting - would need view count data
          return 0;
        case 'highest-confidence':
          // Placeholder sorting - would need confidence scores
          return 0;
        default:
          return 0;
      }
    });

    return sortedFiltered;
  }, [searchQuery, filters.courses, filters.years, filters.verifiedOnly, sortBy]);

  // Generate JSON-LD structured data safely
  let jsonLdSchemas: any[] = [];
  try {
    jsonLdSchemas = generateTestimonialsPageSchema(youtubeShorts, [], studentsData);
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

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Accessibility: Screen reader announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="testimonials-status"
        >
          {filteredVideos.length > 0 
            ? `Showing ${filteredVideos.length} testimonial${filteredVideos.length === 1 ? '' : 's'}`
            : 'No testimonials match your current filters'
          }
        </div>

        {/* Hero Section */}
        <header>
          <Hero variant="standard" />
        </header>

        {/* Breadcrumb Navigation for SEO */}
        <TestimonialsBreadcrumb />

        {/* Main Content with semantic HTML */}
        <main className="container flex-grow px-4 py-16 mx-auto space-y-16 sm:px-6 md:py-20 md:space-y-20" role="main">
        
        {/* Video Testimonials Section with enhanced SEO */}
        <section 
          aria-labelledby="video-testimonials-heading"
          className="scroll-mt-20"
          id="video-testimonials"
        >
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 
                id="video-testimonials-heading"
                className={cn("text-2xl md:text-3xl font-bold mb-4", aviationPrimary)}
              >
                Video Success Stories from DGCA CPL Graduates
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Watch authentic testimonials from our successful DGCA CPL graduates and aviation training alumni who achieved their pilot dreams through our comprehensive ground school program.
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <div role="search" aria-label="Filter testimonials">
              <TestimonialControls
                onSearch={handleSearch}
                onFilter={handleFilter}
                onSort={handleSort}
                availableCourses={availableCourses}
                availableYears={availableYears}
                className="mb-8"
              />
            </div>

            {/* Video Grid with semantic structure */}
            <div 
              role="region" 
              aria-label="Video testimonials"
              aria-describedby="video-testimonials-heading"
            >
              <VideoGrid
                videos={filteredVideos}
                students={studentsData}
              />
            </div>
          </motion.div>
        </section>

          {/* Mid-page CTA */}
          <aside aria-label="Call to action">
            <TestimonialsCTA variant="secondary" />
          </aside>

          {/* Text Testimonials Section with enhanced SEO */}
          <section 
            aria-labelledby="text-testimonials-heading"
            className="scroll-mt-20"
            id="text-testimonials"
          >
            <TestimonialsSection />
          </section>

          {/* Main CTA Section */}
          <aside aria-label="Main call to action">
            <TestimonialsCTA variant="primary" />
          </aside>

          {/* SEO Content Section */}
          <section 
            aria-labelledby="seo-content-heading"
            className="prose prose-lg max-w-4xl mx-auto text-center"
          >
            <h2 
              id="seo-content-heading"
              className={cn("text-2xl md:text-3xl font-bold mb-6", aviationPrimary)}
            >
              Why Choose Aviators Training Centre for Your Aviation Career?
            </h2>
            <div className="text-left space-y-4 text-muted-foreground">
              <p>
                <strong>Aviators Training Centre</strong> is India's premier aviation training institute, specializing in DGCA CPL and ATPL ground school preparation. Our comprehensive training programs have helped over 500 aspiring pilots achieve their dreams of becoming commercial airline pilots.
              </p>
              <p>
                Our <strong>DGCA-approved curriculum</strong> covers all essential subjects including Air Navigation, Meteorology, Air Regulations, Technical General, and Technical Specific. With a 95% success rate in DGCA examinations, we are the trusted choice for serious aviation students across India.
              </p>
              <p>
                What sets us apart is our team of <strong>experienced airline pilots</strong> who serve as instructors, bringing real-world aviation experience to the classroom. Our students don't just pass exams – they gain the practical knowledge needed to excel in their aviation careers.
              </p>
              <p>
                From <strong>Type Rating preparation</strong> for A320 and B737 aircraft to <strong>RTR(A) training</strong> and interview preparation, we provide end-to-end support for your aviation journey. Join the ranks of successful pilots who chose Aviators Training Centre as their launchpad to the skies.
              </p>
            </div>
          </section>

        </main>

        {/* Footer with additional SEO content */}
        <footer className="bg-muted/30 py-8 mt-16">
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