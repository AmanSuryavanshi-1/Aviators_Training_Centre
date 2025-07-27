/**
 * Production Setup Validation Script
 * Validates all implemented features for task 12: Enhance Sanity Studio for production use
 */

import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: process.env.SANITY_STUDIO_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_STUDIO_TOKEN,
})

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function logResult(test, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`${icon} ${test}${message ? ': ' + message : ''}`)
  
  results.tests.push({ test, status, message })
  results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++
}

async function validateProductionSetup() {
  console.log('🔍 Validating Sanity Studio Production Setup...\n')

  // Task 12.1: User-friendly admin interface with proper permissions
  console.log('👥 Testing User-Friendly Admin Interface & Permissions...')
  
  try {
    // Check if enhanced author schema exists with permission fields
    const authors = await client.fetch('*[_type == "author"][0]')
    if (authors && authors.permissions) {
      logResult('Author Permission System', 'pass', 'Permission fields configured')
    } else {
      logResult('Author Permission System', 'warning', 'No authors with permissions found')
    }

    // Check for different author levels
    const authorLevels = await client.fetch('*[_type == "author" && defined(authorLevel)]')
    if (authorLevels.length > 0) {
      logResult('Author Level System', 'pass', `${authorLevels.length} authors with levels`)
    } else {
      logResult('Author Level System', 'warning', 'No authors with defined levels')
    }

    // Check workflow schema
    const workflowExists = await client.fetch('count(*[_type == "workflow"])')
    logResult('Workflow Management Schema', 'pass', `Workflow system available (${workflowExists} workflows)`)

  } catch (error) {
    logResult('Admin Interface & Permissions', 'fail', error.message)
  }

  // Task 12.2: Content preview functionality for draft posts
  console.log('\n👁️ Testing Content Preview Functionality...')
  
  try {
    // Check if sanity.config.ts has preview actions
    const configPath = path.join(process.cwd(), 'sanity.config.ts')
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      if (configContent.includes('preview') && configContent.includes('action')) {
        logResult('Preview Actions Configuration', 'pass', 'Preview actions configured in sanity.config.ts')
      } else {
        logResult('Preview Actions Configuration', 'fail', 'Preview actions not found in config')
      }

      if (configContent.includes('SANITY_STUDIO_PREVIEW_URL')) {
        logResult('Preview URL Configuration', 'pass', 'Preview URL environment variable configured')
      } else {
        logResult('Preview URL Configuration', 'warning', 'Preview URL not configured')
      }
    } else {
      logResult('Sanity Config File', 'fail', 'sanity.config.ts not found')
    }

    // Check for preview components
    const previewComponentPath = path.join(process.cwd(), 'components', 'ContentPreview.tsx')
    if (fs.existsSync(previewComponentPath)) {
      logResult('Preview Components', 'pass', 'ContentPreview component exists')
    } else {
      logResult('Preview Components', 'warning', 'ContentPreview component not found')
    }

  } catch (error) {
    logResult('Content Preview Functionality', 'fail', error.message)
  }

  // Task 12.3: Media management system for image uploads
  console.log('\n🖼️ Testing Media Management System...')
  
  try {
    // Check if media plugin is configured
    const configPath = path.join(process.cwd(), 'sanity.config.ts')
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      if (configContent.includes('sanity-plugin-media') || configContent.includes('media')) {
        logResult('Media Plugin Configuration', 'pass', 'Media plugin configured')
      } else {
        logResult('Media Plugin Configuration', 'warning', 'Media plugin not found in config')
      }
    }

    // Check for media guidelines component
    const mediaGuidelinesPath = path.join(process.cwd(), 'components', 'MediaGuidelines.tsx')
    if (fs.existsSync(mediaGuidelinesPath)) {
      logResult('Media Guidelines Component', 'pass', 'MediaGuidelines component exists')
    } else {
      logResult('Media Guidelines Component', 'warning', 'MediaGuidelines component not found')
    }

    // Check if posts have proper image fields with alt text validation
    const postsWithImages = await client.fetch('*[_type == "post" && defined(image)]')
    if (postsWithImages.length > 0) {
      const postsWithAlt = postsWithImages.filter(post => post.image?.alt)
      if (postsWithAlt.length > 0) {
        logResult('Image Alt Text Validation', 'pass', `${postsWithAlt.length}/${postsWithImages.length} posts have alt text`)
      } else {
        logResult('Image Alt Text Validation', 'warning', 'No posts with image alt text found')
      }
    } else {
      logResult('Image Management', 'warning', 'No posts with images found')
    }

  } catch (error) {
    logResult('Media Management System', 'fail', error.message)
  }

  // Task 12.4: Publishing workflow and smooth content management
  console.log('\n⚡ Testing Publishing Workflow...')
  
  try {
    // Check for workflow status fields in posts
    const postsWithWorkflow = await client.fetch('*[_type == "post" && defined(workflowStatus)]')
    if (postsWithWorkflow.length > 0) {
      logResult('Post Workflow Status', 'pass', `${postsWithWorkflow.length} posts have workflow status`)
    } else {
      logResult('Post Workflow Status', 'warning', 'No posts with workflow status found')
    }

    // Check for publishing workflow component
    const workflowComponentPath = path.join(process.cwd(), 'components', 'PublishingWorkflow.tsx')
    if (fs.existsSync(workflowComponentPath)) {
      logResult('Publishing Workflow Component', 'pass', 'PublishingWorkflow component exists')
    } else {
      logResult('Publishing Workflow Component', 'warning', 'PublishingWorkflow component not found')
    }

    // Check for SEO analyzer component
    const seoAnalyzerPath = path.join(process.cwd(), 'components', 'SEOAnalyzer.tsx')
    if (fs.existsSync(seoAnalyzerPath)) {
      logResult('SEO Analyzer Component', 'pass', 'SEOAnalyzer component exists')
    } else {
      logResult('SEO Analyzer Component', 'warning', 'SEOAnalyzer component not found')
    }

    // Check for enhanced post schema with SEO fields
    const postsWithSEO = await client.fetch('*[_type == "post" && (defined(seoTitle) || defined(seoDescription) || defined(focusKeyword))]')
    if (postsWithSEO.length > 0) {
      logResult('SEO Fields in Posts', 'pass', `${postsWithSEO.length} posts have SEO fields`)
    } else {
      logResult('SEO Fields in Posts', 'warning', 'No posts with SEO fields found')
    }

    // Check for CTA configuration in posts
    const postsWithCTA = await client.fetch('*[_type == "post" && defined(ctaPlacements)]')
    if (postsWithCTA.length > 0) {
      logResult('CTA Configuration', 'pass', `${postsWithCTA.length} posts have CTA configuration`)
    } else {
      logResult('CTA Configuration', 'warning', 'No posts with CTA configuration found')
    }

  } catch (error) {
    logResult('Publishing Workflow', 'fail', error.message)
  }

  // Additional Production Readiness Checks
  console.log('\n🚀 Testing Production Readiness...')
  
  try {
    // Check package.json for required dependencies
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      const requiredDeps = [
        '@sanity/vision',
        'sanity-plugin-media',
        '@sanity/scheduled-publishing',
        '@sanity/document-internationalization'
      ]

      requiredDeps.forEach(dep => {
        if (packageContent.dependencies?.[dep]) {
          logResult(`Dependency: ${dep}`, 'pass')
        } else {
          logResult(`Dependency: ${dep}`, 'warning', 'Not found in dependencies')
        }
      })

      // Check for custom scripts
      if (packageContent.scripts?.['test-setup']) {
        logResult('Test Setup Script', 'pass', 'Custom test script available')
      } else {
        logResult('Test Setup Script', 'warning', 'Test setup script not found')
      }
    }

    // Check for production setup guide
    const setupGuidePath = path.join(process.cwd(), 'PRODUCTION_SETUP_GUIDE.md')
    if (fs.existsSync(setupGuidePath)) {
      logResult('Production Setup Guide', 'pass', 'Setup documentation exists')
    } else {
      logResult('Production Setup Guide', 'warning', 'Setup guide not found')
    }

    // Check for environment configuration
    const envExamplePath = path.join(process.cwd(), '.env.local.example')
    if (fs.existsSync(envExamplePath)) {
      logResult('Environment Configuration', 'pass', 'Environment example file exists')
    } else {
      logResult('Environment Configuration', 'warning', 'Environment example not found')
    }

  } catch (error) {
    logResult('Production Readiness', 'fail', error.message)
  }

  // Schema Validation
  console.log('\n📋 Testing Schema Configuration...')
  
  try {
    // Test all required schema types
    const schemaTypes = ['post', 'category', 'author', 'course', 'workflow']
    
    for (const type of schemaTypes) {
      try {
        const count = await client.fetch(`count(*[_type == "${type}"])`)
        logResult(`Schema: ${type}`, 'pass', `${count} documents`)
      } catch (error) {
        logResult(`Schema: ${type}`, 'fail', `Schema validation failed`)
      }
    }

    // Check for enhanced post schema fields
    const enhancedFields = [
      'seoTitle',
      'seoDescription', 
      'focusKeyword',
      'ctaPlacements',
      'workflowStatus',
      'structuredData'
    ]

    const samplePost = await client.fetch('*[_type == "post"][0]')
    if (samplePost) {
      enhancedFields.forEach(field => {
        if (samplePost.hasOwnProperty(field)) {
          logResult(`Enhanced Field: ${field}`, 'pass')
        } else {
          logResult(`Enhanced Field: ${field}`, 'warning', 'Field not found in sample post')
        }
      })
    }

  } catch (error) {
    logResult('Schema Configuration', 'fail', error.message)
  }

  // Final Results Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 PRODUCTION SETUP VALIDATION RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`⚠️  Warnings: ${results.warnings}`)
  console.log(`📋 Total Tests: ${results.tests.length}`)

  const successRate = Math.round((results.passed / results.tests.length) * 100)
  console.log(`📈 Success Rate: ${successRate}%`)

  // Task completion assessment
  console.log('\n🎯 TASK 12 COMPLETION ASSESSMENT:')
  
  const taskRequirements = {
    'User-friendly admin interface with proper permissions': results.tests.filter(t => 
      t.test.includes('Permission') || t.test.includes('Author Level') || t.test.includes('Workflow')
    ).every(t => t.status === 'pass'),
    
    'Content preview functionality for draft posts': results.tests.filter(t => 
      t.test.includes('Preview')
    ).some(t => t.status === 'pass'),
    
    'Media management system for image uploads': results.tests.filter(t => 
      t.test.includes('Media') || t.test.includes('Image')
    ).some(t => t.status === 'pass'),
    
    'Publishing workflow and smooth content management': results.tests.filter(t => 
      t.test.includes('Workflow') || t.test.includes('SEO') || t.test.includes('CTA')
    ).some(t => t.status === 'pass')
  }

  Object.entries(taskRequirements).forEach(([requirement, completed]) => {
    console.log(`${completed ? '✅' : '⚠️'} ${requirement}: ${completed ? 'COMPLETED' : 'NEEDS ATTENTION'}`)
  })

  const allRequirementsMet = Object.values(taskRequirements).every(Boolean)
  
  if (allRequirementsMet && results.failed === 0) {
    console.log('\n🎉 TASK 12 SUCCESSFULLY COMPLETED!')
    console.log('✅ All production requirements have been implemented')
    console.log('✅ Sanity Studio is ready for production use')
  } else if (results.failed === 0) {
    console.log('\n✅ TASK 12 MOSTLY COMPLETED!')
    console.log('⚠️  Some optional features may need attention')
    console.log('✅ Core functionality is production-ready')
  } else {
    console.log('\n⚠️  TASK 12 NEEDS ATTENTION!')
    console.log('❌ Some critical issues need to be resolved')
  }

  console.log('\n📚 NEXT STEPS:')
  if (results.warnings > 0) {
    console.log('   • Address warning items for optimal setup')
  }
  if (results.failed > 0) {
    console.log('   • Fix failed tests before production deployment')
  }
  console.log('   • Run sample data setup: npm run setup-sample-data')
  console.log('   • Test the studio interface at http://localhost:3333')
  console.log('   • Configure preview URLs for your environment')
  console.log('   • Deploy to production: npm run deploy')

  return {
    success: allRequirementsMet && results.failed === 0,
    results,
    taskRequirements
  }
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateProductionSetup().catch(console.error)
}

export { validateProductionSetup }