// app/blog/[slug]/page.tsx
import { getPostBySlug, getAllPosts, Post } from '@/lib/blog';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'; // Code highlighting theme
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolidButton } from '@/components/shared/SolidButton';
import { PhoneForwarded } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // Import Next Image

// Define colors
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const FALLBACK_BLOG_IMAGE = "/public/placeholder.svg"; // Define a fallback image

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for the specific post
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const imageUrl = post.image?.startsWith('/public') ? post.image.replace('/public', '') : post.image;
  // TODO: Prepend domain for absolute URLs in production
  // const absoluteImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${imageUrl}` : undefined;
  const absoluteImageUrl = imageUrl; // Placeholder for now

  return {
    title: `${post.title} | ATC Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} | ATC Blog`,
      description: post.description,
      url: `/blog/${post.slug}`, // TODO: Add domain
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: ['Aviators Training Centre'],
      tags: post.tags,
      images: absoluteImageUrl ? [
        {
          url: absoluteImageUrl,
          // width: 1200, // Add image dimensions if known
          // height: 630,
        }
      ] : [],
    },
    twitter: {
        card: "summary_large_image",
        title: `${post.title} | ATC Blog`,
        description: post.description,
        images: absoluteImageUrl ? [absoluteImageUrl] : [],
    },
  };
}

// JSON-LD Schema Generator
function JsonLdSchema({ post }: { post: Post | null }) { // Accept null post
  if (!post) return null;

  const imageUrl = post.image?.startsWith('/public') ? post.image.replace('/public', '') : post.image;
  // TODO: Prepend domain for absolute URLs in production
  // const absoluteImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${imageUrl}` : undefined;
  // const absoluteLogoUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/ATC-Logo.webp`;
  // const absolutePostUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${post.slug}`;
  const absoluteImageUrl = imageUrl; // Placeholder
  const absoluteLogoUrl = '/ATC-Logo.webp'; // Placeholder
  const absolutePostUrl = `/blog/${post.slug}`; // Placeholder

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absolutePostUrl,
    },
    headline: post.title,
    description: post.description,
    image: absoluteImageUrl ? [absoluteImageUrl] : [],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(), // TODO: Use a separate modified date field if available
    author: {
      '@type': 'Organization',
      name: 'Aviators Training Centre',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aviators Training Centre',
      logo: {
        '@type': 'ImageObject',
        url: absoluteLogoUrl,
      },
    },
    keywords: post.tags?.join(', ') || '',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Component to handle image errors client-side if using <img>
// Not needed if using Next/Image with proper setup
// function PostImage({ src, alt }: { src: string, alt: string }) {
//   const [imgSrc, setImgSrc] = useState(src);
//   const handleImageError = () => {
//     if (imgSrc !== FALLBACK_BLOG_IMAGE) {
//       setImgSrc(FALLBACK_BLOG_IMAGE);
//     }
//   };
//   return <img src={imgSrc} alt={alt} className="w-full h-full object-cover" onError={handleImageError} loading="lazy" />;
// }

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const imageUrl = post.image?.startsWith('/public') ? post.image.replace('/public', '') : post.image;

  return (
    <>
      {/* Inject JSON-LD Schema */} 
      <JsonLdSchema post={post} />

      <article className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-4xl">
        {/* Post Header */} 
        <header className="mb-8 md:mb-12 border-b border-border/40 pb-6">
          <h1 className={cn("text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight", aviationPrimary)}>{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70">
            <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {post.tags && post.tags.length > 0 && (
              <span className="flex items-center gap-1.5">• Tags:
              {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50">{tag}</Badge>
              ))}
              </span>
            )}
          </div>
          {imageUrl && (
              <div className="mt-6 aspect-video overflow-hidden rounded-lg border border-border shadow-sm relative">
                  {/* Using standard img tag for now. 
                      Replace with next/image if width/height are known or image is imported.
                      Example: <Image src={imageUrl} alt={post.title} layout="fill" objectFit="cover" /> 
                  */}
                  <img 
                    src={imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_BLOG_IMAGE) {
                        target.onerror = null; // Prevent infinite loops
                        target.src = FALLBACK_BLOG_IMAGE;
                      }
                    }}
                  />
              </div>
          )}
        </header>

        {/* Post Content - Using Tailwind Typography */}
        <div className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-heading prose-headings:tracking-tight prose-headings:text-teal-700 dark:prose-headings:text-teal-300 
                        prose-a:text-teal-600 hover:prose-a:text-teal-700 dark:prose-a:text-teal-400 dark:hover:prose-a:text-teal-300 
                        prose-strong:font-semibold 
                        prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded 
                        prose-blockquote:border-l-4 prose-blockquote:border-l-teal-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground/80
                        prose-img:rounded-md prose-img:border prose-img:border-border prose-img:shadow-sm
                        prose-table:border prose-table:border-collapse prose-th:border prose-th:p-2 prose-td:border prose-td:p-2"
          >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom renderer for code blocks to apply syntax highlighting
              code(props) {
                const {children, className, node, ...rest} = props;
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="my-4 rounded-md overflow-hidden border border-border bg-[#0d1117]"> {/* Match vscDarkPlus background */}
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      language={match[1]}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, padding: '1rem', backgroundColor: 'transparent' }} // Remove default padding/margin
                      wrapLines={true}
                      showLineNumbers={false} // Optional: add line numbers
                    >
                      {String(children).replace(/
$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  // Inline code
                  <code {...rest} className={className}>
                    {children}
                  </code>
                )
              },
              // Optional: Custom renderer for images if needed (e.g., using Next/Image)
              // img: ({ node, ...props }) => { ... }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Contact Us CTA */} 
        <aside className="mt-16 pt-10 border-t border-border/40">
             <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border p-6 md:p-8">
                <PhoneForwarded className={cn("w-10 h-10 mb-4", aviationSecondary)} />
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Ready to Start Your Journey?</h3>
                <p className="text-foreground/80 mb-6 max-w-md mx-auto">
                   Have questions about our courses or want personalized guidance? Reach out to our team!
                </p>
                <SolidButton
                    href="/contact"
                    icon={PhoneForwarded}
                    label="Contact Us Now"
                 />
              </Card>
        </aside>

      </article>
    </>
  );
}
