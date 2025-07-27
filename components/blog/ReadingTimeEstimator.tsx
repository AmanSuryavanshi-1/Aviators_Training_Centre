'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface ReadingTimeEstimatorProps {
  content?: string;
  readingTime?: number;
}

export default function ReadingTimeEstimator({ content, readingTime }: ReadingTimeEstimatorProps) {
  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const estimatedTime = content ? calculateReadingTime(content) : readingTime || 5;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>{estimatedTime} min read</span>
    </div>
  );
}