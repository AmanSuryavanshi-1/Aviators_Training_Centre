import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: "ATC Courses - DGCA CPL/ATPL Ground School | Aviators Training Centre",
  description: "Comprehensive ATC courses at Aviators Training Centre. DGCA CPL/ATPL ground school, Type Rating prep (A320/B737), RTR(A) training. Learn from airline instructors like Ankit Kumar. Proven success rates, 24/7 support.",
  keywords: "ATC courses, Aviators Training Centre courses, DGCA ground school, CPL training India, ATPL exam prep, type rating preparation A320 B737, RTR(A) training, online pilot coaching, aviation training courses, ATC instructors, Ankit Kumar courses, best pilot training institute India",
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in/courses",
  },
  openGraph: {
    title: "ATC Courses - DGCA CPL/ATPL Ground School | Aviators Training Centre",
    description: "Comprehensive ATC courses at Aviators Training Centre. DGCA CPL/ATPL ground school, Type Rating prep, RTR(A) training. Learn from airline instructors.",
    url: "https://www.aviatorstrainingcentre.in/courses",
    type: "website",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/Course-Img.webp",
      width: 1200,
      height: 630,
      alt: "ATC Courses - Aviation Training at Aviators Training Centre"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ATC Courses - DGCA CPL/ATPL Ground School",
    description: "Comprehensive ATC courses at Aviators Training Centre. DGCA CPL/ATPL ground school, Type Rating prep, RTR(A) training.",
    images: ["https://www.aviatorstrainingcentre.in/Course-Img.webp"]
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
};