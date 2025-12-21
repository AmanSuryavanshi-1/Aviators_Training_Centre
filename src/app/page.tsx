import React from 'react';
import { StaticHero } from '@/components/features/courses/StaticHero';
import HomePageClientWrapper from '@/components/pages/HomePageClientWrapper';

// ISR Configuration - Revalidate every 30 minutes for home page
export const revalidate = 1800;

// Generate metadata for SEO
export const metadata = {
  title: 'Aviators Training Centre | DGCA CPL/ATPL Ground School India | Expert Pilot Training',
  description: 'Top-rated Aviators Training Centre (ATC) in India - Master DGCA CPL/ATPL exams with 95% success rate. Learn from airline pilots Ankit Kumar, Dhruv Shirkoli & Saksham Khandelwal. Type Rating, RTR(A), 24/7 support, proven results.',
  keywords: 'aviators training centre, ATC India, DGCA ground school, CPL training India, ATPL training, type rating preparation, RTR(A) certification, pilot training online, aviation courses India, airline pilot training, DGCA exam preparation, Ankit Kumar instructor',
  authors: [{ name: 'Aviators Training Centre' }],
  creator: 'Aviators Training Centre',
  publisher: 'Aviators Training Centre',
  openGraph: {
    title: 'Aviators Training Centre | DGCA CPL/ATPL Ground School India',
    description: 'Master DGCA exams with 95% success rate. Learn from experienced airline pilots. Type Rating, RTR(A), comprehensive training with 24/7 support.',
    type: 'website',
    url: 'https://www.aviatorstrainingcentre.in',
    images: [{
      url: 'https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
      width: 1200,
      height: 630,
      alt: 'Aviators Training Centre - Premier DGCA Training Institute',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aviators Training Centre | DGCA CPL/ATPL Ground School India',
    description: 'Master DGCA exams with 95% success rate. Learn from experienced airline pilots with proven results.',
    images: ['https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'],
  },
};

export default function Home() {
  return (
    <>
      {/* Enhanced Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Aviators Training Centre - India's Premier ATC Training Institute",
            "description": "Top-rated Aviators Training Centre (ATC) in India. Master DGCA CPL/ATPL exams with 95% success rate. Expert-led training from experienced airline pilots.",
            "url": "https://www.aviatorstrainingcentre.in",
            "inLanguage": "en-IN",
            "isPartOf": {
              "@type": "WebSite",
              "url": "https://www.aviatorstrainingcentre.in",
              "name": "Aviators Training Centre"
            },
            "mainEntity": {
              "@type": "EducationalOrganization",
              "name": "Aviators Training Centre",
              "alternateName": "ATC",
              "description": "India's premier aviation training institute offering DGCA CPL/ATPL ground school, Type Rating preparation, and comprehensive pilot training programs.",
              "url": "https://www.aviatorstrainingcentre.in",
              "hasCredential": [
                "DGCA CPL Ground Training",
                "DGCA ATPL Ground Training",
                "Type Rating Preparation",
                "RTR(A) Training"
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.aviatorstrainingcentre.in"
              }]
            }
          })
        }}
      />

      {/* Server-rendered hero for instant LCP */}
      <StaticHero />

      {/* Client-side content loads after hero is visible */}
      <HomePageClientWrapper />
    </>
  );
}

