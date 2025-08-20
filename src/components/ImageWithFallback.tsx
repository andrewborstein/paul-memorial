'use client';

import React from 'react';
import Image from 'next/image';
import { cloudinaryLoader } from '@/lib/cloudinary';
import { getSmallThumbnailUrl } from '@/lib/cloudinary';

interface ImageWithFallbackProps {
  publicId?: string;
  src?: string; // Can be full Cloudinary URL or any remote URL
  alt: string;
  className?: string;
  width?: number; // Acts as a hint (for explicit width images)
  quality?: number | string;
  dpr?: number; // Ignored intentionally; Next handles DPR via srcset
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Optional: pass sizes to control which srcset candidates are chosen */
  sizes?: string;
  /** Optional: preload critical images */
  priority?: boolean;
  /** If you want to force a square crop for tiny thumbs (like your old logic) */
  squareThumbFallback?: boolean;
}

export default function ImageWithFallback({
  publicId,
  src,
  alt,
  className = '',
  width = 400,
  quality = 70,
  // dpr ignored on purpose
  fallbackText = 'Loading...',
  onLoad,
  onError,
  sizes = '(max-width: 1024px) 100vw, 1024px',
  priority = false,
  squareThumbFallback = false,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Derive a usable src: prefer explicit src, else build tiny square thumb from publicId
  const effectiveSrc = React.useMemo(() => {
    if (src) return src;
    if (publicId) {
      if (squareThumbFallback) {
        // Small square thumb; good for avatars/lists
        return getSmallThumbnailUrl(publicId); // keep your existing helper
      }
      return publicId; // let loader build full URL
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

  // Error state: keep your visual fallback
  if (hasError || !effectiveSrc) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">{fallbackText}</span>
      </div>
    );
  }

  /**
   * Layout strategy:
   * - If parent supplies an explicit size via CSS (common Tailwind: relative + set height),
   *   we use `fill` with object-cover.
   * - Otherwise we pass width/height so Next can reserve layout space.
   *
   * You already wrap with a container; we keep that pattern and preserve skeleton.
   */
  const useFill = /(^|\s)(relative|aspect-\w+)/.test(className);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
      )}

      <Image
        // Cloudinary-aware loader: normalizes transforms to f_auto,q_auto,w_{width}
        loader={cloudinaryLoader}
        src={effectiveSrc}
        alt={alt}
        // When using fill, parent must be positioned; we keep your className on the Image itself
        fill={useFill || undefined}
        width={!useFill ? width : undefined}
        // Rough aspect ratio fallback if explicit width used; tweak as needed
        height={!useFill ? Math.round((width / 4) * 3) : undefined}
        quality={typeof quality === 'string' ? parseInt(quality, 10) : quality}
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
