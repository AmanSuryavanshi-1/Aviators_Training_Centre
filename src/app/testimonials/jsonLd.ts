import { YouTubeShort, TextTestimonial, Student } from '@/lib/testimonials/types';

export interface VideoObjectSchema {
  '@type': 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  embedUrl: string;
  author: {
    '@type': 'Person';
    name: string;
  };
}

export interface ReviewSchema {
  '@type': 'Review';
  reviewBody: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
  };
  author: {
    '@type': 'Person';
    name: string;
  };
  itemReviewed: {
    '@type': 'EducationalOrganization';
    name: string;
  };
}

export function generateVideoObjectSchema(
  video: YouTubeShort,
  student: Student | null
): VideoObjectSchema & { keywords?: string; about?: any[] } {
  // Create SEO-optimized description using keywords and subjects
  const seoKeywords = video.seoKeywords || [];
  const subjects = video.subjects || [];
  const keywordString = [...seoKeywords, ...subjects].join(', ');
  
  const seoDescription = `${student?.name || video.studentName} shares their success story about ${subjects.join(' and ')} training at Aviators Training Centre. ${seoKeywords.slice(0, 3).join(', ')} - Real testimonial from ${student?.course || 'aviation training'} graduate.`;

  return {
    '@type': 'VideoObject',
    name: `${student?.name || video.studentName} - ${subjects[0] || 'Aviation Training'} Success Story | ATC Testimonial`,
    description: seoDescription,
    thumbnailUrl: video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
    uploadDate: video.uploadDate || new Date().toISOString(),
    contentUrl: video.url,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
    keywords: keywordString,
    about: subjects.map(subject => ({
      '@type': 'Thing',
      name: subject,
      description: `Aviation training in ${subject}`
    })),
    author: {
      '@type': 'Person',
      name: student?.name || video.studentName || 'Aviation Training Graduate'
    }
  };
}

export function generateReviewSchema(
  testimonial: TextTestimonial,
  student: Student | null
): ReviewSchema {
  // Map confidence score (0-1) to rating (1-5)
  const rating = Math.max(1, Math.min(5, Math.round(testimonial.confidenceScore * 4 + 1)));
  
  return {
    '@type': 'Review',
    reviewBody: testimonial.text,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: 5
    },
    author: {
      '@type': 'Person',
      name: student?.name || 'Aviation Training Graduate'
    },
    itemReviewed: {
      '@type': 'EducationalOrganization',
      name: 'Aviators Training Centre'
    }
  };
}

export function generateTestimonialsPageSchema(
  videos: YouTubeShort[],
  testimonials: TextTestimonial[],
  students: Student[]
) {
  const studentMap = new Map(students.map(s => [s.id, s]));
  
  const videoObjects = videos.map(video => 
    generateVideoObjectSchema(video, studentMap.get(video.studentId || '') || null)
  );
  
  const reviewObjects = testimonials.map(testimonial => {
    const student = testimonial.sourceVideoId 
      ? studentMap.get(videos.find(v => v.id === testimonial.sourceVideoId)?.studentId || '') || null
      : null;
    return generateReviewSchema(testimonial, student);
  });

  return [
    // Main testimonials list
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Aviation Training Success Stories',
      description: 'Real testimonials from DGCA CPL and aviation training graduates',
      itemListElement: [
        ...videoObjects,
        ...reviewObjects
      ]
    },
    // Local Business Schema for Indian aviation training market
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Aviators Training Centre',
      description: 'Premier aviation training institute in India specializing in DGCA CPL/ATPL ground school training',
      url: 'https://aviatorstrainingcentre.com',
      logo: 'https://aviatorstrainingcentre.com/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ramphal Chowk Rd, Sector 7 Dwarka',
        addressLocality: 'Dwarka',
        addressRegion: 'Delhi',
        postalCode: '110075',
        addressCountry: 'IN'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-94856-87609',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi']
      },
      sameAs: [
        'https://www.facebook.com/profile.php?id=61576701390492',
        'https://www.instagram.com/aviatorstrainingcentre',
        'https://youtube.com/@aviatewithatc'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '500',
        bestRating: '5'
      }
    },
    // FAQ Schema for SEO
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the success rate of students at Aviators Training Centre?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our students have a 95% success rate in DGCA CPL/ATPL examinations, with over 500 successful graduates working in the aviation industry across India and internationally.'
          }
        },
        {
          '@type': 'Question',
          name: 'How long does it take to complete the DGCA ground school training?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The comprehensive DGCA ground school training typically takes 3-6 months depending on the course intensity and student availability. Our flexible online format allows students to learn at their own pace.'
          }
        },
        {
          '@type': 'Question',
          name: 'Are the instructors at ATC experienced airline pilots?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, all our instructors are experienced airline pilots with real-world aviation experience, including captains from major Indian airlines like IndiGo, SpiceJet, and Air India, providing practical insights beyond textbook knowledge.'
          }
        },
        {
          '@type': 'Question',
          name: 'What courses are offered at Aviators Training Centre?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer comprehensive DGCA CPL/ATPL ground school covering all subjects (Air Navigation, Meteorology, Air Regulations, Technical General & Specific), Type Rating preparation (A320 & B737), RTR(A) training, one-on-one classes, and interview preparation for airline jobs.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is Aviators Training Centre DGCA approved?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Aviators Training Centre follows DGCA-approved curriculum and our training programs are designed to meet all DGCA CPL and ATPL examination requirements. Our high success rate demonstrates the effectiveness of our DGCA-compliant training methodology.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I get placement assistance after completing the course?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, we provide comprehensive placement assistance including interview preparation, resume building, and connections with airline recruiters. Many of our graduates have successfully joined major Indian airlines and international carriers.'
          }
        }
      ]
    },
    // Course Schema for better SEO
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'DGCA CPL Ground School Training',
      description: 'Comprehensive DGCA Commercial Pilot License ground school training covering all subjects required for CPL examination in India',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Aviators Training Centre',
        url: 'https://aviatorstrainingcentre.com'
      },
      courseMode: 'online',
      educationalLevel: 'Professional',
      teaches: [
        'Air Navigation',
        'Meteorology', 
        'Air Regulations',
        'Technical General',
        'Technical Specific',
        'RTR(A) Radio Telephony'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '500',
        bestRating: '5'
      },
      offers: {
        '@type': 'Offer',
        category: 'Aviation Training',
        availability: 'https://schema.org/InStock'
      }
    }
  ];
}