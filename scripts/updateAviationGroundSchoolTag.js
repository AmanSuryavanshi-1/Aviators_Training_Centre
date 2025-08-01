require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function updateAviationGroundSchoolTag() {
  try {
    console.log('🚀 Updating Aviation Ground School tag...');
    
    // Fetch the existing tag
    const tag = await client.fetch(
      `*[_type == "tag" && slug.current == "aviation-ground-school"][0]`
    );

    if (!tag) {
      console.error('❌ Tag not found: Aviation Ground School');
      return;
    }

    console.log(`✅ Found tag: ${tag.title} (ID: ${tag._id})`);

    // Fetch courses
    const courses = await client.fetch(
      `*[_type == "course" && active == true]{_id, name, slug}`
    );
    
    const courseMap = new Map();
    courses.forEach((course) => {
      if (course.slug && course.slug.current) {
        courseMap.set(course.slug.current, course._id);
      }
    });

    console.log(`✅ Found ${courseMap.size} active courses`);

    // Update with related courses using correct slugs from your system
    const relatedCourses = ['/courses#cpl-ground-school', 'advanced-air-regulations', 'professional-aviation-weather'];

    const courseReferences = relatedCourses.map(slug => ({
      _type: 'reference',
      _ref: courseMap.get(slug)
    })).filter(ref => ref._ref);

    if (courseReferences.length === 0) {
      console.error('❌ No valid courses to add');
      return;
    }

    const updatedTag = await client
      .patch(tag._id)
      .set({
        relatedCourses: courseReferences,
        description: 'Detailed courses and insights into aviation ground school topics, preparing students for licensing and pilot exams.',
        color: 'teal',
        category: 'training',
        seoKeywords: [
          'aviation ground school courses',
          'DGCA ground school',
          'pilot theory classes',
          'aviation education programs',
          'ground school curriculum',
          'flight training theory',
          'aviation knowledge base',
          'pilot ground training',
          'aviation theory subjects',
          'ground school certification',
          'aviation academic courses',
          'pilot education programs',
          'aviation ground studies',
          'flight theory education',
          'aviation learning modules',
          'ground school preparation',
          'aviation theory mastery',
          'pilot knowledge building',
          'aviation study programs',
          'ground school excellence'
        ]
      })
      .commit();

    console.log(`✅ Successfully updated Aviation Ground School tag with 3 courses`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAviationGroundSchoolTag();
