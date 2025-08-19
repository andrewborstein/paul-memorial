// Cloudinary utility functions
export function optimizeImageUrl(
  url: string,
  width: number = 400,
  quality: number = 70
): string {
  if (!url.includes('cloudinary.com')) return url;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return url;

  // Extract public ID from URL
  const publicId = url.split('/').slice(-1)[0].split('.')[0];
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality},w_${width}/${publicId}`;
}

export function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
}

export function publicIdToUrl(
  publicId: string,
  type: string = 'image'
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return '';

  return `https://res.cloudinary.com/${cloudName}/${type}/upload/${publicId}`;
}

// Enhanced URL builder with versioning and optimized transforms
export function cldUrl(
  publicId: string,
  opts: { 
    w?: number; 
    h?: number; 
    crop?: string; 
    q?: number | string; 
    dpr?: string | number;
    version?: string;
    gravity?: string;
  } = {}
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const parts = ['f_auto'];

  // Quality - use eco for grids, auto for hero images
  if (opts.q) parts.push(`q_${opts.q}`);
  else parts.push('q_auto');

  // Dimensions and cropping
  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  else if (opts.crop === 'fill') parts.push('g_auto'); // Auto gravity for fill crops

  // DPR for high-DPI displays
  if (opts.dpr) parts.push(`dpr_${opts.dpr}`);

  const transformString = parts.join(',');
  const versionPath = opts.version ? `v${opts.version}/` : '';
  
  return `https://res.cloudinary.com/${cloud}/image/upload/${versionPath}${transformString}/${publicId}`;
}

// Optimized helper functions for different use cases
export function getThumbnailUrl(publicId: string, version?: string): string {
  return cldUrl(publicId, { 
    w: 200, 
    h: 200, 
    crop: 'fill', 
    q: 'auto:eco', 
    dpr: 2,
    version 
  });
}

export function getSmallThumbnailUrl(publicId: string, version?: string): string {
  return cldUrl(publicId, { 
    w: 144, 
    h: 144, 
    crop: 'fill', 
    q: 'auto:eco', 
    dpr: 2,
    version 
  });
}

export function getGridImageUrl(publicId: string, version?: string): string {
  return cldUrl(publicId, { 
    w: 600, 
    h: 600, 
    crop: 'fill', 
    q: 'auto:eco', 
    dpr: 'auto',
    version 
  });
}

export function getHeroImageUrl(publicId: string, version?: string): string {
  return cldUrl(publicId, { 
    w: 1200, 
    q: 'auto', 
    dpr: 'auto',
    version 
  });
}

export function getFullSizeUrl(publicId: string, version?: string): string {
  return cldUrl(publicId, { 
    w: 1600, 
    q: 'auto', 
    dpr: 'auto',
    version 
  });
}

// Eager transform configuration for uploads
export const EAGER_TRANSFORMS = [
  { width: 400, height: 400, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto:eco' },
  { width: 800, height: 800, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto:eco' },
  { width: 1200, fetch_format: 'auto', quality: 'auto' },
  { width: 1600, fetch_format: 'auto', quality: 'auto' }
];

// Warm-up function for preloading images
export function warmUpImages(urls: string[]): void {
  urls.forEach(url => {
    fetch(url, { method: 'HEAD' }).catch(() => {
      // Silently fail - this is just for warming up caches
    });
  });
}
