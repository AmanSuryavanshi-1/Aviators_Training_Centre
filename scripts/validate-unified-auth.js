#!/usr/bin/env node

/**
 * Unified Authentication Validation Script
 * Validates that the unified Sanity Studio authentication system is properly configured
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://www.aviatorstrainingcentre.in';
const ENDPOINTS_TO_TEST = [
  '/api/sanity/cors-check',
  '/api/studio/health',
  '/api/auth/check'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
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
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateEndpoint(endpoint) {
  const url = `${SITE_URL}${endpoint}`;
  log(`\n🔍 Testing: ${endpoint}`, 'blue');
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      log(`✅ Status: ${response.statusCode} OK`, 'green');
      
      // Parse JSON response if possible
      try {
        const jsonData = JSON.parse(response.data);
        
        // Specific validations based on endpoint
        if (endpoint === '/api/sanity/cors-check') {
          const requiredOrigins = jsonData.requiredOrigins || [];
          log(`📋 Required CORS Origins: ${requiredOrigins.join(', ')}`, 'blue');
          
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
          log(`🔧 Project ID: ${config.projectId}`, 'blue');
          log(`📦 Dataset: ${config.dataset}`, 'blue');
          log(`🔑 Has Token: ${config.hasToken ? 'Yes' : 'No'}`, config.hasToken ? 'green' : 'yellow');
        }
        
        if (endpoint === '/api/auth/check') {
          const authenticated = jsonData.authenticated;
          log(`🔐 Authentication Status: ${authenticated ? 'Authenticated' : 'Not Authenticated'}`, 'blue');
        }
        
      } catch (parseError) {
        log(`⚠️ Response not JSON, but endpoint is responding`, 'yellow');
      }
      
    } else {
      log(`❌ Status: ${response.statusCode}`, 'red');
      log(`📄 Response: ${response.data.substring(0, 200)}...`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function validateFileConfiguration() {
  log(`\n🔍 Validating File Configuration`, 'blue');
  
  // Check middleware.ts
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    if (middlewareContent.includes('redirectToStudio')) {
      log(`✅ Middleware redirects to studio`, 'green');
    } else {
      log(`❌ Middleware not updated for studio redirect`, 'red');
    }
    
    if (middlewareContent.includes('simple_admin_session')) {
      log(`❌ Middleware still checks simple session`, 'red');
    } else {
      log(`✅ Simple session checks removed`, 'green');
    }
  } else {
    log(`❌ Middleware file not found`, 'red');
  }
  
  // Check sanity.config.ts
  const sanityConfigPath = path.join(process.cwd(), 'studio', 'sanity.config.ts');
  if (fs.existsSync(sanityConfigPath)) {
    const sanityConfigContent = fs.readFileSync(sanityConfigPath, 'utf8');
    
    if (sanityConfigContent.includes("basePath: '/studio'")) {
      log(`✅ Sanity Studio basePath configured`, 'green');
    } else {
      log(`❌ Sanity Studio basePath not configured`, 'red');
    }
    
    if (sanityConfigContent.includes('aviatorstrainingcentre.in')) {
      log(`✅ Production CORS origins configured`, 'green');
    } else {
      log(`❌ Production CORS origins not configured`, 'red');
    }
  } else {
    log(`❌ Sanity config file not found`, 'red');
  }
  
  // Check vercel.json
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    const vercelConfigContent = fs.readFileSync(vercelConfigPath, 'utf8');
    
    if (vercelConfigContent.includes('rewrites')) {
      log(`✅ Vercel rewrites configured`, 'green');
    } else {
      log(`❌ Vercel rewrites not configured`, 'red');
    }
    
    if (vercelConfigContent.includes('Access-Control-Allow-Credentials')) {
      log(`✅ CORS credentials configured in Vercel`, 'green');
    } else {
      log(`❌ CORS credentials not configured in Vercel`, 'red');
    }
  } else {
    log(`❌ Vercel config file not found`, 'red');
  }
}

async function validateEnvironmentVariables() {
  log(`\n🔍 Validating Environment Variables`, 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SANITY_API_VERSION',
    'NEXT_PUBLIC_SITE_URL',
    'SANITY_API_TOKEN'
  ];
  
  const removedVars = [
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: Set`, 'green');
    } else {
      log(`❌ ${varName}: Missing`, 'red');
    }
  });
  
  removedVars.forEach(varName => {
    if (process.env[varName]) {
      log(`❌ ${varName}: Should be removed`, 'red');
    } else {
      log(`✅ ${varName}: Properly removed`, 'green');
    }
  });
  
  // Check site URL
  if (process.env.NEXT_PUBLIC_SITE_URL === 'https://www.aviatorstrainingcentre.in') {
    log(`✅ Site URL configured for production`, 'green');
  } else {
    log(`⚠️ Site URL: ${process.env.NEXT_PUBLIC_SITE_URL}`, 'yellow');
  }
}

async function main() {
  log(`🚀 Unified Authentication Validation`, 'blue');
  log(`📅 ${new Date().toISOString()}`, 'blue');
  log(`🌐 Site: ${SITE_URL}`, 'blue');
  
  // Validate environment variables
  await validateEnvironmentVariables();
  
  // Validate file configuration
  await validateFileConfiguration();
  
  // Test API endpoints
  log(`\n🔍 Testing API Endpoints`, 'blue');
  for (const endpoint of ENDPOINTS_TO_TEST) {
    await validateEndpoint(endpoint);
  }
  
  // Summary
  log(`\n📋 Validation Summary`, 'blue');
  log(`✅ If all checks pass, your unified authentication system is ready`, 'green');
  log(`❌ If any checks fail, review the specific issues above`, 'red');
  log(`📖 See TESTING_UNIFIED_AUTH_FLOW.md for detailed testing procedures`, 'blue');
  log(`📖 See SANITY_CORS_SETUP_GUIDE.md for CORS configuration help`, 'blue');
  
  log(`\n🎯 Next Steps:`, 'blue');
  log(`1. Configure CORS origins in Sanity Management Console`, 'yellow');
  log(`2. Deploy all changes to production`, 'yellow');
  log(`3. Run the manual tests from TESTING_UNIFIED_AUTH_FLOW.md`, 'yellow');
  log(`4. Verify authentication flow works end-to-end`, 'yellow');
}

// Run the validation
main().catch(error => {
  log(`\n💥 Validation failed: ${error.message}`, 'red');
  process.exit(1);
});