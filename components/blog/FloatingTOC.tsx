'use client';

import React, { useState } from 'react';
import { List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TableOfContents from './TableOfContents';

interface FloatingTOCProps {
  content?: string;
}

export default function FloatingTOC({ content }: FloatingTOCProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating TOC Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-aviation-primary hover:bg-aviation-primary/90 shadow-lg"
          size="sm"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-x-4 top-20 bottom-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Card className="h-full bg-white rounded-xl shadow-xl">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Table of Contents</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <TableOfContents content={content} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}