/**
 * Script to create and publish 5 high-conversion aviation blog posts
 * Author: ATC Instructor
 * Focus: SEO-optimized, conversion-focused aviation content
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '3u4fnt9k',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Author profile for ATC Instructor
const authorProfile = {
  _type: 'author',
  _id: 'atc-instructor',
  name: 'ATC Instructor',
  slug: { current: 'atc-instructor' },
  role: 'Chief Flight Instructor & Aviation Career Consultant',
  credentials: 'ATPL, CFI, 12,000+ flight hours, 15+ years aviation experience',
  bio: 'ATC Instructor is a seasoned aviation professional with over 12,000 flight hours and 15 years of experience in commercial aviation. He holds an Airline Transport Pilot License (ATPL) and is a certified flight instructor specializing in DGCA exam preparation and commercial pilot training. Aman has helped over 500 students achieve their aviation dreams at Aviators Training Centre.',
  email: 'aman@aviatorstrainingcentre.com',
};

// Blog categories for intelligent CTA routing
const blogCategories = [
  {
    _type: 'category',
    _id: 'dgca-exam-preparation',
    title: 'DGCA Exam Preparation',
    slug: { current: 'dgca-exam-preparation' },
    description: 'Comprehensive guides for DGCA exam success and commercial pilot licensing',
    color: '#1E40AF',
  },
  {
    _type: 'category',
    _id: 'career-guidance',
    title: 'Career Guidance',
    slug: { current: 'career-guidance' },
    description: 'Aviation career development, professional advice and industry insights',
    color: '#059669',
  },
  {
    _type: 'category',
    _id: 'flight-training',
    title: 'Flight Training',
    slug: { current: 'flight-training' },
    description: 'Practical flight training tips and techniques for pilots and aspiring copilots',
    color: '#DC2626',
  },
  {
    _type: 'category',
    _id: 'aviation-technology',
    title: 'Aviation Technology',
    slug: { current: 'aviation-technology' },
    description: 'Latest developments in aviation technology and aircraft systems',
    color: '#7C3AED',
  },
  {
    _type: 'category',
    _id: 'industry-insights',
    title: 'Industry Insights',
    slug: { current: 'industry-insights' },
    description: 'Aviation industry trends, news, and professional insights',
    color: '#EA580C',
  },
];

async function publishBlogPosts() {
  try {
    console.log('Starting to publish 5 high-conversion aviation blog posts...');

    // First, create/update author profile
    console.log('Creating author profile...');
    await client.createOrReplace(authorProfile);
    console.log('✅ Author profile created/updated');

    // Create/update categories
    console.log('Creating blog categories...');
    for (const category of blogCategories) {
      await client.createOrReplace(category);
    }
    console.log('✅ Blog categories created/updated');

    console.log('✅ Setup completed. Blog posts will be created next...');

  } catch (error) {
    console.error('❌ Error in setup:', error);
    throw error;
  }
}

// Run the script
publishBlogPosts().catch(console.error);
