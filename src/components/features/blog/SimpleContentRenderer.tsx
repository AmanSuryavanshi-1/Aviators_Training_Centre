'use client';

import React from 'react';

interface SimpleContentRendererProps {
  value: any;
  className?: string;
}

const SimpleContentRenderer: React.FC<SimpleContentRendererProps> = ({ value, className }) => {
  // Helper function to extract text from portable text blocks
  const extractTextFromBlocks = (blocks: any[]): string => {
    if (!Array.isArray(blocks)) return '';
    
    return blocks
      .map(block => {
        if (block?._type === 'block' && Array.isArray(block.children)) {
          return block.children
            .map((child: any) => {
              if (child?._type === 'span' && typeof child.text === 'string') {
                return child.text;
              }
              return '';
            })
            .join('');
        }
        return '';
      })
      .filter(text => text.trim())
      .join('\n\n');
  };

  // Handle different content types
  if (!value) {
    return (
      <div className={className}>
        <p className="text-muted-foreground">No content available.</p>
      </div>
    );
  }

  // If it's a string, render as plain text
  if (typeof value === 'string') {
    return (
      <div className={className}>
        <div className="whitespace-pre-wrap leading-relaxed">{value}</div>
      </div>
    );
  }

  // If it's an array of blocks, extract and render text
  if (Array.isArray(value)) {
    const textContent = extractTextFromBlocks(value);
    
    if (!textContent.trim()) {
      return (
        <div className={className}>
          <p className="text-muted-foreground">No readable content found.</p>
        </div>
      );
    }

    // Split into paragraphs and render
    const paragraphs = textContent.split('\n\n').filter(p => p.trim());
    
    return (
      <div className={className}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-6 leading-relaxed text-aviation-text text-lg">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    );
  }

  // Fallback for other types
  return (
    <div className={className}>
      <p className="text-muted-foreground">Content format not supported.</p>
    </div>
  );
};

export default SimpleContentRenderer;