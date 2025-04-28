// app/blog/page.tsx
import Link from 'next/link';
import Image from 'next/image'; // Import Next Image
import { getAllPosts } from '@/lib/blog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from '@/lib/utils';

const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const FALLBACK_BLOG_IMAGE = "/public/placeholder.svg"; // Define a fallback image

export const metadata = {
  title: 'Aviators Training Centre Blog',
  description: 'Articles, news, and insights on pilot training, DGCA exams, and aviation careers from Aviators Training Centre.',
};

export default async function BlogIndexPage() {
  // Fetch posts and handle potential errors during fetch
  let posts = [];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    // Optionally display an error message to the user
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_BLOG_IMAGE) {
      target.onerror = null; // Prevent infinite loop
      target.src = FALLBACK_BLOG_IMAGE;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Sticky Enroll Button - Adjusted top position to account for header height */}
      <div className="sticky top-[64px] z-40 py-2 bg-background/90 backdrop-blur-md border-b border-border/40 mb-8 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 flex justify-end">
            <Link href="/courses">
              <Button 
                size="sm" 
                className={cn(
                    'bg-gradient-to-r from-[#075E68] to-[#219099] text-white rounded-full px-4 py-2 text-xs sm:text-sm',
                    'hover:from-[#219099] hover:to-[#075E68] transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                    'border-0'
                )}
              >
                Enroll Now
              </Button>
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-12 md:mb-16">
            <h1 className={cn("text-3xl md:text-4xl lg:text-5xl font-bold mb-3", aviationPrimary)}>ATC Blog</h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Insights, tips, and news for aspiring and current pilots.
            </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-foreground/70 text-lg mt-10">No blog posts found yet. Please check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {posts.map((post) => (
              <Card key={post.slug} className="bg-card flex flex-col overflow-hidden rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
                {post.image && (
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden h-48 relative group">
                    {/* Using standard img tag for now. 
                        Replace with next/image if width/height are known or image is imported.
                        Example: <Image src={post.image} alt={post.title} width={400} height={200} className="..." /> 
                    */}
                    <img
                      src={post.image.startsWith('/public') ? post.image.replace('/public', '') : post.image} // Adjust path if needed
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={handleImageError} // Add error handling
                    />
                  </Link>
                )}
                <CardHeader className="p-5">
                  <Link href={`/blog/${post.slug}`} className="block">
                     <CardTitle className="text-xl font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{post.title}</CardTitle>
                  </Link>
                   <CardDescription className="text-xs text-foreground/60 pt-1">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-grow">
                  <CardDescription className="text-sm text-foreground/80 line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-5 pt-2 flex flex-col items-start gap-4 mt-auto">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50">{tag}</Badge>
                        ))}
                        </div>
                    )}
                    <TransparentButton
                        href={`/blog/${post.slug}`}
                        icon={ArrowRight}
                        label="Read More"
                        className="w-full mt-2" // Ensure button is below tags
                        size="sm"
                    />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      {/* Footer is rendered by layout.tsx */}
    </div>
  );
}
