import { Metadata } from 'next';

// SEO Metadata for Instructors Page
export const metadata: Metadata = {
  title: "Expert Aviation Instructors | Aviators Training Centre",
  description: "Learn from airline-experienced instructors specializing in CPL/ATPL exams, RTR(A), and interview preparation. Meet our expert aviation faculty.",
  keywords: "aviation instructors, pilot trainers, DGCA exam coaches, airline pilots, RTR instructors, aviation faculty",
  alternates: {
    canonical: "https://aviatorstrainingcentre.com/instructors",
  },
  openGraph: {
    title: "Expert Aviation Instructors | Aviators Training Centre",
    description: "Learn from airline-experienced instructors specializing in CPL/ATPL exams, RTR(A), and interview preparation.",
    url: "https://aviatorstrainingcentre.com/instructors",
    images: [{
      url: "/Instructor/Instructor1.webp",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre Instructors"
    }]
  }
};