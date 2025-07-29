"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BlogCard from "@/components/features/blog/BlogCard";
import { type BlogPostPreview } from '@/lib/types/blog';
import { getFeaturedPosts } from '@/lib/blog/comprehensive-blog-data';

interface FeaturedBlogSectionProps {
  featuredPosts?: BlogPostPreview[];
}

export default function FeaturedBlogSection({ featuredPosts: propFeaturedPosts }: FeaturedBlogSectionProps) {
  // Use provided posts or fallback to comprehensive blog data
  const featuredPosts = propFeaturedPosts || getFeaturedPosts();
  
  if (!featuredPosts || featuredPosts.length === 0) {
    return null;
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
