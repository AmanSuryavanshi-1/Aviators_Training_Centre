import { YouTubeShort, Student } from './types';
import videoTestimonials from './video-testimonials.json';
import textTestimonials from './text-testimonials.json';

// Convert text testimonials to Student data format
export const studentsData: Student[] = textTestimonials.map((testimonial: any) => ({
  id: testimonial.id.replace('text-testimonial-', 'student-'),
  name: testimonial.studentName,
  course: testimonial.course,
  gradYear: testimonial.gradYear,
  verified: testimonial.verified,
  avatarUrl: null,
  rating: testimonial.rating,
  subjects: testimonial.subjects,
  testimonial: testimonial.testimonial,
  location: testimonial.location,
  specificFeedback: testimonial.specificFeedback
}));

// Import video testimonials from the SEO-optimized JSON file
export const youtubeShorts: YouTubeShort[] = videoTestimonials as YouTubeShort[];

// Utility function to generate completely hidden YouTube embed URL
export function generateEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&cc_load_policy=0&playsinline=1&enablejsapi=0&start=1&end=999999&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
}

// Utility function to extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Utility function to get student by ID
export function getStudentById(studentId: string): Student | null {
  return studentsData.find(student => student.id === studentId) || null;
}

// Utility function to get video with student context
export function getVideoWithStudent(videoId: string): { video: YouTubeShort; student: Student | null } | null {
  const video = youtubeShorts.find(v => v.id === videoId);
  if (!video) return null;
  
  const student = video.studentId ? getStudentById(video.studentId) : null;
  return { video, student };
}

// Error handling for video loading failures
export interface VideoError {
  videoId: string;
  error: string;
  fallbackContent: {
    title: string;
    description: string;
    thumbnailUrl: string;
  };
}

export function createVideoFallback(videoId: string, student: Student | null): VideoError {
  return {
    videoId,
    error: 'Video temporarily unavailable',
    fallbackContent: {
      title: `${student?.name || 'Student'} - Success Story`,
      description: `Testimonial from ${student?.course || 'aviation training'} graduate`,
      thumbnailUrl: '/placeholder-testimonial.jpg' // Fallback image
    }
  };
}

// Export testimonials data for the infinite video carousel
export const testimonials = {
  videos: videoTestimonials,
  text: textTestimonials,
};

export type VideoTestimonial = (typeof videoTestimonials)[0];
export type TextTestimonial = (typeof textTestimonials)[0];

// SEO Enhancement Functions
export function getAllSEOKeywords(): string[] {
  const allKeywords = new Set<string>();
  
  youtubeShorts.forEach(video => {
    video.seoKeywords?.forEach(keyword => allKeywords.add(keyword));
    video.subjects?.forEach(subject => allKeywords.add(subject));
  });
  
  return Array.from(allKeywords);
}

export function getKeywordsBySubject(subject: string): string[] {
  const keywords = new Set<string>();
  
  youtubeShorts
    .filter(video => video.subjects?.includes(subject))
    .forEach(video => {
      video.seoKeywords?.forEach(keyword => keywords.add(keyword));
    });
  
  return Array.from(keywords);
}

export function generateSEOMetaDescription(): string {
  const topKeywords = getAllSEOKeywords().slice(0, 8);
  return `Real success stories from DGCA CPL and aviation training graduates. ${topKeywords.join(', ')} - Verified testimonials from students who achieved their pilot dreams at Aviators Training Centre.`;
}

export function generateSEOTitle(): string {
  const subjects = [...new Set(youtubeShorts.flatMap(v => v.subjects || []))];
  return `${subjects.slice(0, 3).join(', ')} Success Stories | Aviation Training Testimonials | ATC`;
}

export function getVideoSEOData(videoId: string) {
  const video = youtubeShorts.find(v => v.id === videoId);
  const student = video?.studentId ? getStudentById(video.studentId) : null;
  
  if (!video) return null;
  
  return {
    title: `${video.studentName} - ${video.subjects?.[0] || 'Aviation'} Success Story`,
    description: `${video.studentName} shares their journey in ${video.subjects?.join(' and ')} at Aviators Training Centre. ${video.seoKeywords?.slice(0, 3).join(', ')}.`,
    keywords: [...(video.seoKeywords || []), ...(video.subjects || [])],
    subjects: video.subjects || [],
    student,
    video
  };
}

// SEO Enhancement: Generate FAQ Schema for testimonials
export function generateTestimonialsFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What aviation courses do your graduates recommend?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our graduates highly recommend our DGCA CPL and ATPL ground school programs. Popular courses include ${[...new Set(youtubeShorts.flatMap(v => v.subjects || []))].slice(0, 5).join(', ')}. With a 95% success rate, our comprehensive training covers all DGCA examination subjects.`
        }
      },
      {
        "@type": "Question", 
        "name": "How successful are students at Aviators Training Centre?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our students achieve exceptional results with a 95% success rate in DGCA examinations. Over 500 aspiring pilots have successfully completed their training and are now working as commercial airline pilots. Our video testimonials showcase real success stories from verified graduates."
        }
      },
      {
        "@type": "Question",
        "name": "What subjects are covered in the DGCA CPL ground school?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our DGCA CPL ground school covers all essential subjects including ${[...new Set(youtubeShorts.flatMap(v => v.subjects || []))].join(', ')}. Each subject is taught by experienced airline pilots with real-world aviation experience.`
        }
      },
      {
        "@type": "Question",
        "name": "Are the testimonials from real students?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our video testimonials are from verified graduates who successfully completed their training at Aviators Training Centre. Each testimonial includes the student's name, course details, and graduation year for authenticity."
        }
      }
    ]
  };
}

// SEO Enhancement: Generate Course Schema
export function generateCourseSchema() {
  const uniqueSubjects = [...new Set(youtubeShorts.flatMap(v => v.subjects || []))];
  
  return uniqueSubjects.map(subject => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${subject} Training`,
    "description": `Professional ${subject} training for DGCA CPL and ATPL candidates at Aviators Training Centre`,
    "provider": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "url": "https://www.aviatorstrainingcentre.in"
    },
    "educationalLevel": "Professional",
    "courseMode": "In-person",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "In-person",
      "location": {
        "@type": "Place",
        "name": "Aviators Training Centre",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Delhi",
          "addressRegion": "Delhi",
          "addressCountry": "IN"
        }
      }
    },
    "review": youtubeShorts
      .filter(v => v.subjects?.includes(subject))
      .map(v => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": v.studentName
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": `Excellent ${subject} training. Highly recommended for DGCA exam preparation.`
      }))
  }));
}

// SEO Enhancement: Generate Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Aviators Training Centre",
    "alternateName": "ATC",
    "url": "https://www.aviatorstrainingcentre.in",
    "logo": "https://www.aviatorstrainingcentre.in/logo.png",
    "description": "India's premier DGCA approved aviation training institute specializing in CPL and ATPL ground school preparation",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Delhi",
      "addressRegion": "Delhi",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Admissions",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.youtube.com/@aviatorstrainingcentre",
      "https://www.instagram.com/aviatorstrainingcentre"
    ],
    "hasCredential": "DGCA Approved Training Institute"
    // Note: aggregateRating and reviews are handled separately in testimonials page to avoid conflicts
  };
}

// Generate separate review schema for organization (used in testimonials page)
export function generateOrganizationReviewSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Aviators Training Centre",
    "url": "https://www.aviatorstrainingcentre.in",
    "review": youtubeShorts.map(video => {
      const student = getStudentById(video.studentId || '');
      return {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": video.studentName
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": student?.rating?.toString() || "5",
          "bestRating": "5"
        },
        "reviewBody": student?.testimonial || `Excellent training in ${video.subjects?.join(' and ')}. Highly recommend Aviators Training Centre.`
      };
    })
  };
}
