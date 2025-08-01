require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function createBlogPost() {
  try {
    console.log('🚀 Starting creation of the new RTR License blog post...');

    // Fetch necessary references (author)
    const author = await client.fetch('*[_type == "author" && name == "Aman Suryavanshi"][0]');
    
    if (!author) {
      console.error('❌ Author "Aman Suryavanshi" not found!');
      return;
    }

    // Check if post with same slug exists
    const existingPost = await client.fetch(
      `*[_type == "post" && slug.current == "rtr-license-complete-guide-radio-telephony-requirements-indian-pilots"][0]`
    );

    const postData = {
      _type: 'post',
      title: 'RTR License Complete Guide: Radio Telephony Requirements for Indian Pilots 2025',
      slug: {
        _type: 'slug',
        current: 'rtr-license-complete-guide-radio-telephony-requirements-indian-pilots'
      },
      excerpt: 'Master RTR (Radio Telephony) license requirements for Indian pilots with our comprehensive 2025 guide. Learn exam patterns, preparation strategies, and career benefits of aviation communication certification.',
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      category: 'DGCA Exam Preparation',
      seoTitle: 'RTR License Guide 2025 - Radio Telephony Requirements for Indian Pilots',
      seoDescription: 'Complete RTR license guide for Indian pilots. Learn radio telephony requirements, exam preparation, career benefits, and how to ace your RTR certification in 2025.',
      focusKeyword: 'RTR license India',
      additionalKeywords: 'radio telephony license India,RTR exam preparation,aviation communication certification,pilot communication requirements,DGCA RTR requirements,radio operator license aviation,flight communication training,aviation English RTR,pilot radio license India,RTR certification process',
      readingTime: 16,
      publishedAt: new Date().toISOString(),
      featured: true,
      seoScore: 95,
      contentValidation: 'Passed',
      hasRequiredFields: true,
      hasValidSEO: true,
      hasValidImages: true,
      structuredData: {
        articleType: 'Educational Article',
        learningResourceType: 'Guide',
        educationalLevel: 'Beginner-Intermediate',
        schemas: ['Article', 'FAQPage', 'HowTo', 'BreadcrumbList']
      },
      ctaPlacements: [
        {
          position: "Introduction CTA (After opening section)",
          customMessage: "Ready to master aviation communication with expert RTR training?",
          customTitle: "Get Professional RTR Training",
          buttonText: "Join RTR Course",
          link: "/contact?subject=Demo%20Request%3A%20RTR(A)%20-%20Radio%20Telephony&courseName=RTR(A)%20-%20Radio%20Telephony&message=I%20would%20like%20to%20book%20a%20demo%20for%20the%20RTR(A)%20-%20Radio%20Telephony%20course.%20Please%20contact%20me%20to%20schedule%20a%20time.#contact-form"
        },
        {
          position: "Mid-Article CTA 1 (After Section 4: Examination Structure)",
          customMessage: "Need structured RTR exam preparation for guaranteed success?",
          customTitle: "Master RTR with Expert Guidance",
          buttonText: "Book RTR Training Demo",
          link: "/contact?subject=Demo%20Request%3A%20RTR(A)%20-%20Radio%20Telephony&courseName=RTR(A)%20-%20Radio%20Telephony&message=I%20would%20like%20to%20book%20a%20demo%20for%20the%20RTR(A)%20-%20Radio%20Telephony%20course.%20Please%20contact%20me%20to%20schedule%20a%20time.#contact-form"
        },
        {
          position: "Mid-Article CTA 2 (After Section 7: Communication Skills)",
          customMessage: "Perfect your aviation communication for career success",
          customTitle: "Enhance Your Aviation Communication Skills",
          buttonText: "Get Personalized Training",
          link: "/contact"
        },
        {
          position: "End-Article CTA (Before Conclusion)",
          customMessage: "Transform your aviation communication skills with professional RTR training",
          customTitle: "Start Your RTR Success Journey",
          buttonText: "Enroll in RTR Course",
          link: "/contact"
        }
      ]
    };

    if (existingPost) {
      console.log('✅ Existing post found with the same slug. Updating instead.');

      const updatedPost = await client
        .patch(existingPost._id)
        .set(postData)
        .commit();

      console.log('✅ RTR License blog post updated successfully!');
      console.log(`Document ID: ${updatedPost._id}`);
      console.log(`Slug: ${postData.slug.current}`);
    } else {
      const createdPost = await client.create(postData);
      console.log('✅ RTR License blog post created successfully!');
      console.log(`Document ID: ${createdPost._id}`);
      console.log(`Slug: ${postData.slug.current}`);
    }

  } catch (error) {
    console.error('❌ Error creating blog post:', error.message);
  }
}

createBlogPost();
