require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkAndCreateTags() {
  try {
    const allTags = await client.fetch('*[_type == "tag"]{_id, title, slug}');
    console.log('=== ALL EXISTING TAGS ===');
    allTags.forEach(tag => console.log(`${tag.title} (${tag.slug?.current || 'no-slug'}) - ID: ${tag._id}`));
    
    const neededTags = ['RTR License', 'Radio Telephony', 'Aviation Communication', 'DGCA Requirements', 'Pilot Certification'];
    console.log('\n=== CHECKING NEEDED TAGS ===');
    
    const foundTags = [];
    const missingTags = [];
    
    neededTags.forEach(neededTag => {
      const found = allTags.find(tag => 
        tag.title.toLowerCase() === neededTag.toLowerCase() ||
        tag.slug?.current === neededTag.toLowerCase().replace(/\s+/g, '-')
      );
      if (found) {
        foundTags.push(found);
        console.log(`✅ Found: ${neededTag} -> ${found.title} (${found._id})`);
      } else {
        missingTags.push(neededTag);
        console.log(`❌ Missing: ${neededTag}`);
      }
    });
    
    console.log(`\n=== CREATING MISSING TAGS ===`);
    const createdTags = [];
    
    for (const missingTag of missingTags) {
      const tagData = {
        _type: 'tag',
        title: missingTag,
        slug: {
          _type: 'slug',
          current: missingTag.toLowerCase().replace(/\s+/g, '-')
        }
      };
      
      try {
        const created = await client.create(tagData);
        createdTags.push(created);
        console.log(`✅ Created: ${missingTag} -> ID: ${created._id}`);
      } catch (error) {
        console.error(`❌ Failed to create ${missingTag}:`, error.message);
      }
    }
    
    console.log(`\n=== FINAL SUMMARY ===`);
    console.log(`Found existing: ${foundTags.length}`);
    console.log(`Created new: ${createdTags.length}`);
    console.log(`Total available: ${foundTags.length + createdTags.length}`);
    
    // Return all available tags for the RTR post
    const allAvailableTags = [...foundTags, ...createdTags];
    return allAvailableTags;
    
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

checkAndCreateTags();
