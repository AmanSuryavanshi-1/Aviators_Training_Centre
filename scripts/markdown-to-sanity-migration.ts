#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';
import { enhancedClient } from '../lib/sanity/client.js';

// Frontmatter interface for different markdown formats
interface BlogFrontmatter {
  title: string;
  slug?: string;
  date?: string;
  publishedAt?: string;
  excerpt: string;
  category: string;
  author?: {
    name: string;
    image: string;
  } | string;
  featured?: boolean;
  priority?: number;
  tags?: string[];
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  [key: string]: any;
}

// Function to convert markdown content to Sanity Portable Text
function markdownToPortableText(markdown: string) {
  const blocks: any[] = [];
  const lines = markdown.split('\n');
  let currentBlock: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    
    // Handle headings
    if (line.startsWith('#')) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '').trim();
      
      currentBlock = {
        _type: 'block',
        style: `h${Math.min(level, 6)}`,
        children: [
          {
            _type: 'span',
            text: text,
            marks: []
          }
        ]
      };
    }
    // Handle list items
    else if (line.match(/^[\s]*[-*]\s/) || line.match(/^[\s]*\d+\.\s/)) {
      if (currentBlock && currentBlock.listItem !== 'bullet' && currentBlock.listItem !== 'number') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      const isNumbered = line.match(/^[\s]*\d+\.\s/);
      const text = line.replace(/^[\s]*(?:[-*]|\d+\.)\s*/, '').trim();
      const parsedSpans = parseInlineFormatting(text);
      
      currentBlock = {
        _type: 'block',
        style: 'normal',
        listItem: isNumbered ? 'number' : 'bullet',
        children: parsedSpans
      };
      blocks.push(currentBlock);
      currentBlock = null;
    }
    // Handle code blocks
    else if (line.startsWith('```')) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      // Find closing ```
      let codeContent = '';
      const language = line.replace('```', '').trim();
      
      i++; // Move to next line
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeContent += lines[i] + '\n';
        i++;
      }
      
      blocks.push({
        _type: 'code',
        language: language || 'text',
        code: codeContent.trim()
      });
    }
    // Handle blockquotes
    else if (line.startsWith('>')) {
      if (currentBlock && currentBlock.style !== 'blockquote') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      const text = line.replace(/^>\s*/, '').trim();
      const parsedSpans = parseInlineFormatting(text);
      
      if (!currentBlock) {
        currentBlock = {
          _type: 'block',
          style: 'blockquote',
          children: parsedSpans
        };
      } else {
        // Add to existing blockquote
        currentBlock.children.push(
          { _type: 'span', text: ' ', marks: [] },
          ...parsedSpans
        );
      }
    }
    // Handle table rows (basic support)
    else if (line.includes('|') && line.split('|').length > 2) {
      // Skip table headers and separators for now
      if (line.includes('---') || line.includes('===')) {
        continue;
      }
      
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      const tableText = cells.join(' | ');
      
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: tableText,
            marks: []
          }
        ]
      });
    }
    // Handle regular paragraphs
    else {
      const parsedSpans = parseInlineFormatting(line);
      
      if (!currentBlock || currentBlock.style !== 'normal' || currentBlock.listItem) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          _type: 'block',
          style: 'normal',
          children: parsedSpans
        };
      } else {
        // Add to existing paragraph
        currentBlock.children.push(
          { _type: 'span', text: ' ', marks: [] },
          ...parsedSpans
        );
      }
    }
  }
  
  // Add final block
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  
  return blocks;
}

// Function to parse inline formatting (bold, italic, code, links)
function parseInlineFormatting(text: string) {
  const spans: any[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    const prevChar = text[i - 1];
    
    // Handle bold (**text**)
    if (char === '*' && nextChar === '*') {
      if (currentText) {
        spans.push({ _type: 'span', text: currentText, marks: [] });
        currentText = '';
      }
      
      // Find closing **
      let boldText = '';
      i += 2; // Skip **
      while (i < text.length - 1) {
        if (text[i] === '*' && text[i + 1] === '*') {
          break;
        }
        boldText += text[i];
        i++;
      }
      
      if (boldText) {
        spans.push({ 
          _type: 'span', 
          text: boldText, 
          marks: ['strong'] 
        });
      }
      
      i += 2; // Skip closing **
      continue;
    }
    
    // Handle italic (*text*)
    if (char === '*' && nextChar !== '*' && prevChar !== '*') {
      if (currentText) {
        spans.push({ _type: 'span', text: currentText, marks: [] });
        currentText = '';
      }
      
      // Find closing *
      let italicText = '';
      i++; // Skip *
      while (i < text.length) {
        if (text[i] === '*' && text[i - 1] !== '\\') {
          break;
        }
        italicText += text[i];
        i++;
      }
      
      if (italicText) {
        spans.push({ 
          _type: 'span', 
          text: italicText, 
          marks: ['em'] 
        });
      }
      
      i++; // Skip closing *
      continue;
    }
    
    // Handle code (`text`)
    if (char === '`') {
      if (currentText) {
        spans.push({ _type: 'span', text: currentText, marks: [] });
        currentText = '';
      }
      
      // Find closing `
      let codeText = '';
      i++; // Skip `
      while (i < text.length) {
        if (text[i] === '`') {
          break;
        }
        codeText += text[i];
        i++;
      }
      
      if (codeText) {
        spans.push({ 
          _type: 'span', 
          text: codeText, 
          marks: ['code'] 
        });
      }
      
      i++; // Skip closing `
      continue;
    }
    
    // Handle links [text](url)
    if (char === '[') {
      if (currentText) {
        spans.push({ _type: 'span', text: currentText, marks: [] });
        currentText = '';
      }
      
      // Find link text and URL
      let linkText = '';
      let linkUrl = '';
      i++; // Skip [
      
      // Get link text
      while (i < text.length && text[i] !== ']') {
        linkText += text[i];
        i++;
      }
      
      if (i < text.length && text[i] === ']' && text[i + 1] === '(') {
        i += 2; // Skip ](
        
        // Get URL
        while (i < text.length && text[i] !== ')') {
          linkUrl += text[i];
          i++;
        }
        
        if (linkText && linkUrl) {
          spans.push({
            _type: 'span',
            text: linkText,
            marks: [
              {
                _type: 'link',
                href: linkUrl
              }
            ]
          });
        }
        
        i++; // Skip closing )
        continue;
      }
    }
    
    // Regular character
    currentText += char;
    i++;
  }
  
  // Add remaining text
  if (currentText) {
    spans.push({ _type: 'span', text: currentText, marks: [] });
  }
  
  return spans.length > 0 ? spans : [{ _type: 'span', text: '', marks: [] }];
}

// Function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Function to read all markdown files from directories
function readMarkdownFiles(): { file: string; data: BlogFrontmatter; content: string }[] {
  const posts: { file: string; data: BlogFrontmatter; content: string }[] = [];
  const directories = [
    'content/blog',
    'data-blog-posts/optimized-blog-posts'
  ];
  
  for (const dir of directories) {
    try {
      const files = readdirSync(dir);
      
      for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        
        if (stat.isFile() && extname(file) === '.md') {
          try {
            const fileContent = readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            posts.push({
              file: filePath,
              data: data as BlogFrontmatter,
              content: content.trim()
            });
          } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Directory ${dir} not found or inaccessible`);
    }
  }
  
  return posts;
}

// Function to upload posts to Sanity
async function uploadPostsToSanity(posts: { file: string; data: BlogFrontmatter; content: string }[]) {
  console.log(`🚀 Starting upload of ${posts.length} blog posts to Sanity...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const post of posts) {
    try {
      const { data, content, file } = post;
      
      // Create slug
      const slug = data.slug || createSlug(data.title);
      
      // Parse author
      let authorName = 'Admin';
      let authorImage = '/instructors/default-instructor.jpg';
      
      if (typeof data.author === 'string') {
        authorName = data.author;
      } else if (data.author && typeof data.author === 'object') {
        authorName = data.author.name || 'Admin';
        authorImage = data.author.image || '/instructors/default-instructor.jpg';
      }
      
      // Parse date
      const publishedAt = data.publishedAt || data.date || new Date().toISOString();
      
      // Convert markdown content to Portable Text
      const body = markdownToPortableText(content);
      
      // Create Sanity document
      const sanityDoc = {
        _type: 'blogPost',
        title: data.title,
        slug: {
          _type: 'slug',
          current: slug
        },
        excerpt: data.excerpt,
        body: body,
        publishedAt: publishedAt,
        category: data.category || 'General',
        featured: data.featured || false,
        priority: data.priority || 0,
        tags: data.tags || [],
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.excerpt,
          focusKeyword: data.focusKeyword || ''
        },
        author: {
          name: authorName,
          image: authorImage
        },
        coverImage: data.coverImage || '/blog/default-cover.jpg',
        editable: true,
        migrated: true,
        sourceFile: file
      };
      
      // Upload to Sanity
      const result = await enhancedClient.create(sanityDoc);
      
      console.log(`✅ Uploaded: "${data.title}" (ID: ${result._id})`);
      successCount++;
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to upload "${post.data.title}":`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successfully uploaded: ${successCount} posts`);
  console.log(`❌ Failed uploads: ${errorCount} posts`);
  console.log(`📁 Total processed: ${posts.length} posts`);
}

// Function to delete all existing posts
async function deleteAllPosts() {
  console.log('🗑️  Deleting all existing blog posts...');
  
  try {
    const query = '*[_type == "blogPost"] { _id }';
    const posts = await enhancedClient.fetch(query);
    
    if (posts.length === 0) {
      console.log('No existing posts found to delete.');
      return;
    }
    
    console.log(`Found ${posts.length} existing posts to delete...`);
    
    const transaction = enhancedClient.transaction();
    posts.forEach((post: any) => {
      transaction.delete(post._id);
    });
    
    await transaction.commit();
    console.log(`✅ Successfully deleted ${posts.length} posts`);
    
    // Clear cache
    console.log('🔄 Clearing cache...');
    await fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
    
  } catch (error) {
    console.error('❌ Error deleting posts:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (command === 'test') {
      console.log('🔍 Testing Sanity connection...');
      
      const query = '*[_type == "blogPost"] | order(publishedAt desc) [0...5] { _id, title, publishedAt }';
      const posts = await enhancedClient.fetch(query);
      
      console.log('✅ Sanity connection successful!');
      console.log(`📊 Current posts in database: ${posts.length}`);
      
      if (posts.length > 0) {
        console.log('\n📝 Recent posts:');
        posts.forEach((post: any, index: number) => {
          console.log(`  ${index + 1}. ${post.title} (${post.publishedAt?.split('T')[0]})`);
        });
      }
      
    } else if (command === 'migrate') {
      console.log('📚 Reading markdown files...');
      const posts = readMarkdownFiles();
      
      if (posts.length === 0) {
        console.log('❌ No markdown files found to migrate');
        return;
      }
      
      console.log(`📖 Found ${posts.length} markdown files to migrate:`);
      posts.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.data.title} (${post.file})`);
      });
      
      await uploadPostsToSanity(posts);
      
    } else if (command === 'reset') {
      console.log('🔄 Performing full reset (delete all + migrate)...');
      
      await deleteAllPosts();
      
      console.log('\n📚 Reading markdown files for migration...');
      const posts = readMarkdownFiles();
      
      if (posts.length === 0) {
        console.log('❌ No markdown files found to migrate');
        return;
      }
      
      await uploadPostsToSanity(posts);
      
    } else {
      console.log('📖 Markdown to Sanity Migration Tool');
      console.log('');
      console.log('Available commands:');
      console.log('  npm run migrate-markdown test    - Test Sanity connection and show current posts');
      console.log('  npm run migrate-markdown migrate - Migrate markdown files to Sanity');
      console.log('  npm run migrate-markdown reset   - Delete all posts and migrate markdown files');
      console.log('');
      console.log('Examples:');
      console.log('  npm run migrate-markdown test');
      console.log('  npm run migrate-markdown migrate');
      console.log('  npm run migrate-markdown reset');
    }
    
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
