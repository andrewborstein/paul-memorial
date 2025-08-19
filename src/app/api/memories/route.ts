import { aggregateIndex } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  noStore();
  try {
    console.log('Starting /api/memories request');
    // Primary list is race-proof and fast
    const list = await aggregateIndex({ forceFresh: true });
    console.log('Aggregated index, found', list.length, 'memories');

    const res = Response.json(list);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
