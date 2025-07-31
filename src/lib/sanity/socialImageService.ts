import { sanityClient } from './client'
import { generateSocialImage, getOptimalTemplate } from '../socialImageGenerator'
import { applySocialImageFallback } from '../socialImageFallback'

export interface BlogPostData {
  _id: string
  title: string
  seoTitle?: string
  slug: { current: string }
  category?: { title: string }
  author?: { name: string }
  openGraphImage?: any
}

/**
 * Generate and upload social image to Sanity assets
 */
export async function generateAndUploadSocialImage(
  postData: BlogPostData,
  template?: string
): Promise<string | null> {
  try {
    // Skip if custom Open Graph image already exists
    if (postData.openGraphImage && !template) {
      console.log('Custom Open Graph image already exists, skipping generation')
      return null
    }

    const imageData = {
      title: postData.seoTitle || postData.title,
      category: postData.category?.title,
      author: postData.author?.name,
      template: template || getOptimalTemplate({
        title: postData.seoTitle || postData.title,
        category: postData.category?.title,
        author: postData.author?.name,
      }),
    }

    // Generate the image buffer
    const imageBuffer = await generateSocialImage(imageData)

    // Upload to Sanity assets
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: `social-${postData.slug.current}-${imageData.template}.png`,
      contentType: 'image/png',
      metadata: {
        source: 'auto-generated',
        template: imageData.template,
        postId: postData._id,
        generatedAt: new Date().toISOString(),
      },
    })

    console.log('Social image generated and uploaded:', asset._id)
    return asset._id

  } catch (error) {
    console.error('Error generating and uploading social image:', error)
    
    // Apply fallback strategy
    const fallbackResult = await applySocialImageFallback(
      postData._id,
      postData.seoTitle || postData.title,
      postData.category?.title
    )
    
    if (fallbackResult.success) {
      console.log('Applied fallback social image:', fallbackResult.method)
    }
    
    return null
  }
}

/**
 * Update blog post with generated social image
 */
export async function updatePostWithSocialImage(
  postId: string,
  assetId: string
): Promise<boolean> {
  try {
    await sanityClient
      .patch(postId)
      .set({
        openGraphImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId,
          },
          alt: 'Auto-generated social media image',
        },
      })
      .commit()

    console.log('Post updated with social image:', postId)
    return true

  } catch (error) {
    console.error('Error updating post with social image:', error)
    return false
  }
}

/**
 * Generate social image for all posts missing Open Graph images
 */
export async function generateMissingSocialImages(): Promise<{
  processed: number
  generated: number
  errors: number
}> {
  const stats = { processed: 0, generated: 0, errors: 0 }

  try {
    // Fetch posts without Open Graph images
    const posts = await sanityClient.fetch(`
      *[_type == "post" && !defined(openGraphImage)] {
        _id,
        title,
        seoTitle,
        slug,
        category->{title},
        author->{name}
      }
    `)

    console.log(`Found ${posts.length} posts without social images`)

    for (const post of posts) {
      stats.processed++

      try {
        const assetId = await generateAndUploadSocialImage(post)
        
        if (assetId) {
          const updated = await updatePostWithSocialImage(post._id, assetId)
          if (updated) {
            stats.generated++
          } else {
            stats.errors++
          }
        } else {
          stats.errors++
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing post ${post._id}:`, error)
        stats.errors++
      }
    }

    console.log('Social image generation complete:', stats)
    return stats

  } catch (error) {
    console.error('Error in batch social image generation:', error)
    return stats
  }
}

/**
 * Regenerate social image for a specific post
 */
export async function regenerateSocialImage(
  postId: string,
  template?: string
): Promise<boolean> {
  try {
    // Fetch post data
    const post = await sanityClient.fetch(`
      *[_type == "post" && _id == $postId][0] {
        _id,
        title,
        seoTitle,
        slug,
        category->{title},
        author->{name},
        openGraphImage
      }
    `, { postId })

    if (!post) {
      console.error('Post not found:', postId)
      return false
    }

    // Delete existing auto-generated image if it exists
    if (post.openGraphImage?.asset?._ref) {
      const asset = await sanityClient.fetch(`
        *[_type == "sanity.imageAsset" && _id == $assetId][0] {
          _id,
          metadata
        }
      `, { assetId: post.openGraphImage.asset._ref })

      if (asset?.metadata?.source === 'auto-generated') {
        await sanityClient.delete(asset._id)
        console.log('Deleted old auto-generated image:', asset._id)
      }
    }

    // Generate new image
    const assetId = await generateAndUploadSocialImage(post, template)
    
    if (assetId) {
      return await updatePostWithSocialImage(postId, assetId)
    }

    return false

  } catch (error) {
    console.error('Error regenerating social image:', error)
    return false
  }
}

/**
 * Clean up orphaned auto-generated social images
 */
export async function cleanupOrphanedSocialImages(): Promise<number> {
  try {
    // Find auto-generated images that are no longer referenced
    const orphanedAssets = await sanityClient.fetch(`
      *[_type == "sanity.imageAsset" && metadata.source == "auto-generated"] {
        _id,
        metadata.postId
      }[!(_id in *[_type == "post"].openGraphImage.asset._ref)]
    `)

    console.log(`Found ${orphanedAssets.length} orphaned social images`)

    let deletedCount = 0
    for (const asset of orphanedAssets) {
      try {
        await sanityClient.delete(asset._id)
        deletedCount++
        console.log('Deleted orphaned social image:', asset._id)
      } catch (error) {
        console.error('Error deleting orphaned asset:', asset._id, error)
      }
    }

    return deletedCount

  } catch (error) {
    console.error('Error cleaning up orphaned social images:', error)
    return 0
  }
}
