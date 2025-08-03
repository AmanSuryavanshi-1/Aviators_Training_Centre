#!/usr/bin/env node

/**
 * Manual cache invalidation script
 * Use this to manually clear cache when content changes aren't reflecting
 * Run with: node scripts/manual-cache-invalidation.js [type]
 */

const https = require('https');

const CACHE_URL = 'https://www.aviatorstrainingcentre.in/api/cache/invalidate';
const CACHE_TOKEN = 'atc_cache_invalidation_token_2024';

async function invalidateCache(type = 'all') {
  console.log(`🔄 Invalidating cache (type: ${type})...\n`);
  
  const payload = {
    type: type,
    token: CACHE_TOKEN
  };
  
  try {
    const response = await makeRequest(CACHE_URL, 'POST', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CACHE_TOKEN}`
    }, JSON.stringify(payload));
    
    const result = JSON.parse(response);
    console.log('✅ Cache invalidation successful:');
    console.log(`   Message: ${result.message}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log('');
    console.log('🎉 Your website should now show the latest content!');
    
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Authentication failed. Check that CACHE_INVALIDATION_TOKEN is correct.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Cannot reach the server. Check your internet connection or try again later.');
    }
    
    process.exit(1);
  }
}

function makeRequest(url, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'User-Agent': 'ATC-Cache-Invalidation/1.0',
        ...headers
      }
    };
    
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const cacheType = args[0] || 'all';

// Validate cache type
const validTypes = ['all', 'blog', 'path', 'tag'];
if (!validTypes.includes(cacheType)) {
  console.error(`❌ Invalid cache type: ${cacheType}`);
  console.log(`   Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Run the cache invalidation
if (require.main === module) {
  console.log('🚀 Manual Cache Invalidation Tool');
  console.log('==================================\n');
  
  invalidateCache(cacheType);
}

module.exports = { invalidateCache };