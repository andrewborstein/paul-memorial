import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { aggregateIndex } from '@/lib/data';

export const dynamic = 'force-static';
export const revalidate = 300;

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

  if (t) {
    // “Fresh-read” path used right after create/update redirects (?t=updated_at)
    const items = await aggregateIndex({ forceFresh: true });
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Fast, edge-cached path
  const items = await getCachedMemories();
  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  });
}
