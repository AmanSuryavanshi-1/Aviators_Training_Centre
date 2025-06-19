import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.client'; // Ensure this path is correct

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    slug: { current: string };
    mainImage?: any;
    excerpt?: string;
    publishedAt: string;
    author?: { name: string };
  };
}

export default function BlogPostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug.current}`} key={post._id} className="group block">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out h-full flex flex-col">
        {post.mainImage && (
          <div className="relative w-full h-48 sm:h-56">
            <Image
              src={urlFor(post.mainImage).width(400).height(300).auto('format').fit('crop').url()}
              alt={post.title || 'Blog post image'}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          {post.author?.name && (
            <p className="text-sm text-muted-foreground mb-1">By {post.author.name}</p>
          )}
          <p className="text-xs text-muted-foreground mb-3">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto">
            <span className="text-primary font-medium group-hover:underline">
              Read more &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
