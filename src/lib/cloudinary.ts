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

export function publicIdToUrl(publicId: string, type: string = 'image'): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return '';
  
  return `https://res.cloudinary.com/${cloudName}/${type}/upload/${publicId}`;
}

// New optimized URL builder
export function cldUrl(
  publicId: string,
  opts: { w?: number; h?: number; crop?: string; q?: number } = {}
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const parts = ['f_auto'];
  
  if (opts.q) parts.push(`q_${opts.q}`);
  else parts.push('q_auto');
  
  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  
  return `https://res.cloudinary.com/${cloud}/image/upload/${parts.join(',')}/${publicId}`;
}

// Helper functions for different use cases
export function getThumbnailUrl(publicId: string): string {
  return cldUrl(publicId, { w: 200, q: 60 });
}

export function getSmallThumbnailUrl(publicId: string): string {
  return cldUrl(publicId, { w: 96, q: 50 });
}

export function getFullSizeUrl(publicId: string): string {
  return cldUrl(publicId, { w: 1600, q: 80 });
}
