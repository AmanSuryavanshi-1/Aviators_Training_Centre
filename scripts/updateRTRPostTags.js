require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Tag definitions with comprehensive SEO keywords and related course mappings
const tagDefinitions = {
  "RTR License": {
    description: "Radio Telephony License requirements, examination, and certification for Indian pilots",
    color: "blue",
    category: "certification",
    seoKeywords: [
      "RTR license India", "radio telephony license", "RTR exam preparation", 
      "aviation communication certification", "pilot radio license", "RTR requirements DGCA",
      "radio operator license aviation", "flight communication training", "aviation English RTR",
      "RTR certification process", "pilot communication requirements", "radio telephony training"
    ],
    relatedCourseIds: ["01077650-17b1-4eac-8dc1-0248fad86a56"] // RTR Radio Telephony
  },
  "Radio Telephony": {
    description: "Aviation radio communication procedures, phraseology, and air traffic control protocols",
    color: "teal",
    category: "technical-general",
    seoKeywords: [
      "radio telephony aviation", "aviation communication procedures", "ATC communication",
      "pilot radio communication", "aviation phraseology", "air traffic control procedures",
      "flight communication protocols", "aviation radio procedures", "pilot communication skills",
      "aviation English communication", "radio communication training", "flight deck communication"
    ],
    relatedCourseIds: ["01077650-17b1-4eac-8dc1-0248fad86a56"]
  },
  "Aviation Communication": {
    description: "Professional aviation communication skills, phraseology, and radio procedures for pilots",
    color: "green",
    category: "technical-general",
    seoKeywords: [
      "aviation communication skills", "pilot communication training", "aviation phraseology",
      "flight communication procedures", "aviation English", "pilot radio skills",
      "aviation communication standards", "flight deck communication", "ATC communication skills",
      "aviation communication certification", "pilot communication requirements", "aviation language proficiency"
    ],
    relatedCourseIds: ["01077650-17b1-4eac-8dc1-0248fad86a56", "dad3af9b-4569-4b2e-91ac-d5475feb5393"]
  },
  "DGCA Requirements": {
    description: "DGCA licensing requirements, regulations, and examination standards for Indian aviation",
    color: "orange",
    category: "regulation",
    seoKeywords: [
      "DGCA requirements", "DGCA pilot license", "DGCA examination", "India aviation regulations",
      "DGCA CPL requirements", "DGCA medical requirements", "DGCA training standards",
      "Indian aviation licensing", "DGCA certification process", "aviation regulations India",
      "DGCA exam preparation", "pilot licensing India", "DGCA compliance requirements"
    ],
    relatedCourseIds: ["dad3af9b-4569-4b2e-91ac-d5475feb5393", "qszvaZusvE4KvujKBILzQP"]
  },
  "Pilot Certification": {
    description: "Comprehensive guide to pilot certification processes, requirements, and career progression",
    color: "purple",
    category: "certification",
    seoKeywords: [
      "pilot certification process", "pilot license requirements", "aviation certification",
      "commercial pilot certification", "pilot training certification", "aviation license types",
      "pilot qualification requirements", "aviation certification standards", "flight training certification",
      "pilot career certification", "aviation professional certification", "pilot license progression"
    ],
    relatedCourseIds: ["dad3af9b-4569-4b2e-91ac-d5475feb5393", "26c1f6b8-fdb7-45a0-bdf6-842369ca5298"]
  }
};

async function updateRTRPostTags() {
  try {
    console.log('🚀 Finding RTR License blog post...');

    // Find the RTR License post
    const rtrPost = await client.fetch(`*[_type == "post" && slug.current match "*rtr*"][0]{ _id, title, slug, tags }`);
    
    if (!rtrPost) {
      console.error('❌ RTR License post not found!');
      return;
    }

    console.log(`✅ Found RTR post: ${rtrPost.title} (ID: ${rtrPost._id})`);

    // Tags to add to the RTR License post
    const tagsToAdd = ["RTR License", "Radio Telephony", "Aviation Communication", "DGCA Requirements", "Pilot Certification"];
    
    // Process each tag
    const tagReferences = [];
    
    for (const tagTitle of tagsToAdd) {
      const existingTag = await client.fetch(
        `*[_type == "tag" && title == $title][0]`, { title: tagTitle }
      );

      let tagId;
      const tagDef = tagDefinitions[tagTitle];

      if (existingTag) {
        console.log(`✅ Tag already exists: ${tagTitle}`);
        tagId = existingTag._id;
        
        // Update existing tag if it needs enhancement
        if (tagDef && (!existingTag.seoKeywords || existingTag.seoKeywords.length < tagDef.seoKeywords.length)) {
          console.log(`🔄 Updating tag with enhanced data: ${tagTitle}`);
          await client
            .patch(existingTag._id)
            .set({
              description: tagDef.description,
              color: tagDef.color,
              category: tagDef.category,
              seoKeywords: tagDef.seoKeywords,
              relatedCourses: tagDef.relatedCourseIds.map(courseId => ({
                _type: 'reference',
                _ref: courseId
              }))
            })
            .commit();
        }
      } else {
        // Create new tag with comprehensive data
        const newTagData = {
          _type: 'tag',
          title: tagTitle,
          slug: { _type: 'slug', current: tagTitle.toLowerCase().replace(/ /g, '-') },
          isActive: true,
          usageCount: 0,
          createdAt: new Date().toISOString(),
        };

        if (tagDef) {
          // Use comprehensive tag definition
          newTagData.description = tagDef.description;
          newTagData.color = tagDef.color;
          newTagData.category = tagDef.category;
          newTagData.seoKeywords = tagDef.seoKeywords;
          newTagData.relatedCourses = tagDef.relatedCourseIds.map(courseId => ({
            _type: 'reference',
            _ref: courseId
          }));
        }

        const createdTag = await client.create(newTagData);
        console.log(`🆕 Created new tag: ${tagTitle} (ID: ${createdTag._id})`);
        tagId = createdTag._id;
      }

      tagReferences.push({ _type: 'reference', _ref: tagId });
      
      // Small delay between tag operations
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Update the RTR post with tags
    console.log(`🔄 Adding tags to RTR License post...`);
    const updatedPost = await client
      .patch(rtrPost._id)
      .set({
        tags: tagReferences
      })
      .commit();

    console.log(`✅ RTR License post updated successfully with ${tagReferences.length} tags!`);
    console.log(`Post ID: ${updatedPost._id}`);

  } catch (error) {
    console.error('❌ Error updating RTR post tags:', error.message);
  }
}

updateRTRPostTags();
