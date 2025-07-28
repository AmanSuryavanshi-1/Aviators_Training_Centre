/**
 * Script to create sample aviation blog content in Sanity CMS
 * This demonstrates the blog system capabilities and provides SEO-optimized content
 */

import { enhancedClient } from '../lib/sanity/client';

const sampleBlogPosts = [
  {
    title: "Complete Guide to DGCA Exam Preparation: Your Path to Commercial Pilot License",
    slug: "dgca-exam-preparation-guide-commercial-pilot-license",
    excerpt: "Master the DGCA exam with our comprehensive preparation guide. Learn about exam patterns, study strategies, and essential topics for aspiring commercial pilots in India.",
    category: "DGCA Exam Preparation",
    tags: ["DGCA", "Commercial Pilot License", "CPL", "Exam Preparation", "Aviation Career"],
    difficulty: "intermediate",
    contentType: "guide",
    readingTime: 12,
    featured: true,
    seoTitle: "DGCA Exam Preparation Guide 2024 - Complete CPL Study Plan",
    seoDescription: "Comprehensive DGCA exam preparation guide for commercial pilot license. Expert tips, study materials, and exam strategies from India's leading aviation training institute.",
    focusKeyword: "DGCA exam preparation",
    additionalKeywords: ["commercial pilot license", "CPL exam", "aviation training", "pilot career"],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Directorate General of Civil Aviation (DGCA) exam is your gateway to becoming a commercial pilot in India. This comprehensive guide will walk you through everything you need to know about DGCA exam preparation, from understanding the exam structure to developing effective study strategies.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Understanding the DGCA Exam Structure'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The DGCA exam consists of multiple papers covering essential aviation subjects. Each paper requires thorough preparation and understanding of both theoretical concepts and practical applications.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'Core Subjects Include:'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Air Navigation - Understanding charts, instruments, and flight planning'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Aviation Meteorology - Weather patterns, forecasting, and flight safety'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Aircraft Technical - Systems, engines, and maintenance principles'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Air Regulations - Indian aviation laws and international standards'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Effective Study Strategies for DGCA Success'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Success in DGCA exams requires a structured approach combining theoretical study with practical application. Our proven methodology has helped hundreds of students achieve their commercial pilot dreams.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '1. Create a Comprehensive Study Schedule'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Allocate specific time slots for each subject based on your strengths and weaknesses. Typically, students should dedicate 4-6 months for thorough preparation, studying 6-8 hours daily.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '2. Use Quality Study Materials'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Invest in updated DGCA-approved textbooks and reference materials. Our technical general and technical specific courses provide comprehensive coverage of all exam topics with the latest updates.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Common Mistakes to Avoid'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Many aspiring pilots make critical errors during their DGCA preparation. Avoid these common pitfalls to maximize your chances of success on the first attempt.'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Remember, the DGCA exam is not just about memorization – it tests your understanding of aviation principles that you\'ll use throughout your flying career. Focus on conceptual clarity rather than rote learning.'
          }
        ]
      }
    ]
  },
  {
    title: "Aviation Career Guide: From Student Pilot to Commercial Airline Captain",
    slug: "aviation-career-guide-student-pilot-to-airline-captain",
    excerpt: "Explore the complete aviation career pathway from obtaining your first pilot license to becoming an airline captain. Learn about training requirements, career opportunities, and salary expectations.",
    category: "Career Guidance",
    tags: ["Aviation Career", "Pilot Training", "Airline Captain", "Career Path", "Professional Development"],
    difficulty: "beginner",
    contentType: "guide",
    readingTime: 15,
    featured: true,
    seoTitle: "Aviation Career Guide 2024 - Complete Pilot Career Pathway",
    seoDescription: "Comprehensive aviation career guide covering pilot training, license requirements, career opportunities, and salary expectations. Start your aviation career today.",
    focusKeyword: "aviation career",
    additionalKeywords: ["pilot career", "airline captain", "aviation training", "pilot salary"],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The aviation industry offers exciting career opportunities for those passionate about flying. This comprehensive guide outlines the complete journey from student pilot to airline captain, helping you understand the requirements, challenges, and rewards of an aviation career.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Step 1: Private Pilot License (PPL)'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Your aviation journey begins with obtaining a Private Pilot License. This foundational license allows you to fly small aircraft for personal use and builds essential flying skills.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'PPL Requirements:'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Minimum 40 hours of flight time'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Pass written and practical examinations'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Medical certificate from DGCA-approved doctor'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Step 2: Commercial Pilot License (CPL)'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Commercial Pilot License is your ticket to professional flying. With a CPL, you can work as a pilot for airlines, charter companies, or other commercial operations.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Career Opportunities in Aviation'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The aviation industry offers diverse career paths beyond traditional airline flying. Explore opportunities in cargo operations, corporate aviation, flight instruction, and specialized flying roles.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'Salary Expectations'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Aviation careers offer competitive salaries that increase with experience and qualifications. Entry-level commercial pilots can expect starting salaries of ₹8-12 lakhs annually, while experienced airline captains earn ₹50+ lakhs per year.'
          }
        ]
      }
    ]
  },
  {
    title: "Aircraft Systems Fundamentals: Understanding Modern Aviation Technology",
    slug: "aircraft-systems-fundamentals-modern-aviation-technology",
    excerpt: "Dive deep into aircraft systems including engines, avionics, hydraulics, and electrical systems. Essential knowledge for pilots and aviation maintenance professionals.",
    category: "Technical Knowledge",
    tags: ["Aircraft Systems", "Aviation Technology", "Avionics", "Aircraft Engines", "Technical Training"],
    difficulty: "advanced",
    contentType: "tutorial",
    readingTime: 18,
    featured: false,
    seoTitle: "Aircraft Systems Guide - Modern Aviation Technology Explained",
    seoDescription: "Comprehensive guide to aircraft systems covering engines, avionics, hydraulics, and electrical systems. Essential for pilots and aviation professionals.",
    focusKeyword: "aircraft systems",
    additionalKeywords: ["aviation technology", "aircraft engines", "avionics systems", "flight systems"],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Modern aircraft are marvels of engineering, incorporating sophisticated systems that work together to ensure safe and efficient flight. Understanding these systems is crucial for pilots, maintenance technicians, and aviation professionals.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Powerplant Systems'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Aircraft engines are the heart of any flying machine. Modern commercial aircraft typically use turbofan engines that provide efficient thrust while maintaining reliability and fuel economy.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'Engine Components and Operation'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Turbofan engines consist of several key components working in harmony: the fan, compressor, combustion chamber, turbine, and exhaust nozzle. Each component plays a vital role in converting fuel into thrust.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Avionics and Flight Management Systems'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Modern avionics systems have revolutionized aviation safety and efficiency. Glass cockpits, GPS navigation, and automated flight management systems reduce pilot workload while enhancing situational awareness.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Hydraulic and Pneumatic Systems'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'These systems power critical aircraft functions including landing gear operation, flight control surfaces, and braking systems. Understanding their operation is essential for safe aircraft operation.'
          }
        ]
      }
    ]
  },
  {
    title: "Aviation Safety: Best Practices for Student Pilots",
    slug: "aviation-safety-best-practices-student-pilots",
    excerpt: "Learn essential aviation safety practices every student pilot must know. From pre-flight inspections to emergency procedures, build a strong foundation for safe flying.",
    category: "Safety Tips",
    tags: ["Aviation Safety", "Student Pilot", "Flight Safety", "Emergency Procedures", "Pre-flight Inspection"],
    difficulty: "beginner",
    contentType: "guide",
    readingTime: 10,
    featured: false,
    seoTitle: "Aviation Safety Guide for Student Pilots - Essential Safety Practices",
    seoDescription: "Comprehensive aviation safety guide for student pilots covering pre-flight inspections, emergency procedures, and safety best practices.",
    focusKeyword: "aviation safety",
    additionalKeywords: ["flight safety", "student pilot safety", "aviation emergency procedures", "pre-flight inspection"],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Safety is the cornerstone of aviation. As a student pilot, developing strong safety habits from the beginning of your training will serve you throughout your flying career. This guide covers essential safety practices every pilot must master.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Pre-flight Inspection: Your First Line of Defense'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'A thorough pre-flight inspection is crucial for identifying potential issues before they become airborne emergencies. Never skip or rush this critical safety procedure.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'Key Inspection Points:'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Engine oil level and condition'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Control surface movement and security'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Tire condition and pressure'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Fuel quantity and quality'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Weather Decision Making'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Understanding weather conditions and making appropriate go/no-go decisions is a critical safety skill. Learn to interpret weather reports, forecasts, and recognize conditions beyond your skill level.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Emergency Procedures'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'While emergencies are rare, being prepared can save lives. Practice emergency procedures regularly and maintain proficiency in handling various emergency scenarios.'
          }
        ]
      }
    ]
  },
  {
    title: "Type Rating Training: Your Gateway to Commercial Aviation",
    slug: "type-rating-training-gateway-commercial-aviation",
    excerpt: "Understand type rating requirements for commercial aircraft. Learn about training programs, certification processes, and career opportunities in commercial aviation.",
    category: "Industry News",
    tags: ["Type Rating", "Commercial Aviation", "Airline Training", "Aircraft Certification", "Professional Development"],
    difficulty: "intermediate",
    contentType: "guide",
    readingTime: 14,
    featured: false,
    seoTitle: "Type Rating Training Guide - Commercial Aviation Certification",
    seoDescription: "Complete guide to type rating training for commercial aviation. Learn about certification requirements, training programs, and career opportunities.",
    focusKeyword: "type rating training",
    additionalKeywords: ["commercial aviation", "airline training", "aircraft certification", "pilot certification"],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Type rating training is a specialized certification that allows pilots to operate specific aircraft types in commercial aviation. This comprehensive guide explains the type rating process and its importance in your aviation career.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'What is a Type Rating?'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'A type rating is an additional qualification added to your pilot license that certifies you to operate a specific aircraft type. It\'s required for aircraft weighing more than 12,500 pounds or turbojet-powered aircraft.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Training Components'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Type rating training combines ground school, simulator training, and flight training to ensure pilots are thoroughly familiar with their assigned aircraft type.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'Ground School Topics:'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Aircraft systems and limitations'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Normal and emergency procedures'
          }
        ]
      },
      {
        _type: 'block',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'Performance calculations'
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Career Opportunities'
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Type ratings open doors to commercial aviation careers with airlines, cargo operators, and corporate flight departments. Each type rating represents a significant investment in your professional development.'
          }
        ]
      }
    ]
  }
];

async function createSampleContent() {
  console.log('Creating sample blog content...');
  
  try {
    // First, create categories if they don't exist
    const categories = [
      {
        _type: 'category',
        title: 'DGCA Exam Preparation',
        slug: { current: 'dgca-exam-preparation' },
        description: 'Comprehensive guides and tips for DGCA exam success',
        color: 'teal'
      },
      {
        _type: 'category',
        title: 'Career Guidance',
        slug: { current: 'career-guidance' },
        description: 'Aviation career advice and professional development',
        color: 'blue'
      },
      {
        _type: 'category',
        title: 'Technical Knowledge',
        slug: { current: 'technical-knowledge' },
        description: 'In-depth technical aviation content',
        color: 'purple'
      },
      {
        _type: 'category',
        title: 'Safety Tips',
        slug: { current: 'safety-tips' },
        description: 'Essential aviation safety practices',
        color: 'green'
      },
      {
        _type: 'category',
        title: 'Industry News',
        slug: { current: 'industry-news' },
        description: 'Latest aviation industry updates and trends',
        color: 'orange'
      }
    ];

    // Create author
    const author = {
      _type: 'author',
      name: 'Captain Rajesh Kumar',
      slug: { current: 'captain-rajesh-kumar' },
      role: 'Chief Flight Instructor',
      credentials: 'ATPL, CFI, 15,000+ flight hours',
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

    console.log('Creating categories...');
    for (const category of categories) {
      await enhancedClient.create(category);
      console.log(`Created category: ${category.title}`);
    }

    console.log('Creating author...');
    const createdAuthor = await enhancedClient.create(author);
    console.log(`Created author: ${author.name}`);

    console.log('Creating blog posts...');
    for (const post of sampleBlogPosts) {
      // Find the category reference
      const categoryRef = categories.find(cat => cat.title === post.category);
      
      const blogPost = {
        _type: 'post',
        title: post.title,
        slug: { current: post.slug },
        excerpt: post.excerpt,
        body: post.body,
        publishedAt: new Date().toISOString(),
        category: {
          _type: 'reference',
          _ref: 'category-' + (categoryRef?.title.toLowerCase().replace(/\s+/g, '-') || 'general')
        },
        author: {
          _type: 'reference',
          _ref: createdAuthor._id
        },
        tags: post.tags,
        difficulty: post.difficulty,
        contentType: post.contentType,
        readingTime: post.readingTime,
        featured: post.featured,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        focusKeyword: post.focusKeyword,
        additionalKeywords: post.additionalKeywords,
        structuredData: {
          articleType: 'EducationalArticle',
          learningResourceType: 'Article',
          educationalLevel: post.difficulty,
          timeRequired: `PT${post.readingTime}M`
        }
      };

      await enhancedClient.create(blogPost);
      console.log(`Created blog post: ${post.title}`);
    }

    console.log('Sample content creation completed successfully!');
  } catch (error) {
    console.error('Error creating sample content:', error);
  }
}

// Run the script
createSampleContent();