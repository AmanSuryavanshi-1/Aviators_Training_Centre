import { BlogPostPreview } from '@/lib/types/blog';

/**
 * Production-ready comprehensive aviation blog data
 * Updated: 2024-01-25
 * 
 * This file contains high-quality aviation blog posts with:
 * - Proper slug generation for routing
 * - Production-ready SVG images
 * - Clean tag structure
 * - Comprehensive metadata
 * - SEO optimization
 */

export const ALL_BLOG_POSTS: BlogPostPreview[] = [
  {
    _id: 'production-post-1',
    title: 'Complete DGCA CPL License Guide 2024: Requirements & Process',
    slug: { current: 'dgca-cpl-license-complete-guide-2024' },
    excerpt: 'Everything you need to know about obtaining your Commercial Pilot License from DGCA in India, including requirements, process, and expert tips.',
    publishedAt: '2024-01-15T10:00:00Z',
    category: { 
      title: 'Pilot Training',
      slug: { current: 'pilot-training' },
      color: '#075E68'
    },
    author: {
      name: 'Captain Ankit Kumar',
      slug: { current: 'captain-ankit-kumar' },
      role: 'Chief Flight Instructor & Airline Pilot'
    },
    readingTime: 12,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMDc1RTY4Ii8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxwYXRoIGQ9Ik0tNTAgLTIwIEw1MCAyMCBMNjAgMCBMNTAgMjAgTC01MCAyMCBMLTYwIDAgWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPgo8cGF0aCBkPSJNLTMwIC0xMCBMMzAgLTEwIEwzNSAwIEwzMCAxMCBMLTMwIDEwIEwtMzUgMCBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjI1Ii8+CjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI1IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPC9nPgo8dGV4dCB4PSIyMDAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9IjYwMCIgb3BhY2l0eT0iMC45Ij5BdmlhdGlvbiBUcmFpbmluZzwvdGV4dD4KPC9zdmc+',
      },
      alt: 'Complete DGCA CPL License Guide 2024 - Aviation Training Guide',
    },
    tags: ['DGCA', 'CPL', 'Commercial Pilot', 'License', 'Training'],
    featured: true,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'production-post-2',
    title: 'Pilot Salary in India 2024: Complete Aviation Career Earnings Guide',
    slug: { current: 'pilot-salary-india-2024-complete-career-guide' },
    excerpt: 'Comprehensive breakdown of pilot salaries in India across airlines, experience levels, and aircraft types with career progression insights.',
    publishedAt: '2024-01-14T14:30:00Z',
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
    readingTime: 10,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEM2RTcyIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxwYXRoIGQ9Ik0tNTAgLTIwIEw1MCAyMCBMNjAgMCBMNTAgMjAgTC01MCAyMCBMLTYwIDAgWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPgo8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CjwvZz4KPHR5ZXh0IHg9IjIwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjkiPkF2aWF0aW9uIFRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
      },
      alt: 'Pilot Salary in India 2024 - Aviation Career Earnings Guide',
    },
    tags: ['Pilot Salary', 'Career', 'Aviation Jobs', 'India', 'Earnings'],
    featured: true,
    difficulty: 'beginner' as const,
  },
  {
    _id: 'production-post-3',
    title: 'DGCA Medical Examination: Complete Guide for Aspiring Pilots',
    slug: { current: 'dgca-medical-examination-complete-guide-pilots' },
    excerpt: 'Essential requirements, tips, and preparation guide for passing your DGCA medical examination and maintaining pilot medical fitness.',
    publishedAt: '2024-01-13T09:15:00Z',
    category: { 
      title: 'DGCA Regulations',
      slug: { current: 'dgca-regulations' },
      color: '#0A5A5E'
    },
    author: {
      name: 'Dr. Priya Sharma',
      slug: { current: 'dr-priya-sharma' },
      role: 'Aviation Medical Examiner'
    },
    readingTime: 8,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEE1QTVFIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxyZWN0IHg9Ii0yNSIgeT0iLTI1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CjwvZz4KPHR5ZXh0IHg9IjIwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjkiPkF2aWF0aW9uIFRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
      },
      alt: 'DGCA Medical Examination Complete Guide for Pilots',
    },
    tags: ['DGCA Medical', 'Medical Fitness', 'Pilot Health', 'Aviation Medicine'],
    featured: false,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'production-post-4',
    title: 'Flight Simulator Training: Benefits for Student Pilots',
    slug: { current: 'flight-simulator-training-benefits-student-pilots' },
    excerpt: 'How modern flight simulator training enhances pilot skills, reduces training costs, and improves safety for aspiring aviators.',
    publishedAt: '2024-01-12T16:45:00Z',
    category: { 
      title: 'Aviation Technology',
      slug: { current: 'aviation-technology' },
      color: '#0E7A80'
    },
    author: {
      name: 'Captain Rajesh Kumar',
      slug: { current: 'captain-rajesh-kumar' },
      role: 'Flight Training Manager'
    },
    readingTime: 7,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEU3QTgwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxwYXRoIGQ9Ik0tNDAgLTE1IEw0MCAyMCBMNDUgMCBMNDAgMjAgTC00MCAyMCBMLTQ1IDAgWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPC9nPgo8dGV4dCB4PSIyMDAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9IjYwMCIgb3BhY2l0eT0iMC45Ij5BdmlhdGlvbiBUcmFpbmluZzwvdGV4dD4KPC9zdmc+',
      },
      alt: 'Flight Simulator Training Benefits for Student Pilots',
    },
    tags: ['Flight Simulator', 'Training', 'Technology', 'Student Pilots'],
    featured: false,
    difficulty: 'beginner' as const,
  },
  {
    _id: 'production-post-5',
    title: 'Aviation English Proficiency: ICAO Level 4 Requirements',
    slug: { current: 'aviation-english-proficiency-icao-level-4-requirements' },
    excerpt: 'Complete guide to ICAO Level 4 English proficiency requirements for pilots, including preparation tips and assessment criteria.',
    publishedAt: '2024-01-11T11:30:00Z',
    category: { 
      title: 'DGCA Regulations',
      slug: { current: 'dgca-regulations' },
      color: '#0A5A5E'
    },
    author: {
      name: 'Captain Ankit Kumar',
      slug: { current: 'captain-ankit-kumar' },
      role: 'Chief Flight Instructor & Airline Pilot'
    },
    readingTime: 9,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMEE1QTVFIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIzMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPgo8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CjwvZz4KPHR5ZXh0IHg9IjIwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjkiPkF2aWF0aW9uIFRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
      },
      alt: 'Aviation English Proficiency ICAO Level 4 Requirements',
    },
    tags: ['Aviation English', 'ICAO', 'Language Proficiency', 'Pilot Requirements'],
    featured: false,
    difficulty: 'intermediate' as const,
  },
  {
    _id: 'production-post-6',
    title: 'DGCA Exam Preparation: Study Plan & Success Strategies',
    slug: { current: 'dgca-exam-preparation-study-plan-success-strategies' },
    excerpt: 'Proven study strategies, preparation timeline, and expert tips for successfully clearing DGCA theoretical examinations.',
    publishedAt: '2024-01-10T08:00:00Z',
    category: { 
      title: 'Exam Preparation',
      slug: { current: 'exam-preparation' },
      color: '#4A90A4'
    },
    author: {
      name: 'Captain Dhruv Shirkoli',
      slug: { current: 'captain-dhruv-shirkoli' },
      role: 'Senior Airline Pilot & Career Counselor'
    },
    readingTime: 11,
    image: {
      asset: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNEE5MEE0Ii8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMTUwKSI+CjxyZWN0IHg9Ii0zMCIgeT0iLTIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CjwvZz4KPHR5ZXh0IHg9IjIwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjkiPkF2aWF0aW9uIFRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
      },
      alt: 'DGCA Exam Preparation Study Plan & Success Strategies',
    },
    tags: ['DGCA Exam', 'Study Plan', 'Exam Preparation', 'Success Tips'],
    featured: true,
    difficulty: 'intermediate' as const,
  },
];

// Helper functions for blog data access
export function getBlogPostsWithAnalytics(includeAnalytics: boolean = false) {
  if (!includeAnalytics) {
    return ALL_BLOG_POSTS;
  }

  // Add mock analytics data for production display
  return ALL_BLOG_POSTS.map((post, index) => ({
    ...post,
    views: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 views
    engagementRate: Math.floor(Math.random() * 30) + 10, // 10-40% engagement
    shares: Math.floor(Math.random() * 100) + 10, // 10-110 shares
  }));
}

export function getFeaturedPosts() {
  return ALL_BLOG_POSTS.filter(post => post.featured);
}

export function getBlogPostBySlug(slug: string) {
  return ALL_BLOG_POSTS.find(post => post.slug.current === slug);
}

export function getBlogPostsByCategory(categorySlug: string) {
  return ALL_BLOG_POSTS.filter(post => post.category.slug.current === categorySlug);
}

export function getBlogCategories() {
  const categories = new Map();
  
  ALL_BLOG_POSTS.forEach(post => {
    const category = post.category;
    if (!categories.has(category.slug.current)) {
      categories.set(category.slug.current, category);
    }
  });
  
  return Array.from(categories.values());
}

export function searchBlogPosts(query: string) {
  const searchTerm = query.toLowerCase();
  
  return ALL_BLOG_POSTS.filter(post =>
    post.title.toLowerCase().includes(searchTerm) ||
    post.excerpt.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.category.title.toLowerCase().includes(searchTerm)
  );
}

// Export total count for pagination
export const TOTAL_BLOG_POSTS = ALL_BLOG_POSTS.length;

// Export for static generation
export function getAllBlogSlugs() {
  return ALL_BLOG_POSTS.map(post => ({
    params: { slug: post.slug.current }
  }));
}

export default ALL_BLOG_POSTS;