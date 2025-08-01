require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixAviationInterviewTag() {
  try {
    console.log('🚀 Fixing Aviation Interview tag...');

    // Get the Aviation Interview tag
    const tag = await client.fetch(
      `*[_type == "tag" && slug.current == "aviation-interview"][0]`
    );

    if (!tag) {
      console.error('❌ Aviation Interview tag not found');
      return;
    }

    console.log(`✅ Found tag: ${tag.title} (ID: ${tag._id})`);

    // Get the Airline Interview Preparation course
    const course = await client.fetch(
      `*[_type == "course" && slug.current == "airline-interview-preparation"][0]`
    );

    if (!course) {
      console.error('❌ Airline Interview Preparation course not found');
      return;
    }

    console.log(`✅ Found course: ${course.title} (ID: ${course._id})`);

    // Update the tag with proper course reference
    const updatedTag = await client
      .patch(tag._id)
      .set({
        relatedCourses: [{
          _type: 'reference',
          _ref: course._id
        }]
      })
      .commit();

    console.log(`✅ Successfully updated Aviation Interview tag with course reference`);
    console.log(`🎉 Fix completed! The "Invalid list values" error should now be resolved for this tag.`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

fixAviationInterviewTag();
