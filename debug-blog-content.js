import { enhancedClient } from './lib/sanity/client.ts';

async function debugBlogContent() {
  try {
    console.log('🔍 Fetching sample blog post...');
    
    const post = await enhancedClient.fetch(`
      *[_type == "post"][0] {
        _id,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        category->{title, slug},
        author->{name, slug},
        image {asset->, alt}
      }
    `);
    
    if (!post) {
      console.log('❌ No posts found in Sanity');
      return;
    }
    
    console.log('✅ Sample post structure:');
    console.log('Title:', post.title);
    console.log('Slug:', post.slug?.current);
    console.log('Body type:', typeof post.body);
    console.log('Body is array:', Array.isArray(post.body));
    console.log('Body length:', post.body?.length || 0);
    
    if (post.body && post.body.length > 0) {
      console.log('\n📝 First few body blocks:');
      post.body.slice(0, 3).forEach((block, index) => {
        console.log(`Block ${index + 1}:`, JSON.stringify(block, null, 2));
      });
    } else {
      console.log('⚠️ No body content found!');
    }
    
    // Check all posts
    const allPosts = await enhancedClient.fetch(`
      *[_type == "post"] {
        _id,
        title,
        "hasBody": defined(body),
        "bodyLength": length(body)
      }
    `);
    
    console.log('\n📊 All posts body status:');
    allPosts.forEach(p => {
      console.log(`- ${p.title}: hasBody=${p.hasBody}, length=${p.bodyLength || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugBlogContent();