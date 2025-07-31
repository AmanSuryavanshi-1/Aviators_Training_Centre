import imageUrlBuilder from '@sanity/image-url'
import {SanityImageSource} from '@sanity/image-url/lib/types/types'

// Get project details from environment or config
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const builder = imageUrlBuilder({
  projectId,
  dataset
})

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

export const getImageUrl = (image: any, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'jpg' | 'png' | 'webp'
}) => {
  if (!image) return null
  
  let url = urlFor(image)
  
  if (options?.width) url = url.width(options.width)
  if (options?.height) url = url.height(options.height)
  if (options?.quality) url = url.quality(options.quality)
  if (options?.format) url = url.format(options.format)
  
  return url.url()
}

export default urlFor