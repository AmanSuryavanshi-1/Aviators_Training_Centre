/**
 * Studio Layout - Clean layout without navbar/footer
 * Provides a dedicated environment for Sanity Studio
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Management Studio | Aviators Training Centre',
  description: 'Sanity Studio for managing aviation training content',
  robots: 'noindex, nofollow', // Don't index the studio
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}