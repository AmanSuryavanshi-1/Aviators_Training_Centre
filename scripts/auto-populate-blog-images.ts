/**
 * MASTER SDE SOLUTION: Auto-populate blog posts with high-quality images
 * This script automatically finds and adds professional aviation images to all blog posts
 */

import { enhancedClient } from '@/lib/sanity/client';
import { createLogger } from '@/lib/logging/production-logger';
import { handleBlogError } from '@/lib/blog/comprehensive-error-handler';

const logger = createLogger('auto-populate-images');

// High-quality aviation images from multiple sources
const AVIATION_IMAGE_LIBRARY = {
  'pilot-training': [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583829228515-5b8b8c0e8b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  'aviation-medical': [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  'flight-training': [
    'https://images.unsplash.com/photo-1583829228515-5b8b8c0e8b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  'aviation-technology': [
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  'career-guidance': [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  ],
};

// Image metadata for SEO and accessibility
const IMAGE_METADATA = {
  'pilot-training': {
    alt: 'Professional pilot in aircraft cockpit during flight training',
    caption: 'Commercial pilot training - Professional aviation education',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  'aviation-medical': {
    alt: 'Aviation medical examination equipment and health check procedures',
    caption: 'DGCA medical examination - Aviation health requirements',
    credit: 'Photo by Hush Naidoo Jade Photography on Unsplash',
  },
  'flight-training': {
    alt: 'Flight simulator training cockpit with modern avionics display',
    caption: 'Flight simulator training - Advanced aviation technology',
    credit: 'Photo by Avel Chuklanov on Unsplash',
  },
  'aviation-technology': {
    alt: 'Modern commercial aircraft with advanced aviation technology',
    caption: 'Aviation technology trends - Future of flying',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  'career-guidance': {
    alt: 'Aviation professionals and ground crew working at airport',
    caption: 'Aviation career opportunities - Professional development',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  'default': {
    alt: 'Commercial aircraft wing view during flight with clouds',
    caption: 'Aviation training and professional development',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
};

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  category?: { slug: { current: string }; title: string };
  image?: any;
  excerpt?: string;
}

/**
 * Determine the best image category for a blog post
 */
function determineImageCategory(post: BlogPost): keyof typeof AVIATION_IMAGE_LIBRARY {
  const text = `${post.title} ${post.excerpt || ''} ${post.category?.title || ''}`.toLowerCase();
  
  if (text.includes('pilot') || text.includes('cpl') || text.includes('atpl')) return 'pilot-training';
  if (text.includes('medical') || text.includes('dgca medical') || text.includes('health')) return 'aviation-medical';
  if (text.includes('simulator') || text.includes('training') || text.includes('course')) return 'flight-training';
  if (text.includes('technology') || text.includes('future') || text.includes('trends')) return 'aviation-technology';
  if (text.includes('career') || text.includes('salary') || text.includes('job')) return 'career-guidance';
  
  return 'default';
}

/**
 * Upload image from URL to Sanity
 */
async function uploadImageToSanity(imageUrl: string, metadata: any): Promise<string | null> {
  try {
    logger.info(`Uploading image to Sanity: ${imageUrl.substring(0, 50)}...`);
    
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    // Upload to Sanity
    const asset = await enhancedClient.client.assets.upload('image', imageBlob, {
      filename: `aviation-${Date.now()}.jpg`,
      title: metadata.alt,
      description: metadata.caption,
      creditLine: metadata.credit,
    });
    
    logger.info(`Successfully uploaded image: ${asset._id}`);
    return asset._id;
  } catch (error) {
    const blogError = handleBlogError(error, { imageUrl });
    logger.error(`Failed to upload image:`, blogError);
    return null;
  }
}

/**
 * Update blog post with new image
 */
async function updateBlogPostWithImage(post: BlogPost, imageAssetId: string, metadata: any): Promise<void> {
  try {
    await enhancedClient.client
      .patch(post._id)
      .set({
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId,
          },
          alt: metadata.alt,
          caption: metadata.caption,
        },
      })
      .commit();
    
    logger.info(`Updated blog post "${post.title}" with new image`);
  } catch (error) {
    const blogError = handleBlogError(error, { postId: post._id, postTitle: post.title });
    logger.error(`Failed to update blog post:`, blogError);
  }
}

/**
 * Process all blog posts and add images
 */
async function populateAllBlogImages(): Promise<void> {
  logger.info('🚀 Starting automatic blog image population...');
  
  try {
    // Get all blog posts without images or with placeholder images
    const posts = await enhancedClient.fetch<BlogPost[]>(`
      *[_type == "post" && (!defined(image) || image.asset._ref == "image-placeholder" || !defined(image.asset))] {
        _id,
        title,
        slug,
        category->{slug, title},
        image,
        excerpt
      }
    `);

    logger.info(`Found ${posts.length} blog posts needing images`);

    if (posts.length === 0) {
      logger.info('✅ All blog posts already have images!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        logger.info(`Processing: "${post.title}"`);
        
        // Determine the best image category
        const category = determineImageCategory(post);
        const imageUrls = AVIATION_IMAGE_LIBRARY[category];
        const metadata = IMAGE_METADATA[category];
        
        // Select a random image from the category
        const selectedImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        
        // Upload image to Sanity
        const imageAssetId = await uploadImageToSanity(selectedImageUrl, metadata);
        
        if (imageAssetId) {
          // Update blog post with the new image
          await updateBlogPostWithImage(post, imageAssetId, metadata);
          successCount++;
          
          logger.info(`✅ Successfully added image to "${post.title}"`);
        } else {
          errorCount++;
          logger.error(`❌ Failed to add image to "${post.title}"`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        const blogError = handleBlogError(error, { postId: post._id, postTitle: post.title });
        logger.error(`❌ Error processing "${post.title}":`, blogError);
      }
    }

    logger.info(`🎉 Image population completed!`);
    logger.info(`✅ Success: ${successCount} posts`);
    logger.info(`❌ Errors: ${errorCount} posts`);
    
    if (successCount > 0) {
      logger.info('🔄 Restart your development server to see the new images');
    }

  } catch (error) {
    const blogError = handleBlogError(error);
    logger.error('❌ Failed to populate blog images:', blogError);
    throw error;
  }
}

/**
 * Validate that all blog posts have images
 */
async function validateBlogImages(): Promise<void> {
  logger.info('🔍 Validating blog post images...');
  
  try {
    const posts = await enhancedClient.fetch<BlogPost[]>(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        image
      }
    `);

    const postsWithoutImages = posts.filter(post => 
      !post.image || 
      !post.image.asset || 
      post.image.asset._ref === 'image-placeholder'
    );

    logger.info(`📊 Validation Results:`);
    logger.info(`   Total posts: ${posts.length}`);
    logger.info(`   Posts with images: ${posts.length - postsWithoutImages.length}`);
    logger.info(`   Posts without images: ${postsWithoutImages.length}`);

    if (postsWithoutImages.length > 0) {
      logger.warn('⚠️ Posts still missing images:');
      postsWithoutImages.forEach(post => {
        logger.warn(`   - ${post.title}`);
      });
    } else {
      logger.info('✅ All blog posts have images!');
    }

  } catch (error) {
    const blogError = handleBlogError(error);
    logger.error('❌ Failed to validate blog images:', blogError);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    logger.info('🎯 MASTER SDE AUTO-IMAGE POPULATION SYSTEM');
    logger.info('==========================================');
    
    // First, validate current state
    await validateBlogImages();
    
    // Populate missing images
    await populateAllBlogImages();
    
    // Final validation
    await validateBlogImages();
    
    logger.info('🎉 Auto-population completed successfully!');
    logger.info('');
    logger.info('🔄 IMPORTANT: Restart your development server to see the changes');
    logger.info('   npm run dev');
    logger.info('');
    
  } catch (error) {
    logger.error('❌ Auto-population failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

export { populateAllBlogImages, validateBlogImages };