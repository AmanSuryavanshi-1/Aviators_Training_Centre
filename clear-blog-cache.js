const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Function to make API request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function clearCacheAndCheck() {
  console.log('🔄 Starting blog cache refresh...\n');
  
  // First, check if we can fetch blogs from Sanity directly
  console.log('1. Checking Sanity database...');
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl';
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const token = process.env.SANITY_API_TOKEN;
    
    if (!token) {
      console.error('❌ SANITY_API_TOKEN not found in environment variables');
      return;
    }
    
    const sanityOptions = {
      hostname: `${projectId}.api.sanity.io`,
      path: `/v1/data/query/${dataset}?query=*[_type == "post"]{title, slug, _id, publishedAt}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const sanityResult = await makeRequest(sanityOptions);
    console.log(`✅ Found ${sanityResult.result?.length || 0} posts in Sanity database`);
    
    if (sanityResult.result?.length > 0) {
      console.log('📝 Blog posts in database:');
      sanityResult.result.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title || 'Untitled'} (${post.slug?.current || 'no-slug'})`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking Sanity:', error.message);
  }
  
  // Test local API
  console.log('2. Testing local blog API...');
  const localUrl = 'localhost:3000';
  
  try {
    // Check if dev server is running
    const healthCheck = {
      hostname: localUrl.split(':')[0],
      port: localUrl.split(':')[1] || '3000',
      path: '/api/blogs',
      method: 'GET',
      timeout: 5000
    };
    
    const localResult = await makeRequest(healthCheck);
    console.log(`✅ Local API returned ${localResult.blogs?.length || localResult.count || 0} blogs`);
    
    if (localResult.isEmpty) {
      console.log('⚠️  Local API returned empty result - this indicates a configuration issue');
    } else if (localResult.blogs?.length > 0) {
      console.log('📝 Blogs from local API:');
      localResult.blogs.slice(0, 3).forEach((blog, index) => {
        console.log(`   ${index + 1}. ${blog.title || 'Untitled'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Local dev server not running or API error:', error.message);
    console.log('💡 Start your dev server with: npm run dev');
  }
  
  console.log('\n🔧 Next steps for production:');
  console.log('1. Deploy your latest changes to production');
  console.log('2. Check production environment variables match your local .env.local');
  console.log('3. Clear production cache using: POST /api/blog/cache/invalidate');
  console.log('4. Verify blogs appear on your production site');
  
  console.log('\n📋 Production deployment checklist:');
  console.log(`✓ NEXT_PUBLIC_SANITY_PROJECT_ID=${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl'}`);
  console.log(`✓ NEXT_PUBLIC_SANITY_DATASET=${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
  console.log(`✓ SANITY_API_TOKEN=${process.env.SANITY_API_TOKEN ? 'configured' : 'MISSING'} (with Editor permissions)`);
  console.log('✓ Deploy latest code');
  console.log('✓ Clear production cache');
}

clearCacheAndCheck().catch(console.error);
