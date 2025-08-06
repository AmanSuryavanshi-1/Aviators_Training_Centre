/**
 * Configuration Validation API Endpoint
 * Provides environment configuration validation via API
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  validateEnvironment, 
  generateConfigurationReport, 
  getQuickFixes 
} from '@/lib/config/environmentValidator';

export async function GET(request: NextRequest) {
  try {
    // Perform environment validation
    const validation = validateEnvironment();
    
    // Generate report
    const report = generateConfigurationReport(validation);
    
    // Get quick fixes
    const quickFixes = getQuickFixes(validation);
    
    return NextResponse.json({
      success: true,
      data: {
        validation,
        report,
        quickFixes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Configuration validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category } = body;
    
    switch (action) {
      case 'validate-category':
        // Validate specific category
        const validation = validateEnvironment();
        const categoryErrors = validation.errors.filter(e => e.category === category);
        const categoryWarnings = validation.warnings.filter(w => w.category === category);
        
        return NextResponse.json({
          success: true,
          data: {
            category,
            errors: categoryErrors,
            warnings: categoryWarnings,
            isValid: categoryErrors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
          },
        });
        
      case 'get-environment-info':
        // Get basic environment information
        return NextResponse.json({
          success: true,
          data: {
            nodeEnv: process.env.NODE_ENV,
            hasProjectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
            hasDataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
            hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
            hasApiToken: !!process.env.SANITY_API_TOKEN,
            hasJwtSecret: !!process.env.JWT_SECRET,
          },
        });
        
      case 'generate-sample-env':
        // Generate sample environment file
        const sampleEnv = `# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_api_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Authentication
JWT_SECRET=your_jwt_secret_here

# Optional: Firebase Configuration (Client-side - use NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Server Configuration (Private - for admin operations)
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Optional: Email Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
`;
        
        return NextResponse.json({
          success: true,
          data: {
            sampleEnv,
            filename: '.env.local',
          },
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Configuration validation action error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform configuration validation action',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}