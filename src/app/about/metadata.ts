import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Aviators Training Centre - India's Premier ATC Training Institute",
  description: "Learn about Aviators Training Centre (ATC), India's leading aviation training institute. Founded by airline pilots, offering DGCA CPL/ATPL ground school with instructors like Ankit Kumar. 24/7 support, proven success rates.",
  keywords: "About Aviators Training Centre, ATC training institute, aviation training India, DGCA ground school, airline pilot instructors, Ankit Kumar ATC, CPL ATPL coaching, pilot training academy, aviation education India, ATC history, flight training institute",
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in/about",
  },
  openGraph: {
    title: "About Aviators Training Centre - India's Premier ATC Training Institute",
    description: "Learn about Aviators Training Centre (ATC), India's leading aviation training institute. Founded by airline pilots, offering DGCA CPL/ATPL ground school.",
    url: "https://www.aviatorstrainingcentre.in/about",
    type: "website",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/About-Img.webp",
      width: 1200,
      height: 630,
      alt: "About Aviators Training Centre - Premier Aviation Training Institute"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Aviators Training Centre - India's Premier ATC Training Institute",
    description: "Learn about Aviators Training Centre (ATC), India's leading aviation training institute. Founded by airline pilots.",
    images: ["https://www.aviatorstrainingcentre.in/About-Img.webp"]
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
};
