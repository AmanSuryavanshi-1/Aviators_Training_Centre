import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  initialLoad: number;
  loadMore: number;
}

interface UseLazyLoadReturn<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  loadMore: () => void;
}

export function useLazyLoad<T>(
  allItems: T[],
  options: UseLazyLoadOptions
): UseLazyLoadReturn<T> {
  const { initialLoad, loadMore: loadMoreCount } = options;
  const [visibleCount, setVisibleCount] = useState(initialLoad);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const items = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + loadMoreCount, allItems.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, loadMoreCount, allItems.length]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Reset when allItems change
  useEffect(() => {
    setVisibleCount(initialLoad);
  }, [allItems, initialLoad]);

  return {
    items,
    isLoading,
    hasMore,
    loadMoreRef,
    loadMore
  };
}