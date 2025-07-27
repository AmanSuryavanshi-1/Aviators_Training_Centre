// Enhanced sample data setup for Aviators Training Centre Blog
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

async function setupSampleData() {
  console.log('🚀 Setting up comprehensive sample data for Aviators Training Centre Blog...\n')
  
  try {
    // Create sample categories with enhanced configuration
    console.log('📂 Creating blog categories...')
    const categories = [
      {
        _type: 'category',
        title: 'Technical General',
        slug: { current: 'technical-general' },
        description: 'General technical knowledge for aviation professionals including DGCA exam preparation',
        color: 'teal',
        intelligentRouting: {
          keywords: ['dgca', 'ground school', 'aviation theory', 'technical general'],
          courseMapping: [
            {
              keywords: ['dgca', 'exam', 'preparation'],
              targetCourse: { _type: 'reference', _ref: 'technical-general-course' }
            }
          ]
        },
        seoSettings: {
          metaTitle: 'Technical General Aviation Training | {title}',
          metaDescription: 'Master technical general aviation concepts with expert guidance from Aviators Training Centre.'
        }
      },
      {
        _type: 'category',
        title: 'CPL Ground School',
        slug: { current: 'cpl-ground-school' },
        description: 'Commercial Pilot License ground school topics and career guidance',
        color: 'blue',
        intelligentRouting: {
          keywords: ['cpl', 'commercial pilot', 'career', 'ground school'],
          courseMapping: [
            {
              keywords: ['commercial pilot', 'cpl', 'career'],
              targetCourse: { _type: 'reference', _ref: 'cpl-ground-school-course' }
            }
          ]
        }
      },
      {
        _type: 'category',
        title: 'ATPL Ground School',
        slug: { current: 'atpl-ground-school' },
        description: 'Airline Transport Pilot License advanced training topics',
        color: 'purple',
        intelligentRouting: {
          keywords: ['atpl', 'airline', 'transport pilot', 'advanced'],
          courseMapping: [
            {
              keywords: ['atpl', 'airline', 'captain'],
              targetCourse: { _type: 'reference', _ref: 'atpl-ground-school-course' }
            }
          ]
        }
      },
      {
        _type: 'category',
        title: 'Career Guidance',
        slug: { current: 'career-guidance' },
        description: 'Aviation career advice and industry insights',
        color: 'green',
        intelligentRouting: {
          keywords: ['career', 'job', 'pilot career', 'aviation industry'],
          courseMapping: [
            {
              keywords: ['career', 'guidance', 'job'],
              targetCourse: { _type: 'reference', _ref: 'cpl-ground-school-course' }
            }
          ]
        }
      },
      {
        _type: 'category',
        title: 'Safety & Regulations',
        slug: { current: 'safety-regulations' },
        description: 'Aviation safety protocols and regulatory updates',
        color: 'red',
        intelligentRouting: {
          keywords: ['safety', 'regulations', 'dgca rules', 'compliance'],
          courseMapping: [
            {
              keywords: ['safety', 'regulations'],
              targetCourse: { _type: 'reference', _ref: 'technical-general-course' }
            }
          ]
        }
      }
    ]

    const createdCategories = []
    for (const category of categories) {
      const created = await client.create(category)
      createdCategories.push(created)
      console.log(`✅ Created category: ${category.title}`)
    }

    // Create sample courses with enhanced CTA settings
    console.log('\n🎓 Creating course entries...')
    const courses = [
      {
        _id: 'technical-general-course',
        _type: 'course',
        name: 'Technical General Ground School',
        slug: { current: 'technical-general' },
        category: 'technical-general',
        description: 'Comprehensive DGCA Technical General ground school program covering all essential aviation technical knowledge.',
        shortDescription: 'Master DGCA Technical General concepts with expert instruction',
        targetUrl: '/courses/technical-general',
        price: 25000,
        duration: '6 months',
        level: 'intermediate',
        keywords: ['dgca', 'technical general', 'ground school', 'aviation theory', 'exam preparation'],
        ctaSettings: {
          primaryButtonText: 'Enroll in Technical General',
          secondaryButtonText: 'Learn More',
          ctaTitle: 'Ready to Master Technical General?',
          ctaMessage: 'Join our comprehensive DGCA Technical General program and build a strong foundation in aviation technical knowledge.'
        },
        active: true
      },
      {
        _id: 'cpl-ground-school-course',
        _type: 'course',
        name: 'CPL Ground School',
        slug: { current: 'cpl-ground-school' },
        category: 'cpl-ground-school',
        description: 'Complete Commercial Pilot License ground school training program designed to prepare you for a successful aviation career.',
        shortDescription: 'Launch your commercial pilot career with comprehensive CPL training',
        targetUrl: '/courses/cpl-ground-school',
        price: 45000,
        duration: '8 months',
        level: 'advanced',
        keywords: ['cpl', 'commercial pilot', 'ground school', 'career', 'pilot training'],
        ctaSettings: {
          primaryButtonText: 'Start CPL Training',
          secondaryButtonText: 'View Curriculum',
          ctaTitle: 'Ready to Become a Commercial Pilot?',
          ctaMessage: 'Take the next step in your aviation career with our comprehensive CPL Ground School program.'
        },
        active: true
      },
      {
        _id: 'atpl-ground-school-course',
        _type: 'course',
        name: 'ATPL Ground School',
        slug: { current: 'atpl-ground-school' },
        category: 'atpl-ground-school',
        description: 'Advanced Airline Transport Pilot License ground school for aspiring airline pilots and captains.',
        shortDescription: 'Advance to airline captain with ATPL certification',
        targetUrl: '/courses/atpl-ground-school',
        price: 65000,
        duration: '12 months',
        level: 'professional',
        keywords: ['atpl', 'airline transport pilot', 'captain', 'advanced training'],
        ctaSettings: {
          primaryButtonText: 'Begin ATPL Journey',
          secondaryButtonText: 'Course Details',
          ctaTitle: 'Ready for Airline Captain Training?',
          ctaMessage: 'Advance your career to the highest level with our comprehensive ATPL Ground School program.'
        },
        active: true
      },
      {
        _id: 'type-rating-course',
        _type: 'course',
        name: 'Type Rating Courses',
        slug: { current: 'type-rating' },
        category: 'type-rating',
        description: 'Specialized type rating training for various aircraft models including Boeing and Airbus.',
        shortDescription: 'Get certified on specific aircraft types',
        targetUrl: '/courses/type-rating',
        price: 85000,
        duration: '3-6 months',
        level: 'professional',
        keywords: ['type rating', 'aircraft certification', 'boeing', 'airbus'],
        ctaSettings: {
          primaryButtonText: 'Explore Type Ratings',
          secondaryButtonText: 'Available Aircraft',
          ctaTitle: 'Ready for Type Rating Certification?',
          ctaMessage: 'Get certified on the aircraft you want to fly with our specialized type rating programs.'
        },
        active: true
      }
    ]

    const createdCourses = []
    for (const course of courses) {
      const created = await client.createOrReplace(course)
      createdCourses.push(created)
      console.log(`✅ Created course: ${course.name}`)
    }

    // Create sample authors with enhanced permissions
    console.log('\n👥 Creating author profiles...')
    const authors = [
      {
        _id: 'captain-john-smith',
        _type: 'author',
        name: 'Captain John Smith',
        slug: { current: 'captain-john-smith' },
        email: 'john.smith@aviatorstrainingcentre.com',
        bio: 'Captain John Smith is a seasoned airline pilot with over 15 years of commercial aviation experience. He holds an ATPL license and has flown various aircraft including Boeing 737 and Airbus A320. As our Chief Flight Instructor, he brings real-world expertise to ground school training.',
        role: 'chief-flight-instructor',
        credentials: [
          { credential: 'ATPL', details: 'Airline Transport Pilot License' },
          { credential: 'CFI', details: 'Certified Flight Instructor' },
          { credential: 'Type Rating', details: 'Boeing 737, Airbus A320' }
        ],
        experience: {
          totalFlightHours: 12000,
          yearsExperience: 15,
          specializations: ['Commercial Operations', 'Type Rating Training', 'Ground School Instruction']
        },
        authorLevel: 'admin',
        permissions: {
          canPublishDirectly: true,
          canEditOthersContent: true,
          canManageCategories: true,
          canManageCourses: true,
          requiresApproval: false
        },
        contentAreas: ['technical-general', 'cpl-ground-school', 'atpl-ground-school', 'career-guidance'],
        status: 'active',
        joinedDate: '2024-01-01',
        notificationPreferences: {
          emailNotifications: true,
          reviewReminders: true,
          publishingUpdates: true
        }
      },
      {
        _id: 'instructor-sarah-johnson',
        _type: 'author',
        name: 'Sarah Johnson',
        slug: { current: 'instructor-sarah-johnson' },
        email: 'sarah.johnson@aviatorstrainingcentre.com',
        bio: 'Sarah Johnson is a dedicated flight instructor specializing in DGCA exam preparation and technical general subjects. With 8 years of teaching experience, she has helped hundreds of students pass their aviation exams and build successful careers in aviation.',
        role: 'senior-flight-instructor',
        credentials: [
          { credential: 'CPL', details: 'Commercial Pilot License' },
          { credential: 'CFI', details: 'Certified Flight Instructor' },
          { credential: 'Ground Instructor', details: 'Advanced Ground Instructor Rating' }
        ],
        experience: {
          totalFlightHours: 5500,
          yearsExperience: 8,
          specializations: ['DGCA Exam Preparation', 'Technical General', 'Ground School Instruction']
        },
        authorLevel: 'senior',
        permissions: {
          canPublishDirectly: true,
          canEditOthersContent: false,
          canManageCategories: false,
          canManageCourses: false,
          requiresApproval: false
        },
        contentAreas: ['technical-general', 'safety-regulations'],
        status: 'active',
        joinedDate: '2024-01-15',
        notificationPreferences: {
          emailNotifications: true,
          reviewReminders: true,
          publishingUpdates: true
        }
      },
      {
        _id: 'pilot-mike-wilson',
        _type: 'author',
        name: 'Mike Wilson',
        slug: { current: 'pilot-mike-wilson' },
        email: 'mike.wilson@aviatorstrainingcentre.com',
        bio: 'Mike Wilson is a commercial pilot and aviation career counselor who helps aspiring pilots navigate their career paths. He provides valuable insights into the aviation industry and shares practical advice for career development.',
        role: 'commercial-pilot',
        credentials: [
          { credential: 'CPL', details: 'Commercial Pilot License' },
          { credential: 'CFI', details: 'Certified Flight Instructor' }
        ],
        experience: {
          totalFlightHours: 3200,
          yearsExperience: 5,
          specializations: ['Career Guidance', 'Industry Insights', 'Commercial Operations']
        },
        authorLevel: 'regular',
        permissions: {
          canPublishDirectly: false,
          canEditOthersContent: false,
          canManageCategories: false,
          canManageCourses: false,
          requiresApproval: true
        },
        contentAreas: ['career-guidance', 'cpl-ground-school'],
        status: 'active',
        joinedDate: '2024-02-01',
        notificationPreferences: {
          emailNotifications: true,
          reviewReminders: true,
          publishingUpdates: true
        }
      }
    ]

    const createdAuthors = []
    for (const author of authors) {
      const created = await client.createOrReplace(author)
      createdAuthors.push(created)
      console.log(`✅ Created author: ${author.name}`)
    }

    // Create sample blog posts with comprehensive SEO and CTA configuration
    console.log('\n📝 Creating sample blog posts...')
    const blogPosts = [
      {
        _type: 'post',
        title: 'Complete Guide to DGCA Technical General Exam Preparation',
        slug: { current: 'dgca-technical-general-exam-guide' },
        excerpt: 'Master the DGCA Technical General exam with our comprehensive preparation guide. Learn key concepts, study strategies, and insider tips from experienced aviation professionals to ensure your success.',
        body: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'The DGCA Technical General exam is a crucial milestone for aspiring aviation professionals in India. This comprehensive guide will help you understand the exam structure, key topics, and effective preparation strategies.'
              }
            ]
          },
          {
            _type: 'block',
            style: 'h2',
            children: [
              {
                _type: 'span',
                text: 'Understanding the DGCA Technical General Exam'
              }
            ]
          },
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'The Technical General paper covers fundamental aviation concepts including aircraft systems, meteorology, navigation, and regulations. Success in this exam requires thorough understanding of theoretical concepts and their practical applications.'
              }
            ]
          }
        ],
        category: { _type: 'reference', _ref: createdCategories[0]._id },
        author: { _type: 'reference', _ref: 'instructor-sarah-johnson' },
        publishedAt: new Date().toISOString(),
        featured: true,
        readingTime: 8,
        seoTitle: 'DGCA Technical General Exam Guide 2024 | Complete Preparation',
        seoDescription: 'Master the DGCA Technical General exam with our comprehensive guide. Study strategies, key topics, and expert tips for aviation exam success.',
        focusKeyword: 'DGCA Technical General exam',
        additionalKeywords: ['aviation exam', 'pilot training', 'DGCA preparation', 'technical general'],
        structuredData: {
          articleType: 'EducationalArticle',
          learningResourceType: 'Guide',
          educationalLevel: 'intermediate',
          timeRequired: 'PT8M'
        },
        ctaPlacements: [
          {
            position: 'top',
            ctaType: 'course-promo',
            targetCourse: { _type: 'reference', _ref: 'technical-general-course' },
            customTitle: 'Ready to Ace Your DGCA Technical General Exam?',
            customMessage: 'Join our comprehensive Technical General course and get expert guidance from experienced instructors.',
            buttonText: 'Enroll Now',
            variant: 'primary'
          },
          {
            position: 'bottom',
            ctaType: 'consultation',
            customTitle: 'Need Personalized Guidance?',
            customMessage: 'Book a free consultation with our aviation experts to create your personalized study plan.',
            buttonText: 'Book Free Consultation',
            variant: 'secondary'
          }
        ],
        intelligentCTARouting: {
          enableIntelligentRouting: true,
          primaryCourseTarget: { _type: 'reference', _ref: 'technical-general-course' },
          fallbackAction: 'courses-overview'
        },
        workflowStatus: 'published',
        performanceMetrics: {
          estimatedReadingTime: 8,
          wordCount: 1200,
          seoScore: 85
        },
        contentValidation: {
          hasRequiredFields: true,
          hasValidSEO: true,
          hasValidImages: true,
          readyForPublish: true
        }
      },
      {
        _type: 'post',
        title: 'How to Build a Successful Commercial Pilot Career in 2024',
        slug: { current: 'commercial-pilot-career-guide-2024' },
        excerpt: 'Discover the essential steps to build a successful commercial pilot career. From training requirements to job market insights, get expert advice on launching your aviation career.',
        body: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'The aviation industry offers exciting career opportunities for dedicated professionals. This guide outlines the essential steps to build a successful commercial pilot career in today\'s competitive market.'
              }
            ]
          },
          {
            _type: 'block',
            style: 'h2',
            children: [
              {
                _type: 'span',
                text: 'Essential Training Requirements'
              }
            ]
          },
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'To become a commercial pilot, you need to complete specific training milestones including CPL ground school, flight training, and accumulating the required flight hours. Our comprehensive CPL program covers all these requirements.'
              }
            ]
          }
        ],
        category: { _type: 'reference', _ref: createdCategories[1]._id },
        author: { _type: 'reference', _ref: 'pilot-mike-wilson' },
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        featured: false,
        readingTime: 6,
        seoTitle: 'Commercial Pilot Career Guide 2024 | Aviation Career Success',
        seoDescription: 'Build a successful commercial pilot career with our comprehensive guide. Training requirements, job market insights, and expert career advice.',
        focusKeyword: 'commercial pilot career',
        additionalKeywords: ['pilot training', 'aviation career', 'CPL', 'flight training'],
        structuredData: {
          articleType: 'EducationalArticle',
          learningResourceType: 'Guide',
          educationalLevel: 'beginner',
          timeRequired: 'PT6M'
        },
        ctaPlacements: [
          {
            position: 'middle',
            ctaType: 'course-promo',
            targetCourse: { _type: 'reference', _ref: 'cpl-ground-school-course' },
            customTitle: 'Start Your Commercial Pilot Journey Today',
            customMessage: 'Enroll in our comprehensive CPL Ground School program and take the first step towards your aviation career.',
            buttonText: 'Explore CPL Program',
            variant: 'primary'
          }
        ],
        intelligentCTARouting: {
          enableIntelligentRouting: true,
          primaryCourseTarget: { _type: 'reference', _ref: 'cpl-ground-school-course' },
          fallbackAction: 'contact'
        },
        workflowStatus: 'published',
        performanceMetrics: {
          estimatedReadingTime: 6,
          wordCount: 900,
          seoScore: 78
        },
        contentValidation: {
          hasRequiredFields: true,
          hasValidSEO: true,
          hasValidImages: false,
          readyForPublish: true
        }
      }
    ]

    for (const post of blogPosts) {
      const created = await client.create(post)
      console.log(`✅ Created blog post: ${post.title}`)
    }

    console.log('\n🎉 Sample data setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • ${categories.length} blog categories created`)
    console.log(`   • ${courses.length} courses created`)
    console.log(`   • ${authors.length} author profiles created`)
    console.log(`   • ${blogPosts.length} sample blog posts created`)
    
    console.log('\n🚀 Next Steps:')
    console.log('   1. Access Sanity Studio at http://localhost:3333')
    console.log('   2. Review and customize the sample content')
    console.log('   3. Upload author profile images')
    console.log('   4. Add featured images to blog posts')
    console.log('   5. Test the workflow and preview functionality')
    console.log('   6. Configure preview URLs for your environment')
    
  } catch (error) {
    console.error('❌ Error setting up sample data:', error)
    process.exit(1)
  }
}

setupSampleData()