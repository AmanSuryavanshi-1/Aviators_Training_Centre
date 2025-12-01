'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, TrendingUp, Star, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readingTime?: number;
  featured?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface ContentCluster {
  title: string;
  description: string;
  posts: RelatedPost[];
  category: string;
}

interface ContentClusterLinksProps {
  currentPost: {
    title: string;
    slug: string;
    category: string;
    tags?: string[];
  };
  className?: string;
}

// Predefined content clusters for strategic internal linking
const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    title: 'DGCA CPL Complete Guide Series',
    description: 'Everything you need to know about obtaining your Commercial Pilot License',
    category: 'DGCA Exam Preparation',
    posts: [
      {
        title: 'DGCA CPL Complete Guide 2024: Commercial Pilot License in India',
        slug: 'dgca-cpl-complete-guide-2024',
        excerpt: 'Master the DGCA Commercial Pilot License process with our comprehensive 2024 guide.',
        category: 'DGCA Exam Preparation',
        readingTime: 12,
        featured: true,
        difficulty: 'beginner'
      },
      {
        title: '10 Critical DGCA Medical Examination Tips for Aspiring Pilots',
        slug: 'dgca-medical-examination-tips-aspiring-pilots',
        excerpt: 'Maximize your chances of passing the DGCA Class 1 medical examination.',
        category: 'Aviation Medical',
        readingTime: 11,
        featured: true,
        difficulty: 'intermediate'
      },
      {
        title: 'DGCA Exam Preparation: Study Plan & Success Strategies',
        slug: 'dgca-exam-preparation-study-plan-success-strategies',
        excerpt: 'Comprehensive study plan and proven strategies for DGCA exam success.',
        category: 'DGCA Exam Preparation',
        readingTime: 15,
        difficulty: 'intermediate'
      },
      {
        title: 'DGCA Ground School: Technical General vs Technical Specific',
        slug: 'dgca-ground-school-technical-general-vs-specific',
        excerpt: 'Understanding the differences between Technical General and Technical Specific subjects.',
        category: 'DGCA Exam Preparation',
        readingTime: 13,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    title: 'Aviation Career Planning Series',
    description: 'Plan your aviation career from student pilot to airline captain',
    category: 'Aviation Career',
    posts: [
      {
        title: 'Aviation Salary Guide India 2024: Pilot Earnings Breakdown',
        slug: 'pilot-salary-india-2024-career-earnings-guide',
        excerpt: 'Complete breakdown of pilot salaries in India across different career stages.',
        category: 'Aviation Career',
        readingTime: 10,
        featured: true,
        difficulty: 'beginner'
      },
      {
        title: 'Airline Industry Career Opportunities Beyond Pilot Jobs',
        slug: 'airline-industry-career-opportunities-beyond-pilot-jobs',
        excerpt: 'Explore diverse career opportunities in the aviation industry.',
        category: 'Aviation Career',
        readingTime: 9,
        difficulty: 'beginner'
      },
      {
        title: 'Airline Pilot Interview: 50+ Questions & Expert Answers',
        slug: 'airline-pilot-interview-questions-expert-answers',
        excerpt: 'Comprehensive guide to airline pilot interview questions and expert answers.',
        category: 'Aviation Career',
        readingTime: 18,
        difficulty: 'advanced'
      },
      {
        title: 'Airline Recruitment Process: From Application to Cockpit',
        slug: 'airline-recruitment-process-application-to-cockpit',
        excerpt: 'Step-by-step guide through the airline recruitment process.',
        category: 'Aviation Career',
        readingTime: 16,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    title: 'Pilot Training & Certification Series',
    description: 'Comprehensive guides for different pilot licenses and certifications',
    category: 'Pilot Training',
    posts: [
      {
        title: 'ATPL vs CPL: Which Pilot License Should You Choose?',
        slug: 'atpl-vs-cpl-pilot-license-comparison-guide',
        excerpt: 'Detailed comparison between ATPL and CPL to help you choose the right path.',
        category: 'Pilot Training',
        readingTime: 14,
        featured: true,
        difficulty: 'intermediate'
      },
      {
        title: 'Type Rating A320 vs B737: Career Impact Analysis 2024',
        slug: 'type-rating-a320-vs-b737-career-impact-analysis',
        excerpt: 'Compare A320 and B737 type ratings and their impact on your aviation career.',
        category: 'Pilot Training',
        readingTime: 16,
        difficulty: 'advanced'
      },
      {
        title: 'RTR License Complete Guide: Radio Telephony for Pilots',
        slug: 'rtr-license-complete-guide-radio-telephony-pilots',
        excerpt: 'Everything you need to know about RTR license for aviation communication.',
        category: 'Pilot Training',
        readingTime: 12,
        difficulty: 'intermediate'
      },
      {
        title: 'Flight Simulator Training: Benefits for Student Pilots',
        slug: 'flight-simulator-training-benefits-student-pilots',
        excerpt: 'How flight simulator training enhances pilot education and skills.',
        category: 'Pilot Training',
        readingTime: 8,
        difficulty: 'beginner'
      }
    ]
  },
  {
    title: 'Aviation Training Investment Series',
    description: 'Financial planning and investment strategies for pilot training',
    category: 'Training Investment',
    posts: [
      {
        title: 'Pilot Training Cost in India: Complete Financial Guide 2024',
        slug: 'pilot-training-cost-india-complete-financial-guide',
        excerpt: 'Comprehensive breakdown of pilot training costs and financing options.',
        category: 'Training Investment',
        readingTime: 17,
        featured: true,
        difficulty: 'beginner'
      },
      {
        title: 'Aviation English Proficiency: ICAO Level 4 Requirements',
        slug: 'aviation-english-proficiency-icao-level-4-requirements',
        excerpt: 'Understanding ICAO English proficiency requirements for pilots.',
        category: 'Aviation Requirements',
        readingTime: 11,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    title: 'Aviation Technology & Future Series',
    description: 'Explore the latest trends and future of aviation technology',
    category: 'Aviation Technology',
    posts: [
      {
        title: 'Aviation Technology Trends: Future of Flying 2024',
        slug: 'aviation-technology-trends-future-flying-2024',
        excerpt: 'Explore the latest aviation technology trends shaping the future of flying.',
        category: 'Aviation Technology',
        readingTime: 13,
        featured: true,
        difficulty: 'intermediate'
      }
    ]
  }
];

// Helper function to find related posts based on current post
function getRelatedPosts(currentPost: { title: string; slug: string; category: string; tags?: string[] }): RelatedPost[] {
  const allPosts: RelatedPost[] = [];

  // Collect all posts from clusters
  CONTENT_CLUSTERS.forEach(cluster => {
    allPosts.push(...cluster.posts);
  });

  // Filter out current post and find related ones
  const relatedPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      let relevanceScore = 0;

      // Category match
      if (post.category === currentPost.category) relevanceScore += 10;

      // Title keyword matching
      const currentTitleWords = currentPost.title.toLowerCase().split(' ');
      const postTitleWords = post.title.toLowerCase().split(' ');
      const commonWords = currentTitleWords.filter(word =>
        postTitleWords.includes(word) && word.length > 3
      );
      relevanceScore += commonWords.length * 5;

      // Tag matching
      if (currentPost.tags) {
        currentPost.tags.forEach(tag => {
          if (post.title.toLowerCase().includes(tag.toLowerCase())) {
            relevanceScore += 3;
          }
        });
      }

      return { post, relevanceScore };
    })
    .filter(item => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6)
    .map(item => item.post);

  return relatedPosts;
}

// Helper function to get content cluster for current post
function getContentCluster(currentPost: { category: string; title: string }): ContentCluster | null {
  return CONTENT_CLUSTERS.find(cluster => {
    // Check if current post belongs to this cluster
    return cluster.posts.some(post =>
      post.category === currentPost.category ||
      cluster.category === currentPost.category
    );
  }) || null;
}

// Related Posts Grid Component
function RelatedPostsGrid({ posts, title }: { posts: RelatedPost[]; title: string }) {
  if (posts.length === 0) return null;

  return (
    <motion.section
      className="my-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Continue your aviation learning journey with these related articles
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.article
            key={post.slug}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            {/* Post Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {post.category}
                </span>

                <div className="flex items-center space-x-2">
                  {post.featured && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                  {post.difficulty && (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      post.difficulty === 'beginner' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                      post.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                      post.difficulty === 'advanced' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    )}>
                      {post.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                {post.readingTime && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readingTime} min read
                  </div>
                )}

                <motion.a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm group-hover:translate-x-1 transition-all duration-300"
                  whileHover={{ x: 5 }}
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-1" />
                </motion.a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

// Content Cluster Navigation Component
function ContentClusterNavigation({ cluster, currentPostSlug }: { cluster: ContentCluster; currentPostSlug: string }) {
  const otherPosts = cluster.posts.filter(post => post.slug !== currentPostSlug);

  if (otherPosts.length === 0) return null;

  return (
    <motion.section
      className="my-12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <BookOpen className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {cluster.title}
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {cluster.description}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherPosts.map((post, index) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ x: 5 }}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 line-clamp-2 mb-1">
                {post.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{post.category}</span>
                {post.readingTime && (
                  <>
                    <span>•</span>
                    <span>{post.readingTime} min</span>
                  </>
                )}
                {post.difficulty && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{post.difficulty}</span>
                  </>
                )}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
          </motion.a>
        ))}
      </div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <a
          href="/blog"
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Explore All Aviation Articles
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </motion.div>
    </motion.section>
  );
}

// Main Content Cluster Links Component
export function ContentClusterLinks({ currentPost, className }: ContentClusterLinksProps) {
  const relatedPosts = getRelatedPosts(currentPost);
  const contentCluster = getContentCluster(currentPost);

  return (
    <div className={cn('space-y-8', className)}>
      {/* Content Cluster Navigation */}
      {contentCluster && (
        <ContentClusterNavigation
          cluster={contentCluster}
          currentPostSlug={currentPost.slug}
        />
      )}

      {/* Related Posts Grid */}
      <RelatedPostsGrid
        posts={relatedPosts}
        title="Related Articles You Might Find Helpful"
      />
    </div>
  );
}

export default ContentClusterLinks;
