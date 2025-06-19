import { sanityClient } from '@/lib/sanity.client'; // urlFor might not be needed here directly anymore
// Removed Link and Image from next imports if not used directly here
import BlogPostCard from '@/components/blog/BlogPostCard'; // Import the new card

// Define basic types for the data we expect
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any; // Adjust if you have a more specific type for images
  excerpt?: string;
  publishedAt: string;
  author?: { name: string };
}

async function getPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    excerpt,
    publishedAt,
    author->{name}
  }`;
  const posts = await sanityClient.fetch(query);
  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl">No blog posts found at the moment. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-12 text-center text-foreground">Our Blog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post) => (
          <BlogPostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

// Optional: Add metadata for SEO
export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in'; // Fallback if not set
  return {
    title: 'Blog | Aviators Training Centre',
    description: 'Read the latest articles, news, and insights from Aviators Training Centre. Your journey to the cockpit starts here.',
    openGraph: {
      title: 'Blog | Aviators Training Centre',
      description: 'Read the latest articles, news, and insights from Aviators Training Centre.',
      url: `${siteUrl}/blog`,
      type: 'website',
      // Add a default OG image for the blog listing page if available
      // images: [
      //   {
      //     url: `${siteUrl}/path/to/default-blog-og-image.jpg`,
      //     width: 1200,
      //     height: 630,
      //     alt: 'Aviators Training Centre Blog',
      //   },
      // ],
    },
  };
}
