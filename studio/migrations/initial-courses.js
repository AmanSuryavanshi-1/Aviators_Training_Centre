// Initial course data for CTA routing
// This can be imported into Sanity Studio or used as reference

export const initialCourses = [
  {
    _type: 'course',
    name: 'Technical General Ground School',
    slug: { current: 'technical-general' },
    category: 'technical-general',
    description: 'Comprehensive DGCA Technical General ground school covering all essential aviation theory subjects including Air Navigation, Aviation Meteorology, Air Regulations, and Technical General Knowledge.',
    shortDescription: 'DGCA Technical General ground school with comprehensive aviation theory',
    targetUrl: '/courses/technical-general',
    price: 25000,
    duration: '6 months',
    level: 'intermediate',
    keywords: [
      'dgca',
      'ground school',
      'aviation theory',
      'air navigation',
      'meteorology',
      'air regulations',
      'technical general'
    ],
    ctaSettings: {
      primaryButtonText: 'Enroll in Technical General',
      secondaryButtonText: 'Learn More',
      ctaTitle: 'Ready to Master Aviation Theory?',
      ctaMessage: 'Join our comprehensive Technical General Ground School and build a strong foundation in aviation knowledge.'
    },
    active: true
  },
  {
    _type: 'course',
    name: 'Technical Specific Training',
    slug: { current: 'technical-specific' },
    category: 'technical-specific',
    description: 'Advanced technical training covering aircraft systems, navigation equipment, and specialized aviation technology for professional pilots.',
    shortDescription: 'Advanced aircraft systems and navigation technology training',
    targetUrl: '/courses/technical-specific',
    price: 35000,
    duration: '4 months',
    level: 'advanced',
    keywords: [
      'aircraft systems',
      'navigation',
      'avionics',
      'technical specific',
      'advanced systems',
      'flight instruments'
    ],
    ctaSettings: {
      primaryButtonText: 'Start Technical Specific',
      secondaryButtonText: 'View Curriculum',
      ctaTitle: 'Master Advanced Aviation Systems',
      ctaMessage: 'Advance your technical knowledge with our specialized Technical Specific training program.'
    },
    active: true
  },
  {
    _type: 'course',
    name: 'CPL Ground School',
    slug: { current: 'cpl-ground-school' },
    category: 'cpl-ground-school',
    description: 'Complete Commercial Pilot License ground school preparation covering all DGCA CPL subjects and examination requirements.',
    shortDescription: 'Complete CPL ground school for commercial pilot license',
    targetUrl: '/courses/cpl-ground-school',
    price: 45000,
    duration: '8 months',
    level: 'professional',
    keywords: [
      'commercial pilot',
      'cpl',
      'pilot license',
      'commercial aviation',
      'pilot training',
      'career',
      'professional pilot'
    ],
    ctaSettings: {
      primaryButtonText: 'Start CPL Journey',
      secondaryButtonText: 'Download Syllabus',
      ctaTitle: 'Launch Your Commercial Pilot Career',
      ctaMessage: 'Take the next step toward becoming a commercial pilot with our comprehensive CPL Ground School.'
    },
    active: true
  },
  {
    _type: 'course',
    name: 'ATPL Ground School',
    slug: { current: 'atpl-ground-school' },
    category: 'atpl-ground-school',
    description: 'Airline Transport Pilot License ground school for aspiring airline pilots, covering advanced aviation subjects and airline operations.',
    shortDescription: 'ATPL ground school for airline pilot careers',
    targetUrl: '/courses/atpl-ground-school',
    price: 65000,
    duration: '12 months',
    level: 'professional',
    keywords: [
      'airline pilot',
      'atpl',
      'airline transport',
      'advanced training',
      'captain',
      'airline operations',
      'commercial aviation'
    ],
    ctaSettings: {
      primaryButtonText: 'Begin ATPL Program',
      secondaryButtonText: 'Career Guidance',
      ctaTitle: 'Become an Airline Captain',
      ctaMessage: 'Achieve your dream of flying for airlines with our comprehensive ATPL Ground School program.'
    },
    active: true
  },
  {
    _type: 'course',
    name: 'Type Rating Courses',
    slug: { current: 'type-rating' },
    category: 'type-rating',
    description: 'Aircraft-specific type rating courses for various commercial aircraft models, including simulator training and certification.',
    shortDescription: 'Aircraft-specific type rating and simulator training',
    targetUrl: '/courses/type-rating',
    price: 150000,
    duration: '6 weeks',
    level: 'professional',
    keywords: [
      'type rating',
      'aircraft type',
      'specific aircraft',
      'simulator',
      'aircraft certification',
      'commercial aircraft'
    ],
    ctaSettings: {
      primaryButtonText: 'Get Type Rated',
      secondaryButtonText: 'Available Aircraft',
      ctaTitle: 'Get Certified on Specific Aircraft',
      ctaMessage: 'Expand your flying opportunities with our comprehensive type rating programs.'
    },
    active: true
  },
  {
    _type: 'course',
    name: 'General Aviation Training',
    slug: { current: 'general-aviation' },
    category: 'general-aviation',
    description: 'Comprehensive general aviation training covering private pilot license, recreational flying, and general aviation operations.',
    shortDescription: 'General aviation and private pilot training',
    targetUrl: '/courses',
    price: 30000,
    duration: '4 months',
    level: 'beginner',
    keywords: [
      'general aviation',
      'private pilot',
      'recreational flying',
      'ppl',
      'basic training',
      'aviation basics'
    ],
    ctaSettings: {
      primaryButtonText: 'Explore Courses',
      secondaryButtonText: 'Contact Us',
      ctaTitle: 'Start Your Aviation Journey',
      ctaMessage: 'Begin your aviation adventure with our comprehensive training programs.'
    },
    active: true
  }
];

// Sample blog categories with intelligent routing configuration
export const enhancedCategories = [
  {
    _type: 'category',
    title: 'Technical Training',
    slug: { current: 'technical-training' },
    description: 'Articles about technical aspects of aviation training and aircraft systems',
    color: 'teal',
    intelligentRouting: {
      defaultCourse: { _ref: 'technical-general-course-id' },
      keywords: ['technical', 'systems', 'navigation', 'instruments'],
      courseMapping: [
        {
          keywords: ['dgca', 'ground school', 'theory'],
          targetCourse: { _ref: 'technical-general-course-id' }
        },
        {
          keywords: ['aircraft systems', 'avionics', 'advanced'],
          targetCourse: { _ref: 'technical-specific-course-id' }
        }
      ]
    },
    seoSettings: {
      metaTitle: 'Technical Aviation Training Articles | Aviators Training Centre',
      metaDescription: 'Expert insights on technical aviation training, aircraft systems, and professional pilot education.'
    }
  },
  {
    _type: 'category',
    title: 'Career Guidance',
    slug: { current: 'career-guidance' },
    description: 'Career advice and guidance for aspiring pilots',
    color: 'blue',
    intelligentRouting: {
      defaultCourse: { _ref: 'cpl-ground-school-course-id' },
      keywords: ['career', 'pilot', 'commercial', 'airline'],
      courseMapping: [
        {
          keywords: ['commercial pilot', 'cpl', 'career start'],
          targetCourse: { _ref: 'cpl-ground-school-course-id' }
        },
        {
          keywords: ['airline', 'captain', 'atpl'],
          targetCourse: { _ref: 'atpl-ground-school-course-id' }
        }
      ]
    },
    seoSettings: {
      metaTitle: 'Pilot Career Guidance | Aviators Training Centre',
      metaDescription: 'Professional guidance for building a successful career in aviation and commercial flying.'
    }
  },
  {
    _type: 'category',
    title: 'Aviation News',
    slug: { current: 'aviation-news' },
    description: 'Latest news and updates from the aviation industry',
    color: 'green',
    intelligentRouting: {
      defaultCourse: { _ref: 'general-aviation-course-id' },
      keywords: ['news', 'industry', 'updates', 'aviation'],
      courseMapping: [
        {
          keywords: ['regulation', 'dgca', 'policy'],
          targetCourse: { _ref: 'technical-general-course-id' }
        }
      ]
    },
    seoSettings: {
      metaTitle: 'Aviation Industry News | Aviators Training Centre',
      metaDescription: 'Stay updated with the latest aviation industry news, regulations, and developments.'
    }
  }
];