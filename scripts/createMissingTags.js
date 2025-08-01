require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const newTags = [
  {
    title: 'Type Rating Comparison',
    slug: { current: 'type-rating-comparison' },
    description: 'A320 vs B737 qualification costs and jobs',
    color: 'blue',
    category: 'training',
    seoKeywords: [
      'type rating comparison',
      'A320 vs B737 type rating',
      'pilot type rating choice',
      'aircraft type rating costs',
      'type rating career impact',
      'commercial pilot type rating',
      'airline type rating requirements',
      'type rating training programs',
      'aviation type rating guide',
      'pilot qualification comparison',
      'aircraft certification training',
      'type rating job prospects',
      'airline pilot certification',
      'flight training comparison',
      'aviation career planning',
      'pilot license advancement',
      'commercial aviation training',
      'airline hiring requirements',
      'type rating investment',
      'pilot career development'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Aviation Careers',
    slug: { current: 'aviation-careers' },
    description: 'Flight career paths and hiring landscape',
    color: 'purple',
    category: 'career',
    seoKeywords: [
      'aviation careers India',
      'pilot career opportunities',
      'airline job prospects',
      'aviation industry jobs',
      'commercial pilot careers',
      'flight instructor careers',
      'aviation management careers',
      'pilot salary India',
      'aviation career growth',
      'airline pilot career path',
      'aviation employment trends',
      'pilot job market',
      'aviation recruitment',
      'commercial aviation careers',
      'pilot career planning',
      'aviation industry hiring',
      'flight training careers',
      'airline career advancement',
      'aviation professional development',
      'pilot career success'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Airline Jobs',
    slug: { current: 'airline-jobs' },
    description: 'Airline pilot vacancies & progression',
    color: 'green',
    category: 'career',
    seoKeywords: [
      'airline pilot jobs India',
      'commercial airline hiring',
      'pilot job vacancies',
      'airline recruitment 2025',
      'IndiGo pilot jobs',
      'SpiceJet careers',
      'Air India pilot recruitment',
      'Vistara pilot hiring',
      'airline job opportunities',
      'pilot employment India',
      'commercial pilot positions',
      'airline crew jobs',
      'aviation job openings',
      'pilot job applications',
      'airline hiring process',
      'pilot career opportunities',
      'commercial aviation jobs',
      'airline pilot requirements',
      'aviation industry employment',
      'pilot job search India'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Training',
    slug: { current: 'training' },
    description: 'Advanced aviation study options',
    color: 'teal',
    category: 'training',
    seoKeywords: [
      'pilot training programs',
      'aviation training courses',
      'flight training India',
      'commercial pilot training',
      'aviation education',
      'pilot certification training',
      'flight school programs',
      'aviation training institutes',
      'pilot ground school',
      'flight training academy',
      'aviation skill development',
      'pilot competency training',
      'flight safety training',
      'aviation professional training',
      'pilot career training',
      'flight instruction programs',
      'aviation training standards',
      'pilot development courses',
      'flight training excellence',
      'aviation training solutions'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString()
  }
];

async function createMissingTags() {
  try {
    console.log('🚀 Creating missing tags for the blog post...');

    for (const tagData of newTags) {
      // Check if tag already exists
      const existingTag = await client.fetch(
        `*[_type == "tag" && slug.current == $slug][0]`,
        { slug: tagData.slug.current }
      );

      if (existingTag) {
        console.log(`✅ Tag already exists: ${tagData.title}`);
      } else {
        const createdTag = await client.create({
          _type: 'tag',
          ...tagData
        });
        console.log(`🆕 Created new tag: ${tagData.title} (ID: ${createdTag._id})`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('✅ All tags processed successfully!');

  } catch (error) {
    console.error('❌ Error creating tags:', error.message);
  }
}

createMissingTags();
