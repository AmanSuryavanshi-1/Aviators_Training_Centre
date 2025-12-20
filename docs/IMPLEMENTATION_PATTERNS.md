# Implementation Patterns

> **Common patterns, data fetching, and error handling approaches**

Last Updated: December 20, 2025

---

## Table of Contents

1. [Data Fetching Patterns](#data-fetching-patterns)
2. [Error Handling](#error-handling)
3. [Validation Patterns](#validation-patterns)
4. [Analytics Tracking](#analytics-tracking)
5. [Caching Strategies](#caching-strategies)
6. [Authentication Patterns](#authentication-patterns)
7. [Component Patterns](#component-patterns)

---

## Data Fetching Patterns

### 1. Server Component Data Fetching

```typescript
// src/app/blog/page.tsx
import { getBlogPosts } from '@/lib/blog';

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

export default async function BlogPage() {
  // Data fetched on server
  const posts = await getBlogPosts();
  
  return <BlogList posts={posts} />;
}
```

### 2. Client-Side Data Fetching with SWR

```typescript
// src/components/admin/Dashboard.tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/analytics/dashboard',
    fetcher,
    { 
      refreshInterval: 30000, // Refresh every 30s
      revalidateOnFocus: true,
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  
  return <DashboardContent data={data} />;
}
```

### 3. Parallel Data Fetching

```typescript
// Fetch multiple resources in parallel
export async function getPageData() {
  const [posts, categories, authors] = await Promise.all([
    getBlogPosts(),
    getCategories(),
    getAuthors(),
  ]);

  return { posts, categories, authors };
}
```

### 4. Sanity Client with Retry

```typescript
// src/lib/sanity/client.ts
export async function fetchWithRetry<T>(
  query: string,
  params?: object,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.fetch<T>(query, params);
    } catch (error) {
      lastError = error as Error;
      await delay(1000 * (attempt + 1)); // Exponential backoff
    }
  }
  
  throw lastError;
}
```

---

## Error Handling

### 1. API Route Error Handling

```typescript
// src/app/api/contact/route.ts
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Business logic
    await processContact(data);

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

### 2. Timeout Protection

```typescript
// Prevent hanging operations
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  return Promise.race([promise, timeoutPromise]);
}

// Usage
const result = await withTimeout(
  push(contactsRef, data),
  10000 // 10 second timeout
);
```

### 3. Graceful Degradation

```typescript
// Non-critical operations shouldn't break the flow
async function handleFormSubmission(data: FormData) {
  // Critical: Save to database
  const contactId = await saveContact(data);
  
  // Non-critical: Trigger webhook (fire and forget)
  triggerWebhook(data, contactId).catch(err => {
    console.error('Webhook failed:', err);
    // Don't throw - form still succeeded
  });

  // Non-critical: Track analytics
  trackFormSubmission(data).catch(console.error);

  return { success: true, id: contactId };
}
```

### 4. Error Boundary Component

```typescript
// src/components/shared/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

---

## Validation Patterns

### 1. Core Validation Utilities

```typescript
// src/lib/validation.ts
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email' };
  }
  
  return { isValid: true };
}

export function validateIndianPhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Phone is optional
  }
  
  const cleaned = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter valid 10-digit mobile number' };
  }
  
  return { isValid: true };
}
```

### 2. Form Validation Hook

```typescript
// src/hooks/use-form-validation.ts
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    fieldName: string,
    value: string
  ): ValidationResult => {
    let result: ValidationResult;

    switch (fieldName) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validateIndianPhone(value);
        break;
      case 'name':
        result = validateRequired(value, 'Name');
        break;
      default:
        result = { isValid: true };
    }

    // Update errors state
    setErrors(prev => {
      if (result.isValid) {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldName]: result.error! };
    });

    return result;
  }, []);

  const validateForm = useCallback((formData: FormData): boolean => {
    const results = [
      validateField('name', formData.name),
      validateField('email', formData.email),
      validateField('phone', formData.phone),
    ];
    
    return results.every(r => r.isValid);
  }, [validateField]);

  return { errors, validateField, validateForm };
}
```

### 3. Server-Side Validation

```typescript
// Always re-validate on server
export async function POST(req: NextRequest) {
  const data = await req.json();

  // Server-side validation (never trust client)
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!validateEmail(data.email).isValid) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Proceed with validated data
}
```

---

## Analytics Tracking

### 1. Client-Side Analytics Singleton

```typescript
// src/lib/analytics/client.ts
class AnalyticsClient {
  private static instance: AnalyticsClient;
  private queue: AnalyticsEvent[] = [];
  private userId: string;
  private sessionId: string;

  private constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
  }

  static getInstance(): AnalyticsClient {
    if (!this.instance) {
      this.instance = new AnalyticsClient();
    }
    return this.instance;
  }

  track(event: AnalyticsEvent): void {
    this.queue.push({
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });

    // Flush when queue reaches limit
    if (this.queue.length >= 3) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...events);
    }
  }

  private setupAutoFlush(): void {
    // Flush every 30 seconds
    setInterval(() => this.flush(), 30000);
    
    // Flush on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }
}

export const analytics = AnalyticsClient.getInstance();
```

### 2. Event Tracking Usage

```typescript
// Track page view
analytics.track({
  type: 'page_view',
  page: '/blog/my-post',
});

// Track CTA click
analytics.track({
  type: 'cta_click',
  data: {
    ctaId: 'hero-cta',
    ctaText: 'Book Demo',
    page: '/courses',
  },
});

// Track form submission
analytics.track({
  type: 'form_submission',
  data: {
    formType: 'contact',
    source: 'homepage',
  },
});
```

---

## Caching Strategies

### 1. ISR (Incremental Static Regeneration)

```typescript
// Static page with periodic revalidation
export const revalidate = 1800; // 30 minutes

export default async function Page() {
  const data = await fetchData(); // Cached
  return <Component data={data} />;
}
```

### 2. On-Demand Revalidation

```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const { path, tag } = await req.json();

  if (path) {
    revalidatePath(path);
  }
  
  if (tag) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true });
}
```

### 3. Cache Headers

```javascript
// next.config.mjs
async headers() {
  return [
    // Static assets - long cache
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ],
    },
    // API responses - short cache with revalidation
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' }
      ],
    },
  ];
}
```

---

## Authentication Patterns

### 1. JWT Token Generation

```typescript
// src/lib/auth/jwtService.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

export async function generateToken(user: AdminUser): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
```

### 2. Middleware Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin-session');

  if (!sessionCookie?.value) {
    return redirectToLogin(request);
  }

  try {
    await jwtVerify(
      sessionCookie.value,
      new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    );
    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ['/studio/admin/:path*'],
};
```

---

## Component Patterns

### 1. Loading States

```typescript
// Skeleton loading
function BlogListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

// Suspense usage
<Suspense fallback={<BlogListSkeleton />}>
  <BlogList />
</Suspense>
```

### 2. Optimistic Updates

```typescript
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    // Optimistic update
    setLikes(prev => prev + 1);
    setIsLiking(true);

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    } catch {
      // Revert on failure
      setLikes(prev => prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  return <Button onClick={handleLike} disabled={isLiking}>{likes}</Button>;
}
```

### 3. Debounced Search

```typescript
function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Component Architecture](COMPONENT_ARCHITECTURE.md)
- [API Integration](API_INTEGRATION.md)
