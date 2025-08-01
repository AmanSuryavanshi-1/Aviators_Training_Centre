require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function forceUpdateAviationGroundSchool() {
  try {
    console.log('🚀 Force updating Aviation Ground School tag...');

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

    const relatedCourses = ['/courses#cpl-ground-school', 'advanced-air-regulations', 'professional-aviation-weather'];
    const courseReferences = relatedCourses.map(slug => ({
      _type: 'reference',
      _ref: courseMap.get(slug)
    })).filter(ref => ref._ref);

    if (courseReferences.length === 0) {
      console.error('❌ No valid courses to add');
      return;
    }

    const updateData = {
      description: 'Full insights into aviation ground school topics.',
      color: 'teal',
      category: 'training',
      relatedCourses: courseReferences,
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
      ],
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };

    console.log('📝 Force updating tag with complete data...');

    const updatedTag = await client
      .patch(tag._id)
      .set(updateData)
      .commit();

    console.log('✅ Tag force updated successfully!');
    console.log('');

    const verifyTag = await client.fetch(
      `*[_type == "tag" && slug.current == "aviation-ground-school"][0]`
    );

    if (verifyTag) {
      console.log('✅ Verification successful:');
      console.log(`   Title: ${verifyTag.title}`);
      console.log(`   Description: ${verifyTag.description ? 'SET ✅' : 'MISSING ❌'}`);
      console.log(`   Color: ${verifyTag.color ? 'SET ✅' : 'MISSING ❌'}`);
      console.log(`   Category: ${verifyTag.category ? 'SET ✅' : 'MISSING ❌'}`);
      console.log(`   Related Courses: ${verifyTag.relatedCourses?.length || 0} courses ${verifyTag.relatedCourses?.length > 0 ? '✅' : '❌'}`);
      console.log(`   SEO Keywords: ${verifyTag.seoKeywords?.length || 0} keywords ${verifyTag.seoKeywords?.length > 0 ? '✅' : '❌'}`);
      console.log(`   Active: ${verifyTag.isActive ? 'YES ✅' : 'NO ❌'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

forceUpdateAviationGroundSchool();
