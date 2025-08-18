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
  dpr?: number;
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
  dpr = 2,
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

  // Convert old URLs to better quality
  const imageSrc = React.useMemo(() => {
    if (src) {
      // If it's an old q_60 URL, convert it to q_auto
      if (src.includes('q_60')) {
        return src.replace('q_60', 'q_auto');
      }
      // If it's an old w_96 URL, convert it to w_144 with dpr_2
      if (src.includes('w_96') && src.includes('dpr_auto')) {
        return src.replace('w_96,dpr_auto', 'w_144,dpr_2');
      }
      return src;
    }
    return cldUrl(publicId!, { w: width, q: quality, dpr });
  }, [src, publicId, width, quality, dpr]);

  return (
    <>
      <img
        src={imageSrc}
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
