/**
 * Navigation Breadcrumbs Component
 * Shows current location and provides navigation context
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Settings, FileText } from 'lucide-react';
import { useNavigationBreadcrumbs } from '@/hooks/useNavigationContext';
import { cn } from '@/lib/utils';

interface NavigationBreadcrumbsProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

export function NavigationBreadcrumbs({
  className,
  showHome = true,
  maxItems = 5,
}: NavigationBreadcrumbsProps) {
  const breadcrumbs = useNavigationBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  // Add home breadcrumb if requested
  const allBreadcrumbs = showHome
    ? [
        {
          label: 'Home',
          href: '/',
          active: false,
          icon: Home,
        },
        ...breadcrumbs.map(crumb => ({
          ...crumb,
          icon: getIconForBreadcrumb(crumb.label),
        })),
      ]
    : breadcrumbs.map(crumb => ({
        ...crumb,
        icon: getIconForBreadcrumb(crumb.label),
      }));

  // Limit number of breadcrumbs if specified
  const displayBreadcrumbs = maxItems
    ? allBreadcrumbs.slice(-maxItems)
    : allBreadcrumbs;

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-gray-600',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {displayBreadcrumbs.map((crumb, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const Icon = crumb.icon;

          return (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
              
              {isLast || crumb.active ? (
                <span
                  className={cn(
                    'flex items-center gap-1.5 font-medium',
                    crumb.active
                      ? 'text-blue-600'
                      : 'text-gray-900'
                  )}
                  aria-current={crumb.active ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to get appropriate icon for breadcrumb
function getIconForBreadcrumb(label: string) {
  switch (label.toLowerCase()) {
    case 'admin dashboard':
    case 'admin':
      return Settings;
    case 'posts':
    case 'blog posts':
      return FileText;
    case 'sanity studio':
    case 'studio':
      return Settings;
    default:
      return undefined;
  }
}

// Compact version for mobile
export function CompactNavigationBreadcrumbs({
  className,
}: {
  className?: string;
}) {
  const breadcrumbs = useNavigationBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const parentPage = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <nav
      className={cn('flex items-center text-sm', className)}
      aria-label="Breadcrumb"
    >
      {parentPage && (
        <>
          <Link
            href={parentPage.href}
            className="text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[120px]"
          >
            {parentPage.label}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
        </>
      )}
      <span className="font-medium text-gray-900 truncate">
        {currentPage.label}
      </span>
    </nav>
  );
}

export default NavigationBreadcrumbs;