import React from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: any;
}

export default function SafeImage({ src, alt, width, height, className, ...props }: SafeImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
