import type { MemoryDetail } from '@/types/memory';

import { readBlobJson } from '@/lib/data';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const fresh = new URL(req.url).searchParams.get('fresh') === '1';
  // First fetch once (no cb) to read date
  const doc = await readBlobJson<MemoryDetail>(`memories/${params.id}.json`);
  if (!doc) return new Response('Not found', { status: 404 });

  // If fresh, refetch once with deterministic cb=date
  const finalDoc =
    fresh && doc.date
      ? await readBlobJson<MemoryDetail>(`memories/${params.id}.json`, {
          cb: doc.date,
        })
      : doc;

  const res = Response.json(finalDoc);
  res.headers.set(
    'Cache-Control',
    fresh ? 'no-store' : 's-maxage=60, stale-while-revalidate=300'
  );
  return res;
}
