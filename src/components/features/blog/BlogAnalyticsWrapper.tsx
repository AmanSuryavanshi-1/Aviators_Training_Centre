'use client';

import React from 'react';
import { useBlogAnalytics } from '@/hooks/useAnalytics';

interface BlogAnalyticsWrapperProps {
  children: React.ReactNode;
  postSlug: string;
  postTitle: string;
  category?: string;
}

const BlogAnalyticsWrapper: React.FC<BlogAnalyticsWrapperProps> = ({
  children,
  postSlug,
  postTitle,
  category
}) => {
  // This hook will automatically track blog view and engagement
  useBlogAnalytics(postSlug, postTitle, category);

  return <>{children}</>;
};

export default BlogAnalyticsWrapper;