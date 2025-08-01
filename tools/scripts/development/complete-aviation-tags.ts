#!/usr/bin/env tsx

/**
 * Complete Aviation Tags Population Script
 * 
 * This script creates all missing aviation tags with complete information including:
 * - Descriptions
 * - Tag Colors
 * - Categories
 * - Related Courses
 * - SEO Keywords
 * 
 * Usage:
 * tsx tools/scripts/development/complete-aviation-tags.ts
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';

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

// Complete aviation tags data with all required information
const completeAviationTags = [
  {
    title: 'Aviation Interview',
    slug: { current: 'aviation-interview' },
    description: 'Comprehensive preparation strategies and insights for aviation interviews, tailored to pilots and airline career aspirants seeking successful job placements.',
    color: 'purple',
    category: 'career',
    seoKeywords: [
      'aviation interview preparation',
      'pilot interview questions',
      'airline interview tips',
      'commercial pilot interview',
      'aviation job interview',
      'pilot recruitment interview',
      'airline hiring interview',
      'aviation career interview',
      'pilot interview coaching',
      'aviation interview success',
      'airline pilot interview prep',
      'aviation interview guide',
      'pilot job interview skills',
      'commercial aviation interview',
      'flight crew interview prep',
      'aviation interview techniques',
      'pilot interview confidence',
      'airline interview process',
      'aviation interview practice',
      'pilot career interview tips'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['Airline Interview Preparation']
  },
  {
    title: 'Interview Preparation',
    slug: { current: 'interview-preparation' },
    description: 'Essential interview preparation resources and techniques for aviation professionals, covering technical questions, behavioral assessments, and career positioning.',
    color: 'blue',
    category: 'career',
    seoKeywords: [
      'interview preparation guide',
      'job interview tips',
      'interview techniques',
      'interview skills training',
      'professional interview prep',
      'interview confidence building',
      'interview question practice',
      'interview success strategies',
      'career interview guidance',
      'interview coaching services',
      'behavioral interview prep',
      'technical interview questions',
      'interview communication skills',
      'interview presentation tips',
      'interview follow-up strategies',
      'interview performance improvement',
      'interview anxiety management',
      'interview best practices',
      'interview preparation checklist',
      'interview readiness assessment'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['CPL Ground School']
  },
  {
    title: 'Career Success',
    slug: { current: 'career-success' },
    description: 'Strategic insights and actionable advice for building successful aviation careers, from entry-level positions to senior leadership roles in the industry.',
    color: 'green',
    category: 'career',
    seoKeywords: [
      'career success strategies',
      'professional development',
      'career advancement tips',
      'aviation career growth',
      'career planning guide',
      'professional success habits',
      'career goal achievement',
      'leadership development',
      'career progression paths',
      'workplace success skills',
      'career mentorship',
      'professional networking',
      'career transition strategies',
      'skill development planning',
      'career performance optimization',
      'professional growth mindset',
      'career milestone planning',
      'industry expertise building',
      'career resilience strategies',
      'professional achievement goals'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Airline Recruitment',
    slug: { current: 'airline-recruitment' },
    description: 'Comprehensive information about airline recruitment processes, hiring trends, and opportunities in commercial aviation careers across major airlines worldwide.',
    color: 'teal',
    category: 'career',
    seoKeywords: [
      'airline recruitment 2024',
      'commercial airline hiring',
      'pilot recruitment process',
      'airline job opportunities',
      'airline hiring trends',
      'major airline recruitment',
      'international airline jobs',
      'airline pilot selection',
      'airline crew recruitment',
      'aviation recruitment agencies',
      'airline hiring requirements',
      'commercial aviation careers',
      'airline employment opportunities',
      'pilot job openings',
      'airline recruitment programs',
      'aviation job market',
      'airline hiring process',
      'flight crew opportunities',
      'airline career pathways',
      'aviation industry hiring'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Aviation Ground School',
    slug: { current: 'aviation-ground-school' },
    description: 'Comprehensive aviation ground school curriculum covering theoretical knowledge, DGCA requirements, and essential subjects for pilot training and certification.',
    color: 'teal',
    category: 'training',
    seoKeywords: [
      'aviation ground school courses',
      'DGCA ground school',
      'pilot theory classes',
      'aviation education programs',
      'ground school curriculum',
      'flight training theory',
      'aviation knowledge base',
      'pilot ground training',
      'aviation theory subjects',
      'ground school certification',
      'aviation academic courses',
      'pilot education programs',
      'aviation ground studies',
      'flight theory education',
      'aviation learning modules',
      'ground school preparation',
      'aviation theory mastery',
      'pilot knowledge building',
      'aviation study programs',
      'ground school excellence'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['CPL Ground School', 'Technical General Ground School']
  },
  {
    title: 'DGCA Training',
    slug: { current: 'dgca-training' },
    description: 'Specialized DGCA training programs and resources covering all aspects of Indian aviation regulations, licensing requirements, and examination preparation.',
    color: 'orange',
    category: 'regulations',
    seoKeywords: [
      'DGCA training programs',
      'DGCA CPL preparation',
      'DGCA ATPL courses',
      'Indian aviation regulations',
      'DGCA exam preparation',
      'DGCA licensing process',
      'DGCA ground school',
      'aviation regulations India',
      'DGCA compliance training',
      'pilot licensing India',
      'DGCA certification',
      'aviation law India',
      'DGCA requirements',
      'Indian pilot training',
      'DGCA syllabus',
      'aviation regulatory training',
      'DGCA approved courses',
      'pilot license India',
      'DGCA examination guide',
      'aviation training India'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['DGCA CPL Ground School', 'Technical General Ground School']
  },
  {
    title: 'Pilot Theory',
    slug: { current: 'pilot-theory' },
    description: 'In-depth exploration of essential pilot theory subjects including navigation, meteorology, aircraft systems, and technical knowledge for aviation professionals.',
    color: 'blue',
    category: 'technical',
    seoKeywords: [
      'pilot theory subjects',
      'aviation meteorology',
      'air navigation theory',
      'aircraft technical knowledge',
      'flight theory principles',
      'aviation physics',
      'aerodynamics theory',
      'pilot knowledge areas',
      'aviation technical subjects',
      'flight navigation theory',
      'aircraft systems theory',
      'aviation weather theory',
      'pilot theoretical knowledge',
      'aviation science concepts',
      'flight mechanics theory',
      'aviation technical education',
      'pilot academic subjects',
      'aviation theory mastery',
      'flight theory fundamentals',
      'pilot knowledge building'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['Technical General Ground School']
  },
  {
    title: 'Aviation Education',
    slug: { current: 'aviation-education' },
    description: 'Comprehensive aviation education resources covering academic programs, training institutions, and educational pathways for aspiring aviation professionals.',
    color: 'purple',
    category: 'general',
    seoKeywords: [
      'aviation education programs',
      'aviation degree courses',
      'aviation training institutes',
      'aviation academic programs',
      'pilot education pathways',
      'aviation universities',
      'aviation study options',
      'aviation career education',
      'flight training education',
      'aviation learning resources',
      'aviation educational institutions',
      'pilot training schools',
      'aviation knowledge development',
      'aviation professional education',
      'flight education programs',
      'aviation skill development',
      'aviation certification courses',
      'pilot development programs',
      'aviation industry education',
      'aviation career preparation'
    ],
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    relatedCourses: ['CPL Ground School', 'ATPL Ground School']
  },
  {
    title: 'Flight Training',
    slug: { current: 'flight-training' },
    description: 'Complete flight training resources covering all aspects from private pilot license to commercial aviation, including ground school and practical flight training.',
    color: 'green',
    category: 'training',
    seoKeywords: [
      'flight training programs',
      'pilot training courses',
      'aviation training schools',
      'flight instruction',
      'pilot certification training',
      'commercial pilot training',
      'private pilot training',
      'flight training academy',
      'aviation training centers',
      'pilot development programs',
      'flight training curriculum',
      'aviation skill training',
      'pilot proficiency training',
      'flight safety training',
      'aviation practical training',
      'pilot competency development',
      'flight training excellence',
      'aviation professional training',
      'pilot career training',
      'flight training standards'
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
 * Check if a tag already exists and update it if needed
 */
async function createOrUpdateTag(client: any, tagData: any): Promise<{ action: string; success: boolean }> {
  try {
    log.step(`Processing tag: ${tagData.title}`);
    
    // Check if tag already exists
    const existingTag = await client.fetch(
      `*[_type == "tag" && slug.current == $slug][0]`,
      { slug: tagData.slug.current }
    );

    if (existingTag) {
      // Update existing tag if it has missing information
      const needsUpdate = !existingTag.description || 
                         !existingTag.seoKeywords || 
                         existingTag.seoKeywords.length === 0 ||
                         !existingTag.color ||
                         !existingTag.category ||
                         !existingTag.relatedCourses;

      if (needsUpdate) {
        const updateData: any = {
          description: tagData.description,
          color: tagData.color,
          category: tagData.category,
          seoKeywords: tagData.seoKeywords,
          isActive: tagData.isActive,
        };
        
        // Only add relatedCourses if it exists in tagData
        if (tagData.relatedCourses) {
          updateData.relatedCourses = tagData.relatedCourses;
        }
        
        const updatedTag = await client
          .patch(existingTag._id)
          .set(updateData)
          .commit();

        log.success(`Updated tag: ${tagData.title} (ID: ${updatedTag._id})`);
        return { action: 'updated', success: true };
      } else {
        log.warning(`Tag "${tagData.title}" already exists and is complete. Skipping...`);
        return { action: 'skipped', success: true };
      }
    } else {
      // Create new tag
      const result = await client.create({
        _type: 'tag',
        ...tagData,
      });

      log.success(`Created tag: ${tagData.title} (ID: ${result._id})`);
      return { action: 'created', success: true };
    }
  } catch (error) {
    log.error(`Failed to process tag "${tagData.title}": ${(error as Error).message}`);
    return { action: 'failed', success: false };
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
  
  console.log(`\n${colors.bright}=== Complete Aviation Tags Population Script ===${colors.reset}`);
  console.log(`${colors.cyan}Project ID:${colors.reset} ${projectId}`);
  console.log(`${colors.cyan}Dataset:${colors.reset} ${dataset}`);
  console.log(`${colors.cyan}Has Token:${colors.reset} ${hasToken ? '✅' : '❌'}`);
  console.log(`${colors.cyan}Tags to process:${colors.reset} ${completeAviationTags.length}`);
  console.log('');
}

/**
 * Display final results
 */
function displayResults(results: { created: number; updated: number; skipped: number; failed: number }) {
  console.log(`\n${colors.bright}=== Results ===${colors.reset}`);
  log.success(`Created: ${results.created} tags`);
  log.info(`Updated: ${results.updated} tags`);
  log.warning(`Skipped: ${results.skipped} tags (already complete)`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed} tags`);
  }
  console.log('');
  
  if (results.created > 0 || results.updated > 0) {
    log.info('Tags have been processed successfully! You can now:');
    console.log('  • View them in Sanity Studio');
    console.log('  • Assign them to blog posts');
    console.log('  • Use them for content organization');
    console.log('  • Leverage the SEO keywords for content strategy');
    console.log('  • Filter content by categories and colors');
    console.log('  • Track usage analytics');
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
    
    // Process tags
    log.step('Starting tag processing...');
    const results = { created: 0, updated: 0, skipped: 0, failed: 0 };
    
    for (const tagData of completeAviationTags) {
      const result = await createOrUpdateTag(client, tagData);
      
      if (result.success) {
        switch (result.action) {
          case 'created':
            results.created++;
            break;
          case 'updated':
            results.updated++;
            break;
          case 'skipped':
            results.skipped++;
            break;
        }
      } else {
        results.failed++;
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

// Execute if called directly
if (require.main === module || process.argv[1]?.includes('complete-aviation-tags')) {
  main().catch((error) => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

export default main;
