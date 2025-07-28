'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { List, ChevronRight, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCSection {
  title: string;
  items: TOCItem[];
  isExpanded: boolean;
}

interface TableOfContentsProps {
  content?: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [tocSections, setTocSections] = useState<TOCSection[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Truncate long text
  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    if (!content) return;

    // Extract headings from content
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      items.push({ id, text, level });
    }

    setTocItems(items);
    setIsVisible(items.length > 2);

    // Group items into sections based on H1 and H2 headings
    const sections: TOCSection[] = [];
    let currentSection: TOCSection | null = null;

    items.forEach((item) => {
      if (item.level === 1 || item.level === 2) {
        // Start a new section
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: item.text,
          items: [item],
          isExpanded: sections.length < 3 // Auto-expand first 3 sections
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.items.push(item);
      } else {
        // No section yet, create a default one
        currentSection = {
          title: 'Contents',
          items: [item],
          isExpanded: true
        };
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    setTocSections(sections);
  }, [content]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // Observe all headings
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setTocSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const toggleAllSections = () => {
    const shouldExpand = !showAll;
    setShowAll(shouldExpand);
    setTocSections(prev => prev.map(section => ({ 
      ...section, 
      isExpanded: shouldExpand 
    })));
  };

  if (!isVisible || tocItems.length === 0) {
    return null;
  }

  const displayItems = isCollapsed ? [] : (showAll ? tocItems : tocItems.slice(0, 8));
  const hasMoreItems = tocItems.length > 8;

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl sticky top-24 w-full lg:max-w-none">
      <CardContent className="p-3 lg:p-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <List className="w-4 h-4 text-aviation-primary" />
            Contents
          </h3>
          <div className="flex items-center gap-1">
            {hasMoreItems && !isCollapsed && (
              <button
                onClick={toggleAllSections}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-aviation-primary transition-colors"
                title={showAll ? "Collapse all" : "Expand all"}
              >
                {showAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-aviation-primary transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="max-h-[50vh] lg:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {tocSections.length > 1 ? (
              // Sectioned view for complex content
              <div className="space-y-2">
                {tocSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-l-2 border-gray-100 pl-2">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="flex items-center gap-1 w-full text-left text-xs font-medium text-gray-700 hover:text-aviation-primary transition-colors py-1"
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${section.isExpanded ? 'rotate-90' : ''}`} />
                      <span className="truncate">{truncateText(section.title, 30)}</span>
                      <span className="text-gray-400 ml-auto">({section.items.length})</span>
                    </button>
                    
                    {section.isExpanded && (
                      <div className="ml-4 space-y-1 mt-1">
                        {section.items.map(({ id, text, level }) => (
                          <button
                            key={id}
                            onClick={() => scrollToHeading(id)}
                            className={`
                              block w-full text-left text-xs transition-colors duration-200 py-1 px-2 rounded
                              ${level === 1 ? 'font-medium' : level === 2 ? 'font-normal' : level === 3 ? 'font-normal pl-3' : 'font-normal pl-4'}
                              ${activeId === id 
                                ? 'text-aviation-primary bg-aviation-primary/10 font-medium' 
                                : 'text-gray-600 hover:text-aviation-primary hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-center gap-1">
                              {activeId === id && <ChevronRight className="w-2 h-2 flex-shrink-0" />}
                              <span className="truncate leading-tight" title={text}>
                                {truncateText(text, level === 1 ? 25 : level === 2 ? 30 : 35)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Simple list view for basic content
              <nav className="space-y-1">
                {displayItems.map(({ id, text, level }) => (
                  <button
                    key={id}
                    onClick={() => scrollToHeading(id)}
                    className={`
                      block w-full text-left text-xs transition-colors duration-200 py-1.5 px-2 rounded
                      ${level === 1 ? 'font-medium' : level === 2 ? 'font-normal pl-3' : level === 3 ? 'font-normal pl-4' : 'font-normal pl-5'}
                      ${activeId === id 
                        ? 'text-aviation-primary bg-aviation-primary/10 font-medium' 
                        : 'text-gray-600 hover:text-aviation-primary hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {activeId === id && <ChevronRight className="w-2 h-2 flex-shrink-0" />}
                      <span className="truncate leading-tight" title={text}>
                        {truncateText(text, level === 1 ? 25 : level === 2 ? 30 : 35)}
                      </span>
                    </div>
                  </button>
                ))}
                
                {hasMoreItems && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full text-left text-xs text-aviation-primary hover:text-aviation-secondary py-1 px-2 font-medium"
                  >
                    + {tocItems.length - 8} more items
                  </button>
                )}
              </nav>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}