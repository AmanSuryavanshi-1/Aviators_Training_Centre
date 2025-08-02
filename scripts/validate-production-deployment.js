#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that the unified Sanity Studio authentication system is working in production
 */

const https = require('https');

// Configuration
const SITE_URL = 'https://www.aviatorstrainingcentre.in';
const ENDPOINTS_TO_TEST = [
  '/api/sanity/cors-check',
  '/api/studio/health',
  '/api/auth/check',
  '/studio', // Test studio accessibility
  '/admin'   // Test admin accessibility
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      }
    };

    const request = https.request(url, requestOptions, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.end();
  });
}

async function validateEndpoint(endpoint) {
  const url = `${SITE_URL}${endpoint}`;
  log(`\n🔍 Testing: ${endpoint}`, 'blue');
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      log(`✅ Status: ${response.statusCode} ${getStatusText(response.statusCode)}`, 'green');
      
      // Check for specific endpoint validations
      if (endpoint === '/studio') {
        if (response.data.includes('Sanity Studio') || response.data.includes('sanity')) {
          log(`✅ Studio content detected`, 'green');
        } else {
          log(`⚠️ Studio content not clearly detected`, 'yellow');
        }
      }
      
      if (endpoint === '/admin') {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const location = response.headers.location;
          if (location && location.includes('/studio')) {
            log(`✅ Admin redirects to studio (unified auth working)`, 'green');
          } else {
            log(`⚠️ Admin redirect location: ${location}`, 'yellow');
          }
        } else if (response.data.includes('Admin Dashboard')) {
          log(`✅ Admin dashboard accessible`, 'green');
        }
      }
      
      // Parse JSON response if possible
      if (endpoint.startsWith('/api/')) {
        try {
          const jsonData = JSON.parse(response.data);
          
          if (endpoint === '/api/sanity/cors-check') {
            const requiredOrigins = jsonData.requiredOrigins || [];
            log(`📋 Required CORS Origins: ${requiredOrigins.join(', ')}`, 'cyan');
            
            if (requiredOrigins.includes('https://www.aviatorstrainingcentre.in')) {
              log(`✅ Production origin configured`, 'green');
            } else {
              log(`❌ Production origin missing`, 'red');
            }
          }
          
          if (endpoint === '/api/studio/health') {
            const status = jsonData.status;
            const config = jsonData.config || {};
            
            log(`📊 Studio Status: ${status}`, status === 'healthy' ? 'green' : 'red');
            log(`🔧 Project ID: ${config.projectId}`, 'cyan');
            log(`📦 Dataset: ${config.dataset}`, 'cyan');
            log(`🔑 Has Token: ${config.hasToken ? 'Yes' : 'No'}`, config.hasToken ? 'green' : 'yellow');
            
            if (config.projectId === '3u4fa9kl' && config.dataset === 'production') {
              log(`✅ Correct project configuration`, 'green');
            } else {
              log(`❌ Incorrect project configuration`, 'red');
            }
          }
          
        } catch (parseError) {
          log(`⚠️ Response not JSON, but endpoint is responding`, 'yellow');
        }
      }
      
    } else if (response.statusCode === 302 || response.statusCode === 301) {
      const location = response.headers.location;
      log(`🔄 Redirect (${response.statusCode}): ${location}`, 'yellow');
      
      if (endpoint === '/admin' && location && location.includes('/studio')) {
        log(`✅ Admin correctly redirects to studio for authentication`, 'green');
      }
      
    } else {
      log(`❌ Status: ${response.statusCode} ${getStatusText(response.statusCode)}`, 'red');
      if (response.data.length < 500) {
        log(`📄 Response: ${response.data.substring(0, 200)}...`, 'yellow');
      }
    }
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

function getStatusText(statusCode) {
  const statusTexts = {
    200: 'OK',
    301: 'Moved Permanently',
    302: 'Found',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
  };
  return statusTexts[statusCode] || 'Unknown';
}

async function validateCORSConfiguration() {
  log(`\n🔍 Validating CORS Configuration`, 'blue');
  
  try {
    // Test CORS preflight request
    const corsUrl = `${SITE_URL}/api/sanity/cors-check`;
    const response = await makeRequest(corsUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.aviatorstrainingcentre.in',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = response.headers;
    
    if (corsHeaders['access-control-allow-origin']) {
      log(`✅ CORS Origin Header: ${corsHeaders['access-control-allow-origin']}`, 'green');
    } else {
      log(`❌ CORS Origin Header missing`, 'red');
    }
    
    if (corsHeaders['access-control-allow-credentials'] === 'true') {
      log(`✅ CORS Credentials enabled`, 'green');
    } else {
      log(`❌ CORS Credentials not enabled`, 'red');
    }
    
  } catch (error) {
    log(`❌ CORS validation failed: ${error.message}`, 'red');
  }
}

async function validateStudioDeployment() {
  log(`\n🔍 Validating Studio Deployment`, 'blue');
  
  try {
    // Check if studio is accessible
    const studioUrl = `${SITE_URL}/studio`;
    const response = await makeRequest(studioUrl);
    
    if (response.statusCode === 200) {
      log(`✅ Studio is accessible at /studio`, 'green');
      
      // Check for Sanity Studio indicators
      const content = response.data.toLowerCase();
      if (content.includes('sanity') || content.includes('studio')) {
        log(`✅ Studio content detected`, 'green');
      } else {
        log(`⚠️ Studio content not clearly detected`, 'yellow');
      }
      
    } else {
      log(`❌ Studio not accessible: ${response.statusCode}`, 'red');
    }
    
  } catch (error) {
    log(`❌ Studio validation failed: ${error.message}`, 'red');
  }
}

async function validateUnifiedAuth() {
  log(`\n🔍 Validating Unified Authentication`, 'blue');
  
  try {
    // Test admin access (should redirect to studio if not authenticated)
    const adminUrl = `${SITE_URL}/admin`;
    const response = await makeRequest(adminUrl);
    
    if (response.statusCode === 302 || response.statusCode === 301) {
      const location = response.headers.location;
      if (location && location.includes('/studio')) {
        log(`✅ Unified auth working: Admin redirects to studio`, 'green');
      } else {
        log(`⚠️ Admin redirects to: ${location}`, 'yellow');
      }
    } else if (response.statusCode === 200) {
      if (response.data.includes('Admin Dashboard')) {
        log(`✅ Admin dashboard accessible (user might be authenticated)`, 'green');
      } else {
        log(`⚠️ Admin response unclear`, 'yellow');
      }
    } else {
      log(`❌ Admin access failed: ${response.statusCode}`, 'red');
    }
    
  } catch (error) {
    log(`❌ Auth validation failed: ${error.message}`, 'red');
  }
}

async function main() {
  log(`🚀 Production Deployment Validation`, 'blue');
  log(`📅 ${new Date().toISOString()}`, 'blue');
  log(`🌐 Site: ${SITE_URL}`, 'blue');
  log(`🎯 Testing unified Sanity Studio authentication system`, 'cyan');
  
  // Test all endpoints
  log(`\n📡 Testing API Endpoints`, 'blue');
  for (const endpoint of ENDPOINTS_TO_TEST) {
    await validateEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  // Additional validations
  await validateCORSConfiguration();
  await validateStudioDeployment();
  await validateUnifiedAuth();
  
  // Summary and next steps
  log(`\n📋 Validation Summary`, 'blue');
  log(`✅ If all checks pass, your unified authentication system is working`, 'green');
  log(`❌ If any checks fail, review the specific issues above`, 'red');
  
  log(`\n🎯 Manual Testing Steps:`, 'blue');
  log(`1. Open ${SITE_URL}/admin in incognito browser`, 'cyan');
  log(`2. Should redirect to /studio for authentication`, 'cyan');
  log(`3. Complete Sanity Studio authentication`, 'cyan');
  log(`4. Should redirect back to admin dashboard`, 'cyan');
  log(`5. Navigate between /admin and /studio seamlessly`, 'cyan');
  
  log(`\n📚 Documentation:`, 'blue');
  log(`📖 See TESTING_UNIFIED_AUTH_FLOW.md for detailed testing`, 'cyan');
  log(`📖 See SANITY_CORS_SETUP_GUIDE.md for CORS configuration`, 'cyan');
  
  log(`\n🎉 Deployment validation complete!`, 'green');
}

// Run the validation
main().catch(error => {
  log(`\n💥 Validation failed: ${error.message}`, 'red');
  process.exit(1);
});