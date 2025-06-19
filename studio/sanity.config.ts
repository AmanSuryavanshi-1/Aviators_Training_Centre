import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
// Import schemas here once defined
import {schemaTypes} from './schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  name: 'aviators_blog_studio',
  title: 'Aviators Blog Studio',
  projectId: projectId,
  dataset: dataset,
  plugins: [
    deskTool(),
    visionTool()
    // Add other plugins if needed
  ],
  schema: {
    types: schemaTypes, // Uncomment once schemas are created
    // types: [], // Placeholder
  },
})
