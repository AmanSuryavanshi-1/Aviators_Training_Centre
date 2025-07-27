import { BlogPostPreview } from '@/lib/types/blog';
import { BlogCard } from './BlogCard';

interface RelatedPostsProps {
  posts: BlogPostPreview[];
  currentPostId: string;
  className?: string;
}

export default function RelatedPosts({ posts, currentPostId, className = '' }: RelatedPostsProps) {
  // Filter out current post and limit to 3 posts
  const relatedPosts = posts
    .filter(post => post._id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Related Articles
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((post) => (
            <BlogCard 
              key={post._id} 
              post={post}
              variant="compact"
              showExcerpt={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}