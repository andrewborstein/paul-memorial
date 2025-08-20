'use client';

import React from 'react';
import { cldUrl } from '@/lib/cloudinary';

interface GridImageProps {
  publicId: string;
  alt: string;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const GRID_WIDTHS = [300, 400, 600, 800];

export default function GridImage({
  publicId,
  alt,
  className = '',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  onLoad,
  onError,
}: GridImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const generateSrcSet = () =>
    GRID_WIDTHS.map((width) => {
      const url = cldUrl(publicId, {
        w: width,
        h: width,
        crop: 'fill',
        q: 'auto:eco',
      });
      return `${url} ${width}w`;
    }).join(', ');

  const defaultSrc = cldUrl(publicId, {
    w: 600,
    h: 600,
    crop: 'fill',
    q: 'auto:eco',
  });

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
        className={`bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg ${className}`}
      >
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
        loading="lazy"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg">
          <span className="text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
}
