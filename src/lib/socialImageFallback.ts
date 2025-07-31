import { sanityClient } from './sanity/client'

/**
 * Fallback system for social image generation
 */

// Default fallback images stored in Sanity
const FALLBACK_IMAGES = {
  'aviation-training': 'image-fallback-aviation-training',
  'technical-general': 'image-fallback-technical-general',
  'technical-specific': 'image-fallback-technical-specific',
  'cpl-ground-school': 'image-fallback-cpl-ground-school',
  'atpl-ground-school': 'image-fallback-atpl-ground-school',
  'type-rating': 'image-fallback-type-rating',
  'general-aviation': 'image-fallback-general-aviation',
  'default': 'image-fallback-default',
}

/**
 * Get fallback social image based on category
 */
export function getFallbackImageId(category?: string): string {
  if (!category) return FALLBACK_IMAGES.default

  const categoryKey = category.toLowerCase().replace(/\s+/g, '-')
  return FALLBACK_IMAGES[categoryKey as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.default
}

/**
 * Create fallback social image reference for Sanity
 */
export function createFallbackImageReference(category?: string) {
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: getFallbackImageId(category),
    },
    alt: `Social media image for ${category || 'blog post'}`,
  }
}

/**
 * Update post with fallback image if generation fails
 */
export async function setFallbackSocialImage(postId: string, category?: string): Promise<boolean> {
  try {
    const fallbackImage = createFallbackImageReference(category)
    
    await sanityClient
      .patch(postId)
      .set({ openGraphImage: fallbackImage })
      .commit()

    console.log('Fallback social image set for post:', postId)
    return true

  } catch (error) {
    console.error('Error setting fallback social image:', error)
    return false
  }
}

/**
 * Check if current image is a fallback image
 */
export function isFallbackImage(imageRef?: string): boolean {
  if (!imageRef) return false
  return Object.values(FALLBACK_IMAGES).includes(imageRef)
}

/**
 * Generate simple text-based social image as ultimate fallback
 */
export function generateTextBasedSocialImageUrl(title: string, category?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const params = new URLSearchParams({
    title: title.substring(0, 100), // Limit title length
    category: category || 'Blog Post',
    template: 'minimal',
  })
  
  return `${baseUrl}/api/social-image/text?${params.toString()}`
}

/**
 * Comprehensive fallback strategy
 */
export async function applySocialImageFallback(
  postId: string, 
  title: string, 
  category?: string
): Promise<{ success: boolean; method: string; imageRef?: string }> {
  try {
    // Strategy 1: Try to use predefined fallback image
    const fallbackSuccess = await setFallbackSocialImage(postId, category)
    if (fallbackSuccess) {
      return {
        success: true,
        method: 'predefined-fallback',
        imageRef: getFallbackImageId(category),
      }
    }

    // Strategy 2: Generate text-based image URL (for external use)
    const textImageUrl = generateTextBasedSocialImageUrl(title, category)
    
    return {
      success: true,
      method: 'text-based-url',
      imageRef: textImageUrl,
    }

  } catch (error) {
    console.error('Error applying social image fallback:', error)
    return {
      success: false,
      method: 'none',
    }
  }
}

/**
 * Validate social image exists and is accessible
 */
export async function validateSocialImage(imageRef: string): Promise<boolean> {
  try {
    if (imageRef.startsWith('http')) {
      // External URL - try to fetch
      const response = await fetch(imageRef, { method: 'HEAD' })
      return response.ok
    } else {
      // Sanity asset - check if exists
      const asset = await sanityClient.fetch(`
        *[_type == "sanity.imageAsset" && _id == $imageRef][0] {
          _id,
          url
        }
      `, { imageRef })
      
      return !!asset
    }
  } catch (error) {
    console.error('Error validating social image:', error)
    return false
  }
}
