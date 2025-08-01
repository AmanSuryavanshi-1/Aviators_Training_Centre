require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixStructuredDataBlogPost() {
  try {
    console.log('🚀 Fixing structured data format for the blog post...');

    // Get the blog post
    const post = await client.fetch(
      `*[_type == "post" && slug.current == "type-rating-a320-vs-b737-career-impact-analysis-india"][0]`
    );

    if (!post) {
      console.error('❌ Blog post not found');
      return;
    }

    console.log(`✅ Found blog post: ${post.title} (ID: ${post._id})`);

    // Fix the structured data format according to the schema
    const updatedPost = await client
      .patch(post._id)
      .set({
        structuredData: {
          articleType: 'EducationalArticle', // Single string, not array
          learningResourceType: 'Guide', // Single string, not array  
          educationalLevel: 'intermediate', // Use the exact value from schema
          timeRequired: 'PT15M' // ISO 8601 duration format
        },
        // Also add the missing SEO keywords
        focusKeyword: 'A320 vs B737 type rating India',
        additionalKeywords: [
          'type rating cost India',
          'airline hiring India', 
          'pilot type rating comparison',
          'IndiGo type rating',
          'SpiceJet type rating',
          'Jet Airways type rating',
          'low cost carrier pilot jobs',
          'career growth airline pilot',
          'A320 jobs India',
          'B737 jobs India'
        ],
        // Set published status
        workflowStatus: 'published'
      })
      .commit();

    console.log('✅ Blog post structured data fixed successfully!');
    
    // Verify the fix
    const verifyPost = await client.fetch(
      `*[_type == "post" && _id == "${post._id}"][0]{
        _id,
        title,
        structuredData,
        focusKeyword,
        additionalKeywords,
        workflowStatus
      }`
    );

    if (verifyPost) {
      console.log('✅ Verification successful:');
      console.log(`   Article Type: ${verifyPost.structuredData?.articleType || 'MISSING'}`);
      console.log(`   Learning Resource Type: ${verifyPost.structuredData?.learningResourceType || 'MISSING'}`);
      console.log(`   Educational Level: ${verifyPost.structuredData?.educationalLevel || 'MISSING'}`);
      console.log(`   Time Required: ${verifyPost.structuredData?.timeRequired || 'MISSING'}`);
      console.log(`   Focus Keyword: ${verifyPost.focusKeyword || 'MISSING'}`);
      console.log(`   Additional Keywords: ${verifyPost.additionalKeywords?.length || 0} keywords`);
      console.log(`   Workflow Status: ${verifyPost.workflowStatus || 'MISSING'}`);
    }

    console.log('');
    console.log('🎉 The structured data error should now be resolved!');
    console.log('📋 You can now safely edit the structured data fields in Sanity Studio.');

  } catch (error) {
    console.error('❌ Error fixing blog post:', error.message);
  }
}

fixStructuredDataBlogPost();
