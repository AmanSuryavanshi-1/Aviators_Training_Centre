import { client } from './lib/sanity/client.js';

async function checkPost() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "dgca-cpl-complete-guide-2024"][0]{
      title, 
      slug, 
      body,
      excerpt,
      _createdAt
    }`);
    
    console.log('Post title:', post?.title);
    console.log('Slug:', post?.slug?.current);
    console.log('Created:', post?._createdAt);
    console.log('Excerpt:', post?.excerpt);
    console.log('Body blocks count:', post?.body?.length || 0);
    
    if (post?.body && post.body.length > 0) {
      console.log('First few body blocks:');
      post.body.slice(0, 3).forEach((block, i) => {
        console.log(`Block ${i + 1}:`, JSON.stringify(block, null, 2));
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPost();
