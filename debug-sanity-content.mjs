import { createClient } from "next-sanity";
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function debugSanityContent() {
  try {
    console.log('🔍 Fetching blog posts from Sanity...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl");
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET || "production");
    console.log('Token configured:', !!process.env.SANITY_API_TOKEN);
    
    // First, let's see what posts we have
    const posts = await client.fetch(`
      *[_type == "post"] | order(_createdAt desc) [0...5] {
        _id,
        title,
        slug,
        _createdAt,
        body
      }
    `);
    
    console.log(`\n📊 Found ${posts.length} posts:`);
    
    for (const post of posts) {
      console.log(`\n📝 Post: "${post.title}"`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Slug: ${post.slug?.current || 'N/A'}`);
      console.log(`   Created: ${post._createdAt}`);
      
      if (post.body) {
        console.log(`   Body type: ${typeof post.body}`);
        console.log(`   Body is array: ${Array.isArray(post.body)}`);
        
        if (Array.isArray(post.body)) {
          console.log(`   Body length: ${post.body.length} blocks`);
          
          // Show first few blocks
          post.body.slice(0, 3).forEach((block, index) => {
            console.log(`   Block ${index + 1}:`, JSON.stringify(block, null, 2));
          });
          
          if (post.body.length > 3) {
            console.log(`   ... and ${post.body.length - 3} more blocks`);
          }
        } else {
          console.log(`   Body content: ${JSON.stringify(post.body, null, 2)}`);
        }
      } else {
        console.log(`   ❌ No body content found!`);
      }
      
      console.log('   ' + '-'.repeat(50));
    }
    
    // Let's also check if there are any posts without body content
    const postsWithoutBody = await client.fetch(`
      *[_type == "post" && !defined(body)] {
        _id,
        title,
        slug
      }
    `);
    
    if (postsWithoutBody.length > 0) {
      console.log(`\n⚠️  Found ${postsWithoutBody.length} posts without body content:`);
      postsWithoutBody.forEach(post => {
        console.log(`   - "${post.title}" (${post._id})`);
      });
    }
    
    // Check for posts with empty body arrays
    const postsWithEmptyBody = await client.fetch(`
      *[_type == "post" && defined(body) && length(body) == 0] {
        _id,
        title,
        slug
      }
    `);
    
    if (postsWithEmptyBody.length > 0) {
      console.log(`\n⚠️  Found ${postsWithEmptyBody.length} posts with empty body arrays:`);
      postsWithEmptyBody.forEach(post => {
        console.log(`   - "${post.title}" (${post._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching from Sanity:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('permission')) {
      console.log('\n💡 This might be a permissions issue. Check that your SANITY_API_TOKEN has read permissions.');
    }
    
    if (error.message.includes('project not found')) {
      console.log('\n💡 Check that your NEXT_PUBLIC_SANITY_PROJECT_ID is correct.');
    }
  }
}

// Run the debug function
debugSanityContent();
