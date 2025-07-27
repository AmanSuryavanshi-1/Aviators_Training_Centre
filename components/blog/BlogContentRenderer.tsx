'use client';

import React from 'react';
import { PortableText } from '@portabletext/react';

interface BlogContentRendererProps {
  content?: string;
  body?: any[];
  title: string;
}

export default function BlogContentRenderer({ content, body, title }: BlogContentRendererProps) {
  // Generate heading ID for table of contents
  const generateHeadingId = (text: string): string => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Enhanced markdown to HTML conversion with proper typography
  const renderMarkdownContent = (markdownContent: string) => {
    console.log('✅ Rendering markdown content, length:', markdownContent.length);
    
    // Split content into lines for better processing
    const lines = markdownContent.split('\n');
    const processedLines: string[] = [];
    let inCodeBlock = false;
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    let listItems: string[] = [];
    
    const flushList = () => {
      if (listItems.length > 0 && listType) {
        processedLines.push(`<${listType}>`);
        listItems.forEach(item => {
          processedLines.push(`<li>${item}</li>`);
        });
        processedLines.push(`</${listType}>`);
        listItems = [];
        listType = null;
        inList = false;
      }
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Handle code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          processedLines.push('</code></pre>');
          inCodeBlock = false;
        } else {
          flushList();
          const language = trimmed.substring(3).trim();
          processedLines.push(`<pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 border border-gray-200"><code class="text-sm font-mono leading-relaxed">`);
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        processedLines.push(line);
        continue;
      }
      
      // Handle empty lines
      if (!trimmed) {
        flushList();
        continue;
      }
      
      // Handle headings with professional styling
      if (trimmed.startsWith('# ')) {
        flushList();
        const headingText = trimmed.substring(2).trim();
        const headingId = generateHeadingId(headingText);
        const processedText = processFormattedText(headingText);
        processedLines.push(`<h1 id="${headingId}">${processedText}</h1>`);
        continue;
      }
      
      if (trimmed.startsWith('## ')) {
        flushList();
        const headingText = trimmed.substring(3).trim();
        const headingId = generateHeadingId(headingText);
        const processedText = processFormattedText(headingText);
        processedLines.push(`<h2 id="${headingId}">${processedText}</h2>`);
        continue;
      }
      
      if (trimmed.startsWith('### ')) {
        flushList();
        const headingText = trimmed.substring(4).trim();
        const headingId = generateHeadingId(headingText);
        const processedText = processFormattedText(headingText);
        processedLines.push(`<h3 id="${headingId}">${processedText}</h3>`);
        continue;
      }
      
      if (trimmed.startsWith('#### ')) {
        flushList();
        const headingText = trimmed.substring(5).trim();
        const headingId = generateHeadingId(headingText);
        const processedText = processFormattedText(headingText);
        processedLines.push(`<h4 id="${headingId}">${processedText}</h4>`);
        continue;
      }
      
      // Handle blockquotes
      if (trimmed.startsWith('> ')) {
        flushList();
        const quoteText = processFormattedText(trimmed.substring(2).trim());
        processedLines.push(`<blockquote>${quoteText}</blockquote>`);
        continue;
      }
      
      // Handle unordered lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        const itemText = processFormattedText(trimmed.substring(2).trim());
        listItems.push(itemText);
        continue;
      }
      
      // Handle ordered lists
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        const itemText = processFormattedText(trimmed.replace(/^\d+\.\s/, '').trim());
        listItems.push(itemText);
        continue;
      }
      
      // Handle regular paragraphs
      if (trimmed) {
        flushList();
        const processedText = processFormattedText(trimmed);
        processedLines.push(`<p>${processedText}</p>`);
      }
    }
    
    // Flush any remaining list
    flushList();
    
    return processedLines.join('\n');
  };
  
  // Process inline formatting (bold, italic, code, links)
  const processFormattedText = (text: string): string => {
    return text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links (basic support)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  };
  
  // Debug logging
  console.log('🔍 BlogContentRenderer debug:', {
    hasContent: !!content,
    contentLength: content?.length || 0,
    hasBody: !!body,
    bodyLength: body?.length || 0,
    title
  });
  
  // Try markdown content first
  if (content && typeof content === 'string' && content.trim()) {
    const htmlContent = renderMarkdownContent(content);
    
    return (
      <div className="blog-content">
        <div 
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  }
  
  // Fallback to PortableText
  if (body && Array.isArray(body) && body.length > 0) {
    console.log('✅ Rendering PortableText body');
    return (
      <div className="blog-content">
        <PortableText 
          value={body}
          components={{
            block: {
              h1: ({children}) => <h1>{children}</h1>,
              h2: ({children}) => <h2>{children}</h2>,
              h3: ({children}) => <h3>{children}</h3>,
              h4: ({children}) => <h4>{children}</h4>,
              normal: ({children}) => <p>{children}</p>,
              blockquote: ({children}) => <blockquote>{children}</blockquote>,
            },
            list: {
              bullet: ({children}) => <ul>{children}</ul>,
              number: ({children}) => <ol>{children}</ol>,
            },
            listItem: ({children}) => <li>{children}</li>,
            marks: {
              strong: ({children}) => <strong>{children}</strong>,
              em: ({children}) => <em>{children}</em>,
              code: ({children}) => <code>{children}</code>,
            },
            types: {
              image: ({value}) => (
                <div className="my-8">
                  <img 
                    src={`${value.asset?.url}?w=800&h=600&fit=max`}
                    alt={value.alt || 'Blog image'}
                  />
                  {value.caption && (
                    <p className="text-sm text-gray-600 text-center mt-3 italic">
                      {value.caption}
                    </p>
                  )}
                </div>
              ),
              code: ({value}) => (
                <pre>
                  <code>{value.code}</code>
                </pre>
              ),
            },
          }}
        />
      </div>
    );
  }
  
  // No content available
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="text-gray-500 text-lg font-medium">Content coming soon...</p>
      <p className="text-gray-400 text-sm mt-2">This article is being prepared by our aviation experts.</p>
    </div>
  );
}