"use client";

import dynamic from 'next/dynamic';

// Lazy load the heavy HomePageClient after hydration
// This keeps the initial JS bundle small for fast LCP
const HomePageClient = dynamic(
    () => import('./HomePageClient'),
    { ssr: false }
);

export default function HomePageClientWrapper() {
    return <HomePageClient />;
}
