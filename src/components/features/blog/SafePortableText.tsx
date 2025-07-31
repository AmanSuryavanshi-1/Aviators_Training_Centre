'use client';

import React from 'react';
import { PortableText } from '@portabletext/react';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

interface SafePortableTextProps {
  value: any;
  className?: string;
}

// Helper function to validate and clean portable text data
const validatePortableTextValue = (value: any): any[] | null => {
  if (!value) return null;
  
  if (typeof value === 'string') {
    // Convert string to a simple block
    return [{
      _type: 'block',
      children: [{
        _type: 'span',
        text: value
      }]
    }];
  }
  
  if (!Array.isArray(value)) return null;
  
  // Filter and validate blocks
  const validBlocks = value.filter(block => {
    if (!block || typeof block !== 'object') return false;
    if (!block._type) return false;
    
    // For block types, ensure children exist and are valid
    if (block._type === 'block') {
      if (!Array.isArray(block.children)) return false;
      
      // Validate children
      const validChildren = block.children.filter((child: any) => {
        return child && typeof child === 'object' && child._type === 'span' && typeof child.text === 'string';
      });
      
      // Update block with valid children only
      block.children = validChildren;
      return validChildren.length > 0;
    }
    
    return true;
  });
  
  return validBlocks.length > 0 ? validBlocks : null;
};

const SafePortableText: React.FC<SafePortableTextProps> = ({ value, className }) => {
  // Validate and clean the input value
  const cleanValue = validatePortableTextValue(value);

  // Handle cases where no valid content is available
  if (!cleanValue) {
    return (
      <div className={className}>
        <p className="text-muted-foreground">No content available.</p>
      </div>
    );
  }

  // Render with PortableText
  try {
    return (
      <div className={className}>
        <PortableText 
          value={cleanValue}
          components={{
            block: {
              h1: ({ children }) => (
                <h1 className="text-4xl font-heading font-bold mt-12 mb-6 text-aviation-primary border-b-2 border-aviation-accent/30 pb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-heading font-bold mt-10 mb-5 text-aviation-secondary relative pl-4">
                  <span className="absolute -left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-aviation-primary rounded"></span>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-heading font-bold mt-8 mb-4 text-aviation-tertiary">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xl font-heading font-semibold mt-6 mb-3 text-aviation-text">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-lg font-heading font-semibold mt-4 mb-2 text-aviation-text">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-base font-heading font-semibold mt-3 mb-2 text-aviation-text">
                  {children}
                </h6>
              ),
              normal: ({ children }) => (
                <p className="mb-6 leading-relaxed text-aviation-text text-lg">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-aviation-primary bg-aviation-light/10 pl-6 pr-4 py-4 my-8 italic rounded-r-lg">
                  <div className="text-aviation-secondary">
                    {children}
                  </div>
                </blockquote>
              ),
            },
            list: {
              bullet: ({ children }) => (
                <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-aviation-primary">
                  {children}
                </ul>
              ),
              number: ({ children }) => (
                <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-aviation-primary">
                  {children}
                </ol>
              ),
            },
            listItem: {
              bullet: ({ children }) => (
                <li className="leading-relaxed text-aviation-text">
                  {children}
                </li>
              ),
              number: ({ children }) => (
                <li className="leading-relaxed text-aviation-text">
                  {children}
                </li>
              ),
            },
            marks: {
              strong: ({ children }) => (
                <strong className="font-bold text-aviation-primary">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-aviation-secondary">
                  {children}
                </em>
              ),
              code: ({ children }) => (
                <code className="bg-aviation-light/20 text-aviation-primary px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              link: ({ children, value }) => (
                <a
                  href={value?.href || '#'}
                  target={value?.blank ? '_blank' : undefined}
                  rel={value?.blank ? 'noopener noreferrer' : undefined}
                  className="text-aviation-primary hover:text-aviation-secondary hover:underline font-medium transition-all duration-200 relative"
                >
                  {children}
                </a>
              ),
            },
            types: {
              image: ({ value }) => (
                <div className="my-8">
                  <img
                    src={sanitySimpleService.getImageUrl(value, { width: 800, quality: 90 }) || ''}
                    alt={value?.alt || 'Blog image'}
                    className="w-full rounded-lg shadow-sm"
                    loading="lazy"
                  />
                  {value?.caption && (
                    <p className="text-sm text-muted-foreground text-center mt-2 italic">
                      {value.caption}
                    </p>
                  )}
                </div>
              ),
              codeBlock: ({ value }) => (
                <div className="my-6">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code className={value?.language ? `language-${value.language}` : ''}>
                      {value?.code || ''}
                    </code>
                  </pre>
                  {value?.filename && (
                    <p className="text-xs text-gray-500 mt-1">{value.filename}</p>
                  )}
                </div>
              ),
              htmlBlock: ({ value }) => (
                <div 
                  className="my-6"
                  dangerouslySetInnerHTML={{ __html: value?.html || '' }}
                />
              ),
              callout: ({ value }) => (
                <div className={`my-8 p-6 rounded-r-lg border-l-4 shadow-sm ${
                  value?.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  value?.type === 'error' ? 'bg-red-50 border-red-500' :
                  value?.type === 'success' ? 'bg-green-50 border-green-500' :
                  value?.type === 'tip' ? 'bg-blue-50 border-blue-500' :
                  'bg-aviation-light/10 border-aviation-primary'
                }`}>
                  {value?.title && (
                    <h4 className="font-heading font-bold mb-3 text-aviation-primary">
                      {value.title}
                    </h4>
                  )}
                  {value?.content && (
                    <p className="text-aviation-text leading-relaxed">
                      {value.content}
                    </p>
                  )}
                </div>
              ),
            },
            unknownType: ({ value, isInline }) => {
              console.warn('Unknown PortableText type:', value?._type);
              return isInline ? (
                <span className="bg-yellow-100 px-1 rounded text-xs">[{value?._type || 'unknown'}]</span>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded my-4">
                  <p className="text-sm text-yellow-800">Unknown content type: {value?._type || 'unknown'}</p>
                </div>
              );
            },
            unknownMark: ({ children, markType }) => {
              console.warn('Unknown PortableText mark:', markType);
              return <span>{children}</span>;
            },
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering PortableText:', error);
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-800 font-medium">Error rendering content</p>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }
};

export default SafePortableText;