require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Course slugs based on your image (the ones that are active/working)
const courseSlugs = [
  'multi-engine-aircraft-training',
  'flight-instructor-training', 
  'airline-interview-preparation',
  'advanced-air-regulations',
  'professional-aviation-weather',
  'advanced-navigation-systems',
  'air-navigation',
  'a320-b737-type-rating-prep',
  'rtr-a-radio-telephony-ace-com',
  'one-on-one-online-classes-air-na',
  'dgca-cpl-ground-school'
];

// Enhanced tag to course mapping with 2-3 relevant courses each
const tagCourseMapping = {
  'aviation-interview': [
    'airline-interview-preparation',
    'one-on-one-online-classes-air-na',
    'dgca-cpl-ground-school'
  ],
  'interview-preparation': [
    'airline-interview-preparation',
    'dgca-cpl-ground-school',
    'advanced-air-regulations'
  ],
  'career-success': [
    'airline-interview-preparation',
    'flight-instructor-training',
    'multi-engine-aircraft-training'
  ],
  'airline-recruitment': [
    'airline-interview-preparation',
    'a320-b737-type-rating-prep',
    'multi-engine-aircraft-training'
  ],
  'aviation-ground-school': [
    'dgca-cpl-ground-school',
    'advanced-air-regulations',
    'professional-aviation-weather'
  ],
  'dgca-training': [
    'dgca-cpl-ground-school',
    'advanced-air-regulations',
    'rtr-a-radio-telephony-ace-com'
  ],
  'pilot-theory': [
    'dgca-cpl-ground-school',
    'professional-aviation-weather',
    'air-navigation'
  ],
  'aviation-education': [
    'dgca-cpl-ground-school',
    'one-on-one-online-classes-air-na',
    'advanced-navigation-systems'
  ],
  'flight-training': [
    'multi-engine-aircraft-training',
    'flight-instructor-training',
    'a320-b737-type-rating-prep'
  ]
};

async function getAllActiveCourses() {
  try {
    console.log('🔍 Fetching all active courses...');
    const courses = await client.fetch(`*[_type == "course" && active == true]{_id, name, slug}`);
    console.log(`✅ Found ${courses.length} active courses`);
    
    const courseMap = new Map();
    courses.forEach(course => {
      if (course.slug && course.slug.current) {
        courseMap.set(course.slug.current, {
          id: course._id,
          name: course.name
        });
        console.log(`   📚 ${course.name} (${course.slug.current})`);
      }
    });
    
    return courseMap;
  } catch (error) {
    console.error('❌ Error fetching courses:', error.message);
    return new Map();
  }
}

async function updateTagWithCourses(tag, courseReferences) {
  try {
    const updatedTag = await client
      .patch(tag._id)
      .set({
        relatedCourses: courseReferences
      })
      .commit();

    console.log(`✅ Updated "${tag.title}" with ${courseReferences.length} course(s)`);
    courseReferences.forEach((ref, index) => {
      console.log(`   ${index + 1}. Course ID: ${ref._ref}`);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating tag "${tag.title}":`, error.message);
    return false;
  }
}

async function updateTagsWithExistingCourses() {
  try {
    console.log('🚀 Starting tags update with existing courses...');
    console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log('');

    // Step 1: Get all active courses
    const courseMap = await getAllActiveCourses();
    
    if (courseMap.size === 0) {
      console.error('❌ No active courses found. Cannot proceed.');
      return;
    }

    console.log('');

    // Step 2: Update each tag with related courses
    console.log('🏷️ Updating tags with course references...');
    let successCount = 0;
    let errorCount = 0;

    for (const [tagSlug, courseSlugs] of Object.entries(tagCourseMapping)) {
      try {
        // Get the tag
        const tag = await client.fetch(
          `*[_type == "tag" && slug.current == $slug][0]`,
          { slug: tagSlug }
        );

        if (!tag) {
          console.log(`⚠️ Tag not found: ${tagSlug}`);
          continue;
        }

        console.log(`\n🔄 Processing tag: ${tag.title}`);

        // Build course references array
        const courseReferences = [];
        const foundCourses = [];
        const notFoundCourses = [];

        for (const courseSlug of courseSlugs) {
          const course = courseMap.get(courseSlug);
          if (course) {
            courseReferences.push({
              _type: 'reference',
              _ref: course.id
            });
            foundCourses.push(course.name);
          } else {
            notFoundCourses.push(courseSlug);
          }
        }

        // Log the results for this tag
        if (foundCourses.length > 0) {
          console.log(`   ✅ Found courses: ${foundCourses.join(', ')}`);
        }
        if (notFoundCourses.length > 0) {
          console.log(`   ⚠️ Not found: ${notFoundCourses.join(', ')}`);
        }

        // Update the tag if we have at least one valid course
        if (courseReferences.length > 0) {
          const success = await updateTagWithCourses(tag, courseReferences);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          console.log(`   ⚠️ No valid courses found for this tag`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing tag ${tagSlug}:`, error.message);
        errorCount++;
      }
    }

    // Final results
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Tag update completed!');
    console.log(`✅ Successfully updated: ${successCount} tags`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} tags`);
    }
    console.log('\nNext steps:');
    console.log('1. Check your Sanity Studio to verify the related courses');
    console.log('2. The "Invalid list values" error should now be resolved');
    console.log('3. You can now edit the related courses field normally');
    console.log('4. Each tag now has 2-3 relevant courses associated');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the update
updateTagsWithExistingCourses();
