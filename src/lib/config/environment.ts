/**
 * Environment Configuration Validation
 * Validates required environment variables for production deployment
 */

interface EnvironmentConfig {
  // Sanity Configuration
  sanity: {
    projectId: string;
    dataset: string;
    apiVersion: string;
    token: string;
  };
  
  // Site Configuration
  site: {
    url: string;
    name: string;
  };
  
  // Authentication (simplified - uses Sanity Studio auth)
  auth: {
    useSanityAuth: boolean;
  };
  
  // Environment
  nodeEnv: string;
  isProduction: boolean;
}

/**
 * Get and validate environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    sanity: {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
      token: process.env.SANITY_API_TOKEN || '',
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Aviators Training Centre',
    },
    auth: {
      useSanityAuth: true, // Always use Sanity Studio authentication
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };

  return config;
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getEnvironmentConfig();

  // Required Sanity variables
  if (!config.sanity.projectId) {
    errors.push('NEXT_PUBLIC_SANITY_PROJECT_ID is required');
  }
  
  if (!config.sanity.dataset) {
    errors.push('NEXT_PUBLIC_SANITY_DATASET is required');
  }
  
  if (!config.sanity.token) {
    errors.push('SANITY_API_TOKEN is required');
  }

  // Authentication uses Sanity Studio - no additional setup required

  // Production-specific validations
  if (config.isProduction) {
    if (!config.site.url.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS in production');
    }
    
    if (!config.auth.adminPassword) {
      errors.push('ADMIN_PASSWORD is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get Studio URL for the current environment
 */
export function getStudioUrl(path: string = ''): string {
  const config = getEnvironmentConfig();
  return `${config.site.url}/studio${path}`;
}

/**
 * Get Admin URL for the current environment
 */
export function getAdminUrl(path: string = ''): string {
  const config = getEnvironmentConfig();
  return `${config.site.url}/admin${path}`;
}

/**
 * Generate edit URL for a specific document
 */
export function getEditUrl(documentId: string, documentType: string): string {
  return getStudioUrl(`/desk/${documentType};${documentId}`);
}

/**
 * Log environment status on startup
 */
export function logEnvironmentStatus(): void {
  const config = getEnvironmentConfig();
  const validation = validateEnvironment();
  
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Site URL: ${config.site.url}`);
  console.log(`   Sanity Project: ${config.sanity.projectId}`);
  console.log(`   Sanity Dataset: ${config.sanity.dataset}`);
  console.log(`   Studio URL: ${getStudioUrl()}`);
  console.log(`   Admin URL: ${getAdminUrl()}`);
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.log('❌ Environment validation failed:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
}