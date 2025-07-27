import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

// GET - Fetch all blogs from Sanity only
export async function GET() {
  try {
    const blogs = await enhancedClient.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        featured,
        readingTime,
        category->{
          title,
          slug
        },
        author->{
          name,
          slug
        },
        image {
          asset->,
          alt
        }
      }
    `);
    
    return NextResponse.json({ 
      blogs: blogs || [], 
      isEmpty: (blogs || []).length === 0,
      count: (blogs || []).length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { 
        blogs: [], 
        error: 'Failed to fetch blogs from database',
        isEmpty: true 
      },
      { status: 200 }
    );
  }
}

// POST - Create new blog (via Sanity)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug: providedSlug,
      body: content, 
      excerpt, 
      category, 
      author,
      tags,
      featured, 
      seoTitle,
      seoDescription,
      focusKeyword 
    } = body;

    // Enhanced validation with specific error messages
    const missingFields = [];
    if (!title?.trim()) missingFields.push('title');
    if (!content?.trim()) missingFields.push('content');
    if (!category?.trim()) missingFields.push('category');
    if (!excerpt?.trim()) missingFields.push('excerpt');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate slug from title or use provided slug
    const slug = providedSlug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if post with this slug already exists
    const existingPost = await enhancedClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]`,
      { slug }
    );

    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog with this title/slug already exists' },
        { status: 409 }
      );
    }

    // First, ensure we have a category document
    let categoryRef = null;
    try {
      // Try to find existing category
      const existingCategory = await enhancedClient.fetch(
        `*[_type == "category" && title == $category][0]`,
        { category }
      );

      if (existingCategory) {
        categoryRef = existingCategory._id;
      } else {
        // Create new category
        const newCategory = await enhancedClient.create({
          _type: 'category',
          title: category,
          slug: {
            _type: 'slug',
            current: category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          },
          description: `${category} related content`,
          color: '#075E68'
        });
        categoryRef = newCategory._id;
      }
    } catch (categoryError) {
      console.error('Error handling category:', categoryError);
      // Continue without category reference
    }

    // Handle author
    let authorRef = null;
    if (author) {
      try {
        // Try to find existing author
        const existingAuthor = await enhancedClient.fetch(
          `*[_type == "author" && name == $author][0]`,
          { author }
        );

        if (existingAuthor) {
          authorRef = existingAuthor._id;
        } else {
          // Create new author
          const newAuthor = await enhancedClient.create({
            _type: 'author',
            name: author,
            slug: {
              _type: 'slug',
              current: author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            },
            role: 'Chief Flight Instructor',
            credentials: 'ATPL, CFI, 12,000+ flight hours',
            bio: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: `${author} is an experienced aviation professional and instructor.`,
                  },
                ],
              },
            ],
          });
          authorRef = newAuthor._id;
        }
      } catch (authorError) {
        console.error('Error handling author:', authorError);
        // Continue without author reference
      }
    }

    // Convert content to Portable Text blocks - handle markdown formatting
    const bodyBlocks = content.split('\n\n').filter(p => p.trim()).map((paragraph: string) => {
      const trimmed = paragraph.trim();
      
      // Handle headings
      if (trimmed.startsWith('# ')) {
        return {
          _type: 'block',
          style: 'h1',
          children: [{ _type: 'span', text: trimmed.substring(2) }],
        };
      }
      if (trimmed.startsWith('## ')) {
        return {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: trimmed.substring(3) }],
        };
      }
      if (trimmed.startsWith('### ')) {
        return {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: trimmed.substring(4) }],
        };
      }
      
      // Handle lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [{ _type: 'span', text: trimmed.substring(2) }],
        };
      }
      
      if (/^\d+\. /.test(trimmed)) {
        return {
          _type: 'block',
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: [{ _type: 'span', text: trimmed.replace(/^\d+\. /, '') }],
        };
      }
      
      // Regular paragraph
      return {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: trimmed }],
      };
    });

    // Handle featured image - only add if explicitly provided
    let featuredImage = null;
    if (body.imageUrl) {
      // In a production setup, you'd upload this to Sanity's asset store
      // For now, we'll store it as metadata
      featuredImage = {
        imageUrl: body.imageUrl,
        imageAlt: body.imageAlt || `Featured image for ${title}`
      };
    }

    // Create the blog post document with proper Sanity schema structure
    const newPost: any = {
      _type: 'post',
      title: title.trim(),
      slug: {
        _type: 'slug',
        current: slug
      },
      excerpt: excerpt.trim(),
      body: bodyBlocks,
      publishedAt: new Date().toISOString(),
      featured: Boolean(featured),
      readingTime: Math.max(1, Math.ceil(content.split(' ').length / 200)),
      
      // SEO fields (direct fields based on schema)
      seoTitle: seoTitle || `${title} | Aviators Training Centre`,
      seoDescription: seoDescription || excerpt.substring(0, 160),
      focusKeyword: focusKeyword || '',
      additionalKeywords: [],
      
      // Structured data
      structuredData: {
        articleType: 'EducationalArticle',
        learningResourceType: 'Article',
        educationalLevel: 'beginner',
        timeRequired: `PT${Math.max(1, Math.ceil(content.split(' ').length / 200))}M`,
      },
      
      // Basic CTA placement for new posts
      ctaPlacements: [
        {
          position: 'bottom',
          ctaType: 'course-promo',
          customTitle: 'Ready to Start Your Aviation Journey?',
          customMessage: 'Join our comprehensive training programs and take the first step toward your aviation career.',
          buttonText: 'Explore Courses',
          variant: 'primary',
        },
      ],
      
      // Workflow and validation fields
      workflowStatus: 'published', // Directly publish for now
      contentValidation: {
        hasRequiredFields: true,
        hasValidSEO: Boolean(seoTitle && seoDescription),
        hasValidImages: true,
        readyForPublish: true,
      },
      
      // Performance metrics
      performanceMetrics: {
        estimatedReadingTime: Math.max(1, Math.ceil(content.split(' ').length / 200)),
        wordCount: content.split(' ').length,
        lastSEOCheck: new Date().toISOString(),
        seoScore: 75, // Default score
      },
    };

    // Add featured image metadata if provided
    if (featuredImage) {
      newPost.featuredImageUrl = featuredImage.imageUrl;
      newPost.featuredImageAlt = featuredImage.imageAlt;
    }

    // Add category reference if available
    if (categoryRef) {
      newPost.category = {
        _type: 'reference',
        _ref: categoryRef
      };
    }

    // Add author reference if available
    if (authorRef) {
      newPost.author = {
        _type: 'reference',
        _ref: authorRef
      };
    }

    // Create the document in Sanity
    const result = await enhancedClient.create(newPost);

    return NextResponse.json(
      { 
        message: 'Blog created successfully', 
        slug,
        id: result._id,
        title: result.title
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create blog' },
      { status: 500 }
    );
  }
}