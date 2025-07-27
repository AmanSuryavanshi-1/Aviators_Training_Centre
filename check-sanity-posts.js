import { sanityClient } from './lib/sanity/client.js';

async function checkPosts() {
  try {
    console.log('Checking blog posts in Sanity...');
    
    const posts = await sanityClient.fetch('*[_type == "post"]');
    
    console.log(`\nFound ${posts.length} posts in Sanity:`);
    
    if (posts.length === 0) {
      console.log('No posts found in Sanity database.');
    } else {
      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. "${post.title}" (ID: ${post._id})`);
        console.log(`   Slug: ${post.slug?.current || 'No slug'}`);
        console.log(`   Published: ${post.publishedAt || 'Not set'}`);
        console.log(`   Body content: ${post.body ? `${post.body.length} blocks` : 'No body content'}`);
        
        if (post.body && post.body.length > 0) {
          // Check first block content
          const firstBlock = post.body[0];
          if (firstBlock._type === 'block' && firstBlock.children?.[0]?.text) {
            const preview = firstBlock.children[0].text.substring(0, 100);
            console.log(`   Content preview: "${preview}${preview.length === 100 ? '...' : ''}"`);
          }
        }
      });
    }
    
    console.log('\nDone checking posts.');
  } catch (error) {
    console.error('Error checking posts:', error.message);
  }
}

checkPosts();
