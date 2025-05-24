import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script'; // Import the Script component

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" />
        
        {/* Enhanced Structured Data for Organization */}
        <Script
          id="organization-schema"
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
              "offers": {
                "@type": "Offer",
                "category": "Aviation Training",
                "description": "Comprehensive pilot training programs including DGCA ground school, type rating preparation, and career guidance"
              }
            })
          }}
        />
        
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XSRFEJCB7N`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XSRFEJCB7N', {
                page_title: document.title,
                page_location: window.location.href
              });
            `,
          }}
        />
      </head>
      <body className="bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
