import dynamic from 'next/dynamic';

// Lazy load heavy components below the fold
export const TestimonialsSection = dynamic(
    () => import('@/components/testimonials/TestimonialsSection'),
    { ssr: false }
);

export const CoursesSection = dynamic(
    () => import('@/components/features/courses/CoursesSection'),
    { ssr: true }
);

export const FAQSection = dynamic(
    () => import('@/components/shared/FAQ'),
    { ssr: false }
);

export const ContactForm = dynamic(
    () => import('@/components/features/contact/ContactFormCard'),
    { ssr: false }
);

export const WhyChooseUs = dynamic(
    () => import('@/components/features/courses/WhyChooseUs'),
    { ssr: true }
);

export const FeaturedBlogSection = dynamic(
    () => import('@/components/features/courses/FeaturedBlogSection'),
    { ssr: false }
);

export const PilotPathway = dynamic(
    () => import('@/components/features/courses/PilotPathway'),
    { ssr: false }
);

export const CTASection = dynamic(
    () => import('@/components/features/courses/CTASection'),
    { ssr: false }
);

export const TestimonialsVideoCarousel = dynamic(
    () => import('@/components/testimonials/TestimonialsVideoCarousel'),
    { ssr: false }
);
