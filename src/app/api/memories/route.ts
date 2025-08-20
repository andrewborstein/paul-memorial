import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { aggregateIndex } from '@/lib/data';

// Allow static/edge caching for GET
export const dynamic = 'force-static';
export const revalidate = 300; // safety window (5 min)

// Wrap your expensive aggregation in Next's cache and tag it
const getCachedMemories = cache(
  async () => {
    const items = await aggregateIndex({ forceFresh: false });
    return items;
  },
  ['memories-index-cache-key'],
  { tags: ['memories-index'], revalidate: 300 }
);

export async function GET() {
  const items = await getCachedMemories();
  return NextResponse.json(items, {
    headers: {
      // CDN (edge) cache for 5 min, then serve stale while revalidating
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  });
}
