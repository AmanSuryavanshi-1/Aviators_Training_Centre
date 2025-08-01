require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Course data that we need to create or reference
const coursesToCreate = [
  {
    title: 'Airline Interview Preparation',
    slug: { current: 'airline-interview-preparation' },
    description: 'Comprehensive preparation for airline recruitment interviews',
    courseType: 'interview-prep',
    duration: '2 weeks',
    isActive: true
  },
  {
    title: 'CPL Ground School',
    slug: { current: 'cpl-ground-school' },
    description: 'Commercial Pilot License ground training program',
    courseType: 'ground-school',
    duration: '6 months',
    isActive: true
  },
  {
    title: 'ATPL Ground School',
    slug: { current: 'atpl-ground-school' },
    description: 'Airline Transport Pilot License ground training program',
    courseType: 'ground-school',
    duration: '8 months',
    isActive: true
  },
  {
    title: 'DGCA CPL Ground School',
    slug: { current: 'dgca-cpl-ground-school' },
    description: 'DGCA approved Commercial Pilot License ground school',
    courseType: 'ground-school',
    duration: '6 months',
    isActive: true
  },
  {
    title: 'Technical General Ground School',
    slug: { current: 'technical-general-ground-school' },
    description: 'Technical general subjects for aviation licensing',
    courseType: 'ground-school',
    duration: '4 months',
    isActive: true
  }
];

// Tag to course mapping
const tagCourseMapping = {
  'aviation-interview': ['Airline Interview Preparation'],
  'interview-preparation': ['CPL Ground School'],
  'aviation-ground-school': ['CPL Ground School', 'Technical General Ground School'],
  'dgca-training': ['DGCA CPL Ground School', 'Technical General Ground School'],
  'pilot-theory': ['Technical General Ground School'],
  'aviation-education': ['CPL Ground School', 'ATPL Ground School']
};

async function createOrGetCourse(courseData) {
  try {
    // Check if course already exists
    const existingCourse = await client.fetch(
      `*[_type == "course" && slug.current == $slug][0]`,
      { slug: courseData.slug.current }
    );

    if (existingCourse) {
      console.log(`✅ Using existing course: ${courseData.title} (ID: ${existingCourse._id})`);
      return existingCourse;
    }

    // Create new course
    const newCourse = await client.create({
      _type: 'course',
      ...courseData,
      createdAt: new Date().toISOString()
    });

    console.log(`🆕 Created new course: ${courseData.title} (ID: ${newCourse._id})`);
    return newCourse;
  } catch (error) {
    console.error(`❌ Error with course "${courseData.title}":`, error.message);
    return null;
  }
}

async function fixTagRelatedCourses() {
  try {
    console.log('🚀 Starting tag related courses fix...');
    console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log('');

    // Step 1: Create or get all courses
    console.log('📚 Creating/fetching courses...');
    const courseMap = new Map();
    
    for (const courseData of coursesToCreate) {
      const course = await createOrGetCourse(courseData);
      if (course) {
        courseMap.set(course.title, course._id);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n✅ Successfully processed ${courseMap.size} courses\n`);

    // Step 2: Update tags with proper course references
    console.log('🏷️ Updating tags with course references...');

    for (const [tagSlug, courseNames] of Object.entries(tagCourseMapping)) {
      try {
        // Get the existing tag
        const tag = await client.fetch(
          `*[_type == "tag" && slug.current == $slug][0]`,
          { slug: tagSlug }
        );

        if (!tag) {
          console.log(`⚠️ Tag not found: ${tagSlug}`);
          continue;
        }

        // Build course references array
        const courseReferences = [];
        for (const courseName of courseNames) {
          const courseId = courseMap.get(courseName);
          if (courseId) {
            courseReferences.push({
              _type: 'reference',
              _ref: courseId
            });
          } else {
            console.log(`⚠️ Course not found: ${courseName}`);
          }
        }

        if (courseReferences.length > 0) {
          // Update the tag with proper course references
          const updatedTag = await client
            .patch(tag._id)
            .set({
              relatedCourses: courseReferences
            })
            .commit();

          console.log(`✅ Updated tag: ${tag.title} with ${courseReferences.length} course(s)`);
        } else {
          console.log(`⚠️ No valid courses found for tag: ${tag.title}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`❌ Error updating tag ${tagSlug}:`, error.message);
      }
    }

    console.log('\n🎉 Tag related courses fix completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check your Sanity Studio to verify the related courses are now properly linked');
    console.log('2. The "Invalid list values" error should be resolved');
    console.log('3. You can now edit the related courses field in the Studio');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the fix
fixTagRelatedCourses();
