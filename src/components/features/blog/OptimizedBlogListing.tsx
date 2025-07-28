"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, BookOpen, TrendingUp, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';
import BlogCard from './BlogCard';
import { BlogPostPreview, BlogCategory } from '@/lib/types/blog';
import { useRealTimeSync } from '@/hooks/use-real-time-sync';

const OptimizedBlogListing: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Use real-time sync for updates
  const { optimisticUpdate, isConnected, isPending } = useRealTimeSync();

  // State for blog data
  const [posts, setPosts] = React.useState<BlogPostPreview[]>([]);
  const [featuredPosts, setFeaturedPosts] = React.useState<BlogPostPreview[]>([]);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [filteredPosts, setFilteredPosts] = React.useState<BlogPostPreview[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Enhanced data loading with unified service
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading blog data from Sanity CMS via unified service...');
      
      // Load all data from unified service
      const [allPosts, featured, cats] = await Promise.all([
        simpleBlogService.getAllPosts(),
        simpleBlogService.getAllPosts({ featured: true }),
        simpleBlogService.getAllCategories()
      ]);

      console.log(`✅ Loaded ${allPosts.length} posts, ${featured.length} featured, ${cats.length} categories from Sanity`);
      
      setPosts(allPosts);
      setFeaturedPosts(featured);
      setCategories(cats);
      setFilteredPosts(allPosts);
    } catch (error) {
      console.error('❌ Error loading blog data from Sanity:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog posts from Sanity CMS. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load blog data from Sanity CMS only
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle real-time sync events
  React.useEffect(() => {
    const { realTimeSyncManager } = require('@/lib/sync/real-time-sync');
    
    const unsubscribe = realTimeSyncManager.onSyncEvent((event: any) => {
      console.log('🔄 Sync event received, reloading blog data:', event);
      loadData();
    });

    return unsubscribe;
  }, [loadData]);

  // Filter posts based on search and category
  React.useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category.slug.current === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Unable to load blog posts
              </h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={loadData}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Aviation Blog
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            Expert insights, training guides, and career advice from certified aviation professionals
          </motion.p>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-5 h-5" />
              <span>{posts.length} Articles</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-5 h-5" />
              <span>{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-5 h-5" />
              <span>{featuredPosts.length} Featured</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"
            >
              <TrendingUp className="w-6 h-6 text-primary" />
              Featured Articles
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <motion.div key={`featured-${post._id}-${index}`} variants={itemVariants}>
                  <BlogCard 
                    post={post} 
                    featured={true}
                    priority={true}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Search and Filters */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Categories
                  </Button>
                  {categories.slice(0, 4).map((category) => (
                    <Button
                      key={category._id}
                      variant={selectedCategory === category.slug.current ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.slug.current)}
                    >
                      {category.title}
                    </Button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Info */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <p className="text-muted-foreground">
            {filteredPosts.length === posts.length
              ? `Showing all ${filteredPosts.length} articles`
              : `Showing ${filteredPosts.length} of ${posts.length} articles`
            }
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.slug.current === selectedCategory)?.title}`}
            {!isConnected && (
              <span className="text-orange-600 ml-2">
                (Offline - showing cached content)
              </span>
            )}
          </p>
        </motion.div>

        {/* Blog Posts Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <motion.div key={`${post._id}-${index}`} variants={itemVariants}>
                <div className={`relative ${isPending ? 'opacity-90' : ''}`}>
                  {isPending && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Syncing...
                      </div>
                    </div>
                  )}
                  <BlogCard 
                    post={post} 
                    viewMode={viewMode}
                    showExcerpt={true}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={itemVariants}
              className="col-span-full text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No articles found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No articles match your search for "${searchQuery}"`
                    : 'No articles found in this category'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-bold text-foreground mb-6"
            >
              Browse by Category
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <motion.div key={`category-${category._id || category.slug.current}-${index}`} variants={itemVariants}>
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setSelectedCategory(category.slug.current)}
                  >
                    <CardContent className="p-4 text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-semibold text-foreground mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {posts.filter(post => post.category.slug.current === category.slug.current).length} articles
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default OptimizedBlogListing;