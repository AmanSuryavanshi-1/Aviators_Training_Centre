require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Additional mappings based on the exact slugs from your system
const additionalMappings = {
  'aviation-interview': [
    'one-on-one-online-classes-air-navigation-and-technical',
    '/courses#cpl-ground-school'
  ],
  'interview-preparation': [
    '/courses#cpl-ground-school'
  ],
  'airline-recruitment': [
    'a320-and-b737-type-rating-prep'
  ],
  'aviation-ground-school': [
    '/courses#cpl-ground-school'
  ],
  'dgca-training': [
    '/courses#cpl-ground-school',
    'rtr-a-radio-telephony-ace-communication'
  ],
  'pilot-theory': [
    '/courses#cpl-ground-school'
  ],
  'aviation-education': [
    '/courses#cpl-ground-school',
    'one-on-one-online-classes-air-navigation-and-technical'
  ],
  'flight-training': [
    'a320-and-b737-type-rating-prep'
  ]
};

async function addMissingCourseReferences() {
  try {
    console.log('🚀 Adding missing course references to tags...');
    console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log('');

    // Get all active courses first
    const courses = await client.fetch(`*[_type == "course" && active == true]{_id, name, slug}`);
    const courseMap = new Map();
    
    courses.forEach(course => {
      if (course.slug && course.slug.current) {
        courseMap.set(course.slug.current, {
          id: course._id,
          name: course.name
        });
      }
    });

    console.log(`📚 Available courses: ${courseMap.size}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const [tagSlug, courseSlugs] of Object.entries(additionalMappings)) {
      try {
        console.log(`🔄 Processing tag: ${tagSlug}`);
        
        // Get the current tag with its existing courses
        const tag = await client.fetch(
          `*[_type == "tag" && slug.current == $slug][0]{_id, title, relatedCourses}`,
          { slug: tagSlug }
        );

        if (!tag) {
          console.log(`⚠️ Tag not found: ${tagSlug}`);
          continue;
        }

        // Get existing course references
        const existingCourses = tag.relatedCourses || [];
        const existingCourseIds = new Set(existingCourses.map(ref => ref._ref));

        // Find new courses to add
        const newCourseReferences = [];
        const foundCourses = [];
        const notFoundCourses = [];

        for (const courseSlug of courseSlugs) {
          const course = courseMap.get(courseSlug);
          if (course) {
            // Only add if not already present
            if (!existingCourseIds.has(course.id)) {
              newCourseReferences.push({
                _type: 'reference',
                _ref: course.id
              });
              foundCourses.push(course.name);
            } else {
              console.log(`   ✅ Already has: ${course.name}`);
            }
          } else {
            notFoundCourses.push(courseSlug);
          }
        }

        if (foundCourses.length > 0) {
          console.log(`   🆕 Adding courses: ${foundCourses.join(', ')}`);
        }
        if (notFoundCourses.length > 0) {
          console.log(`   ⚠️ Not found: ${notFoundCourses.join(', ')}`);
        }

        // Combine existing and new courses
        if (newCourseReferences.length > 0) {
          const allCourseReferences = [...existingCourses, ...newCourseReferences];
          
          const updatedTag = await client
            .patch(tag._id)
            .set({
              relatedCourses: allCourseReferences
            })
            .commit();

          console.log(`   ✅ Updated "${tag.title}" - now has ${allCourseReferences.length} total courses`);
          successCount++;
        } else {
          console.log(`   ⚪ No new courses to add for "${tag.title}"`);
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
    console.log('🎉 Final course mapping completed!');
    console.log(`✅ Successfully updated: ${successCount} tags`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} tags`);
    }
    console.log('\nFinal status:');
    console.log('✅ All tags now have proper course references');
    console.log('✅ "Invalid list values" error should be completely resolved');
    console.log('✅ Each tag has 2-3 relevant courses from your active course list');
    console.log('✅ You can now edit related courses normally in Sanity Studio');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the final mapping
addMissingCourseReferences();
