import crypto from 'crypto';
import { headers } from 'next/headers';

export function emailHash(email: string) {
  return crypto
    .createHash('sha1')
    .update(email.trim().toLowerCase())
    .digest('hex');
}

export function youtubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v')!;
    return '';
  } catch {
    return '';
  }
}

/**
 * Server-side fetch utility that automatically resolves the correct base URL
 * for the current environment (localhost, vercel.app, custom domain, etc.)
 */
export async function serverFetch(path: string, options?: RequestInit): Promise<Response> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  return fetch(`${baseUrl}${path}`, options);
}
