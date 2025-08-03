
// Global type declarations for ATC project
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Module declarations
declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'gray-matter' {
  interface GrayMatterFile<T> {
    data: T;
    content: string;
    excerpt?: string;
  }
  
  function matter<T = any>(input: string): GrayMatterFile<T>;
  export = matter;
}

declare module 'reading-time' {
  interface ReadingTimeResults {
    text: string;
    minutes: number;
    time: number;
    words: number;
  }
  
  function readingTime(text: string): ReadingTimeResults;
  export = readingTime;
}

// Sanity types
export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface BlogPost extends SanityDocument {
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  content?: any;
  author?: any;
  category?: any;
  tags?: any[];
  featured?: boolean;
  featuredOnHome?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  mainImage?: any;
}

export interface Category extends SanityDocument {
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Author extends SanityDocument {
  name: string;
  slug: { current: string };
  bio?: string;
  image?: any;
  role?: string;
}

export interface Tag extends SanityDocument {
  title: string;
  slug: { current: string };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export {};
