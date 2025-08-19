'use client';

import ResponsiveImage from './ResponsiveImage';

interface PhotoImageProps {
  publicId: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function PhotoImage({
  publicId,
  alt,
  className = '',
  priority = false,
}: PhotoImageProps) {
  return (
    <ResponsiveImage
      publicId={publicId}
      alt={alt}
      className={className}
      priority={priority}
      sizes="(max-width: 768px) 100vw, 1200px"
    />
  );
}
