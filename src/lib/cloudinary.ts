// src/lib/cloudinary.ts
import type { ImageLoader } from 'next/image';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const UPLOAD = '/upload/';

// ---------- internal helpers ----------
function isCloudinaryUrl(url: string) {
  return /\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url);
}

function parseCloudinaryPath(afterUpload: string) {
  // Handles:
  //  - "v1755704386/memorial/foo.jpg"
  //  - "w_1600,q_auto/v1755704386/memorial/foo.jpg"
  //  - "t_name/memorial/foo.jpg"
  const parts = afterUpload.split('/');
  let i = 0;

  // Skip transform segment if present
  if (
    parts[i]?.includes(',') ||
    /^t_/.test(parts[i] ?? '') ||
    /^(?:c_|w_|q_|f_|dpr_|g_)/.test(parts[i] ?? '')
  ) {
    i += 1;
  }

  // Optional version segment
  let version: string | undefined;
  if (/^v\d+$/.test(parts[i] ?? '')) {
    version = parts[i];
    i += 1;
  }

  const publicId = parts.slice(i).join('/');
  return { version, publicId };
}

function normalizeQualityToken(
  q: unknown,
  fallback: 'auto' | `${number}` | 'auto:eco' = 'auto'
): string {
  // If numeric and finite -> use that number
  if (typeof q === 'number' && Number.isFinite(q)) return String(q);
  // If explicitly 'auto' or 'auto:...' -> keep it
  if (typeof q === 'string' && /^auto(?::[\w-]+)?$/.test(q)) return q;
  // Otherwise use fallback (default 'auto')
  return fallback;
}

// ---------- public utils ----------
export function optimizeImageUrl(
  url: string,
  width: number = 400,
  quality: number = 70
): string {
  if (!CLOUD || !isCloudinaryUrl(url)) return url;

  const idx = url.indexOf(UPLOAD);
  if (idx === -1) return url;

  const after = url.slice(idx + UPLOAD.length);
  const { version, publicId } = parseCloudinaryPath(after);

  const v = version ? `${version}/` : '';
  // Keep numeric here; this utility is for simple rewrites
  return `${BASE}/${v}f_auto,q_${quality},w_${width}/${publicId}`;
}

export function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
}

export function publicIdToUrl(
  publicId: string,
  type: string = 'image',
  version?: string | number
): string {
  if (!CLOUD) return '';
  const v = version !== undefined ? `v${String(version)}/` : '';
  return `https://res.cloudinary.com/${CLOUD}/${type}/upload/${v}${publicId}`;
}

export function cldUrl(
  publicId: string,
  opts: {
    w?: number;
    h?: number;
    crop?: string;
    q?: number | string;
    version?: string | number;
    gravity?: string;
  } = {}
): string {
  const parts = ['f_auto', `q_${normalizeQualityToken(opts.q, 'auto')}`];

  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  else if (opts.crop === 'fill') parts.push('g_auto');

  const transform = parts.join(',');
  const v = opts.version !== undefined ? `v${String(opts.version)}/` : '';

  return `${BASE}/${v}${transform}/${publicId}`;
}

export function getThumbnailUrl(publicId: string, version?: string | number) {
  return cldUrl(publicId, {
    w: 200,
    h: 200,
    crop: 'fill',
    q: 'auto:eco',
    version,
  });
}

export function getSmallThumbnailUrl(
  publicId: string,
  version?: string | number
) {
  return cldUrl(publicId, {
    w: 144,
    h: 144,
    crop: 'fill',
    q: 'auto:eco',
    version,
  });
}

export function getGridImageUrl(publicId: string, version?: string | number) {
  return cldUrl(publicId, {
    w: 600,
    h: 600,
    crop: 'fill',
    q: 'auto:eco',
    version,
  });
}

export function getHeroImageUrl(publicId: string, version?: string | number) {
  return cldUrl(publicId, {
    w: 912,
    q: 'auto',
    version,
  });
}

export function getPosterizedHeroImageUrl(
  publicId: string,
  version?: string | number
) {
  const parts = ['f_auto', 'q_auto', 'w_1200', 'e_posterize:4'];
  const transform = parts.join(',');
  const v = version !== undefined ? `v${String(version)}/` : '';

  return `${BASE}/${v}${transform}/${publicId}`;
}

export function getFullSizeUrl(publicId: string, version?: string | number) {
  return cldUrl(publicId, {
    w: 1600,
    q: 'auto',
    version,
  });
}

export const EAGER_TRANSFORMS = [
  {
    width: 144,
    height: 144,
    crop: 'fill',
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto:eco',
  },
  {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto:eco',
  },
  { width: 600, fetch_format: 'auto', quality: 'auto' },
  { width: 1200, fetch_format: 'auto', quality: 'auto' },
  { width: 1600, fetch_format: 'auto', quality: 'auto' },
];

export async function warmUpImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await fetch(url, { method: 'GET', cache: 'no-store' });
      } catch {
        // ignore
      }
    })
  );
}

// ---------- Next.js loader (preserves crop/height from explicit URLs) ----------
export const cloudinarySquareLoader: ImageLoader = ({
  src,
  width,
  quality,
}) => {
  const qToken = normalizeQualityToken(quality, 'auto:eco');

  if (src.startsWith('http')) {
    if (!isCloudinaryUrl(src)) return src;
    const idx = src.indexOf(UPLOAD);
    if (idx === -1) return src;

    const after = src.slice(idx + UPLOAD.length);
    const { version, publicId } = parseCloudinaryPath(after);
    const v = version ? `${version}/` : '';
    return `${BASE}/${v}f_auto,q_${qToken},w_${width},h_${width},c_fill,g_auto/${publicId}`;
  }

  // Treat as publicId
  return `${BASE}/f_auto,q_${qToken},w_${width},h_${width},c_fill,g_auto/${src}`;
};
