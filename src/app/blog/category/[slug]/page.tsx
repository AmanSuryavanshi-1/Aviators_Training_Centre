import { sanitySimpleService } from '@/lib/sanity/client.simple';
import { unstable_cache } from 'next/cache';
import BlogListingWithTracking from '@/components/features/blog/BlogListingWithTracking';
import { CACHE_TAGS } from '@/lib/isr/config';

// ISR Configuration for category pages
export const revalidate = 3600;
export const dynamicParams = true;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Cached function for getting categories
const getCachedCategories = unstable_cache(
  async () => {
    return await sanitySimpleService.getCategories();
  },
  ['categories'],
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: 7200 // 2 hours
  }
);

// Generate metadata for category pages
export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const { slug } = await params;
    const categories = await getCachedCategories();
    const category = categories.find(cat => cat.slug.current === slug);
    
    if (!category) {
      return {
        title: 'Category Not Found | Aviators Training Centre',
        description: 'The requested category could not be found.',
      };
    }
    
    const title = `${category.title} Articles | Aviation Blog`;
    const description = category.description || 
      `Explore our collection of ${category.title.toLowerCase()} articles covering aviation training, pilot career guidance, and industry insights.`;
    
    return {
      title: `${title} | Aviators Training Centre`,
      description,
      keywords: `${category.title}, aviation, pilot training, flight training, aviation career`,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://aviatorstrainingcentre.com/blog/category/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: `https://aviatorstrainingcentre.com/blog/category/${slug}`,
          mainEntity: {
            '@type': 'ItemList',
            name: `${category.title} Articles`,
            description: `Collection of articles about ${category.title.toLowerCase()}`,
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://aviatorstrainingcentre.com'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://aviatorstrainingcentre.com/blog'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: category.title,
                item: `https://aviatorstrainingcentre.com/blog/category/${slug}`
              }
            ]
          }
        })
      }
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Aviation Blog Category | Aviators Training Centre',
      description: 'Explore aviation articles by category.',
    };
  }
}

// Generate static params for categories
export async function generateStaticParams() {
  try {
    const categories = await getCachedCategories();
    
    return categories.map((category) => ({
      slug: category.slug.current,
    }));
  } catch (error) {
    console.error('Error generating category static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  try {
    // Verify category exists
    const categories = await getCachedCategories();
    const category = categories.find(cat => cat.slug.current === slug);
    
    if (!category) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <a 
              href="/blog" 
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Back to Blog
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {/* Category Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {category.title} Articles
              </h1>
              {category.description && (
                <p className="text-xl text-teal-100 max-w-3xl mx-auto">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Blog Listing with Category Filter */}
        <BlogListingWithTracking 
          categoryFilter={slug}
          showCategoryHeader={false}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering category page:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Category</h1>
          <p className="text-gray-600 mb-8">There was an error loading this category.</p>
          <a 
            href="/blog" 
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }
}