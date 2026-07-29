import { NextResponse } from 'next/server';
import { aggregateIndex } from '@/lib/data';

export const dynamic = 'force-dynamic';

// No caching layer here on purpose. aggregateIndex reads ~40 small JSON files
// off the deployment's local disk, which is cheap, and any cache in front of
// it makes a freshly submitted memory invisible on /memories long after its
// deploy has gone live -- Vercel's Data Cache survives deployments, so the
// stale list outlives the build that would have fixed it.
export async function GET() {
  const items = await aggregateIndex({ forceFresh: true });

  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'private, no-store',
      'CDN-Cache-Control': 'private, no-store',
    },
  });
}
