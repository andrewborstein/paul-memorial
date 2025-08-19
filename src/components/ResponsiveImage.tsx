'use client';

import React from 'react';
import { cldUrl } from '@/lib/cloudinary';

interface ResponsiveImageProps {
  publicId: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Standard responsive breakpoints
const WIDTHS = [400, 600, 800, 1200, 1600];

export default function ResponsiveImage({
  publicId,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, 1200px',
  priority = false,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const generateSrcSet = () => {
    return WIDTHS.map(width => {
      const url = cldUrl(publicId, { 
        w: width, 
        q: 'auto', 
        dpr: 'auto' 
      });
      return `${url} ${width}w`;
    }).join(', ');
  };

  const defaultSrc = cldUrl(publicId, { w: 1200, q: 'auto', dpr: 'auto' });

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-lg mb-1">📷</div>
          <div className="text-xs">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={defaultSrc}
        srcSet={generateSrcSet()}
        sizes={sizes}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority && { fetchPriority: 'high' as const })}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg">
          <span className="text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
}
