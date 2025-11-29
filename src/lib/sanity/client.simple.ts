import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// Simple Sanity client configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})

// Image URL builder
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Simple service functions
export const sanitySimpleService = {
  getClient() {
    return client
  },
  async getAllPosts(options: { limit?: number } = {}) {
    try {
      const { limit = 10 } = options
      const query = `*[_type == "post"] | order(publishedAt desc)[0...${limit}] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        _updatedAt,
        featured,
        image {
          asset-> {
            _id,
            url
          },
          alt
        },
        category-> {
          _id,
          title,
          slug,
          color
        },
        author-> {
          _id,
          name,
          slug,
          email,
          image {
            asset-> {
              _id,
              url
            }
          }
        }
      }`

      const posts = await client.fetch(query, {}, { next: { revalidate: 60 } })
      console.log('Fetched posts:', posts?.length || 0, 'posts')

      // Ensure all posts have proper structure
      const safePosts = (posts || []).map(post => ({
        ...post,
        slug: post.slug || { current: `post-${post._id}` },
        title: post.title || 'Untitled Post',
        excerpt: post.excerpt || 'No excerpt available',
        publishedAt: post.publishedAt || post._updatedAt || new Date().toISOString(),
        featured: post.featured || false,
        category: post.category || { title: 'Uncategorized', slug: { current: 'uncategorized' } },
        author: post.author || { name: 'Anonymous', slug: { current: 'anonymous' } }
      }))

      return safePosts
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  },

  async getPostBySlug(slug: string) {
    try {
      const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        content,
        body,
        htmlContent,
        publishedAt,
        featured,
        readingTime,
        workflowStatus,
        image {
          asset-> {
            _id,
            url
          },
          alt
        },
        category-> {
          title,
          slug,
          color
        },
        author-> {
          name,
          slug,
          bio,
          image {
            asset-> {
              _id,
              url
            }
          }
        },
        tags[]-> {
          title,
          slug
        },
        seoTitle,
        seoDescription,
        focusKeyword,
        additionalKeywords,
        performanceMetrics,
        contentValidation,
        ctaPlacements,
        structuredData
      }`

      const post = await client.fetch(query, { slug }, { next: { revalidate: 60 } })
      return post || null
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  },

  async getCategories() {
    try {
      const query = `*[_type == "category"] | order(title asc) {
        _id,
        title,
        slug,
        description,
        color,
        _updatedAt
      }`

      const categories = await client.fetch(query, {}, { next: { revalidate: 60 } })
      console.log('Fetched categories:', categories?.length || 0, 'categories')

      // Ensure all categories have proper structure
      const safeCategories = (categories || []).map(category => ({
        ...category,
        slug: category.slug || { current: `category-${category._id}` },
        title: category.title || 'Untitled Category',
        _updatedAt: category._updatedAt || new Date().toISOString()
      }))

      return safeCategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  async getAuthors() {
    try {
      const query = `*[_type == "author"] | order(name asc) {
        _id,
        name,
        slug,
        bio,
        email,
        _updatedAt,
        image {
          asset-> {
            _id,
            url
          },
          alt
        }
      }`

      const authors = await client.fetch(query, {}, { next: { revalidate: 60 } })
      console.log('Fetched authors:', authors?.length || 0, 'authors')

      // Ensure all authors have proper structure
      const safeAuthors = (authors || []).map(author => ({
        ...author,
        slug: author.slug || { current: `author-${author._id}` },
        name: author.name || 'Anonymous Author',
        _updatedAt: author._updatedAt || new Date().toISOString()
      }))

      return safeAuthors
    } catch (error) {
      console.error('Error fetching authors:', error)
      return []
    }
  },

  getImageUrl(source: any, options: { width?: number; height?: number; format?: string; quality?: number } = {}) {
    if (!source || !source.asset) return null

    try {
      let builder = urlFor(source)

      if (options.width) builder = builder.width(options.width)
      if (options.height) builder = builder.height(options.height)
      if (options.format) builder = builder.format(options.format)
      if (options.quality) builder = builder.quality(options.quality)

      return builder.url()
    } catch (error) {
      console.error('Error generating image URL:', error)
      return null
    }
  }
}
