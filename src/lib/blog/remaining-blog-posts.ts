import { BlogPostPreview } from '@/lib/types/blog';

// Remaining 7 blog posts to complete the 15-post collection
export const REMAINING_BLOG_POSTS: BlogPostPreview[] = [
  {
    _id: 'post-9',
    title: 'Flight Simulator Training: Benefits for Student Pilots',
    slug: { current: 'flight-simulator-training-benefits-student-pilots' },
    excerpt: 'Discover how flight simulator training enhances pilot skills and reduces training costs for aspiring aviators.',
    publishedAt: '2023-11-30T12:00:00Z',
    category: { 
      title: 'Flight Training',
      slug: { current: 'flight-training' },
      color: '#8B5CF6'
    },
    author: {
      name: 'Captain Dhruv Shirkoli',
      slug: { current: 'captain-dhruv-shirkoli' },
      role: 'Senior Airline Pilot & Career Counselor'
    },
    readingTime: 8,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjOEI1Q0Y2Ii8+CjxyZWN0IHg9IjEyMCIgeT0iMTIwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHN2ZyB4PSIxNDAiIHk9IjIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI0MCI+Cjx0ZXh0IHg9IjYwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2ltdWxhdG9yPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
      },
      alt: 'Flight Simulator Training Benefits - Student Pilot Education',
    },
    tags: ['Flight Simulator', 'Training', 'Student Pilots', 'Aviation Education'],
    featured: false,
    difficulty: 'beginner' as const,
  },
  {
    _id: 'post-10',
    title: 'Airline Pilot Interview Questions: Expert Answers',
    slug: { current: 'airline-pilot-interview-questions-expert-answers' },
    excerpt: 'Prepare for your airline pilot interview with expert answers to common questions and insider tips.',
    publishedAt: '2023-11-25T15:30:00Z',
    category: { 
      title: 'Career Guidance',
      slug: { current: 'career-guidance' },
      color: '#0C6E72'
    },
    author: {
      name: 'Captain Ankit Kumar',
      slug: { current: 'captain-ankit-kumar' },
      role: 'Chief Flight Instructor & Airline Pilot'
    },
    readingTime: 10,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEM2RTcyIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMjAiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPHN2ZyB4PSIxNDAiIHk9IjIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI0MCI+Cjx0ZXh0IHg9IjYwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW50ZXJ2aWV3PC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
      },
      alt: 'Airline Pilot Interview Questions - Career Preparation Guide',
    },
    tags: ['Interview', 'Airline Jobs', 'Career Preparation', 'Pilot Jobs'],
    featured: false,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'post-11',
    title: 'Aviation English Proficiency: ICAO Level 4 Requirements',
    slug: { current: 'aviation-english-proficiency-icao-level-4-requirements' },
    excerpt: 'Master aviation English proficiency requirements for ICAO Level 4 certification and international flying.',
    publishedAt: '2023-11-20T11:45:00Z',
    category: { 
      title: 'License Requirements',
      slug: { current: 'license-requirements' },
      color: '#6B73FF'
    },
    author: {
      name: 'Dr. Saksham Khandelwal',
      slug: { current: 'dr-saksham-khandelwal' },
      role: 'Aviation Medical Examiner & Flight Instructor'
    },
    readingTime: 7,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNkI3M0ZGIi8+CjxyZWN0IHg9IjE0MCIgeT0iMTAwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHN2ZyB4PSIxNDAiIHk9IjIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI0MCI+Cjx0ZXh0IHg9IjYwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RW5nbGlzaDwvdGV4dD4KPC9zdmc+Cjwvc3ZnPg==',
      },
      alt: 'Aviation English Proficiency - ICAO Level 4 Requirements Guide',
    },
    tags: ['Aviation English', 'ICAO Level 4', 'Language Proficiency', 'International Flying'],
    featured: false,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'post-12',
    title: 'Airline Recruitment Process: Application to Cockpit',
    slug: { current: 'airline-recruitment-process-application-to-cockpit' },
    excerpt: 'Navigate the complete airline recruitment process from initial application to final cockpit assignment.',
    publishedAt: '2023-11-15T09:30:00Z',
    category: { 
      title: 'Career Guidance',
      slug: { current: 'career-guidance' },
      color: '#0C6E72'
    },
    author: {
      name: 'Captain Dhruv Shirkoli',
      slug: { current: 'captain-dhruv-shirkoli' },
      role: 'Senior Airline Pilot & Career Counselor'
    },
    readingTime: 11,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEM2RTcyIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDMwMCAxMDBMMjgwIDEyMEwyODAgMTgwTDMwMCAyMDBMMTAwIDIwMEwxMjAgMTgwTDEyMCAxMjBMMTAwIDEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8c3ZnIHg9IjE0MCIgeT0iMjIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIj4KPHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SZWNydWl0bWVudDwvdGV4dD4KPC9zdmc+Cjwvc3ZnPg==',
      },
      alt: 'Airline Recruitment Process - Application to Cockpit Guide',
    },
    tags: ['Airline Recruitment', 'Job Application', 'Pilot Career', 'Aviation Jobs'],
    featured: false,
    difficulty: 'advanced' as const,
  },
  {
    _id: 'post-13',
    title: 'DGCA Ground School: Technical General vs Specific',
    slug: { current: 'dgca-ground-school-technical-general-vs-specific' },
    excerpt: 'Understand the differences between DGCA Technical General and Technical Specific ground school courses.',
    publishedAt: '2023-11-10T14:00:00Z',
    category: { 
      title: 'Exam Preparation',
      slug: { current: 'exam-preparation' },
      color: '#4A90A4'
    },
    author: {
      name: 'Captain Ankit Kumar',
      slug: { current: 'captain-ankit-kumar' },
      role: 'Chief Flight Instructor & Airline Pilot'
    },
    readingTime: 9,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNEE5MEE0Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iMjIwIiB5PSIxMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgo8c3ZnIHg9IjE0MCIgeT0iMjIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIj4KPHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Hcm91bmQgU2Nob29sPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
      },
      alt: 'DGCA Ground School Comparison - Technical General vs Specific',
    },
    tags: ['DGCA Ground School', 'Technical General', 'Technical Specific', 'Exam Prep'],
    featured: false,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'post-14',
    title: 'Airline Industry Career Opportunities Beyond Pilot Jobs',
    slug: { current: 'airline-industry-career-opportunities-beyond-pilot-jobs' },
    excerpt: 'Explore diverse career opportunities in the airline industry beyond traditional pilot positions.',
    publishedAt: '2023-11-05T16:20:00Z',
    category: { 
      title: 'Career Guidance',
      slug: { current: 'career-guidance' },
      color: '#0C6E72'
    },
    author: {
      name: 'Engineer Anita Desai',
      slug: { current: 'engineer-anita-desai' },
      role: 'Aviation Technology Specialist'
    },
    readingTime: 8,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEM2RTcyIi8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMjAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjciLz4KPGNpcmNsZSBjeD0iMjcwIiBjeT0iMTIwIiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC42Ii8+CjxzdmcgeD0iMTQwIiB5PSIyMjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhcmVlcnM8L3RleHQ+Cjwvc3ZnPgo8L3N2Zz4=',
      },
      alt: 'Airline Industry Career Opportunities - Beyond Pilot Jobs',
    },
    tags: ['Aviation Careers', 'Airline Industry', 'Career Options', 'Aviation Jobs'],
    featured: false,
    difficulty: 'beginner' as const,
  },
  {
    _id: 'post-15',
    title: 'Pilot Training Cost in India: Complete Financial Guide',
    slug: { current: 'pilot-training-cost-india-complete-financial-guide' },
    excerpt: 'Comprehensive breakdown of pilot training costs in India including CPL, ATPL, and type rating expenses.',
    publishedAt: '2023-11-01T13:15:00Z',
    category: { 
      title: 'Training Costs',
      slug: { current: 'training-costs' },
      color: '#F59E0B'
    },
    author: {
      name: 'Captain Dhruv Shirkoli',
      slug: { current: 'captain-dhruv-shirkoli' },
      role: 'Senior Airline Pilot & Career Counselor'
    },
    readingTime: 12,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjU5RTBCIi8+CjxyZWN0IHg9IjE0MCIgeT0iMTAwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHN2ZyB4PSIxNDAiIHk9IjIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI0MCI+Cjx0ZXh0IHg9IjYwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29zdCBHdWlkZTwvdGV4dD4KPC9zdmc+Cjwvc3ZnPg==',
      },
      alt: 'Pilot Training Cost India - Complete Financial Guide',
    },
    tags: ['Training Costs', 'Pilot Training', 'Financial Planning', 'India'],
    featured: true,
    difficulty: 'beginner' as const,
  },
];