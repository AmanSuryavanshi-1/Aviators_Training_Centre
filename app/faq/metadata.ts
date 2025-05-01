import { Metadata } from 'next';

// SEO Metadata for FAQ Page
export const metadata: Metadata = {
  title: "Frequently Asked Questions | Aviators Training Centre",
  description: "Find answers to common questions about our aviation training courses, instructors, and enrollment process. Get the information you need to start your pilot career.",
  keywords: "aviation FAQs, pilot training questions, DGCA exam preparation, aviation course enrollment, RTR(A) training, type rating preparation",
  alternates: {
    canonical: "https://aviatorstrainingcentre.com/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | Aviators Training Centre",
    description: "Find answers to common questions about our aviation training courses, instructors, and enrollment process.",
    url: "https://aviatorstrainingcentre.com/faq",
    images: [{
      url: "/FAQ.webp",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre FAQs"
    }]
  }
};