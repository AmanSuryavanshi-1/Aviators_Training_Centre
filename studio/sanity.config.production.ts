/**
 * Sanity Studio Production Configuration
 * This configuration is optimized for production deployment
 */

import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { colorInput } from '@sanity/color-input'
import { scheduledPublishing } from '@sanity/scheduled-publishing'
import { media } from 'sanity-plugin-media'

// Import schemas
import { schemaTypes } from './schemaTypes'

// Import custom components
import { CustomNavbar } from './components/CustomNavbar'
import { CustomLogo } from './components/CustomLogo'

// Production environment variables
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID')
}

export default defineConfig({
  name: 'aviators-training-centre-production',
  title: 'Aviators Training Centre - Production',
  
  projectId,
  dataset,
  
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Blog Posts
            S.listItem()
              .title('Blog Posts')
              .icon(() => '📝')
              .child(
                S.documentTypeList('post')
                  .title('Blog Posts')
                  .filter('_type == "post"')
                  .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
              ),
            
            // Categories
            S.listItem()
              .title('Categories')
              .icon(() => '🏷️')
              .child(
                S.documentTypeList('category')
                  .title('Categories')
                  .filter('_type == "category"')
              ),
            
            // Tags
            S.listItem()
              .title('Tags')
              .icon(() => '🔖')
              .child(
                S.documentTypeList('tag')
                  .title('Tags')
                  .filter('_type == "tag"')
              ),
            
            // Authors
            S.listItem()
              .title('Authors')
              .icon(() => '👤')
              .child(
                S.documentTypeList('author')
                  .title('Authors')
                  .filter('_type == "author"')
              ),
            
            // Divider
            S.divider(),
            
            // Featured Posts
            S.listItem()
              .title('Featured Posts')
              .icon(() => '⭐')
              .child(
                S.documentTypeList('post')
                  .title('Featured Posts')
                  .filter('_type == "post" && featuredOnHome == true')
                  .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
              ),
            
            // Draft Posts
            S.listItem()
              .title('Draft Posts')
              .icon(() => '📄')
              .child(
                S.documentTypeList('post')
                  .title('Draft Posts')
                  .filter('_type == "post" && !defined(publishedAt)')
                  .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
              ),
            
            // Scheduled Posts
            S.listItem()
              .title('Scheduled Posts')
              .icon(() => '⏰')
              .child(
                S.documentTypeList('post')
                  .title('Scheduled Posts')
                  .filter('_type == "post" && publishedAt > now()')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'asc' }])
              ),
          ])
    }),
    
    // Vision tool for production (limited access)
    ...(process.env.NODE_ENV === 'development' ? [visionTool()] : []),
    
    // Color input for category colors
    colorInput(),
    
    // Scheduled publishing
    scheduledPublishing(),
    
    // Media plugin for asset management
    media(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Production-specific document actions
  document: {
    actions: (prev, context) => {
      const defaultActions = prev.filter(
        (action) => !['unpublish', 'delete'].includes(action.action || '')
      )

      // Add custom actions
      return [
        ...defaultActions,
        // View Analytics action
        {
          label: 'View Analytics',
          action: 'viewAnalytics',
          icon: () => '📊',
          onHandle: () => {
            const siteUrl = process.env.SANITY_STUDIO_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL
            if (context.schemaType === 'post' && context.published?.slug?.current) {
              window.open(`${siteUrl}/admin/analytics?post=${context.published.slug.current}`, '_blank')
            } else {
              window.open(`${siteUrl}/admin`, '_blank')
            }
          }
        },
        // Preview Post action
        {
          label: 'Preview Post',
          action: 'previewPost',
          icon: () => '👁️',
          onHandle: () => {
            const siteUrl = process.env.SANITY_STUDIO_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL
            if (context.schemaType === 'post' && context.published?.slug?.current) {
              window.open(`${siteUrl}/blog/${context.published.slug.current}`, '_blank')
            }
          }
        }
      ]
    }
  },

  // Production tools configuration
  tools: (prev) => {
    // Remove vision tool in production for security
    if (process.env.NODE_ENV === 'production') {
      return prev.filter((tool) => tool.name !== 'vision')
    }
    return prev
  },

  // Studio configuration
  studio: {
    components: {
      navbar: CustomNavbar,
      logo: CustomLogo,
    }
  },

  // API configuration for production
  api: {
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false, // Don't use CDN for studio operations
  },

  // CORS configuration for production
  cors: {
    credentials: true,
    origin: [
      process.env.SANITY_STUDIO_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.sanity\.studio$/,
    ].filter(Boolean)
  },

  // Production-specific form configuration
  form: {
    // Disable auto-save in production for better performance
    unstable_autoSave: false,
    
    // Custom validation messages
    validation: {
      // Add production-specific validation rules
    }
  },

  // Search configuration
  search: {
    // Optimize search for production
    unstable_enableNewSearch: true,
  },

  // Production asset configuration
  asset: {
    // Optimize asset handling for production
    assetSources: (prev) => {
      return prev.filter((source) => source.name !== 'unsplash') // Remove Unsplash in production
    }
  },

  // Production-specific workspace configuration
  workspace: {
    name: 'production',
    title: 'Production',
    subtitle: 'Aviators Training Centre Blog',
    
    // Custom workspace actions
    actions: [
      {
        name: 'goToSite',
        title: 'Go to Website',
        icon: () => '🌐',
        onAction: () => {
          const siteUrl = process.env.SANITY_STUDIO_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL
          window.open(siteUrl, '_blank')
        }
      },
      {
        name: 'goToAdmin',
        title: 'Go to Admin Dashboard',
        icon: () => '📊',
        onAction: () => {
          const siteUrl = process.env.SANITY_STUDIO_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL
          window.open(`${siteUrl}/admin`, '_blank')
        }
      }
    ]
  },

  // Production environment banner
  __experimental_environment: {
    name: 'production',
    title: 'Production Environment',
    color: '#ef4444', // Red color to indicate production
    description: 'You are working in the production environment. Changes will affect the live website.'
  }
})