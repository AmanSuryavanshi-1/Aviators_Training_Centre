const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkRecentPosts() {
  try {
    const posts = await client.fetch(`
      *[_type == "post"] | order(_createdAt desc)[0...10] {
        _id,
        title,
        _createdAt,
        publishedAt,
        isDiagnosticTest,
        isTestPost,
        slug
      }
    `);
    
    console.log(`Found ${posts.length} posts:`);
    posts.forEach((post, index) => {
      const isTest = post.isDiagnosticTest || post.isTestPost || false;
      const testFlag = isTest ? ' [TEST]' : '';
      console.log(`${index + 1}. ${post.title}${testFlag}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Slug: ${post.slug?.current || 'No slug'}`);
      console.log(`   Created: ${post._createdAt}`);
      console.log(`   Published: ${post.publishedAt || 'Not published'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRecentPosts();