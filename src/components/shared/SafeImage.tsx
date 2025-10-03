import React from 'react';
import EnhancedSafeImage from './EnhancedSafeImage';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: any;
}

// Updated SafeImage to use EnhancedSafeImage for better performance
export default function SafeImage({ src, alt, width, height, className, ...props }: SafeImageProps) {
  return (
    <EnhancedSafeImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      lazyLoad={true}
      priority="medium"
      {...props}
    />
  );
}
