'use client';

import React from 'react';

interface HtmlContentRendererProps {
  value: any;
  className?: string;
}

const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({ value, className }) => {
  // Extract HTML content from Sanity blocks
  const extractHtmlFromBlocks = (blocks: any[]): string => {
    if (!Array.isArray(blocks)) return '';
    
    return blocks
      .map(block => {
        if (block._type === 'block' && block.children) {
          return block.children
            .map((child: any) => {
              if (child._type === 'span' && child.text) {
                return child.text;
              }
              return '';
            })
            .join('');
        }
        return '';
      })
      .join('\n');
  };

  // Handle different content types
  if (!value) {
    return (
      <div className={className}>
        <p className="text-muted-foreground">No content available.</p>
      </div>
    );
  }

  // If it's a string, render as HTML
  if (typeof value === 'string') {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // If it's an array of blocks, extract HTML and render
  if (Array.isArray(value)) {
    const htmlContent = extractHtmlFromBlocks(value);
    
    if (!htmlContent.trim()) {
      return (
        <div className={className}>
          <p className="text-muted-foreground">No content found in blocks.</p>
        </div>
      );
    }

    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  // Fallback for other types
  return (
    <div className={className}>
      <p className="text-muted-foreground">Content format not supported.</p>
      <details className="mt-2">
        <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
        <pre className="text-xs text-gray-400 mt-1 overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default HtmlContentRenderer;