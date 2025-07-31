'use client';

import { usePageViewTracking } from '@/hooks/use-conversion-tracking';
import { trackPageview } from '@/lib/analytics/client';
import { useEffect } from 'react';
import OptimizedBlogListing from "@/components/features/blog/OptimizedBlogListing";

export default function BlogListingWithTracking() {
  // Track blog listing page view (legacy)
  usePageViewTracking('other', 'blog-listing');
  
  // New analytics tracking
  useEffect(() => {
    // Track blog listing page view with new analytics system
    trackPageview('blog-listing', {
      referrer: document.referrer,
      immediate: false
    });
  }, []);
  
  return <OptimizedBlogListing />;
}
