#!/usr/bin/env node

/**
 * Health check script for Sanity Studio
 * Validates the studio configuration and content integrity
 */

const { createClient } = require('@sanity/client')

// Configuration
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`)
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

function logInfo(message) {
  log(`${colors.cyan}ℹ️  ${message}${colors.reset}`)
}

// Health check functions
async function checkConnection() {
  log('\n🔍 Checking Sanity connection...')
  
  try {
    const result = await client.fetch('*[_type == "sanity.imageAsset"][0]')
    logSuccess('Successfully connected to Sanity')
    return true
  } catch (error) {
    logError(`Failed to connect to Sanity: ${error.message}`)
    return false
  }
}

async function checkSchemaTypes() {
  log('\n📋 Checking schema types...')
  
  const requiredTypes = ['post', 'category', 'author', 'course']
  const results = {}
  
  for (const type of requiredTypes) {
    try {
      const count = await client.fetch(`count(*[_type == "${type}"])`)
      results[type] = count
      logSuccess(`${type}: ${count} documents`)
    } catch (error) {
      logError(`Failed to check ${type}: ${error.message}`)
      results[type] = -1
    }
  }
  
  return results
}

async function checkContentIntegrity() {
  log('\n🔍 Checking content integrity...')
  
  const checks = []
  
  // Check for posts without required fields
  try {
    const postsWithoutTitle = await client.fetch('*[_type == "post" && !defined(title)]')
    if (postsWithoutTitle.length > 0) {
      logWarning(`${postsWithoutTitle.length} posts without titles`)
      checks.push({ type: 'warning', message: `${postsWithoutTitle.length} posts missing titles` })
    } else {
      logSuccess('All posts have titles')
    }
  } catch (error) {
    logError(`Failed to check post titles: ${error.message}`)
  }
  
  // Check for posts without slugs
  try {
    const postsWithoutSlug = await client.fetch('*[_type == "post" && !defined(slug.current)]')
    if (postsWithoutSlug.length > 0) {
      logWarning(`${postsWithoutSlug.length} posts without slugs`)
      checks.push({ type: 'warning', message: `${postsWithoutSlug.length} posts missing slugs` })
    } else {
      logSuccess('All posts have slugs')
    }
  } catch (error) {
    logError(`Failed to check post slugs: ${error.message}`)
  }
  
  // Check for posts without featured images
  try {
    const postsWithoutImage = await client.fetch('*[_type == "post" && !defined(image)]')
    if (postsWithoutImage.length > 0) {
      logWarning(`${postsWithoutImage.length} posts without featured images`)
      checks.push({ type: 'warning', message: `${postsWithoutImage.length} posts missing featured images` })
    } else {
      logSuccess('All posts have featured images')
    }
  } catch (error) {
    logError(`Failed to check post images: ${error.message}`)
  }
  
  // Check for images without alt text
  try {
    const imagesWithoutAlt = await client.fetch('*[_type == "post" && defined(image) && !defined(image.alt)]')
    if (imagesWithoutAlt.length > 0) {
      logWarning(`${imagesWithoutAlt.length} featured images without alt text`)
      checks.push({ type: 'warning', message: `${imagesWithoutAlt.length} images missing alt text` })
    } else {
      logSuccess('All featured images have alt text')
    }
  } catch (error) {
    logError(`Failed to check image alt text: ${error.message}`)
  }
  
  // Check for posts without categories
  try {
    const postsWithoutCategory = await client.fetch('*[_type == "post" && !defined(category)]')
    if (postsWithoutCategory.length > 0) {
      logWarning(`${postsWithoutCategory.length} posts without categories`)
      checks.push({ type: 'warning', message: `${postsWithoutCategory.length} posts missing categories` })
    } else {
      logSuccess('All posts have categories')
    }
  } catch (error) {
    logError(`Failed to check post categories: ${error.message}`)
  }
  
  return checks
}

async function checkSEOHealth() {
  log('\n🔍 Checking SEO health...')
  
  const seoChecks = []
  
  // Check for posts without SEO titles
  try {
    const postsWithoutSEOTitle = await client.fetch('*[_type == "post" && !defined(seoTitle)]')
    if (postsWithoutSEOTitle.length > 0) {
      logWarning(`${postsWithoutSEOTitle.length} posts without SEO titles`)
      seoChecks.push({ type: 'warning', message: `${postsWithoutSEOTitle.length} posts missing SEO titles` })
    } else {
      logSuccess('All posts have SEO titles')
    }
  } catch (error) {
    logError(`Failed to check SEO titles: ${error.message}`)
  }
  
  // Check for posts without meta descriptions
  try {
    const postsWithoutMetaDesc = await client.fetch('*[_type == "post" && !defined(seoDescription)]')
    if (postsWithoutMetaDesc.length > 0) {
      logWarning(`${postsWithoutMetaDesc.length} posts without meta descriptions`)
      seoChecks.push({ type: 'warning', message: `${postsWithoutMetaDesc.length} posts missing meta descriptions` })
    } else {
      logSuccess('All posts have meta descriptions')
    }
  } catch (error) {
    logError(`Failed to check meta descriptions: ${error.message}`)
  }
  
  // Check for posts without focus keywords
  try {
    const postsWithoutKeywords = await client.fetch('*[_type == "post" && !defined(focusKeyword)]')
    if (postsWithoutKeywords.length > 0) {
      logWarning(`${postsWithoutKeywords.length} posts without focus keywords`)
      seoChecks.push({ type: 'suggestion', message: `${postsWithoutKeywords.length} posts missing focus keywords` })
    } else {
      logSuccess('All posts have focus keywords')
    }
  } catch (error) {
    logError(`Failed to check focus keywords: ${error.message}`)
  }
  
  return seoChecks
}

async function checkWorkflowStatus() {
  log('\n📊 Checking workflow status...')
  
  try {
    const workflowStats = await client.fetch(`
      {
        "draft": count(*[_type == "post" && workflowStatus == "draft"]),
        "review": count(*[_type == "post" && workflowStatus == "review"]),
        "approved": count(*[_type == "post" && workflowStatus == "approved"]),
        "published": count(*[_type == "post" && workflowStatus == "published"]),
        "archived": count(*[_type == "post" && workflowStatus == "archived"])
      }
    `)
    
    logInfo(`Draft posts: ${workflowStats.draft}`)
    logInfo(`Under review: ${workflowStats.review}`)
    logInfo(`Approved: ${workflowStats.approved}`)
    logInfo(`Published: ${workflowStats.published}`)
    logInfo(`Archived: ${workflowStats.archived}`)
    
    return workflowStats
  } catch (error) {
    logError(`Failed to check workflow status: ${error.message}`)
    return null
  }
}

async function generateHealthReport() {
  log(`\n${colors.bright}🏥 Sanity Studio Health Check Report${colors.reset}`)
  log(`${colors.cyan}Timestamp: ${new Date().toISOString()}${colors.reset}`)
  log(`${colors.cyan}Project ID: ${client.config().projectId}${colors.reset}`)
  log(`${colors.cyan}Dataset: ${client.config().dataset}${colors.reset}`)
  
  const report = {
    timestamp: new Date().toISOString(),
    projectId: client.config().projectId,
    dataset: client.config().dataset,
    checks: {},
    summary: {
      total: 0,
      passed: 0,
      warnings: 0,
      errors: 0,
    },
  }
  
  // Run all health checks
  const connectionOk = await checkConnection()
  const schemaTypes = await checkSchemaTypes()
  const contentChecks = await checkContentIntegrity()
  const seoChecks = await checkSEOHealth()
  const workflowStats = await checkWorkflowStatus()
  
  report.checks = {
    connection: connectionOk,
    schemaTypes,
    contentIntegrity: contentChecks,
    seoHealth: seoChecks,
    workflowStatus: workflowStats,
  }
  
  // Calculate summary
  report.summary.total = 1 + Object.keys(schemaTypes).length + contentChecks.length + seoChecks.length
  report.summary.passed = connectionOk ? 1 : 0
  report.summary.warnings = contentChecks.filter(c => c.type === 'warning').length + 
                           seoChecks.filter(c => c.type === 'warning').length
  report.summary.errors = connectionOk ? 0 : 1
  
  // Display summary
  log(`\n${colors.bright}📊 Health Check Summary${colors.reset}`)
  log(`${colors.green}Passed: ${report.summary.passed}${colors.reset}`)
  log(`${colors.yellow}Warnings: ${report.summary.warnings}${colors.reset}`)
  log(`${colors.red}Errors: ${report.summary.errors}${colors.reset}`)
  
  if (report.summary.errors === 0 && report.summary.warnings === 0) {
    log(`\n${colors.green}${colors.bright}🎉 All health checks passed!${colors.reset}`)
  } else if (report.summary.errors === 0) {
    log(`\n${colors.yellow}${colors.bright}⚠️  Health check completed with warnings${colors.reset}`)
  } else {
    log(`\n${colors.red}${colors.bright}❌ Health check failed with errors${colors.reset}`)
  }
  
  return report
}

// Main function
async function runHealthCheck() {
  try {
    const report = await generateHealthReport()
    
    // Save report to file
    const fs = require('fs')
    fs.writeFileSync(
      'health-check-report.json',
      JSON.stringify(report, null, 2)
    )
    
    logInfo('Health check report saved to health-check-report.json')
    
    // Exit with appropriate code
    process.exit(report.summary.errors > 0 ? 1 : 0)
    
  } catch (error) {
    logError(`Health check failed: ${error.message}`)
    process.exit(1)
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  runHealthCheck()
}

module.exports = { runHealthCheck, generateHealthReport }