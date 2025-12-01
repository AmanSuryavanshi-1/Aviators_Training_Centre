"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Calendar, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import { easingFunctions } from '@/lib/animations/easing';
import { PerformanceImageProvider } from '@/lib/image-optimization';
import { getImageUrl } from '@/lib/blog/utils';

// Type definition for compatibility
interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  featured: boolean;
  image?: {
    asset: { _id: string; url: string };
    alt?: string;
  };
  category: {
    title: string;
    slug: { current: string };
    color?: string;
  };
  author?: {
    name: string;
    slug: { current: string };
    image?: {
      asset: { _id: string; url: string };
    };
  };
}

interface BlogCardProps {
  post: BlogPost;
  viewMode?: 'grid' | 'list';
  variant?: 'default' | 'compact';
  featured?: boolean;
  priority?: boolean;
  showExcerpt?: boolean;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easingFunctions.easeOut },
  },
};

// Local blog images from public folder for fallback
const LOCAL_BLOG_IMAGES = [
  '/Blogs/Blog2.webp',
  '/Blogs/Blog3.webp',
  '/Blogs/Blog4.webp',
  '/Blogs/Blog5.webp',
  '/Blogs/Blog6.webp',
  '/Blogs/Blog7.webp',
  '/Blogs/Blog8.webp',
  '/Blogs/Blog_Preperation.webp',
  '/Blogs/Blog_money.webp',
  '/Blogs/Blog_money2.webp',
];

// Get a consistent fallback image based on post title
const getLocalFallbackImage = (title: string): string => {
  // Use title length to pick a consistent image for each post
  const index = title.length % LOCAL_BLOG_IMAGES.length;
  return LOCAL_BLOG_IMAGES[index];
};

// Production-ready image component using Next.js Image
const ProductionBlogImage: React.FC<{
  src?: string | null;
  alt: string;
  className?: string;
  title: string;
}> = ({ src, alt, className, title }) => {
  const [imgError, setImgError] = useState(false);

  // Use local fallback image from public/Blogs folder
  const fallbackSrc = getLocalFallbackImage(title);

  // Check if src is valid (not null, undefined, or contains 'undefined')
  const isValidSrc = src && !src.includes('undefined') && (src.startsWith('http') || src.startsWith('/'));
  const imageSrc = (isValidSrc && !imgError) ? src : fallbackSrc;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setImgError(true)}
    />
  );
};

// Format date utility
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
};

// Inner component for performance optimization
const BlogCardInner: React.FC<BlogCardProps> = ({
  post,
  viewMode = 'grid',
  variant = 'default',
  featured = false,
  priority = false,
  showExcerpt = true,
  className
}) => {
  const isListView = viewMode === 'list';
  const isCompact = variant === 'compact';

  // Safe post data with fallbacks
  const safePost = React.useMemo(() => {
    try {
      return {
        _id: post._id || `fallback-${Date.now()}`,
        title: post.title || 'Aviation Article',
        slug: post.slug || { current: 'aviation-article' },
        excerpt: post.excerpt || 'Discover expert aviation insights and training guidance.',
        readingTime: post.readingTime || 8,
        publishedAt: post.publishedAt || new Date().toISOString(),
        category: post.category || {
          title: 'Aviation',
          slug: { current: 'aviation' },
          color: '#075E68'
        },
        author: post.author || {
          name: 'Aviation Expert',
          slug: { current: 'aviation-expert' }
        },
        tags: post.tags || [],
        image: post.image || null,
        featured: post.featured || false,
        featuredOnHome: post.featuredOnHome || false,
      };
    } catch (error) {
      console.error('Error processing blog post data:', error);
      return {
        _id: `fallback-${Date.now()}`,
        title: 'Aviation Article',
        slug: { current: 'aviation-article' },
        excerpt: 'Discover expert aviation insights and training guidance.',
        readingTime: 8,
        publishedAt: new Date().toISOString(),
        category: {
          title: 'Aviation',
          slug: { current: 'aviation' },
          color: '#075E68'
        },
        author: {
          name: 'Aviation Expert',
          slug: { current: 'aviation-expert' }
        },
        tags: [],
        image: null,
        featured: false,
        featuredOnHome: false,
      };
    }
  }, [post]);

  // Early return if we still don't have valid data
  if (!safePost || !safePost._id || !safePost.slug?.current) {
    return null;
  }

  // Get image source safely using blog utils (same as carousel)
  const getImageSrc = () => {
    try {
      return getImageUrl(safePost.image, 400, 300);
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "group overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 h-full",
        "hover:border-primary/20 hover:shadow-primary/5",
        isListView && "flex flex-col md:flex-row",
        featured && "ring-2 ring-primary/20"
      )}>
        {/* Image Section */}
        <div className={cn(
          "relative overflow-hidden bg-muted",
          isListView
            ? "w-full sm:w-72 md:w-80 md:flex-shrink-0 aspect-[16/10] sm:aspect-[4/3]"
            : "aspect-[16/10]",
          !isListView && (featured ? "aspect-[16/10]" : "aspect-[16/10]")
        )}>
          <Link href={`/blog/${safePost.slug.current}`} className="block relative w-full h-full">
            <ProductionBlogImage
              src={getImageSrc()}
              alt={safePost.image?.alt || safePost.title}
              title={safePost.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Featured badge */}
            {featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground font-medium">
                  Featured
                </Badge>
              </div>
            )}

            {/* Difficulty badge */}
            {safePost.difficulty && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-background/90 text-foreground backdrop-blur-sm"
                >
                  {safePost.difficulty}
                </Badge>
              </div>
            )}
          </Link>
        </div>

        {/* Content Section */}
        <div className={cn(
          "flex flex-col",
          isListView ? "flex-1 min-w-0" : "h-full"
        )}>
          <CardHeader className="pb-3">
            {/* Category Badge - Clean Single Row */}
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs font-medium border-current px-2 py-1 flex-shrink-0 bg-background/60 dark:bg-white/10 text-foreground whitespace-normal break-words"
                style={{
                  borderColor: safePost.category.color || 'hsl(var(--border))',
                  backgroundColor: safePost.category.color ? `${safePost.category.color}20` : undefined
                }}
              >
                {safePost.category.title}
              </Badge>

              <div className="flex items-center text-xs text-muted-foreground gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{safePost.readingTime}m</span>
                </div>
              </div>
            </div>

            {/* Meta Information - Separate Row */}
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <time dateTime={safePost.publishedAt}>
                  {formatDate(safePost.publishedAt)}
                </time>
              </div>
            </div>

            {/* Title */}
            <Link href={`/blog/${safePost.slug.current}`}>
              <h3 className={cn(
                "font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200",
                isListView
                  ? "text-xl md:text-2xl"
                  : featured
                    ? "text-xl md:text-2xl"
                    : "text-lg md:text-xl"
              )}>
                {safePost.title}
              </h3>
            </Link>

            {/* Excerpt */}
            {showExcerpt && (
              <p className={cn(
                "text-muted-foreground leading-relaxed mt-2",
                isListView ? "line-clamp-3 text-base" : "line-clamp-2 text-sm",
                isCompact && "line-clamp-2 text-sm"
              )}>
                {safePost.excerpt}
              </p>
            )}
          </CardHeader>

          <CardContent className="pt-0 mt-auto">
            {/* Tags - Clean Single Row with Proper Spacing */}
            {safePost.tags && safePost.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {safePost.tags.slice(0, 2).map((tag, index) => (
                    <Badge
                      key={`${tag.slug?.current || tag.title}-${index}`}
                      variant="secondary"
                      className="text-[11px] px-2 py-0.5 bg-muted/60 text-foreground hover:bg-muted transition-colors flex-shrink-0 border border-border/50 dark:bg-teal-400/10 dark:text-teal-100 dark:border-teal-400/20 whitespace-normal break-words"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color || undefined
                      }}
                      title={tag.title}
                    >
                      {tag.title}
                    </Badge>
                  ))}
                  {safePost.tags.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] px-2 py-0.5 bg-muted/60 text-foreground flex-shrink-0 border border-border/50 dark:bg-teal-400/10 dark:text-teal-100 dark:border-teal-400/20"
                    >
                      +{safePost.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Author and CTA */}
            <div className="flex items-center justify-between">
              {/* Author */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative w-8 h-8 overflow-hidden rounded-full bg-primary/10 flex-shrink-0">
                  <div className="flex items-center justify-center w-full h-full">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {safePost.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Aviation Expert
                  </p>
                </div>
              </div>

              {/* Read More Button */}
              <div className="ml-2">
                <TransparentButton
                  href={`/blog/${safePost.slug.current}`}
                  icon={ArrowRight}
                  label="Read Article"
                  className="h-9 px-3 py-2 text-sm rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.article>
  );
};

// Main component with performance provider wrapper
const BlogCard: React.FC<BlogCardProps> = (props) => {
  return (
    <PerformanceImageProvider>
      <BlogCardInner {...props} />
    </PerformanceImageProvider>
  );
};

export default BlogCard;
export { BlogCard };
