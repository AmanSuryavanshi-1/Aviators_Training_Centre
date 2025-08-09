"use client"
import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestimonialsBreadcrumb() {
  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className="bg-muted/30 py-3 border-b"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </li>
          <li>
            <span 
              className="text-foreground font-medium"
              aria-current="page"
            >
              Student Testimonials
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}