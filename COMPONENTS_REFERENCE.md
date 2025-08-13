# Components Reference

## Table of Contents

- [Layout Components](#layout-components)
- [Feature Components](#feature-components)
- [Shared Components](#shared-components)
- [Error Handling](#error-handling)
- [Providers](#providers)
- [Testimonials](#testimonials)
- [Blog Components](#blog-components)
- [Admin Components](#admin-components)
- [Testing Components](#testing-components)

## Layout Components

### ConditionalLayout
**Path**: `./src/components/layout/ConditionalLayout.tsx`

**Purpose**: Conditionally renders layout based on current route

**Props**:
```typescript
interface ConditionalLayoutProps {
  children: React.ReactNode;
}
```

**Example**:
```tsx
<ConditionalLayout>
  <YourPageContent />
</ConditionalLayout>
```

**Tests**: Not specified

---

### NavigationBreadcrumbs
**Path**: `./src/components/navigation/NavigationBreadcrumbs.tsx`

**Purpose**: Displays navigation breadcrumbs for current page

**Public API**:
```typescript
interface NavigationBreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

export function NavigationBreadcrumbs(props: NavigationBreadcrumbsProps)
export function CompactNavigationBreadcrumbs({ className }: { className?: string })
```

**Example**:
```tsx
<NavigationBreadcrumbs showHome={true} className="mb-4" />
<CompactNavigationBreadcrumbs className="md:hidden" />
```

**Tests**: Not specified

## Feature Components

### Lead Generation Tools

#### CareerAssessmentTool
**Path**: `./src/components/features/lead-generation/CareerAssessmentTool.tsx`

**Purpose**: Interactive career assessment for aviation training

**Props**:
```typescript
interface CareerAssessmentToolProps {
  onComplete?: (results: AssessmentResults) => void;
  onLeadCapture?: (leadData: LeadData) => void;
}
```

**Example**:
```tsx
<CareerAssessmentTool 
  onComplete={(results) => console.log(results)}
  onLeadCapture={(lead) => submitLead(lead)}
/>
```

**Tests**: Not specified

---

#### CourseRecommendationQuiz
**Path**: `./src/components/features/lead-generation/CourseRecommendationQuiz.tsx`

**Purpose**: Quiz to recommend appropriate aviation courses

**Props**:
```typescript
interface CourseRecommendationQuizProps {
  onComplete?: (recommendations: CourseRecommendation[]) => void;
  onLeadCapture?: (leadData: LeadData) => void;
}
```

**Example**:
```tsx
<CourseRecommendationQuiz 
  onComplete={(recs) => showRecommendations(recs)}
  onLeadCapture={(lead) => submitLead(lead)}
/>
```

**Tests**: Not specified

---

#### EligibilityChecker
**Path**: `./src/components/features/lead-generation/EligibilityChecker.tsx`

**Purpose**: Checks user eligibility for aviation training programs

**Props**:
```typescript
interface EligibilityCheckerProps {
  onComplete?: (eligibility: EligibilityResult) => void;
  onLeadCapture?: (leadData: LeadData) => void;
}
```

**Example**:
```tsx
<EligibilityChecker 
  onComplete={(result) => handleEligibility(result)}
  onLeadCapture={(lead) => submitLead(lead)}
/>
```

**Tests**: Not specified

---

#### PilotTrainingCostCalculator
**Path**: `./src/components/features/lead-generation/PilotTrainingCostCalculator.tsx`

**Purpose**: Calculates estimated costs for pilot training programs

**Props**:
```typescript
interface PilotTrainingCostCalculatorProps {
  onComplete?: (calculation: CostCalculation) => void;
  onLeadCapture?: (leadData: LeadData) => void;
}
```

**Example**:
```tsx
<PilotTrainingCostCalculator 
  onComplete={(calc) => showCosts(calc)}
  onLeadCapture={(lead) => submitLead(lead)}
/>
```

**Tests**: Not specified

---

#### LeadGenerationToolsHub
**Path**: `./src/components/features/lead-generation/LeadGenerationToolsHub.tsx`

**Purpose**: Central hub for all lead generation tools

**Props**:
```typescript
interface LeadGenerationToolsHubProps {
  onLeadCapture?: (leadData: LeadData) => void;
}
```

**Example**:
```tsx
<LeadGenerationToolsHub 
  onLeadCapture={(lead) => submitLead(lead)}
/>
```

**Tests**: Not specified

### Course Components

#### FeaturedBlogSection
**Path**: `./src/components/features/courses/FeaturedBlogSection.tsx`

**Purpose**: Displays featured blog posts related to courses

**Public API**:
```typescript
export default function FeaturedBlogSection()
```

**Example**:
```tsx
<FeaturedBlogSection />
```

**Tests**: Not specified

## Shared Components

### BookDemoButton
**Path**: `./src/components/shared/BookDemoButton.tsx`

**Purpose**: Call-to-action button for booking course demos

**Props**:
```typescript
interface BookDemoButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  state?: {
    subject: string;
    courseName: string;
  };
}
```

**Example**:
```tsx
<BookDemoButton 
  size="lg"
  state={{ subject: "Demo Request", courseName: "PPL Course" }}
  className="mt-4"
/>
```

**Tests**: Not specified

---

### ContactButton
**Path**: `./src/components/shared/ContactButton.tsx`

**Purpose**: Generic contact button component

**Props**:
```typescript
interface ContactButtonProps {
  href?: string;
  label?: string;
}
```

**Example**:
```tsx
<ContactButton 
  href="/contact"
  label="Get in Touch"
/>
```

**Tests**: Not specified

---

### CountdownTimer
**Path**: `./src/components/shared/CountdownTimer.tsx`

**Purpose**: Displays countdown timer for events or deadlines

**Props**:
```typescript
interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}
```

**Example**:
```tsx
<CountdownTimer 
  targetDate={new Date('2024-12-31')}
  className="text-center"
/>
```

**Tests**: Not specified

---

### SafeImage
**Path**: `./src/components/shared/SafeImage.tsx`

**Purpose**: Image component with error handling and fallbacks

**Props**:
```typescript
interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: any;
}
```

**Example**:
```tsx
<SafeImage 
  src="/images/aircraft.jpg"
  alt="Training Aircraft"
  width={800}
  height={600}
  className="rounded-lg"
/>
```

**Tests**: Not specified

---

### SafeLink
**Path**: `./src/components/shared/SafeLink.tsx`

**Purpose**: Link component with security and accessibility features

**Props**:
```typescript
interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}
```

**Example**:
```tsx
<SafeLink href="/courses" className="text-blue-600">
  View Courses
</SafeLink>
```

**Tests**: Not specified

---

### LoadingState
**Path**: `./src/components/shared/LoadingState.tsx`

**Purpose**: Loading state components for various scenarios

**Public API**:
```typescript
export const BlogLoadingState: React.FC<{ message?: string }>
export const ConnectionLoadingState: React.FC<{ message?: string }>
```

**Example**:
```tsx
<BlogLoadingState message="Loading blog posts..." />
<ConnectionLoadingState message="Connecting to CMS..." />
```

**Tests**: Not specified

---

### MetaPixelTest
**Path**: `./src/components/shared/MetaPixelTest.tsx`

**Purpose**: Testing component for Meta Pixel integration

**Public API**:
```typescript
export default function MetaPixelTest()
```

**Example**:
```tsx
{process.env.NODE_ENV === 'development' && <MetaPixelTest />}
```

**Tests**: Not specified

## Error Handling

### ErrorBoundary
**Path**: `./src/components/errors/ErrorBoundary.tsx`

**Purpose**: React error boundary for catching and handling errors

**Props**:
```typescript
interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}
```

**Example**:
```tsx
<ErrorBoundary fallback={CustomErrorComponent}>
  <YourComponent />
</ErrorBoundary>
```

**Tests**: Not specified

---

### ErrorDisplay
**Path**: `./src/components/errors/ErrorDisplay.tsx`

**Purpose**: Displays error messages with retry and dismiss options

**Public API**:
```typescript
export function ErrorDisplay({ error, onRetry, onDismiss, showDetails }: ErrorDisplayProps)
export function AuthenticationError({ onRetry }: { onRetry?: () => void })
export function MemberValidationError({ email }: { email?: string })
export function SessionExpiredError({ onLogin }: { onLogin?: () => void })
export function NetworkError({ onRetry }: { onRetry?: () => void })
export function ConfigurationError({ contactEmail }: { contactEmail?: string })
```

**Example**:
```tsx
<ErrorDisplay 
  error={error}
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
  showDetails={true}
/>

<AuthenticationError onRetry={() => login()} />
<NetworkError onRetry={() => retry()} />
```

**Tests**: Not specified

## Providers

### AnalyticsProvider
**Path**: `./src/components/providers/AnalyticsProvider.tsx`

**Purpose**: Provides analytics context throughout the application

**Props**:
```typescript
interface AnalyticsProviderProps {
  children: React.ReactNode;
}
```

**Example**:
```tsx
<AnalyticsProvider>
  <App />
</AnalyticsProvider>
```

**Tests**: Not specified

---

### ErrorHandlingProvider
**Path**: `./src/components/shared/ErrorHandlingProvider.tsx`

**Purpose**: Global error handling context provider

**Public API**:
```typescript
export const useErrorHandlingContext = () => ErrorHandlingContextType
export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps>
export const withErrorHandling = <P extends object>(Component: React.ComponentType<P>, options: ErrorHandlingOptions)
```

**Example**:
```tsx
<ErrorHandlingProvider enableGlobalErrorTracking={true}>
  <App />
</ErrorHandlingProvider>

// Using the HOC
const SafeComponent = withErrorHandling(MyComponent, {
  fallback: ErrorFallback,
  onError: (error) => console.error(error)
});
```

**Tests**: Not specified

## Testimonials

### EnhancedTestimonialsSection
**Path**: `./src/components/testimonials/EnhancedTestimonialsSection.tsx`

**Purpose**: Enhanced testimonials section with video and text testimonials

**Public API**:
```typescript
export default function EnhancedTestimonialsSection()
```

**Example**:
```tsx
<EnhancedTestimonialsSection />
```

**Tests**: Not specified

---

### InfiniteVideoCarousel
**Path**: `./src/components/testimonials/InfiniteVideoCarousel.tsx`

**Purpose**: Infinite scrolling carousel for video testimonials

**Public API**:
```typescript
export default function InfiniteVideoCarousel()
```

**Example**:
```tsx
<InfiniteVideoCarousel />
```

**Tests**: Not specified

---

### TestimonialsSection
**Path**: `./src/components/testimonials/TestimonialsSection.tsx`

**Purpose**: Main testimonials section component

**Props**:
```typescript
interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  students?: Student[];
}
```

**Example**:
```tsx
<TestimonialsSection 
  testimonials={testimonialData}
  students={studentData}
/>
```

**Tests**: Not specified

---

### ShortsVideoCard
**Path**: `./src/components/testimonials/ShortsVideoCard.tsx`

**Purpose**: Card component for short video testimonials

**Props**:
```typescript
interface ShortsVideoCardProps {
  video: Video;
  student: Student;
  className?: string;
}
```

**Example**:
```tsx
<ShortsVideoCard 
  video={videoData}
  student={studentData}
  className="rounded-lg shadow-md"
/>
```

**Tests**: Not specified

---

### VideoErrorBoundary
**Path**: `./src/components/testimonials/VideoErrorBoundary.tsx`

**Purpose**: Error boundary specifically for video components

**Public API**:
```typescript
export default function VideoErrorFallback({ video, student }: VideoErrorFallbackProps)
export class VideoErrorBoundary extends React.Component<VideoErrorBoundaryProps, VideoErrorBoundaryState>
```

**Example**:
```tsx
<VideoErrorBoundary>
  <VideoPlayer video={videoData} />
</VideoErrorBoundary>
```

**Tests**: Not specified

## Blog Components

### BlogContentRenderer
**Path**: `./src/components/features/blog/BlogContentRenderer.tsx`

**Purpose**: Renders blog content with proper formatting and styling

**Props**:
```typescript
interface BlogContentRendererProps {
  content?: any;
  body?: any;
  title?: string;
}
```

**Example**:
```tsx
<BlogContentRenderer 
  content={blogPost.content}
  body={blogPost.body}
  title={blogPost.title}
/>
```

**Tests**: Not specified

## Admin Components

### AdminReturnButton
**Path**: `./src/components/studio/AdminReturnButton.tsx`

**Purpose**: Navigation button to return to admin dashboard from Sanity Studio

**Public API**:
```typescript
export default function AdminReturnButton({ className, showOnlyWhenFromAdmin }: AdminReturnButtonProps)
export function FloatingAdminReturnButton()
export function StudioHeaderReturnButton()
```

**Example**:
```tsx
<AdminReturnButton className="mb-4" showOnlyWhenFromAdmin={true} />
<FloatingAdminReturnButton />
<StudioHeaderReturnButton />
```

**Tests**: Not specified

## Preview Components

### PreviewBanner
**Path**: `./src/components/preview/PreviewBanner.tsx`

**Purpose**: Banner displayed when viewing draft/preview content

**Props**:
```typescript
interface PreviewBannerProps {
  slug?: string;
  isDraft?: boolean;
}
```

**Example**:
```tsx
<PreviewBanner 
  slug="blog-post-slug"
  isDraft={true}
/>
```

**Tests**: Not specified

## Page Components

### HomePageClient
**Path**: `./src/components/pages/HomePageClient.tsx`

**Purpose**: Client-side homepage component with analytics integration

**Public API**:
```typescript
export default function HomePageClient()
```

**Example**:
```tsx
<HomePageClient />
```

**Tests**: Not specified

## Component Architecture Notes

### Design Patterns

1. **Error Boundaries**: Most components use error boundaries for graceful error handling
2. **Loading States**: Components include loading state management
3. **Responsive Design**: Components are built with mobile-first responsive design
4. **Accessibility**: Components follow WCAG guidelines
5. **TypeScript**: All components are fully typed with TypeScript

### Common Props Patterns

- `className?: string` - For custom styling
- `children?: React.ReactNode` - For composition
- `onComplete?: (data: T) => void` - For completion callbacks
- `onError?: (error: Error) => void` - For error handling

### Testing Strategy

- **Unit Tests**: Individual component testing (inferred from Jest setup)
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user journey testing with Playwright
- **Visual Regression**: Component visual testing (inferred)

### Performance Considerations

- **Code Splitting**: Components are lazy-loaded where appropriate
- **Memoization**: React.memo and useMemo used for optimization
- **Bundle Size**: Components are optimized for minimal bundle impact
- **Image Optimization**: SafeImage component handles image optimization

---

**Note**: This reference covers the main components found in the codebase. For implementation details and additional components, refer to the source files in the `src/components/` directory.