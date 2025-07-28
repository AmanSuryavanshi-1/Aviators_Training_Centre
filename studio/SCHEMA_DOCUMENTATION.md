# Enhanced Sanity CMS Schema Documentation

## Overview

The enhanced Sanity CMS schema for Aviators Training Centre blog includes advanced features for SEO optimization, intelligent CTA routing, and comprehensive content management.

## Schema Types

### 1. Blog Post (`post`)

Enhanced blog post schema with organized field groups:

#### Content Group
- **Title**: SEO-optimized title (10-80 characters)
- **Slug**: Auto-generated from title
- **Excerpt**: Meta description and listing summary (120-160 characters)
- **Featured Image**: With alt text and hotspot
- **Category**: Reference to blog category
- **Author**: Reference to author
- **Body**: Rich text with enhanced formatting options

#### SEO & Meta Group
- **SEO Title**: Custom title for search engines (max 60 chars)
- **SEO Description**: Custom meta description (max 160 chars)
- **Focus Keyword**: Primary SEO keyword
- **Additional Keywords**: Array of secondary keywords
- **Canonical URL**: Override canonical URL if needed
- **Open Graph Image**: Custom social sharing image
- **Structured Data**: Schema.org markup configuration
  - Article Type (Educational, How-To, News, Technical)
  - Learning Resource Type
  - Educational Level
  - Time Required

#### CTA & Conversion Group
- **CTA Placements**: Array of strategic CTA configurations
  - Position (top, middle, bottom, sidebar)
  - CTA Type (course-promo, consultation, newsletter, download)
  - Target Course (reference to course)
  - Custom messaging and button text
  - Visual variant (primary, secondary, outline, minimal)
- **Intelligent CTA Routing**: Automated course recommendation
  - Enable/disable intelligent routing
  - Primary course target override
  - Fallback action configuration

#### Settings Group
- **Published Date**: Publication timestamp
- **Featured Post**: Hero carousel inclusion
- **Reading Time**: Estimated reading time in minutes

### 2. Course (`course`)

New schema for course management and CTA routing:

#### Basic Information
- **Course Name**: Full course title
- **Slug**: URL-friendly identifier
- **Category**: Course type (technical-general, cpl-ground-school, etc.)
- **Description**: Detailed course description
- **Short Description**: Brief description for CTAs (max 100 chars)
- **Target URL**: Where CTAs should redirect

#### Course Details
- **Price**: Course fee in INR
- **Duration**: Course length (e.g., "6 months")
- **Level**: Difficulty level (beginner to professional)
- **Keywords**: Array for intelligent routing
- **Active**: Enable/disable course in CTA selections

#### CTA Settings
- **Primary/Secondary Button Text**: Customizable button labels
- **CTA Title Template**: Title with {courseName} placeholder
- **CTA Message Template**: Description with {courseName} placeholder

### 3. Enhanced Category (`category`)

Extended category schema with intelligent routing:

#### Basic Information
- **Title**: Category name
- **Slug**: URL identifier
- **Description**: Category description
- **Color**: Visual theme color

#### Intelligent Routing
- **Default Course**: Fallback course for this category
- **Keywords**: Category identification keywords
- **Course Mapping Rules**: Keyword-to-course mappings
  - Keywords array
  - Target course reference

#### SEO Settings
- **Meta Title Template**: Category page title template
- **Meta Description Template**: Category page description template

### 4. Author (`author`)

Enhanced author schema:

- **Name**: Author full name
- **Slug**: URL identifier
- **Profile Image**: Author photo with alt text
- **Biography**: Author background
- **Role**: Professional role (e.g., "Airline Pilot")
- **Credentials**: Aviation credentials (e.g., "CPL, ATPL")

## Intelligent CTA Routing Logic

The system automatically recommends courses based on content analysis:

### Keyword Matching
1. **Technical General**: "dgca", "ground school", "aviation theory"
2. **Technical Specific**: "aircraft systems", "navigation", "avionics"
3. **CPL Ground School**: "commercial pilot", "cpl", "career"
4. **ATPL Ground School**: "airline", "atpl", "captain"
5. **Type Rating**: "type rating", "aircraft type", "specific aircraft"

### Fallback Strategy
1. Check blog category's default course
2. Use category-specific course mapping rules
3. Fall back to courses overview page
4. Ultimate fallback to contact page

## Studio Interface Features

### Organized Navigation
- **Blog Posts**: All posts, featured posts, drafts, posts by category
- **Content Organization**: Categories and authors
- **Course Management**: All courses, active courses, courses by category

### Enhanced User Experience
- **Field Groups**: Organized tabs for different content aspects
- **Conditional Fields**: Show/hide fields based on selections
- **Rich Previews**: Visual previews for posts and courses
- **Validation Rules**: Ensure content quality and SEO compliance

### Custom Actions
- **Preview Blog Post**: Direct link to live blog post preview
- **SEO Analysis**: Built-in SEO optimization guidance

## Usage Guidelines

### Creating Blog Posts

1. **Content Tab**: Write your main content
   - Use descriptive, SEO-friendly titles
   - Write compelling excerpts that work as meta descriptions
   - Select appropriate categories and authors

2. **SEO & Meta Tab**: Optimize for search engines
   - Add custom SEO title if different from main title
   - Write targeted meta descriptions
   - Include focus keyword and related keywords
   - Configure structured data for rich snippets

3. **CTA & Conversion Tab**: Maximize conversions
   - Add strategic CTA placements throughout the article
   - Choose appropriate CTA types for your content
   - Enable intelligent routing for automatic course recommendations
   - Customize messaging for better conversion rates

4. **Settings Tab**: Configure publication settings
   - Set publication date
   - Mark as featured for hero carousel inclusion
   - Estimate reading time for user experience

### Managing Courses

1. **Create Course Entries**: Add all available courses
   - Use descriptive names and clear descriptions
   - Set appropriate categories and keywords
   - Configure target URLs for redirects

2. **Customize CTA Settings**: Tailor promotional messaging
   - Write compelling CTA titles and messages
   - Use {courseName} placeholder for dynamic content
   - Set appropriate button text for different contexts

3. **Enable Intelligent Routing**: Configure automatic recommendations
   - Add relevant keywords for content matching
   - Test keyword matching with sample blog content
   - Monitor conversion rates and adjust keywords

### Category Management

1. **Set Up Intelligent Routing**: Configure automatic course recommendations
   - Define default courses for each category
   - Create keyword-to-course mapping rules
   - Test routing logic with sample content

2. **SEO Optimization**: Improve category page performance
   - Write SEO-friendly meta title templates
   - Create compelling meta description templates
   - Choose appropriate visual colors for branding

## Best Practices

### SEO Optimization
- Keep titles under 60 characters
- Write meta descriptions between 120-160 characters
- Use focus keywords naturally in content
- Add structured data for rich snippets
- Optimize images with descriptive alt text

### CTA Strategy
- Place CTAs at strategic points (beginning, middle, end)
- Use action-oriented button text
- Match CTA messaging to content topic
- Test different CTA variants for optimization
- Monitor conversion rates and adjust accordingly

### Content Organization
- Use consistent categorization
- Tag content with relevant keywords
- Maintain author profiles with credentials
- Keep course information up-to-date
- Regular review and update of routing rules

## Migration from Existing Content

The enhanced schema is backward compatible with existing blog posts. Existing posts will:
- Retain all current content and metadata
- Gain access to new SEO and CTA features
- Work with intelligent routing system
- Benefit from enhanced studio interface

New fields are optional, so existing content continues to function while new posts can take advantage of enhanced features.

## Testing and Validation

### Schema Validation
- All required fields have appropriate validation rules
- Character limits enforce SEO best practices
- Reference fields ensure data integrity
- Conditional fields prevent configuration errors

### Content Testing
- Preview functionality for blog posts
- CTA routing logic testing
- SEO meta tag validation
- Structured data markup verification

### Performance Monitoring
- Track CTA conversion rates
- Monitor SEO performance improvements
- Analyze course enrollment attribution
- Measure content engagement metrics

This enhanced schema provides a solid foundation for the blog system while maintaining flexibility for future enhancements and optimizations.