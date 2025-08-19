import { readIndex, readMemory } from '@/lib/data';

export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('Starting /api/memories request');
    const list = await readIndex();
    console.log('Read index, found', list.length, 'memories');

    // Add truncated body text to each memory and filter out deleted ones
    const memoriesWithBody = await Promise.all(
      list.map(async (memory) => {
        try {
          const detail = await readMemory(memory.id);
          if (!detail) {
            console.warn(`Memory ${memory.id} not found, skipping`);
            return null;
          }

          const truncatedBody = detail?.body
            ? detail.body.length > 200
              ? detail.body.substring(0, 200).trim() + '...'
              : detail.body
            : '';

          return {
            ...memory,
            body: truncatedBody,
            name: detail?.name || '',
            email: detail?.email || '',
          };
        } catch (error) {
          console.warn(
            `Failed to fetch details for memory ${memory.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out null values (deleted memories)
    const validMemories = memoriesWithBody.filter(Boolean);

    console.log('Successfully processed', validMemories.length, 'memories');

    // Add cache-busting headers
    const response = Response.json(validMemories);
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-cache');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
