import { readIndex } from '@/lib/data';

export const revalidate = 60; // Next's ISR hint

export async function GET() {
  const list = await readIndex();
  return Response.json(list, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
