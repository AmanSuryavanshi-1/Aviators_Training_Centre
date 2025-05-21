import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: "CPL/ATPL Exam Prep & Online Coaching | Aviators Training Centre", // Updated Title
  description: "Ace your DGCA CPL/ATPL exams with expert online coaching from airline pilots. Aviators Training Centre offers 24/7 doubt support & comprehensive pilot interview preparation.", // Updated Description
  keywords: "online CPL coaching, ATPL exam prep, pilot interview training, DGCA exams, CPL online, ATPL online, pilot training India, aviation coaching", // Enhanced Keywords
  alternates: {
    canonical: "https://aviatorstrainingcentre.com/courses",
  },
  openGraph: {
    title: "CPL/ATPL Training & Exam Prep | Aviators Training Centre", // Updated OG Title
    description: "Ace your DGCA CPL/ATPL exams with expert online coaching from airline pilots. Aviators Training Centre offers 24/7 doubt support & comprehensive pilot interview preparation.", // Updated OG Description
    url: "https://aviatorstrainingcentre.com/courses",
    images: [{
      url: "/Course-Img.webp", // Consider a more specific OG image for courses if available, e.g., /og-courses.jpg
      width: 1200,
      height: 630,
      alt: "CPL/ATPL Exam Preparation at Aviators Training Centre"
    }]
  }
};