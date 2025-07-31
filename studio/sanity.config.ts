import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Full Sanity Studio configuration with complete schema
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'ATC Content Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      logo: () => 'ATC Studio',
    },
  },
})