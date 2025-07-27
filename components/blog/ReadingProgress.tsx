'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface ReadingProgressProps {
  className?: string;
  variant?: 'top' | 'side' | 'circular';
}

export default function ReadingProgress({ className = '', variant = 'top' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    // Initial calculation
    updateProgress();

    // Add scroll listener with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  if (variant === 'top') {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        <Progress 
          value={progress} 
          className="h-1 rounded-none bg-transparent"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) var(--progress, 0%), transparent var(--progress, 0%))',
            '--progress': `${progress}%`
          } as React.CSSProperties}
        />
      </div>
    );
  }

  if (variant === 'side') {
    return (
      <div className={`fixed left-2 top-1/4 bottom-1/4 w-1 bg-muted rounded-full z-40 hidden lg:block ${className}`}>
        <div 
          className="bg-primary rounded-full transition-all duration-150 ease-out"
          style={{ 
            height: `${progress}%`,
            width: '100%'
          }}
        />
      </div>
    );
  }

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 20; // radius = 20
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="20"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="22"
              cy="22"
              r="20"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}