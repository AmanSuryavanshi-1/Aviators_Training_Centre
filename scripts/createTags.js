require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function createTags() {
  const tagsToCreate = [
    'Aviation Interview', 'Pilot Jobs', 'Career Success', 'Interview Preparation', 'Airline Recruitment',
    'Aviation Ground School', 'DGCA Training', 'Pilot Theory', 'Aviation Education', 'Flight Training',
  ];

  try {
    for (let tag of tagsToCreate) {
      const exists = await client.fetch(`*[_type == "tag" && title == "${tag}"]`);

      if (!exists.length) {
        const slug = tag.toLowerCase().replace(/\s+/g, '-');
        const newTag = await client.create({
          _type: 'tag',
          title: tag,
          slug: { current: slug },
          description: `Tag for ${tag} related content`,
        });
        console.log(`✅ Created new tag: ${tag}`);
      } else {
        console.log(`🔍 Tag already exists: ${tag}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating tags:', error);
  }
}

createTags();

