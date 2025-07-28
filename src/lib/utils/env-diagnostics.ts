/**
 * Environment Diagnostics Utility
 * 
 * Helps diagnose environment variable loading issues
 */

export interface EnvDiagnostics {
  sanityProjectId: string | undefined;
  sanityDataset: string | undefined;
  sanityApiVersion: string | undefined;
  sanityApiToken: boolean; // Don't expose the actual token
  nodeEnv: string | undefined;
  isServer: boolean;
  timestamp: string;
}

export function getEnvDiagnostics(): EnvDiagnostics {
  return {
    sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    sanityApiToken: !!process.env.SANITY_API_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    isServer: typeof window === 'undefined',
    timestamp: new Date().toISOString()
  };
}

export function logEnvDiagnostics(context: string = 'Unknown'): void {
  const diagnostics = getEnvDiagnostics();
  console.log(`🔍 Environment Diagnostics (${context}):`, {
    ...diagnostics,
    sanityApiToken: diagnostics.sanityApiToken ? 'Present' : 'Missing'
  });
}

export function validateSanityEnv(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    errors.push('NEXT_PUBLIC_SANITY_PROJECT_ID is missing');
  }

  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
    errors.push('NEXT_PUBLIC_SANITY_DATASET is missing');
  }

  if (!process.env.NEXT_PUBLIC_SANITY_API_VERSION) {
    warnings.push('NEXT_PUBLIC_SANITY_API_VERSION is missing (will use default)');
  }

  if (!process.env.SANITY_API_TOKEN) {
    errors.push('SANITY_API_TOKEN is missing (required for write operations)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}