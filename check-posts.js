import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '3u4fa9kl',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN
});

async function checkPosts() {
  try {
    console.log('Checking posts in Sanity...');
    
    // Get all blog posts
    const allPosts = await client.fetch('*[_type == "blogPost"]');
    console.log(`\nTotal posts found: ${allPosts.length}`);
    
    if (allPosts.length > 0) {
      console.log('\nFirst 5 posts:');
      const firstFive = allPosts.slice(0, 5);
      firstFive.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title || 'Untitled'} (ID: ${post._id})`);
        console.log(`   Slug: ${post.slug?.current || 'No slug'}`);
        console.log(`   Created: ${post._createdAt || 'Unknown'}`);
        console.log('');
      });
      
      if (allPosts.length > 5) {
        console.log(`... and ${allPosts.length - 5} more posts`);
      }
    } else {
      console.log('\nNo blog posts found in Sanity.');
    }
    
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

checkPosts();
