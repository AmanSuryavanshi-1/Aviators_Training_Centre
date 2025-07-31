'use client';

import { useEffect } from 'react';

interface BlogSEOEnhancerProps {
  post: {
    title: string;
    focusKeyword?: string;
    additionalKeywords?: string[];
    readingTime?: number;
    publishedAt?: string;
    category?: { title: string };
  };
}

const BlogSEOEnhancer: React.FC<BlogSEOEnhancerProps> = ({ post }) => {
  useEffect(() => {
    // Add reading progress indicator
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #075E68, #219099);
      z-index: 9999;
      transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    };

    window.addEventListener('scroll', updateProgress);

    // Add estimated reading time to page
    if (post.readingTime) {
      const readingTimeElement = document.createElement('meta');
      readingTimeElement.name = 'twitter:label1';
      readingTimeElement.content = 'Reading time';
      document.head.appendChild(readingTimeElement);

      const readingTimeValue = document.createElement('meta');
      readingTimeValue.name = 'twitter:data1';
      readingTimeValue.content = `${post.readingTime} min read`;
      document.head.appendChild(readingTimeValue);
    }

    // Add category to page
    if (post.category?.title) {
      const categoryElement = document.createElement('meta');
      categoryElement.name = 'twitter:label2';
      categoryElement.content = 'Filed under';
      document.head.appendChild(categoryElement);

      const categoryValue = document.createElement('meta');
      categoryValue.name = 'twitter:data2';
      categoryValue.content = post.category.title;
      document.head.appendChild(categoryValue);
    }

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateProgress);
      const existingProgressBar = document.getElementById('reading-progress');
      if (existingProgressBar) {
        existingProgressBar.remove();
      }
    };
  }, [post]);

  return null;
};

export default BlogSEOEnhancer;