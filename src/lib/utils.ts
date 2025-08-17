import crypto from 'crypto';

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
