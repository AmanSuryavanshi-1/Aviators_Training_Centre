// Preview configuration for draft content
export const previewConfig = {
  // Base URL for preview
  baseUrl: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000',
  
  // Preview secret for secure previews
  previewSecret: process.env.SANITY_STUDIO_PREVIEW_SECRET || 'preview-secret-key',
  
  // Generate preview URL for blog posts
  generatePreviewUrl: (document: any) => {
    const slug = document.slug?.current
    if (!slug) return null
    
    return `${previewConfig.baseUrl}/api/preview?secret=${previewConfig.previewSecret}&slug=${slug}&type=post`
  },
  
  // Generate live URL for published posts
  generateLiveUrl: (document: any) => {
    const slug = document.slug?.current
    if (!slug) return null
    
    return `${previewConfig.baseUrl}/blog/${slug}`
  },
}

// Preview URLs helper
export const getPreviewUrls = (document: any) => {
  return {
    previewUrl: previewConfig.generatePreviewUrl(document),
    liveUrl: previewConfig.generateLiveUrl(document)
  }
}
