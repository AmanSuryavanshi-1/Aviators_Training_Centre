# PortableTextRenderer Component Specification

## Overview

The `PortableTextRenderer` is a custom React component built on top of `@portabletext/react` that provides advanced content rendering capabilities for the Aviators Training Centre blog system. This component transforms Sanity's PortableText blocks into rich, accessible, and performant HTML content with enhanced styling and functionality.

## Component Architecture

### File Location
```
components/blog/PortableTextRenderer.tsx
```

### Dependencies
```typescript
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import Image from 'next/image';
import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/blog/utils';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
```

## Interface Definition

```typescript
interface PortableTextRendererProps {
  content: PortableTextBlock[];
  className?: string;
}
```

## Component Features

### 1. Image Rendering System

#### Specifications
- **Format**: WebP optimization for modern browsers
- **Dimensions**: 800x450px (16:9 aspect ratio)
- **Quality**: 85% for optimal balance of quality and performance
- **Loading**: Lazy loading with proper `sizes` attribute
- **Responsive**: Full-width on mobile, constrained on desktop
- **Accessibility**: Required alt text with fallback support

#### Implementation
```typescript
image: ({ value }: { value: { asset: SanityImageSource; alt?: string; caption?: string } }) => {
  if (!value?.asset) return null;
  
  return (
    <figure className="my-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={getOptimizedImageUrl({ asset: value.asset }, { 
            width: 800, 
            height: 450, 
            quality: 85,
            format: 'webp'
          })}
          alt={value.alt || 'Blog image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
          loading="lazy"
        />
      </div>
      {value.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
```

### 2. Code Block Enhancement

#### Features
- Syntax highlighting support
- Horizontal scrolling for long code lines
- Language detection and display
- Consistent styling with design system
- Proper code formatting preservation

#### Implementation
```typescript
code: ({ value }: { value: { code: string; language?: string } }) => (
  <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4">
    <code className={`language-${value.language || 'text'}`}>
      {value.code}
    </code>
  </pre>
)
```

### 3. Interactive Callout System

#### Callout Types
- **Info**: Blue theme for informational content
- **Warning**: Yellow theme for cautions and warnings
- **Success**: Green theme for positive messages
- **Error**: Red theme for errors and critical information

#### Dark Mode Support
All callout types include proper dark mode variants with WCAG compliant contrast ratios.

#### Implementation
```typescript
callout: ({ value }: { value: { text: string; type: 'info' | 'warning' | 'success' | 'error' } }) => {
  const typeStyles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
    success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
    error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
  };

  return (
    <div className={`my-6 rounded-lg border-l-4 p-4 ${typeStyles[value.type || 'info']}`}>
      <p className="m-0">{value.text}</p>
    </div>
  );
}
```

### 4. Smart Link Processing

#### External Link Detection
- Automatically detects external links (non-aviatorstrainingcentre.com domains)
- Applies security attributes (`noopener`, `noreferrer`)
- Opens in new tab for external links

#### Internal Link Optimization
- Uses Next.js `Link` component for internal links
- Maintains consistent styling across link types
- Proper hover states and transitions

#### Implementation
```typescript
link: ({ children, value }: { children: React.ReactNode; value: { href: string; blank?: boolean } }) => {
  const isExternal = value.href.startsWith('http') && !value.href.includes('aviatorstrainingcentre.com');
  
  if (isExternal) {
    return (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={value.href}
      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
    >
      {children}
    </Link>
  );
}
```

### 5. Typography System

#### Heading Hierarchy
- **H1**: `text-3xl font-bold` with `mt-12 mb-6` spacing
- **H2**: `text-2xl font-semibold` with `mt-10 mb-4` spacing
- **H3**: `text-xl font-semibold` with `mt-8 mb-3` spacing
- **H4**: `text-lg font-semibold` with `mt-6 mb-2` spacing

#### Special Handling
- First heading removes top margin (`first:mt-0`)
- Consistent color usage with design system tokens
- Proper semantic HTML structure

#### Paragraph Styling
```typescript
normal: ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
    {children}
  </p>
)
```

### 6. List Formatting

#### Bullet Lists
- Disc-style bullets with proper indentation
- Consistent spacing between items
- Proper nesting support

#### Numbered Lists
- Decimal numbering with proper indentation
- Consistent spacing and alignment
- Semantic HTML structure

#### Implementation
```typescript
list: {
  bullet: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
      {children}
    </ul>
  ),
  number: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-2 my-4 text-muted-foreground">
      {children}
    </ol>
  ),
}
```

### 7. Inline Text Elements

#### Strong/Bold Text
```typescript
strong: ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
)
```

#### Emphasis/Italic Text
```typescript
em: ({ children }: { children: React.ReactNode }) => (
  <em className="italic">{children}</em>
)
```

#### Inline Code
```typescript
code: ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
    {children}
  </code>
)
```

#### Text Highlighting
```typescript
highlight: ({ children }: { children: React.ReactNode }) => (
  <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
    {children}
  </mark>
)
```

### 8. Blockquote Styling

```typescript
blockquote: ({ children }: { children: React.ReactNode }) => (
  <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground">
    {children}
  </blockquote>
)
```

## Error Handling and Fallbacks

### Content Validation
```typescript
if (!content || !Array.isArray(content) || content.length === 0) {
  return (
    <div className={`text-muted-foreground italic ${className}`}>
      No content available.
    </div>
  );
}
```

### Image Error Handling
- Graceful fallback when image assets are missing
- Proper alt text handling with fallback values
- Null checks for asset references

### Type Safety
- Full TypeScript implementation
- Proper interface definitions for all value types
- Runtime type checking where necessary

## Accessibility Features

### Semantic HTML
- Proper use of `<figure>` and `<figcaption>` for images
- Semantic heading hierarchy (H1-H4)
- Proper list structures (`<ul>`, `<ol>`, `<li>`)
- Blockquote elements for quoted content

### Screen Reader Support
- Descriptive alt text for all images
- Proper ARIA labels where needed
- Semantic markup for better screen reader navigation

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper focus management for links
- Tab order follows logical content flow

### Color Contrast
- WCAG AA compliant color combinations
- Proper contrast ratios in both light and dark modes
- Consistent use of design system color tokens

## Performance Optimizations

### Image Optimization
- WebP format for modern browsers
- Lazy loading with proper `loading="lazy"` attribute
- Responsive images with appropriate `sizes` attribute
- Optimized dimensions (800x450px) for blog content

### Bundle Optimization
- Tree-shaking compatible component structure
- Minimal dependencies and imports
- Efficient React rendering patterns

### Rendering Performance
- Minimal re-renders through proper component structure
- Efficient prop passing and component composition
- Proper use of React keys for list items

## Usage Examples

### Basic Usage
```typescript
import PortableTextRenderer from '@/components/blog/PortableTextRenderer';

function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <PortableTextRenderer content={post.body} />
    </article>
  );
}
```

### With Custom Styling
```typescript
<PortableTextRenderer 
  content={post.body} 
  className="custom-blog-content" 
/>
```

## Integration with Sanity CMS

### Required Schema Fields
The component expects PortableText blocks with the following structure:

```typescript
// In Sanity schema
{
  name: 'body',
  title: 'Content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Highlight', value: 'highlight'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [{title: 'URL', name: 'href', type: 'url'}],
          },
        ],
      },
    },
    {
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alt Text'},
        {name: 'caption', type: 'string', title: 'Caption'},
      ]
    },
    {
      type: 'code',
      options: {
        language: {
          list: [
            {title: 'JavaScript', value: 'javascript'},
            {title: 'TypeScript', value: 'typescript'},
            {title: 'HTML', value: 'html'},
            {title: 'CSS', value: 'css'},
            {title: 'JSON', value: 'json'},
          ]
        }
      }
    }
  ],
}
```

## Testing Considerations

### Unit Testing
- Test component rendering with various content types
- Verify proper fallback behavior for missing content
- Test accessibility features and ARIA attributes

### Integration Testing
- Test with real Sanity CMS data
- Verify image optimization and loading behavior
- Test responsive design across different screen sizes

### Performance Testing
- Measure rendering performance with large content blocks
- Test image loading and lazy loading behavior
- Verify bundle size impact

## Future Enhancements

### Planned Features
- Syntax highlighting for code blocks with Prism.js integration
- Table support for structured data
- Video embed support for YouTube/Vimeo
- Interactive elements (accordions, tabs)
- Math equation rendering with KaTeX

### Extensibility
The component is designed to be easily extensible through the `PortableTextComponents` configuration. New content types can be added by extending the `types` object in the components configuration.

## Maintenance and Updates

### Regular Maintenance
- Keep `@portabletext/react` dependency updated
- Monitor performance metrics and optimize as needed
- Update accessibility features based on WCAG guidelines
- Review and update color contrast ratios

### Breaking Changes
Any updates to the component should maintain backward compatibility with existing blog content. Schema changes in Sanity CMS should be coordinated with component updates.

---

This specification document should be updated whenever the PortableTextRenderer component is modified or enhanced.