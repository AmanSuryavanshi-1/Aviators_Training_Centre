import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import SafePortableText from '@/components/features/blog/SafePortableText';
import SimpleContentRenderer from '@/components/features/blog/SimpleContentRenderer';
import ContentErrorBoundary from '@/components/features/blog/ContentErrorBoundary';
import HtmlContentRenderer from '@/components/features/blog/HtmlContentRenderer';
import BlogAnalyticsWrapper from '@/components/features/blog/BlogAnalyticsWrapper';
import BlogSEOEnhancer from '@/components/features/blog/BlogSEOEnhancer';
import ShareButton from '@/components/features/blog/ShareButton';
import DynamicCTA from '@/components/features/blog/DynamicCTA';
import '@/styles/blog-content.css';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanitySimpleService.getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - Aviators Training Centre',
      description: 'The requested blog post could not be found.',
    };
  }

  // Enhanced SEO metadata
  const seoTitle = post.seoTitle || `${post.title} - Aviators Training Centre`;
  const seoDescription = post.seoDescription || post.excerpt || `Read ${post.title} on the Aviators Training Centre blog - Your premier aviation training institute in India.`;
  const keywords = [
    'aviation training',
    'pilot training',
    'flight school',
    'aviators training centre',
    post.focusKeyword,
    ...(post.additionalKeywords || [])
  ].filter(Boolean).join(', ');

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    authors: [{ name: post.author?.name || 'Aviators Training Centre' }],
    category: post.category?.title || 'Aviation Training',
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author?.name || 'Aviators Training Centre'],
      tags: post.tags?.map(tag => tag.title) || [],
      images: post.image ? [
        {
          url: sanitySimpleService.getImageUrl(post.image, { width: 1200, height: 630 }) || '',
          width: 1200,
          height: 630,
          alt: post.image.alt || post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: post.image ? [sanitySimpleService.getImageUrl(post.image, { width: 1200, height: 630 }) || ''] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await sanitySimpleService.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || post.seoDescription,
    "image": post.image ? sanitySimpleService.getImageUrl(post.image, { width: 1200, height: 630 }) : null,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Aviators Training Centre",
      "description": post.author?.bio
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`
    },
    "keywords": [post.focusKeyword, ...(post.additionalKeywords || [])].filter(Boolean).join(', '),
    "articleSection": post.category?.title || "Aviation Training",
    "wordCount": post.performanceMetrics?.wordCount,
    "timeRequired": `PT${post.readingTime || 5}M`,
    "about": {
      "@type": "Thing",
      "name": "Aviation Training"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogSEOEnhancer post={post} />
      <BlogAnalyticsWrapper 
        postSlug={post.slug?.current || slug}
        postTitle={post.title}
        category={post.category?.title}
      >
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-aviation-primary to-aviation-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-aviation-light mb-6">
                <a href="/blog" className="hover:text-white transition-colors">Blog</a>
                <span>→</span>
                <span className="bg-aviation-accent/20 px-2 py-1 rounded">
                  {post.category?.title || 'General'}
                </span>
              </div>
              
              <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-aviation-light mb-8 leading-relaxed max-w-3xl">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-aviation-light">
                {post.author && (
                  <div className="flex items-center gap-3">
                    {post.author.image && (
                      <img
                        src={sanitySimpleService.getImageUrl(post.author.image, { width: 40, height: 40 }) || ''}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full border-2 border-aviation-light/30"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">By {post.author.name}</div>
                      {post.author.bio && (
                        <div className="text-xs text-aviation-light">Aviation Expert</div>
                      )}
                    </div>
                  </div>
                )}
                
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{post.readingTime || 5} min read</span>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-aviation-accent/20 px-2 py-1 rounded text-xs">
                        {tag.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">

            {/* Featured Image */}
            {post.image && (
              <div className="mb-12 -mt-8 relative">
                <img
                  src={sanitySimpleService.getImageUrl(post.image, { width: 1200, height: 600 }) || ''}
                  alt={post.image.alt || post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl shadow-2xl border border-aviation-accent/20"
                />
                {post.image.alt && (
                  <p className="text-sm text-muted-foreground text-center mt-3 italic">
                    {post.image.alt}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            {(() => {
              // Determine which content field to use
              const contentField = post.content || post.body;
              
              if (post.htmlContent) {
                // Use raw HTML content if available
                return (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                  />
                );
              }
              
              if (contentField && Array.isArray(contentField) && contentField.length > 0) {
                // Use SafePortableText with error boundary fallback
                return (
                  <ContentErrorBoundary
                    fallback={
                      <SimpleContentRenderer 
                        value={contentField} 
                        className="prose prose-lg max-w-none"
                      />
                    }
                  >
                    <SafePortableText 
                      value={contentField} 
                      className="prose prose-lg max-w-none"
                    />
                  </ContentErrorBoundary>
                );
              }
              
              // Fallback when no content is available
              return (
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground">No content available.</p>
                </div>
              );
            })()}

            {/* Dynamic CTA Section */}
            <DynamicCTA post={post} />

            {/* Author Bio */}
            {post.author && post.author.bio && (
              <div className="mt-12 p-8 bg-aviation-light/5 rounded-xl border border-aviation-accent/20">
                <div className="flex items-start gap-6">
                  {post.author.image && (
                    <img
                      src={sanitySimpleService.getImageUrl(post.author.image, { width: 80, height: 80 }) || ''}
                      alt={post.author.name}
                      className="w-20 h-20 rounded-full border-3 border-aviation-accent/30"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-xl mb-3 text-aviation-primary">
                      About {post.author.name}
                    </h3>
                    <p className="text-aviation-text leading-relaxed mb-4">{post.author.bio}</p>
                    <div className="flex items-center gap-4 text-sm text-aviation-secondary">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Aviation Expert
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                        </svg>
                        Certified Instructor
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Articles CTA */}
            <div className="mt-12 p-6 bg-aviation-primary/5 rounded-xl border-l-4 border-aviation-primary">
              <h4 className="font-heading font-bold text-lg text-aviation-primary mb-3">
                Want to Learn More About Aviation?
              </h4>
              <p className="text-aviation-text mb-4">
                Explore our comprehensive blog with expert insights, career guidance, and industry updates.
              </p>
              <a
                href="/blog"
                className="inline-flex items-center gap-2 text-aviation-primary hover:text-aviation-secondary font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Read More Articles
              </a>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t-2 border-aviation-accent/20">
              <div className="flex justify-between items-center">
                <a
                  href="/blog"
                  className="flex items-center gap-2 text-aviation-primary hover:text-aviation-secondary font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Blog
                </a>
                <div className="flex gap-3">
                  <ShareButton title={post.title} />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </BlogAnalyticsWrapper>
    </>
  );
}