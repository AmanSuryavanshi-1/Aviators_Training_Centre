'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BulletproofImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const BulletproofImage: React.FC<BulletproofImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/Blogs/Blog_Header.webp',
  priority = false,
  fill = false,
  sizes,
  onError,
  onLoad,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    }
  }, [hasError, imgSrc, fallbackSrc, onError]);

  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  const imageProps = {
    src: imgSrc,
    alt,
    className: cn('transition-opacity duration-300', className),
    onError: handleError,
    onLoad: handleLoad,
    priority,
    ...(fill ? { fill: true } : { width: width || 400, height: height || 300 }),
    ...(sizes && { sizes }),
  };

  return <Image {...imageProps} />;
};

export default BulletproofImage;
