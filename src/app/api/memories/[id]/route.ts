import type { MemoryDetail } from '@/types/memory';
import { readMemory } from '@/lib/data';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const fresh = searchParams.get('fresh') === '1';

    console.log('Attempting to fetch memory:', id, 'fresh:', fresh);

    const doc = await readMemory(id, { forceFresh: fresh });
    if (!doc) {
      console.log('Memory not found:', id);
      return new Response('Not found', { status: 404 });
    }

    console.log('Successfully fetched memory:', id);
    const response = Response.json(doc);
    response.headers.set(
      'Cache-Control',
      fresh ? 'no-store' : 's-maxage=60, stale-while-revalidate=300'
    );
    return response;
  } catch (error) {
    console.error('Error fetching memory:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
