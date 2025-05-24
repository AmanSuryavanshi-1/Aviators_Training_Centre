import { Metadata } from 'next';

// SEO Metadata for FAQ Page
export const metadata: Metadata = {
  title: "FAQ - Aviators Training Centre | DGCA Exam Prep, ATC Courses & Instructor Questions",
  description: "Get answers to frequently asked questions about Aviators Training Centre's DGCA CPL/ATPL exam preparation, ATC courses, instructor qualifications, RTR(A) training, and enrollment process. Expert guidance from Ankit Kumar and team.",
  keywords: "Aviators Training Centre FAQ, ATC courses questions, DGCA exam preparation FAQ, pilot training questions, Ankit Kumar instructor, RTR(A) training FAQ, type rating preparation, aviation course enrollment, ATC training institute India, best pilot training FAQ",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in/faq",
    languages: {
      'en': 'https://www.aviatorstrainingcentre.in/faq',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "FAQ - Aviators Training Centre | DGCA Exam Prep & ATC Courses",
    description: "Get answers to frequently asked questions about Aviators Training Centre's DGCA CPL/ATPL exam preparation, ATC courses, and instructor qualifications.",
    url: "https://www.aviatorstrainingcentre.in/faq",
    siteName: "Aviators Training Centre",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/FAQ.webp",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre FAQ - DGCA Exam Prep & ATC Courses"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Aviators Training Centre | DGCA Exam Prep & ATC Courses",
    description: "Get answers to frequently asked questions about Aviators Training Centre's DGCA CPL/ATPL exam preparation and ATC courses.",
    images: ["https://www.aviatorstrainingcentre.in/FAQ.webp"]
  }
};