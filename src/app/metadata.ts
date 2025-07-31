import { Metadata, Viewport } from 'next';

// SEO Metadata for Home Page
export const metadata: Metadata = {
  title: "CPL/ATPL Exam Prep | Aviators Training Centre",
  description: "Ace your CPL/ATPL exams with online coaching from airline-experienced instructors. 24/7 doubt support & interview prep.",
  keywords: "online CPL coaching, ATPL exam prep, pilot interview training, aviation training, DGCA ground school",
  alternates: {
    canonical: "https://aviatorstrainingcentre.com/",
  },
  metadataBase: new URL('https://aviatorstrainingcentre.com'),
  openGraph: {
    title: "CPL/ATPL Exam Prep | Aviators Training Centre",
    description: "Ace your CPL/ATPL exams with online coaching from airline-experienced instructors. 24/7 doubt support & interview prep.",
    url: "https://aviatorstrainingcentre.com/",
    images: [{
      url: "/HomePage/Hero3.webp",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre"
    }],
    siteName: "Aviators Training Centre",
    locale: "en_US",
    type: "website"
  },
  other: {
    "facebook-domain-verification": "aviatorstrainingcentre",
    "facebook:page_id": "61576701390492"
  }
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
