"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Calendar, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import { easingFunctions } from '@/lib/animations/easing';

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

// Production-ready image component with bulletproof fallback
const ProductionBlogImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  title: string;
}> = ({ src, alt, className, title }) => {
  // Generate a consistent fallback image based on title
  const generateFallbackImage = (title: string) => {
    const colors = ['#075E68', '#0C6E72', '#0A5A5E', '#0E7A80', '#4A90A4', '#6B73FF', '#10B981'];
    const colorIndex = title.length % colors.length;
    const bgColor = colors[colorIndex];
    
    // Create a simple but professional SVG with aviation theme
    const svg = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="300" fill="${bgColor}"/>
<g transform="translate(200, 150)">
<path d="M-30 -10 L30 -10 L40 0 L30 10 L-30 10 L-40 0 Z" fill="white" fill-opacity="0.3"/>
<circle cx="0" cy="0" r="3" fill="white" fill-opacity="0.8"/>
<path d="M-15 -5 L15 -5 M-15 5 L15 5" stroke="white" stroke-opacity="0.6" stroke-width="1"/>
</g>
<text x="200" y="220" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="600" opacity="0.9">Aviation Content</text>
</svg>`;
    
    try {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (error) {
      // Fallback to URL encoding if base64 fails
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  };

  const fallbackSrc = generateFallbackImage(title);
  const imageSrc = !src || src.includes('undefined') ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ 
          background: `linear-gradient(135deg, #075E68 0%, #0C6E72 100%)` 
        }}
      />
    </div>
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

const BlogCard: React.FC<BlogCardProps> = ({ 
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

  // Get image source safely using Sanity service
  const getImageSrc = () => {
    if (safePost.image && safePost.image.asset) {
      try {
        return sanitySimpleService.getImageUrl(safePost.image, {
          width: 400,
          height: 300,
          quality: 85,
          format: 'webp'
        });
      } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
      }
    }
    return null;
  };
  
  return (
    <motion.div
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
    </motion.div>
  );
};

export default BlogCard;
export { BlogCard };
