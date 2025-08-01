#!/usr/bin/env tsx

/**
 * Aviation Tags Auto-Population Script
 * 
 * This script automatically creates the five aviation-related tags in Sanity Studio
 * with comprehensive SEO keywords based on the codebase analysis.
 * 
 * Usage:
 * npm run tsx tools/scripts/development/populate-aviation-tags.ts
 * 
 * Or directly:
 * tsx tools/scripts/development/populate-aviation-tags.ts
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Color definitions for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
};

// Aviation tags data with comprehensive SEO keywords
const aviationTags = [
  {
    title: 'Pilot Jobs',
    slug: { current: 'pilot-jobs' },
    description: 'Commercial pilot employment opportunities, airline careers, and aviation job market insights',
    color: 'green',
    category: 'career',
    seoKeywords: [
      'commercial pilot jobs India',
      'airline pilot careers',
      'CPL job opportunities',
      'pilot recruitment 2024',
      'aviation jobs India',
      'first officer positions',
      'captain pilot jobs',
      'regional airline jobs',
      'international pilot careers',
      'pilot job openings',
      'aviation employment',
      'airline hiring process',
      'pilot salary India',
      'commercial aviation careers',
      'flight instructor jobs',
      'airline pilot requirements',
      'pilot job market trends',
      'aviation industry jobs',
      'pilot career progression',
      'cockpit crew positions',
      'airline job applications',
      'pilot job interviews',
      'aviation job placement',
      'commercial pilot opportunities',
      'airline recruitment programs',
      'pilot job search',
      'aviation career guidance',
      'pilot employment statistics',
      'airline pilot demand',
      'flight crew opportunities'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'CPL Employment',
    slug: { current: 'cpl-employment' },
    description: 'Commercial Pilot License employment prospects, career paths, and job opportunities for CPL holders',
    color: 'blue',
    category: 'career',
    seoKeywords: [
      'CPL license jobs',
      'commercial pilot license careers',
      'CPL holder employment',
      'CPL job requirements',
      'post CPL career options',
      'CPL employment opportunities',
      'commercial pilot jobs after CPL',
      'CPL license benefits',
      'CPL career progression',
      'CPL job market India',
      'commercial pilot license salary',
      'CPL employment statistics',
      'airline jobs for CPL holders',
      'CPL training to employment',
      'commercial aviation CPL jobs',
      'CPL license job placement',
      'CPL graduate careers',
      'commercial pilot employment',
      'CPL job prospects 2024',
      'aviation careers with CPL',
      'CPL license job search',
      'commercial pilot opportunities',
      'CPL employment guidance',
      'airline hiring CPL pilots',
      'CPL career pathways',
      'commercial pilot job security',
      'CPL employment trends',
      'aviation industry CPL jobs',
      'CPL license career benefits',
      'commercial aviation employment'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Aviation Career',
    slug: { current: 'aviation-career' },
    description: 'Comprehensive guide to aviation careers, pilot training paths, and aerospace industry opportunities',
    color: 'teal',
    category: 'career',
    seoKeywords: [
      'aviation career guide',
      'pilot career path',
      'aviation industry careers',
      'how to become a pilot',
      'aviation career opportunities',
      'pilot training career',
      'commercial aviation careers',
      'aviation career planning',
      'pilot career progression',
      'aviation job prospects',
      'aerospace career options',
      'aviation career requirements',
      'pilot career development',
      'aviation industry jobs',
      'flight training careers',
      'aviation career advice',
      'pilot career guidance',
      'commercial pilot career',
      'aviation career success',
      'pilot career steps',
      'aviation professional careers',
      'airline career opportunities',
      'aviation career transition',
      'pilot career timeline',
      'aviation career growth',
      'flight crew careers',
      'aviation management careers',
      'pilot career benefits',
      'aviation career prospects',
      'commercial aviation path'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Aviation Ground School',
    slug: { current: 'aviation-ground-school' },
    description: 'Comprehensive guide to aviation ground school training, including DGCA requirements, pilot theory, and flight training modules.',
    color: 'blue',
    category: 'training',
    seoKeywords: [
      'airline hiring process',
      'airline pilot recruitment',
      'airline job openings',
      'commercial airline hiring',
      'airline recruitment 2024',
      'airline hiring requirements',
      'pilot hiring trends',
      'airline employment opportunities',
      'airline recruitment programs',
      'airline hiring criteria',
      'major airline hiring',
      'regional airline recruitment',
      'international airline jobs',
      'airline pilot selection',
      'airline hiring news',
      'aviation recruitment',
      'airline job applications',
      'pilot recruitment process',
      'airline hiring boom',
      'commercial aviation hiring',
      'airline crew recruitment',
      'airline hiring statistics',
      'pilot shortage hiring',
      'airline recruitment agencies',
      'airline hiring events',
      'aviation industry hiring',
      'airline pilot demand',
      'airline recruitment fair',
      'commercial pilot hiring',
      'airline employment trends'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Aviation Interview',
    slug: { current: 'aviation-interview' },
    description: 'Preparation strategies and insights for aviation interviews, focusing on pilot positions and careers in the airline industry.',
    color: 'teal',
    category: 'career',
    seoKeywords: [
      'pilot recruitment process',
      'commercial pilot recruitment',
      'airline pilot selection',
      'pilot recruitment agencies',
      'aviation recruitment consultants',
      'pilot hiring process',
      'flight crew recruitment',
      'pilot recruitment requirements',
      'aviation talent acquisition',
      'pilot recruitment trends',
      'commercial aviation recruitment',
      'pilot selection criteria',
      'airline recruitment process',
      'pilot recruitment programs',
      'aviation recruitment services',
      'pilot career recruitment',
      'flight instructor recruitment',
      'pilot recruitment opportunities',
      'aviation recruitment firms',
      'pilot job recruitment',
      'commercial pilot selection',
      'airline pilot recruiting',
      'pilot recruitment strategies',
      'aviation recruitment process',
      'pilot recruitment events',
      'flight crew selection',
      'pilot recruitment standards',
      'aviation industry recruitment',
      'pilot recruitment consultancy',
      'commercial aviation recruiting'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  }
];

/**
 * Create Sanity client with write permissions
 */
function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required. Please check your .env.local file.');
  }

  if (!token) {
    throw new Error('SANITY_API_TOKEN is required for write operations. Please check your .env.local file.');
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false, // Disable CDN for write operations
  });
}

/**
 * Check if a tag already exists
 */
async function tagExists(client: any, slug: string): Promise<boolean> {
  try {
    const existingTag = await client.fetch(
      `*[_type == "tag" && slug.current == $slug][0]`,
      { slug }
    );
    return !!existingTag;
  } catch (error) {
    log.warning(`Error checking tag existence for ${slug}: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Create a single tag in Sanity
 */
async function createTag(client: any, tagData: any): Promise<boolean> {
  try {
    log.step(`Creating tag: ${tagData.title}`);
    
    // Check if tag already exists
    const exists = await tagExists(client, tagData.slug.current);
    if (exists) {
      log.warning(`Tag "${tagData.title}" already exists. Skipping...`);
      return false;
    }

    // Create the tag document
    const result = await client.create({
      _type: 'tag',
      ...tagData,
    });

    log.success(`Successfully created tag: ${tagData.title} (ID: ${result._id})`);
    return true;
  } catch (error) {
    log.error(`Failed to create tag "${tagData.title}": ${(error as Error).message}`);
    return false;
  }
}

/**
 * Test Sanity connection and permissions
 */
async function testConnection(client: any): Promise<void> {
  try {
    log.step('Testing Sanity connection...');
    
    // Test read access
    await client.fetch('*[_type == "tag"][0...1]');
    log.success('Read access confirmed');
    
    // Test write access by creating a temporary document
    const testDoc = {
      _type: 'tag',
      title: 'Connection Test - Will be deleted',
      slug: { current: `connection-test-${Date.now()}` },
      description: 'This is a test document for connection validation',
      color: 'gray',
      category: 'general',
      seoKeywords: ['test'],
      isActive: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    const created = await client.create(testDoc);
    await client.delete(created._id);
    log.success('Write access confirmed');
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('insufficient permissions')) {
      throw new Error('Insufficient permissions. Please ensure your SANITY_API_TOKEN has Editor or Administrator permissions.');
    } else if (errorMessage.includes('unauthorized')) {
      throw new Error('Unauthorized access. Please check your SANITY_API_TOKEN is valid.');
    } else if (errorMessage.includes('project not found')) {
      throw new Error('Project not found. Please check your NEXT_PUBLIC_SANITY_PROJECT_ID is correct.');
    } else {
      throw new Error(`Connection test failed: ${errorMessage}`);
    }
  }
}

/**
 * Display configuration summary
 */
function displayConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const hasToken = !!process.env.SANITY_API_TOKEN;
  
  console.log(`\n${colors.bright}=== Aviation Tags Auto-Population Script ===${colors.reset}`);
  console.log(`${colors.cyan}Project ID:${colors.reset} ${projectId}`);
  console.log(`${colors.cyan}Dataset:${colors.reset} ${dataset}`);
  console.log(`${colors.cyan}Has Token:${colors.reset} ${hasToken ? '✅' : '❌'}`);
  console.log(`${colors.cyan}Tags to create:${colors.reset} ${aviationTags.length}`);
  console.log('');
}

/**
 * Display final results
 */
function displayResults(results: { created: number; skipped: number; failed: number }) {
  console.log(`\n${colors.bright}=== Results ===${colors.reset}`);
  log.success(`Created: ${results.created} tags`);
  log.warning(`Skipped: ${results.skipped} tags (already exist)`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed} tags`);
  }
  console.log('');
  
  if (results.created > 0) {
    log.info('Tags have been created successfully! You can now:');
    console.log('  • View them in Sanity Studio');
    console.log('  • Assign them to blog posts');
    console.log('  • Use them for content organization');
    console.log('  • Leverage the SEO keywords for content strategy');
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    displayConfig();
    
    // Create Sanity client
    log.step('Initializing Sanity client...');
    const client = createSanityClient();
    
    // Test connection
    await testConnection(client);
    
    // Create tags
    log.step('Starting tag creation process...');
    const results = { created: 0, skipped: 0, failed: 0 };
    
    for (const tagData of aviationTags) {
      const success = await createTag(client, tagData);
      if (success) {
        results.created++;
      } else {
        // Check if it was skipped or failed
        const exists = await tagExists(client, tagData.slug.current);
        if (exists) {
          results.skipped++;
        } else {
          results.failed++;
        }
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    displayResults(results);
    
    if (results.failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Script failed: ${(error as Error).message}`);
    console.log('\n📋 Troubleshooting tips:');
    console.log('  • Ensure your .env.local file has all required Sanity variables');
    console.log('  • Check that SANITY_API_TOKEN has Editor or Administrator permissions');
    console.log('  • Verify your Sanity project ID and dataset are correct');
    console.log('  • Make sure you have internet connection');
    console.log('');
    process.exit(1);
  }
}

// Add the script to package.json if needed
const packageJsonNote = `
📝 To add this to your package.json scripts, add:
"tags:populate": "tsx tools/scripts/development/populate-aviation-tags.ts"

Then run with: npm run tags:populate
`;

// Execute if called directly
if (require.main === module || process.argv[1]?.includes('populate-aviation-tags')) {
  main().catch((error) => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

export default main;
