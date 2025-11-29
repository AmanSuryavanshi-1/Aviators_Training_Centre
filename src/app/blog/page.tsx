import { Metadata } from 'next';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import BlogCard from '@/components/features/blog/BlogCard';
import FeaturedPostsCarousel from '@/components/features/blog/FeaturedPostsCarousel';

// Consistent heading color tokens used across the site
const aviationPrimary = 'text-teal-700 dark:text-teal-300';

export const revalidate = 60;


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
      <div className="container mx-auto px-4 py-4">
        {/* Featured Posts Carousel */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-4">
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md ${aviationPrimary}`}>
                Featured Posts
              </h2>
              <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 dark:from-teal-400 dark:to-sky-400" />
            </div>
            <FeaturedPostsCarousel posts={featuredPosts} />
          </div>
        )}

        {/* Header */}
        <div className="text-center mt-12 py-6 sm:py-8">
          <h1 className={`mb-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${aviationPrimary}`}>
            Aviation Blog
          </h1>
          <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 dark:from-teal-400 dark:to-sky-400" />
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest insights, tips, and industry news from aviation experts
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="rounded-lg p-6 max-w-md mx-auto border border-red-300/60 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/30">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Unable to Load Posts</h3>
              <p className="text-red-700 dark:text-red-300/90">{error}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Please check your Sanity configuration and try again.
              </p>
            </div>
          </div>
        )}

        {/* No Posts State */}
        {!error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="rounded-lg p-6 max-w-md mx-auto border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground">
                Blog posts will appear here once they are published in Sanity Studio.
              </p>
              <a
                href="http://localhost:3333"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors bg-aviation-primary text-white hover:bg-aviation-primary/90"
              >
                Open Sanity Studio
              </a>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!error && allPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-4 sm:py-6 md:py-8">
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
            <button className="px-6 py-3 rounded-full bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-colors shadow">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}