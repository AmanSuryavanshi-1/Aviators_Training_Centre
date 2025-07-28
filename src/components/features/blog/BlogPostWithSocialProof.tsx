'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  SocialProofIntegration, 
  BlogSocialProofHeader, 
  BlogSocialProofSidebar, 
  BlogSocialProofFooter 
} from './SocialProofIntegration';
import { cn } from '@/lib/utils';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: any;
  category?: {
    title: string;
    slug: string;
  };
  tags?: string[];
  publishedAt: string;
  author?: {
    name: string;
    image?: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  excerpt?: string;
  estimatedReadingTime?: number;
}

interface BlogPostWithSocialProofProps {
  post: BlogPost;
  children: React.ReactNode;
  showSocialProof?: {
    header?: boolean;
    sidebar?: boolean;
    footer?: boolean;
    inline?: boolean;
  };
  socialProofConfig?: {
    courseId?: string;
    variant?: 'compact' | 'detailed' | 'featured';
    maxItems?: {
      testimonials?: number;
      successStories?: number;
      certifications?: number;
      achievements?: number;
    };
  };
  className?: string;
}

// Helper function to extract course ID from blog post content or category
function extractCourseId(post: BlogPost): string | undefined {
  // Check category first
  if (post.category?.slug) {
    const categorySlug = post.category.slug;
    if (categorySlug.includes('cpl')) return 'dgca-cpl';
    if (categorySlug.includes('atpl')) return 'atpl';
    if (categorySlug.includes('type-rating')) return 'type-rating';
    if (categorySlug.includes('rtr')) return 'rtr';
    if (categorySlug.includes('interview')) return 'interview-prep';
  }

  // Check tags
  if (post.tags) {
    for (const tag of post.tags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('cpl')) return 'dgca-cpl';
      if (tagLower.includes('atpl')) return 'atpl';
      if (tagLower.includes('type rating') || tagLower.includes('a320') || tagLower.includes('b737')) return 'type-rating';
      if (tagLower.includes('rtr')) return 'rtr';
      if (tagLower.includes('interview')) return 'interview-prep';
    }
  }

  // Check title and content
  const titleLower = post.title.toLowerCase();
  if (titleLower.includes('cpl')) return 'dgca-cpl';
  if (titleLower.includes('atpl')) return 'atpl';
  if (titleLower.includes('type rating') || titleLower.includes('a320') || titleLower.includes('b737')) return 'type-rating';
  if (titleLower.includes('rtr')) return 'rtr';
  if (titleLower.includes('interview')) return 'interview-prep';

  return undefined;
}

// Helper function to determine optimal social proof placement based on content length
function getOptimalSocialProofPlacement(post: BlogPost, estimatedWordCount?: number) {
  const wordCount = estimatedWordCount || (post.excerpt?.split(' ').length || 0) * 10; // Rough estimate
  
  if (wordCount < 1000) {
    return {
      header: false,
      sidebar: true,
      footer: true,
      inline: false,
    };
  } else if (wordCount < 2000) {
    return {
      header: true,
      sidebar: true,
      footer: true,
      inline: false,
    };
  } else {
    return {
      header: true,
      sidebar: true,
      footer: true,
      inline: true,
    };
  }
}

export function BlogPostWithSocialProof({
  post,
  children,
  showSocialProof,
  socialProofConfig,
  className
}: BlogPostWithSocialProofProps) {
  const courseId = socialProofConfig?.courseId || extractCourseId(post);
  const optimalPlacement = showSocialProof || getOptimalSocialProofPlacement(post);

  return (
    <div className={cn('max-w-7xl mx-auto', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Header Social Proof */}
          {optimalPlacement.header && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BlogSocialProofHeader 
                courseId={courseId}
                blogPostSlug={post.slug}
                className="mb-8"
              />
            </motion.div>
          )}

          {/* Blog Post Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {children}
          </motion.article>

          {/* Inline Social Proof (for longer posts) */}
          {optimalPlacement.inline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="my-12 not-prose"
            >
              <SocialProofIntegration
                courseId={courseId}
                blogPostSlug={post.slug}
                position="middle"
                variant={socialProofConfig?.variant || 'detailed'}
                showElements={{
                  testimonials: true,
                  successStories: true,
                  certifications: false,
                  achievements: true,
                  alumni: false,
                }}
                maxItems={socialProofConfig?.maxItems || {
                  testimonials: 2,
                  successStories: 1,
                  achievements: 4,
                }}
              />
            </motion.div>
          )}

          {/* Footer Social Proof */}
          {optimalPlacement.footer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 not-prose"
            >
              <BlogSocialProofFooter 
                courseId={courseId}
                blogPostSlug={post.slug}
              />
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Sidebar Social Proof */}
            {optimalPlacement.sidebar && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <BlogSocialProofSidebar 
                  courseId={courseId}
                  blogPostSlug={post.slug}
                />
              </motion.div>
            )}

            {/* Additional Sidebar Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Courses
              </h3>
              <div className="space-y-3">
                {courseId === 'dgca-cpl' && (
                  <>
                    <a href="/courses/dgca-cpl" className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="font-medium text-blue-700 dark:text-blue-300">DGCA CPL Ground School</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Complete preparation program</div>
                    </a>
                    <a href="/courses/atpl" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="font-medium text-gray-700 dark:text-gray-300">ATPL Ground School</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Advanced pilot training</div>
                    </a>
                  </>
                )}
                {courseId === 'atpl' && (
                  <>
                    <a href="/courses/atpl" className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="font-medium text-green-700 dark:text-green-300">ATPL Ground School</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Airline Transport Pilot License</div>
                    </a>
                    <a href="/courses/type-rating" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="font-medium text-gray-700 dark:text-gray-300">Type Rating Courses</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">A320, B737 preparation</div>
                    </a>
                  </>
                )}
                {courseId === 'type-rating' && (
                  <>
                    <a href="/courses/type-rating-a320" className="block p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <div className="font-medium text-purple-700 dark:text-purple-300">A320 Type Rating</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Airbus A320 certification</div>
                    </a>
                    <a href="/courses/type-rating-b737" className="block p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      <div className="font-medium text-orange-700 dark:text-orange-300">B737 Type Rating</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">Boeing 737 certification</div>
                    </a>
                  </>
                )}
                {!courseId && (
                  <>
                    <a href="/courses" className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="font-medium text-blue-700 dark:text-blue-300">All Courses</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Explore our training programs</div>
                    </a>
                    <a href="/contact" className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="font-medium text-green-700 dark:text-green-300">Free Consultation</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Get personalized guidance</div>
                    </a>
                  </>
                )}
              </div>
            </motion.div>

            {/* Quick Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get personalized guidance from our aviation experts
              </p>
              <div className="space-y-3">
                <a 
                  href="tel:+919876543210" 
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  📞 +91 98765 43210
                </a>
                <a 
                  href="mailto:info@aviatorstrainingcentre.com" 
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  ✉️ info@aviatorstrainingcentre.com
                </a>
                <a 
                  href="https://wa.me/919876543210" 
                  className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  💬 WhatsApp Chat
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized wrapper for different blog post types
export function CPLBlogPost({ post, children, className }: {
  post: BlogPost;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BlogPostWithSocialProof
      post={post}
      showSocialProof={{
        header: true,
        sidebar: true,
        footer: true,
        inline: true,
      }}
      socialProofConfig={{
        courseId: 'dgca-cpl',
        variant: 'detailed',
        maxItems: {
          testimonials: 3,
          successStories: 2,
          certifications: 5,
          achievements: 6,
        },
      }}
      className={className}
    >
      {children}
    </BlogPostWithSocialProof>
  );
}

export function ATPLBlogPost({ post, children, className }: {
  post: BlogPost;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BlogPostWithSocialProof
      post={post}
      showSocialProof={{
        header: true,
        sidebar: true,
        footer: true,
        inline: true,
      }}
      socialProofConfig={{
        courseId: 'atpl',
        variant: 'detailed',
        maxItems: {
          testimonials: 3,
          successStories: 2,
          certifications: 5,
          achievements: 6,
        },
      }}
      className={className}
    >
      {children}
    </BlogPostWithSocialProof>
  );
}

export function TypeRatingBlogPost({ post, children, className }: {
  post: BlogPost;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BlogPostWithSocialProof
      post={post}
      showSocialProof={{
        header: true,
        sidebar: true,
        footer: true,
        inline: false,
      }}
      socialProofConfig={{
        courseId: 'type-rating',
        variant: 'featured',
        maxItems: {
          testimonials: 2,
          successStories: 1,
          certifications: 3,
          achievements: 4,
        },
      }}
      className={className}
    >
      {children}
    </BlogPostWithSocialProof>
  );
}