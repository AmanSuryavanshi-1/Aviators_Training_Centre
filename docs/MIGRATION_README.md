# Markdown to Sanity CMS Migration Guide

This comprehensive guide covers the automated migration process from Markdown blog posts to Sanity CMS, designed specifically for the Aviators Training Centre blog system.

## Overview

The migration script (`scripts/migrate-markdown-to-sanity.ts`) provides a seamless way to transfer existing Markdown blog posts to Sanity CMS while preserving all content, metadata, and structure. This tool is essential for transitioning from file-based content management to a professional headless CMS.

## Features

### 🔄 **Content Preservation**
- **Metadata Retention**: All frontmatter data is preserved and mapped to Sanity fields
- **Formatting Maintenance**: Markdown formatting is converted to Portable Text
- **Structure Integrity**: Heading hierarchy and content organization maintained
- **Link Preservation**: Internal and external links are properly converted

### 🎯 **Intelligent Processing**
- **SEO Optimization**: Automatic generation of SEO-friendly titles and descriptions
- **Keyword Extraction**: Focus keywords extracted from content for better search visibility
- **Educational Level Detection**: Content difficulty automatically determined
- **Reading Time Calculation**: Accurate reading time estimation based on content length

### 🏗️ **Asset Management**
- **Image Handling**: Automatic image asset upload and reference management
- **Alt Text Preservation**: Image alt text and captions maintained
- **CDN Integration**: Images optimized and delivered via Sanity's CDN
- **Responsive Optimization**: Multiple image sizes generated for responsive design

### 👥 **Author & Category Management**
- **Automatic Creation**: Missing authors and categories created automatically
- **Profile Enhancement**: Author profiles enriched with aviation credentials
- **Category Intelligence**: Smart category mapping with color coding and keywords
- **SEO Configuration**: Category-specific SEO settings applied

### 📊 **CTA Integration**
- **Strategic Placement**: Default CTA placements added to maximize conversions
- **Course Routing**: Intelligent course recommendations based on content analysis
- **Customizable Messaging**: Category-specific CTA messaging and button text
- **Analytics Ready**: CTA tracking and performance monitoring enabled

## Prerequisites

### 1. Environment Setup

Ensure you have the required environment variables configured:

```bash
# Required: Sanity API Token with write permissions
export SANITY_API_TOKEN=your_sanity_write_token

# Optional: Custom configuration
export ***REMOVED***
export NEXT_PUBLIC_SANITY_DATASET=production
```

### 2. Content Structure

Organize your Markdown files in the expected directory structure:

```
content/blog/
├── aviation-career-guide.md
├── flight-training-basics.md
├── safety-regulations-update.md
└── technical-knowledge-overview.md
```

### 3. Markdown Format

Each Markdown file should include proper frontmatter:

```markdown
---
title: "Complete Guide to Aviation Careers in 2024"
date: "2024-01-15"
excerpt: "Comprehensive guide covering all aspects of starting and advancing your aviation career, from training requirements to job opportunities."
category: "Aviation Careers"
coverImage: "/images/blog/aviation-careers-2024.jpg"
author:
  name: "Captain Sarah Johnson"
  image: "/images/authors/sarah-johnson.jpg"
featured: true
---

# Introduction to Aviation Careers

Your blog content goes here...

## Training Requirements

More content...
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install required packages
npm install gray-matter reading-time @portabletext/react

# Or using bun
bun install gray-matter reading-time @portabletext/react
```

### 2. Verify Sanity Configuration

Ensure your Sanity client is properly configured:

```typescript
// lib/sanity/client.ts
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: "3u4fa9kl",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
```

### 3. Prepare Content Directory

Create the content directory structure:

```bash
mkdir -p content/blog
# Place your Markdown files in content/blog/
```

## Usage

### Basic Migration

Run the migration script with default settings:

```bash
npx tsx scripts/migrate-markdown-to-sanity.ts
```

### Advanced Usage

For custom configurations, you can modify the script or use environment variables:

```bash
# Set custom batch size
export MIGRATION_BATCH_SIZE=10

# Enable debug mode
export MIGRATION_DEBUG=true

# Run migration
npx tsx scripts/migrate-markdown-to-sanity.ts
```

## Migration Process

### Phase 1: Initialization

```
🚀 Starting Markdown to Sanity Migration...

📋 Loading existing authors and categories...
✅ Loaded 2 authors and 3 categories

📄 Found 5 markdown posts to migrate
```

The script begins by:
1. Validating the Sanity API token
2. Loading existing authors and categories from Sanity
3. Scanning the content directory for Markdown files
4. Parsing frontmatter and content from each file

### Phase 2: Content Preparation

```
👥 Creating missing authors and categories...
✅ Created author: Captain Jane Doe
✅ Created category: Safety & Regulations
```

For each unique author and category found in the Markdown files:
1. Check if they already exist in Sanity
2. Create missing authors with default aviation credentials
3. Create missing categories with intelligent routing configuration
4. Apply appropriate color coding and SEO settings

### Phase 3: Content Migration

```
📝 Migrating: Complete Guide to CPL Training
✅ Successfully migrated: Complete Guide to CPL Training

📝 Migrating: Aviation Career Opportunities
✅ Successfully migrated: Aviation Career Opportunities
```

For each blog post:
1. Convert Markdown content to Portable Text format
2. Upload and reference cover images
3. Generate SEO metadata and structured data
4. Create intelligent CTA placements
5. Save the complete document to Sanity

### Phase 4: Completion Report

```
==================================================
📊 MIGRATION REPORT
==================================================
✅ Successfully migrated: 5 posts

Migrated Posts:
  • Complete Guide to CPL Training
  • Aviation Career Opportunities
  • Safety Regulations Update
  • Technical Training Overview
  • Career Guidance for Pilots

🎉 Migration completed!
```

## Content Transformation

### Markdown to Portable Text

The migration script converts Markdown elements to Portable Text blocks:

| Markdown | Portable Text |
|----------|---------------|
| `# Heading` | H2 block (adjusted for article structure) |
| `## Heading` | H3 block |
| `### Heading` | H4 block |
| `**bold**` | Strong mark |
| `*italic*` | Emphasis mark |
| `[link](url)` | Link annotation |
| `![alt](img)` | Image block with asset reference |
| `- item` | Bullet list (converted to paragraph with bullet) |
| `> quote` | Blockquote block |

### SEO Enhancement

Automatic SEO optimization includes:

```typescript
// Generated SEO fields
seoTitle: post.title.length <= 60 ? post.title : undefined,
seoDescription: post.excerpt.length <= 160 ? post.excerpt : post.excerpt.substring(0, 157) + '...',
focusKeyword: extractFocusKeyword(post.title, post.content),
structuredData: {
  articleType: 'EducationalArticle',
  learningResourceType: 'Article',
  educationalLevel: determineEducationalLevel(post.content),
  timeRequired: `PT${Math.ceil(readingTimeStats.minutes)}M`
}
```

### CTA Integration

Default CTA placements are added based on content category:

```typescript
// Example CTA configuration
ctaPlacements: [
  {
    position: 'top',
    ctaType: 'course-promo',
    variant: 'primary',
    customTitle: 'Ready to Start Your Aviation Journey?',
    customMessage: 'Discover our comprehensive training programs designed for aspiring pilots.'
  },
  {
    position: 'bottom',
    ctaType: 'consultation',
    variant: 'secondary',
    customTitle: 'Have Questions About Your Aviation Career?',
    customMessage: 'Schedule a free consultation with our expert instructors.'
  }
]
```

## Error Handling

### Common Issues and Solutions

#### 1. Missing API Token
```
❌ Migration failed: SANITY_API_TOKEN environment variable is required for migration
```
**Solution**: Set the Sanity API token with write permissions:
```bash
export SANITY_API_TOKEN=your_token_here
```

#### 2. Invalid Markdown Format
```
❌ Error migrating post: Missing required frontmatter fields
```
**Solution**: Ensure all Markdown files have proper frontmatter with required fields:
- `title`
- `date`
- `excerpt`
- `category`
- `author.name`

#### 3. Image Upload Failures
```
❌ Error uploading image: Image not found at path
```
**Solution**: 
- Verify image paths in frontmatter are correct
- Ensure images exist in the specified locations
- Check image file permissions

#### 4. Duplicate Content
```
⚠️ Post already exists, skipping: Your Post Title
```
**Solution**: This is normal behavior. The script skips existing posts to prevent duplicates.

### Recovery Mechanisms

The migration script includes several recovery mechanisms:

1. **Partial Migration**: Continues processing even if individual posts fail
2. **Error Logging**: Detailed error messages for troubleshooting
3. **Rollback Prevention**: Checks for existing content before creating duplicates
4. **Graceful Degradation**: Uses fallback values for missing optional fields

## Post-Migration Tasks

### 1. Content Review

After migration, review the content in Sanity Studio:

1. **Navigate to Sanity Studio**: `http://localhost:3333` or your deployed URL
2. **Check Blog Posts**: Verify all posts were migrated correctly
3. **Review Formatting**: Ensure Portable Text rendering is correct
4. **Validate Images**: Confirm all images are properly uploaded and displayed

### 2. SEO Validation

Verify SEO optimization:

1. **Meta Tags**: Check generated SEO titles and descriptions
2. **Structured Data**: Validate schema.org markup
3. **Focus Keywords**: Review extracted keywords for accuracy
4. **Open Graph**: Test social media sharing previews

### 3. CTA Configuration

Optimize call-to-action placements:

1. **Review Placements**: Check CTA positions and messaging
2. **Course Routing**: Verify intelligent course recommendations
3. **Conversion Tracking**: Set up analytics for CTA performance
4. **A/B Testing**: Configure variant testing for optimization

### 4. Content Cleanup

After successful migration:

1. **Backup Original Files**: Archive original Markdown files
2. **Update Links**: Update any internal links to use new blog URLs
3. **Redirect Setup**: Configure redirects from old URLs if necessary
4. **Search Index**: Update search engine indexing

## Customization

### Custom Category Mapping

Modify category colors and keywords:

```typescript
private getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'aviation careers': 'teal',
    'safety & regulations': 'red',
    'flight training': 'blue',
    'technical knowledge': 'green',
    'industry news': 'purple',
    // Add your custom mappings
  };
  return colorMap[category.toLowerCase()] || 'teal';
}

private getCategoryKeywords(category: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'aviation careers': ['career', 'pilot', 'job', 'employment', 'airline'],
    'safety & regulations': ['safety', 'regulation', 'dgca', 'compliance'],
    'flight training': ['training', 'course', 'exam', 'study', 'cpl', 'atpl'],
    // Add your custom keywords
  };
  return keywordMap[category.toLowerCase()] || ['aviation', 'pilot'];
}
```

### Custom Author Profiles

Enhance author creation with specific credentials:

```typescript
const authorDoc = {
  _type: 'author',
  name: authorName,
  slug: { current: this.slugify(authorName), _type: 'slug' },
  bio: `Experienced aviation instructor at Aviators Training Centre`,
  role: 'Chief Flight Instructor', // Customize based on author
  credentials: 'ATPL, Type Rating A320/A330', // Add specific credentials
  // Add more custom fields as needed
};
```

### Custom CTA Templates

Create category-specific CTA templates:

```typescript
private generateCategorySpecificCTA(category: string): any[] {
  const ctaTemplates = {
    'aviation careers': {
      title: 'Ready to Launch Your Aviation Career?',
      message: 'Explore our career-focused training programs.',
      buttonText: 'View Career Courses'
    },
    'flight training': {
      title: 'Start Your Flight Training Journey',
      message: 'Join our comprehensive flight training programs.',
      buttonText: 'Enroll Now'
    },
    // Add more templates
  };
  
  const template = ctaTemplates[category.toLowerCase()] || ctaTemplates.default;
  return this.createCTAFromTemplate(template);
}
```

## Monitoring and Analytics

### Migration Metrics

Track migration success with these metrics:

- **Success Rate**: Percentage of posts successfully migrated
- **Error Rate**: Number of failed migrations and reasons
- **Content Quality**: SEO score improvements after migration
- **Performance Impact**: Site speed before and after migration

### Content Performance

Monitor post-migration content performance:

- **Page Views**: Track blog post engagement
- **SEO Rankings**: Monitor search engine visibility
- **CTA Conversions**: Measure call-to-action effectiveness
- **User Engagement**: Analyze time on page and bounce rates

## Troubleshooting

### Debug Mode

Enable debug mode for detailed logging:

```bash
export MIGRATION_DEBUG=true
npx tsx scripts/migrate-markdown-to-sanity.ts
```

### Manual Verification

Verify migration results manually:

```bash
# Check Sanity content via API
curl -H "Authorization: Bearer $SANITY_API_TOKEN" \
  "https://3u4fa9kl.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=='post']"
```

### Common Solutions

1. **Network Issues**: Retry migration with exponential backoff
2. **Rate Limiting**: Implement delays between API calls
3. **Memory Issues**: Process files in smaller batches
4. **Permission Errors**: Verify API token has write permissions

## Best Practices

### Before Migration

1. **Backup Content**: Create backups of all Markdown files
2. **Test Environment**: Run migration in development first
3. **Content Audit**: Review and clean up content before migration
4. **SEO Preparation**: Optimize titles and descriptions

### During Migration

1. **Monitor Progress**: Watch for errors and warnings
2. **Network Stability**: Ensure stable internet connection
3. **Resource Management**: Monitor system resources
4. **Incremental Approach**: Migrate in small batches if needed

### After Migration

1. **Quality Assurance**: Thoroughly test migrated content
2. **Performance Testing**: Verify site performance
3. **SEO Validation**: Check search engine optimization
4. **User Testing**: Gather feedback on content presentation

## Support

For migration support:

1. **Check Logs**: Review detailed error messages
2. **Verify Configuration**: Ensure all prerequisites are met
3. **Test Connectivity**: Verify Sanity API access
4. **Contact Support**: Reach out with specific error details

---

**Note**: This migration tool is specifically designed for the Aviators Training Centre blog system. Customize the script according to your specific content structure and requirements.