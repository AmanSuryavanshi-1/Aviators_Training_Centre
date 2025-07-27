import BlogListingWithTracking from '@/components/blog/BlogListingWithTracking';

// Generate static metadata for SEO
export const metadata = {
  title: 'Aviation Blog | Expert Flight Training & Career Guidance',
  description: 'Discover expert aviation insights, pilot training tips, and career advice from certified aviation professionals.',
  keywords: 'aviation blog, pilot training, flight training, aviation career, airline pilot, commercial pilot',
  openGraph: {
    title: 'Aviation Blog | Expert Flight Training & Career Guidance',
    description: 'Discover expert aviation insights, pilot training tips, and career advice from certified aviation professionals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aviation Blog | Expert Flight Training & Career Guidance',
    description: 'Discover expert aviation insights, pilot training tips, and career advice from certified aviation professionals.',
  },
};

export default function BlogPage() {
  return <BlogListingWithTracking />;
}