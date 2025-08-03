/**
 * Sanity Studio Route Handler
 * Clean, minimal studio experience
 */

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../studio/sanity.config';

// Suppress React 19 warnings in development only
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('element.ref')) return;
    originalError(...args);
  };
}

export default function StudioPage() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <NextStudio config={config} />
    </div>
  );
}