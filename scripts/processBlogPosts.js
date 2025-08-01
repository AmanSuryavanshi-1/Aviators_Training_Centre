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
  },
  "Training Pathways": {
    description: "Comprehensive aviation training pathways from private pilot to airline transport pilot",
    color: "indigo",
    category: "training",
    seoKeywords: [
      "aviation training pathways", "pilot training routes", "flight training programs",
      "pilot career progression", "aviation training options", "flight school pathways",
      "pilot training journey", "aviation education pathways", "commercial pilot training",
      "pilot training timeline", "aviation career pathways", "flight training progression"
    ],
    relatedCourseIds: ["dad3af9b-4569-4b2e-91ac-d5475feb5393", "qszvaZusvE4KvujKBILzmx", "26c1f6b8-fdb7-45a0-bdf6-842369ca5298"]
  },
  "Aviation Careers": {
    description: "Career opportunities, progression paths, and employment prospects in the aviation industry",
    color: "pink",
    category: "career",
    seoKeywords: [
      "aviation careers", "pilot career opportunities", "aviation job prospects",
      "airline career paths", "aviation industry careers", "commercial pilot careers",
      "aviation employment opportunities", "pilot job market", "aviation career planning",
      "airline pilot careers", "aviation career advancement", "flight training careers"
    ],
    relatedCourseIds: ["qszvaZusvE4KvujKBILzbg", "qszvaZusvE4KvujKBILzmx"]
  },
  "Pilot Licensing": {
    description: "Complete guide to pilot licensing requirements, processes, and career advancement",
    color: "cyan",
    category: "licensing",
    seoKeywords: [
      "pilot licensing", "pilot license types", "commercial pilot license",
      "pilot license requirements", "aviation licensing process", "pilot certification",
      "flight license requirements", "pilot license progression", "aviation license standards",
      "pilot licensing guide", "flight training licenses", "pilot qualification licensing"
    ],
    relatedCourseIds: ["dad3af9b-4569-4b2e-91ac-d5475feb5393", "2995a044-6a32-45a9-b5a5-e65b22a5cf4b"]
  }
};

const blogPosts = [
  {
    title: "Aviation Interview Preparation: Complete Guide for Pilot Job Success in 2025",
    slug: "aviation-interview-preparation-guide-pilot-success-2025",
    excerpt: "Master aviation interviews with our comprehensive 2025 guide. Expert tips, common questions...",
    authorName: "Aman Suryavanshi",
    category: "Career Guidance",
    seoTitle: "Aviation Interview Preparation Guide 2025 - Pilot Job Success",
    seoDescription: "Complete Aviation Interview Preparation guide for 2025. Discover expert tips for successful pilot job interviews in India.",
    focusKeyword: "aviation interview preparation",
    additionalKeywords: "pilot job interview tips, aviation interview questions, aviation career guide, pilot interview prep, aviation job success",
    readingTime: 12,
    structuredData: {
      articleType: 'Guide',
      learningResourceType: 'Article',
      educationalLevel: 'Intermediate',
      schemas: ['Article', 'FAQPage', 'HowTo', 'BreadcrumbList']
    },
    tags: ["RTR License", "Radio Telephony", "Aviation Communication", "DGCA Requirements", "Pilot Certification"],
  },
  {
    title: "Complete Guide to Starting Your Aviation Career in 2024",
    slug: "aviation-career-guide-2024",
    excerpt: "Discover the essential steps, requirements, and strategies for launching a successful aviation career in 2024...",
    authorName: "Ankit Kumar",
    category: "Aviation Careers",
    seoTitle: "Aviation Career Guide 2024 - Starting Your Pilot Journey",
    seoDescription: "Complete guide to starting your aviation career in 2024, including training options, career paths, and industry outlook.",
    focusKeyword: "aviation career guide",
    additionalKeywords: "pilot career start, aviation training 2024, aviation career steps, aviation industry 2024, pilot job strategies",
    readingTime: 10,
    structuredData: {
      articleType: 'Guide',
      learningResourceType: 'Article',
      educationalLevel: 'Beginner',
      schemas: ['Article', 'FAQPage', 'HowTo', 'BreadcrumbList']
    },
    tags: ["Training Pathways", "Aviation Careers", "Pilot Licensing"],
  },
];

async function createOrUpdateBlogPosts() {
  try {
    console.log('🚀 Starting blog post processing...');

    for (const post of blogPosts) {
      // Fetch necessary references (author)
      const author = await client.fetch('*[_type == "author" && name == $name][0]', { name: post.authorName });
      
      if (!author) {
        console.error(`❌ Author "${post.authorName}" not found!`);
        continue;
      }

      // Check if post with same slug exists
      const existingPost = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`, { slug: post.slug }
      );

      const postData = {
        _type: 'post',
        title: post.title,
        slug: {
          _type: 'slug',
          current: post.slug,
        },
        excerpt: post.excerpt,
        author: {
          _type: 'reference',
          _ref: author._id,
        },
        category: post.category,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        focusKeyword: post.focusKeyword,
        additionalKeywords: post.additionalKeywords,
        readingTime: post.readingTime,
        publishedAt: new Date().toISOString(),
        featured: true,
        hasRequiredFields: true,
        hasValidSEO: true,
        hasValidImages: true,
        structuredData: post.structuredData,
      };

      // Process Tags with comprehensive definitions
      const tagReferences = [];
      
      for (const tagTitle of post.tags) {
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
          } else {
            // Fallback for undefined tags
            newTagData.description = `${tagTitle} related content`;
            newTagData.color = 'teal';
            newTagData.category = 'General';
            newTagData.seoKeywords = [`${tagTitle}`, `${tagTitle} guide`, `${tagTitle} information`];
          }

          const createdTag = await client.create(newTagData);
          console.log(`🆕 Created new tag: ${tagTitle} (ID: ${createdTag._id})`);
          tagId = createdTag._id;
        }

        tagReferences.push({ _type: 'reference', _ref: tagId });
        
        // Small delay between tag operations
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Add all tag references to the post
      postData.tags = tagReferences;

      if (existingPost) {
        console.log(`✅ Existing post found for: ${post.title}. Updating...`);

        const updatedPost = await client
          .patch(existingPost._id)
          .set(postData)
          .commit();

        console.log(`✅ Blog post updated successfully! Title: ${post.title}, Document ID: ${updatedPost._id}`);
      } else {
        const createdPost = await client.create(postData);
        console.log(`✅ Blog post created successfully! Title: ${post.title}, Document ID: ${createdPost._id}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('✅ All blog posts processed successfully!');

  } catch (error) {
    console.error('❌ Error processing blog posts:', error.message);
  }
}

createOrUpdateBlogPosts();
