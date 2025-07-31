'use client';

import { PortableText, PortableTextComponents } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import Image from 'next/image';
import Link from 'next/link';
import { getOptimizedImageUrl } from '@/lib/blog/utils';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface PortableTextRendererProps {
  content: PortableTextBlock[];
  className?: string;
}

// Custom components for Portable Text rendering
const components: PortableTextComponents = {
  types: {
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
    },
    
    // Code block component
    code: ({ value }: { value: { code: string; language?: string } }) => (
      <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4">
        <code className={`language-${value.language || 'text'}`}>
          {value.code}
        </code>
      </pre>
    ),

    // Callout/Quote component
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
    },
  },

  marks: {
    // Link component with external link handling
    link: (props: any) => {
      const { children, value } = props;
      if (!value?.href) return <span>{children}</span>;
      
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
    },

    // Strong/Bold text
    strong: (props: any) => (
      <strong className="font-semibold text-foreground">{props.children}</strong>
    ),

    // Emphasis/Italic text
    em: (props: any) => (
      <em className="italic">{props.children}</em>
    ),

    // Code inline
    code: (props: any) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
        {props.children}
      </code>
    ),

    // Highlight text
    highlight: (props: any) => (
      <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
        {props.children}
      </mark>
    ),
  },

  block: {
    // Headings
    h1: (props: any) => (
      <h1 className="text-3xl font-bold text-foreground mt-12 mb-6 first:mt-0">
        {props.children}
      </h1>
    ),
    h2: (props: any) => (
      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4 first:mt-0">
        {props.children}
      </h2>
    ),
    h3: (props: any) => (
      <h3 className="text-xl font-semibold text-foreground mt-8 mb-3 first:mt-0">
        {props.children}
      </h3>
    ),
    h4: (props: any) => (
      <h4 className="text-lg font-semibold text-foreground mt-6 mb-2 first:mt-0">
        {props.children}
      </h4>
    ),

    // Normal paragraph
    normal: (props: any) => (
      <p className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
        {props.children}
      </p>
    ),

    // Blockquote
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground">
        {props.children}
      </blockquote>
    ),
  },

  list: {
    // Bullet list
    bullet: (props: any) => (
      <ul className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
        {props.children}
      </ul>
    ),

    // Numbered list
    number: (props: any) => (
      <ol className="list-decimal list-inside space-y-2 my-4 text-muted-foreground">
        {props.children}
      </ol>
    ),
  },

  listItem: {
    // List item for bullet lists
    bullet: (props: any) => (
      <li className="leading-relaxed">{props.children}</li>
    ),

    // List item for numbered lists
    number: (props: any) => (
      <li className="leading-relaxed">{props.children}</li>
    ),
  },
};

export default function PortableTextRenderer({ content, className = '' }: PortableTextRendererProps) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className={`text-muted-foreground italic ${className}`}>
        No content available.
      </div>
    );
  }

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <PortableText value={content} components={components} />
    </div>
  );
}
