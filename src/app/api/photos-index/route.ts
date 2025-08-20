import { NextResponse } from 'next/server';
import pLimit from 'p-limit';
import { aggregateIndex, readMemory } from '@/lib/data';

// Cache this API at the edge; rebuild periodically
export const dynamic = 'force-static';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const index = await aggregateIndex({ forceFresh: false });
    const withPhotos = index.filter((m: any) => (m.photo_count ?? 0) > 0);

    // Bound concurrency for detail reads so we don’t spike cold starts
    const limit = pLimit(8);
    const details = await Promise.all(
      withPhotos.map((m: any) =>
        limit(() => readMemory(m.id, { forceFresh: false }))
      )
    );

    const photos: Array<{
      public_id: string;
      memoryId: string;
      memoryTitle: string;
    }> = [];
    for (const d of details) {
      if (!d?.photos?.length) continue;
      const title = d.title || d.name || '';
      for (const p of d.photos) {
        photos.push({
          public_id: p.public_id,
          memoryId: d.id,
          memoryTitle: title,
        });
      }
    }

    const res = NextResponse.json({ count: photos.length, photos });
    res.headers.set(
      'Cache-Control',
      's-maxage=300, stale-while-revalidate=86400'
    );
    return res;
  } catch (e) {
    console.error('Photos API Error:', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
