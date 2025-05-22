import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: "Aviation Training Courses | Aviators Training Centre",
  description: "Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services. Expert-led aviation training for CPL/ATPL exams and beyond.",
  keywords: "online CPL coaching, ATPL exam prep, pilot interview training, aviation training, DGCA ground school, type rating preparation, RTR(A)",
  alternates: {
    canonical: "https://aviatorstrainingcentre.com/courses",
  },
  openGraph: {
    title: "Aviation Training Courses | Aviators Training Centre",
    description: "Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services. Expert-led aviation training for CPL/ATPL exams and beyond.",
    url: "https://aviatorstrainingcentre.com/courses",
    images: [{
      url: "/Course-Img.webp",
      width: 1200,
      height: 630,
      alt: "Aviation Training Courses"
    }]
  }
};