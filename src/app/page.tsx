import React from 'react';
import HomePageClient from '@/components/pages/HomePageClient';

// ISR Configuration - Revalidate every 30 minutes for home page
export const revalidate = 1800;

// Generate metadata for SEO
export const metadata = {
  title: 'Aviators Training Centre - India\'s Premier ATC Training Institute',
  description: '#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training. Learn from airline pilots like Ankit Kumar.',
  keywords: 'aviators training centre, ATC, DGCA ground school, CPL training, ATPL training, type rating, RTR(A), pilot training India',
  openGraph: {
    title: 'Aviators Training Centre - India\'s Premier ATC Training Institute',
    description: '#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training.',
    type: 'website',
    url: 'https://www.aviatorstrainingcentre.in',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aviators Training Centre - India\'s Premier ATC Training Institute',
    description: '#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training.',
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
            "description": "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training. Learn from airline pilots like Ankit Kumar.",
            "url": "https://www.aviatorstrainingcentre.in",
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
      
      <HomePageClient />
    </>
  );
}
