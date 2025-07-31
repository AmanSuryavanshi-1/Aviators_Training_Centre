import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {seoHooksPlugin} from './plugins/seoHooks'
import {seoAuditPlugin} from './plugins/seoAuditPlugin'

// Simple Sanity Studio configuration to avoid crashes
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'Aviators Training Centre - Blog Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  
  // Production API version
  apiVersion: '2024-01-01',
  
  // Studio configuration
  studioHost: 'aviators-training-centre-blog',
  
  plugins: [
    // Enhanced media management
    media({
      creditLine: {
        enabled: true,
        excludeSources: ['unsplash'],
      },
    }),
    
    // Document internationalization (future-ready)
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'hi', title: 'Hindi'},
      ],
      schemaTypes: ['post', 'category'],
    }),
    
    // Simple structure tool
    structureTool(),
    
    // Vision tool for development
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),

    // SEO automation hooks
    seoHooksPlugin(),
    
    // SEO audit plugin with real-time validation
    seoAuditPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Studio customization
  studio: {
    components: {
      logo: () => '✈️ ATC Blog',
    },
  },

  // CORS and API configuration for production
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://aviatorstrainingcentre.com',
      'https://www.aviatorstrainingcentre.com',
      'https://aviators-training-centre-blog.sanity.studio',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
    ],
  },
})