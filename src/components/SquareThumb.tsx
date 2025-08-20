'use client';

import React from 'react';
import Image from 'next/image';
import { cloudinarySquareLoader } from '@/lib/cloudinary';

type Props = {
  publicId: string;
  alt: string;
  /** Applied to the OUTER wrapper (so you can pass rounded/hover/etc). */
  className?: string;
  /** Adjust to your grid; defaults match your earlier usage. */
  sizes?: string;
  /** If true, eager-load (rare for grids). */
  priority?: boolean;
};

export default function SquareThumb({
  publicId,
  alt,
  className = '',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  priority = false,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // If it errors, we just leave the skeleton showing—same “CSS approach” as your other component.
  const showSkeleton = isLoading || hasError;

  return (
    <div className={`relative aspect-square ${className}`}>
      {showSkeleton && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
      )}

      <Image
        loader={cloudinarySquareLoader}
        src={publicId}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover relative z-10"
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
