# SEO Library - Aviators Training Centre

A comprehensive SEO system for generating optimized metadata, structured data markup, and managing SEO configuration for the Aviators Training Centre website.

## Features

- **Meta Tag Generation**: Automated, optimized meta tags for all page types
- **Schema Markup**: JSON-LD structured data for various content types
- **Configuration Management**: Centralized SEO settings and configuration
- **Dynamic Sitemap**: Comprehensive sitemap generation for all content
- **Validation**: SEO validation and content analysis utilities
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Quick Start

```typescript
import { generateHomeMetadata, generateOrganizationSchema } from '@/lib/seo';

// Generate optimized metadata for homepage
export const metadata = generateHomeMetadata();

// Generate organization schema
const orgSchema = generateOrganizationSchema();
```

## Schema Types Supported

### 1. Educational Organization
```typescript
const orgSchema = schemaEngine.generateOrganizationSchema();
```

### 2. Course Schema
```typescript
const course: Course = {
  id: '1',
  name: 'CPL Ground School',
  description: 'Comprehensive pilot training',
  // ... other properties
};

const courseSchema = schemaEngine.generateCourseSchema(course);
```

### 3. FAQ Page Schema
```typescript
const faqs: FAQ[] = [
  {
    id: '1',
    question: 'What is CPL training?',
    answer: 'Commercial Pilot License training...',
    // ... other properties
  }
];

const faqSchema = schemaEngine.generateFAQSchema(faqs);
```

### 4. Article Schema
```typescript
const blogPost: BlogPost = {
  title: 'How to Become a Pilot',
  author: { name: 'Captain Smith', title: 'Instructor' },
  // ... other properties
};

const articleSchema = schemaEngine.generateArticleSchema(blogPost);
```

### 5. Breadcrumb Schema
```typescript
const breadcrumbSchema = schemaEngine.generateBreadcrumbSchema('/courses/cpl');
```

### 6. Video Schema
```typescript
const video: VideoTestimonial = {
  title: 'Student Success Story',
  description: 'Graduate testimonial',
  // ... other properties
};

const videoSchema = schemaEngine.generateVideoSchema(video);
```

### 7. Local Business Schema
```typescript
const locationData = {
  name: 'Aviators Training Centre - Delhi',
  address: { /* address object */ },
  coordinates: { lat: 28.6139, lng: 77.2090 },
  // ... other properties
};

const localSchema = schemaEngine.generateLocalBusinessSchema(locationData);
```

## Validation

The schema validator checks for:
- Required fields
- Recommended fields
- Google-specific requirements
- Data format validation
- URL validation
- Date format validation

```typescript
import { schemaValidator } from '@/lib/seo';

const validation = schemaValidator.validateSchema(schema);

if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}

// Generate validation report
const report = schemaValidator.generateValidationReport([validation]);
console.log(report);
```

## Configuration

### Basic Configuration
```typescript
import { seoConfig, getSEOConfig } from '@/lib/seo';

// Use default configuration
console.log(seoConfig.site.name);

// Custom configuration
const customConfig = getSEOConfig({
  site: {
    name: 'Custom Site Name'
  }
});
```

### Location-Specific Configuration
```typescript
import { getLocationConfig } from '@/lib/seo';

const delhiConfig = getLocationConfig('Delhi', 'Delhi');
console.log(delhiConfig.keywords); // ['pilot training Delhi', ...]
```

### Course-Specific Configuration
```typescript
import { getCourseConfig } from '@/lib/seo';

const cplConfig = getCourseConfig('CPL');
console.log(cplConfig.title); // 'CPL Ground School - Commercial Pilot License Training'
```

## Utilities

### SEO Optimization
```typescript
import { 
  optimizeTitle, 
  optimizeMetaDescription, 
  calculateSEOScore,
  generateSlug 
} from '@/lib/seo';

// Optimize title (50-60 characters)
const title = optimizeTitle('Long Course Title', 'Site Name');

// Optimize meta description (150-160 characters)
const description = optimizeMetaDescription('Course description...', 'target keyword');

// Generate SEO-friendly slug
const slug = generateSlug('Course Name With Spaces');

// Calculate SEO score
const score = calculateSEOScore(metadata, content);
```

### Keyword Analysis
```typescript
import { 
  extractKeywords, 
  calculateKeywordDensity,
  analyzeKeywordCompetition 
} from '@/lib/seo';

// Extract keywords from content
const keywords = extractKeywords(content, 10);

// Calculate keyword density
const density = calculateKeywordDensity(content, 'pilot training');

// Analyze keyword competition
const analysis = analyzeKeywordCompetition(keywordRankings);
```

### Content Optimization
```typescript
import { 
  calculateReadingTime,
  cleanHtmlContent,
  generateCanonicalUrl 
} from '@/lib/seo';

// Calculate reading time
const readingTime = calculateReadingTime(content);

// Clean HTML content
const cleanContent = cleanHtmlContent(htmlContent);

// Generate canonical URL
const canonical = generateCanonicalUrl('/courses/cpl', 'https://example.com');
```

## Advanced Usage

### Multiple Schemas
```typescript
const schemas = [
  schemaEngine.generateOrganizationSchema(),
  schemaEngine.generateCourseSchema(course),
  schemaEngine.generateBreadcrumbSchema('/courses/cpl')
];

// Validate all schemas
const validations = schemaValidator.validateMultipleSchemas(schemas);

// Generate combined JSON-LD
const jsonLD = schemaEngine.generateJSONLD(schemas);
```

### Custom Schema Engine
```typescript
import { SchemaEngine } from '@/lib/seo';

const customEngine = new SchemaEngine({
  name: 'Custom Organization',
  url: 'https://custom.com'
});

const customOrgSchema = customEngine.generateOrganizationSchema();
```

## Testing

The library includes comprehensive tests:

```bash
# Run all SEO tests
npm test src/lib/seo

# Run specific test files
npm test src/lib/seo/__tests__/schema-engine.test.ts
npm test src/lib/seo/__tests__/integration.test.ts
```

## Best Practices

### 1. Always Validate Schemas
```typescript
const schema = schemaEngine.generateCourseSchema(course);
const validation = schemaValidator.validateSchema(schema);

if (!validation.isValid) {
  console.error('Schema validation failed:', validation.errors);
  // Handle errors appropriately
}
```

### 2. Use Configuration
```typescript
// Don't hardcode values
const schema = schemaEngine.generateOrganizationSchema();

// Use configuration instead
import { seoConfig } from '@/lib/seo';
// Configuration values are automatically used in schema generation
```

### 3. Optimize Meta Data
```typescript
// Always optimize titles and descriptions
const title = optimizeTitle(rawTitle, seoConfig.site.name);
const description = optimizeMetaDescription(rawDescription, targetKeyword);
```

### 4. Handle Errors Gracefully
```typescript
try {
  const schema = schemaEngine.generateCourseSchema(course);
  const jsonLD = schemaEngine.generateJSONLD(schema);
  return jsonLD;
} catch (error) {
  console.error('Schema generation failed:', error);
  return null; // Return fallback or null
}
```

## Environment Variables

The SEO system uses these environment variables:

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Site URL (for canonical URLs)
NEXT_PUBLIC_SITE_URL=https://aviatorstrainingcentre.in
```

## Integration with Next.js

### In Page Components
```typescript
import { schemaEngine } from '@/lib/seo';

export default function CoursePage({ course }) {
  const courseSchema = schemaEngine.generateCourseSchema(course);
  const jsonLD = schemaEngine.generateJSONLD(courseSchema);

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
        />
      </Head>
      {/* Page content */}
    </>
  );
}
```

### In API Routes
```typescript
import { schemaEngine } from '@/lib/seo';

export default function handler(req, res) {
  const schema = schemaEngine.generateOrganizationSchema();
  res.json(schema);
}
```

## Performance Considerations

1. **Caching**: Cache generated schemas when possible
2. **Validation**: Only validate in development/testing
3. **Minification**: Use minified JSON-LD in production
4. **Lazy Loading**: Generate schemas only when needed

## Troubleshooting

### Common Issues

1. **Invalid Schema**: Check required fields and data types
2. **Validation Errors**: Review Google's structured data guidelines
3. **Performance**: Cache schemas and validate only in development
4. **Type Errors**: Ensure all required properties are provided

### Debug Mode
```typescript
// Enable detailed validation
const validation = schemaValidator.validateSchema(schema, url);
console.log('Validation Report:', validation);

// Generate detailed report
const report = schemaValidator.generateValidationReport([validation]);
console.log(report);
```

## Contributing

When adding new schema types:

1. Add the schema interface to `schema-engine.ts`
2. Implement the generation method
3. Add validation rules to `schema-validator.ts`
4. Write comprehensive tests
5. Update documentation

## License

This SEO system is part of the Aviators Training Centre project.