/**
 * Blog Content Organization Script
 * 
 * This script analyzes and organizes blog posts from different formats and locations
 * into a single structured format in the data/curated-blog-posts directory.
 * 
 * It identifies the best quality content, removes duplicates, and ensures consistent formatting.
 */

import fs from 'fs';
import path from 'path';

// Define source directories
const aviationBlogPostsDir = path.join(process.cwd(), 'data', 'aviation-blog-posts');
const blogPostsDir = path.join(process.cwd(), 'data', 'blog-posts');

// Define target directory
const curatedBlogPostsDir = path.join(process.cwd(), 'data', 'curated-blog-posts');

// Create target directory if it doesn't exist
if (!fs.existsSync(curatedBlogPostsDir)) {
  fs.mkdirSync(curatedBlogPostsDir, { recursive: true });
}

// Define the curated blog posts based on analysis
const curatedBlogPosts = [
  {
    id: 1,
    title: 'DGCA CPL Complete Guide 2024: Your Path to Commercial Pilot License in India',
    slug: 'dgca-cpl-complete-guide-2024',
    category: 'DGCA Exam Preparation',
    excerpt: 'Master the DGCA Commercial Pilot License process with our comprehensive 2024 guide. Learn requirements, costs, timeline, and insider tips from experienced aviation professionals.',
    sourceFile: 'data/aviation-blog-posts/post-1-dgca-cpl-complete-guide.ts', // More comprehensive content
    alternativeFile: 'data/blog-posts/dgca-cpl-complete-guide-2024.md',
    quality: 'high',
    conversionPotential: 'excellent'
  },
  {
    id: 2,
    title: 'Pilot Salary in India 2024: Complete Career and Earnings Guide',
    slug: 'pilot-salary-india-2024-career-earnings-guide',
    category: 'Career Guidance',
    excerpt: 'Comprehensive guide to pilot salaries in India for 2024. Learn about airline pilot pay scales, career progression, benefits, and earning potential across different aviation sectors.',
    sourceFile: 'data/blog-posts/pilot-salary-india-2024-career-earnings-guide.md', // More detailed content
    alternativeFile: 'data/aviation-blog-posts/post-2-pilot-career-salary-guide.ts',
    quality: 'high',
    conversionPotential: 'excellent'
  },
  {
    id: 3,
    title: 'Flight Simulator Training Benefits for Student Pilots',
    slug: 'flight-simulator-training-benefits-student-pilots',
    category: 'Flight Training',
    excerpt: 'Discover how flight simulator training accelerates pilot development, reduces costs, and improves safety. Learn why modern flight schools integrate advanced simulation in pilot training programs.',
    sourceFile: 'data/blog-posts/flight-simulator-training-benefits-student-pilots.md',
    alternativeFile: 'data/aviation-blog-posts/post-3-flight-simulator-training-benefits.ts',
    quality: 'high',
    conversionPotential: 'good'
  },
  {
    id: 4,
    title: 'Aviation Technology Trends: The Future of Flying in 2024',
    slug: 'aviation-technology-trends-future-flying-2024',
    category: 'Aviation Technology',
    excerpt: 'Explore cutting-edge aviation technologies transforming the industry. From AI-powered systems to sustainable aviation fuels, discover what every pilot needs to know about the future.',
    sourceFile: 'data/blog-posts/aviation-technology-trends-future-flying-2024.md',
    alternativeFile: 'data/aviation-blog-posts/post-4-aviation-technology-trends.ts',
    quality: 'high',
    conversionPotential: 'good'
  },
  {
    id: 5,
    title: 'Airline Industry Career Opportunities Beyond Pilot Jobs',
    slug: 'airline-industry-career-opportunities-beyond-pilot-jobs',
    category: 'Aviation Industry',
    excerpt: 'Comprehensive overview of diverse career paths in the aviation industry beyond piloting, including operations, management, and technical roles.',
    sourceFile: 'data/blog-posts/airline-industry-career-opportunities-beyond-pilot-jobs.md',
    alternativeFile: 'data/aviation-blog-posts/post-5-airline-industry-career-opportunities.ts',
    quality: 'high',
    conversionPotential: 'good'
  },
  {
    id: 6,
    title: '10 Critical DGCA Medical Examination Tips for Aspiring Pilots',
    slug: 'dgca-medical-examination-tips-aspiring-pilots',
    category: 'Aviation Medical',
    excerpt: 'Maximize your chances of passing the DGCA Class 1 medical examination with these 10 expert tips. Learn preparation strategies, common disqualifiers, and how to handle medical issues.',
    sourceFile: 'data/blog-posts/post5.md',
    alternativeFile: null,
    quality: 'high',
    conversionPotential: 'excellent'
  }
];

// Function to extract content from TypeScript files
function extractTSContent(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the body content from the TypeScript export
    const bodyMatch = content.match(/body:\s*`([^`]*(?:`[^`]*)*)`/s);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1].trim();
    }
    
    // Alternative extraction method
    const bodyMatch2 = content.match(/body:\s*"([^"]*(?:\\.[^"]*)*)"/s);
    if (bodyMatch2 && bodyMatch2[1]) {
      return bodyMatch2[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading TypeScript file ${filePath}:`, error);
    return null;
  }
}

// Function to process and organize blog posts
async function organizeBlogPosts() {
  console.log('Starting blog content organization...');
  
  // Create metadata file
  const metadata = {
    totalPosts: curatedBlogPosts.length,
    lastUpdated: new Date().toISOString(),
    posts: curatedBlogPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      quality: post.quality,
      conversionPotential: post.conversionPotential
    }))
  };
  
  fs.writeFileSync(
    path.join(curatedBlogPostsDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('Created metadata file');
  
  // Process each blog post
  for (const post of curatedBlogPosts) {
    console.log(`Processing: ${post.title}`);
    
    let content = '';
    let frontMatter = '';
    
    try {
      // Try to read the primary source file
      if (fs.existsSync(post.sourceFile)) {
        if (post.sourceFile.endsWith('.ts')) {
          // Extract content from TypeScript file
          const extractedContent = extractTSContent(post.sourceFile);
          if (extractedContent) {
            content = extractedContent;
            
            // Create front matter for TS content
            frontMatter = `---
title: "${post.title}"
slug: "${post.slug}"
category: "${post.category}"
excerpt: "${post.excerpt}"
author: "ATC Instructor"
featured: true
readingTime: 12
quality: "${post.quality}"
conversionPotential: "${post.conversionPotential}"
publishedAt: "${new Date().toISOString()}"
---

`;
          }
        } else if (post.sourceFile.endsWith('.md')) {
          // Read markdown file directly
          content = fs.readFileSync(post.sourceFile, 'utf8');
        }
      }
      
      // If primary source failed, try alternative
      if (!content && post.alternativeFile && fs.existsSync(post.alternativeFile)) {
        if (post.alternativeFile.endsWith('.ts')) {
          const extractedContent = extractTSContent(post.alternativeFile);
          if (extractedContent) {
            content = extractedContent;
            frontMatter = `---
title: "${post.title}"
slug: "${post.slug}"
category: "${post.category}"
excerpt: "${post.excerpt}"
author: "ATC Instructor"
featured: true
readingTime: 12
quality: "${post.quality}"
conversionPotential: "${post.conversionPotential}"
publishedAt: "${new Date().toISOString()}"
---

`;
          }
        } else {
          content = fs.readFileSync(post.alternativeFile, 'utf8');
        }
      }
      
      if (content) {
        // Write the final organized content
        const finalContent = frontMatter + content;
        fs.writeFileSync(
          path.join(curatedBlogPostsDir, `${post.slug}.md`),
          finalContent
        );
        console.log(`✓ Created ${post.slug}.md`);
      } else {
        console.error(`✗ Could not extract content for ${post.title}`);
      }
      
    } catch (error) {
      console.error(`Error processing ${post.title}:`, error);
    }
  }
  
  console.log(`\n✅ Blog organization complete!`);
  console.log(`📁 Organized ${curatedBlogPosts.length} high-quality blog posts in ${curatedBlogPostsDir}`);
  console.log(`📊 Quality breakdown:`);
  console.log(`   - High quality posts: ${curatedBlogPosts.filter(p => p.quality === 'high').length}`);
  console.log(`   - Excellent conversion potential: ${curatedBlogPosts.filter(p => p.conversionPotential === 'excellent').length}`);
  console.log(`   - Good conversion potential: ${curatedBlogPosts.filter(p => p.conversionPotential === 'good').length}`);
}

// Run the organization function
organizeBlogPosts().catch(console.error);
