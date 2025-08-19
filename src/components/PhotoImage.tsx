'use client';

import { useState } from 'react';
import { getHeroImageUrl } from '@/lib/cloudinary';

interface PhotoImageProps {
  publicId: string;
  alt: string;
  className?: string;
  width?: number;
  quality?: number | string;
  dpr?: number;
}

export default function PhotoImage({
  publicId,
  alt,
  className = '',
  width = 1200,
  quality = 80,
  dpr = 1,
}: PhotoImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  console.log('PhotoImage: Component rendered, isLoading:', isLoading);

  const handleLoad = () => {
    console.log('PhotoImage: Image loaded successfully');
    // Remove the artificial delay - cached images should load instantly
    setIsLoading(false);
  };

  const handleError = () => {
    console.log('PhotoImage: Image failed to load');
    setIsLoading(false);
    setHasError(true);
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
        ref={(img) => {
          if (img && img.complete) {
            // Image is already cached and loaded
            console.log('PhotoImage: Image already cached');
            setIsLoading(false);
          }
        }}
        src={getHeroImageUrl(publicId)}
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
