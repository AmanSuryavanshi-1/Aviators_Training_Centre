import { enhancedClient } from '@/lib/sanity/client';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';
import fs from 'fs';
import path from 'path';

interface CleanBlogPost {
  title: string;
  content: string;
  excerpt: string;
  category?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

class SanityBlogCleanup {
  
  /**
   * ⚠️  WARNING: This will delete ALL blog posts from Sanity CMS
   * Make sure you have a backup before running this function
   */
  async deleteAllBlogPosts(): Promise<void> {
    try {
      console.log('🔍 Fetching all blog posts...');
      
      // Fetch all post IDs
      const posts = await enhancedClient.fetch(`
        *[_type == "post"] {
          _id,
          title
        }
      `);

      if (posts.length === 0) {
        console.log('✅ No blog posts found in Sanity');
        return;
      }

      console.log(`📝 Found ${posts.length} blog posts to delete`);
      
      // Delete posts in batches to avoid rate limits
      const batchSize = 10;
      let deletedCount = 0;

      for (let i = 0; i < posts.length; i += batchSize) {
        const batch = posts.slice(i, i + batchSize);
        
        console.log(`🗑️  Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}...`);
        
        const deletePromises = batch.map(async (post: any) => {
          try {
            await enhancedClient.delete(post._id);
            console.log(`   ✅ Deleted: ${post.title}`);
            deletedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to delete ${post.title}:`, error);
          }
        });

        await Promise.all(deletePromises);
        
        // Add a small delay between batches
        if (i + batchSize < posts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`🎉 Successfully deleted ${deletedCount} out of ${posts.length} blog posts`);
      
      // Clear the unified service cache
      unifiedBlogService.clearCache();
      
    } catch (error) {
      console.error('❌ Error during bulk deletion:', error);
      throw error;
    }
  }

  /**
   * Upload clean blog posts to Sanity
   */
  async uploadCleanBlogPosts(posts: CleanBlogPost[]): Promise<void> {
    try {
      console.log(`📤 Starting upload of ${posts.length} blog posts...`);
      
      let successCount = 0;
      let failureCount = 0;

      for (const [index, postData] of posts.entries()) {
        try {
          console.log(`📝 Creating post ${index + 1}/${posts.length}: ${postData.title}...`);
          
          await unifiedBlogService.createPost(postData);
          successCount++;
          console.log(`   ✅ Successfully created: ${postData.title}`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          failureCount++;
          console.error(`   ❌ Failed to create ${postData.title}:`, error);
        }
      }

      console.log(`🎉 Upload complete! Success: ${successCount}, Failures: ${failureCount}`);
      
    } catch (error) {
      console.error('❌ Error during bulk upload:', error);
      throw error;
    }
  }

  /**
   * Load blog posts from a JSON file
   */
  loadBlogPostsFromFile(filePath: string): CleanBlogPost[] {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      const posts = JSON.parse(fileContent);
      
      if (!Array.isArray(posts)) {
        throw new Error('Blog posts file must contain an array of posts');
      }
      
      // Validate each post has required fields
      posts.forEach((post, index) => {
        if (!post.title || !post.content || !post.excerpt) {
          throw new Error(`Post at index ${index} is missing required fields (title, content, excerpt)`);
        }
      });
      
      console.log(`📚 Loaded ${posts.length} blog posts from ${filePath}`);
      return posts;
      
    } catch (error) {
      console.error(`❌ Error loading blog posts from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Generate sample blog posts for testing
   */
  generateSamplePosts(): CleanBlogPost[] {
    return [
      {
        title: "Introduction to Private Pilot License",
        excerpt: "Everything you need to know about getting your PPL and starting your aviation journey.",
        content: `# Introduction to Private Pilot License

Getting your Private Pilot License (PPL) is an exciting milestone that opens up a world of aviation opportunities. This comprehensive guide will walk you through everything you need to know.

## What is a Private Pilot License?

A Private Pilot License allows you to act as pilot-in-command of aircraft for non-commercial purposes. With a PPL, you can:

- Fly yourself and passengers for personal or business travel
- Share operating expenses with passengers
- Fly during day and night (with proper endorsements)
- Operate in various weather conditions (with instrument rating)

## Requirements for PPL

To obtain your PPL, you must:

1. Be at least 17 years old
2. Hold a valid medical certificate
3. Complete ground school training
4. Log minimum flight hours
5. Pass written and practical exams

## Training Process

The typical PPL training includes:

- **Ground School**: Learn aerodynamics, weather, navigation, regulations
- **Flight Training**: Hands-on flying with certified instructor
- **Solo Flights**: Flying alone to build confidence and skills
- **Cross-Country Flights**: Long-distance navigation practice

## Next Steps

Ready to start your aviation journey? Contact us today to learn more about our PPL training programs and get started on the path to becoming a licensed pilot.`,
        category: "Training",
        author: "Captain Sarah Johnson",
        tags: ["PPL", "Training", "Getting Started"],
        featured: true,
        imageUrl: "/Blogs/ppl-training.webp",
        imageAlt: "Student pilot training in aircraft cockpit"
      },
      {
        title: "Understanding Weather Patterns for Pilots",
        excerpt: "Learn how to read and interpret weather conditions for safe flying decisions.",
        content: `# Understanding Weather Patterns for Pilots

Weather is one of the most critical factors in aviation safety. Understanding weather patterns and how to interpret meteorological data is essential for every pilot.

## Key Weather Elements

### Wind
- **Direction and Speed**: Affects takeoff, landing, and flight path
- **Gusts**: Can create turbulence and handling challenges
- **Wind Shear**: Sudden changes in wind direction or speed

### Visibility
- **Flight Visibility**: How far you can see from the cockpit
- **Ground Visibility**: Reported visibility at airports
- **Factors**: Fog, haze, precipitation, dust

### Cloud Formations

Different cloud types indicate various weather conditions:

- **Cumulus**: Fair weather clouds
- **Stratus**: Layered clouds, often with precipitation
- **Cumulonimbus**: Thunderstorm clouds - avoid at all costs

## Weather Resources

### METAR Reports
Surface weather observations providing:
- Wind conditions
- Visibility
- Weather phenomena
- Cloud coverage
- Temperature and dewpoint

### TAF Forecasts
Terminal Aerodrome Forecasts for airports:
- Expected conditions over next 24-30 hours
- Significant weather changes
- Temporary conditions

## Making Go/No-Go Decisions

Always consider:
1. Current conditions at departure and destination
2. Weather along the route
3. Forecasted changes
4. Personal minimums and aircraft limitations
5. Alternate airports and escape routes

Remember: It's always better to be on the ground wishing you were flying than flying and wishing you were on the ground.`,
        category: "Weather",
        author: "Meteorologist Mike Davis",
        tags: ["Weather", "Safety", "Decision Making"],
        featured: false
      },
      {
        title: "Aircraft Systems: Engine Fundamentals",
        excerpt: "A comprehensive guide to understanding aircraft engine operations and maintenance.",
        content: `# Aircraft Systems: Engine Fundamentals

Understanding your aircraft's engine is crucial for safe operation and proper maintenance. This guide covers the basics of aircraft engine systems.

## Types of Aircraft Engines

### Piston Engines
Most common in general aviation:
- **Air-cooled**: Cooling fins dissipate heat
- **Horizontally opposed**: Cylinders arranged opposite each other
- **Four-stroke cycle**: Intake, compression, power, exhaust

### Turbine Engines
Used in larger aircraft:
- **Turbojet**: Pure jet propulsion
- **Turboprop**: Jet engine driving a propeller
- **Turbofan**: Most common in commercial aviation

## Engine Components

### Piston Engine Parts
1. **Cylinders**: Where combustion occurs
2. **Pistons**: Convert combustion pressure to motion
3. **Crankshaft**: Converts linear motion to rotational
4. **Valves**: Control air/fuel intake and exhaust

### Support Systems
- **Ignition System**: Provides spark for combustion
- **Fuel System**: Delivers proper fuel/air mixture
- **Oil System**: Lubricates moving parts
- **Cooling System**: Maintains operating temperature

## Engine Operations

### Pre-flight Inspection
Always check:
- Oil level and condition
- Fuel quantity and quality
- Engine mounts and accessories
- Propeller condition

### Engine Start Procedures
1. Pre-start checklist
2. Prime engine if needed
3. Clear propeller area
4. Engage starter
5. Monitor engine parameters

### In-flight Monitoring
Watch these parameters:
- Oil pressure and temperature
- Cylinder head temperature
- Fuel flow and pressure
- RPM and manifold pressure

## Maintenance Considerations

Regular maintenance includes:
- Oil changes every 25-50 hours
- Spark plug inspection
- Compression checks
- Annual or 100-hour inspections

Understanding your engine helps you operate it efficiently and recognize potential problems before they become serious issues.`,
        category: "Aircraft Systems",
        author: "A&P Mechanic Tom Wilson",
        tags: ["Aircraft Systems", "Engines", "Maintenance"],
        featured: false
      }
      // Add more sample posts as needed...
    ];
  }

  /**
   * Full cleanup and reset process
   */
  async fullReset(posts?: CleanBlogPost[]): Promise<void> {
    try {
      console.log('🚀 Starting full Sanity blog reset...\n');
      
      // Step 1: Delete all existing posts
      console.log('STEP 1: Deleting all existing blog posts');
      await this.deleteAllBlogPosts();
      console.log('✅ Deletion complete\n');
      
      // Step 2: Upload new posts
      const postsToUpload = posts || this.generateSamplePosts();
      console.log('STEP 2: Uploading clean blog posts');
      await this.uploadCleanBlogPosts(postsToUpload);
      console.log('✅ Upload complete\n');
      
      console.log('🎉 Full reset completed successfully!');
      
    } catch (error) {
      console.error('❌ Full reset failed:', error);
      throw error;
    }
  }

  /**
   * Test Sanity connection and permissions
   */
  async testConnection(): Promise<void> {
    try {
      console.log('🔍 Testing Sanity connection and permissions...');
      
      // Test basic read permission
      const posts = await enhancedClient.fetch(`*[_type == "post"][0..2] { _id, title }`);
      console.log(`✅ Read permission: OK (found ${posts.length} posts)`);
      
      // Test create permission by creating a test document
      const testDoc = await enhancedClient.create({
        _type: 'post',
        title: 'CONNECTION_TEST_DELETE_ME',
        slug: { _type: 'slug', current: 'connection-test' },
        excerpt: 'Test document for connection verification',
        body: [{ _type: 'block', children: [{ _type: 'span', text: 'Test content' }] }],
        publishedAt: new Date().toISOString(),
        featured: false,
        readingTime: 1,
        tags: ['test']
      });
      console.log('✅ Create permission: OK');
      
      // Test delete permission by deleting the test document
      await enhancedClient.delete(testDoc._id);
      console.log('✅ Delete permission: OK');
      
      console.log('🎉 All permissions verified successfully!');
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.error(`
🔧 PERMISSION ERROR DETECTED:
Your Sanity API token lacks sufficient permissions. To fix this:

1. Go to https://manage.sanity.io/
2. Select your project
3. Go to API → Tokens
4. Find your token or create a new one
5. Ensure it has these permissions:
   - Reader
   - Writer
   - Editor (for delete operations)
6. Update your .env.local file with the new token
`);
        }
      }
      
      throw error;
    }
  }
}

// Export for use in scripts
export const sanityBlogCleanup = new SanityBlogCleanup();

// CLI usage when run directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const args = process.argv.slice(2);
  const command = args[0];

  const cleanup = new SanityBlogCleanup();

  switch (command) {
    case 'test':
      cleanup.testConnection()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'delete-all':
      console.log('⚠️  WARNING: This will delete ALL blog posts from Sanity!');
      console.log('Are you sure? This action cannot be undone.');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      
      setTimeout(() => {
        cleanup.deleteAllBlogPosts()
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      }, 5000);
      break;
      
    case 'upload-sample':
      cleanup.uploadCleanBlogPosts(cleanup.generateSamplePosts())
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'full-reset':
      console.log('⚠️  WARNING: This will delete ALL blog posts and upload samples!');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      
      setTimeout(() => {
        cleanup.fullReset()
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      }, 5000);
      break;
      
    case 'upload-from-file':
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Please provide a file path: npm run cleanup upload-from-file path/to/posts.json');
        process.exit(1);
      }
      
      try {
        const posts = cleanup.loadBlogPostsFromFile(filePath);
        cleanup.uploadCleanBlogPosts(posts)
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      } catch (error) {
        console.error('❌ Failed to load posts from file:', error);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
🔧 Sanity Blog Cleanup Tool

Usage: npm run cleanup <command>

Commands:
  test                    - Test Sanity connection and permissions
  delete-all             - Delete all blog posts from Sanity
  upload-sample          - Upload sample blog posts
  full-reset             - Delete all posts and upload samples
  upload-from-file <path> - Upload posts from JSON file

Examples:
  npm run cleanup test
  npm run cleanup delete-all
  npm run cleanup upload-from-file ./my-posts.json
  npm run cleanup full-reset
`);
      process.exit(1);
  }
}
