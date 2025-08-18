'use client';

import React from 'react';
import { cldUrl } from '@/lib/cloudinary';

interface ImageWithFallbackProps {
  publicId?: string;
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  quality?: number | string;
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ImageWithFallback({
  publicId,
  src,
  alt,
  className = '',
  width = 400,
  quality = 70,
  fallbackText = 'Loading...',
  onLoad,
  onError,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

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
      <div className={`bg-gray-100 flex items-center justify-center text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-lg mb-1">📷</div>
          <div className="text-xs">{fallbackText}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <img
        src={src || cldUrl(publicId!, { w: width, q: quality, dpr: 'auto' })}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}>
          <div className="w-full h-full bg-gray-300 rounded"></div>
        </div>
      )}
    </>
  );
}
