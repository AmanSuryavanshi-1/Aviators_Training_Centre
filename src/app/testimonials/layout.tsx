import { Metadata } from 'next';
import { getAllSEOKeywords, generateSEOMetaDescription, generateSEOTitle } from '@/lib/testimonials/data';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aviatorstrainingcentre.in';

// Generate dynamic SEO keywords from video testimonials
const dynamicKeywords = getAllSEOKeywords();
const seoDescription = generateSEOMetaDescription();
const seoTitle = generateSEOTitle();

export const metadata: Metadata = {
  title: seoTitle || 'Student Success Stories & Testimonials | Aviators Training Centre',
  description: seoDescription || 'Real testimonials from DGCA CPL graduates and aviation training success stories. Discover how our comprehensive ground school training helped aspiring pilots achieve their dreams.',
  keywords: [
    ...dynamicKeywords,
    'DGCA CPL success stories',
    'pilot training testimonials',
    'aviation training reviews',
    'DGCA ground school testimonials',
    'CPL exam success',
    'ATPL training reviews',
    'pilot career success',
    'aviation training centre reviews',
    'DGCA exam testimonials',
    'pilot training success stories',
    'Indian aviation training',
    'commercial pilot license India',
    'airline pilot training testimonials',
    'flight training reviews India',
    'DGCA approved training institute'
  ],
  authors: [{ name: 'Aviators Training Centre' }],
  creator: 'Aviators Training Centre',
  publisher: 'Aviators Training Centre',
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: seoTitle || 'Student Success Stories & Testimonials | Aviators Training Centre',
    description: seoDescription || 'Real testimonials from DGCA CPL graduates and aviation training success stories. See how our students achieved their pilot dreams.',
    url: `${baseUrl}/testimonials`,
    siteName: 'Aviators Training Centre',
    images: [
      {
        url: `${baseUrl}/HomePage/Hero4.webp`,
        width: 1200,
        height: 630,
        alt: 'Aviators Training Centre Student Success Stories',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: seoTitle || 'Student Success Stories & Testimonials | Aviators Training Centre',
    description: seoDescription || 'Real testimonials from DGCA CPL graduates and aviation training success stories.',
    images: [`${baseUrl}/HomePage/Hero4.webp`],
    creator: '@AviatorsTCentre',
  },
  
  // Canonical URL
  alternates: {
    canonical: `${baseUrl}/testimonials`,
  },
  
  // Additional metadata
  category: 'Education',
  classification: 'Aviation Training',
  
  // Robots directive
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  // Other metadata for performance
  other: {
    'preconnect': 'https://www.youtube-nocookie.com',
    'dns-prefetch': 'https://img.youtube.com',
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="preconnect" href="https://img.youtube.com" />
      <link rel="dns-prefetch" href="https://www.googleapis.com" />
      
      {children}
    </>
  );
}