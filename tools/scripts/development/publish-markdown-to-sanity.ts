#!/usr/bin/env tsx

import { markdownBlogReader } from '../lib/blog/markdown-reader';
import { enhancedClient } from '../lib/sanity/client';

async function publishMarkdownPostsToSanity() {
  console.log('🚀 Starting markdown to Sanity migration...');

  try {
    // Get all markdown posts
    const markdownPosts = await markdownBlogReader.getAllBlogPosts();
    console.log(`📚 Found ${markdownPosts.length} markdown posts`);

    if (markdownPosts.length === 0) {
      console.log('❌ No markdown posts found. Make sure the data/optimized-blog-posts directory exists and contains .md files.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const post of markdownPosts) {
      try {
        console.log(`\n📝 Processing: ${post.title}`);

        // Check if post already exists in Sanity
        const existingPost = await enhancedClient.fetch(
          `*[_type == "post" && slug.current == $slug][0]`,
          { slug: post.slug.current }
        );

        if (existingPost) {
          console.log(`⚠️  Post already exists in Sanity: ${post.title}`);
          continue;
        }

        // Handle category
        let categoryRef = null;
        if (post.category) {
          try {
            // Try to find existing category
            const existingCategory = await enhancedClient.fetch(
              `*[_type == "category" && title == $category][0]`,
              { category: post.category.title }
            );

            if (existingCategory) {
              categoryRef = existingCategory._id;
              console.log(`✅ Using existing category: ${post.category.title}`);
            } else {
              // Create new category
              const newCategory = await enhancedClient.create({
                _type: 'category',
                title: post.category.title,
                slug: {
                  _type: 'slug',
                  current: post.category.slug.current
                },
                description: post.category.description || `${post.category.title} related content`,
                color: post.category.color || '#075E68'
              });
              categoryRef = newCategory._id;
              console.log(`✅ Created new category: ${post.category.title}`);
            }
          } catch (categoryError) {
            console.error(`❌ Error handling category for ${post.title}:`, categoryError);
          }
        }

        // Handle author
        let authorRef = null;
        if (post.author) {
          try {
            // Try to find existing author
            const existingAuthor = await enhancedClient.fetch(
              `*[_type == "author" && name == $author][0]`,
              { author: post.author.name }
            );

            if (existingAuthor) {
              authorRef = existingAuthor._id;
              console.log(`✅ Using existing author: ${post.author.name}`);
            } else {
              // Create new author
              const newAuthor = await enhancedClient.create({
                _type: 'author',
                name: post.author.name,
                slug: {
                  _type: 'slug',
                  current: post.author.slug.current
                },
                role: post.author.role || 'Chief Flight Instructor',
                credentials: post.author.credentials || 'ATPL, CFI, 12,000+ flight hours',
                bio: post.author.bio || [
                  {
                    _type: 'block',
                    children: [
                      {
                        _type: 'span',
                        text: `${post.author.name} is an experienced aviation professional and instructor.`,
                      },
                    ],
                  },
                ],
              });
              authorRef = newAuthor._id;
              console.log(`✅ Created new author: ${post.author.name}`);
            }
          } catch (authorError) {
            console.error(`❌ Error handling author for ${post.title}:`, authorError);
          }
        }

        // Create the Sanity document
        const sanityPost = {
          _type: 'post',
          title: post.title,
          slug: {
            _type: 'slug',
            current: post.slug.current
          },
          excerpt: post.excerpt,
          body: post.body, // Already in Portable Text format from markdown reader
          publishedAt: post.publishedAt,
          featured: post.featured,
          readingTime: post.readingTime,
          tags: post.tags || [],
          difficulty: post.difficulty || 'intermediate',
          contentType: post.contentType || 'guide',
          enableComments: post.enableComments !== false,
          enableSocialSharing: post.enableSocialSharing !== false,
          enableNewsletterSignup: post.enableNewsletterSignup !== false,
          seoEnhancement: post.seoEnhancement || {
            seoTitle: `${post.title} | Aviators Training Centre`,
            seoDescription: post.excerpt || '',
            focusKeyword: '',
            additionalKeywords: post.tags || [],
            canonicalUrl: `https://www.aviatorstrainingcentre.in/blog/${post.slug.current}`,
            structuredData: {
              articleType: 'EducationalArticle',
              learningResourceType: 'Guide',
              educationalLevel: 'intermediate',
              timeRequired: `PT${post.readingTime}M`,
            },
          },
          ctaPlacements: post.ctaPlacements || [
            {
              position: 'bottom',
              ctaType: 'course-promo',
              customTitle: 'Ready to Start Your Aviation Journey?',
              customMessage: 'Join our comprehensive training programs and take the first step toward your aviation career.',
              buttonText: 'Explore Courses',
              variant: 'primary',
            },
          ],
          intelligentCTARouting: post.intelligentCTARouting || {
            enableIntelligentRouting: true,
            fallbackAction: 'courses-overview',
          },
        };

        // Add category reference if available
        if (categoryRef) {
          sanityPost.category = {
            _type: 'reference',
            _ref: categoryRef
          };
        }

        // Add author reference if available
        if (authorRef) {
          sanityPost.author = {
            _type: 'reference',
            _ref: authorRef
          };
        }

        // Create the document in Sanity
        const result = await enhancedClient.create(sanityPost);
        console.log(`✅ Successfully created post in Sanity: ${result.title} (ID: ${result._id})`);
        successCount++;

      } catch (postError) {
        console.error(`❌ Error processing post "${post.title}":`, postError);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${successCount} posts`);
    console.log(`❌ Failed to migrate: ${errorCount} posts`);

    if (successCount > 0) {
      console.log(`\n🌐 Your blog posts should now be visible at: http://localhost:3000/blog`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
publishMarkdownPostsToSanity()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
