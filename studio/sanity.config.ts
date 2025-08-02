/**
 * Main Sanity Studio Configuration
 * Automatically selects appropriate configuration based on environment
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import React from 'react';

// Environment-aware configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Base plugins
const plugins = [
  structureTool({
    structure: (S) =>
      S.list()
        .title('Content')
        .items([
          S.listItem()
            .title('Blog Posts')
            .child(
              S.documentTypeList('post')
                .title('Blog Posts')
                .filter('_type == "post"')
                .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
            ),
          S.listItem()
            .title('Categories')
            .child(
              S.documentTypeList('category')
                .title('Categories')
                .filter('_type == "category"')
            ),
          S.listItem()
            .title('Tags')
            .child(
              S.documentTypeList('tag')
                .title('Tags')
                .filter('_type == "tag"')
            ),
          S.listItem()
            .title('Authors')
            .child(
              S.documentTypeList('author')
                .title('Authors')
                .filter('_type == "author"')
            ),
          S.divider(),
          ...S.documentTypeListItems().filter(
            (listItem) => !['post', 'category', 'tag', 'author'].includes(listItem.getId()!)
          ),
        ]),
  }),
];

// Add Vision tool conditionally
if (!isProduction || process.env.SANITY_STUDIO_ENABLE_VISION === 'true') {
  plugins.push(visionTool());
}

export const config = defineConfig({
  name: isProduction ? 'aviators-training-centre-production' : 'aviators-training-centre-dev',
  title: 'Aviators Training Centre - Content Management',
  
  projectId,
  dataset,
  apiVersion,
  
  plugins,

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      logo: () => React.createElement('div', {
        style: { 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#1e40af'
        }
      }, `✈️ ATC Studio ${isProduction ? '(Production)' : '(Development)'}`),
    },
  },

  // Document configuration
  document: {
    actions: (prev, context) => {
      // Customize actions based on environment
      if (isProduction && context.schemaType === 'post') {
        // Remove potentially dangerous actions in production
        return prev.filter(action => 
          !['duplicate', 'delete'].includes(action.action || '')
        );
      }
      return prev;
    },
  },

  // CORS configuration - Note: This is for client-side only
  // Actual CORS must be configured in Sanity Management Console
  cors: {
    credentials: true,
    origin: true, // Allow all origins for now - configure in Sanity Console
  },

  // Authentication configuration
  auth: {
    mode: 'replace',
    redirectOnSingle: true,
    providers: [
      // This will use Sanity's default Google OAuth provider
      // No additional configuration needed
    ],
  },

  // Tools configuration
  tools: (prev) => {
    if (isProduction) {
      // Filter tools for production if needed
      return prev;
    }
    return prev;
  },
});

export default config;