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

  // Convert old URLs to better quality - must be before any conditional returns
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
      // If it's an old URL without proper cropping, add it
      if (src.includes('w_144') && !src.includes('c_fill')) {
        return src.replace('w_144', 'w_144,h_144,c_fill');
      }
      // If it's a Cloudinary URL but doesn't have proper square cropping, add it
      if (src.includes('cloudinary.com') && !src.includes('c_fill')) {
        // Add height and crop parameters to make it square
        const baseUrl = src.split('/upload/')[0] + '/upload/';
        const transformations = src.split('/upload/')[1];
        const parts = transformations.split('/');
        const publicId = parts[parts.length - 1];

        // Build new transformations with square cropping
        const newTransformations = `w_${width},h_${width},c_fill,q_auto,dpr_2`;
        return `${baseUrl}${newTransformations}/${publicId}`;
      }
      return src;
    }
    // All thumbnails are square, use fill cropping
    return cldUrl(publicId!, {
      w: width,
      h: width,
      crop: 'fill',
      q: quality,
      dpr,
    });
  }, [src, publicId, width, quality, dpr]);

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
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-500 ${className}`}
      >
        <div className="text-center">
          <div className="text-lg mb-1">📷</div>
          <div className="text-xs">{fallbackText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse z-0`}>
          <div className="w-full h-full bg-gray-300 rounded"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} object-cover relative z-10`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}
