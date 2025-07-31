import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATC Instructors - Ankit Kumar, Dhruv Shirkoli | Aviators Training Centre",
  description: "Meet our expert ATC instructors at Aviators Training Centre. Learn from airline pilots Ankit Kumar, Dhruv Shirkoli, and Saksham Khandelwal. A320/B737 type-rated instructors with real-world flying experience teaching DGCA CPL/ATPL.",
  keywords: "ATC instructors, Ankit Kumar ATC, Dhruv Shirkoli instructor, Saksham Khandelwal pilot, Aviators Training Centre instructors, airline pilot instructors, A320 type rated instructor, B737 instructor, DGCA CPL instructors, ATPL instructors, aviation training experts",
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in/instructors",
  },
  openGraph: {
    title: "ATC Instructors - Ankit Kumar, Dhruv Shirkoli | Aviators Training Centre",
    description: "Meet our expert ATC instructors at Aviators Training Centre. Learn from airline pilots Ankit Kumar, Dhruv Shirkoli, and Saksham Khandelwal.",
    url: "https://www.aviatorstrainingcentre.in/instructors",
    type: "website",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/Instructor/AK.png",
      width: 1200,
      height: 630,
      alt: "ATC Instructors - Ankit Kumar and Expert Aviation Instructors"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ATC Instructors - Ankit Kumar, Dhruv Shirkoli",
    description: "Meet our expert ATC instructors. Learn from airline pilots with real-world flying experience.",
    images: ["https://www.aviatorstrainingcentre.in/Instructor/AK.png"]
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
};
