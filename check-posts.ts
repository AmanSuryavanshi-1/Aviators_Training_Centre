import { client } from './lib/sanity/client';

async function checkPosts() {
  try {
    console.log('Checking posts in Sanity...\n');
    
    const posts = await client.fetch(`*[_type == "post"] | order(_createdAt desc) [0...10] {
      _id, 
      title, 
      slug, 
      publishedAt, 
      body,
      _createdAt
    }`);
    
    console.log(`Found ${posts.length} posts in Sanity:`);
    console.log('='.repeat(50));
    
    if (posts.length === 0) {
      console.log('No posts found in Sanity database.');
      console.log('You may need to upload sample posts using:');
      console.log('npm run cleanup upload-sample');
      return;
    }
    
    posts.forEach((post: any, index: number) => {
      console.log(`${index + 1}. Title: ${post.title}`);
      console.log(`   Slug: ${post.slug?.current || 'No slug'}`);
      console.log(`   Published: ${post.publishedAt || 'Not published'}`);
      console.log(`   Created: ${post._createdAt || 'Unknown'}`);
      console.log(`   Body blocks: ${post.body?.length || 0}`);
      
      if (post.body && post.body.length > 0) {
        const firstBlock = post.body[0];
        if (firstBlock.children && firstBlock.children[0]) {
          const preview = firstBlock.children[0].text?.substring(0, 100) || 'No text content';
          console.log(`   Preview: ${preview}...`);
        }
      } else {
        console.log('   Preview: No content found');
      }
      console.log('');
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error.message);
    if (error.message.includes('Insufficient permissions')) {
      console.log('\nPermission issue detected. Please check:');
      console.log('1. Your SANITY_API_TOKEN has Reader permissions');
      console.log('2. The token is for the correct project (3u4fa9kl)');
      console.log('3. The token is for the correct dataset (production)');
    }
    if (error.message.includes('Session does not match')) {
      console.log('\nAuthentication issue detected. Please check:');
      console.log('1. Your API token is valid and not expired');
      console.log('2. The token belongs to the correct Sanity project');
      console.log('3. Try regenerating the API token in Sanity management console');
    }
  }
}

checkPosts().catch(console.error);
