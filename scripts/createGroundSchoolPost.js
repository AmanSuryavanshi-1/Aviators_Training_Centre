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
    console.log('Starting blog post creation for Aviation Ground School...');

    // Check if the category exists, create if not
    const category = await client.fetch(`*[_type == "category" && title == "DGCA Exam Preparation"][0]`);
    let categoryId = category?._id;
    if (!categoryId) {
      console.log('Creating category: DGCA Exam Preparation');
      const newCategory = await client.create({
        _type: 'category',
        title: 'DGCA Exam Preparation',
        slug: { current: 'dgca-exam-preparation' },
        description: 'Comprehensive preparation for DGCA exams',
        color: 'teal'
      });
      categoryId = newCategory._id;
      console.log('Category created:', categoryId);
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
    }

    // Get existing tags or create new ones
    const tags = ["Aviation Ground School", "DGCA Training", "Pilot Theory", "Aviation Education", "Flight Training"];
    const tagIds = [];
    for (const tag of tags) {
      const existingTag = await client.fetch(`*[_type == "tag" && title == "${tag}"][0]`);
      if (!existingTag) {
        const newTag = await client.create({
          _type: 'tag',
          title: tag,
          slug: { current: tag.toLowerCase().replace(/\s+/g, '-') },
        });
        tagIds.push({ _type: 'reference', _ref: newTag._id });
      } else {
        tagIds.push({ _type: 'reference', _ref: existingTag._id });
      }
    }

    // Create the blog post
    console.log('Creating blog post...');
    const post = await client.create({
      _type: 'post',
      title: 'Aviation Ground School: Complete Guide to DGCA Theory Training in India 2025',
      slug: { current: 'aviation-ground-school-complete-guide-dgca-theory-training-india' },
      excerpt: "Master DGCA ground school training with our comprehensive 2025 guide. Learn about subjects, study methods, examination strategies, and how to choose the right training program for aviation success.",
      category: {
        _type: 'reference',
        _ref: categoryId,
      },
      tags: tagIds,
      author: {
        _type: 'reference',
        _ref: authorId,
      },
      publishedAt: new Date().toISOString(),
      featured: true,
      readingTime: 17,
      seoTitle: 'Aviation Ground School Guide 2025 - Complete DGCA Theory Training',
      seoDescription: 'Complete guide to aviation ground school in India. DGCA subjects, training methods, exam preparation, institute selection, and career success strategies for aspiring pilots.',
      focusKeyword: 'aviation ground school',
      additionalKeywords: [
        'DGCA ground school training',
        'aviation theory classes',
        'pilot ground training',
        'aviation education India',
        'DGCA exam preparation',
        'flight theory training',
        'aviation study program',
        'pilot theory subjects',
        'ground school curriculum',
        'aviation training institute'
      ],

      // Structured Data
      structuredData: {
        articleType: 'EducationalArticle',
        learningResourceType: 'Guide',
        educationalLevel: 'intermediate'
      },

      // Content
      body: [
        {
          _type: 'block',
          style: 'normal',
          children: [{
            _type: 'span',
            text: 'Aviation ground school forms the theoretical foundation of pilot training, covering 9 essential DGCA subjects from Air Law to Radio Telephony. Success requires structured study, expert guidance, and comprehensive understanding of both basic principles and practical applications. This guide provides a complete roadmap to excel in your ground school training and build a strong foundation for your aviation career.'
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'What is Aviation Ground School?' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{
            _type: 'span',
            text: 'Aviation ground school is the theoretical component of pilot training that provides essential knowledge about aircraft systems, navigation, meteorology, regulations, and flight operations. Unlike flight training which takes place in aircraft, ground school occurs in classroom settings and covers the academic foundation every pilot must master.'
          }]
        }
      ],

      // CTA Placements
      ctaPlacements: [
        {
          position: 'introduction',
          ctaType: 'program',
          customTitle: 'Get Expert Ground School Training',
          customMessage: 'Ready to excel in your aviation ground school studies?',
          buttonText: 'Join Our Program',
          link: '/contact',
          variant: 'primary'
        },
      ]
    });

    console.log(`✅ Blog post for Aviation Ground School created successfully!`);
    console.log(`Document ID: ${post._id}`);
  } catch (err) {
    console.error('❌ Error creating document:', err);
  }
}

createPost();
