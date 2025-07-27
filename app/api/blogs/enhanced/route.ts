import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

// POST - Create new blog with image upload support
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const tags = formData.get('tags') as string;
    const featured = formData.get('featured') === 'true';
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const focusKeyword = formData.get('focusKeyword') as string;
    const imageAlt = formData.get('imageAlt') as string;
    const imageFile = formData.get('image') as File | null;

    // Enhanced validation with specific error messages - images are now optional
    const missingFields = [];
    if (!title?.trim()) missingFields.push('title');
    if (!content?.trim()) missingFields.push('content');
    if (!category?.trim()) missingFields.push('category');
    if (!excerpt?.trim()) missingFields.push('excerpt');
    // Images and alt text are completely optional for easier blog creation

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate field lengths according to Sanity schema
    if (title.length < 10 || title.length > 80) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 80 characters' },
        { status: 400 }
      );
    }

    if (excerpt.length < 50 || excerpt.length > 300) {
      return NextResponse.json(
        { error: 'Excerpt must be between 50 and 300 characters' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if post with this slug already exists
    const existingPost = await enhancedClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]`,
      { slug: finalSlug }
    );

    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog with this title/slug already exists' },
        { status: 409 }
      );
    }

    // Handle image upload to Sanity - now with better error handling and truly optional
    let imageAsset = null;
    let imageUploadError = false;
    let imageUploadErrorMessage = '';
    
    if (imageFile) {
      try {
        // Check if we have the necessary token for image uploads
        if (!process.env.SANITY_API_TOKEN) {
          console.warn('SANITY_API_TOKEN not configured - skipping image upload');
          imageUploadError = true;
          imageUploadErrorMessage = 'Image upload not configured (missing API token)';
        } else {
          try {
            // Convert File to Buffer
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            
            // Upload image to Sanity with retry logic
            let uploadAttempts = 0;
            const maxAttempts = 3;
            let uploadedImage = null;
            
            while (uploadAttempts < maxAttempts && !uploadedImage) {
              try {
                uploadAttempts++;
                uploadedImage = await enhancedClient.client.assets.upload('image', buffer, {
                  filename: imageFile.name,
                  contentType: imageFile.type,
                });
              } catch (uploadError) {
                console.error(`Image upload attempt ${uploadAttempts} failed:`, uploadError);
                if (uploadAttempts >= maxAttempts) throw uploadError;
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
              }
            }

            if (uploadedImage) {
              imageAsset = {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: uploadedImage._id,
                },
                alt: imageAlt || `Image for ${title}`,
              };
            }
          } catch (bufferError) {
            console.error('Error processing image buffer:', bufferError);
            imageUploadError = true;
            imageUploadErrorMessage = 'Failed to process image data';
          }
        }
      } catch (imageError) {
        console.error('All image upload attempts failed:', imageError);
        // Instead of returning an error response, we'll continue without an image
        // and log the error for tracking purposes
        imageUploadError = true;
        imageUploadErrorMessage = imageError instanceof Error ? imageError.message : 'Unknown upload error';
      }
    } else if (formData.get('imageUrl')) {
      // Handle existing image URL - need to upload local images to Sanity
      const imageUrl = formData.get('imageUrl') as string;
      
      // Check if it's a local file path (starts with /Blogs/)
      if (imageUrl.startsWith('/Blogs/') || imageUrl.startsWith('/')) {
        try {
          // For local images, we need to upload them to Sanity
          const imagePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
          const fullImagePath = `public/${imagePath}`;
          
          // Check if file exists and upload to Sanity
          const fs = require('fs');
          const path = require('path');
          
          if (fs.existsSync(fullImagePath)) {
            const imageBuffer = fs.readFileSync(fullImagePath);
            const fileName = path.basename(imagePath);
            
            const uploadedImage = await enhancedClient.client.assets.upload('image', imageBuffer, {
              filename: fileName,
              contentType: 'image/webp',
            });
            
            imageAsset = {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: uploadedImage._id,
              },
              alt: imageAlt || `Image for ${title}`,
            };
          } else {
            console.warn(`Local image not found: ${fullImagePath}`);
            imageUploadError = true;
            imageUploadErrorMessage = `Local image file not found: ${imagePath}`;
          }
        } catch (localImageError) {
          console.error('Error uploading local image:', localImageError);
          imageUploadError = true;
          imageUploadErrorMessage = 'Failed to upload local image to Sanity';
        }
      } else {
        // It's already a Sanity reference
        imageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageUrl,
          },
          alt: imageAlt || `Image for ${title}`,
        };
      }
    }
    
    // If image upload failed but we want to continue without an image
    if (imageFile && imageUploadError) {
      console.log(`Continuing blog post creation without image due to upload failure: ${imageUploadErrorMessage}`);
    }
    
    // Images are completely optional - proceed with post creation regardless

    // Image is now optional - no need to require imageAsset

    // Handle category - find or create category reference
    let categoryRef = null;
    if (category?.trim()) {
      try {
        // Try to find existing category
        const existingCategory = await enhancedClient.fetch(
          `*[_type == "category" && title == $category][0]`,
          { category }
        );

        if (existingCategory) {
          categoryRef = existingCategory._id;
        } else {
          // Create new category with proper slug generation
          const categorySlug = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newCategory = await enhancedClient.create({
            _type: 'category',
            title: category.trim(),
            slug: {
              _type: 'slug',
              current: categorySlug
            },
            description: `${category.trim()} related content`,
            color: '#075E68'
          });
          categoryRef = newCategory._id;
        }
      } catch (categoryError) {
        console.error('Error handling category:', categoryError);
        // Instead of failing the whole request, continue without category
        console.log('Continuing blog post creation without category due to error');
      }
    }

    // Handle author - find or create author reference
    let authorRef = null;
    if (author?.trim()) {
      try {
        // Try to find existing author
        const existingAuthor = await enhancedClient.fetch(
          `*[_type == "author" && name == $author][0]`,
          { author }
        );

        if (existingAuthor) {
          authorRef = existingAuthor._id;
        } else {
          // Create new author with proper slug generation
          const authorSlug = author.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newAuthor = await enhancedClient.create({
            _type: 'author',
            name: author.trim(),
            slug: {
              _type: 'slug',
              current: authorSlug
            },
            role: 'Chief Flight Instructor',
            credentials: 'ATPL, CFI, 12,000+ flight hours',
            bio: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: `${author.trim()} is an experienced aviation professional and instructor.`,
                  },
                ],
              },
            ],
          });
          authorRef = newAuthor._id;
        }
      } catch (authorError) {
        console.error('Error handling author:', authorError);
        // Instead of failing the whole request, continue without author
        console.log('Continuing blog post creation without author due to error');
      }
    }

    // Convert content to Portable Text blocks
    const bodyBlocks = content.split('\n\n').map((paragraph: string) => ({
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: paragraph.trim(),
        },
      ],
    }));

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Calculate reading time
    const wordCount = content.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Create the blog post document with proper Sanity schema structure
    const newPost: any = {
      _type: 'post',
      title: title.trim(),
      slug: {
        _type: 'slug',
        current: finalSlug
      },
      excerpt: excerpt.trim(),
      body: bodyBlocks,
      publishedAt: new Date().toISOString(),
      featured: Boolean(featured),
      readingTime,
      
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
        timeRequired: `PT${readingTime}M`,
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
        estimatedReadingTime: readingTime,
        wordCount,
        lastSEOCheck: new Date().toISOString(),
        seoScore: 75, // Default score
      },
    };

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

    // Add image if available (now optional)
    if (imageAsset) {
      newPost.image = imageAsset;
    }

    // Create the document in Sanity
    const result = await enhancedClient.create(newPost);

    // Prepare response with appropriate message about image status
    let responseMessage = 'Blog created successfully';
    let imageStatus = 'none';
    
    if (imageFile) {
      if (imageUploadError) {
        responseMessage = `Blog created successfully without image (${imageUploadErrorMessage})`;
        imageStatus = 'failed';
      } else if (imageAsset) {
        responseMessage = 'Blog created successfully with image';
        imageStatus = 'uploaded';
      }
    }

    return NextResponse.json(
      { 
        message: responseMessage, 
        slug: finalSlug,
        id: result._id,
        title: result.title,
        imageStatus: imageStatus,
        imageError: imageUploadError ? imageUploadErrorMessage : null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    
    // Provide specific error messages for common Sanity issues
    if (error instanceof Error) {
      if (error.message.includes('Insufficient permissions') || error.message.includes('permission "create" required')) {
        return NextResponse.json(
          { 
            error: 'Sanity API token lacks create permissions.',
            details: 'Your API token needs Editor permissions. Go to https://sanity.io/manage → Your Project → API → Tokens and ensure your token has Editor permissions (not just Viewer).',
            solution: 'Generate a new token with Editor permissions and update your SANITY_API_TOKEN in .env.local'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Sanity API token is invalid or expired.',
            details: 'Your SANITY_API_TOKEN environment variable contains an invalid token.',
            solution: 'Generate a new token from your Sanity project dashboard and update .env.local'
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('SANITY_API_TOKEN is required')) {
        return NextResponse.json(
          { 
            error: 'SANITY_API_TOKEN environment variable is missing.',
            details: 'The API token is required to create blog posts in Sanity.',
            solution: 'Add SANITY_API_TOKEN=your_token_here to your .env.local file'
          },
          { status: 500 }
        );
      }

      if (error.message.includes('transaction failed')) {
        return NextResponse.json(
          { 
            error: 'Sanity transaction failed due to permissions.',
            details: 'The API token does not have sufficient permissions to create documents.',
            solution: 'Ensure your SANITY_API_TOKEN has Editor permissions for the dataset'
          },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create blog',
        details: 'An unexpected error occurred while creating the blog post.',
        solution: 'Check the server logs for more details or try again.'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing blog with image upload support
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const tags = formData.get('tags') as string;
    const featured = formData.get('featured') === 'true';
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const focusKeyword = formData.get('focusKeyword') as string;
    const imageAlt = formData.get('imageAlt') as string;
    const imageFile = formData.get('image') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string;

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      );
    }

    // Enhanced validation - images are now optional
    const missingFields = [];
    if (!title?.trim()) missingFields.push('title');
    if (!content?.trim()) missingFields.push('content');
    if (!category?.trim()) missingFields.push('category');
    if (!excerpt?.trim()) missingFields.push('excerpt');
    // Images and alt text are completely optional for easier blog creation

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the existing post
    const existingPost = await enhancedClient.fetch(
      `*[_type == "post" && _id == $id][0] { _id, slug, title }`,
      { id }
    ) as { _id: string; slug: { current: string }; title: string } | null;
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Generate new slug from title
    const newSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // If slug changed, check if new slug already exists
    if (newSlug !== existingPost.slug.current) {
      const slugExists = await enhancedClient.fetch(
        `*[_type == "post" && slug.current == $newSlug && _id != $id][0]`,
        { newSlug, id }
      );
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'A blog with this title already exists' },
          { status: 409 }
        );
      }
    }

    // Handle image upload or use existing image - now with better error handling and truly optional
    let imageAsset = null;
    let imageUploadError = false;
    let imageUploadErrorMessage = '';
    
    if (imageFile) {
      try {
        // Check if we have the necessary token for image uploads
        if (!process.env.SANITY_API_TOKEN) {
          console.warn('SANITY_API_TOKEN not configured - skipping image upload');
          imageUploadError = true;
          imageUploadErrorMessage = 'Image upload not configured (missing API token)';
        } else {
          try {
            // Convert File to Buffer
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            
            // Upload image to Sanity with retry logic
            let uploadAttempts = 0;
            const maxAttempts = 3;
            let uploadedImage = null;
            
            while (uploadAttempts < maxAttempts && !uploadedImage) {
              try {
                uploadAttempts++;
                uploadedImage = await enhancedClient.client.assets.upload('image', buffer, {
                  filename: imageFile.name,
                  contentType: imageFile.type,
                });
              } catch (uploadError) {
                console.error(`Image upload attempt ${uploadAttempts} failed:`, uploadError);
                if (uploadAttempts >= maxAttempts) throw uploadError;
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
              }
            }

            if (uploadedImage) {
              imageAsset = {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: uploadedImage._id,
                },
                alt: imageAlt || `Image for ${title}`,
              };
            }
          } catch (bufferError) {
            console.error('Error processing image buffer:', bufferError);
            imageUploadError = true;
            imageUploadErrorMessage = 'Failed to process image data';
          }
        }
      } catch (imageError) {
        console.error('All image upload attempts failed:', imageError);
        // Instead of returning an error response, we'll continue without an image
        // and log the error for tracking purposes
        imageUploadError = true;
        imageUploadErrorMessage = imageError instanceof Error ? imageError.message : 'Unknown upload error';
      }
    } else if (existingImageUrl) {
      // Use existing image
      imageAsset = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: existingImageUrl,
        },
        alt: imageAlt || `Image for ${title}`,
      };
    }
    
    // If image upload failed but we want to continue without an image
    if (imageFile && imageUploadError) {
      console.log(`Continuing blog post update without new image due to upload failure: ${imageUploadErrorMessage}`);
    }
    
    // Images are completely optional - proceed with post update regardless

    // Convert content to Portable Text blocks if it's a string
    const bodyBlocks = content.split('\n\n').map((paragraph: string) => ({
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: paragraph.trim(),
        },
      ],
    }));

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Calculate reading time
    const wordCount = content.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Prepare update data
    const updateData: any = {
      title,
      slug: {
        _type: 'slug',
        current: newSlug
      },
      excerpt: excerpt || '',
      body: bodyBlocks,
      featured: Boolean(featured),
      readingTime,
      
      // SEO fields
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      focusKeyword: focusKeyword || '',
      
      // Update performance metrics
      performanceMetrics: {
        estimatedReadingTime: readingTime,
        wordCount,
        lastSEOCheck: new Date().toISOString(),
        seoScore: 75, // Default score
      },
      
      // Update content validation
      contentValidation: {
        hasRequiredFields: Boolean(title && content && excerpt),
        hasValidSEO: Boolean(seoTitle && seoDescription),
        hasValidImages: imageAsset ? Boolean(imageAsset) : true, // Images are optional
        readyForPublish: true,
      },
    };

    // Add image if available
    if (imageAsset) {
      updateData.image = imageAsset;
    }

    // Handle category - find or create category reference
    if (category?.trim()) {
      try {
        // Try to find existing category
        const existingCategory = await enhancedClient.fetch(
          `*[_type == "category" && title == $category][0]`,
          { category }
        );

        if (existingCategory) {
          updateData.category = {
            _type: 'reference',
            _ref: existingCategory._id
          };
        } else {
          // Create new category with proper slug generation
          const categorySlug = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newCategory = await enhancedClient.create({
            _type: 'category',
            title: category.trim(),
            slug: {
              _type: 'slug',
              current: categorySlug
            },
            description: `${category.trim()} related content`,
            color: '#075E68'
          });
          updateData.category = {
            _type: 'reference',
            _ref: newCategory._id
          };
        }
      } catch (categoryError) {
        console.error('Error handling category:', categoryError);
        // Instead of failing the whole request, continue without category
        console.log('Continuing blog post update without category due to error');
      }
    }

    // Handle author - find or create author reference
    if (author?.trim()) {
      try {
        // Try to find existing author
        const existingAuthor = await enhancedClient.fetch(
          `*[_type == "author" && name == $author][0]`,
          { author }
        );

        if (existingAuthor) {
          updateData.author = {
            _type: 'reference',
            _ref: existingAuthor._id
          };
        } else {
          // Create new author with proper slug generation
          const authorSlug = author.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newAuthor = await enhancedClient.create({
            _type: 'author',
            name: author.trim(),
            slug: {
              _type: 'slug',
              current: authorSlug
            },
            role: 'Chief Flight Instructor',
            credentials: 'ATPL, CFI, 12,000+ flight hours',
            bio: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: `${author.trim()} is an experienced aviation professional and instructor.`,
                  },
                ],
              },
            ],
          });
          updateData.author = {
            _type: 'reference',
            _ref: newAuthor._id
          };
        }
      } catch (authorError) {
        console.error('Error handling author:', authorError);
        // Instead of failing the whole request, continue without author
        console.log('Continuing blog post update without author due to error');
      }
    }

    // Update the document in Sanity
    const result = await enhancedClient
      .patch(existingPost._id)
      .set(updateData)
      .commit();

    // Prepare response with appropriate message about image status
    let responseMessage = 'Blog updated successfully';
    let imageStatus = 'none';
    
    if (imageFile) {
      if (imageUploadError) {
        responseMessage = `Blog updated successfully without new image (${imageUploadErrorMessage})`;
        imageStatus = 'failed';
      } else if (imageAsset) {
        responseMessage = 'Blog updated successfully with new image';
        imageStatus = 'uploaded';
      }
    } else if (existingImageUrl) {
      imageStatus = 'existing';
    }

    return NextResponse.json(
      { 
        message: responseMessage, 
        slug: newSlug,
        renamed: newSlug !== existingPost.slug.current,
        id: result._id,
        imageStatus: imageStatus,
        imageError: imageUploadError ? imageUploadErrorMessage : null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating blog:', error);
    
    // Provide specific error messages for common Sanity issues
    if (error instanceof Error) {
      if (error.message.includes('Insufficient permissions') || error.message.includes('permission "create" required')) {
        return NextResponse.json(
          { 
            error: 'Sanity API token lacks update permissions. Please check your token has Editor permissions for the dataset.',
            details: 'Go to https://sanity.io/manage → Your Project → API → Tokens and ensure your token has Editor permissions.'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Sanity API token is invalid or expired. Please check your SANITY_API_TOKEN environment variable.',
            details: 'Generate a new token from your Sanity project dashboard.'
          },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update blog' },
      { status: 500 }
    );
  }
}