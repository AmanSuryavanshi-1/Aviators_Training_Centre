'use client';

import { usePageViewTracking } from '@/hooks/use-conversion-tracking';
import OptimizedBlogListing from '@/components/blog/OptimizedBlogListing';

export default function BlogListingWithTracking() {
  // Track blog listing page view
  usePageViewTracking('other', 'blog-listing');
  
  return <OptimizedBlogListing />;
}