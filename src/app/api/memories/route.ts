import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { aggregateIndex } from '@/lib/data';

export const dynamic = 'force-dynamic'; // this route depends on search params
// (no global revalidate; let unstable_cache + headers control caching)

const getCachedMemories = cache(
  async () => {
    const items = await aggregateIndex({ forceFresh: false });
    return items;
  },
  ['memories-index-cache-key'],
  { tags: ['memories-index'], revalidate: 300 }
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t = searchParams.get('t');

  const noStore = {
    'Cache-Control': 'private, no-store',
    // Vercel respects this too; nice belt-and-suspenders:
    'CDN-Cache-Control': 'private, no-store',
  };

  if (t) {
    // "Fresh-read" path used right after create/update redirects (?t=updated_at)
    const items = await aggregateIndex({ forceFresh: true });
    return NextResponse.json(items, { headers: noStore });
  }

  // Fast path via Next Data Cache (tagged). Do NOT cache at the CDN.
  const items = await getCachedMemories();
  return NextResponse.json(items, { headers: noStore });
}
