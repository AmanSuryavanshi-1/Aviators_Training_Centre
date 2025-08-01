import { Metadata } from 'next';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import BlogCard from '@/components/features/blog/BlogCard';
import FeaturedPostsCarousel from '@/components/features/blog/FeaturedPostsCarousel';

export const metadata: Metadata = {
  title: 'Aviation Blog - Aviators Training Centre',
  description: 'Latest insights, tips, and updates from the aviation industry. Expert advice for aspiring pilots and aviation professionals.',
};

export default async function BlogPage() {
  let posts = [];
  let error = null;

  try {
    console.log('Fetching blog posts...');
    posts = await sanitySimpleService.getAllPosts({ limit: 20 });
    console.log('Fetched posts:', posts?.length || 0);
    
    // Ensure posts is an array
    if (!Array.isArray(posts)) {
      posts = [];
    }
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    error = err instanceof Error ? err.message : 'Failed to load blog posts';
  }

  // Separate featured posts
  const featuredPosts = posts.filter(post => post.featured);
  // Show all posts in the main section (both featured and non-featured)
  const allPosts = posts;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Featured Posts Carousel */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-4">Featured Posts</h2>
            <FeaturedPostsCarousel posts={featuredPosts} />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Aviation Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest insights, tips, and industry news from aviation experts
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Posts</h3>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Please check your Sanity configuration and try again.
              </p>
            </div>
          </div>
        )}

        {/* No Posts State */}
        {!error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Posts Yet</h3>
              <p className="text-gray-600">
                Blog posts will appear here once they are published in Sanity Studio.
              </p>
              <a 
                href="http://localhost:3333" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-aviation-primary text-white rounded-lg hover:bg-aviation-primary/90 transition-colors"
              >
                Open Sanity Studio
              </a>
            </div>
          </div>
        )}

{/* Blog Posts Grid */}
        {!error && allPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post) => (
              <BlogCard
                key={post._id}
                post={{
                  _id: post._id,
                  title: post.title || 'Aviation Article',
                  excerpt: post.excerpt || 'Discover expert aviation insights and training guidance.',
                  slug: post.slug || { current: 'aviation-article' },
                  publishedAt: post.publishedAt || new Date().toISOString(),
                  readingTime: 5, // Default reading time
                  category: post.category || {
                    title: 'Aviation',
                    slug: { current: 'aviation' },
                    color: '#075E68'
                  },
                  author: post.author || {
                    name: 'ATC Instructor',
                    slug: { current: 'atc-instructor' }
                  },
                  image: post.image || null,
                  featured: post.featured || false,
                  tags: [],
                }}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {!error && posts.length >= 20 && (
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-aviation-primary text-white rounded-lg hover:bg-aviation-primary/90 transition-colors">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}