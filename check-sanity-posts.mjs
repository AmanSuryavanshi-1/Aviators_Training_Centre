import { enhancedClient } from './lib/sanity/client.js';

async function checkPosts() {
  try {
    console.log('Fetching sample Sanity posts...');
    
    const posts = await enhancedClient.fetch(`*[_type == "post"][0...3]{ 
      _id, 
      title, 
      slug, 
      body,
      "bodyLength": length(body)
    }`);
    
    console.log(`Found ${posts.length} posts:`);
    
    posts.forEach((post, index) => {
      console.log(`\n--- Post ${index + 1}: "${post.title}"`);
      console.log('ID:', post._id);
      console.log('Slug:', post.slug?.current || 'No slug');
      console.log('Body type:', typeof post.body);
      console.log('Body is array:', Array.isArray(post.body));
      console.log('Body length:', post.bodyLength || 0);
      
      if (post.body && Array.isArray(post.body) && post.body.length > 0) {
        console.log('First body block type:', post.body[0]._type);
        console.log('Body preview:', JSON.stringify(post.body, null, 2).substring(0, 300) + '...');
      } else {
        console.log('Body is empty or invalid');
      }
    });
    
  } catch (error) {
    console.error('Error fetching posts:', error.message);
  }
}

checkPosts();
