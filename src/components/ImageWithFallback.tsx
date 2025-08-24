'use client';

import React from 'react';
import Image from 'next/image';
import { getSmallThumbnailUrl } from '@/lib/cloudinary';

interface ImageWithFallbackProps {
  publicId?: string;
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  quality?: number | string;
  dpr?: number; // ignored
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  priority?: boolean;
  squareThumbFallback?: boolean;
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
  sizes = '(max-width: 1024px) 100vw, 1024px',
  priority = false,
  squareThumbFallback = false,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const effectiveSrc = React.useMemo(() => {
    if (src) return src;
    if (publicId) {
      if (squareThumbFallback) return getSmallThumbnailUrl(publicId);
      return publicId;
    }
    return '';
  }, [src, publicId, squareThumbFallback]);

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

  if (hasError || !effectiveSrc) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">{fallbackText}</span>
      </div>
    );
  }

  const useFill = /(^|\s)(relative|aspect-\w+)/.test(className);

  // Only pass numeric, finite quality to <Image>; otherwise omit it.
  const qualityProp =
    typeof quality === 'number' && Number.isFinite(quality)
      ? quality
      : undefined;

  // Inside ImageWithFallback's return:
  if (squareThumbFallback && publicId) {
    const squareUrl = getSmallThumbnailUrl(publicId); // includes c_fill,h_144
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
        )}
        <img
          src={squareUrl}
          alt={alt}
          className={`${className} object-cover relative z-10`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
      )}

      <Image
        src={effectiveSrc}
        alt={alt}
        fill={useFill || undefined}
        width={!useFill ? width : undefined}
        height={!useFill ? Math.round((width / 4) * 3) : undefined}
        quality={qualityProp}
        className={`${className} object-cover relative z-10`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
}
