'use client';

import React from 'react';

interface ContentErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ContentErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ContentErrorBoundary extends React.Component<ContentErrorBoundaryProps, ContentErrorBoundaryState> {
  constructor(props: ContentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ContentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Content rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ContentErrorBoundary;