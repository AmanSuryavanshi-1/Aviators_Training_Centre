/**
 * Script to add high-quality aviation images to blog posts
 * Uses free, high-quality images from Unsplash and Pexels
 */

import { enhancedClient } from '@/lib/sanity/client';
import { createLogger } from '@/lib/logging/production-logger';

const logger = createLogger('blog-images');

// High-quality aviation images from free sources
const aviationImages = {
  'dgca-cpl-complete-guide-2024': {
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    alt: 'Commercial pilot in cockpit preparing for flight',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  'pilot-salary-india-2024-career-earnings-guide': {
    url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Airline pilot in uniform with captain stripes',
    credit: 'Photo by Hanson Lu on Unsplash',
  },
  'dgca-medical-examination-tips-aspiring-pilots': {
    url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    alt: 'Medical examination equipment and stethoscope',
    credit: 'Photo by Hush Naidoo Jade Photography on Unsplash',
  },
  'flight-simulator-training-benefits-student-pilots': {
    url: 'https://images.unsplash.com/photo-1583829228515-5b8b8c0e8b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Flight simulator cockpit with modern avionics',
    credit: 'Photo by Avel Chuklanov on Unsplash',
  },
  'aviation-technology-trends-future-flying-2024': {
    url: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    alt: 'Modern aircraft with advanced technology and sleek design',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  'airline-industry-career-opportunities-beyond-pilot-jobs': {
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    alt: 'Airport ground crew and aviation professionals working',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
};

// Additional high-quality aviation images for variety
const additionalAviationImages = [
  {
    url: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Aircraft wing view during flight with clouds',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Modern airport terminal with aircraft',
    credit: 'Photo by Ashim D\'Silva on Unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1583829228515-5b8b8c0e8b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Aviation training classroom with flight instruments',
    credit: 'Photo by Avel Chuklanov on Unsplash',
  },
];

async function uploadImageToSanity(imageUrl: string, filename: string, alt: string): Promise<string | null> {
  try {
    logger.info(`Uploading image: ${filename}`);
    
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    // Upload to Sanity
    const asset = await enhancedClient.client.assets.upload('image', imageBlob, {
      filename: `${filename}.jpg`,
      title: alt,
      description: alt,
      creditLine: aviationImages[filename as keyof typeof aviationImages]?.credit || 'Free aviation image',
    });
    
    logger.info(`Successfully uploaded image: ${asset._id}`);
    return asset._id;
  } catch (error) {
    logger.error(`Failed to upload image ${filename}:`, error);
    return null;
  }
}

async function updateBlogPostWithImage(slug: string, imageAssetId: string): Promise<void> {
  try {
    // Find the blog post by slug
    const posts = await enhancedClient.fetch(
      `*[_type == "post" && slug.current == $slug]`,
      { slug }
    );
    
    if (posts.length === 0) {
      logger.warn(`No blog post found with slug: ${slug}`);
      return;
    }
    
    const post = posts[0];
    
    // Update the post with the image
    await enhancedClient.client
      .patch(post._id)
      .set({
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId,
          },
          alt: aviationImages[slug as keyof typeof aviationImages]?.alt || 'Aviation related image',
        },
      })
      .commit();
    
    logger.info(`Updated blog post ${slug} with image`);
  } catch (error) {
    logger.error(`Failed to update blog post ${slug}:`, error);
  }
}

async function addImagesToAllBlogPosts(): Promise<void> {
  logger.info('Starting to add images to blog posts...');
  
  try {
    // Process each blog post
    for (const [slug, imageData] of Object.entries(aviationImages)) {
      logger.info(`Processing blog post: ${slug}`);
      
      // Upload image to Sanity
      const imageAssetId = await uploadImageToSanity(
        imageData.url,
        slug,
        imageData.alt
      );
      
      if (imageAssetId) {
        // Update blog post with image
        await updateBlogPostWithImage(slug, imageAssetId);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    logger.info('Completed adding images to blog posts');
  } catch (error) {
    logger.error('Error in addImagesToAllBlogPosts:', error);
  }
}

async function createImageAssets(): Promise<void> {
  logger.info('Creating image assets for future use...');
  
  try {
    for (let i = 0; i < additionalAviationImages.length; i++) {
      const imageData = additionalAviationImages[i];
      const filename = `aviation-stock-${i + 1}`;
      
      await uploadImageToSanity(imageData.url, filename, imageData.alt);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    logger.info('Completed creating additional image assets');
  } catch (error) {
    logger.error('Error creating image assets:', error);
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    logger.info('Starting blog image management script...');
    
    // Add images to existing blog posts
    await addImagesToAllBlogPosts();
    
    // Create additional image assets
    await createImageAssets();
    
    logger.info('Blog image management completed successfully');
  } catch (error) {
    logger.error('Blog image management failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { addImagesToAllBlogPosts, createImageAssets };