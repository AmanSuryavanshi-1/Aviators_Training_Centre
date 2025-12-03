'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
    useEffect(() => {
        // Mark when app becomes interactive
        if (typeof window !== 'undefined' && 'performance' in window) {
            performance.mark('app-interactive');
        }
    }, []);

    return null;
}
