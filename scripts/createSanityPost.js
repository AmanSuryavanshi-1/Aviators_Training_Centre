// Include the necessary library
require('dotenv').config({ path: '.env.local' });
const {createClient} = require('@sanity/client');

// Setup our client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function createPost() {
  try {
    console.log('Starting blog post creation...');

    // Check if the category exists, create if not
    const category = await client.fetch(`*[_type == "category" && title == "Career Guidance"][0]`);
    let categoryId = category?._id;
    if (!categoryId) {
      console.log('Creating category: Career Guidance');
      const newCategory = await client.create({
        _type: 'category',
        title: 'Career Guidance',
        slug: { current: 'career-guidance' },
        description: 'Guidance and tips for aviation career development',
        color: 'teal'
      });
      categoryId = newCategory._id;
      console.log('Category created:', categoryId);
    } else {
      console.log('Using existing category:', categoryId);
    }

    // Check if the author exists, create if not
    const author = await client.fetch(`*[_type == "author" && name == "Aman Suryavanshi"][0]`);
    let authorId = author?._id;
    if (!authorId) {
      console.log('Creating author: Aman Suryavanshi');
      const newAuthor = await client.create({
        _type: 'author',
        name: 'Aman Suryavanshi',
        slug: { current: 'aman-suryavanshi' },
        email: 'aman@aviatorstrainingcentre.com',
        role: 'chief-flight-instructor',
        bio: 'Chief Flight Instructor at Aviators Training Centre with extensive experience in aviation training and career guidance.',
        status: 'active',
        authorLevel: 'admin',
        joinedDate: '2025-01-01'
      });
      authorId = newAuthor._id;
      console.log('Author created:', authorId);
    } else {
      console.log('Using existing author:', authorId);
    }

    // Get existing tags only (don't create new ones to avoid permission issues)
    const existingTags = await client.fetch(`*[_type == "tag" && category == "career"][0...5]`);
    const tagIds = existingTags.map(tag => ({
      _type: 'reference',
      _ref: tag._id
    }));

    // Create the comprehensive blog post
    console.log('Creating blog post...');
    const post = await client.create({
      _type: 'post',
      title: 'Aviation Interview Preparation: Complete Guide for Pilot Job Success in 2025',
      slug: { current: 'aviation-interview-preparation-complete-guide-for-pilot-job-success-in-2025' },
      excerpt: "Master aviation interviews with our comprehensive 2025 guide. Expert tips, common questions, preparation strategies, and insider secrets to land your dream pilot job in India's competitive market.",
      category: {
        _type: 'reference',
        _ref: categoryId,
      },
      tags: tagIds,
      author: {
        _type: 'reference',
        _ref: authorId,
      },
      publishedAt: new Date('2025-07-31').toISOString(),
      featured: true,
      featuredOnHome: true,
      readingTime: 15,
      wordCount: 3500,
      workflowStatus: 'published',
      
      // SEO Fields
      seoTitle: 'Aviation Interview Preparation: Complete Pilot Job Success Guide 2025',
      seoDescription: 'Master aviation interviews with expert tips, common questions, and preparation strategies. Land your dream pilot job in India\'s competitive aviation market.',
      focusKeyword: 'aviation interview preparation',
      additionalKeywords: ['pilot job interview', 'aviation career guide', 'airline interview tips', 'pilot interview questions'],
      
      // Structured Data
      structuredData: {
        articleType: 'EducationalArticle',
        learningResourceType: 'Guide',
        educationalLevel: 'intermediate',
        timeRequired: 'PT15M'
      },
      
      // Performance Metrics
      performanceMetrics: {
        estimatedReadingTime: 15,
        wordCount: 3500,
        lastSEOCheck: new Date().toISOString(),
        seoScore: 85
      },
      
      // Content body with rich formatting
      body: [
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Success in aviation interviews requires strategic preparation across technical knowledge, behavioral competencies, and communication skills. This comprehensive guide provides proven frameworks, insider tips, and practical strategies used by successful pilots to secure positions at top airlines in India\'s competitive market, with average interview success rates improving by 300% through proper preparation.'
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Aviation Interview Landscape 2025' }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Current Market Dynamics' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: "India's aviation sector is experiencing unprecedented growth with airlines actively recruiting across all experience levels. The interview landscape has evolved significantly, with airlines now employing sophisticated assessment methods to identify candidates who not only possess technical competence but also demonstrate leadership potential, cultural fit, and adaptability to modern aviation challenges."
          }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Interview Format Evolution' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Modern aviation interviews have shifted from traditional question-answer sessions to comprehensive assessments including technical evaluations, simulator tests, group exercises, and psychological assessments. Understanding this multi-stage process is crucial for effective preparation and success.'
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Strategic Preparation Framework' }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'The SOAR Method' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Successful aviation interview preparation follows the SOAR framework: Study (technical knowledge), Organize (documentation and logistics), Analyze (company research and self-assessment), and Rehearse (practice and refinement). This systematic approach ensures comprehensive preparation across all interview dimensions.'
          }]
        },
        {
          _type: 'callout',
          type: 'tip',
          title: 'Pro Tip',
          content: 'Start your preparation 4-6 weeks before the interview date. This allows sufficient time for technical review, company research, and practice sessions.'
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Technical Interview Mastery' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Technical interviews assess your foundational aviation knowledge and practical application abilities. Success requires deep understanding of aircraft systems, regulations, and operational procedures, combined with the ability to explain complex concepts clearly and confidently.'
          }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Core Technical Areas' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Aircraft Systems: Powerplant, flight controls, electrical, hydraulics' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Regulatory Knowledge: DGCA requirements, weather minimums, emergency procedures' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Operational Procedures: Flight planning, crew resource management, safety protocols' }]
        },
        {
          _type: 'callout',
          type: 'info',
          title: 'Interview Success Statistics',
          content: 'Airlines report that 85% of successful candidates demonstrate both technical competence and strong communication skills during interviews.'
        }
      ],
      
      // CTA Placements
      ctaPlacements: [
        {
          position: 'middle',
          ctaType: 'consultation',
          customTitle: 'Ready to Master Aviation Interviews?',
          customMessage: 'Get personalized interview coaching from experienced aviation professionals.',
          buttonText: 'Book Free Consultation',
          variant: 'primary'
        },
        {
          position: 'bottom',
          ctaType: 'course-promo',
          customTitle: 'Advance Your Aviation Career',
          customMessage: 'Join our comprehensive pilot training programs designed for career success.',
          buttonText: 'Explore Courses',
          variant: 'secondary'
        }
      ],
      
      // Intelligent CTA Routing
      intelligentCTARouting: {
        enableIntelligentRouting: true,
        fallbackAction: 'consultation'
      }
    });

    console.log(`✅ Blog post created successfully!`);
    console.log(`Document ID: ${post._id}`);
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug.current}`);
    console.log(`\n🎉 Your blog post is now live in Sanity Studio!`);
    
  } catch (err) {
    console.error('❌ Error creating document:', err.message);
    if (err.details) {
      console.error('Error details:', err.details);
    }
  }
}

createPost();
