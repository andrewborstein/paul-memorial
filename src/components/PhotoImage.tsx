'use client';

import { useState } from 'react';
import { cldUrl } from '@/lib/cloudinary';

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
  quality = 'auto',
  dpr = 2,
}: PhotoImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
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
        src={cldUrl(publicId, { w: width, q: quality, dpr })}
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
