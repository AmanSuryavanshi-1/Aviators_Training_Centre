/**
 * Production-Ready Sanity Studio Configuration
 * Professional configuration with embedded admin navigation
 */

import React from 'react';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import ATCAdminNavigator from './components/ATCAdminNavigator';
import { clearFieldPlugin } from './plugins/clearFieldPlugin';
import { keyboardShortcutsPlugin } from './plugins/keyboardShortcutsPlugin';

// Import minimal aviation theme - safe styling that preserves functionality
import './styles/minimal-aviation-theme.css';
import './styles/enhanced-responsive.css';
import './styles/navbar-fixes.css';
import './styles/fixes/navbar-buttons.css'; // Final override for navbar/button fixes

// TypeScript interfaces
interface NavbarProps {
  renderDefault: (props: any) => React.ReactNode;
}

// Environment-aware configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'Aviators Training Centre - Content Management',
  
  projectId,
  dataset,
  apiVersion,
  
  // Set proper basePath for studio routing
  basePath: '/studio',
  
  // Clean Aviation-themed Studio Configuration
  studio: {
    components: {
      // Remove Sanity logo/branding completely; keep default navbar functionality
      logo: () => null,
      navbar: (props: NavbarProps) => {
        return React.createElement('div', {
          className: 'atc-navbar-container atc-fix-topbar',
          style: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '49px',
            backgroundColor: '#0a1a1d',
            borderBottom: '1px solid #1a3a42',
            padding: '0 12px',
            gap: '8px',
            boxSizing: 'border-box'
          }
        }, [
          // Default Sanity Navbar - fills space; our CSS hides brand area
          React.createElement('div', {
            key: 'sanity-navbar',
            style: {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              height: '100%'
            }
          }, props.renderDefault(props)),

          // Compact Website button aligned right
          React.createElement('a', {
            key: 'back-link',
            href: '/',
            style: {
              color: '#f0f9ff',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
              padding: '0 10px',
              borderRadius: '4px',
              backgroundColor: '#075e68',
              border: '1px solid #0c6e72',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'system-ui, sans-serif',
              flexShrink: 0,
              height: '32px',
              lineHeight: 1
            },
            onMouseOver: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = '#219099';
            },
            onMouseOut: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = '#075e68';
            },
            title: 'Return to Website'
          }, 'Website')
        ]);
      }
    }
  },
  
  plugins: [
    clearFieldPlugin(),
    keyboardShortcutsPlugin({}),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Add ATC Admin navigation at the top
            S.listItem()
              .id('atc-admin-dashboard')
              .title('🚀 ATC Admin Dashboard')
              .child(
                S.component()
                  .id('atc-admin-navigator')
                  .title('ATC Admin Dashboard')
                  .component(ATCAdminNavigator)
              ),
            S.divider(),
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
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Use default Sanity authentication
});