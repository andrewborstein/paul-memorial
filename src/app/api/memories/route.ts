import { aggregateIndex } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  noStore();
  try {
    const { searchParams } = new URL(req.url);
    const fresh = searchParams.get('fresh') === '1';

    console.log('Starting /api/memories request, fresh:', fresh);
    // Primary list is race-proof and fast
    const list = await aggregateIndex({ forceFresh: fresh });
    console.log('Aggregated index, found', list.length, 'memories');

    const res = Response.json(list);
    res.headers.set(
      'Cache-Control',
      fresh ? 'no-store' : 's-maxage=60, stale-while-revalidate=300'
    );
    return res;
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
