# Component Architecture

> **React component organization, hierarchy, and patterns**

Last Updated: December 20, 2025

---

## Component Statistics

| Category | Count | Description |
|----------|-------|-------------|
| **UI Components** | 49 | Primitive building blocks |
| **Feature Components** | 70 | Feature-specific logic |
| **Admin Components** | 12 | Dashboard and admin UI |
| **Analytics Components** | 23 | Tracking and metrics |
| **Shared Components** | 24 | Cross-feature utilities |
| **Custom Hooks** | 18 | Reusable logic |
| **Total** | 196+ | All React components |

---

## Directory Structure

```
src/components/
├── ui/                         # 49 primitive components
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── tooltip.tsx
│   └── ...more
│
├── features/                   # 70 feature components
│   ├── blog/                   # 36 blog components
│   │   ├── BlogCard.tsx
│   │   ├── BlogHero.tsx
│   │   ├── BlogList.tsx
│   │   ├── BlogPost.tsx
│   │   ├── FeaturedPostsCarousel.tsx
│   │   ├── PortableTextComponents.tsx
│   │   ├── ReadingProgress.tsx
│   │   ├── RelatedPosts.tsx
│   │   ├── TableOfContents.tsx
│   │   └── ...more
│   │
│   ├── contact/                # 8 contact components
│   │   ├── ContactFormCard.tsx
│   │   ├── ContactFormFields.tsx
│   │   ├── ContactHero.tsx
│   │   ├── ValidationError.tsx
│   │   └── ...more
│   │
│   ├── courses/                # 9 course components
│   │   ├── CourseCard.tsx
│   │   ├── CoursesGrid.tsx
│   │   ├── CourseDetails.tsx
│   │   └── ...more
│   │
│   └── lead-generation/        # 6 lead gen components
│       ├── DemoModal.tsx
│       ├── CTASection.tsx
│       └── ...more
│
├── admin/                      # 12 admin components
│   ├── AdvancedAnalyticsDashboard.tsx  # 1655 lines
│   ├── AdminLayout.tsx
│   ├── AdminLogin.tsx
│   ├── AdminSidebar.tsx
│   ├── BlogManagement.tsx
│   ├── CTADashboard.tsx
│   ├── N8nMonitoringDashboard.tsx
│   ├── SystemHealthDashboard.tsx
│   ├── TrafficSourcesPanel.tsx
│   ├── UTMAnalyticsDashboard.tsx
│   └── ...more
│
├── analytics/                  # 23 analytics components
│   ├── AnalyticsProvider.tsx
│   ├── ConversionTracker.tsx
│   ├── EventTracker.tsx
│   ├── PerformanceMonitor.tsx
│   ├── RealTimeMetrics.tsx
│   ├── UTMTracker.tsx
│   └── ...more
│
├── shared/                     # 24 shared components
│   ├── ErrorBoundary.tsx
│   ├── LazyLoad.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ThemeProvider.tsx
│   ├── WhatsAppButton.tsx
│   └── ...more
│
└── layout/                     # Layout components
    ├── ConditionalLayout.tsx
    ├── PageWrapper.tsx
    └── ...more
```

---

## Component Patterns

### 1. Server Components (Default)

```typescript
// src/app/blog/page.tsx
import { getBlogPosts } from '@/lib/blog';

export default async function BlogPage() {
  const posts = await getBlogPosts(); // Server-side fetch
  
  return (
    <main>
      <BlogList posts={posts} />
    </main>
  );
}
```

### 2. Client Components

```typescript
// src/components/features/contact/ContactFormCard.tsx
'use client';

import { useState } from 'react';
import { useFormValidation } from '@/hooks/use-form-validation';

export function ContactFormCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validateField, validateForm } = useFormValidation();
  
  // Interactive logic here
}
```

### 3. Composition Pattern

```typescript
// Card with compound components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### 4. Provider Pattern

```typescript
// src/components/shared/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}
```

---

## UI Components (shadcn/ui)

Built on **Radix UI** primitives with **Tailwind CSS** styling.

### Button Variants
```typescript
// Usage
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Form Components
| Component | File | Purpose |
|-----------|------|---------|
| `Input` | `ui/input.tsx` | Text input |
| `Textarea` | `ui/textarea.tsx` | Multi-line input |
| `Select` | `ui/select.tsx` | Dropdown |
| `Checkbox` | `ui/checkbox.tsx` | Boolean toggle |
| `Switch` | `ui/switch.tsx` | Toggle switch |
| `Label` | `ui/label.tsx` | Form labels |

### Feedback Components
| Component | File | Purpose |
|-----------|------|---------|
| `Alert` | `ui/alert.tsx` | Status messages |
| `Toast` | `ui/toast.tsx` | Notifications |
| `Progress` | `ui/progress.tsx` | Loading state |
| `Skeleton` | `ui/skeleton.tsx` | Loading placeholder |

---

## Feature Components

### Blog Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `BlogPost.tsx` | 400+ | Full blog post rendering |
| `BlogCard.tsx` | 150 | Post preview card |
| `PortableTextComponents.tsx` | 300+ | Sanity content rendering |
| `FeaturedPostsCarousel.tsx` | 200 | Hero carousel |
| `TableOfContents.tsx` | 180 | Navigation sidebar |
| `ReadingProgress.tsx` | 80 | Scroll progress bar |
| `RelatedPosts.tsx` | 120 | Related content grid |

### Contact Components

| Component | Purpose |
|-----------|---------|
| `ContactFormCard.tsx` | Main contact form |
| `ContactFormFields.tsx` | Form field components |
| `ValidationError.tsx` | Error display |
| `ContactHero.tsx` | Page hero section |

### Course Components

| Component | Purpose |
|-----------|---------|
| `CourseCard.tsx` | Course preview card |
| `CoursesGrid.tsx` | Grid layout |
| `CourseDetails.tsx` | Full course page |

---

## Admin Components

### AdvancedAnalyticsDashboard

**File**: `src/components/admin/AdvancedAnalyticsDashboard.tsx`  
**Lines**: 1655  
**Purpose**: Main analytics dashboard

```typescript
interface DetailedAnalyticsData {
  totalPosts: number;
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  formSubmissions: number;
  uniqueUsers: number;
  bounceRate: number;
  conversionRate: number;
  trafficSources: Array<{
    source: string;
    visitors: number;
    conversions: number;
  }>;
  // ...more fields
}
```

**Features**:
- Real-time metrics display
- Date range filtering
- Traffic source breakdown
- Bot detection reports
- Export to CSV/Excel
- Cache invalidation

---

## Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useFormValidation` | `hooks/use-form-validation.ts` | Form validation state |
| `useAnalytics` | `hooks/use-analytics.ts` | Analytics tracking |
| `useMediaQuery` | `hooks/use-media-query.ts` | Responsive design |
| `useDebounce` | `hooks/use-debounce.ts` | Debounced values |
| `useLocalStorage` | `hooks/use-local-storage.ts` | Persistent state |
| `useToast` | `hooks/use-toast.ts` | Toast notifications |
| `useMounted` | `hooks/use-mounted.ts` | Client-side rendering |
| `useScrollPosition` | `hooks/use-scroll-position.ts` | Scroll tracking |

### useFormValidation Usage

```typescript
import { useFormValidation } from '@/hooks/use-form-validation';

function ContactForm() {
  const { 
    errors, 
    isValid, 
    validateField, 
    validateForm, 
    clearError 
  } = useFormValidation();

  const handleChange = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleSubmit = (formData: FormData) => {
    if (validateForm(formData)) {
      // Submit form
    }
  };

  return (
    <form>
      <Input 
        error={errors.email} 
        onChange={(e) => handleChange('email', e.target.value)} 
      />
    </form>
  );
}
```

---

## Component Naming Conventions

| Pattern | Example | Use Case |
|---------|---------|----------|
| `[Feature]Card` | `BlogCard`, `CourseCard` | Preview cards |
| `[Feature]List` | `BlogList`, `CourseList` | List containers |
| `[Feature]Hero` | `ContactHero`, `BlogHero` | Hero sections |
| `[Feature]Grid` | `CoursesGrid` | Grid layouts |
| `[Feature]Modal` | `DemoModal` | Modal dialogs |
| `use[Feature]` | `useFormValidation` | Custom hooks |

---

## Props Patterns

### With TypeScript Interface

```typescript
interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  className?: string;
}

export function BlogCard({ 
  post, 
  variant = 'default',
  showExcerpt = true,
  className 
}: BlogCardProps) {
  // Component logic
}
```

### With Children

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border', className)}>
      {children}
    </div>
  );
}
```

---

## Styling Patterns

### Tailwind with cn() Helper

```typescript
import { cn } from '@/lib/utils';

// Conditional classes
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)}>
```

### CSS Modules (Rare)
Used only for complex animations or third-party overrides.

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Implementation Patterns](IMPLEMENTATION_PATTERNS.md)
- [Feature Inventory](FEATURE_INVENTORY.md)
