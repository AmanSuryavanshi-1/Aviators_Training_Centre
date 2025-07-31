#!/usr/bin/env tsx

/**
 * Production Configuration Validation Script
 * Validates all production environment variables and configurations
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'

interface ValidationResult {
  component: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

class ProductionConfigValidator {
  private results: ValidationResult[] = []
  private env: Record<string, string> = {}

  constructor() {
    this.loadEnvironmentVariables()
  }

  private loadEnvironmentVariables(): void {
    // Load from process.env and .env files
    this.env = { ...process.env }

    // Try to load from .env.production if it exists
    const envProdPath = path.join(process.cwd(), '.env.production')
    if (fs.existsSync(envProdPath)) {
      const envContent = fs.readFileSync(envProdPath, 'utf-8')
      const lines = envContent.split('\n')
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '')
            this.env[key] = value
          }
        }
      }
    }
  }

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string): void {
    this.results.push({ component, status, message, details })
  }

  private validateRequiredEnvVar(varName: string, component: string): boolean {
    if (!this.env[varName]) {
      this.addResult(component, 'fail', `Missing required environment variable: ${varName}`)
      return false
    }
    return true
  }

  private validateUrl(url: string, component: string, varName: string): boolean {
    try {
      new URL(url)
      this.addResult(component, 'pass', `Valid URL format for ${varName}`)
      return true
    } catch {
      this.addResult(component, 'fail', `Invalid URL format for ${varName}: ${url}`)
      return false
    }
  }

  private validateEmail(email: string, component: string, varName: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email)) {
      this.addResult(component, 'pass', `Valid email format for ${varName}`)
      return true
    } else {
      this.addResult(component, 'fail', `Invalid email format for ${varName}: ${email}`)
      return false
    }
  }

  private async validateSanityConfiguration(): Promise<void> {
    console.log('🔍 Validating Sanity configuration...')

    const component = 'Sanity CMS'
    
    // Check required variables
    const projectId = this.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const apiToken = this.env.SANITY_API_TOKEN
    const dataset = this.env.NEXT_PUBLIC_SANITY_DATASET
    const apiVersion = this.env.NEXT_PUBLIC_SANITY_API_VERSION

    if (!this.validateRequiredEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID', component)) return
    if (!this.validateRequiredEnvVar('SANITY_API_TOKEN', component)) return
    if (!this.validateRequiredEnvVar('NEXT_PUBLIC_SANITY_DATASET', component)) return
    if (!this.validateRequiredEnvVar('NEXT_PUBLIC_SANITY_API_VERSION', component)) return

    // Validate project ID format
    if (!/^[a-z0-9]{8}$/.test(projectId)) {
      this.addResult(component, 'warning', 'Project ID format may be incorrect (expected 8 alphanumeric characters)')
    }

    // Test Sanity connection
    try {
      const client = createClient({
        projectId,
        dataset,
        apiVersion,
        token: apiToken,
        useCdn: false
      })

      // Try to fetch a simple query
      await client.fetch('*[_type == "post"][0]')
      this.addResult(component, 'pass', 'Successfully connected to Sanity')
    } catch (error) {
      this.addResult(component, 'fail', 'Failed to connect to Sanity', error instanceof Error ? error.message : String(error))
    }

    // Validate webhook secret
    const webhookSecret = this.env.SANITY_WEBHOOK_SECRET
    if (!webhookSecret) {
      this.addResult(component, 'fail', 'Missing SANITY_WEBHOOK_SECRET')
    } else if (webhookSecret.length < 16) {
      this.addResult(component, 'warning', 'Webhook secret should be at least 16 characters long')
    } else {
      this.addResult(component, 'pass', 'Webhook secret is properly configured')
    }
  }

  private async validateFirebaseConfiguration(): Promise<void> {
    console.log('🔥 Validating Firebase configuration...')

    const component = 'Firebase'
    
    // Check required variables
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PROJECT_ID'
    ]

    let allVarsPresent = true
    for (const varName of requiredVars) {
      if (!this.validateRequiredEnvVar(varName, component)) {
        allVarsPresent = false
      }
    }

    if (!allVarsPresent) return

    // Validate Firebase project ID consistency
    const publicProjectId = this.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const adminProjectId = this.env.FIREBASE_PROJECT_ID
    
    if (publicProjectId !== adminProjectId) {
      this.addResult(component, 'fail', 'Firebase project IDs do not match between public and admin configurations')
    } else {
      this.addResult(component, 'pass', 'Firebase project IDs are consistent')
    }

    // Validate private key format
    const privateKey = this.env.FIREBASE_PRIVATE_KEY
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      this.addResult(component, 'fail', 'Firebase private key format appears incorrect')
    } else {
      this.addResult(component, 'pass', 'Firebase private key format is correct')
    }

    // Validate client email format
    const clientEmail = this.env.FIREBASE_CLIENT_EMAIL
    if (!clientEmail.includes('firebase-adminsdk') || !clientEmail.includes('.iam.gserviceaccount.com')) {
      this.addResult(component, 'warning', 'Firebase client email format may be incorrect')
    } else {
      this.addResult(component, 'pass', 'Firebase client email format is correct')
    }

    // Test Firebase Admin SDK initialization (basic validation)
    try {
      // We can't actually initialize Firebase here without importing the SDK
      // But we can validate the configuration format
      this.addResult(component, 'pass', 'Firebase configuration format validation passed')
    } catch (error) {
      this.addResult(component, 'fail', 'Firebase configuration validation failed', error instanceof Error ? error.message : String(error))
    }
  }

  private validateEmailConfiguration(): void {
    console.log('📧 Validating email configuration...')

    const component = 'Email'
    
    // Check required variables
    if (!this.validateRequiredEnvVar('RESEND_API_KEY', component)) return
    if (!this.validateRequiredEnvVar('FROM_EMAIL', component)) return
    if (!this.validateRequiredEnvVar('OWNER1_EMAIL', component)) return

    // Validate email formats
    const fromEmail = this.env.FROM_EMAIL
    const owner1Email = this.env.OWNER1_EMAIL
    const owner2Email = this.env.OWNER2_EMAIL
    const replyToEmail = this.env.REPLY_TO_EMAIL

    this.validateEmail(fromEmail, component, 'FROM_EMAIL')
    this.validateEmail(owner1Email, component, 'OWNER1_EMAIL')
    
    if (owner2Email) {
      this.validateEmail(owner2Email, component, 'OWNER2_EMAIL')
    }
    
    if (replyToEmail) {
      this.validateEmail(replyToEmail, component, 'REPLY_TO_EMAIL')
    }

    // Validate API key format
    const apiKey = this.env.RESEND_API_KEY
    if (!apiKey.startsWith('re_')) {
      this.addResult(component, 'warning', 'Resend API key format may be incorrect (should start with "re_")')
    } else {
      this.addResult(component, 'pass', 'Resend API key format is correct')
    }
  }

  private validateSiteConfiguration(): void {
    console.log('🌐 Validating site configuration...')

    const component = 'Site Configuration'
    
    // Check required variables
    if (!this.validateRequiredEnvVar('NEXT_PUBLIC_SITE_URL', component)) return

    const siteUrl = this.env.NEXT_PUBLIC_SITE_URL
    this.validateUrl(siteUrl, component, 'NEXT_PUBLIC_SITE_URL')

    // Check if URL is HTTPS in production
    if (!siteUrl.startsWith('https://')) {
      this.addResult(component, 'fail', 'Site URL must use HTTPS in production')
    } else {
      this.addResult(component, 'pass', 'Site URL uses HTTPS')
    }

    // Validate other site configuration
    const siteName = this.env.NEXT_PUBLIC_SITE_NAME
    const siteDescription = this.env.NEXT_PUBLIC_SITE_DESCRIPTION

    if (!siteName) {
      this.addResult(component, 'warning', 'NEXT_PUBLIC_SITE_NAME is not set')
    } else {
      this.addResult(component, 'pass', 'Site name is configured')
    }

    if (!siteDescription) {
      this.addResult(component, 'warning', 'NEXT_PUBLIC_SITE_DESCRIPTION is not set')
    } else {
      this.addResult(component, 'pass', 'Site description is configured')
    }
  }

  private validateAdminConfiguration(): void {
    console.log('👤 Validating admin configuration...')

    const component = 'Admin Dashboard'
    
    // Check required variables
    if (!this.validateRequiredEnvVar('ADMIN_USERNAME', component)) return
    if (!this.validateRequiredEnvVar('ADMIN_PASSWORD', component)) return
    if (!this.validateRequiredEnvVar('JWT_SECRET', component)) return

    // Validate password strength
    const password = this.env.ADMIN_PASSWORD
    if (password.length < 8) {
      this.addResult(component, 'fail', 'Admin password must be at least 8 characters long')
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      this.addResult(component, 'warning', 'Admin password should contain uppercase, lowercase, and numeric characters')
    } else {
      this.addResult(component, 'pass', 'Admin password meets security requirements')
    }

    // Validate JWT secret
    const jwtSecret = this.env.JWT_SECRET
    if (jwtSecret.length < 32) {
      this.addResult(component, 'fail', 'JWT secret should be at least 32 characters long')
    } else {
      this.addResult(component, 'pass', 'JWT secret is properly configured')
    }
  }

  private validateSecurityConfiguration(): void {
    console.log('🔒 Validating security configuration...')

    const component = 'Security'
    
    // Check CORS configuration
    const allowedOrigins = this.env.ALLOWED_ORIGINS
    if (!allowedOrigins) {
      this.addResult(component, 'warning', 'ALLOWED_ORIGINS is not set')
    } else {
      const origins = allowedOrigins.split(',')
      let validOrigins = 0
      
      for (const origin of origins) {
        try {
          new URL(origin.trim())
          validOrigins++
        } catch {
          this.addResult(component, 'warning', `Invalid origin in ALLOWED_ORIGINS: ${origin}`)
        }
      }
      
      if (validOrigins > 0) {
        this.addResult(component, 'pass', `${validOrigins} valid origins configured`)
      }
    }

    // Check rate limiting configuration
    const rateLimitMax = this.env.RATE_LIMIT_MAX
    const rateLimitWindow = this.env.RATE_LIMIT_WINDOW_MS

    if (!rateLimitMax || !rateLimitWindow) {
      this.addResult(component, 'warning', 'Rate limiting is not configured')
    } else {
      this.addResult(component, 'pass', 'Rate limiting is configured')
    }

    // Check if telemetry is disabled
    if (this.env.NEXT_TELEMETRY_DISABLED === '1') {
      this.addResult(component, 'pass', 'Next.js telemetry is disabled')
    } else {
      this.addResult(component, 'warning', 'Consider disabling Next.js telemetry in production')
    }
  }

  private validateDeploymentConfiguration(): void {
    console.log('⚡ Validating deployment configuration...')

    const component = 'Deployment'
    
    // Check environment
    if (this.env.NODE_ENV !== 'production') {
      this.addResult(component, 'warning', 'NODE_ENV is not set to "production"')
    } else {
      this.addResult(component, 'pass', 'NODE_ENV is set to production')
    }

    // Check Vercel configuration
    const vercelUrl = this.env.VERCEL_URL
    const vercelEnv = this.env.VERCEL_ENV

    if (vercelUrl) {
      this.addResult(component, 'pass', 'Vercel URL is configured')
    } else {
      this.addResult(component, 'warning', 'VERCEL_URL is not set')
    }

    if (vercelEnv === 'production') {
      this.addResult(component, 'pass', 'Vercel environment is set to production')
    } else {
      this.addResult(component, 'warning', 'VERCEL_ENV is not set to production')
    }

    // Check ISR configuration
    const isrPosts = this.env.ISR_REVALIDATE_POSTS
    const isrPages = this.env.ISR_REVALIDATE_PAGES

    if (isrPosts && isrPages) {
      this.addResult(component, 'pass', 'ISR revalidation is configured')
    } else {
      this.addResult(component, 'warning', 'ISR revalidation times are not configured')
    }
  }

  private validateFeatureFlags(): void {
    console.log('🚩 Validating feature flags...')

    const component = 'Feature Flags'
    
    const features = [
      'ENABLE_ANALYTICS',
      'ENABLE_SEO_AUTOMATION',
      'ENABLE_SOCIAL_IMAGE_GENERATION',
      'ENABLE_WEBHOOK_PROCESSING',
      'ENABLE_PREVIEW_MODE',
      'ENABLE_ADMIN_DASHBOARD'
    ]

    let enabledFeatures = 0
    
    for (const feature of features) {
      const value = this.env[feature]
      if (value === 'true') {
        enabledFeatures++
      } else if (value === 'false') {
        // Explicitly disabled, that's fine
      } else {
        this.addResult(component, 'warning', `Feature flag ${feature} is not explicitly set`)
      }
    }

    this.addResult(component, 'pass', `${enabledFeatures} features are enabled`)
  }

  private async validateFileSystemPermissions(): Promise<void> {
    console.log('📁 Validating file system permissions...')

    const component = 'File System'
    
    // Check if we can write to logs directory
    const logsDir = path.join(process.cwd(), 'logs')
    try {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }
      
      const testFile = path.join(logsDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      
      this.addResult(component, 'pass', 'Can write to logs directory')
    } catch (error) {
      this.addResult(component, 'fail', 'Cannot write to logs directory', error instanceof Error ? error.message : String(error))
    }

    // Check if required directories exist
    const requiredDirs = ['public', 'src', 'studio']
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath)) {
        this.addResult(component, 'pass', `Directory ${dir} exists`)
      } else {
        this.addResult(component, 'fail', `Required directory ${dir} is missing`)
      }
    }
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(80))
    console.log('🔍 PRODUCTION CONFIGURATION VALIDATION RESULTS')
    console.log('='.repeat(80))

    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.component]) {
        acc[result.component] = []
      }
      acc[result.component].push(result)
      return acc
    }, {} as Record<string, ValidationResult[]>)

    let totalPass = 0
    let totalFail = 0
    let totalWarning = 0

    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n📋 ${component}:`)
      
      for (const result of results) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
        console.log(`  ${icon} ${result.message}`)
        
        if (result.details) {
          console.log(`     Details: ${result.details}`)
        }

        if (result.status === 'pass') totalPass++
        else if (result.status === 'fail') totalFail++
        else totalWarning++
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('📊 SUMMARY:')
    console.log(`✅ Passed: ${totalPass}`)
    console.log(`⚠️  Warnings: ${totalWarning}`)
    console.log(`❌ Failed: ${totalFail}`)
    console.log('='.repeat(80))

    if (totalFail > 0) {
      console.log('\n❌ Configuration validation failed. Please fix the issues above before deploying.')
      process.exit(1)
    } else if (totalWarning > 0) {
      console.log('\n⚠️  Configuration validation passed with warnings. Review the warnings above.')
    } else {
      console.log('\n🎉 Configuration validation passed successfully!')
    }
  }

  public async validate(): Promise<void> {
    console.log('🔍 Starting production configuration validation...\n')

    try {
      await this.validateSanityConfiguration()
      await this.validateFirebaseConfiguration()
      this.validateEmailConfiguration()
      this.validateSiteConfiguration()
      this.validateAdminConfiguration()
      this.validateSecurityConfiguration()
      this.validateDeploymentConfiguration()
      this.validateFeatureFlags()
      await this.validateFileSystemPermissions()

      this.printResults()
    } catch (error) {
      console.error('❌ Validation failed with error:', error)
      process.exit(1)
    }
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  const validator = new ProductionConfigValidator()
  validator.validate()
}

export default ProductionConfigValidator
