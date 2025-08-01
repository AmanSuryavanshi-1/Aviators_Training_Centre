require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fetchCourses() {
  try {
    const courses = await client.fetch('*[_type == "course"]{ _id, title, slug, category, description }');
    console.log('Available courses:', JSON.stringify(courses, null, 2));
  } catch (error) {
    console.error('Error fetching courses:', error.message);
  }
}

fetchCourses();
