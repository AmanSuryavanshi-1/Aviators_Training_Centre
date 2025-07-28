/**
 * Mock blog data for testing and development
 * This provides sample aviation blog posts with proper SEO optimization
 */

export const mockBlogPosts = [
  {
    _id: "mock-post-1",
    title: "Complete Guide to DGCA Exam Preparation: Your Path to Commercial Pilot License",
    slug: { current: "dgca-exam-preparation-guide-commercial-pilot-license" },
    excerpt: "Master the DGCA exam with our comprehensive preparation guide. Learn about exam patterns, study strategies, and essential topics.",
    publishedAt: "2024-01-15T10:00:00Z",
    lastModified: "2024-01-15T10:00:00Z",
    readingTime: 12,
    difficulty: "intermediate",
    contentType: "guide",
    featured: true,
    tags: ["DGCA", "Commercial Pilot License", "CPL", "Exam Preparation", "Aviation Career"],
    category: {
      title: "DGCA Exam Preparation",
      slug: { current: "dgca-exam-preparation" }
    },
    author: {
      name: "Captain Rajesh Kumar",
      role: "Chief Flight Instructor",
      slug: { current: "captain-rajesh-kumar" }
    },
    image: {
      asset: {
        _ref: "image-mock-1",
        url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=600&fit=crop"
      },
      alt: "DGCA Exam Preparation Guide"
    },
    seoTitle: "DGCA Exam Preparation Guide 2024 - Complete CPL Study Plan",
    seoDescription: "Comprehensive DGCA exam preparation guide for commercial pilot license. Expert tips, study materials, and exam strategies.",
    focusKeyword: "DGCA exam preparation",
    additionalKeywords: ["commercial pilot license", "CPL exam", "aviation training", "pilot career"],
    structuredData: {
      articleType: "EducationalArticle",
      learningResourceType: "Article",
      educationalLevel: "intermediate",
      timeRequired: "PT12M"
    },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Directorate General of Civil Aviation (DGCA) exam is your gateway to becoming a commercial pilot in India. This comprehensive guide will walk you through everything you need to know about DGCA exam preparation.'
          }
        ]
      }
    ]
  },
  {
    _id: "mock-post-2",
    title: "Aviation Career Guide: From Student Pilot to Commercial Airline Captain",
    slug: { current: "aviation-career-guide-student-pilot-to-airline-captain" },
    excerpt: "Explore the complete aviation career pathway from obtaining your first pilot license to becoming an airline captain.",
    publishedAt: "2024-01-10T10:00:00Z",
    lastModified: "2024-01-10T10:00:00Z",
    readingTime: 15,
    difficulty: "beginner",
    contentType: "guide",
    featured: true,
    tags: ["Aviation Career", "Pilot Training", "Airline Captain", "Career Path", "Professional Development"],
    category: {
      title: "Career Guidance",
      slug: { current: "career-guidance" }
    },
    author: {
      name: "Captain Rajesh Kumar",
      role: "Chief Flight Instructor",
      slug: { current: "captain-rajesh-kumar" }
    },
    image: {
      asset: {
        _ref: "image-mock-2",
        url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop"
      },
      alt: "Aviation Career Guide"
    },
    seoTitle: "Aviation Career Guide 2024 - Complete Pilot Career Pathway",
    seoDescription: "Comprehensive aviation career guide covering pilot training, license requirements, career opportunities, and salary expectations.",
    focusKeyword: "aviation career",
    additionalKeywords: ["pilot career", "airline captain", "aviation training", "pilot salary"],
    structuredData: {
      articleType: "EducationalArticle",
      learningResourceType: "Article",
      educationalLevel: "beginner",
      timeRequired: "PT15M"
    },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The aviation industry offers exciting career opportunities for those passionate about flying. This comprehensive guide outlines the complete journey from student pilot to airline captain.'
          }
        ]
      }
    ]
  },
  {
    _id: "mock-post-3",
    title: "Aircraft Systems Fundamentals: Understanding Modern Aviation Technology",
    slug: { current: "aircraft-systems-fundamentals-modern-aviation-technology" },
    excerpt: "Dive deep into aircraft systems including engines, avionics, hydraulics, and electrical systems for aviation professionals.",
    publishedAt: "2024-01-05T10:00:00Z",
    lastModified: "2024-01-05T10:00:00Z",
    readingTime: 18,
    difficulty: "advanced",
    contentType: "tutorial",
    featured: false,
    tags: ["Aircraft Systems", "Aviation Technology", "Avionics", "Aircraft Engines", "Technical Training"],
    category: {
      title: "Technical Knowledge",
      slug: { current: "technical-knowledge" }
    },
    author: {
      name: "Captain Rajesh Kumar",
      role: "Chief Flight Instructor",
      slug: { current: "captain-rajesh-kumar" }
    },
    image: {
      asset: {
        _ref: "image-mock-3",
        url: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800&h=600&fit=crop"
      },
      alt: "Aircraft Systems Guide"
    },
    seoTitle: "Aircraft Systems Guide - Modern Aviation Technology Explained",
    seoDescription: "Comprehensive guide to aircraft systems covering engines, avionics, hydraulics, and electrical systems for pilots.",
    focusKeyword: "aircraft systems",
    additionalKeywords: ["aviation technology", "aircraft engines", "avionics systems", "flight systems"],
    structuredData: {
      articleType: "TechArticle",
      learningResourceType: "Tutorial",
      educationalLevel: "advanced",
      timeRequired: "PT18M"
    },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Modern aircraft are marvels of engineering, incorporating sophisticated systems that work together to ensure safe and efficient flight.'
          }
        ]
      }
    ]
  },
  {
    _id: "mock-post-4",
    title: "Aviation Safety: Best Practices for Student Pilots",
    slug: { current: "aviation-safety-best-practices-student-pilots" },
    excerpt: "Learn essential aviation safety practices every student pilot must know. From pre-flight inspections to emergency procedures.",
    publishedAt: "2024-01-01T10:00:00Z",
    lastModified: "2024-01-01T10:00:00Z",
    readingTime: 10,
    difficulty: "beginner",
    contentType: "guide",
    featured: false,
    tags: ["Aviation Safety", "Student Pilot", "Flight Safety", "Emergency Procedures", "Pre-flight Inspection"],
    category: {
      title: "Safety Tips",
      slug: { current: "safety-tips" }
    },
    author: {
      name: "Captain Rajesh Kumar",
      role: "Chief Flight Instructor",
      slug: { current: "captain-rajesh-kumar" }
    },
    image: {
      asset: {
        _ref: "image-mock-4",
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      },
      alt: "Aviation Safety Guide"
    },
    seoTitle: "Aviation Safety Guide for Student Pilots - Essential Safety Practices",
    seoDescription: "Comprehensive aviation safety guide for student pilots covering pre-flight inspections, emergency procedures, and safety practices.",
    focusKeyword: "aviation safety",
    additionalKeywords: ["flight safety", "student pilot safety", "aviation emergency procedures", "pre-flight inspection"],
    structuredData: {
      articleType: "EducationalArticle",
      learningResourceType: "Guide",
      educationalLevel: "beginner",
      timeRequired: "PT10M"
    },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Safety is the cornerstone of aviation. As a student pilot, developing strong safety habits from the beginning of your training will serve you throughout your flying career.'
          }
        ]
      }
    ]
  },
  {
    _id: "mock-post-5",
    title: "Type Rating Training: Your Gateway to Commercial Aviation",
    slug: { current: "type-rating-training-gateway-commercial-aviation" },
    excerpt: "Understand type rating requirements for commercial aircraft. Learn about training programs, certification processes, and career opportunities.",
    publishedAt: "2023-12-28T10:00:00Z",
    lastModified: "2023-12-28T10:00:00Z",
    readingTime: 14,
    difficulty: "intermediate",
    contentType: "guide",
    featured: false,
    tags: ["Type Rating", "Commercial Aviation", "Airline Training", "Aircraft Certification", "Professional Development"],
    category: {
      title: "Industry News",
      slug: { current: "industry-news" }
    },
    author: {
      name: "Captain Rajesh Kumar",
      role: "Chief Flight Instructor",
      slug: { current: "captain-rajesh-kumar" }
    },
    image: {
      asset: {
        _ref: "image-mock-5",
        url: "https://images.unsplash.com/photo-1583829488555-0b4b8b5b8b5b?w=800&h=600&fit=crop"
      },
      alt: "Type Rating Training Guide"
    },
    seoTitle: "Type Rating Training Guide - Commercial Aviation Certification",
    seoDescription: "Complete guide to type rating training for commercial aviation. Learn about certification requirements, training programs, and opportunities.",
    focusKeyword: "type rating training",
    additionalKeywords: ["commercial aviation", "airline training", "aircraft certification", "pilot certification"],
    structuredData: {
      articleType: "EducationalArticle",
      learningResourceType: "Guide",
      educationalLevel: "intermediate",
      timeRequired: "PT14M"
    },
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Type rating training is a specialized certification that allows pilots to operate specific aircraft types in commercial aviation.'
          }
        ]
      }
    ]
  }
];

export const mockCategories = [
  {
    _id: "mock-category-1",
    title: "DGCA Exam Preparation",
    slug: { current: "dgca-exam-preparation" },
    description: "Comprehensive guides and tips for DGCA exam success",
    color: "teal"
  },
  {
    _id: "mock-category-2",
    title: "Career Guidance",
    slug: { current: "career-guidance" },
    description: "Aviation career advice and professional development",
    color: "blue"
  },
  {
    _id: "mock-category-3",
    title: "Technical Knowledge",
    slug: { current: "technical-knowledge" },
    description: "In-depth technical aviation content",
    color: "purple"
  },
  {
    _id: "mock-category-4",
    title: "Safety Tips",
    slug: { current: "safety-tips" },
    description: "Essential aviation safety practices",
    color: "green"
  },
  {
    _id: "mock-category-5",
    title: "Industry News",
    slug: { current: "industry-news" },
    description: "Latest aviation industry updates and trends",
    color: "orange"
  }
];

export const mockAuthor = {
  _id: "mock-author-1",
  name: "Captain Rajesh Kumar",
  slug: { current: "captain-rajesh-kumar" },
  role: "Chief Flight Instructor",
  credentials: "ATPL, CFI, 15,000+ flight hours",
  bio: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'Captain Rajesh Kumar is a seasoned aviation professional with over 15,000 flight hours and 20 years of experience in commercial aviation. He holds an Airline Transport Pilot License (ATPL) and is a certified flight instructor specializing in DGCA exam preparation and commercial pilot training.'
        }
      ]
    }
  ]
};