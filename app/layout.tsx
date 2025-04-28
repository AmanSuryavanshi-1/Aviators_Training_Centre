import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider"; // Assuming ThemeProvider is in src/components
import Header from "@/components/layout/Header"; // Assuming Header is in src/components/layout
import Footer from "@/components/layout/Footer"; // Assuming Footer is in src/components/layout
import { Toaster } from "@/components/ui/sonner"; // Assuming Toaster is in src/components/ui
import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics
import ScrollToTop from "@/components/shared/ScrollToTop"; // Assuming ScrollToTop is in src/components/shared

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aviators Training Centre - Expert Pilot Training",
  description: "Achieve your dream of becoming a pilot with Aviators Training Centre. Offering comprehensive ground classes for DGCA exams, RTR(A) preparation, and specialized aviation courses.",
  // Add more metadata as needed (keywords, open graph, etc.)
  openGraph: {
    title: "Aviators Training Centre - Expert Pilot Training",
    description: "Comprehensive ground classes for DGCA exams, RTR(A), and more.",
    url: "https://www.aviatorstrainingcentre.com", // Replace with your actual URL
    siteName: "Aviators Training Centre",
    images: [
      {
        url: "/public/HomePage/Hero1.webp", // Replace with a suitable OG image URL
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviators Training Centre - Expert Pilot Training",
    description: "Comprehensive ground classes for DGCA exams, RTR(A), and more.",
    // site: "@yourTwitterHandle", // Add your Twitter handle
    // creator: "@creatorTwitterHandle", // Add creator handle if different
    images: ["/public/HomePage/Hero1.webp"], // Replace with a suitable Twitter image URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-aviation-text flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ScrollToTop />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
