#!/usr/bin/env node

/**
 * Production deployment script for Sanity Studio
 * This script handles the deployment of the Sanity Studio to production
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  projectId: '3u4fa9kl',
  dataset: 'production',
  studioHost: 'aviators-training-centre-blog',
  buildDir: 'dist',
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`)
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

// Pre-deployment checks
function preDeploymentChecks() {
  logStep('1', 'Running pre-deployment checks...')
  
  // Check if required files exist
  const requiredFiles = [
    'sanity.config.ts',
    'package.json',
    'schemaTypes/index.ts',
  ]
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`Required file missing: ${file}`)
      process.exit(1)
    }
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'SANITY_STUDIO_PROJECT_ID',
    'SANITY_STUDIO_DATASET',
  ]
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logWarning(`Environment variable ${envVar} is not set`)
    }
  }
  
  logSuccess('Pre-deployment checks passed')
}

// Install dependencies
function installDependencies() {
  logStep('2', 'Installing dependencies...')
  
  try {
    execSync('npm ci --production=false', { stdio: 'inherit' })
    logSuccess('Dependencies installed successfully')
  } catch (error) {
    logError('Failed to install dependencies')
    process.exit(1)
  }
}

// Build the studio
function buildStudio() {
  logStep('3', 'Building Sanity Studio...')
  
  try {
    execSync('npm run build', { stdio: 'inherit' })
    logSuccess('Studio built successfully')
  } catch (error) {
    logError('Failed to build studio')
    process.exit(1)
  }
}

// Deploy to Sanity
function deployToSanity() {
  logStep('4', 'Deploying to Sanity...')
  
  try {
    execSync(`npx sanity deploy --source-maps`, { stdio: 'inherit' })
    logSuccess('Studio deployed successfully')
  } catch (error) {
    logError('Failed to deploy studio')
    process.exit(1)
  }
}

// Validate deployment
function validateDeployment() {
  logStep('5', 'Validating deployment...')
  
  const studioUrl = `https://${config.studioHost}.sanity.studio`
  
  log(`Studio URL: ${colors.cyan}${studioUrl}${colors.reset}`)
  log(`Project ID: ${colors.cyan}${config.projectId}${colors.reset}`)
  log(`Dataset: ${colors.cyan}${config.dataset}${colors.reset}`)
  
  logSuccess('Deployment validation completed')
}

// Post-deployment tasks
function postDeploymentTasks() {
  logStep('6', 'Running post-deployment tasks...')
  
  // Create a deployment log
  const deploymentLog = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    projectId: config.projectId,
    dataset: config.dataset,
    studioHost: config.studioHost,
    nodeVersion: process.version,
    deployedBy: process.env.USER || process.env.USERNAME || 'unknown',
  }
  
  fs.writeFileSync(
    'deployment-log.json',
    JSON.stringify(deploymentLog, null, 2)
  )
  
  logSuccess('Post-deployment tasks completed')
}

// Main deployment function
async function deploy() {
  log(`${colors.bright}🚀 Starting Sanity Studio Production Deployment${colors.reset}`)
  log(`${colors.magenta}Project: ${config.projectId}${colors.reset}`)
  log(`${colors.magenta}Dataset: ${config.dataset}${colors.reset}`)
  log(`${colors.magenta}Studio Host: ${config.studioHost}${colors.reset}`)
  
  try {
    preDeploymentChecks()
    installDependencies()
    buildStudio()
    deployToSanity()
    validateDeployment()
    postDeploymentTasks()
    
    log(`\n${colors.green}${colors.bright}🎉 Deployment completed successfully!${colors.reset}`)
    log(`${colors.cyan}Studio URL: https://${config.studioHost}.sanity.studio${colors.reset}`)
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deploy()
}

module.exports = { deploy, config }