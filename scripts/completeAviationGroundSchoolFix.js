require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function completeAviationGroundSchoolFix() {
  try {
    console.log('🚀 Complete fix for Aviation Ground School tag...');
    console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log('');

    // Step 1: Get the tag
    console.log('🔍 Fetching Aviation Ground School tag...');
    const tag = await client.fetch(
      `*[_type == "tag" && slug.current == "aviation-ground-school"][0]{
        _id, 
        title, 
        slug, 
        description, 
        color, 
        category, 
        relatedCourses, 
        seoKeywords, 
        isActive
      }`
    );

    if (!tag) {
      console.error('❌ Aviation Ground School tag not found');
      return;
    }

    console.log(`✅ Found tag: ${tag.title} (ID: ${tag._id})`);
    console.log('Current status:');
    console.log(`   Description: ${tag.description || 'MISSING'}`);
    console.log(`   Color: ${tag.color || 'MISSING'}`);
    console.log(`   Category: ${tag.category || 'MISSING'}`);
    console.log(`   Related Courses: ${tag.relatedCourses?.length || 0} courses`);
    console.log(`   SEO Keywords: ${tag.seoKeywords?.length || 0} keywords`);
    console.log(`   Active: ${tag.isActive || 'MISSING'}`);
    console.log('');

    // Step 2: Get active courses
    console.log('📚 Fetching active courses...');
    const courses = await client.fetch(
      `*[_type == "course" && active == true]{
        _id, 
        name, 
        slug
      }`
    );

    console.log(`✅ Found ${courses.length} active courses:`);
    courses.forEach(course => {
      console.log(`   - ${course.name} (${course.slug?.current || 'no slug'})`);
    });
    console.log('');

    // Step 3: Build course references
    const targetCourses = [
      '/courses#cpl-ground-school',
      'advanced-air-regulations', 
      'professional-aviation-weather'
    ];

    const courseReferences = [];
    console.log('🔗 Building course references...');

    for (const targetSlug of targetCourses) {
      const course = courses.find(c => c.slug?.current === targetSlug);
      if (course) {
        courseReferences.push({
          _type: 'reference',
          _ref: course._id
        });
        console.log(`   ✅ Added: ${course.name} (${course._id})`);
      } else {
        console.log(`   ⚠️ Not found: ${targetSlug}`);
      }
    }

    if (courseReferences.length === 0) {
      console.error('❌ No valid courses found to reference');
      return;
    }

    // Step 4: Prepare complete update data
    const updateData = {
      title: 'Aviation Ground School',
      description: 'Detailed courses and insights into aviation ground school topics, preparing students for licensing and pilot exams.',
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

    console.log('📝 Updating tag with complete data...');
    console.log(`   Description: ${updateData.description}`);
    console.log(`   Color: ${updateData.color}`);
    console.log(`   Category: ${updateData.category}`);
    console.log(`   Related Courses: ${updateData.relatedCourses.length} courses`);
    console.log(`   SEO Keywords: ${updateData.seoKeywords.length} keywords`);
    console.log(`   Active: ${updateData.isActive}`);
    console.log('');

    // Step 5: Apply the update
    const updatedTag = await client
      .patch(tag._id)
      .set(updateData)
      .commit();

    console.log('✅ Tag updated successfully!');
    console.log(`Updated tag ID: ${updatedTag._id}`);
    console.log('');

    // Step 6: Verify the update
    console.log('🔍 Verifying update...');
    const verifyTag = await client.fetch(
      `*[_type == "tag" && _id == "${tag._id}"][0]{
        _id,
        title,
        description,
        color,
        category,
        relatedCourses,
        seoKeywords,
        isActive,
        usageCount
      }`
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
    } else {
      console.error('❌ Verification failed - could not fetch updated tag');
    }

    console.log('');
    console.log('🎉 Aviation Ground School tag is now fully populated!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Refresh your Sanity Studio page');
    console.log('2. Clear browser cache if needed');
    console.log('3. The tag should now show all fields populated');
    console.log('4. Check that the "Invalid list values" error is gone');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the complete fix
completeAviationGroundSchoolFix();
