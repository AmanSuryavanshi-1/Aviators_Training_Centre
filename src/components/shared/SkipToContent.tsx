"use client";

import React from 'react';
import { cn } from '@/components/ui/utils';

/**
 * SkipToContent component provides keyboard users with a way to bypass navigation
 * and jump directly to the main content area. This is a WCAG 2.1 Level A requirement.
 * 
 * The link is visually hidden by default but becomes visible when focused,
 * ensuring keyboard users can easily navigate to the main content.
 */
export default function SkipToContent() {
    return (
        <a
            href="#main-content"
            className={cn(
                // Position absolutely at top-left
                "absolute top-0 left-0 z-[9999]",
                // Hidden by default - positioned off-screen
                "-translate-y-full",
                // Visible when focused
                "focus:translate-y-0",
                // Styling
                "bg-aviation-primary dark:bg-teal-600",
                "text-white font-semibold",
                "px-6 py-3 rounded-br-lg",
                "shadow-lg",
                // Transitions
                "transition-transform duration-200 ease-out",
                // Focus styles
                "focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-offset-2"
            )}
            tabIndex={0}
        >
            Skip to main content
        </a>
    );
}
