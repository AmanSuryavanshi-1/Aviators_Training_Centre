import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, BlogPostPreview, BlogCategory, BlogAuthor } from '@/lib/types/blog';

// Category mapping
const categoryMapping: Record<string, { title: string; slug: string; color: string }> = {
  'DGCA Exam Preparation': { title: 'DGCA Exam Preparation', slug: 'dgca-exam-preparation', color: '#075E68' },
  'Aviation Medical': { title: 'Aviation Medical', slug: 'aviation-medical', color: '#0C6E72' },
  'Career Guidance': { title: 'Career Guidance', slug: 'career-guidance', color: '#0A5A5E' },
  'Flight Training': { title: 'Flight Training', slug: 'flight-training', color: '#0E7A80' },
  'Technical Knowledge': { title: 'Technical Knowledge', slug: 'technical-knowledge', color: '#4A90A4' },
  'License Comparison': { title: 'License Comparison', slug: 'license-comparison', color: '#6B73FF' },
  'Type Rating': { title: 'Type Rating', slug: 'type-rating', color: '#10B981' },
  'RTR License': { title: 'RTR License', slug: 'rtr-license', color: '#F59E0B' },
  'Interview Preparation': { title: 'Interview Preparation', slug: 'interview-preparation', color: '#EF4444' },
  'Ground School': { title: 'Ground School', slug: 'ground-school', color: '#8B5CF6' },
  'Training Costs': { title: 'Training Costs', slug: 'training-costs', color: '#06B6D4' },
  'Exam Preparation': { title: 'Exam Preparation', slug: 'exam-preparation', color: '#84CC16' },
  'English Proficiency': { title: 'English Proficiency', slug: 'english-proficiency', color: '#F97316' },
  'Airline Recruitment': { title: 'Airline Recruitment', slug: 'airline-recruitment', color: '#EC4899' },
};

// Author mapping
const authorMapping: Record<string, BlogAuthor> = {
  'Aman Suryavanshi': {
    _id: 'aman-suryavanshi',
    _type: 'author',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'v1',
    name: 'Aman Suryavanshi',
    slug: { current: 'aman-suryavanshi' },
    bio: 'Senior Flight Instructor with 15+ years of experience in aviation training and DGCA examination preparation.',
    role: 'Chief Flight Instructor',
    credentials: 'ATPL, CFI, DGCA Approved Examiner',
    email: 'aman@aviatorstrainingcentre.com',
  },
  'Dr. Priya Sharma': {
    _id: 'dr-priya-sharma',
    _type: 'author',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'v1',
    name: 'Dr. Priya Sharma',
    slug: { current: 'dr-priya-sharma' },
    bio: 'Aviation Medical Examiner with 10+ years of experience in pilot medical assessments.',
    role: 'Aviation Medical Examiner',
    credentials: 'MBBS, Aviation Medicine Specialist, DGCA AME',
    email: 'priya@aviatorstrainingcentre.com',
  },
  'Capt. Rajesh Kumar': {
    _id: 'capt-rajesh-kumar',
    _type: 'author',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'v1',
    name: 'Capt. Rajesh Kumar',
    slug: { current: 'capt-rajesh-kumar' },
    bio: 'Airline Captain with 20+ years of experience flying for major Indian airlines.',
    role: 'Senior Airline Captain',
    credentials: 'ATPL, Boeing 737 Type Rating, Airbus A320 Type Rating',
    email: 'rajesh@aviatorstrainingcentre.com',
  },
};

// Generate aviation-themed SVG image
function generateAviationSVG(title: string, color: string): string {
  const svg = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient-${title.replace(/\s+/g, '-')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustColor(color, -20)};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#gradient-${title.replace(/\s+/g, '-')})"/>
    
    <!-- Aircraft silhouette -->
    <g transform="translate(400, 200)">
      <path d="M-60 -8 L60 -8 L80 0 L60 8 L-60 8 L-80 0 Z" fill="white" fill-opacity="0.3"/>
      <circle cx="0" cy="0" r="4" fill="white" fill-opacity="0.8"/>
      <path d="M-30 -6 L30 -6 M-30 6 L30 6" stroke="white" stroke-opacity="0.6" stroke-width="2"/>
      <path d="M-15 -15 L-5 -8 M15 -15 L5 -8" stroke="white" stroke-opacity="0.5" stroke-width="2"/>
      <path d="M-15 15 L-5 8 M15 15 L5 8" stroke="white" stroke-opacity="0.5" stroke-width="2"/>
    </g>
    
    <!-- Title -->
    <text x="400" y="320" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="700" opacity="0.9">${title}</text>
    <text x="400" y="350" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="400" opacity="0.7">Aviators Training Centre</text>
    
    <!-- Decorative elements -->
    <circle cx="150" cy="100" r="3" fill="white" fill-opacity="0.4"/>
    <circle cx="650" cy="350" r="3" fill="white" fill-opacity="0.4"/>
    <circle cx="100" cy="350" r="2" fill="white" fill-opacity="0.3"/>
    <circle cx="700" cy="100" r="2" fill="white" fill-opacity="0.3"/>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Convert markdown to simple blocks
function markdownToBlocks(markdown: string): any[] {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    if (line.startsWith('# ')) {
      blocks.push({
        _type: 'block',
        style: 'h1',
        children: [{ _type: 'span', text: line.substring(2) }],
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: line.substring(3) }],
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        style: 'h3',
        children: [{ _type: 'span', text: line.substring(4) }],
      });
    } else {
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: line }],
      });
    }
  }
  
  return blocks;
}

// Load blog data from files
function loadBlogData(): { posts: BlogPost[]; categories: BlogCategory[]; authors: BlogAuthor[] } {
  try {
    // First, scan for new blog posts to update metadata
    const { scanBlogPosts } = require('@/lib/blog/dynamic-blog-scanner');
    const dynamicMetadata = scanBlogPosts();
    
    // Read updated metadata
    const metadataPath = path.join(process.cwd(), 'data-blog-posts/optimized-blog-posts/metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    
    const posts: BlogPost[] = [];
    const categories: BlogCategory[] = [];
    const authors: BlogAuthor[] = [];
    
    // Create categories
    const createdCategories = new Set<string>();
    for (const categoryName of metadata.categories) {
      if (!createdCategories.has(categoryName)) {
        const categoryInfo = categoryMapping[categoryName];
        if (categoryInfo) {
          categories.push({
            _id: categoryInfo.slug,
            _type: 'category',
            _createdAt: '2024-01-01T00:00:00Z',
            _updatedAt: '2024-01-01T00:00:00Z',
            _rev: 'v1',
            title: categoryInfo.title,
            slug: { current: categoryInfo.slug },
            description: `${categoryInfo.title} related content and guides`,
            color: categoryInfo.color,
          });
          createdCategories.add(categoryName);
        }
      }
    }
    
    // Create authors
    for (const authorName of Object.keys(authorMapping)) {
      authors.push(authorMapping[authorName]);
    }
    
    // Process each blog post
    for (const postMeta of metadata.posts) {
      try {
        // Read markdown file
        const markdownPath = path.join(process.cwd(), 'data-blog-posts/optimized-blog-posts', `${postMeta.slug}.md`);
        
        if (!fs.existsSync(markdownPath)) {
          console.warn(`Markdown file not found: ${markdownPath}`);
          continue;
        }
        
        const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
        const { data: frontMatter, content } = matter(markdownContent);
        
        // Get category and author
        const categoryInfo = categoryMapping[postMeta.category];
        const authorName = frontMatter.author || 'Aman Suryavanshi';
        const author = authorMapping[authorName] || authorMapping['Aman Suryavanshi'];
        
        if (!categoryInfo) {
          console.warn(`Unknown category: ${postMeta.category}`);
          continue;
        }
        
        // Create blog post
        const blogPost: BlogPost = {
          _id: postMeta.slug,
          _type: 'post',
          _createdAt: '2024-01-01T00:00:00Z',
          _updatedAt: '2024-01-01T00:00:00Z',
          _rev: 'v1',
          title: postMeta.title,
          slug: { current: postMeta.slug },
          publishedAt: new Date(Date.now() - (postMeta.priority * 24 * 60 * 60 * 1000)).toISOString(),
          lastModified: new Date().toISOString(),
          excerpt: postMeta.excerpt,
          body: markdownToBlocks(content),
          image: {
            asset: generateAviationSVG(postMeta.title, categoryInfo.color),
            alt: postMeta.title,
          },
          category: {
            _id: categoryInfo.slug,
            _type: 'category',
            _createdAt: '2024-01-01T00:00:00Z',
            _updatedAt: '2024-01-01T00:00:00Z',
            _rev: 'v1',
            title: categoryInfo.title,
            slug: { current: categoryInfo.slug },
            description: `${categoryInfo.title} related content and guides`,
            color: categoryInfo.color,
          },
          author,
          readingTime: Math.ceil(postMeta.wordCount / 200),
          featured: postMeta.priority <= 3,
          tags: frontMatter.tags || [
            postMeta.category,
            'Aviation Training',
            'DGCA',
            'Pilot Training'
          ],
          difficulty: frontMatter.difficulty || 'intermediate',
          contentType: 'guide',
          enableComments: true,
          enableSocialSharing: true,
          enableNewsletterSignup: true,
          viewCount: Math.floor(Math.random() * 5000) + 1000,
          shareCount: Math.floor(Math.random() * 200) + 50,
          engagementScore: Math.floor(Math.random() * 40) + 60,
          ctaPlacements: [],
        };
        
        posts.push(blogPost);
      } catch (error) {
        console.error(`Error processing post ${postMeta.slug}:`, error);
      }
    }
    
    // Sort posts by priority/date
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return { posts, categories, authors };
  } catch (error) {
    console.error('Error loading blog data:', error);
    return { posts: [], categories: [], authors: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    
    const { posts, categories, authors } = loadBlogData();
    
    switch (action) {
      case 'posts':
        return NextResponse.json({ posts: posts.map(convertToPreview) });
      
      case 'featured':
        return NextResponse.json({ posts: posts.filter(post => post.featured).map(convertToPreview) });
      
      case 'categories':
        return NextResponse.json({ categories });
      
      case 'authors':
        return NextResponse.json({ authors });
      
      case 'post':
        if (!slug) {
          return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }
        const post = posts.find(p => p.slug.current === slug);
        if (!post) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json({ post });
      
      case 'slugs':
        return NextResponse.json({ slugs: posts.map(p => p.slug.current) });
      
      case 'category-posts':
        if (!category) {
          return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }
        const categoryPosts = posts.filter(p => p.category.slug.current === category);
        return NextResponse.json({ posts: categoryPosts.map(convertToPreview) });
      
      default:
        return NextResponse.json({ 
          posts: posts.map(convertToPreview),
          categories,
          authors,
          totalPosts: posts.length
        });
    }
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Convert to preview format for listing pages
function convertToPreview(post: BlogPost): BlogPostPreview {
  return {
    _id: post._id,
    _createdAt: post._createdAt || post.publishedAt,
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    author: post.author,
    readingTime: post.readingTime,
    featured: post.featured,
    tags: post.tags || [],
    difficulty: post.difficulty
  };
}
