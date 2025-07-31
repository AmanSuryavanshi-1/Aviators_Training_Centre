"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import BlogCard from "@/components/features/blog/BlogCard";
import { BlogPost, sanityService } from '@/lib/sanity/service';

interface FeaturedBlogSectionProps {
  featuredPosts?: BlogPost[];
}

export default function FeaturedBlogSection({ featuredPosts: propFeaturedPosts }: FeaturedBlogSectionProps) {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>(propFeaturedPosts || []);
  const [loading, setLoading] = useState(!propFeaturedPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propFeaturedPosts) {
      setFeaturedPosts(propFeaturedPosts);
      return;
    }

    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        const posts = await sanityService.getFeaturedPosts(3, { 
          cache: 'default', 
          revalidate: 600 // 10 minutes
        });
        setFeaturedPosts(posts);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
        setError('Failed to load featured posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, [propFeaturedPosts]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900/40">
        <div className="container px-4 mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredPosts || featuredPosts.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900/40">
        <div className="container px-4 mx-auto text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Featured Posts Coming Soon
          </h3>
          <p className="text-gray-500 mb-4">
            We're working on bringing you the latest aviation insights.
          </p>
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            Explore All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/40">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center justify-between mb-12 md:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-6 md:mb-0"
          >
            <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Aviation Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Expert guidance and industry updates for aspiring pilots
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              View All Posts <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {featuredPosts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
