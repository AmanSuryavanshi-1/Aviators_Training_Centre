import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script'; // Import the Script component
import { Montserrat, Poppins } from 'next/font/google';

// Font setup
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://aviatorstrainingcentre.com'), // Recommended for resolving relative paths
    title: {
        default: "Aviators Training Centre (ATC) | Premier Pilot Training Institute | Aviation Training for Pilots",
        template: `%s | Aviators Training Centre (ATC)`,
    },
    description: "India's leading aviation training center offering CPL/ATPL exam preparation, Type Rating courses, and comprehensive pilot training programs. Expert instructors, modern facilities, and career guidance for aspiring pilots.", // Slightly refined description
    keywords: ["Aviators Training Centre", "ATC", "pilot training", "aviation training", "DGCA ground school", "CPL training", "ATPL training", "type rating preparation", "RTR(A)", "pilot career", "flight school", "aviation academy", "pilot license", "commercial pilot training", "online CPL coaching", "ATPL exam prep", "pilot interview training"], // Added more keywords
    robots: "index, follow",
    alternates: {
        canonical: "/", // Canonical for the homepage
        languages: {
            'en': '/',
        },
    },
    openGraph: {
        type: "website",
        locale: "en_IE",
        url: "https://aviatorstrainingcentre.com",
        title: "Aviators Training Centre (ATC) | Premier Pilot Training Institute | Aviation Training for Pilots",
        description: "India's leading aviation training center offering CPL/ATPL exam preparation, Type Rating courses, and comprehensive pilot training programs.",
        siteName: "Aviators Training Centre",
        images: [{
            url: "/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
            width: 1200,
            height: 630,
            alt: "Aviators Training Centre"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Aviators Training Centre (ATC) | Premier Pilot Training Institute",
        description: "India's leading aviation training center offering CPL/ATPL exam preparation, Type Rating courses, and comprehensive pilot training programs.",
        images: ["/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png"]
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
              gtag('config', 'G-XSRFEJCB7N');
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${poppins.variable} font-sans bg-background`}>
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
