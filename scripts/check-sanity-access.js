#!/usr/bin/env node

console.log('🔍 Checking Sanity access and permissions...');

import { createClient } from '@sanity/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Use environment variables with fallbacks
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN || 'skG2xvgzc6a5mFY1y89cck3rniVJwLHVDN1AdyWgUspOyt9hNHnvpHZ6JDi5Uo8cKZGyJICYpgzR6CfRkayWDgbQBL3x2GtNvfU3ddLk7gye5G3J4RRD24pJ1TXNDcWmH3RlUlBHl4DHc9EkclU9gm3PVNBm1VmKwUnVjzDZU8YjsC82kqfW',
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
});

async function checkSanityAccess() {
  try {
    console.log('🔧 Configuration:');
    console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl'}`);
    console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
    console.log(`Token configured: ${!!(process.env.SANITY_API_TOKEN || 'fallback-token')}`);
    
    // Check if we can read data
    console.log('\n📖 Testing read access...');
    
    // Check existing posts
    const posts = await client.fetch(`*[_type == "post"][0...5]`);
    console.log(`✅ Found ${posts.length} existing posts`);
    
    // Check existing categories
    const categories = await client.fetch(`*[_type == "category"]`);
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => console.log(`  - ${cat.title} (${cat._id})`));
    
    // Check existing authors
    const authors = await client.fetch(`*[_type == "author"]`);
    console.log(`✅ Found ${authors.length} authors:`);
    authors.forEach(author => console.log(`  - ${author.name} (${author._id})`));
    
    // Test write access with a simple document
    console.log('\n✍️  Testing write access...');
    
    try {
      const testDoc = await client.create({
        _type: 'post',
        title: 'Test Post - Delete Me',
        slug: { current: 'test-post-delete-me' },
        excerpt: 'This is a test post to check write permissions',
        publishedAt: new Date().toISOString(),
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: 'Test content' }]
          }
        ]
      });
      
      console.log(`✅ Write access confirmed! Created test document: ${testDoc._id}`);
      
      // Clean up test document
      await client.delete(testDoc._id);
      console.log(`🧹 Cleaned up test document`);
      
      return true;
    } catch (writeError) {
      console.log(`❌ Write access failed: ${writeError.message}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking Sanity access:', error.message);
    return false;
  }
}

// Run the check
checkSanityAccess().then(hasWriteAccess => {
  if (hasWriteAccess) {
    console.log('\n🎉 All checks passed! Ready to publish blog posts.');
  } else {
    console.log('\n⚠️  Limited access detected. You may need to update token permissions.');
  }
}).catch(console.error);