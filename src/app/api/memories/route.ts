import { readIndex, readMemory } from '@/lib/data';

export const revalidate = 60; // Next's ISR hint

export async function GET() {
  try {
    console.log('Starting /api/memories request');
    const list = await readIndex();
    console.log('Read index, found', list.length, 'memories');

    // Add truncated body text to each memory
    const memoriesWithBody = await Promise.all(
      list.map(async (memory) => {
        try {
          const detail = await readMemory(memory.id);
          const truncatedBody = detail?.body
            ? detail.body.length > 200
              ? detail.body.substring(0, 200).trim() + '...'
              : detail.body
            : '';

          return {
            ...memory,
            body: truncatedBody,
            name: detail?.name || '',
          };
        } catch (error) {
          console.warn(
            `Failed to fetch details for memory ${memory.id}:`,
            error
          );
          return {
            ...memory,
            body: '',
            name: '',
          };
        }
      })
    );

    console.log('Successfully processed', memoriesWithBody.length, 'memories');
    return Response.json(memoriesWithBody, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
