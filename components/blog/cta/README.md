# Intelligent CTA System

A comprehensive Call-to-Action (CTA) system with intelligent course routing, A/B testing capabilities, and advanced analytics for the Aviators Training Centre blog.

## Features

### 🎯 Intelligent Course Routing
- **Content Analysis**: Automatically analyzes blog content to recommend the most relevant course
- **Keyword Matching**: Uses advanced keyword matching algorithms to determine course relevance
- **Category-based Routing**: Leverages blog categories for intelligent course recommendations
- **Fallback Mechanisms**: Provides default recommendations when no specific match is found

### 🧪 A/B Testing
- **Variant Testing**: Test different CTA designs, messages, and placements
- **Statistical Significance**: Automatic calculation of statistical significance
- **Traffic Splitting**: Configurable traffic distribution between variants
- **Performance Tracking**: Real-time monitoring of test performance

### 📊 Advanced Analytics
- **Conversion Tracking**: Track impressions, clicks, and conversions
- **Funnel Analysis**: Complete blog-to-course enrollment funnel tracking
- **Performance Metrics**: CTR, conversion rates, revenue attribution
- **Top Performers**: Identify best-performing blog posts and CTAs

### 🎨 Multiple CTA Variants
- **Card Variant**: Professional card layout with course highlights
- **Banner Variant**: Full-width banner with strong visual impact
- **Inline Variant**: Subtle integration within content
- **Minimal Variant**: Clean and unobtrusive design
- **Gradient Variant**: Eye-catching with modern design
- **Testimonial Variant**: Social proof focused

## Quick Start

### Basic Usage

```tsx
import IntelligentCTA from '@/components/blog/IntelligentCTA';

function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      
      {/* Top CTA */}
      <IntelligentCTA 
        blogPost={post} 
        position="top" 
        className="mb-8"
      />
      
      <div>{post.content}</div>
      
      {/* Bottom CTA */}
      <IntelligentCTA 
        blogPost={post} 
        position="bottom" 
        className="mt-8"
      />
    </article>
  );
}
```

### Position-Specific Components

```tsx
import { TopCTA, MiddleCTA, BottomCTA, SidebarCTA } from '@/components/blog/IntelligentCTA';

function BlogLayout({ post }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <main className="col-span-3">
        <TopCTA blogPost={post} />
        
        <div className="prose">
          {post.content}
          <MiddleCTA blogPost={post} className="my-8" />
          {/* More content */}
        </div>
        
        <BottomCTA blogPost={post} />
      </main>
      
      <aside>
        <SidebarCTA blogPost={post} className="sticky top-4" />
      </aside>
    </div>
  );
}
```

## Configuration

### Analytics Setup

```tsx
import { analyticsManager } from '@/lib/blog/analytics';

// Initialize with Google Analytics and Facebook Pixel
await analyticsManager.initialize({
  googleAnalyticsId: 'GA_MEASUREMENT_ID',
  facebookPixelId: 'FB_PIXEL_ID',
  enableDebugMode: process.env.NODE_ENV === 'development',
  customTrackingEndpoint: '/api/analytics/track',
});
```

### A/B Testing Setup

```tsx
import { abTestingManager } from '@/lib/blog/ab-testing';

// Create a new A/B test
const testId = await abTestingManager.createTest({
  name: 'CTA Design Test',
  description: 'Testing card vs banner CTA performance',
  active: true,
  startDate: new Date().toISOString(),
  trafficSplit: 50, // 50% traffic to test variant
  variants: {
    control: {
      id: 'control',
      name: 'Card CTA',
      type: 'card',
      config: {
        title: 'Start Your Aviation Journey',
        message: 'Join our comprehensive training program',
        buttonText: 'Enroll Now',
      },
    },
    test: {
      id: 'test',
      name: 'Banner CTA',
      type: 'banner',
      config: {
        title: 'Transform Your Career in Aviation',
        message: 'Professional pilot training with guaranteed results',
        buttonText: 'Get Started Today',
      },
    },
  },
  targetMetric: 'conversion_rate',
  minimumSampleSize: 1000,
  confidenceLevel: 95,
});

// Start the test
await abTestingManager.startTest(testId);
```

## API Reference

### IntelligentCTA Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blogPost` | `BlogPost` | - | **Required.** The blog post object |
| `position` | `'top' \| 'middle' \| 'bottom' \| 'sidebar' \| 'floating'` | - | **Required.** CTA position |
| `className` | `string` | `''` | Additional CSS classes |
| `enableABTesting` | `boolean` | `true` | Enable A/B testing |
| `enableAnalytics` | `boolean` | `true` | Enable analytics tracking |
| `fallbackCourse` | `Course` | - | Fallback course if no recommendation found |

### Analytics Methods

```tsx
// Track CTA interaction
await analyticsManager.trackCTAInteraction({
  ctaId: 'cta-123',
  blogPostId: 'post-456',
  blogPostSlug: 'aviation-guide',
  ctaType: 'course-promo',
  ctaPosition: 'middle',
  targetCourse: 'course-789',
  action: 'click',
});

// Track course enrollment
await analyticsManager.trackCourseEnrollment({
  courseId: 'course-789',
  courseName: 'CPL Ground School',
  coursePrice: 25000,
  currency: 'INR',
  source: 'blog',
  referrerBlogPost: 'aviation-guide',
});

// Get performance metrics
const metrics = await analyticsManager.getCTAPerformanceMetrics('cta-123');

// Get funnel data
const funnel = await analyticsManager.getBlogToCourseFunnel();

// Get top performing posts
const topPosts = await analyticsManager.getTopPerformingBlogPosts(10);
```

### Course Routing Methods

```tsx
import { intelligentCTARouter } from '@/lib/blog/cta-routing';

// Get single course recommendation
const course = await intelligentCTARouter.getRecommendedCourse(blogPost);

// Get multiple recommendations with scores
const recommendations = await intelligentCTARouter.getMultipleCourseRecommendations(
  blogPost,
  3 // number of recommendations
);

// Clear cache
intelligentCTARouter.clearCache();
```

## CTA Variants

### Card Variant
Professional card layout with course highlights, trust indicators, and clear call-to-action buttons.

**Best for:** Bottom of posts, dedicated CTA sections

### Banner Variant
Full-width banner with strong visual impact and prominent course information.

**Best for:** Top of posts, high-impact placements

### Inline Variant
Subtle integration within content that doesn't disrupt reading flow.

**Best for:** Middle of posts, within content sections

### Minimal Variant
Clean and unobtrusive design that focuses on the essential message.

**Best for:** Sidebar, secondary placements

### Gradient Variant
Eye-catching design with modern gradients and pricing information.

**Best for:** High-conversion placements, promotional content

### Testimonial Variant
Social proof focused with customer testimonials and success stories.

**Best for:** Trust-building, conversion-focused placements

## Analytics Dashboard

The system includes a comprehensive analytics dashboard for monitoring CTA performance:

```tsx
import CTAAnalyticsDashboard from '@/components/blog/cta/CTAAnalyticsDashboard';

function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <CTAAnalyticsDashboard />
    </div>
  );
}
```

### Dashboard Features
- **Key Metrics**: Impressions, clicks, conversions, revenue
- **Performance Trends**: Time-series charts of CTA performance
- **Conversion Funnel**: Blog-to-course enrollment funnel visualization
- **Top Performing Posts**: Ranking of best-converting blog posts
- **A/B Test Results**: Real-time A/B test performance and results

## Course Routing Logic

The intelligent routing system uses multiple factors to recommend courses:

1. **Explicit Configuration**: Post-specific course targets
2. **CTA Placements**: Configured course targets in CTA placements
3. **Category Mapping**: Category-based intelligent routing rules
4. **Keyword Matching**: Content analysis and keyword matching
5. **Fallback**: Default course recommendations

### Keyword Mapping Examples

```typescript
// Technical General keywords
'dgca', 'ground school', 'aviation theory' → Technical General Course

// CPL keywords  
'commercial pilot', 'cpl', 'career', 'pilot training' → CPL Ground School

// ATPL keywords
'airline', 'atpl', 'advanced', 'captain' → ATPL Ground School

// Type Rating keywords
'type rating', 'aircraft type', 'specific aircraft' → Type Rating Courses
```

## Performance Considerations

### Caching
- Course data is cached for 1 hour to improve performance
- User A/B test assignments are cached locally
- Analytics events are batched and processed periodically

### Error Handling
- Graceful degradation when services are unavailable
- Fallback course recommendations
- Error boundaries prevent component crashes
- Retry mechanisms for failed API calls

### Optimization
- Lazy loading of non-critical components
- Efficient event batching for analytics
- Minimal re-renders with proper memoization
- Progressive enhancement for better UX

## Testing

Run the test suite:

```bash
npm test lib/blog/__tests__/intelligent-cta.test.ts
```

### Test Coverage
- ✅ Intelligent course routing
- ✅ A/B testing functionality
- ✅ Analytics tracking
- ✅ Error handling
- ✅ Performance optimization
- ✅ Integration testing

## Troubleshooting

### Common Issues

**CTA not showing:**
- Check if `blogPost` prop is properly passed
- Verify course data is available
- Check console for error messages

**Analytics not tracking:**
- Ensure analytics manager is initialized
- Check network requests in browser dev tools
- Verify tracking IDs are configured correctly

**A/B tests not working:**
- Confirm test is in 'running' status
- Check traffic split configuration
- Verify user assignment logic

### Debug Mode

Enable debug mode in development:

```tsx
<IntelligentCTA 
  blogPost={post} 
  position="middle"
  enableAnalytics={true}
  // Debug info will show in development
/>
```

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure TypeScript types are properly defined
5. Test across different CTA variants and positions

## License

This intelligent CTA system is part of the Aviators Training Centre blog implementation and follows the project's licensing terms.