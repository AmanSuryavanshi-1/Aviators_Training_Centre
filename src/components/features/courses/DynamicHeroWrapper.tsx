"use client";

import dynamic from 'next/dynamic';
import { StaticHero } from './StaticHero';

// Dynamically import HeroSection with ssr: false
// This ensures the heavy interactive component is only loaded on the client
// while the server sends the lightweight StaticHero loading state (handled by the parent or this wrapper's loading/fallback if needed, 
// but here pure client rendering of the carousel is the goal)
// Actually, for dynamic() with loading to work effectively as a replacement during hydration,
// we rely on the client-side swap.
const HeroSection = dynamic(() => import('./HeroSection'), {
    loading: () => <StaticHero />,
    ssr: false,
});

export default function DynamicHeroWrapper() {
    return <HeroSection />;
}
