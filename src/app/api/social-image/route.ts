import { NextRequest, NextResponse } from 'next/server'
import { generateSocialImage, getOptimalTemplate, SOCIAL_IMAGE_TEMPLATES } from '@/lib/socialImageGenerator'
import { sanityClient } from '@/lib/sanity/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const template = searchParams.get('template')
    const preview = searchParams.get('preview') === 'true'

    if (!slug && !preview) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
    }

    let imageData
    
    if (preview) {
      // Generate preview image
      imageData = {
        title: 'Sample Blog Post Title for Social Media',
        category: 'Aviation Training',
        author: 'Aviators Training Centre',
        template: (template as keyof typeof SOCIAL_IMAGE_TEMPLATES) || 'default',
      }
    } else {
      // Fetch blog post data
      const post = await sanityClient.fetch(`
        *[_type == "post" && slug.current == $slug][0] {
          title,
          seoTitle,
          category->{title},
          author->{name},
          openGraphImage
        }
      `, { slug })

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      // Check if custom Open Graph image exists
      if (post.openGraphImage && !template) {
        return NextResponse.redirect(new URL(`/api/image/${post.openGraphImage.asset._ref}`, request.url))
      }

      imageData = {
        title: post.seoTitle || post.title,
        category: post.category?.title,
        author: post.author?.name,
        template: (template as keyof typeof SOCIAL_IMAGE_TEMPLATES) || getOptimalTemplate({
          title: post.seoTitle || post.title,
          category: post.category?.title,
          author: post.author?.name,
        }),
      }
    }

    // Generate the image
    const imageBuffer = await generateSocialImage(imageData)

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating social image:', error)
    return NextResponse.json(
      { error: 'Failed to generate social image' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, author, template, customBackground } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const imageData = {
      title,
      category,
      author,
      template: template || 'default',
      customBackground,
    }

    const imageBuffer = await generateSocialImage(imageData)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
        'Content-Length': imageBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating custom social image:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom social image' },
      { status: 500 }
    )
  }
}
