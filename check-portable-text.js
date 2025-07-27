import { enhancedClient } from './lib/sanity/client.js';

async function checkPortableTextContent() {
  try {
    console.log('Fetching a sample post with rich Portable Text content...\n');
    
    const post = await enhancedClient.fetch(`
      *[_type == 'post' && defined(body) && length(body) > 3][0] {
        _id,
        title,
        slug,
        body
      }
    `);
    
    if (!post) {
      console.log('No posts found with substantial body content');
      return;
    }
    
    console.log('Post:', post.title);
    console.log('Slug:', post.slug?.current);
    console.log('Body blocks count:', post.body?.length || 0);
    console.log('\nFirst 5 body blocks:');
    
    const firstBlocks = post.body?.slice(0, 5) || [];
    firstBlocks.forEach((block, index) => {
      console.log(`\nBlock ${index + 1}:`);
      console.log('Type:', block._type);
      
      if (block._type === 'block') {
        console.log('Style:', block.style);
        console.log('Children count:', block.children?.length || 0);
        
        // Show first child to see text content and marks
        if (block.children?.[0]) {
          const child = block.children[0];
          console.log('First child text:', JSON.stringify(child.text?.substring(0, 100)));
          console.log('First child marks:', JSON.stringify(child.marks));
        }
      } else {
        console.log('Block content:', JSON.stringify(block, null, 2));
      }
    });
    
    // Check for inline marks in the content
    console.log('\n--- Analyzing marks usage ---');
    const allMarks = new Set();
    
    post.body?.forEach(block => {
      if (block._type === 'block' && block.children) {
        block.children.forEach(child => {
          if (child.marks && child.marks.length > 0) {
            child.marks.forEach(mark => allMarks.add(mark));
          }
        });
      }
    });
    
    console.log('All marks found in content:', Array.from(allMarks));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkPortableTextContent();
