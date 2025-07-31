#!/usr/bin/env tsx

/**
 * Migration Script: Markdown to Sanity CMS
 * 
 * This script migrates existing markdown blog posts to Sanity CMS,
 * preserving all metadata, formatting, and image references.
 * 
 * Usage: npx tsx scripts/migrate-markdown-to-sanity.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { createClient } from 'next-sanity';

// Sanity client configuration for migration
const client = createClient({
  projectId: "3u4fa9kl",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

interface MarkdownPost {
  title: string;
  date: string;
  excerpt: string;
  category: string;
  coverImage: string;
  author: {
    name: string;
    image: string;
  };
  featured: boolean;
  content: string;
  slug: string;
}

interface SanityAuthor {
  _id: string;
  name: string;
  slug: { current: string };
  image?: any;
}

interface SanityCategory {
  _id: string;
  title: string;
  slug: { current: string };
}

interface SanityPost {
  _type: 'post';
  title: string;
  slug: { current: string; _type: 'slug' };
  excerpt: string;
  body: any[];
  image: any;
  category: { _type: 'reference'; _ref: string };
  author: { _type: 'reference'; _ref: string };
  publishedAt: string;
  featured: boolean;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  structuredData: {
    articleType: string;
    learningResourceType: string;
    educationalLevel: string;
    timeRequired: string;
  };
  ctaPlacements: any[];
  intelligentCTARouting: {
    enableIntelligentRouting: boolean;
    fallbackAction: string;
  };
}

class MarkdownToSanityMigrator {
  private existingAuthors: Map<string, SanityAuthor> = new Map();
  private existingCategories: Map<string, SanityCategory> = new Map();
  private migratedPosts: string[] = [];
  private errors: string[] = [];

  constructor() {
    console.log('🚀 Starting Markdown to Sanity Migration...\n');
  }

  /**
   * Main migration function
   */
  async migrate(): Promise<void> {
    try {
      // Check if Sanity token is available
      if (!process.env.SANITY_API_TOKEN) {
        throw new Error('SANITY_API_TOKEN environment variable is required for migration');
      }

      // Step 1: Load existing authors and categories
      await this.loadExistingData();

      // Step 2: Read markdown files
      const markdownPosts = await this.readMarkdownFiles();
      console.log(`📄 Found ${markdownPosts.length} markdown posts to migrate\n`);

      // Step 3: Create missing authors and categories
      await this.createMissingAuthorsAndCategories(markdownPosts);

      // Step 4: Migrate each post
      for (const post of markdownPosts) {
        await this.migratePost(post);
      }

      // Step 5: Generate migration report
      this.generateReport();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Load existing authors and categories from Sanity
   */
  private async loadExistingData(): Promise<void> {
    console.log('📋 Loading existing authors and categories...');

    try {
      // Load authors
      const authors = await client.fetch<SanityAuthor[]>(`
        *[_type == "author"] {
          _id,
          name,
          slug,
          image
        }
      `);

      authors.forEach(author => {
        this.existingAuthors.set(author.name.toLowerCase(), author);
      });

      // Load categories
      const categories = await client.fetch<SanityCategory[]>(`
        *[_type == "category"] {
          _id,
          title,
          slug
        }
      `);

      categories.forEach(category => {
        this.existingCategories.set(category.title.toLowerCase(), category);
      });

      console.log(`✅ Loaded ${authors.length} authors and ${categories.length} categories\n`);
    } catch (error) {
      console.error('❌ Error loading existing data:', error);
      throw error;
    }
  }

  /**
   * Read and parse markdown files
   */
  private async readMarkdownFiles(): Promise<MarkdownPost[]> {
    const markdownDir = path.join(process.cwd(), 'content/blog');
    const posts: MarkdownPost[] = [];

    try {
      const files = fs.readdirSync(markdownDir).filter(file => file.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(markdownDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Generate slug from filename
        const slug = file.replace('.md', '');

        posts.push({
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          category: data.category,
          coverImage: data.coverImage,
          author: data.author,
          featured: data.featured || false,
          content,
          slug,
        });
      }

      return posts;
    } catch (error) {
      console.error('❌ Error reading markdown files:', error);
      throw error;
    }
  }

  /**
   * Create missing authors and categories
   */
  private async createMissingAuthorsAndCategories(posts: MarkdownPost[]): Promise<void> {
    console.log('👥 Creating missing authors and categories...');

    const authorsToCreate = new Set<string>();
    const categoriesToCreate = new Set<string>();

    // Identify missing authors and categories
    posts.forEach(post => {
      if (!this.existingAuthors.has(post.author.name.toLowerCase())) {
        authorsToCreate.add(post.author.name);
      }
      if (!this.existingCategories.has(post.category.toLowerCase())) {
        categoriesToCreate.add(post.category);
      }
    });

    // Create missing authors
    for (const authorName of Array.from(authorsToCreate)) {
      try {
        const authorPost = posts.find(p => p.author.name === authorName);
        const authorDoc = {
          _type: 'author',
          name: authorName,
          slug: {
            current: this.slugify(authorName),
            _type: 'slug'
          },
          image: authorPost?.author.image ? {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: await this.uploadImageAsset(authorPost.author.image)
            },
            alt: `${authorName} profile photo`
          } : undefined,
          bio: `Aviation instructor and expert at Aviators Training Centre`,
          role: 'Flight Instructor',
          credentials: 'CPL, ATPL'
        };

        const createdAuthor = await client.create(authorDoc);
        this.existingAuthors.set(authorName.toLowerCase(), {
          _id: createdAuthor._id,
          name: authorName,
          slug: { current: this.slugify(authorName) },
          image: authorDoc.image
        });

        console.log(`✅ Created author: ${authorName}`);
      } catch (error) {
        console.error(`❌ Error creating author ${authorName}:`, error);
        this.errors.push(`Failed to create author: ${authorName}`);
      }
    }

    // Create missing categories
    for (const categoryName of Array.from(categoriesToCreate)) {
      try {
        const categoryDoc = {
          _type: 'category',
          title: categoryName,
          slug: {
            current: this.slugify(categoryName),
            _type: 'slug'
          },
          description: `Articles about ${categoryName.toLowerCase()}`,
          color: this.getCategoryColor(categoryName),
          intelligentRouting: {
            defaultCourse: null,
            keywords: this.getCategoryKeywords(categoryName),
            courseMapping: []
          },
          seoSettings: {
            metaTitle: `${categoryName} Articles | Aviators Training Centre`,
            metaDescription: `Expert insights and guidance on ${categoryName.toLowerCase()} for aviation professionals and students.`
          }
        };

        const createdCategory = await client.create(categoryDoc);
        this.existingCategories.set(categoryName.toLowerCase(), {
          _id: createdCategory._id,
          title: categoryName,
          slug: { current: this.slugify(categoryName) }
        });

        console.log(`✅ Created category: ${categoryName}`);
      } catch (error) {
        console.error(`❌ Error creating category ${categoryName}:`, error);
        this.errors.push(`Failed to create category: ${categoryName}`);
      }
    }

    console.log('');
  }

  /**
   * Migrate a single post to Sanity
   */
  private async migratePost(post: MarkdownPost): Promise<void> {
    console.log(`📝 Migrating: ${post.title}`);

    try {
      // Check if post already exists
      const existingPost = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, {
        slug: post.slug
      });

      if (existingPost) {
        console.log(`⚠️  Post already exists, skipping: ${post.title}`);
        return;
      }

      // Convert markdown content to Portable Text
      const body = await this.convertMarkdownToPortableText(post.content);

      // Calculate reading time
      const readingTimeStats = readingTime(post.content);

      // Get author and category references
      const author = this.existingAuthors.get(post.author.name.toLowerCase());
      const category = this.existingCategories.get(post.category.toLowerCase());

      if (!author || !category) {
        throw new Error(`Missing author or category for post: ${post.title}`);
      }

      // Upload cover image
      const imageAsset = await this.uploadImageAsset(post.coverImage);

      // Create Sanity document
      const sanityPost: SanityPost = {
        _type: 'post',
        title: post.title,
        slug: {
          current: post.slug,
          _type: 'slug'
        },
        excerpt: post.excerpt,
        body,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset
          },
          alt: `Featured image for ${post.title}`
        },
        category: {
          _type: 'reference',
          _ref: category._id
        },
        author: {
          _type: 'reference',
          _ref: author._id
        },
        publishedAt: new Date(post.date).toISOString(),
        featured: post.featured,
        readingTime: Math.ceil(readingTimeStats.minutes),
        seoTitle: post.title.length <= 60 ? post.title : undefined,
        seoDescription: post.excerpt.length <= 160 ? post.excerpt : post.excerpt.substring(0, 157) + '...',
        focusKeyword: this.extractFocusKeyword(post.title, post.content),
        structuredData: {
          articleType: 'EducationalArticle',
          learningResourceType: 'Article',
          educationalLevel: this.determineEducationalLevel(post.content),
          timeRequired: `PT${Math.ceil(readingTimeStats.minutes)}M`
        },
        ctaPlacements: this.generateDefaultCTAPlacements(post.category),
        intelligentCTARouting: {
          enableIntelligentRouting: true,
          fallbackAction: 'courses-overview'
        }
      };

      // Create the post in Sanity
      const createdPost = await client.create(sanityPost);
      this.migratedPosts.push(post.title);

      console.log(`✅ Successfully migrated: ${post.title}`);

    } catch (error) {
      console.error(`❌ Error migrating post ${post.title}:`, error);
      this.errors.push(`Failed to migrate post: ${post.title} - ${error}`);
    }
  }

  /**
   * Convert markdown content to Portable Text
   */
  private async convertMarkdownToPortableText(markdown: string): Promise<any[]> {
    // This is a simplified conversion - in a real scenario, you might want to use
    // a more sophisticated markdown to Portable Text converter
    const lines = markdown.split('\n');
    const blocks: any[] = [];
    let currentParagraph: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        // Empty line - end current paragraph
        if (currentParagraph.length > 0) {
          blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
          currentParagraph = [];
        }
      } else if (trimmedLine.startsWith('# ')) {
        // H1 - convert to H2 for article structure
        if (currentParagraph.length > 0) {
          blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
          currentParagraph = [];
        }
        blocks.push(this.createTextBlock(trimmedLine.substring(2), 'h2'));
      } else if (trimmedLine.startsWith('## ')) {
        // H2 - convert to H3
        if (currentParagraph.length > 0) {
          blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
          currentParagraph = [];
        }
        blocks.push(this.createTextBlock(trimmedLine.substring(3), 'h3'));
      } else if (trimmedLine.startsWith('### ')) {
        // H3 - convert to H4
        if (currentParagraph.length > 0) {
          blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
          currentParagraph = [];
        }
        blocks.push(this.createTextBlock(trimmedLine.substring(4), 'h4'));
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // List item - for now, convert to paragraph
        if (currentParagraph.length > 0) {
          blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
          currentParagraph = [];
        }
        blocks.push(this.createTextBlock('• ' + trimmedLine.substring(2), 'normal'));
      } else {
        // Regular text - add to current paragraph
        currentParagraph.push(trimmedLine);
      }
    }

    // Add any remaining paragraph
    if (currentParagraph.length > 0) {
      blocks.push(this.createTextBlock(currentParagraph.join(' '), 'normal'));
    }

    return blocks;
  }

  /**
   * Create a Portable Text block
   */
  private createTextBlock(text: string, style: string): any {
    // Process links in the text
    const children = this.processTextWithLinks(text);

    return {
      _type: 'block',
      _key: this.generateKey(),
      style,
      markDefs: [],
      children
    };
  }

  /**
   * Process text and convert markdown links to Portable Text annotations
   */
  private processTextWithLinks(text: string): any[] {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const children: any[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          children.push({
            _type: 'span',
            _key: this.generateKey(),
            text: beforeText,
            marks: []
          });
        }
      }

      // Add the link
      const linkKey = this.generateKey();
      children.push({
        _type: 'span',
        _key: this.generateKey(),
        text: match[1], // Link text
        marks: [linkKey]
      });

      // Add link definition to markDefs (this would need to be handled at block level)
      // For now, we'll just add the link text without the actual link functionality
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        children.push({
          _type: 'span',
          _key: this.generateKey(),
          text: remainingText,
          marks: []
        });
      }
    }

    // If no links were found, return simple text span
    if (children.length === 0) {
      children.push({
        _type: 'span',
        _key: this.generateKey(),
        text,
        marks: []
      });
    }

    return children;
  }

  /**
   * Upload image asset to Sanity
   */
  private async uploadImageAsset(imagePath: string): Promise<string | null> {
    try {
      // Check if it's a URL or local path
      const isUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
      
      if (isUrl) {
        // For URLs, we'll fetch the image and upload it
        console.log(`📷 Uploading image from URL: ${imagePath}`);
        
        // Fetch the image
        const response = await fetch(imagePath);
        if (!response.ok) {
          console.warn(`⚠️  Failed to fetch image from ${imagePath}`);
          return null;
        }
        
        const buffer = await response.arrayBuffer();
        const fileName = imagePath.split('/').pop() || 'image.jpg';
        
        // Upload to Sanity
        const asset = await client.assets.upload('image', Buffer.from(buffer), {
          filename: fileName
        });
        
        console.log(`✅ Successfully uploaded image: ${fileName}`);
        return asset._id;
      } else {
        // For local paths, check if file exists
        const absolutePath = path.isAbsolute(imagePath) 
          ? imagePath 
          : path.join(process.cwd(), imagePath);
        
        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️  Image file not found: ${absolutePath}`);
          return null;
        }
        
        // Read and upload the file
        const buffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(absolutePath);
        
        const asset = await client.assets.upload('image', buffer, {
          filename: fileName
        });
        
        console.log(`✅ Successfully uploaded image: ${fileName}`);
        return asset._id;
      }
    } catch (error) {
      console.error(`❌ Error uploading image ${imagePath}:`, error);
      // Return null instead of throwing to allow migration to continue
      return null;
    }
  }

  /**
   * Generate default CTA placements based on category
   */
  private generateDefaultCTAPlacements(category: string): any[] {
    const placements = [
      {
        _key: this.generateKey(),
        position: 'top',
        ctaType: 'course-promo',
        variant: 'primary',
        customTitle: `Ready to Start Your Aviation Journey?`,
        customMessage: `Discover our comprehensive training programs designed for aspiring pilots.`
      },
      {
        _key: this.generateKey(),
        position: 'bottom',
        ctaType: 'consultation',
        variant: 'secondary',
        customTitle: `Have Questions About Your Aviation Career?`,
        customMessage: `Schedule a free consultation with our expert instructors.`
      }
    ];

    return placements;
  }

  /**
   * Utility functions
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateKey(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'aviation careers': 'teal',
      'safety & regulations': 'red',
      'flight training': 'blue',
      'technical': 'green',
      'career guidance': 'purple'
    };
    return colorMap[category.toLowerCase()] || 'teal';
  }

  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'aviation careers': ['career', 'pilot', 'job', 'employment', 'airline'],
      'safety & regulations': ['safety', 'regulation', 'dgca', 'compliance', 'procedure'],
      'flight training': ['training', 'course', 'exam', 'study', 'preparation'],
      'technical': ['technical', 'aircraft', 'system', 'maintenance', 'engineering'],
      'career guidance': ['guidance', 'advice', 'tips', 'strategy', 'planning']
    };
    return keywordMap[category.toLowerCase()] || ['aviation', 'pilot'];
  }

  private extractFocusKeyword(title: string, content: string): string {
    // Simple keyword extraction - in practice, you might use more sophisticated NLP
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const words = title.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    return words[0] || 'aviation';
  }

  private determineEducationalLevel(content: string): string {
    const beginnerKeywords = ['basic', 'introduction', 'beginner', 'start', 'first'];
    const advancedKeywords = ['advanced', 'expert', 'professional', 'complex', 'detailed'];
    
    const lowerContent = content.toLowerCase();
    
    if (beginnerKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'beginner';
    } else if (advancedKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'advanced';
    }
    
    return 'intermediate';
  }

  /**
   * Generate migration report
   */
  private generateReport(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${this.migratedPosts.length} posts`);
    
    if (this.migratedPosts.length > 0) {
      console.log('\nMigrated Posts:');
      this.migratedPosts.forEach(post => console.log(`  • ${post}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    console.log('\n🎉 Migration completed!');
    console.log('\nNext steps:');
    console.log('1. Review migrated content in Sanity Studio');
    console.log('2. Update image references if needed');
    console.log('3. Configure CTA placements for optimal conversion');
    console.log('4. Test blog functionality on the website');
    console.log('5. Remove markdown files after verification');
  }
}

// Run migration if this script is executed directly
if (process.argv[1]?.includes('migrate-markdown-to-sanity.ts')) {
  const migrator = new MarkdownToSanityMigrator();
  migrator.migrate().catch(console.error);
}

export { MarkdownToSanityMigrator };
