import "../../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "./providers";
// import { Toaster } from "@/components/ui/sonner"; // Removed to avoid conflict with custom toast system
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppChatWrapper from "@/components/shared/WhatsAppChatWrapper";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

import ServiceWorkerRegistration from "@/components/features/blog/ServiceWorkerRegistration";
import ErrorHandlingProvider from "@/components/shared/ErrorHandlingProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ConditionalAnalytics from "@/components/analytics/ConditionalAnalytics";
import { PerformanceImageProvider } from "@/lib/image-optimization";
import UTMTracker from "@/components/analytics/UTMTracker";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import { inter, montserrat, roboto, poppins } from "@/lib/fonts";

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-XSRFEJCB7N';

// REMOVED: N8N automation initialization was pulling Sanity (1.29MB) into client bundle
// N8N is server-side only and should be initialized via API routes or instrumentation.ts

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Aviators Training Centre - India's Premier ATC Training Institute | DGCA CPL/ATPL Exam Prep",
  description: "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training. Learn from airline pilots like Ankit Kumar. 24/7 support, proven success rates.",
  keywords: "Aviators Training Centre, ATC courses, ATC training, ATC instructors, Ankit Kumar ATC, DGCA ground school, CPL training India, ATPL exam prep, pilot training institute, aviation training courses, type rating preparation, RTR(A) training, best ATC training institute India, online pilot coaching, airline pilot training",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in",
    languages: {
      'en': 'https://www.aviatorstrainingcentre.in',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.aviatorstrainingcentre.in",
    title: "Aviators Training Centre - India's Premier ATC Training Institute",
    description: "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training. Learn from airline pilots like Ankit Kumar.",
    siteName: "Aviators Training Centre",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre - Premier ATC Training Institute India"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviators Training Centre - India's Premier ATC Training Institute",
    description: "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams, Type Rating prep, RTR(A) training.",
    images: ["https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png"]
  },
  verification: {
    google: "aE_FqlD0SbJberIaVs7Xe0flcsZF9gojWQg0BCQhiBc",
    other: {
      "google-site-verification": "aE_FqlD0SbJberIaVs7Xe0flcsZF9gojWQg0BCQhiBc"
    }
  },
  other: {
    "google-site-verification": "google04cf4c380ddcb85b.html"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Resource hints for third-party domains */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        <link rel="icon" href="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" />

        {/* Enhanced Structured Data for Organization */}
        <Script
          id="organization-schema"
          strategy="afterInteractive"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Aviators Training Centre",
              "alternateName": "ATC",
              "description": "India's premier aviation training institute offering DGCA CPL/ATPL ground school, Type Rating preparation, and comprehensive pilot training programs.",
              "url": "https://www.aviatorstrainingcentre.in",
              "logo": "https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
              "image": "https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
              "sameAs": [
                "https://www.aviatorstrainingcentre.in"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressRegion": "India"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              },
              "hasCredential": [
                "DGCA CPL Ground Training",
                "DGCA ATPL Ground Training",
                "Type Rating Preparation",
                "RTR(A) Training"
              ],
              "employee": [
                {
                  "@type": "Person",
                  "name": "Ankit Kumar",
                  "jobTitle": "Chief Flight Instructor",
                  "description": "Experienced airline pilot and aviation instructor"
                },
                {
                  "@type": "Person",
                  "name": "Dhruv Shirkoli",
                  "jobTitle": "Senior Flight Instructor",
                  "description": "A320 type-rated airline pilot"
                },
                {
                  "@type": "Person",
                  "name": "Saksham Khandelwal",
                  "jobTitle": "Flight Instructor",
                  "description": "B737 type-rated airline pilot"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              },
              "priceRange": "₹₹",
              "offers": {
                "@type": "Offer",
                "category": "Aviation Training",
                "description": "Comprehensive pilot training programs including DGCA ground school, type rating preparation, and career guidance"
              }
            })
          }}
        />

        {/* Delayed Analytics Loading for Performance */}
        <Script
          id="delayed-analytics"
          strategy="afterInteractive"
        >
          {`
            setTimeout(function() {
              // Load Google Analytics
              const gaScript = document.createElement('script');
              gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
              gaScript.async = true;
              document.head.appendChild(gaScript);

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });

              // Load Meta Pixel
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '796016392336829');
              fbq('track', 'PageView');
            }, 4000); // 4 second delay to prioritize LCP
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=796016392336829&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Global Image Optimization */}
        <Script
          id="global-image-optimization"
          strategy="worker"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize global image optimization
              if (typeof window !== 'undefined') {
                const initImageOptimization = async () => {
                  try {
                    const { default: GlobalImageOptimizer } = await import('/src/lib/image-optimization/globalInit.js');
                    const optimizer = GlobalImageOptimizer.getInstance();
                    optimizer.init();
                    
                    // Log initialization in development
                    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
                      console.log('🚀 Global Image Optimization initialized');
                    }
                  } catch (error) {
                    console.warn('Failed to initialize global image optimization:', error);
                  }
                };
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initImageOptimization);
                } else {
                  initImageOptimization();
                }
              }
            `,
          }}
        />

        {/* Google tag (gtag.js) - Deferred 3s for LCP */}
        <Script
          id="gtag-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function() {
                var s = document.createElement('script');
                s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XSRFEJCB7N';
                s.async = true;
                document.head.appendChild(s);
              }, 3000);
            `,
          }}
        />
        <Script
          id="gtag-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XSRFEJCB7N', {
                page_title: document.title,
                page_location: window.location.href,
                cookie_domain: 'aviatorstrainingcentre.in',
                custom_map: {
                  'custom_parameter_1': 'traffic_source',
                  'custom_parameter_2': 'ai_platform',
                  'custom_parameter_3': 'campaign_source'
                },
                // Enhanced tracking for your domain
                send_page_view: true,
                anonymize_ip: false,
                allow_google_signals: true,
                allow_ad_personalization_signals: true
              });
              
              // Track domain information
              gtag('event', 'domain_info', {
                'current_domain': window.location.hostname,
                'canonical_domain': 'www.aviatorstrainingcentre.in',
                'is_production': window.location.hostname === 'www.aviatorstrainingcentre.in'
              });
            `,
          }}
        />
      </head>

      <body className={`bg-background no-horizontal-overflow ${inter.variable} ${montserrat.variable} ${roboto.variable} ${poppins.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConditionalAnalytics>
            <ErrorHandlingProvider
              enableGlobalErrorTracking={true}
              enableToastNotifications={true}
              enableConnectionMonitoring={true}
            >
              <PerformanceImageProvider>
                <UTMTracker />
                <PerformanceMonitor />
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <Analytics />
                <ServiceWorkerRegistration />
              </PerformanceImageProvider>
            </ErrorHandlingProvider>
          </ConditionalAnalytics>
        </ThemeProvider>
      </body>
    </html >
  );
}
