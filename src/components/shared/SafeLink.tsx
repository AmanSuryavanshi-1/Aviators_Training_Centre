import React from 'react';
import Link from 'next/link';

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export default function SafeLink({ href, children, className, ...props }: SafeLinkProps) {
  // Check if it's an internal link
  const isInternal = href.startsWith('/') || href.startsWith('#');
  
  if (isInternal) {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }
  
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
