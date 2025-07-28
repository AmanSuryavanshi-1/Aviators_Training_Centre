import { simpleBlogService } from '@/lib/blog/simple-blog-service';
import BlogPostPageClient from "@/components/features/blog/BlogPostPageClient";

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  try {
    const { id } = await params;
    const result = await simpleBlogService.getPostBySlug(id);
    
    if (!result.success || !result.data) {
      return {
        title: 'Blog Post Not Found | Aviators Training Centre',
        description: 'The requested blog post could not be found.',
      };
    }
    
    const post = result.data;
    
    // Use enhanced SEO optimizer
    const { blogSEOOptimizer } = await import('@/lib/seo/blog-seo-optimizer');
    const seoMetadata = blogSEOOptimizer.generatePostMetadata(post);
    
    return {
      title: seoMetadata.title,
      description: seoMetadata.description,
      keywords: seoMetadata.keywords.join(', '),
      canonical: seoMetadata.canonicalUrl,
      openGraph: seoMetadata.openGraph,
      twitter: seoMetadata.twitter,
      other: {
        'application/ld+json': JSON.stringify(seoMetadata.structuredData),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Aviation Blog | Aviators Training Centre',
      description: 'Expert aviation insights and pilot training guidance.',
    };
  }
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const posts = await simpleBlogService.getAllPosts();
    return posts.map((post) => ({
      id: post.slug.current,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  return <BlogPostPageClient slug={id} />;
}
