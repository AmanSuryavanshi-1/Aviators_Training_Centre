#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { PRODUCTION_BLOG_POSTS } from '../lib/blog/production-blog-data';

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
});

interface MigrationStats {
  migrated: number;
  errors: string[];
}

class ProductionDataMigrator {
  private stats: MigrationStats = {
    migrated: 0,
    errors: []
  };

  async migrate() {
    console.log('🚀 Starting Production Data Migration...\n');

    try {
      // Step 1: Create default authors and categories if they don't exist
      await this.ensureDefaultData();

      // Step 2: Migrate each post
      for (const post of PRODUCTION_BLOG_POSTS) {
        await this.migratePost(post);
      }

      // Step 3: Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async ensureDefaultData() {
    console.log('👥 Ensuring default authors and categories exist...');

    // Create default author if doesn't exist
    const existingAuthors = await client.fetch(`*[_type == "author"]`);
    if (existingAuthors.length === 0) {
      const defaultAuthor = {
        _type: 'author',
        name: 'Aviators Training Centre',
        slug: {
          current: 'training-centre',
          _type: 'slug'
        },
        bio: 'Expert aviation instructors at Aviators Training Centre',
        role: 'Flight Instructor',
        credentials: 'CPL, ATPL'
      };

      await client.create(defaultAuthor);
      console.log('✅ Created default author');
    }

    // Create default categories if they don't exist
    const categories = [
      'Aviation Careers',
      'Flight Training', 
      'Safety & Regulations',
      'DGCA Exams'
    ];

    for (const categoryName of categories) {
      const existing = await client.fetch(
        `*[_type == "category" && title == $title][0]`,
        { title: categoryName }
      );

      if (!existing) {
        const category = {
          _type: 'category',
          title: categoryName,
          slug: {
            current: this.slugify(categoryName),
            _type: 'slug'
          },
          description: `Articles about ${categoryName.toLowerCase()}`,
          color: this.getCategoryColor(categoryName)
        };

        await client.create(category);
        console.log(`✅ Created category: ${categoryName}`);
      }
    }

    console.log('');
  }

  private async migratePost(post: any) {
    try {
      console.log(`📝 Migrating: ${post.title}`);

      // Check if post already exists
      const existingPost = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug: post.slug.current }
      );

      if (existingPost) {
        console.log(`⚠️  Post already exists, skipping: ${post.title}`);
        return;
      }

      // Get default author and category
      const author = await client.fetch(`*[_type == "author"][0]`);
      const category = await client.fetch(`*[_type == "category"][0]`);

      if (!author || !category) {
        throw new Error('Missing default author or category');
      }

      // Convert content to Portable Text blocks
      const body = this.convertToPortableText(post.content);

      // Create Sanity post
      const sanityPost = {
        _type: 'post',
        title: post.title,
        slug: {
          current: post.slug.current,
          _type: 'slug'
        },
        excerpt: post.excerpt,
        body,
        // Skip image for now - can be added via admin
        category: {
          _type: 'reference',
          _ref: category._id
        },
        author: {
          _type: 'reference',
          _ref: author._id
        },
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
        featured: post.featured || false,
        readingTime: post.readingTime || 5,
        tags: post.tags || [],
        seoSettings: {
          metaTitle: post.seo?.metaTitle || post.title,
          metaDescription: post.seo?.metaDescription || post.excerpt,
          keywords: post.seo?.keywords || post.tags || []
        },
        // Mark as migrated from production data
        origin: 'production-markdown',
        migratedAt: new Date().toISOString()
      };

      await client.create(sanityPost);
      console.log(`✅ Successfully migrated: ${post.title}`);
      this.stats.migrated++;

    } catch (error) {
      console.error(`❌ Error migrating post ${post.title}:`, error);
      this.stats.errors.push(`Failed to migrate post: ${post.title} - ${error}`);
    }
  }

  private convertToPortableText(content: string | undefined): any[] {
    // Handle undefined content gracefully
    if (!content) {
      return [
        {
          _type: 'block',
          _key: this.generateKey(),
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: this.generateKey(),
              text: 'Content coming soon...',
              marks: []
            }
          ]
        }
      ];
    }

    // Split content into paragraphs and convert to Portable Text blocks
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Check if it's a heading
      if (trimmed.startsWith('# ')) {
        return this.createTextBlock(trimmed.substring(2), 'h2');
      } else if (trimmed.startsWith('## ')) {
        return this.createTextBlock(trimmed.substring(3), 'h3');
      } else if (trimmed.startsWith('### ')) {
        return this.createTextBlock(trimmed.substring(4), 'h4');
      } else {
        return this.createTextBlock(trimmed, 'normal');
      }
    });
  }

  private createTextBlock(text: string, style: string): any {
    return {
      _type: 'block',
      _key: this.generateKey(),
      style,
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: this.generateKey(),
          text,
          marks: []
        }
      ]
    };
  }

  private generateReport() {
    console.log('\n==================================================');
    console.log('📊 MIGRATION REPORT');
    console.log('==================================================');
    console.log(`✅ Successfully migrated: ${this.stats.migrated} posts`);
    
    if (this.stats.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\nNext steps:');
    console.log('1. Review migrated content in Sanity Studio');
    console.log('2. Add featured images via Sanity admin');
    console.log('3. Update author assignments if needed');
    console.log('4. Test blog functionality on the website');
  }

  // Utility functions
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
      'flight training': 'blue',
      'safety & regulations': 'red',
      'dgca exams': 'green'
    };
    return colorMap[category.toLowerCase()] || 'teal';
  }
}

// Run migration
const migrator = new ProductionDataMigrator();
migrator.migrate();
