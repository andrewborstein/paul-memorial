'use client';

import Image from 'next/image';
import { cloudinaryLoader } from '@/lib/cloudinary';

export default function PhotoImage({
  publicId,
  alt,
  className,
  priority = false,
}: {
  publicId: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      loader={cloudinaryLoader}
      src={publicId}
      alt={alt}
      // Large display; Next will emit a responsive srcset for these widths
      width={1600}
      height={1200}
      className={className}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
    />
  );
}
