import { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const generateSocialImageAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published } = props

  // Only show for blog posts
  if (type !== 'post') {
    return null
  }

  const doc = draft || published
  if (!doc) {
    return null
  }

  return {
    label: 'Generate Social Image',
    icon: ImageIcon,
    onHandle: async () => {
      try {
        const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
        const adminKey = process.env.SANITY_STUDIO_ADMIN_API_KEY

        if (!adminKey) {
          alert('Admin API key not configured. Please contact your administrator.')
          return
        }

        const response = await fetch(`${baseUrl}/api/admin/generate-social-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminKey}`,
          },
          body: JSON.stringify({
            action: 'regenerate-single',
            postId: id,
          }),
        })

        const result = await response.json()

        if (result.success) {
          alert('✅ Social image generated successfully! The post will be updated with the new image.')
          
          // Refresh the document to show the updated image
          window.location.reload()
        } else {
          alert(`❌ Failed to generate social image: ${result.message || 'Unknown error'}`)
        }

      } catch (error) {
        console.error('Error generating social image:', error)
        alert('❌ Error generating social image. Please try again.')
      }
    },
  }
}

// Batch generation action for multiple posts
export const batchGenerateSocialImagesAction = {
  name: 'batchGenerateSocialImages',
  title: 'Generate Missing Social Images',
  icon: ImageIcon,
  action: async () => {
    const confirmed = confirm(
      'This will generate social images for all blog posts that don\'t have one. This may take several minutes. Continue?'
    )

    if (!confirmed) return

    try {
      const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
      const adminKey = process.env.SANITY_STUDIO_ADMIN_API_KEY

      if (!adminKey) {
        alert('Admin API key not configured. Please contact your administrator.')
        return
      }

      const response = await fetch(`${baseUrl}/api/admin/generate-social-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          action: 'generate-missing',
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`✅ ${result.message}\n\nStats:\n- Processed: ${result.stats.processed}\n- Generated: ${result.stats.generated}\n- Errors: ${result.stats.errors}`)
      } else {
        alert(`❌ Failed to generate social images: ${result.message || 'Unknown error'}`)
      }

    } catch (error) {
      console.error('Error in batch social image generation:', error)
      alert('❌ Error generating social images. Please try again.')
    }
  },
}