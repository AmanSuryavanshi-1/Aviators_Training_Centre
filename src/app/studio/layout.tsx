/**
 * Studio Layout - Clean layout without navbar/footer
 * Provides a dedicated environment for Sanity Studio
 */

import { Metadata } from 'next';
import './studio.css';

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
  return (
    <div className="studio-layout">
      {/* Return to Website Button */}
      <div className="fixed top-4 right-4 z-50">
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-lg"
          title="Return to Website"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Website
        </a>
      </div>
      
      {/* Studio Content */}
      <div className="studio-content">
        {children}
      </div>
      
      {/* Optional: Small footer with branding */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
          ✈️ ATC Studio
        </div>
      </div>
    </div>
  );
}