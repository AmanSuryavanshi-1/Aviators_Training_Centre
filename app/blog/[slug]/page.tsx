import { sanityClient, urlFor } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Define basic types for the data we expect
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  body?: any[]; // Portable Text content
  publishedAt: string;
  author?: { name: string; slug?: { current: string } };
  categories?: Array<{ _id: string; title: string }>;
}

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    body,
    publishedAt,
    author->{name, slug},
    categories[]->{_id, title}
  }`;
  const post = await sanityClient.fetch(query, { slug });
  return post;
}

// Generate static paths for each post
export async function generateStaticParams() {
  const query = `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;
  const slugs: Array<{ slug: string }> = await sanityClient.fetch(query);
  return slugs.map((s) => ({ slug: s.slug }));
}

// Optional: Add metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const post = await getPost(params.slug); // getPost is defined in the file
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';

  if (!post) {
    return {
      title: 'Post Not Found | Aviators Training Centre',
    };
  }

  const excerpt = post.excerpt || post.body?.map(block => block.children?.map(child => child.text).join('')).join(' ').substring(0, 160) || 'A blog post from Aviators Training Centre.';

  let ogImages = [];
  if (post.mainImage) {
    ogImages.push({
      url: urlFor(post.mainImage).width(1200).height(630).fit('crop').url(), // Ensure urlFor is imported/available
      width: 1200,
      height: 630,
      alt: post.title,
    });
  }
  // Add a fallback OG image if no mainImage for the post
  // else {
  //   ogImages.push({
  //     url: `${siteUrl}/path/to/default-post-og-image.jpg`,
  //     width: 1200,
  //     height: 630,
  //     alt: 'Aviators Training Centre Blog Post',
  //   });
  // }

  return {
    title: `${post.title} | Aviators Training Centre Blog`,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      url: `${siteUrl}/blog/${post.slug.current}`,
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: post.author?.name ? [post.author.name] : ['Aviators Training Centre'],
      images: ogImages,
      // siteName: 'Aviators Training Centre' // Can be added globally in layout.tsx if preferred
    },
    // twitter: { // Optional: Add Twitter specific cards if needed
    //   card: 'summary_large_image',
    //   title: post.title,
    //   description: excerpt,
    //   images: ogImages,
    // },
  };
}

// Define custom components for Portable Text if needed (example)
const ptComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative my-6">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Blog post image'}
            width={value.asset.metadata?.dimensions?.width || 800}
            height={value.asset.metadata?.dimensions?.height || 600}
            className="mx-auto rounded-lg"
          />
        </div>
      );
    },
    // You can add more custom components for other block types (e.g., code, custom embeds)
  },
  marks: {
    link: ({children, value}: {children: React.ReactNode, value: any}) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <Link href={value.href} rel={rel} className="text-blue-500 hover:underline">
          {children}
        </Link>
      )
    }
  }
};

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // Triggers the 404 page
    return null; // Keep TypeScript happy
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
      {post.author?.name && (
        <p className="text-lg text-gray-600 mb-1">
          By {post.author.slug?.current ? (
            <Link href={`/authors/${post.author.slug.current}`} className="hover:underline">
              {post.author.name}
            </Link>
          ) : (
            post.author.name
          )}
        </p>
      )}
      <p className="text-sm text-gray-500 mb-6">
        Published on {new Date(post.publishedAt).toLocaleDateString()}
      </p>

      {post.mainImage && (
        <div className="relative w-full h-64 md:h-96 mb-8">
          <Image
            src={urlFor(post.mainImage).url()}
            alt={post.title || 'Main blog post image'}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            priority // Prioritize loading the main image
          />
        </div>
      )}

      {post.categories && post.categories.length > 0 && (
        <div className="mb-6">
          <span className="font-semibold">Categories: </span>
          {post.categories.map((category, index) => (
            <Link key={category._id} href={`/blog/category/${category.title.toLowerCase()}`} className="text-blue-500 hover:underline">
              {category.title}{index < post.categories!.length - 1 ? ', ' : ''}
            </Link>
          ))}
        </div>
      )}

      {post.body && (
        <div className="prose lg:prose-xl max-w-none"> {/* Tailwind typography plugin styles */}
          <PortableText value={post.body} components={ptComponents} />
        </div>
      )}

      <div className="mt-12">
        <Link href="/blog" className="text-blue-500 hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    </article>
  );
}
