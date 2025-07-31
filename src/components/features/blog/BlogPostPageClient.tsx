'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { PortableText } from '@portabletext/react';
import { 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  BookOpen, 
  ChevronRight,
  Heart,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { BlogPost, sanityService } from '@/lib/sanity/service';
import { useRealTimeSync } from '@/hooks/use-real-time-sync';
import { usePageViewTracking, useCTATracking } from '@/hooks/use-conversion-tracking';
import { trackPageview, trackCTAClick } from '@/lib/analytics/client';
import BlogContentRenderer from './BlogContentRenderer';
import ReadingProgressBar from './ReadingProgressBar';
import TableOfContents from './TableOfContents';
import FloatingTOC from './FloatingTOC';

interface BlogPostPageClientProps {
  slug: string;
}

export default function BlogPostPageClient({ slug }: BlogPostPageClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time sync for updates
  const { isConnected, isPending } = useRealTimeSync();
  
  // Conversion tracking (legacy)
  usePageViewTracking('blog', slug);
  const { createCTAClickHandler } = useCTATracking(slug);

  // New analytics tracking
  useEffect(() => {
    if (slug && post) {
      // Track pageview with new analytics system
      trackPageview(slug, {
        referrer: document.referrer,
        immediate: false
      });
    }
  }, [slug, post]);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading blog post from Sanity service:', slug);
        
        // Fetch the specific blog post from Sanity
        const blogPost = await sanityService.getPostBySlug(slug, { cache: 'default', revalidate: 300 });
        
        if (!blogPost) {
          console.log('❌ Blog post not found:', slug);
          notFound();
          return;
        }
        
        setPost(blogPost);
        
        // Fetch related posts from the same category and tags
        try {
          const categoryId = blogPost.category._id || '';
          const tagIds = (blogPost.tags || []).map(tag => tag._id || '').filter(Boolean);
          
          const related = await sanityService.getRelatedPosts(
            blogPost._id, 
            categoryId, 
            tagIds, 
            3
          );
            
          setRelatedPosts(related);
        } catch (relatedError) {
          console.warn('Failed to fetch related posts:', relatedError);
          // Continue without related posts
        }
        
        console.log('✅ Blog post loaded successfully:', blogPost.title);
        
      } catch (error) {
        console.error('❌ Error fetching blog post:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog post from Sanity CMS');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  // Handle real-time sync events
  useEffect(() => {
    if (!slug) return;
    
    const { realTimeSyncManager } = require('@/lib/sync/real-time-sync');
    
    const unsubscribe = realTimeSyncManager.onSyncEvent((event: any) => {
      // Reload if this specific post was updated
      if (event.slug === slug || event.postId === post?._id) {
        console.log('🔄 Post updated via sync, reloading:', event);
        // Re-fetch the post
        fetchBlogPost();
      }
    });

    return unsubscribe;
  }, [slug, post?._id]);

  const handleShare = (platform: string) => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || '')}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      return;
    }

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  // New CTA click handler using new analytics system
  const handleNewCTAClick = (ctaType: string, ctaText: string, targetUrl?: string) => {
    return async (event: React.MouseEvent) => {
      if (slug) {
        await trackCTAClick(slug, ctaType, {
          ctaText,
          targetUrl,
          immediate: true
        });
      }
      // Also call legacy handler for backward compatibility
      createCTAClickHandler(ctaType, ctaText, 'blog-post')(event);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-aviation-primary" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Article</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Link href="/blog">
              <Button variant="outline" className="w-full">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      <ReadingProgressBar />
      {/* Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-aviation-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/blog" className="hover:text-aviation-primary transition-colors">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-800 font-medium">Article</span>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center gap-2">
              {isPending && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </div>
              )}
              {!isConnected && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3" />
                  Offline
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-aviation-primary/95 via-aviation-secondary/90 to-aviation-tertiary/85" />
        <div className="absolute inset-0">
          <img 
            src={post.image ? sanityService.getImageUrl(post.image, { width: 1920, height: 1080, fit: 'crop' }) : '/Blogs/Blog_Header.webp'} 
            alt={post.image?.alt || post.title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <Link href="/blog">
              <Button variant="outline" className="mb-6 bg-white/10 border-white/30 text-white hover:bg-white hover:text-aviation-primary backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {post.category?.title || 'General'}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <img 
                  src={post.author?.image ? sanityService.getImageUrl(post.author.image, { width: 32, height: 32, fit: 'crop' }) : '/Instructor/AK.png'} 
                  alt={post.author?.name || 'Author'}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
                <span>{post.author?.name || 'Aviation Expert'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime || 5} min read
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {post.wordCount || 0} words
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Main Content - 70vw equivalent */}
            <motion.div 
              className="flex-1 lg:flex-shrink lg:w-0 lg:max-w-[900px] overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl w-full">
                <CardContent className="p-6 sm:p-8 lg:p-12 xl:p-16">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mb-12">
                    {(post.tags || []).map((tag, index) => (
                      <Badge 
                        key={tag.slug?.current || index} 
                        variant="secondary" 
                        className="bg-aviation-primary/10 text-aviation-primary hover:bg-aviation-primary/20 transition-colors px-3 py-1 text-sm font-medium"
                        style={{ 
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          color: tag.color || undefined
                        }}
                      >
                        {tag.title}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Article Content */}
                  <div className="w-full overflow-hidden">
                    <BlogContentRenderer 
                      content={(post as any).content}
                      body={post.body}
                      title={post.title}
                    />
                  </div>
                
                <Separator className="my-12" />
                
                {/* Author Bio */}
                {post.author && (
                  <div className="bg-gradient-to-r from-aviation-primary/5 to-aviation-secondary/5 rounded-xl p-8">
                    <div className="flex items-start gap-4">
                      <img 
                        src={post.author.image ? sanityService.getImageUrl(post.author.image, { width: 64, height: 64, fit: 'crop' }) : '/Instructor/AK.png'} 
                        alt={post.author.name}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{post.author.name}</h3>
                        <p className="text-aviation-primary font-medium mb-2">Aviation Expert</p>
                        <p className="text-gray-600 leading-relaxed">
                          {post.author.bio || 'Aviation expert with extensive experience in pilot training and DGCA exam preparation.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

            {/* Sidebar - 30vw equivalent */}
            <motion.div 
              className="w-full lg:w-[300px] xl:w-[320px] lg:flex-shrink-0 space-y-3 lg:space-y-4"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Table of Contents - Desktop Only */}
              <div className="hidden lg:block">
                <TableOfContents content={(post as any).content} />
              </div>

              {/* Share Article */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl sticky top-24 w-full">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-aviation-primary" />
                    Share Article
                  </h3>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('twitter')}
                      className="hover:bg-blue-50 hover:border-blue-200 text-xs px-2 py-1.5 w-full min-w-0 overflow-hidden"
                    >
                      <Twitter className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Twitter</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('facebook')}
                      className="hover:bg-blue-50 hover:border-blue-200 text-xs px-2 py-1.5 w-full min-w-0 overflow-hidden"
                    >
                      <Facebook className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Facebook</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('linkedin')}
                      className="hover:bg-blue-50 hover:border-blue-200 text-xs px-2 py-1.5 w-full min-w-0 overflow-hidden"
                    >
                      <Linkedin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare('copy')}
                      className="hover:bg-gray-50 hover:border-gray-200 text-xs px-2 py-1.5 w-full min-w-0 overflow-hidden"
                    >
                      <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Copy</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-aviation-primary to-aviation-secondary text-white rounded-xl w-full">
                <CardContent className="p-5 text-center">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
                  <h3 className="text-base font-bold mb-2">Ready to Start Your Aviation Journey?</h3>
                  <p className="text-white/90 mb-4 text-xs leading-relaxed">
                    Get expert guidance and personalized training from experienced aviation professionals.
                  </p>
                  <div onClick={handleNewCTAClick('book-demo-sidebar', 'Book Demo', '/contact?subject=Book a Demo')} className="w-full">
                    <BookDemoButton />
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl w-full">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedPosts.length > 0 ? (
                      relatedPosts.map((relatedPost) => (
                        <Link key={relatedPost._id} href={`/blog/${relatedPost.slug.current}`}>
                          <div className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full overflow-hidden">
                            <img 
                              src={relatedPost.image ? sanityService.getImageUrl(relatedPost.image, { width: 56, height: 42, fit: 'crop' }) : '/Blogs/Blog_Header.webp'} 
                              alt={relatedPost.image?.alt || relatedPost.title}
                              className="w-14 h-10 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h4 className="font-medium text-gray-800 group-hover:text-aviation-primary transition-colors text-xs leading-tight mb-1 line-clamp-2 break-words">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden">
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">{relatedPost.category?.title || 'General'}</Badge>
                                <span className="flex-shrink-0">{relatedPost.readingTime || 5}m read</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <BookOpen className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">No related articles found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating TOC for Mobile */}
      <FloatingTOC content={(post as any).content} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-aviation-primary via-aviation-secondary to-aviation-tertiary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Join Thousands of Successful Pilots
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Get the expert training and guidance you need to achieve your aviation dreams. 
              Our proven methods have helped over 500+ students pass their DGCA exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div onClick={handleNewCTAClick('book-demo-cta', 'Book Demo', '/contact?subject=Book a Demo')}>
                <BookDemoButton />
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-aviation-primary backdrop-blur-sm"
                onClick={handleNewCTAClick('view-courses-cta', 'View All Courses', '/courses')}
              >
                <BookOpen className="mr-2 w-5 h-5" />
                View All Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
