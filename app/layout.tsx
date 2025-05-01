import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: "Aviators Training Centre | Aviation Training for Pilots",
    description: "Expert-led aviation training for CPL/ATPL exams, Type Rating preparation, and pilot career services. Join India's premier pilot training institute.",
    keywords: "aviation training, pilot training, DGCA ground school, CPL training, ATPL training, type rating preparation, RTR(A), pilot career",
    robots: "index, follow",
    openGraph: {
        type: "website",
        locale: "en_IE",
        url: "https://aviatorstrainingcentre.com",
        title: "Aviators Training Centre | Aviation Training for Pilots",
        description: "Expert-led aviation training for CPL/ATPL exams, Type Rating preparation, and pilot career services.",
        siteName: "Aviators Training Centre",
        images: [{
            url: "/AVIATORS_TRAINING_CENTRE-LOGO.webp",
            width: 1200,
            height: 630,
            alt: "Aviators Training Centre"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Aviators Training Centre | Aviation Training for Pilots",
        description: "Expert-led aviation training for CPL/ATPL exams, Type Rating preparation, and pilot career services.",
        images: ["/AVIATORS_TRAINING_CENTRE-LOGO.webp"]
    }
};

export default function RootLayout({ children, }: {
    children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
