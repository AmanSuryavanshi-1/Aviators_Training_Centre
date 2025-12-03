import dynamic from 'next/dynamic';
import React from 'react';

// Simple loading fallback
const SectionLoader = () => <div className="w-full h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg my-12" />;

// Lazy load heavy components below the fold
export const TestimonialsSection = dynamic(
    () => import('@/components/testimonials/TestimonialsSection'),
    {
        ssr: false,
        loading: SectionLoader
    }
);

export const EnhancedTestimonialsSection = dynamic(
    () => import('@/components/testimonials/EnhancedTestimonialsSection'),
    {
        ssr: false,
        loading: SectionLoader
    }
);

export const CoursesSection = dynamic(
    () => import('@/components/features/courses/CoursesSection'),
    {
        ssr: false, // Client-side only for better TBT
        loading: SectionLoader
    }
);

export const FAQSection = dynamic(
    () => import('@/components/shared/FAQ'),
    {
        ssr: false,
        loading: SectionLoader
    }
);

export const ContactForm = dynamic(
    () => import('@/components/features/contact/ContactFormCard'),
    {
        ssr: false,
        loading: () => <div className="w-full h-[600px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
    }
);

export const WhyChooseUs = dynamic(
    () => import('@/components/features/courses/WhyChooseUs'),
    {
        ssr: false, // Client-side only for better TBT
        loading: SectionLoader
    }
);

export const FeaturedBlogSection = dynamic(
    () => import('@/components/features/courses/FeaturedBlogSection'),
    {
        ssr: false,
        loading: SectionLoader
    }
);

export const PilotPathway = dynamic(
    () => import('@/components/features/courses/PilotPathway'),
    {
        ssr: false,
        loading: SectionLoader
    }
);

export const CTASection = dynamic(
    () => import('@/components/features/courses/CTASection'),
    {
        ssr: false,
        loading: () => <div className="w-full h-64 animate-pulse bg-teal-50 dark:bg-teal-900/20 rounded-lg" />
    }
);

export const TestimonialsVideoCarousel = dynamic(
    () => import('@/components/testimonials/TestimonialsVideoCarousel'),
    {
        ssr: false,
        loading: () => <div className="w-full h-[500px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
    }
);
