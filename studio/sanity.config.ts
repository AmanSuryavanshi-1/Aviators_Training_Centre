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

// Import aviation theme styles
import './styles/aviation-theme.css';

// TypeScript interfaces
interface NavbarProps {
  renderDefault: (props: NavbarProps) => React.ReactNode;
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
  
  // Aviation-themed Studio Configuration
  studio: {
    components: {
      navbar: (props: NavbarProps) => {
        return React.createElement('div', {
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%',
            backgroundColor: '#0a1a1d',
            borderBottom: '1px solid #1a3a42',
            padding: '0 16px',
            height: '52px'
          }
        }, [
          React.createElement('div', {
            key: 'left-section',
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px'
            }
          }, [
            React.createElement('div', {
              key: 'brand-section',
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, [
              React.createElement('img', {
                key: 'atc-logo',
                src: '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png',
                alt: 'ATC Logo',
                style: {
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain'
                }
              }),
              React.createElement('span', {
                key: 'brand-text',
                style: {
                  color: '#73b5bd',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Montserrat, sans-serif'
                }
              }, 'ATC Studio')
            ]),
            React.createElement('div', {
              key: 'default-navbar',
              style: { display: 'flex', alignItems: 'center' }
            }, props.renderDefault(props))
          ]),
          React.createElement('a', {
            key: 'back-link',
            href: '/',
            style: {
              color: '#f0f9ff',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '500',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#075e68',
              border: '1px solid #0c6e72',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Roboto, sans-serif'
            },
            onMouseOver: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = '#219099';
              e.currentTarget.style.borderColor = '#56a7b0';
            },
            onMouseOut: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = '#075e68';
              e.currentTarget.style.borderColor = '#0c6e72';
            },
            title: 'Return to Website'
          }, '← Back to Website')
        ]);
      }
    }
  },
  
  plugins: [
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