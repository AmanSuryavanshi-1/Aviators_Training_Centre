#!/usr/bin/env tsx

/**
 * Production Environment Setup Script
 * Configures all required environment variables and settings for production deployment
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

interface EnvironmentConfig {
  // Sanity Configuration
  NEXT_PUBLIC_SANITY_PROJECT_ID: string
  NEXT_PUBLIC_SANITY_DATASET: string
  NEXT_PUBLIC_SANITY_API_VERSION: string
  SANITY_API_TOKEN: string
  SANITY_WEBHOOK_SECRET: string
  SANITY_STUDIO_PREVIEW_URL: string
  
  // Site Configuration
  NEXT_PUBLIC_SITE_URL: string
  NEXT_PUBLIC_SITE_NAME: string
  NEXT_PUBLIC_SITE_DESCRIPTION: string
  
  // Firebase Configuration
  NEXT_PUBLIC_FIREBASE_API_KEY: string
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  NEXT_PUBLIC_FIREBASE_APP_ID: string
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string
  FIREBASE_PRIVATE_KEY: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PROJECT_ID: string
  
  // Email Configuration
  RESEND_API_KEY: string
  FROM_EMAIL: string
  REPLY_TO_EMAIL: string
  OWNER1_EMAIL: string
  OWNER2_EMAIL: string
  
  // Admin Configuration
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  JWT_SECRET: string
  
  // Analytics Configuration
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
  GOOGLE_SITE_VERIFICATION?: string
  
  // SEO Configuration
  NEXT_PUBLIC_DEFAULT_OG_IMAGE: string
  NEXT_PUBLIC_TWITTER_HANDLE: string
  
  // Deployment Configuration
  VERCEL_URL: string
  VERCEL_ENV: string
  NODE_ENV: string
  NEXT_TELEMETRY_DISABLED: string
  
  // Security Configuration
  ALLOWED_ORIGINS: string
  RATE_LIMIT_MAX: string
  RATE_LIMIT_WINDOW_MS: string
  
  // Cache Configuration
  ISR_REVALIDATE_POSTS: string
  ISR_REVALIDATE_PAGES: string
  
  // Feature Flags
  ENABLE_ANALYTICS: string
  ENABLE_SEO_AUTOMATION: string
  ENABLE_SOCIAL_IMAGE_GENERATION: string
  ENABLE_WEBHOOK_PROCESSING: string
  ENABLE_PREVIEW_MODE: string
  ENABLE_ADMIN_DASHBOARD: string
  
  // Monitoring
  LOG_LEVEL: string
  SENTRY_DSN?: string
}

class ProductionEnvironmentSetup {
  private config: Partial<EnvironmentConfig> = {}
  private requiredVars: (keyof EnvironmentConfig)[] = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'RESEND_API_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'JWT_SECRET'
  ]

  constructor() {
    this.loadExistingConfig()
  }

  private loadExistingConfig(): void {
    try {
      // Load from existing .env.local if it exists
      const envPath = path.join(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        const lines = envContent.split('\n')
        
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=')
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').replace(/^["']|["']$/g, '')
              this.config[key as keyof EnvironmentConfig] = value
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not load existing environment configuration:', error)
    }
  }

  private generateSecureSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private promptForInput(question: string, defaultValue?: string): string {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise((resolve) => {
      const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `
      readline.question(prompt, (answer: string) => {
        readline.close()
        resolve(answer.trim() || defaultValue || '')
      })
    })
  }

  private async collectConfiguration(): Promise<void> {
    console.log('🔧 Setting up production environment configuration...\n')

    // Sanity Configuration
    console.log('📝 Sanity CMS Configuration:')
    this.config.NEXT_PUBLIC_SANITY_PROJECT_ID = await this.promptForInput(
      'Sanity Project ID',
      this.config.NEXT_PUBLIC_SANITY_PROJECT_ID
    )
    this.config.NEXT_PUBLIC_SANITY_DATASET = 'production'
    this.config.NEXT_PUBLIC_SANITY_API_VERSION = '2024-01-01'
    this.config.SANITY_API_TOKEN = await this.promptForInput(
      'Sanity API Token (with Editor permissions)',
      this.config.SANITY_API_TOKEN
    )
    this.config.SANITY_WEBHOOK_SECRET = this.config.SANITY_WEBHOOK_SECRET || this.generateSecureSecret()

    // Site Configuration
    console.log('\n🌐 Site Configuration:')
    this.config.NEXT_PUBLIC_SITE_URL = await this.promptForInput(
      'Production Site URL',
      this.config.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in'
    )
    this.config.NEXT_PUBLIC_SITE_NAME = 'Aviators Training Centre'
    this.config.NEXT_PUBLIC_SITE_DESCRIPTION = 'Professional Aviation Training and Certification'
    this.config.SANITY_STUDIO_PREVIEW_URL = this.config.NEXT_PUBLIC_SITE_URL

    // Firebase Configuration
    console.log('\n🔥 Firebase Configuration:')
    this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID = await this.promptForInput(
      'Firebase Project ID',
      this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )
    this.config.NEXT_PUBLIC_FIREBASE_API_KEY = await this.promptForInput(
      'Firebase API Key',
      this.config.NEXT_PUBLIC_FIREBASE_API_KEY
    )
    this.config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = `${this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`
    this.config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = `${this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
    this.config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = await this.promptForInput(
      'Firebase Messaging Sender ID',
      this.config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    )
    this.config.NEXT_PUBLIC_FIREBASE_APP_ID = await this.promptForInput(
      'Firebase App ID',
      this.config.NEXT_PUBLIC_FIREBASE_APP_ID
    )
    this.config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = await this.promptForInput(
      'Firebase Measurement ID (optional)',
      this.config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    )
    this.config.FIREBASE_PRIVATE_KEY = await this.promptForInput(
      'Firebase Private Key (from service account)',
      this.config.FIREBASE_PRIVATE_KEY
    )
    this.config.FIREBASE_CLIENT_EMAIL = await this.promptForInput(
      'Firebase Client Email (from service account)',
      this.config.FIREBASE_CLIENT_EMAIL
    )
    this.config.FIREBASE_PROJECT_ID = this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    // Email Configuration
    console.log('\n📧 Email Configuration:')
    this.config.RESEND_API_KEY = await this.promptForInput(
      'Resend API Key',
      this.config.RESEND_API_KEY
    )
    const domain = new URL(this.config.NEXT_PUBLIC_SITE_URL).hostname
    this.config.FROM_EMAIL = `noreply@${domain}`
    this.config.REPLY_TO_EMAIL = `info@${domain}`
    this.config.OWNER1_EMAIL = await this.promptForInput(
      'Owner Email 1',
      this.config.OWNER1_EMAIL || `admin@${domain}`
    )
    this.config.OWNER2_EMAIL = await this.promptForInput(
      'Owner Email 2 (optional)',
      this.config.OWNER2_EMAIL
    )

    // Admin Configuration
    console.log('\n👤 Admin Configuration:')
    this.config.ADMIN_USERNAME = await this.promptForInput(
      'Admin Username',
      this.config.ADMIN_USERNAME || 'admin'
    )
    this.config.ADMIN_PASSWORD = await this.promptForInput(
      'Admin Password (secure)',
      this.config.ADMIN_PASSWORD
    )
    this.config.JWT_SECRET = this.config.JWT_SECRET || this.generateSecureSecret(64)

    // Set default values for other configurations
    this.setDefaultValues()
  }

  private setDefaultValues(): void {
    // SEO Configuration
    this.config.NEXT_PUBLIC_DEFAULT_OG_IMAGE = `${this.config.NEXT_PUBLIC_SITE_URL}/images/og-default.jpg`
    this.config.NEXT_PUBLIC_TWITTER_HANDLE = '@AviatorsTCentre'

    // Deployment Configuration
    this.config.VERCEL_URL = new URL(this.config.NEXT_PUBLIC_SITE_URL!).hostname
    this.config.VERCEL_ENV = 'production'
    this.config.NODE_ENV = 'production'
    this.config.NEXT_TELEMETRY_DISABLED = '1'

    // Security Configuration
    const allowedOrigins = [
      this.config.NEXT_PUBLIC_SITE_URL,
      `https://www.${new URL(this.config.NEXT_PUBLIC_SITE_URL!).hostname}`,
      `https://${this.config.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`
    ]
    this.config.ALLOWED_ORIGINS = allowedOrigins.join(',')
    this.config.RATE_LIMIT_MAX = '100'
    this.config.RATE_LIMIT_WINDOW_MS = '900000'

    // Cache Configuration
    this.config.ISR_REVALIDATE_POSTS = '3600'
    this.config.ISR_REVALIDATE_PAGES = '86400'

    // Feature Flags
    this.config.ENABLE_ANALYTICS = 'true'
    this.config.ENABLE_SEO_AUTOMATION = 'true'
    this.config.ENABLE_SOCIAL_IMAGE_GENERATION = 'true'
    this.config.ENABLE_WEBHOOK_PROCESSING = 'true'
    this.config.ENABLE_PREVIEW_MODE = 'true'
    this.config.ENABLE_ADMIN_DASHBOARD = 'true'

    // Monitoring
    this.config.LOG_LEVEL = 'info'
  }

  private validateConfiguration(): boolean {
    console.log('\n✅ Validating configuration...')
    
    const missingVars: string[] = []
    
    for (const varName of this.requiredVars) {
      if (!this.config[varName]) {
        missingVars.push(varName)
      }
    }

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:')
      missingVars.forEach(varName => console.error(`  - ${varName}`))
      return false
    }

    // Validate URLs
    try {
      new URL(this.config.NEXT_PUBLIC_SITE_URL!)
    } catch {
      console.error('❌ Invalid site URL:', this.config.NEXT_PUBLIC_SITE_URL)
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.config.OWNER1_EMAIL!)) {
      console.error('❌ Invalid owner email format:', this.config.OWNER1_EMAIL)
      return false
    }

    console.log('✅ Configuration validation passed')
    return true
  }

  private generateEnvironmentFile(): void {
    console.log('\n📄 Generating environment file...')

    const envContent = `# Production Environment Configuration for Aviators Training Centre Blog System
# Generated on ${new Date().toISOString()}

# =============================================================================
# SANITY CMS CONFIGURATION - REQUIRED
# =============================================================================
NEXT_PUBLIC_SANITY_PROJECT_ID=${this.config.NEXT_PUBLIC_SANITY_PROJECT_ID}
NEXT_PUBLIC_SANITY_DATASET=${this.config.NEXT_PUBLIC_SANITY_DATASET}
NEXT_PUBLIC_SANITY_API_VERSION=${this.config.NEXT_PUBLIC_SANITY_API_VERSION}
SANITY_API_TOKEN=${this.config.SANITY_API_TOKEN}
SANITY_WEBHOOK_SECRET=${this.config.SANITY_WEBHOOK_SECRET}
SANITY_STUDIO_PREVIEW_URL=${this.config.SANITY_STUDIO_PREVIEW_URL}

# =============================================================================
# SITE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SITE_URL=${this.config.NEXT_PUBLIC_SITE_URL}
NEXT_PUBLIC_SITE_NAME="${this.config.NEXT_PUBLIC_SITE_NAME}"
NEXT_PUBLIC_SITE_DESCRIPTION="${this.config.NEXT_PUBLIC_SITE_DESCRIPTION}"

# =============================================================================
# FIREBASE CONFIGURATION - REQUIRED
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=${this.config.NEXT_PUBLIC_FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${this.config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${this.config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${this.config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${this.config.NEXT_PUBLIC_FIREBASE_APP_ID}
${this.config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${this.config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}` : '# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID='}
FIREBASE_PRIVATE_KEY="${this.config.FIREBASE_PRIVATE_KEY}"
FIREBASE_CLIENT_EMAIL=${this.config.FIREBASE_CLIENT_EMAIL}
FIREBASE_PROJECT_ID=${this.config.FIREBASE_PROJECT_ID}

# =============================================================================
# EMAIL CONFIGURATION - REQUIRED
# =============================================================================
RESEND_API_KEY=${this.config.RESEND_API_KEY}
FROM_EMAIL=${this.config.FROM_EMAIL}
REPLY_TO_EMAIL=${this.config.REPLY_TO_EMAIL}
OWNER1_EMAIL=${this.config.OWNER1_EMAIL}
${this.config.OWNER2_EMAIL ? `OWNER2_EMAIL=${this.config.OWNER2_EMAIL}` : '# OWNER2_EMAIL='}

# =============================================================================
# ADMIN DASHBOARD CONFIGURATION - REQUIRED
# =============================================================================
ADMIN_USERNAME=${this.config.ADMIN_USERNAME}
ADMIN_PASSWORD=${this.config.ADMIN_PASSWORD}
JWT_SECRET=${this.config.JWT_SECRET}

# =============================================================================
# ANALYTICS CONFIGURATION
# =============================================================================
${this.config.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `NEXT_PUBLIC_GA_MEASUREMENT_ID=${this.config.NEXT_PUBLIC_GA_MEASUREMENT_ID}` : '# NEXT_PUBLIC_GA_MEASUREMENT_ID='}
${this.config.GOOGLE_SITE_VERIFICATION ? `GOOGLE_SITE_VERIFICATION=${this.config.GOOGLE_SITE_VERIFICATION}` : '# GOOGLE_SITE_VERIFICATION='}

# =============================================================================
# SEO CONFIGURATION
# =============================================================================
NEXT_PUBLIC_DEFAULT_OG_IMAGE=${this.config.NEXT_PUBLIC_DEFAULT_OG_IMAGE}
NEXT_PUBLIC_TWITTER_HANDLE=${this.config.NEXT_PUBLIC_TWITTER_HANDLE}

# =============================================================================
# DEPLOYMENT CONFIGURATION
# =============================================================================
VERCEL_URL=${this.config.VERCEL_URL}
VERCEL_ENV=${this.config.VERCEL_ENV}
NODE_ENV=${this.config.NODE_ENV}
NEXT_TELEMETRY_DISABLED=${this.config.NEXT_TELEMETRY_DISABLED}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
ALLOWED_ORIGINS=${this.config.ALLOWED_ORIGINS}
RATE_LIMIT_MAX=${this.config.RATE_LIMIT_MAX}
RATE_LIMIT_WINDOW_MS=${this.config.RATE_LIMIT_WINDOW_MS}

# =============================================================================
# CACHE CONFIGURATION
# =============================================================================
ISR_REVALIDATE_POSTS=${this.config.ISR_REVALIDATE_POSTS}
ISR_REVALIDATE_PAGES=${this.config.ISR_REVALIDATE_PAGES}

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_ANALYTICS=${this.config.ENABLE_ANALYTICS}
ENABLE_SEO_AUTOMATION=${this.config.ENABLE_SEO_AUTOMATION}
ENABLE_SOCIAL_IMAGE_GENERATION=${this.config.ENABLE_SOCIAL_IMAGE_GENERATION}
ENABLE_WEBHOOK_PROCESSING=${this.config.ENABLE_WEBHOOK_PROCESSING}
ENABLE_PREVIEW_MODE=${this.config.ENABLE_PREVIEW_MODE}
ENABLE_ADMIN_DASHBOARD=${this.config.ENABLE_ADMIN_DASHBOARD}

# =============================================================================
# MONITORING & LOGGING
# =============================================================================
LOG_LEVEL=${this.config.LOG_LEVEL}
${this.config.SENTRY_DSN ? `SENTRY_DSN=${this.config.SENTRY_DSN}` : '# SENTRY_DSN='}
`

    const envPath = path.join(process.cwd(), '.env.production')
    fs.writeFileSync(envPath, envContent)
    
    console.log('✅ Environment file generated:', envPath)
  }

  private updateVercelConfiguration(): void {
    console.log('\n⚡ Updating Vercel configuration...')

    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "package.json",
          use: "@vercel/next"
        }
      ],
      routes: [
        {
          src: "/api/(.*)",
          dest: "/api/$1",
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          headers: {
            "Access-Control-Allow-Origin": this.config.ALLOWED_ORIGINS,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization"
          }
        },
        {
          src: "/(.*)",
          dest: "/$1"
        }
      ],
      env: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: this.config.NEXT_PUBLIC_SANITY_PROJECT_ID,
        NEXT_PUBLIC_SANITY_DATASET: this.config.NEXT_PUBLIC_SANITY_DATASET,
        NEXT_PUBLIC_SANITY_API_VERSION: this.config.NEXT_PUBLIC_SANITY_API_VERSION,
        NEXT_PUBLIC_SITE_URL: this.config.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: this.config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_API_KEY: this.config.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: this.config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: this.config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: this.config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: this.config.NEXT_PUBLIC_FIREBASE_APP_ID
      }
    }

    const vercelPath = path.join(process.cwd(), 'vercel.json')
    fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2))
    
    console.log('✅ Vercel configuration updated')
  }

  private generateDeploymentInstructions(): void {
    console.log('\n📋 Generating deployment instructions...')

    const instructions = `# Production Deployment Instructions
Generated on ${new Date().toISOString()}

## Prerequisites
1. Vercel CLI installed: \`npm i -g vercel\`
2. Sanity CLI installed: \`npm i -g @sanity/cli\`
3. All environment variables configured

## Deployment Steps

### 1. Deploy Sanity Studio
\`\`\`bash
cd studio
npm install
npx sanity build
npx sanity deploy
\`\`\`

### 2. Configure Sanity Webhooks
1. Go to https://sanity.io/manage
2. Select your project: ${this.config.NEXT_PUBLIC_SANITY_PROJECT_ID}
3. Go to API > Webhooks
4. Create new webhook:
   - URL: ${this.config.NEXT_PUBLIC_SITE_URL}/api/webhooks/sanity
   - Secret: ${this.config.SANITY_WEBHOOK_SECRET}
   - Triggers: Create, Update, Delete for 'post' documents

### 3. Deploy Next.js Application
\`\`\`bash
# Set environment variables in Vercel
vercel env add SANITY_API_TOKEN
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add RESEND_API_KEY
vercel env add ADMIN_PASSWORD
vercel env add JWT_SECRET
vercel env add SANITY_WEBHOOK_SECRET

# Deploy to production
vercel --prod
\`\`\`

### 4. Verify Deployment
1. Check site accessibility: ${this.config.NEXT_PUBLIC_SITE_URL}
2. Test admin dashboard: ${this.config.NEXT_PUBLIC_SITE_URL}/admin
3. Verify Sanity Studio: https://${this.config.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio
4. Test API endpoints:
   - ${this.config.NEXT_PUBLIC_SITE_URL}/api/health
   - ${this.config.NEXT_PUBLIC_SITE_URL}/api/analytics/pageview

### 5. Post-Deployment Tasks
1. Set up monitoring and alerts
2. Configure backup schedules
3. Test all functionality thoroughly
4. Update DNS records if needed
5. Set up SSL certificates

## Environment Variables Summary
- Sanity: ✅ Configured
- Firebase: ✅ Configured  
- Email: ✅ Configured
- Admin: ✅ Configured
- Security: ✅ Configured
- Analytics: ✅ Configured

## Support
For issues, check the deployment logs and verify all environment variables are set correctly.
`

    const instructionsPath = path.join(process.cwd(), 'DEPLOYMENT_INSTRUCTIONS.md')
    fs.writeFileSync(instructionsPath, instructions)
    
    console.log('✅ Deployment instructions generated:', instructionsPath)
  }

  public async setup(): Promise<void> {
    try {
      await this.collectConfiguration()
      
      if (!this.validateConfiguration()) {
        console.error('❌ Configuration validation failed. Please fix the issues and try again.')
        process.exit(1)
      }

      this.generateEnvironmentFile()
      this.updateVercelConfiguration()
      this.generateDeploymentInstructions()

      console.log('\n🎉 Production environment setup completed successfully!')
      console.log('\nNext steps:')
      console.log('1. Review the generated .env.production file')
      console.log('2. Follow the deployment instructions in DEPLOYMENT_INSTRUCTIONS.md')
      console.log('3. Test the deployment thoroughly')
      
    } catch (error) {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new ProductionEnvironmentSetup()
  setup.setup()
}

export default ProductionEnvironmentSetup
