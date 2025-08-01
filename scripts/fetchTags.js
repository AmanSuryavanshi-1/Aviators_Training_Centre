require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fetchTags() {
  try {
    const tags = await client.fetch('*[_type == "tag"]{ _id, title, slug, description, relatedCourses }');
    console.log('Available tags:', JSON.stringify(tags, null, 2));
  } catch (error) {
    console.error('Error fetching tags:', error.message);
  }
}

fetchTags();
